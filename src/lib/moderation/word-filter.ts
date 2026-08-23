import { ModerationProvider, ModerationResult, ModerationCategory } from './config';

/**
 * Server-only prohibited patterns grouped by violation category.
 * Strictly bounded and normalized to prevent false positives (e.g. "pass", "assassin", "classic").
 */
interface ProhibitedRule {
  pattern: RegExp;
  category: ModerationCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Leetspeak substitution map for de-obfuscation
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'l',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  'v': 'u',
};

/**
 * Server-side prohibited rules using word boundaries (\b)
 * to ensure normal innocent vocabulary is never falsely flagged.
 */
const PROHIBITED_RULES: ProhibitedRule[] = [
  // Profanity & Vulgar Abuse
  { pattern: /\b(f+u+c+k+|f+u+c+k+i+n+g+|f+u+k+i+n+g+|m+o+t+h+e+r+f+u+c+k+e+r+|w+t+f+)\b/i, category: 'PROFANITY', severity: 'HIGH' },
  { pattern: /\b(s+h+i+t+|b+u+l+l+s+h+i+t+|d+i+p+s+h+i+t+)\b/i, category: 'PROFANITY', severity: 'MEDIUM' },
  { pattern: /\b(b+i+t+c+h+|b+i+t+c+h+e+s+|b+i+t+c+h+i+n+g+)\b/i, category: 'HARASSMENT', severity: 'HIGH' },
  { pattern: /\b(a+s+s+h+o+l+e+|b+a+s+t+a+r+d+)\b/i, category: 'PROFANITY', severity: 'MEDIUM' },
  { pattern: /\b(d+i+c+k+h+e+a+d+|c+o+c+k+s+u+c+k+e+r+|c+u+n+t+)\b/i, category: 'PROFANITY', severity: 'HIGH' },
  
  // Threats & Violence
  { pattern: /\b(i\s*will\s*kill\s*you|kill\s*yourself|k+y+s+|murder\s*you|slit\s*your\s*throat|die\s*in\s*a\s*fire)\b/i, category: 'THREATS', severity: 'HIGH' },
  { pattern: /\b(i\s*will\s*hunt\s*you|bomb\s*threat|shoot\s*you|shoot\s*up)\b/i, category: 'THREATS', severity: 'HIGH' },
  
  // Hateful & Slur Content
  { pattern: /\b(n+i+g+g+e+r+|n+i+g+g+a+|f+a+g+g+o+t+|k+i+k+e+|c+h+i+n+k+|r+e+t+a+r+d+)\b/i, category: 'HATEFUL_CONTENT', severity: 'HIGH' },
  { pattern: /\b(h+e+i+l\s*h+i+t+l+e+r+|n+a+z+i\s*scum|white\s*power\s*movement)\b/i, category: 'HATEFUL_CONTENT', severity: 'HIGH' },
  
  // Harassment & Severe Degradation
  { pattern: /\b(go\s*die|nobody\s*loves\s*you|kill\s*urself|jump\s*off\s*a\s*bridge)\b/i, category: 'HARASSMENT', severity: 'HIGH' },
];

/**
 * Normalizes text to detect obfuscation:
 * - Unicode NFKD decomposition
 * - Lowercasing
 * - Leetspeak mapping
 * - Collapsing spaced out letters (e.g., "f u c k" -> "fuck", "b.i.t.c.h" -> "bitch", "k-y-s" -> "kys")
 */
export function normalizeMessage(raw: string): { normalized: string; compact: string } {
  if (!raw) return { normalized: '', compact: '' };

  // 1. Unicode normalization and lowercase
  let text = raw.normalize('NFKD').toLowerCase();

  // 2. Remove zero-width characters and invisible control characters
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 3. Leetspeak conversion
  let deobfuscated = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    deobfuscated += LEET_MAP[char] || char;
  }

  const normalized = deobfuscated.replace(/\s+/g, ' ').trim();

  // 4. Token-level normalization collapsing separated single letters & punctuation
  const tokens = normalized.split(/\s+/);
  const mergedTokens: string[] = [];
  let singleCharBuffer = '';

  for (const token of tokens) {
    const cleanToken = token.replace(/[^a-z0-9]/gi, '');
    if (cleanToken.length === 1) {
      singleCharBuffer += cleanToken;
    } else {
      if (singleCharBuffer) {
        mergedTokens.push(singleCharBuffer);
        singleCharBuffer = '';
      }
      if (cleanToken.length > 0) {
        mergedTokens.push(cleanToken);
      }
    }
  }
  if (singleCharBuffer) {
    mergedTokens.push(singleCharBuffer);
  }

  const compact = mergedTokens.join(' ');

  return { normalized, compact };
}

/**
 * WordFilterModerationProvider implements ModerationProvider
 * with conservative, false-positive-safe matching.
 */
export class WordFilterModerationProvider implements ModerationProvider {
  moderate(content: string): ModerationResult {
    if (!content || typeof content !== 'string') {
      return { allowed: true };
    }

    const { normalized, compact } = normalizeMessage(content);

    // Test rules against normalized and de-obfuscated forms
    for (const rule of PROHIBITED_RULES) {
      if (rule.pattern.test(normalized) || rule.pattern.test(compact)) {
        return {
          allowed: false,
          category: rule.category,
          severity: rule.severity,
          reason: 'POLICY_VIOLATION',
        };
      }
    }

    return { allowed: true };
  }
}

// Singleton instance for server-side usage
export const defaultModerator = new WordFilterModerationProvider();
