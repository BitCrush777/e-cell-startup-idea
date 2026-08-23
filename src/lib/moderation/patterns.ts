import { ModerationRule } from './provider';
import { ModerationCategory, ModerationSeverity } from './config';
import { ALL_MODERATION_RULES } from './languages';

/**
 * Pre-compiled, immutable pattern catalog for high-performance server moderation.
 */
export class ModerationPatternCatalog {
  private readonly rules: readonly ModerationRule[];
  private readonly rulesByCategory: Map<ModerationCategory, ModerationRule[]>;

  constructor(rules: readonly ModerationRule[] = ALL_MODERATION_RULES) {
    this.rules = Object.freeze([...rules]);
    this.rulesByCategory = new Map();

    for (const rule of this.rules) {
      if (!this.rulesByCategory.has(rule.category)) {
        this.rulesByCategory.set(rule.category, []);
      }
      this.rulesByCategory.get(rule.category)!.push(rule);
    }
  }

  getAllRules(): readonly ModerationRule[] {
    return this.rules;
  }

  getRulesByCategory(category: ModerationCategory): readonly ModerationRule[] {
    return this.rulesByCategory.get(category) || [];
  }

  getRulesBySeverity(severity: ModerationSeverity): readonly ModerationRule[] {
    return this.rules.filter((r) => r.severity === severity);
  }
}

export const defaultPatternCatalog = new ModerationPatternCatalog();
