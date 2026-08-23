import { ModerationCategory, ModerationSeverity } from './config';

export interface ModerationRule {
  readonly id: string;
  readonly category: ModerationCategory;
  readonly severity: ModerationSeverity;
  readonly pattern: RegExp;
  readonly description?: string;
  readonly lang?: string;
}

export interface ModerationResult {
  readonly allowed: boolean;
  readonly category?: ModerationCategory;
  readonly severity?: ModerationSeverity;
  readonly matchedRuleId?: string;
  readonly reason?: string;
}

/**
 * ModerationProvider interface.
 * Allows switching or compounding providers (e.g. WordFilterProvider -> ContextualModerationProvider).
 */
export interface ModerationProvider {
  readonly id: string;
  readonly version: string;
  moderate(content: string, context?: Record<string, unknown>): Promise<ModerationResult> | ModerationResult;
}
