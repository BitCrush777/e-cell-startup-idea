import { Room, Message, Participant, RoomPlan } from '@/types';
import { generateId, generateRoomCode, generateParticipantId, generateInternalRoomId } from './identity';
import { getMaxRoomMembers, PlanType } from './plans';

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
  plan?: RoomPlan | PlanType;
  maxMembers?: number;
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
  const plan: RoomPlan = options.plan ? (options.plan.toUpperCase() as RoomPlan) : 'FREE';
  const maxMembers = options.maxMembers || options.maxParticipants || getMaxRoomMembers(plan);

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
    plan,
    maxMembers,
    maxParticipants: maxMembers,
    currentMembers: 1,
    participantLimit: maxMembers,
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
        content: `Private room created (${plan} plan: up to ${maxMembers} members). Auto-destruct active in ${options.durationMinutes} minutes.`,
        timestamp: now,
        type: 'system',
      },
    ],
  };

  globalRooms.set(roomCode, room);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ROOM CREATED] roomCode=${roomCode}, joinUrl=${joinUrl}, maxMembers=${maxMembers}, expiresAt=${new Date(room.expiresAt).toLocaleTimeString()}`);
  }

  return room;
}

export function getRoom(roomCode: string): Room | null {
  const code = roomCode.toUpperCase().trim();
  const room = globalRooms.get(code);

  if (!room) {
    return null;
  }

  // Check TTL
  if (Date.now() >= room.expiresAt) {
    room.status = 'EXPIRED';
    room.messages = [];
  }

  // Ensure maxMembers and plan exist
  if (!room.plan) room.plan = 'FREE';
  if (!room.maxMembers) room.maxMembers = room.maxParticipants || getMaxRoomMembers(room.plan);
  room.maxParticipants = room.maxMembers;
  room.currentMembers = room.participants ? room.participants.length : 0;

  return room;
}

export function getOrCreateRoom(roomCode: string, creatorName: string = 'TempLink Host'): Room {
  const existing = getRoom(roomCode);
  if (existing) return existing;
  return createRoom({
    durationMinutes: 30,
    creatorName,
    customCode: roomCode,
  });
}

export function getAllActiveRooms(): Room[] {
  const now = Date.now();
  const active: Room[] = [];
  for (const [, room] of globalRooms.entries()) {
    if (room.status !== 'EXPIRED' && room.status !== 'ENDED' && room.expiresAt > now) {
      active.push(room);
    }
  }
  return active;
}

export function updateRoom(roomCode: string, updates: Partial<Room>): Room | null {
  const code = roomCode.toUpperCase().trim();
  const room = getRoom(code);
  if (!room) return null;

  Object.assign(room, updates);
  globalRooms.set(code, room);
  return room;
}

export function deleteRoom(roomCode: string): boolean {
  const code = roomCode.toUpperCase().trim();
  const room = globalRooms.get(code);
  if (room) {
    room.status = 'ENDED';
    room.messages = [];
    room.participants = [];
  }
  return globalRooms.delete(code);
}

export function validateRoom(roomCode: string): {
  valid: boolean;
  status?: 'valid' | 'expired' | 'full' | 'ended' | 'invalid';
  error?: string;
  code?: string;
  room?: Partial<Room>;
  currentMembers?: number;
  maxMembers?: number;
  plan?: RoomPlan;
} {
  const code = roomCode.toUpperCase().trim();
  const room = getRoom(code);

  if (!room) {
    return { valid: false, status: 'invalid', error: 'Room does not exist or has expired.' };
  }

  if (room.status === 'EXPIRED' || room.status === 'ENDED' || Date.now() >= room.expiresAt) {
    return { valid: false, status: 'expired', error: 'This room has already expired and was securely erased.' };
  }

  const maxMembers = room.maxMembers || room.maxParticipants || getMaxRoomMembers(room.plan);

  if (room.participants.length >= maxMembers) {
    return {
      valid: false,
      status: 'full',
      code: 'ROOM_FULL',
      error: `This room has reached its ${maxMembers}-member limit for the ${room.plan || 'Free'} plan.`,
      currentMembers: room.participants.length,
      maxMembers,
      plan: room.plan || 'FREE',
    };
  }

  return {
    valid: true,
    status: 'valid',
    currentMembers: room.participants.length,
    maxMembers,
    plan: room.plan || 'FREE',
    room: {
      id: room.id,
      roomCode: room.roomCode,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      durationMinutes: room.durationMinutes,
      plan: room.plan,
      maxMembers,
      maxParticipants: maxMembers,
      currentMembers: room.participants.length,
      passwordProtected: room.passwordProtected,
      status: room.status,
      creatorName: room.creatorName,
      joinUrl: room.joinUrl,
      participants: room.participants,
    },
  };
}

export function joinRoom(
  roomCode: string,
  participantId: string,
  displayName: string,
  password?: string
): { success: boolean; error?: string; code?: string; room?: Room; participant?: Participant } {
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

  const maxMembers = room.maxMembers || room.maxParticipants || getMaxRoomMembers(room.plan);

  let participant = room.participants.find((p) => p.participantId === participantId);
  if (!participant) {
    if (room.participants.length >= maxMembers) {
      return {
        success: false,
        code: 'ROOM_FULL',
        error: `Room is already full (maximum ${maxMembers} members reached for ${room.plan || 'Free'} plan).`,
      };
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
    room.currentMembers = room.participants.length;

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
  type: 'text' | 'file' | 'system' = 'text'
): { success: boolean; message?: Message; error?: string } {
  const room = getRoom(roomCode);
  if (!room || room.status === 'EXPIRED' || room.status === 'ENDED') {
    return { success: false, error: 'Room not found or has expired' };
  }

  const message: Message = {
    id: generateId(),
    roomCode: room.roomCode,
    senderId,
    senderName,
    content,
    timestamp: Date.now(),
    type: file ? 'file' : type,
    file,
  };

  room.messages.push(message);
  if (room.messages.length > 100) {
    room.messages = room.messages.slice(-100);
  }
  return { success: true, message };
}

export function endRoom(roomCode: string, requestedBy?: string): { success: boolean; error?: string } {
  const code = roomCode.toUpperCase().trim();
  const room = globalRooms.get(code);
  if (!room) return { success: false, error: 'Room not found' };

  room.status = 'ENDED';
  room.messages = [];
  return { success: true };
}

export function formatTimeRemaining(expiresAt: number): {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpiringSoon: boolean;
  isExpired: boolean;
  status: 'normal' | 'warning' | 'critical' | 'expired';
} {
  const now = Date.now();
  const diff = Math.max(0, expiresAt - now);
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  let status: 'normal' | 'warning' | 'critical' | 'expired' = 'normal';
  if (totalSeconds === 0) status = 'expired';
  else if (totalSeconds <= 60) status = 'critical';
  else if (totalSeconds <= 300) status = 'warning';

  return {
    totalSeconds,
    minutes,
    seconds,
    formatted: `${mm}:${ss}`,
    isExpiringSoon: totalSeconds > 0 && totalSeconds <= 300,
    isExpired: totalSeconds === 0,
    status,
  };
}
