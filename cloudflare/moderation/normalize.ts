/**
 * Normalization & De-Obfuscation Pipeline for SafeRoom Moderation.
 * Pure internal moderation comparison strings — never modifies displayed client messages.
 */

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

export interface NormalizedMessageVariants {
  /** Cleaned standard text with single-space normalization */
  readonly normalized: string;
  /** Collapsed single-character tokens (e.g. "f u c k" -> "fuck", "b.i.t.c.h" -> "bitch") */
  readonly compact: string;
  /** Collapsed consecutive repeating character runs (e.g. "fuuuuuck" -> "fuck") */
  readonly collapsedRuns: string;
  /** Stripped alphanumeric-only string for contiguous phrase search */
  readonly stripped: string;
}

/**
 * Normalizes an incoming raw string for multi-pass moderation matching.
 */
export function normalizeMessage(raw: string): NormalizedMessageVariants {
  if (!raw || typeof raw !== 'string') {
    return { normalized: '', compact: '', collapsedRuns: '', stripped: '' };
  }

  // 1. Unicode decomposition and lowercasing
  let text = raw.normalize('NFKD').toLowerCase();

  // 2. Remove zero-width characters and invisible control codepoints
  text = text.replace(/[\u200B-\u200D\uFEFF\u0000-\u001F\u007F-\u009F]/g, '');

  // 3. Conservative leetspeak de-obfuscation
  let deobfuscated = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    deobfuscated += LEET_MAP[char] || char;
  }

  // 4. Normalized whitespace
  const normalized = deobfuscated.replace(/\s+/g, ' ').trim();

  // 5. Collapsed repeating runs (e.g. "fuuuuuck" -> "fuck", "shiiiit" -> "shit", leaving max 2 repeats)
  const collapsedRuns = normalized.replace(/(.)\1{2,}/g, '$1$1');

  // 6. Token-level single character collapse (e.g. "what the f u c k" -> "what the fuck")
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

  // 7. Stripped alphanumeric form
  const stripped = normalized.replace(/[^a-z0-9]/gi, '');

  return {
    normalized,
    compact,
    collapsedRuns,
    stripped,
  };
}
