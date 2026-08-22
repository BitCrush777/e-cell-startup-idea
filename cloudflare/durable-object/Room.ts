/// <reference types="@cloudflare/workers-types" />

export interface Participant {
  participantId: string;
  displayName: string;
  role: 'creator' | 'member';
  joinedAt: number;
  isOnline: boolean;
  isTyping?: boolean;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface Message {
  id: string;
  roomId?: string;
  roomCode: string;
  senderId: string;       // Authoritative participantId
  senderName: string;     // Presentation label
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'system';
  file?: FileAttachment;
}

export type RoomStatus = 'WAITING' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'ENDED';

export interface RoomState {
  id: string;             // Internal authoritative room ID
  roomId?: string;        // Alias for id
  roomCode: string;       // Public code (e.g. K7XM-4P2Q)
  joinUrl?: string;       // Public dynamic join URL
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  participantLimit: number;
  passwordProtected: boolean;
  passwordHash?: string;
  allowFiles: boolean;
  notifyExpiration: boolean;
  status: RoomStatus;
  createdBy: string;
  creatorName: string;
  participants: Participant[];
  messages: Message[];
}

export type RoomEvent =
  | { type: 'participant_joined'; roomCode: string; participant: Participant }
  | { type: 'participant_left'; roomCode: string; participantId: string; participantName?: string }
  | { type: 'message'; roomCode: string; message: Message }
  | { type: 'typing'; roomCode: string; participantId: string; displayName?: string; typing: boolean }
  | { type: 'room_state'; roomCode: string; state: Partial<RoomState> }
  | { type: 'room_expiring'; roomCode: string; remainingSeconds: number }
  | { type: 'room_expired'; roomCode: string; reason: string }
  | { type: 'room_ended'; roomCode: string; reason: string }
  | { type: 'connection_status'; status: 'connected' | 'reconnecting' | 'disconnected' }
  | { type: 'pong'; timestamp: number };

export class RoomDurableObject {
  private state: DurableObjectState;
  private env: any;
  private room: RoomState | null = null;
  // Authoritative WebSocket session mapping: Socket -> { participantId, displayName }
  private sessions: Map<WebSocket, { participantId: string; displayName: string }> = new Map();

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  private async loadRoom(): Promise<RoomState | null> {
    if (!this.room) {
      this.room = (await this.state.storage.get<RoomState>('room_data')) || null;
    }
    if (this.room) {
      this.checkExpiration();
    }
    return this.room;
  }

  private async saveRoom(): Promise<void> {
    if (this.room) {
      await this.state.storage.put('room_data', this.room);
    }
  }

  private checkExpiration(): boolean {
    if (!this.room) return true;
    const now = Date.now();

    if (now >= this.room.expiresAt && this.room.status !== 'ENDED') {
      this.room.status = 'EXPIRED';
      this.room.messages = []; // Zeroize all ephemeral messages immediately
      this.broadcast({
        type: 'room_expired',
        roomCode: this.room.roomCode,
        reason: 'Room lifespan reached 0:00. Memory zeroized.',
      });
      this.closeAllSockets(1000, 'Room expired');
      return true;
    }

    if (this.room.expiresAt - now <= 60000 && this.room.status === 'ACTIVE') {
      this.room.status = 'EXPIRING';
      this.broadcast({
        type: 'room_expiring',
        roomCode: this.room.roomCode,
        remainingSeconds: Math.max(0, Math.floor((this.room.expiresAt - now) / 1000)),
      });
    }

    return false;
  }

  async alarm(): Promise<void> {
    await this.loadRoom();
    if (this.room && this.room.status !== 'ENDED') {
      this.room.status = 'EXPIRED';
      this.room.messages = [];
      await this.saveRoom();
      this.broadcast({
        type: 'room_expired',
        roomCode: this.room.roomCode,
        reason: 'Authoritative server timer reached 0:00.',
      });
      this.closeAllSockets(1000, 'Room expired');
    }
  }

  private broadcast(event: RoomEvent, excludeWs?: WebSocket): void {
    const payload = JSON.stringify(event);
    for (const [ws] of this.sessions.entries()) {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(payload);
        } catch {
          this.sessions.delete(ws);
        }
      }
    }
  }

  private closeAllSockets(code: number, reason: string): void {
    for (const [ws] of this.sessions.entries()) {
      try {
        ws.close(code, reason);
      } catch {}
    }
    this.sessions.clear();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    await this.loadRoom();

    // 1. WebSocket Upgrade Handler
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // 2. Initialize Room
    if (url.pathname === '/init' && request.method === 'POST') {
      const data: any = await request.json();
      const now = Date.now();
      const durationMs = (data.durationMinutes || 15) * 60 * 1000;
      const creatorId = data.creatorParticipantId || 'p_' + Math.random().toString(36).substring(2, 9);
      const creatorName = data.creatorName || 'Creator';
      const internalId = data.roomId || data.id || 'room_' + Math.random().toString(36).substring(2, 9);
      const roomCode = data.roomCode.toUpperCase().trim();
      const joinUrl = data.joinUrl || `https://templink.app/join/${roomCode}`;

      const creator: Participant = {
        participantId: creatorId,
        displayName: creatorName,
        role: 'creator',
        joinedAt: now,
        isOnline: true,
      };

      this.room = {
        id: internalId,
        roomId: internalId,
        roomCode,
        joinUrl,
        createdAt: now,
        expiresAt: now + durationMs,
        durationMinutes: data.durationMinutes || 15,
        participantLimit: data.maxParticipants || 2,
        passwordProtected: !!data.passwordProtected,
        passwordHash: data.passwordHash,
        allowFiles: data.allowFiles !== false,
        notifyExpiration: data.notifyExpiration !== false,
        status: 'WAITING',
        createdBy: creator.participantId,
        creatorName: creator.displayName,
        participants: [creator],
        messages: [
          {
            id: 'sys-' + Math.random().toString(36).substring(2, 7),
            roomCode,
            senderId: 'system',
            senderName: 'TempLink System',
            content: `Private room initialized. Ephemeral TTL: ${data.durationMinutes || 15} minutes.`,
            timestamp: now,
            type: 'system',
          },
        ],
      };

      await this.saveRoom();
      await this.state.storage.setAlarm(this.room.expiresAt);

      return new Response(JSON.stringify({ success: true, room: this.room }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Get Room State
    if (url.pathname === '/state' && request.method === 'GET') {
      if (!this.room) {
        return new Response(JSON.stringify({ success: false, error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true, room: this.room }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Join Room
    if (url.pathname === '/join' && request.method === 'POST') {
      if (!this.room) {
        return new Response(JSON.stringify({ success: false, error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (this.room.status === 'EXPIRED' || this.room.status === 'ENDED') {
        return new Response(
          JSON.stringify({ success: false, error: 'Room has expired and was zeroized.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const body: any = await request.json();
      const { participantId, participantName, password } = body;

      if (this.room.passwordProtected && this.room.passwordHash && this.room.passwordHash !== password) {
        return new Response(JSON.stringify({ success: false, error: 'Incorrect room password.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let participant = this.room.participants.find(
        (p) => p.participantId === participantId
      );

      if (!participant) {
        if (this.room.participants.length >= this.room.participantLimit) {
          return new Response(
            JSON.stringify({ success: false, error: 'Room is full (limit 2 participants).' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        participant = {
          participantId: participantId || 'p_' + Math.random().toString(36).substring(2, 9),
          displayName: participantName || 'Member',
          role: 'member',
          joinedAt: Date.now(),
          isOnline: true,
        };
        this.room.participants.push(participant);
        this.room.status = 'ACTIVE';

        const joinMessage: Message = {
          id: 'sys-' + Math.random().toString(36).substring(2, 7),
          roomCode: this.room.roomCode,
          senderId: 'system',
          senderName: 'TempLink System',
          content: `${participant.displayName} joined the private channel.`,
          timestamp: Date.now(),
          type: 'system',
        };
        this.room.messages.push(joinMessage);

        this.broadcast({
          type: 'participant_joined',
          roomCode: this.room.roomCode,
          participant,
        });
        this.broadcast({
          type: 'message',
          roomCode: this.room.roomCode,
          message: joinMessage,
        });
      } else {
        participant.isOnline = true;
      }

      await this.saveRoom();
      return new Response(JSON.stringify({ success: true, room: this.room, participant }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Send Message HTTP Fallback
    if (url.pathname === '/message' && request.method === 'POST') {
      if (!this.room || this.room.status === 'EXPIRED' || this.room.status === 'ENDED') {
        return new Response(JSON.stringify({ success: false, error: 'Room unavailable' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const body: any = await request.json();
      const sender = this.room.participants.find((p) => p.participantId === body.senderId);

      const msg: Message = {
        id: body.id || Math.random().toString(36).substring(2, 9),
        roomCode: this.room.roomCode,
        senderId: body.senderId,
        senderName: sender?.displayName || body.senderName || 'Anonymous',
        content: body.content || '',
        timestamp: Date.now(),
        type: body.file ? 'file' : 'text',
        file: body.file,
      };

      this.room.messages.push(msg);
      await this.saveRoom();

      this.broadcast({
        type: 'message',
        roomCode: this.room.roomCode,
        message: msg,
      });

      return new Response(JSON.stringify({ success: true, message: msg }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 6. End Room
    if (url.pathname === '/end' && request.method === 'POST') {
      if (!this.room) {
        return new Response(JSON.stringify({ success: false, error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      this.room.status = 'ENDED';
      this.room.messages = [];
      await this.saveRoom();

      this.broadcast({
        type: 'room_ended',
        roomCode: this.room.roomCode,
        reason: 'Host terminated this private session.',
      });
      this.closeAllSockets(1000, 'Room ended');

      return new Response(JSON.stringify({ success: true, message: 'Room ended' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  private handleWebSocket(request: Request): Response {
    if (!this.room || this.room.status === 'EXPIRED' || this.room.status === 'ENDED') {
      return new Response('Room expired or unavailable', { status: 410 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId') || 'guest';
    const displayName = url.searchParams.get('displayName') || url.searchParams.get('participantName') || 'Guest';

    server.accept();

    // Map the WebSocket strictly to the authenticated participantId
    this.sessions.set(server, { participantId, displayName });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ROOM] participant connected -> participantId: ${participantId}, roomCode: ${this.room.roomCode}`);
    }

    // Mark participant online in room state
    const p = this.room.participants.find((x) => x.participantId === participantId);
    if (p) {
      p.isOnline = true;
    }

    // Send current room state on connection
    server.send(
      JSON.stringify({
        type: 'room_state',
        roomCode: this.room.roomCode,
        state: this.room,
      })
    );

    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const session = this.sessions.get(server);
        if (!session || !this.room || this.room.status === 'EXPIRED' || this.room.status === 'ENDED') {
          return;
        }

        if (data.type === 'message') {
          // Authoritatively assign senderId from the registered connection session!
          const msg: Message = {
            id: data.id || Math.random().toString(36).substring(2, 9),
            roomCode: this.room.roomCode,
            senderId: session.participantId,
            senderName: session.displayName,
            content: data.content || '',
            timestamp: Date.now(),
            type: data.file ? 'file' : 'text',
            file: data.file,
          };

          if (process.env.NODE_ENV !== 'production') {
            console.log(`[MESSAGE] roomCode: ${this.room.roomCode}, senderId: ${session.participantId}`);
          }

          this.room.messages.push(msg);
          await this.saveRoom();

          this.broadcast({
            type: 'message',
            roomCode: this.room.roomCode,
            message: msg,
          });
        } else if (data.type === 'typing') {
          const isTyping = Boolean(data.typing);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[TYPING] roomCode: ${this.room.roomCode}, participantId: ${session.participantId}, typing: ${isTyping}`);
          }

          this.broadcast(
            {
              type: 'typing',
              roomCode: this.room.roomCode,
              participantId: session.participantId,
              displayName: session.displayName,
              typing: isTyping,
            },
            server // Don't echo back to the sender
          );
        } else if (data.type === 'ping') {
          server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (err) {}
    });

    server.addEventListener('close', () => {
      const session = this.sessions.get(server);
      this.sessions.delete(server);

      if (session && this.room) {
        const participant = this.room.participants.find((x) => x.participantId === session.participantId);
        if (participant) {
          participant.isOnline = false;
        }
        this.broadcast({
          type: 'participant_left',
          roomCode: this.room.roomCode,
          participantId: session.participantId,
          participantName: session.displayName,
        });
      }
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
