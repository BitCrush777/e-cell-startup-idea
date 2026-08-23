import { ENGLISH_RULES } from './en';
import { HINDI_RULES } from './hi';
import { ModerationRule } from '../provider';

export const ALL_MODERATION_RULES: readonly ModerationRule[] = [
  ...ENGLISH_RULES,
  ...HINDI_RULES,
];
