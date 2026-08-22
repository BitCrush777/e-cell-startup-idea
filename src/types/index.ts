export type RoomStatus =
  | 'WAITING'
  | 'ACTIVE'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'ENDED'
  | 'waiting'
  | 'active'
  | 'expiring'
  | 'expired'
  | 'ended';

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

export interface Room {
  id: string;             // Internal authoritative room ID (UUID / crypto string)
  roomId?: string;        // Alias for id
  roomCode: string;       // Public human-friendly code (e.g. K7XM-4P2Q)
  joinUrl: string;        // Dynamic join URL (e.g. https://templink.app/join/K7XM-4P2Q)
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  maxParticipants: number;
  participantLimit?: number;
  passwordProtected: boolean;
  password?: string;
  allowFiles: boolean;
  notifyExpiration: boolean;
  status: RoomStatus;
  createdBy: string;      // Creator's participantId
  creatorName: string;
  participants: Participant[];
  messages: Message[];
}

export type RoomEvent =
  | { type: 'participant_joined'; roomCode: string; participant: Participant }
  | { type: 'participant_left'; roomCode: string; participantId: string; participantName?: string }
  | { type: 'message'; roomCode: string; message: Message }
  | { type: 'typing'; roomCode: string; participantId: string; displayName?: string; typing: boolean }
  | { type: 'typing_start'; roomCode: string; participantId: string; participantName?: string }
  | { type: 'typing_stop'; roomCode: string; participantId: string; participantName?: string }
  | { type: 'room_state'; roomCode: string; state: Partial<Room> }
  | { type: 'room_expiring'; roomCode: string; remainingSeconds: number }
  | { type: 'room_expired'; roomCode: string; reason: string }
  | { type: 'room_ended'; roomCode: string; reason: string }
  | { type: 'connection_status'; status: 'connected' | 'reconnecting' | 'disconnected' }
  | { type: 'ping' }
  | { type: 'pong'; timestamp: number };

export type UserPlan = 'FREE' | 'PRO' | 'BUSINESS';

export interface User {
  id: string;
  email: string;
  displayName: string;
  plan: UserPlan;
  createdAt: number;
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'free' | 'pro' | 'business';
  createdAt: number;
  roomsCreatedCount: number;
}
