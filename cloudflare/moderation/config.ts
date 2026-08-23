/**
 * SafeRoom Moderation System Configuration
 * Version: 2026.08.1
 */

export const MODERATION_DICTIONARY_VERSION = '2026.08.1' as const;

export type ModerationCategory =
  | 'PROFANITY'
  | 'HARASSMENT'
  | 'THREATS'
  | 'SEXUAL_ABUSE'
  | 'HATEFUL_LANGUAGE'
  | 'SLURS'
  | 'PERSONAL_ATTACKS'
  | 'SPAM_ABUSE';

export type ModerationSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SafeRoomSettings {
  readonly enabled: boolean;
  readonly maxWarnings: number;
  readonly terminateOnViolationNumber: number;
  readonly messageMaxLength: number;
  readonly rateLimitWindowMs: number;
  readonly maxMessagesPerWindow: number;
  readonly enabledCategories: readonly ModerationCategory[];
  readonly severityActions: Record<ModerationSeverity, 'WARN' | 'BLOCK_AND_WARN' | 'TERMINATE'>;
}

export const SAFE_ROOM_CONFIG: SafeRoomSettings = {
  enabled: true,
  maxWarnings: 2, // Violation 1: Warning 1, Violation 2: Final Warning (2/2)
  terminateOnViolationNumber: 3, // Violation 3: Immediate Room Closure
  messageMaxLength: 10000,
  rateLimitWindowMs: 1000,
  maxMessagesPerWindow: 5,
  enabledCategories: [
    'PROFANITY',
    'HARASSMENT',
    'THREATS',
    'SEXUAL_ABUSE',
    'HATEFUL_LANGUAGE',
    'SLURS',
    'PERSONAL_ATTACKS',
    'SPAM_ABUSE',
  ] as const,
  severityActions: {
    LOW: 'WARN',
    MEDIUM: 'BLOCK_AND_WARN',
    HIGH: 'BLOCK_AND_WARN',
  } as const,
} as const;
