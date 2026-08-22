import { Room, Message, Participant } from '@/types';
import { generateId, generateRoomCode, generateParticipantId, generateInternalRoomId } from './identity';

// Global in-memory storage attached to globalThis to persist across Next.js dev reloads
declare global {
  var __templink_rooms__: Map<string, Room> | undefined;
}

if (!globalThis.__templink_rooms__) {
  globalThis.__templink_rooms__ = new Map<string, Room>();
}

const globalRooms = globalThis.__templink_rooms__;

export interface CreateRoomOptions {
  durationMinutes: number;
  maxParticipants?: number;
  passwordProtected?: boolean;
  password?: string;
  allowFiles?: boolean;
  notifyExpiration?: boolean;
  creatorParticipantId?: string;
  creatorName: string;
  customCode?: string;
  baseUrl?: string;
}

/**
 * Generates a collision-free room code not currently used by any active room
 */
export function generateUniqueRoomCode(): string {
  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const code = generateRoomCode();
    const existing = globalRooms.get(code);
    if (!existing) {
      return code;
    }
    // If existing room is expired, it's safe to recreate/replace
    if (existing.status === 'EXPIRED' || existing.status === 'ENDED' || Date.now() >= existing.expiresAt) {
      return code;
    }
  }
  return generateRoomCode();
}

export function createRoom(options: CreateRoomOptions): Room {
  const roomCode = (options.customCode || generateUniqueRoomCode()).toUpperCase().trim();
  const roomId = generateInternalRoomId();
  const creatorParticipantId = options.creatorParticipantId || generateParticipantId();
  const now = Date.now();
  const durationMs = options.durationMinutes * 60 * 1000;
  const baseUrl = options.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const joinUrl = `${baseUrl}/join/${roomCode}`;

  const creator: Participant = {
    participantId: creatorParticipantId,
    displayName: options.creatorName,
    role: 'creator',
    joinedAt: now,
    isOnline: true,
  };

  const room: Room = {
    id: roomId,
    roomId,
    roomCode,
    joinUrl,
    createdAt: now,
    expiresAt: now + durationMs,
    durationMinutes: options.durationMinutes,
    maxParticipants: options.maxParticipants || 2,
    participantLimit: options.maxParticipants || 2,
    passwordProtected: !!options.passwordProtected,
    password: options.password,
    allowFiles: options.allowFiles !== false,
    notifyExpiration: options.notifyExpiration !== false,
    status: 'WAITING',
    createdBy: creatorParticipantId,
    creatorName: options.creatorName,
    participants: [creator],
    messages: [
      {
        id: generateId(),
        roomCode,
        senderId: 'system',
        senderName: 'TempLink System',
        content: `Private room created. Auto-destruct active in ${options.durationMinutes} minutes.`,
        timestamp: now,
        type: 'system',
      },
    ],
  };

  globalRooms.set(roomCode, room);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ROOM CREATED] roomCode=${roomCode}, joinUrl=${joinUrl}, expiresAt=${new Date(room.expiresAt).toLocaleTimeString()}`);
  }

  return room;
}

export function getOrCreateRoom(roomCode: string, defaultDuration = 30): Room {
  const code = roomCode.toUpperCase().trim();
  let room = globalRooms.get(code);

  if (!room) {
    room = createRoom({
      durationMinutes: defaultDuration,
      creatorName: 'GuestCreator',
      customCode: code,
    });
  }

  if (Date.now() >= room.expiresAt && room.status !== 'ENDED') {
    room.status = 'EXPIRED';
    room.messages = [];
  }

  return room;
}

export function getRoom(roomCode: string): Room | null {
  const code = roomCode.toUpperCase().trim();
  const room = globalRooms.get(code);
  if (!room) return null;

  if (Date.now() >= room.expiresAt && room.status !== 'ENDED') {
    room.status = 'EXPIRED';
    room.messages = [];
  }

  return room;
}

export function validateRoom(roomCode: string): {
  valid: boolean;
  error?: string;
  room?: Partial<Room>;
} {
  const code = roomCode.toUpperCase().trim();
  const room = getRoom(code);

  if (!room) {
    return { valid: false, error: 'Room does not exist or has expired.' };
  }

  if (room.status === 'EXPIRED' || room.status === 'ENDED' || Date.now() >= room.expiresAt) {
    return { valid: false, error: 'This room has already expired and was securely erased.' };
  }

  if (room.participants.length >= room.maxParticipants) {
    return { valid: false, error: 'Room is already full (maximum 2 participants reached).' };
  }

  return {
    valid: true,
    room: {
      id: room.id,
      roomCode: room.roomCode,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      durationMinutes: room.durationMinutes,
      maxParticipants: room.maxParticipants,
      passwordProtected: room.passwordProtected,
      status: room.status,
      creatorName: room.creatorName,
      joinUrl: room.joinUrl,
    },
  };
}

export function joinRoom(
  roomCode: string,
  participantId: string,
  displayName: string,
  password?: string
): { success: boolean; error?: string; room?: Room; participant?: Participant } {
  const room = getRoom(roomCode);

  if (!room) {
    return { success: false, error: 'Room not found.' };
  }

  if (room.status === 'ENDED' || room.status === 'EXPIRED' || Date.now() >= room.expiresAt) {
    room.status = 'EXPIRED';
    room.messages = [];
    return { success: false, error: 'This room has already expired and was securely erased.' };
  }

  if (room.passwordProtected && room.password && room.password !== password) {
    return { success: false, error: 'Incorrect room password.' };
  }

  let participant = room.participants.find((p) => p.participantId === participantId);
  if (!participant) {
    if (room.participants.length >= room.maxParticipants) {
      return { success: false, error: 'Room is already full (maximum 2 participants reached).' };
    }

    participant = {
      participantId: participantId || generateParticipantId(),
      displayName: displayName || 'Member',
      role: 'member',
      joinedAt: Date.now(),
      isOnline: true,
    };
    room.participants.push(participant);
    room.status = 'ACTIVE';

    room.messages.push({
      id: generateId(),
      roomCode: room.roomCode,
      senderId: 'system',
      senderName: 'TempLink System',
      content: `${participant.displayName} joined the private room.`,
      timestamp: Date.now(),
      type: 'system',
    });
  } else {
    participant.isOnline = true;
  }

  return { success: true, room, participant };
}

export function addMessage(
  roomCode: string,
  senderId: string,
  senderName: string,
  content: string,
  file?: any,
  msgId?: string
): { success: boolean; error?: string; message?: Message } {
  const room = getRoom(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found.' };
  }

  if (room.status === 'EXPIRED' || room.status === 'ENDED' || Date.now() >= room.expiresAt) {
    return { success: false, error: 'Room has expired. Messages cannot be sent.' };
  }

  const sender = room.participants.find((p) => p.participantId === senderId);

  const message: Message = {
    id: msgId || generateId(),
    roomCode: room.roomCode,
    senderId,
    senderName: sender?.displayName || senderName || 'Anonymous',
    content,
    timestamp: Date.now(),
    type: file ? 'file' : 'text',
    file,
  };

  room.messages.push(message);
  return { success: true, message };
}

export function endRoom(roomCode: string, requestedBy?: string): { success: boolean; error?: string } {
  const room = getRoom(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found.' };
  }

  room.status = 'ENDED';
  room.messages = [];
  return { success: true };
}

export function getAllActiveRooms(): Room[] {
  const rooms: Room[] = [];
  const now = Date.now();
  for (const room of globalRooms.values()) {
    if (room.status !== 'EXPIRED' && room.status !== 'ENDED' && now < room.expiresAt) {
      rooms.push(room);
    }
  }
  return rooms;
}
