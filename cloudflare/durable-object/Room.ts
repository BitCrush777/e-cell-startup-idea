/// <reference types="@cloudflare/workers-types" />

import { defaultModerator, SAFE_ROOM_CONFIG } from '../moderation/word-filter';

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

export type RoomStatus = 'WAITING' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'ENDED' | 'MODERATION_TERMINATED';
export type RoomPlan = 'FREE' | 'PRO' | 'BUSINESS';

export interface RoomState {
  id: string;             // Internal authoritative room ID
  roomId?: string;        // Alias for id
  roomCode: string;       // Public code (e.g. K7XM-4P2Q)
  joinUrl?: string;       // Public dynamic join URL
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  plan: RoomPlan;         // Subscription plan: FREE (3), PRO (10), BUSINESS (25+)
  maxMembers: number;     // Authoritative member limit
  maxParticipants: number;// Compatibility alias
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
  | { type: 'participant_joined'; roomCode: string; participant: Participant; currentMembers?: number; maxMembers?: number }
  | { type: 'participant_left'; roomCode: string; participantId: string; participantName?: string; currentMembers?: number; maxMembers?: number }
  | { type: 'message'; roomCode: string; message: Message }
  | { type: 'typing'; roomCode: string; participantId: string; displayName?: string; typing: boolean }
  | { type: 'room_state'; roomCode: string; state: Partial<RoomState> }
  | { type: 'room_expiring'; roomCode: string; remainingSeconds: number }
  | { type: 'room_expired'; roomCode: string; reason: string }
  | { type: 'room_ended'; roomCode: string; reason: string }
  | {
      type: 'moderation_warning';
      eventId: string;
      roomCode: string;
      participantId: string;
      warningNumber: number;
      warningsRemaining: number;
      maxWarnings: number;
      finalWarning: boolean;
      reason: string;
      message: string;
    }
  | {
      type: 'room_terminated';
      roomCode: string;
      reason: 'MODERATION_VIOLATION' | 'ADMIN_ACTION' | 'POLICY_VIOLATION';
      message: string;
    }
  | {
      type: 'message_blocked';
      eventId: string;
      roomCode: string;
      participantId: string;
      reason: string;
      message: string;
    }
  | { type: 'connection_status'; status: 'connected' | 'reconnecting' | 'disconnected' }
  | { type: 'pong'; timestamp: number };

function getLimitForPlan(plan?: string | null): number {
  const p = (plan || 'FREE').toUpperCase();
  if (p === 'PRO') return 10;
  if (p === 'BUSINESS') return 25;
  return 3;
}

export class RoomDurableObject {
  private state: DurableObjectState;
  private env: any;
  private room: RoomState | null = null;
  // Authoritative WebSocket session mapping: Socket -> { participantId, displayName }
  private sessions: Map<WebSocket, { participantId: string; displayName: string }> = new Map();
  // SafeRoom moderation state tracked strictly per participant
  private warningsByParticipant: Map<string, number> = new Map();
  // Message rate-limiting window tracker per participantId
  private messageTimestamps: Map<string, number[]> = new Map();

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  private async loadRoom(inferredCode?: string): Promise<RoomState | null> {
    if (!this.room) {
      this.room = (await this.state.storage.get<RoomState>('room_data')) || null;
    }

    // Auto-initialize if empty and code is provided
    if (!this.room && inferredCode) {
      const now = Date.now();
      const durationMinutes = 30;
      const plan: RoomPlan = 'FREE';
      const maxMembers = 3;
      this.room = {
        id: 'room_' + inferredCode.replace(/[^A-Za-z0-9]/g, ''),
        roomCode: inferredCode.toUpperCase().trim(),
        joinUrl: `https://templink.in/join/${inferredCode.toUpperCase().trim()}`,
        createdAt: now,
        expiresAt: now + durationMinutes * 60 * 1000,
        durationMinutes,
        plan,
        maxMembers,
        maxParticipants: maxMembers,
        participantLimit: maxMembers,
        passwordProtected: false,
        allowFiles: true,
        notifyExpiration: true,
        status: 'ACTIVE',
        createdBy: 'system',
        creatorName: 'TempLink Host',
        participants: [],
        messages: [
          {
            id: 'sys_' + Math.random().toString(36).substring(2, 8),
            roomCode: inferredCode.toUpperCase().trim(),
            senderId: 'system',
            senderName: 'TempLink System',
            content: 'Private channel established. SafeRoom active protection enabled.',
            timestamp: now,
            type: 'system',
          },
        ],
      };
      await this.saveRoom();
      try {
        await this.state.storage.setAlarm(this.room.expiresAt);
      } catch {}
    }

    if (this.room) {
      // Ensure maxMembers and plan exist
      if (!this.room.plan) this.room.plan = 'FREE';
      if (!this.room.maxMembers) {
        this.room.maxMembers = this.room.participantLimit || getLimitForPlan(this.room.plan);
      }
      this.room.maxParticipants = this.room.maxMembers;
      this.room.participantLimit = this.room.maxMembers;

      // Check server-authoritative expiration
      if (
        Date.now() >= this.room.expiresAt &&
        this.room.status !== 'EXPIRED' &&
        this.room.status !== 'ENDED' &&
        this.room.status !== 'MODERATION_TERMINATED'
      ) {
        this.room.status = 'EXPIRED';
        await this.saveRoom();
        this.broadcast({
          type: 'room_expired',
          roomCode: this.room.roomCode,
          reason: 'TTL countdown reached zero.',
        });
        this.closeAllSockets(1000, 'Room expired');
      }
    }

    return this.room;
  }

  private async saveRoom(): Promise<void> {
    if (this.room) {
      await this.state.storage.put('room_data', this.room);
    }
  }

  private broadcast(event: RoomEvent, excludeSocket?: WebSocket): void {
    const payload = JSON.stringify(event);
    for (const [socket] of this.sessions.entries()) {
      if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(payload);
        } catch {
          this.sessions.delete(socket);
        }
      }
    }
  }

  private closeAllSockets(code: number = 1000, reason: string = 'Closed'): void {
    for (const [socket] of this.sessions.entries()) {
      try {
        socket.close(code, reason);
      } catch {}
    }
    this.sessions.clear();
  }

  // Cloudflare Alarm for deterministic, server-level expiration zeroization
  async alarm(): Promise<void> {
    if (this.room && this.room.status !== 'MODERATION_TERMINATED') {
      this.room.status = 'EXPIRED';
      this.broadcast({
        type: 'room_expired',
        roomCode: this.room.roomCode,
        reason: 'Room lifespan completed. Memory zeroized.',
      });
      this.closeAllSockets(1000, 'Room expired');
    }
    await this.state.storage.deleteAll();
    this.room = null;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Extract roomCode from path if available
    const roomMatch = url.pathname.match(/\/rooms\/([A-Za-z0-9-]+)/i);
    const roomCodeFromUrl = roomMatch ? roomMatch[1].toUpperCase().trim() : undefined;

    await this.loadRoom(roomCodeFromUrl);

    // 1. WebSocket Upgrade Handler
    if (
      request.headers.get('Upgrade') === 'websocket' ||
      url.pathname.endsWith('/ws') ||
      url.pathname.includes('/ws?')
    ) {
      return this.handleWebSocket(request, roomCodeFromUrl);
    }

    // 2. Initialize Room
    if (url.pathname === '/init' && request.method === 'POST') {
      const data: any = await request.json();
      const now = Date.now();
      const durationMs = (data.durationMinutes || 15) * 60 * 1000;
      const creatorId = data.creatorParticipantId || 'p_' + Math.random().toString(36).substring(2, 9);
      const creatorName = data.creatorName || 'Creator';
      const internalId = data.roomId || data.id || 'room_' + Math.random().toString(36).substring(2, 9);
      const roomCode = (data.roomCode || roomCodeFromUrl || 'UNKNOWN').toUpperCase().trim();
      const joinUrl = data.joinUrl || `https://templink.in/join/${roomCode}`;
      const plan: RoomPlan = data.plan ? (data.plan.toUpperCase() as RoomPlan) : 'FREE';
      const maxMembers = data.maxMembers || data.maxParticipants || getLimitForPlan(plan);

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
        plan,
        maxMembers,
        maxParticipants: maxMembers,
        participantLimit: maxMembers,
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
            content: `Private room initialized (${plan} plan: up to ${maxMembers} members). SafeRoom active.`,
            timestamp: now,
            type: 'system',
          },
        ],
      };

      await this.saveRoom();
      try {
        await this.state.storage.setAlarm(this.room.expiresAt);
      } catch {}

      return new Response(JSON.stringify({ success: true, room: this.room }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Get Room State / Validate
    if ((url.pathname === '/state' || url.pathname.endsWith('/validate')) && request.method === 'GET') {
      if (!this.room) {
        return new Response(JSON.stringify({ success: false, valid: false, error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (this.room.status === 'MODERATION_TERMINATED') {
        return new Response(
          JSON.stringify({
            success: false,
            valid: false,
            status: 'terminated',
            code: 'ROOM_TERMINATED',
            error: "This room was closed because of repeated violations of the conversation guidelines.",
          }),
          { status: 410, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({ success: true, valid: true, room: this.room }), {
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

      if (this.room.status === 'MODERATION_TERMINATED') {
        return new Response(
          JSON.stringify({
            success: false,
            code: 'ROOM_TERMINATED',
            error: "This room was closed because of repeated violations of the conversation guidelines.",
          }),
          { status: 410, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (this.room.status === 'EXPIRED' || this.room.status === 'ENDED' || Date.now() >= this.room.expiresAt) {
        return new Response(
          JSON.stringify({ success: false, error: 'Room has expired and was zeroized.' }),
          { status: 410, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const body: any = await request.json();
      const { participantId, participantName, displayName, password } = body;

      if (this.room.passwordProtected && this.room.passwordHash && this.room.passwordHash !== password) {
        return new Response(JSON.stringify({ success: false, error: 'Incorrect room password.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let participant = this.room.participants.find(
        (p) => p.participantId === participantId
      );

      const maxMembers = this.room.maxMembers || this.room.participantLimit || 3;

      if (!participant) {
        if (this.room.participants.length >= maxMembers) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Room is full (limit ${maxMembers} members reached for ${this.room.plan || 'Free'} plan).`,
              code: 'ROOM_FULL',
              currentMembers: this.room.participants.length,
              maxMembers,
              plan: this.room.plan || 'FREE',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        participant = {
          participantId: participantId || 'p_' + Math.random().toString(36).substring(2, 9),
          displayName: displayName || participantName || 'Member',
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
          currentMembers: this.room.participants.length,
          maxMembers,
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

    // 5. Post Message (REST)
    if (url.pathname === '/messages' && request.method === 'POST') {
      if (!this.room || this.room.status !== 'ACTIVE' && this.room.status !== 'WAITING') {
        return new Response(JSON.stringify({ success: false, error: 'Room unavailable or terminated' }), {
          status: 410,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const body: any = await request.json();
      const content = body.content || '';

      // SafeRoom server-side moderation check
      const modResult = defaultModerator.moderate(content);
      if (!modResult.allowed) {
        const participantId = body.senderId || 'unknown';
        const warnings = (this.warningsByParticipant.get(participantId) || 0) + 1;
        this.warningsByParticipant.set(participantId, warnings);

        if (warnings >= SAFE_ROOM_CONFIG.terminateOnViolationNumber) {
          this.room.status = 'MODERATION_TERMINATED';
          this.room.messages = [];
          await this.saveRoom();
          this.broadcast({
            type: 'room_terminated',
            roomCode: this.room.roomCode,
            reason: 'MODERATION_VIOLATION',
            message: "This temporary room was closed because of repeated violations of the conversation guidelines.",
          });
          this.closeAllSockets(1008, 'Room terminated');
          return new Response(
            JSON.stringify({
              success: false,
              code: 'ROOM_TERMINATED',
              error: 'Room terminated due to repeated guideline violations.',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: false,
            code: 'MODERATION_VIOLATION',
            warningNumber: warnings,
            warningsRemaining: Math.max(0, SAFE_ROOM_CONFIG.maxWarnings - warnings),
            error: 'Message blocked by SafeRoom.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const sender = this.room.participants.find((p) => p.participantId === body.senderId);
      const msg: Message = {
        id: body.id || 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        roomCode: this.room.roomCode,
        senderId: body.senderId || 'unknown',
        senderName: sender?.displayName || body.senderName || 'Anonymous',
        content,
        timestamp: Date.now(),
        type: body.type || 'text',
        file: body.file,
      };

      this.room.messages.push(msg);
      if (this.room.messages.length > 100) {
        this.room.messages = this.room.messages.slice(-100);
      }

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

    // 6. Manual End Room
    if (url.pathname === '/end' && request.method === 'POST') {
      if (!this.room) {
        return new Response(JSON.stringify({ success: false, error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      this.room.status = 'ENDED';
      await this.saveRoom();

      this.broadcast({
        type: 'room_ended',
        roomCode: this.room.roomCode,
        reason: 'The room was manually ended by the owner.',
      });

      this.closeAllSockets(1000, 'Room ended by owner');

      return new Response(JSON.stringify({ success: true, room: this.room }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private handleWebSocket(request: Request, inferredCode?: string): Response {
    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId') || 'p_' + Math.random().toString(36).substring(2, 9);
    const displayName = url.searchParams.get('displayName') || url.searchParams.get('participantName') || 'Guest';

    if (!this.room && inferredCode) {
      const now = Date.now();
      const durationMinutes = 30;
      const plan: RoomPlan = 'FREE';
      const maxMembers = 3;
      this.room = {
        id: 'room_' + inferredCode.replace(/[^A-Za-z0-9]/g, ''),
        roomCode: inferredCode.toUpperCase().trim(),
        joinUrl: `https://templink.in/join/${inferredCode.toUpperCase().trim()}`,
        createdAt: now,
        expiresAt: now + durationMinutes * 60 * 1000,
        durationMinutes,
        plan,
        maxMembers,
        maxParticipants: maxMembers,
        participantLimit: maxMembers,
        passwordProtected: false,
        allowFiles: true,
        notifyExpiration: true,
        status: 'ACTIVE',
        createdBy: participantId,
        creatorName: displayName,
        participants: [
          {
            participantId,
            displayName,
            role: 'creator',
            joinedAt: now,
            isOnline: true,
          },
        ],
        messages: [
          {
            id: 'sys_' + Math.random().toString(36).substring(2, 8),
            roomCode: inferredCode.toUpperCase().trim(),
            senderId: 'system',
            senderName: 'TempLink System',
            content: 'Private channel established. SafeRoom active protection enabled.',
            timestamp: now,
            type: 'system',
          },
        ],
      };
      this.saveRoom();
    }

    // Rejection check for Terminated / Expired / Ended rooms
    if (this.room?.status === 'MODERATION_TERMINATED') {
      return new Response(
        JSON.stringify({
          error: 'ROOM_TERMINATED',
          code: 'ROOM_TERMINATED',
          message: 'This room was closed because of repeated violations of the conversation guidelines.',
        }),
        { status: 410 }
      );
    }

    if (!this.room || this.room.status === 'EXPIRED' || this.room.status === 'ENDED' || Date.now() >= this.room.expiresAt) {
      return new Response('Room expired or unavailable', { status: 410 });
    }

    const maxMembers = this.room.maxMembers || this.room.participantLimit || 3;
    let existingParticipant = this.room.participants.find((x) => x.participantId === participantId);

    // If new participant and room is already full, reject WebSocket upgrade
    if (!existingParticipant && this.room.participants.length >= maxMembers) {
      return new Response(
        JSON.stringify({
          error: 'ROOM_FULL',
          code: 'ROOM_FULL',
          currentMembers: this.room.participants.length,
          maxMembers,
        }),
        { status: 400 }
      );
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();

    // Map WebSocket connection strictly to this participant session
    this.sessions.set(server, { participantId, displayName });

    let isNewParticipant = false;

    if (!existingParticipant) {
      existingParticipant = {
        participantId,
        displayName,
        role: this.room.participants.length === 0 ? 'creator' : 'member',
        joinedAt: Date.now(),
        isOnline: true,
      };
      this.room.participants.push(existingParticipant);
      this.room.status = 'ACTIVE';
      isNewParticipant = true;
    } else {
      existingParticipant.isOnline = true;
      if (displayName && displayName !== 'Guest') {
        existingParticipant.displayName = displayName;
      }
    }

    this.saveRoom();

    // Notify others if a new participant joined
    if (isNewParticipant && existingParticipant) {
      this.broadcast(
        {
          type: 'participant_joined',
          roomCode: this.room.roomCode,
          participant: existingParticipant,
          currentMembers: this.room.participants.length,
          maxMembers,
        },
        server
      );
    }

    // Send authoritative room state directly to the connecting client
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
        if (!session || !this.room) return;

        // Block all activity if room is terminated or expired
        if (
          this.room.status === 'MODERATION_TERMINATED' ||
          this.room.status === 'EXPIRED' ||
          this.room.status === 'ENDED'
        ) {
          return;
        }

        if (data.type === 'message') {
          const content = String(data.content || '');

          // 1. Message size validation
          if (content.length > SAFE_ROOM_CONFIG.messageMaxLength) {
            server.send(
              JSON.stringify({
                type: 'message_blocked',
                eventId: 'size_' + Math.random().toString(36).substring(2, 8),
                roomCode: this.room.roomCode,
                participantId: session.participantId,
                reason: 'MESSAGE_TOO_LONG',
                message: 'Message is too long. Please shorten your message.',
              })
            );
            return;
          }

          // 2. Rate limiting check (max 5 messages per second window)
          const now = Date.now();
          const pTimestamps = this.messageTimestamps.get(session.participantId) || [];
          const recentTimestamps = pTimestamps.filter((t) => now - t < SAFE_ROOM_CONFIG.rateLimitWindowMs);
          if (recentTimestamps.length >= SAFE_ROOM_CONFIG.maxMessagesPerWindow) {
            server.send(
              JSON.stringify({
                type: 'message_blocked',
                eventId: 'rate_' + Math.random().toString(36).substring(2, 8),
                roomCode: this.room.roomCode,
                participantId: session.participantId,
                reason: 'RATE_LIMIT_EXCEEDED',
                message: "You're sending messages too quickly. Please slow down.",
              })
            );
            return;
          }
          recentTimestamps.push(now);
          this.messageTimestamps.set(session.participantId, recentTimestamps);

          // 3. SafeRoom Server-Authoritative Moderation Analysis
          const modResult = defaultModerator.moderate(content);
          if (!modResult.allowed) {
            // Increment participant-specific warning counter
            const currentWarnings = (this.warningsByParticipant.get(session.participantId) || 0) + 1;
            this.warningsByParticipant.set(session.participantId, currentWarnings);

            // Log minimal, privacy-preserving metadata in dev
            console.log('[MODERATION]', {
              roomCode: this.room.roomCode,
              participantId: session.participantId,
              action: currentWarnings >= SAFE_ROOM_CONFIG.terminateOnViolationNumber ? 'TERMINATE' : 'WARN',
              warningNumber: currentWarnings,
              category: modResult.category,
            });

            // If threshold reached (3rd violation) -> Terminate entire room
            if (currentWarnings >= SAFE_ROOM_CONFIG.terminateOnViolationNumber) {
              this.room.status = 'MODERATION_TERMINATED';
              this.room.messages = [];
              await this.saveRoom();

              this.broadcast({
                type: 'room_terminated',
                roomCode: this.room.roomCode,
                reason: 'MODERATION_VIOLATION',
                message: "This temporary room was closed because of repeated violations of the conversation guidelines.",
              });

              this.closeAllSockets(1008, 'Room closed due to repeated policy violations');
              await this.state.storage.deleteAll();
              return;
            }

            // Otherwise, send private warning directly to violating sender ONLY
            const isFinal = currentWarnings === SAFE_ROOM_CONFIG.maxWarnings;
            server.send(
              JSON.stringify({
                type: 'moderation_warning',
                eventId: 'mod_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
                roomCode: this.room.roomCode,
                participantId: session.participantId,
                warningNumber: currentWarnings,
                warningsRemaining: Math.max(0, SAFE_ROOM_CONFIG.maxWarnings - currentWarnings),
                maxWarnings: SAFE_ROOM_CONFIG.maxWarnings,
                finalWarning: isFinal,
                reason: 'POLICY_VIOLATION',
                message: isFinal
                  ? 'This is your final warning. Another violation will close this room.'
                  : 'Please keep the conversation respectful. Continued violations may close this room.',
              })
            );
            return; // Prohibited message is NEVER broadcast or stored
          }

          // 4. Allowed message -> Store and broadcast to all members
          const msgId = data.id || 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
          const msg: Message = {
            id: msgId,
            roomCode: this.room.roomCode,
            senderId: session.participantId,
            senderName: data.senderName || session.displayName || 'Anonymous',
            content,
            timestamp: Date.now(),
            type: data.messageType || (data.type === 'file' ? 'file' : 'text'),
            file: data.file,
          };

          this.room.messages.push(msg);
          if (this.room.messages.length > 100) {
            this.room.messages = this.room.messages.slice(-100);
          }
          await this.saveRoom();

          this.broadcast({
            type: 'message',
            roomCode: this.room.roomCode,
            message: msg,
          });
        }

        if (data.type === 'typing' || data.type === 'typing_start' || data.type === 'typing_stop') {
          const isTyping = data.type === 'typing' ? !!data.typing : data.type === 'typing_start';
          this.broadcast(
            {
              type: 'typing',
              roomCode: this.room.roomCode,
              participantId: session.participantId,
              displayName: session.displayName,
              typing: isTyping,
            },
            server
          );
        }

        if (data.type === 'ping') {
          server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (err) {
        console.error('[DO WS Error]', err);
      }
    });

    server.addEventListener('close', () => {
      const session = this.sessions.get(server);
      this.sessions.delete(server);

      if (session && this.room && this.room.status !== 'MODERATION_TERMINATED') {
        const p = this.room.participants.find((x) => x.participantId === session.participantId);
        if (p) {
          p.isOnline = false;
        }
        this.saveRoom();

        this.broadcast({
          type: 'participant_left',
          roomCode: this.room.roomCode,
          participantId: session.participantId,
          participantName: session.displayName,
          currentMembers: this.room.participants.filter((x) => x.isOnline).length,
          maxMembers: this.room.maxMembers,
        });
      }
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
