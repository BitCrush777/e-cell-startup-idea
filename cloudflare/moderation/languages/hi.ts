import { ModerationRule } from '../provider';

/**
 * Hindi / Hinglish Curated Moderation Rules.
 * Prepared for Indian market expansion with strict transliteration word boundaries.
 */
export const HINDI_RULES: readonly ModerationRule[] = [
  {
    id: 'HI_PROFANITY_001',
    category: 'PROFANITY',
    severity: 'HIGH',
    pattern: /\b(m+a+d+a+r+c+h+o+d+|m+c+|b+e+h+e+n+c+h+o+d+|b+c+|b+h+o+s+d+i+k+e+|b+h+o+s+a+d+i+k+e+)\b/i,
    description: 'Severe Hindi vulgar profanity',
    lang: 'hi',
  },
  {
    id: 'HI_PROFANITY_002',
    category: 'PROFANITY',
    severity: 'HIGH',
    pattern: /\b(c+h+u+t+i+y+a+|c+h+u+t+i+y+e+|g+a+a+n+d+u+|g+a+n+d+u+|l+a+u+d+a+|l+o+d+a+)\b/i,
    description: 'Vulgar Hindi insults',
    lang: 'hi',
  },
  {
    id: 'HI_HARASSMENT_001',
    category: 'HARASSMENT',
    severity: 'HIGH',
    pattern: /\b(k+u+t+t+i+|r+a+n+d+i+|k+a+m+i+n+e+)\b/i,
    description: 'Degrading Hindi harassment terms',
    lang: 'hi',
  },
  {
    id: 'HI_THREAT_001',
    category: 'THREATS',
    severity: 'HIGH',
    pattern: /\b(j+a+a+n+\s*s+e+\s*m+a+a+r+\s*d+u+n+g+a+|t+e+r+e+\s*k+o+\s*m+a+a+r+\s*d+a+a+l+u+n+g+a+)\b/i,
    description: 'Direct life threats in Hindi',
    lang: 'hi',
  },
];
