import { ModerationProvider, ModerationResult, ModerationRule } from './provider';
import { MODERATION_DICTIONARY_VERSION, SAFE_ROOM_CONFIG } from './config';
import { normalizeMessage } from './normalize';
import { defaultPatternCatalog, ModerationPatternCatalog } from './patterns';

/**
 * WordFilterModerationProvider
 * High-performance, server-authoritative pattern moderation provider with
 * de-obfuscation and false-positive protection.
 */
export class WordFilterModerationProvider implements ModerationProvider {
  readonly id = 'word-filter';
  readonly version = MODERATION_DICTIONARY_VERSION;
  private readonly catalog: ModerationPatternCatalog;

  constructor(catalog: ModerationPatternCatalog = defaultPatternCatalog) {
    this.catalog = catalog;
  }

  moderate(content: string): ModerationResult {
    if (!SAFE_ROOM_CONFIG.enabled) {
      return { allowed: true };
    }

    if (!content || typeof content !== 'string') {
      return { allowed: true };
    }

    const { normalized, compact, collapsedRuns } = normalizeMessage(content);

    // Fast O(N) evaluation against precompiled rules
    const rules = this.catalog.getAllRules();
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (
        rule.pattern.test(normalized) ||
        rule.pattern.test(compact) ||
        rule.pattern.test(collapsedRuns)
      ) {
        return {
          allowed: false,
          category: rule.category,
          severity: rule.severity,
          matchedRuleId: rule.id,
          reason: 'POLICY_VIOLATION',
        };
      }
    }

    return { allowed: true };
  }
}

export const defaultModerator = new WordFilterModerationProvider();
export { normalizeMessage } from './normalize';
export { SAFE_ROOM_CONFIG, MODERATION_DICTIONARY_VERSION } from './config';
export type { ModerationCategory, ModerationSeverity, SafeRoomSettings } from './config';
export type { ModerationResult, ModerationRule, ModerationProvider } from './provider';
