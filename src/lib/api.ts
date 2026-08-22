import { Room, Participant, Message } from '@/types';

// API Base URL (Configurable for Cloudflare Worker URL or local Next.js proxy)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export interface CreateRoomParams {
  durationMinutes?: number;
  duration?: number;
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

export type ValidationStatus = 'valid' | 'not_found' | 'expired' | 'full' | 'ended' | 'error';

export interface RoomValidationResult {
  valid: boolean;
  status: ValidationStatus;
  error?: string;
  room?: Room;
}

export async function createRoom(params: CreateRoomParams): Promise<Room> {
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://templink.in');
  const durationMinutes = params.durationMinutes || (params.duration ? Math.floor(params.duration / 60) : 30);
  const requestId = params.requestId || 'req_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      durationMinutes,
      maxParticipants: params.maxParticipants || params.participantLimit || 2,
      passwordProtected: Boolean(params.passwordProtected || params.requirePassword),
      password: params.password || '',
      allowFiles: Boolean(params.allowFiles || params.allowFileSharing),
      notifyExpiration: params.notifyExpiration !== false,
      creatorParticipantId: params.creatorParticipantId,
      creatorName: params.creatorName || 'Creator',
      requestId,
      baseUrl: origin,
    }),
  });

  const data: any = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Unable to create room. Please try again.');
  }

  const room: Room = data.room || data;
  if (!room.joinUrl) {
    room.joinUrl = `${origin}/join/${room.roomCode}`;
  }

  return room;
}

export async function getRoom(roomCode: string): Promise<Room> {
  const code = roomCode.toUpperCase().trim();
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://templink.in');

  const res = await fetch(`${API_BASE_URL}/api/rooms/${code}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const data: any = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Room not found or has expired');
  }

  const room: Room = data.room || data;
  if (!room.joinUrl) {
    room.joinUrl = `${origin}/join/${room.roomCode}`;
  }

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
      if (errText.includes('expired')) {
        return { valid: false, status: 'expired', error: 'This room has expired.' };
      }
      if (errText.includes('full')) {
        return { valid: false, status: 'full', error: 'This room is already full.' };
      }
      if (errText.includes('ended')) {
        return { valid: false, status: 'ended', error: 'This room is no longer active.' };
      }
      return { valid: false, status: 'not_found', error: 'Room not found.' };
    }

    const room: Room = data.room;
    if (Date.now() >= room.expiresAt || room.status === 'EXPIRED') {
      return { valid: false, status: 'expired', error: 'This room has expired.' };
    }

    if (room.participants && room.participants.length >= (room.maxParticipants || 2)) {
      return { valid: false, status: 'full', error: 'This room is already full (2/2 participants).' };
    }

    return { valid: true, status: 'valid', room };
  } catch (err: any) {
    // Fallback direct room fetch check
    try {
      const room = await getRoom(code);
      if (Date.now() >= room.expiresAt || room.status === 'EXPIRED') {
        return { valid: false, status: 'expired', error: 'This room has expired.' };
      }
      if (room.participants && room.participants.length >= (room.maxParticipants || 2)) {
        return { valid: false, status: 'full', error: 'This room is already full (2/2 participants).' };
      }
      return { valid: true, status: 'valid', room };
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
    throw new Error(data.error || 'Failed to join room');
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
