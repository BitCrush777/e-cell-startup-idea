import { Room, Participant, Message, RoomPlan } from '@/types';
import { getJoinUrl } from '@/lib/urls';
import { getMaxRoomMembers } from '@/lib/plans';

// API Base URL (Configurable for Cloudflare Worker URL or local Next.js proxy)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export interface CreateRoomParams {
  durationMinutes?: number;
  duration?: number;
  plan?: RoomPlan;
  maxMembers?: number;
  maxParticipants?: number;
  participantLimit?: number;
  passwordProtected?: boolean;
  requirePassword?: boolean;
  password?: string;
  allowFiles?: boolean;
  allowFileSharing?: boolean;
  notifyExpiration?: boolean;
  creatorParticipantId?: string;
  creatorName?: string;
  requestId?: string;
}

export type ValidationStatus = 'valid' | 'not_found' | 'expired' | 'full' | 'ended' | 'terminated' | 'error';

export interface RoomValidationResult {
  valid: boolean;
  status: ValidationStatus;
  error?: string;
  code?: string;
  room?: Room;
  currentMembers?: number;
  maxMembers?: number;
  plan?: RoomPlan;
}

export async function createRoom(params: CreateRoomParams): Promise<Room> {
  const durationMinutes = params.durationMinutes || (params.duration ? Math.floor(params.duration / 60) : 30);
  const requestId = params.requestId || 'req_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const plan: RoomPlan = (params.plan || 'FREE').toUpperCase() as RoomPlan;
  const maxMembers = params.maxMembers || params.maxParticipants || params.participantLimit || getMaxRoomMembers(plan);

  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      durationMinutes,
      plan,
      maxMembers,
      maxParticipants: maxMembers,
      passwordProtected: params.passwordProtected || params.requirePassword,
      password: params.password,
      allowFiles: params.allowFiles !== false && params.allowFileSharing !== false,
      notifyExpiration: params.notifyExpiration !== false,
      creatorParticipantId: params.creatorParticipantId,
      creatorName: params.creatorName,
      requestId,
    }),
  });

  const data: any = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create room');
  }

  const room: Room = data.room;
  room.joinUrl = getJoinUrl(room.roomCode);
  if (!room.plan) room.plan = plan;
  if (!room.maxMembers) room.maxMembers = maxMembers;
  room.maxParticipants = room.maxMembers;

  return room;
}

export async function getRoom(roomCode: string): Promise<Room> {
  const code = roomCode.toUpperCase().trim();

  const res = await fetch(`${API_BASE_URL}/api/rooms/${code}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const data: any = await res.json();
  if (!res.ok || !data.success) {
    const err = new Error(data.code || data.error || 'Room not found or has expired');
    (err as any).code = data.code;
    throw err;
  }

  const room: Room = data.room || data;
  room.joinUrl = getJoinUrl(room.roomCode);
  if (!room.plan) room.plan = 'FREE';
  if (!room.maxMembers) room.maxMembers = room.maxParticipants || getMaxRoomMembers(room.plan);
  room.maxParticipants = room.maxMembers;

  return room;
}

export async function validateRoom(roomCode: string): Promise<RoomValidationResult> {
  const code = roomCode.toUpperCase().trim();
  if (!code || code.length < 4) {
    return { valid: false, status: 'not_found', error: 'Please enter a valid room code.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${code}/validate`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data: any = await res.json();
    if (!res.ok || !data.valid || !data.room) {
      const errText = (data.error || '').toLowerCase();
      if (errText.includes('violation') || errText.includes('terminated') || data.code === 'ROOM_TERMINATED') {
        return {
          valid: false,
          status: 'terminated',
          code: 'ROOM_TERMINATED',
          error: "This room was closed because of repeated violations of the conversation guidelines.",
        };
      }
      if (errText.includes('expired')) {
        return { valid: false, status: 'expired', error: 'This room has expired.' };
      }
      if (errText.includes('full') || data.code === 'ROOM_FULL') {
        const max = data.maxMembers || 3;
        const p = data.plan || 'Free';
        return {
          valid: false,
          status: 'full',
          code: 'ROOM_FULL',
          currentMembers: data.currentMembers || max,
          maxMembers: max,
          plan: p,
          error: `This ${p} room has reached its ${max}-member limit.`,
        };
      }
      if (errText.includes('ended')) {
        return { valid: false, status: 'ended', error: 'This room is no longer active.' };
      }
      return { valid: false, status: 'not_found', error: 'Room not found.' };
    }

    const room: Room = data.room;
    const maxMembers = room.maxMembers || room.maxParticipants || getMaxRoomMembers(room.plan);
    const plan = room.plan || 'FREE';

    if (Date.now() >= room.expiresAt || room.status === 'EXPIRED') {
      return { valid: false, status: 'expired', error: 'This room has expired.' };
    }

    if (room.participants && room.participants.length >= maxMembers) {
      return {
        valid: false,
        status: 'full',
        code: 'ROOM_FULL',
        currentMembers: room.participants.length,
        maxMembers,
        plan,
        error: `This ${plan} room has reached its ${maxMembers}-member limit.`,
      };
    }

    return { valid: true, status: 'valid', room, currentMembers: room.participants?.length || 1, maxMembers, plan };
  } catch (err: any) {
    // Fallback direct room fetch check
    try {
      const room = await getRoom(code);
      const maxMembers = room.maxMembers || room.maxParticipants || getMaxRoomMembers(room.plan);
      const plan = room.plan || 'FREE';

      if (Date.now() >= room.expiresAt || room.status === 'EXPIRED') {
        return { valid: false, status: 'expired', error: 'This room has expired.' };
      }
      if (room.participants && room.participants.length >= maxMembers) {
        return {
          valid: false,
          status: 'full',
          code: 'ROOM_FULL',
          currentMembers: room.participants.length,
          maxMembers,
          plan,
          error: `This ${plan} room has reached its ${maxMembers}-member limit.`,
        };
      }
      return { valid: true, status: 'valid', room, currentMembers: room.participants?.length || 1, maxMembers, plan };
    } catch {
      return { valid: false, status: 'not_found', error: 'Room not found.' };
    }
  }
}

export async function joinRoom(
  roomCode: string,
  participantId: string,
  displayName: string,
  password?: string
): Promise<{ room: Room; participant: Participant }> {
  const code = roomCode.toUpperCase().trim();
  const res = await fetch(`${API_BASE_URL}/api/rooms/${code}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'join',
      participantId,
      displayName,
      password: password || undefined,
    }),
  });

  const data: any = await res.json();
  if (!res.ok || !data.success) {
    const err: any = new Error(data.error || 'Failed to join room');
    err.code = data.code;
    err.currentMembers = data.currentMembers;
    err.maxMembers = data.maxMembers;
    err.plan = data.plan;
    throw err;
  }

  return { room: data.room, participant: data.participant };
}

export async function sendMessage(
  roomCode: string,
  senderId: string,
  senderName: string,
  content: string,
  file?: any,
  msgId?: string
): Promise<Message> {
  const code = roomCode.toUpperCase().trim();
  const res = await fetch(`${API_BASE_URL}/api/rooms/${code}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: msgId,
      senderId,
      senderName,
      content,
      file,
    }),
  });

  const data: any = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to send message');
  }

  return data.message;
}

export async function endRoom(roomCode: string, requestedBy?: string): Promise<boolean> {
  const code = roomCode.toUpperCase().trim();
  const res = await fetch(`${API_BASE_URL}/api/rooms/${code}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'end',
      requestedBy,
    }),
  });

  const data: any = await res.json();
  return res.ok && data.success;
}

export async function getActiveRooms(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data: any = await res.json();
    if (res.ok && data.success) {
      return data.rooms || [];
    }
  } catch {}
  return [];
}
