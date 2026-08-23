export type RoomStatus =
  | 'WAITING'
  | 'ACTIVE'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'ENDED'
  | 'MODERATION_TERMINATED'
  | 'waiting'
  | 'active'
  | 'expiring'
  | 'expired'
  | 'ended'
  | 'moderation_terminated';

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

export type RoomPlan = 'FREE' | 'PRO' | 'BUSINESS';

export interface Room {
  id: string;             // Internal authoritative room ID (UUID / crypto string)
  roomId?: string;        // Alias for id
  roomCode: string;       // Public human-friendly code (e.g. K7XM-4P2Q)
  joinUrl: string;        // Dynamic join URL (e.g. https://templink.in/join/K7XM-4P2Q)
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  plan: RoomPlan;         // Subscription tier: FREE (3), PRO (10), BUSINESS (25+)
  maxMembers: number;     // Authoritative maximum members
  maxParticipants: number;// Compatibility alias for maxMembers
  currentMembers?: number;// Active member count
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
  | { type: 'participant_joined'; roomCode: string; participant: Participant; currentMembers?: number; maxMembers?: number }
  | { type: 'participant_left'; roomCode: string; participantId: string; participantName?: string; currentMembers?: number; maxMembers?: number }
  | { type: 'message'; roomCode: string; message: Message }
  | { type: 'typing'; roomCode: string; participantId: string; displayName?: string; typing: boolean }
  | { type: 'typing_start'; roomCode: string; participantId: string; participantName?: string }
  | { type: 'typing_stop'; roomCode: string; participantId: string; participantName?: string }
  | { type: 'room_state'; roomCode: string; state: Partial<Room> }
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
