export const SAFE_ROOM_CONFIG = {
  enabled: true,
  maxWarnings: 2, // Violation #1: Warning 1, Violation #2: Final Warning (2/2)
  terminateOnViolationNumber: 3, // Violation #3: Room Terminated
  messageMaxLength: 10000,
  rateLimitWindowMs: 1000,
  maxMessagesPerWindow: 5,
} as const;

export type ModerationCategory =
  | 'PROFANITY'
  | 'HARASSMENT'
  | 'THREATS'
  | 'HATEFUL_CONTENT'
  | 'SPAM';

export interface ModerationResult {
  allowed: boolean;
  category?: ModerationCategory;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  reason?: string;
}

export interface ModerationProvider {
  moderate(content: string): Promise<ModerationResult> | ModerationResult;
}
