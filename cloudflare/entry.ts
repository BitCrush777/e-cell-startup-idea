// @ts-ignore
import openNextHandler from '../.open-next/worker.js';
import { RoomDurableObject } from './durable-object/Room';

export { RoomDurableObject };

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const ROOM_LIMITS = {
  FREE: 3,
  PRO: 10,
  BUSINESS: 25,
} as const;

function getMaxMembersForPlan(plan?: string | null): number {
  const p = (plan || 'FREE').toUpperCase();
  if (p === 'PRO') return ROOM_LIMITS.PRO;
  if (p === 'BUSINESS') return ROOM_LIMITS.BUSINESS;
  return ROOM_LIMITS.FREE;
}

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
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.APP_URL || (url.protocol + '//' + url.host);

    // 0. Static Asset Fast-Path serving via Cloudflare Workers Assets (solves CSS loading)
    if (
      env.ASSETS &&
      (url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname === '/favicon.ico' ||
        url.pathname === '/manifest.webmanifest' ||
        url.pathname === '/sw.js' ||
        url.pathname === '/offline.html')
    ) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status < 400) {
          return assetRes;
        }
      } catch {}
    }

    // 1. WebSocket Upgrade and Real-Time Durable Object channels (/api/rooms/:code/ws or Upgrade: websocket)
    if (
      request.headers.get('Upgrade') === 'websocket' ||
      url.pathname.endsWith('/ws') ||
      url.pathname.includes('/ws?')
    ) {
      const roomMatch = url.pathname.match(/\/(?:api\/)?rooms\/([A-Za-z0-9-]+)/i);
      if (roomMatch && env.ROOMS) {
        const roomCode = roomMatch[1].toUpperCase().trim();
        const id = env.ROOMS.idFromName(roomCode);
        const stub = env.ROOMS.get(id);
        return stub.fetch(request);
      }
    }

    // 2. Authoritative Room Creation via Durable Objects (POST /api/rooms)
    if (
      request.method === 'POST' &&
      (url.pathname === '/api/rooms' || url.pathname === '/rooms') &&
      env.ROOMS
    ) {
      try {
        const body: any = await request.clone().json();
        const durationMinutes = Number(body.durationMinutes || body.duration) || 15;
        const creatorName = body.creatorName || 'Creator';
        const creatorParticipantId =
          body.creatorParticipantId || 'p_' + crypto.randomUUID().substring(0, 8);
        const passwordProtected = Boolean(body.passwordProtected || body.requirePassword);
        const password = body.password || '';
        const roomCode = generateSecureCode();
        const internalRoomId = 'room_' + crypto.randomUUID().replace(/-/g, '');
        const joinUrl = `${origin}/join/${roomCode}`;
        const plan = (body.plan || 'FREE').toUpperCase();
        const maxMembers = body.maxMembers || body.maxParticipants || getMaxMembersForPlan(plan);

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
            plan,
            maxMembers,
            maxParticipants: maxMembers,
          }),
        });

        const initData: any = await initRes.json();
        const createdRoom = initData.room || {};
        createdRoom.joinUrl = joinUrl;

        return new Response(
          JSON.stringify({
            success: true,
            roomId: internalRoomId,
            roomCode,
            joinUrl,
            expiresAt: createdRoom.expiresAt,
            createdAt: createdRoom.createdAt,
            plan,
            maxMembers,
            maxParticipants: maxMembers,
            room: createdRoom,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            status: 201,
          }
        );
      } catch (e) {
        // Fallback to Next.js API handler
      }
    }

    // 3. Room-specific HTTP requests (GET /api/rooms/:code, GET /api/rooms/:code/validate, POST /api/rooms/:code/messages)
    const roomMatch = url.pathname.match(/^\/(?:api\/)?rooms\/([A-Za-z0-9-]+)(\/.*)?$/i);
    if (roomMatch && env.ROOMS && !url.pathname.startsWith('/_next')) {
      const roomCode = roomMatch[1].toUpperCase().trim();
      const subPath = (roomMatch[2] || '').toLowerCase();

      // If it's a dynamic web page route (e.g. /room/CODE or /join/CODE), pass to Next.js!
      if (!url.pathname.startsWith('/api/')) {
        return openNextHandler.fetch(request, env, ctx);
      }

      const id = env.ROOMS.idFromName(roomCode);
      const stub = env.ROOMS.get(id);

      if (subPath === '/validate' || (subPath === '' && request.method === 'GET')) {
        const stateRes = await stub.fetch('http://do/state', { method: 'GET' });
        const stateData: any = await stateRes.json();
        return new Response(JSON.stringify(stateData), {
          status: stateRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (subPath === '/messages' && request.method === 'POST') {
        const msgRes = await stub.fetch('http://do/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: await request.text(),
        });
        const msgData: any = await msgRes.json();
        return new Response(JSON.stringify(msgData), {
          status: msgRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (request.method === 'POST') {
        const joinRes = await stub.fetch('http://do/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: await request.text(),
        });
        const joinData: any = await joinRes.json();
        return new Response(JSON.stringify(joinData), {
          status: joinRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 4. Delegate all Next.js Frontend pages, App Router SSR, Static Assets, and API route handlers to OpenNext
    return openNextHandler.fetch(request, env, ctx);
  },
};
