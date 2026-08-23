import { ModerationRule } from '../provider';

/**
 * English Curated Moderation Rules.
 * Strict word boundaries (\b) and regex structures to prevent false positives on legitimate language.
 */
export const ENGLISH_RULES: readonly ModerationRule[] = [
  // ==========================================
  // PROFANITY (PROFANITY_xxx)
  // ==========================================
  {
    id: 'PROFANITY_001',
    category: 'PROFANITY',
    severity: 'HIGH',
    pattern: /\b(f+u+c+k+|f+u+c+k+i+n+g+|f+u+k+i+n+g+|m+o+t+h+e+r+f+u+c+k+e+r+|w+t+f+)\b/i,
    description: 'Severe vulgar profanity',
    lang: 'en',
  },
  {
    id: 'PROFANITY_002',
    category: 'PROFANITY',
    severity: 'MEDIUM',
    pattern: /\b(s+h+i+t+|b+u+l+l+s+h+i+t+|d+i+p+s+h+i+t+|h+o+l+y+s+h+i+t+)\b/i,
    description: 'Excrement-based vulgarity',
    lang: 'en',
  },
  {
    id: 'PROFANITY_003',
    category: 'PROFANITY',
    severity: 'MEDIUM',
    pattern: /\b(a+s+s+h+o+l+e+|b+a+s+t+a+r+d+|j+a+c+k+a+s+s+|d+u+m+b+a+s+s+)\b/i,
    description: 'Vulgar insults',
    lang: 'en',
  },
  {
    id: 'PROFANITY_004',
    category: 'PROFANITY',
    severity: 'HIGH',
    pattern: /\b(d+i+c+k+h+e+a+d+|c+o+c+k+s+u+c+k+e+r+|c+u+n+t+|t+w+a+t+)\b/i,
    description: 'Severe anatomical profanity',
    lang: 'en',
  },
  {
    id: 'PROFANITY_005',
    category: 'PROFANITY',
    severity: 'LOW',
    pattern: /\b(d+a+m+n+|c+r+a+p+|p+i+s+s+|p+i+s+s+e+d+)\b/i,
    description: 'Mild vulgarity',
    lang: 'en',
  },

  // ==========================================
  // HARASSMENT (HARASSMENT_xxx)
  // ==========================================
  {
    id: 'HARASSMENT_001',
    category: 'HARASSMENT',
    severity: 'HIGH',
    pattern: /\b(b+i+t+c+h+|b+i+t+c+h+e+s+|b+i+t+c+h+i+n+g+)\b/i,
    description: 'Degrading harassment epithet',
    lang: 'en',
  },
  {
    id: 'HARASSMENT_002',
    category: 'HARASSMENT',
    severity: 'HIGH',
    pattern: /\b(s+l+u+t+|w+h+o+r+e+|s+k+a+n+k+|h+o+e+s+)\b/i,
    description: 'Sexualized harassment and degradation',
    lang: 'en',
  },
  {
    id: 'HARASSMENT_003',
    category: 'HARASSMENT',
    severity: 'HIGH',
    pattern: /\b(nobody\s*(likes|loves|cares\s*about)\s*you|everyone\s*hates\s*you|worthless\s*(piece\s*of|trash|scum))\b/i,
    description: 'Severe targeted psychological harassment',
    lang: 'en',
  },
  {
    id: 'HARASSMENT_004',
    category: 'HARASSMENT',
    severity: 'HIGH',
    pattern: /\b(g+o+\s*d+i+e+|j+u+m+p+\s*o+f+f+\s*a+\s*b+r+i+d+g+e+|d+r+i+n+k+\s*b+l+e+a+c+h+)\b/i,
    description: 'Death and self-harm incitement',
    lang: 'en',
  },
  {
    id: 'HARASSMENT_005',
    category: 'HARASSMENT',
    severity: 'HIGH',
    pattern: /\b(k+i+l+l+\s*y+o+u+r+s+e+l+f+|k+i+l+l+\s*u+r+s+e+l+f+|k+y+s+)\b/i,
    description: 'Direct self-harm encouragement',
    lang: 'en',
  },

  // ==========================================
  // THREATS (THREAT_xxx)
  // ==========================================
  {
    id: 'THREAT_001',
    category: 'THREATS',
    severity: 'HIGH',
    pattern: /\b(i(\s*will|\s*m\s*gonna|\s*ll)\s*(kill|murder|slaughter|hunt|destroy|find)(\s*and\s*(kill|murder|slaughter|hunt|destroy))?\s*(you|ur\s*family))\b/i,
    description: 'Direct threat to life and physical safety',
    lang: 'en',
  },
  {
    id: 'THREAT_002',
    category: 'THREATS',
    severity: 'HIGH',
    pattern: /\b(s+l+i+t+\s*(y+o+u+r+|u+r+)\s*t+h+r+o+a+t+|b+e+a+t+\s*y+o+u+\s*t+o+\s*d+e+a+t+h+|s+n+a+p+\s*(y+o+u+r+|u+r+)\s*n+e+c+k+)\b/i,
    description: 'Severe violent threat',
    lang: 'en',
  },
  {
    id: 'THREAT_003',
    category: 'THREATS',
    severity: 'HIGH',
    pattern: /\b(b+o+m+b+\s*(t+h+r+e+a+t+|y+o+u+r+|t+h+i+s+)|s+h+o+o+t+\s*(y+o+u+|u+p+|t+h+i+s+\s*p+l+a+c+e+)|g+u+n+\s*y+o+u+\s*d+o+w+n+)\b/i,
    description: 'Mass casualty and firearm threat',
    lang: 'en',
  },
  {
    id: 'THREAT_004',
    category: 'THREATS',
    severity: 'HIGH',
    pattern: /\b(i\s*know\s*where\s*you\s*live|watch\s*your\s*back|you\s*are\s*dead\s*meat)\b/i,
    description: 'Intimidation and stalking threats',
    lang: 'en',
  },

  // ==========================================
  // SEXUAL_ABUSE (SEXUAL_ABUSE_xxx)
  // ==========================================
  {
    id: 'SEXUAL_ABUSE_001',
    category: 'SEXUAL_ABUSE',
    severity: 'HIGH',
    pattern: /\b(r+a+p+e+\s*(you|her|him|them)|r+a+p+i+s+t+|s+e+x+u+a+l+l+y+\s*a+s+s+a+u+l+t+)\b/i,
    description: 'Sexual assault threats and degradation',
    lang: 'en',
  },
  {
    id: 'SEXUAL_ABUSE_002',
    category: 'SEXUAL_ABUSE',
    severity: 'HIGH',
    pattern: /\b(s+e+n+d+\s*(n+u+d+e+s+|n+a+k+e+d+|p+u+s+s+y+|d+i+c+k+\s*p+i+c+s+)|s+e+x+\s*t+e+x+t+i+n+g+\s*u+)\b/i,
    description: 'Unsolicited explicit sexual solicitation',
    lang: 'en',
  },

  // ==========================================
  // HATEFUL_LANGUAGE (HATE_xxx)
  // ==========================================
  {
    id: 'HATE_001',
    category: 'HATEFUL_LANGUAGE',
    severity: 'HIGH',
    pattern: /\b(h+e+i+l+\s*h+i+t+l+e+r+|n+a+z+i+\s*s+c+u+m+|w+h+i+t+e+\s*p+o+w+e+r+|k+u+\s*k+l+u+x+\s*k+l+a+n+|k+k+k+)\b/i,
    description: 'Hate group affiliation and white supremacist slogans',
    lang: 'en',
  },
  {
    id: 'HATE_002',
    category: 'HATEFUL_LANGUAGE',
    severity: 'HIGH',
    pattern: /\b(g+a+s+\s*t+h+e+\s*j+e+w+s+|d+e+a+t+h+\s*t+o+\s*(a+l+l+|b+l+a+c+k+s+|g+a+y+s+|m+u+s+l+i+m+s+|j+e+w+s+|h+i+n+d+u+s+))\b/i,
    description: 'Genocidal and hate incitement',
    lang: 'en',
  },

  // ==========================================
  // SLURS (SLUR_xxx)
  // ==========================================
  {
    id: 'SLUR_001',
    category: 'SLURS',
    severity: 'HIGH',
    pattern: /\b(n+i+g+g+e+r+|n+i+g+g+a+|n+i+g+l+e+t+|c+o+o+n+)\b/i,
    description: 'Severe racial slur',
    lang: 'en',
  },
  {
    id: 'SLUR_002',
    category: 'SLURS',
    severity: 'HIGH',
    pattern: /\b(f+a+g+g+o+t+|f+a+g+|d+y+k+e+|t+r+a+n+n+y+)\b/i,
    description: 'Severe sexual orientation and gender identity slur',
    lang: 'en',
  },
  {
    id: 'SLUR_003',
    category: 'SLURS',
    severity: 'HIGH',
    pattern: /\b(k+i+k+e+|c+h+i+n+k+|g+o+o+k+|w+e+t+b+a+c+k+|s+p+i+c+|r+a+g+h+e+a+d+)\b/i,
    description: 'Severe ethnic and religious slurs',
    lang: 'en',
  },
  {
    id: 'SLUR_004',
    category: 'SLURS',
    severity: 'HIGH',
    pattern: /\b(r+e+t+a+r+d+|r+e+t+a+r+d+e+d+|l+i+b+t+a+r+d+)\b/i,
    description: 'Ableist and developmental slurs',
    lang: 'en',
  },

  // ==========================================
  // PERSONAL_ATTACKS (PERSONAL_ATTACK_xxx)
  // ==========================================
  {
    id: 'PERSONAL_ATTACK_001',
    category: 'PERSONAL_ATTACKS',
    severity: 'MEDIUM',
    pattern: /\b(you\s*(are|r)\s*(stupid|idiot|moron|retarded|clown|trash|ugly|disgusting|pathetic))\b/i,
    description: 'Direct targeted personal insults',
    lang: 'en',
  },
  {
    id: 'PERSONAL_ATTACK_002',
    category: 'PERSONAL_ATTACKS',
    severity: 'MEDIUM',
    pattern: /\b(shut\s*(the\s*fuck\s*up|up\s*idiot|your\s*mouth\s*bitch)|stfu)\b/i,
    description: 'Aggressive silencing insults',
    lang: 'en',
  },

  // ==========================================
  // SPAM_ABUSE (SPAM_ABUSE_xxx)
  // ==========================================
  {
    id: 'SPAM_ABUSE_001',
    category: 'SPAM_ABUSE',
    severity: 'LOW',
    pattern: /\b(buy\s*followers|free\s*crypto\s*airdrop|claim\s*your\s*free\s*bitcoin|telegram\s*dm\s*me\s*for\s*pills)\b/i,
    description: 'Commercial spam and phishing lures',
    lang: 'en',
  },
];
