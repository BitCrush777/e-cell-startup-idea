/// <reference types="@cloudflare/workers-types" />
import { RoomDurableObject } from './durable-object/Room';

export { RoomDurableObject };

export interface Env {
  ROOMS: DurableObjectNamespace;
  DB: D1Database;
  APP_URL?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateSecureCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += ROOM_CODE_ALPHABET[bytes[i] % ROOM_CODE_ALPHABET.length];
    part2 += ROOM_CODE_ALPHABET[bytes[i + 4] % ROOM_CODE_ALPHABET.length];
  }
  return `${part1}-${part2}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const origin = env.APP_URL || url.origin;

    try {
      // 1. Create Room (POST /api/rooms or POST /rooms)
      if ((path === '/api/rooms' || path === '/rooms') && request.method === 'POST') {
        const body: any = await request.json();
        const durationMinutes = Number(body.durationMinutes || body.duration) || 15;
        const creatorName = body.creatorName || 'Anonymous';
        const creatorParticipantId = body.creatorParticipantId || 'p_' + crypto.randomUUID().substring(0, 8);
        const passwordProtected = Boolean(body.passwordProtected || body.requirePassword);
        const password = body.password || '';

        // Collision Protection: retry up to 5 times to ensure guaranteed uniqueness
        let roomCode = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
          attempts++;
          const candidateCode = generateSecureCode();

          // Check if candidate code exists in D1 database
          if (env.DB) {
            try {
              const existing = await env.DB.prepare(
                `SELECT id, status, expires_at FROM rooms WHERE room_code = ?`
              )
                .bind(candidateCode)
                .first();

              if (!existing) {
                roomCode = candidateCode;
                isUnique = true;
              } else if (existing.status === 'expired' || existing.status === 'ended' || (existing.expires_at as number) < Date.now()) {
                // If previous room expired, safe to reuse in future, but prefer unused
                roomCode = candidateCode;
                isUnique = true;
              }
            } catch {
              roomCode = candidateCode;
              isUnique = true;
            }
          } else {
            roomCode = candidateCode;
            isUnique = true;
          }
        }

        if (!roomCode) {
          roomCode = generateSecureCode();
        }

        const internalRoomId = 'room_' + crypto.randomUUID().replace(/-/g, '');
        const joinUrl = `${origin}/join/${roomCode}`;

        // Get or Create Durable Object by roomCode
        const id = env.ROOMS.idFromName(roomCode);
        const stub = env.ROOMS.get(id);

        const initRes = await stub.fetch('http://do/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: internalRoomId,
            roomId: internalRoomId,
            roomCode,
            joinUrl,
            durationMinutes,
            creatorParticipantId,
            creatorName,
            passwordProtected,
            passwordHash: passwordProtected ? password : undefined,
            allowFiles: body.allowFiles !== false && body.allowFileSharing !== false,
            notifyExpiration: body.notifyExpiration !== false,
          }),
        });

        const initData: any = await initRes.json();
        const createdRoom = initData.room;
        createdRoom.joinUrl = joinUrl;

        // Record metadata in D1
        if (env.DB) {
          try {
            await env.DB.prepare(
              `INSERT INTO rooms (id, room_code, created_at, expires_at, duration_minutes, participant_limit, status, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                internalRoomId,
                roomCode,
                createdRoom.createdAt,
                createdRoom.expiresAt,
                durationMinutes,
                2,
                'waiting',
                creatorParticipantId
              )
              .run();
          } catch (e) {
            console.error('D1 metadata log error:', e);
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ROOM CREATED] roomCode=${roomCode}, joinUrl=${joinUrl}`);
        }

        return new Response(JSON.stringify({
          success: true,
          roomId: internalRoomId,
          roomCode,
          joinUrl,
          expiresAt: createdRoom.expiresAt,
          createdAt: createdRoom.createdAt,
          room: createdRoom,
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      // 2. Room Specific Routes (/api/rooms/:code/* or /rooms/:code/*)
      const roomMatch = path.match(/^\/(?:api\/)?rooms\/([A-Za-z0-9-]+)(\/.*)?$/);
      if (roomMatch) {
        const roomCode = roomMatch[1].toUpperCase();
        const subPath = roomMatch[2] || '';

        const id = env.ROOMS.idFromName(roomCode);
        const stub = env.ROOMS.get(id);

        // WebSocket Upgrade: /api/rooms/:code/ws
        if (subPath === '/ws' || request.headers.get('Upgrade') === 'websocket') {
          return stub.fetch(request);
        }

        // Join: POST /api/rooms/:code/join or POST /api/rooms/:code
        if (subPath === '/join' || (subPath === '' && request.method === 'POST')) {
          const body: any = await request.json();
          if (body.action === 'end') {
            const endRes = await stub.fetch('http://do/end', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            const endData = await endRes.json();
            return new Response(JSON.stringify(endData), {
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }

          const joinRes = await stub.fetch('http://do/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const joinData = await joinRes.json();
          return new Response(JSON.stringify(joinData), {
            status: joinRes.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // Messages: POST /api/rooms/:code/messages
        if (subPath === '/messages' && request.method === 'POST') {
          const msgRes = await stub.fetch('http://do/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: await request.text(),
          });
          const msgData = await msgRes.json();
          return new Response(JSON.stringify(msgData), {
            status: msgRes.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // Get Room State: GET /api/rooms/:code
        if (subPath === '' && request.method === 'GET') {
          const stateRes = await stub.fetch('http://do/state', { method: 'GET' });
          const stateData = await stateRes.json();
          return new Response(JSON.stringify(stateData), {
            status: stateRes.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Worker server error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
