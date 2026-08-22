// Clean alphanumeric alphabet without visually ambiguous characters (0, O, 1, I)
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const PREFIXES = [
  'Silver', 'Quiet', 'Blue', 'Pixel', 'Ghost', 'Silent', 'Shadow', 'Echo',
  'Nova', 'Cipher', 'Vortex', 'Neon', 'Cosmic', 'Solar', 'Pulse', 'Zenith',
  'Astral', 'Iron', 'Apex', 'Phantom', 'Velvet', 'Frost', 'Onyx', 'Amber'
];

const SUFFIXES = [
  'Wave', 'Fox', 'Nova', 'Falcon', 'Drift', 'Vortex', 'Byte', 'Hawk',
  'Spark', 'Shield', 'Sentinel', 'Ray', 'Matrix', 'Pulse', 'Beacon', 'Rider',
  'Core', 'Vault', 'Specter', 'Shard', 'Quark', 'Prism', 'Lynx', 'Raven'
];

export function generateTemporaryIdentity(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}${suffix}-${num}`;
}

export function generateShortIdentity(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${prefix}${suffix}`;
}

/**
 * Generates an 8-character human-friendly room code in format XXXX-XXXX
 * Uses unambiguous characters from ABCDEFGHJKLMNPQRSTUVWXYZ23456789
 */
export function generateRoomCode(): string {
  let part1 = '';
  let part2 = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 4; i++) {
      part1 += ROOM_CODE_ALPHABET[bytes[i] % ROOM_CODE_ALPHABET.length];
      part2 += ROOM_CODE_ALPHABET[bytes[i + 4] % ROOM_CODE_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      part1 += ROOM_CODE_ALPHABET.charAt(Math.floor(Math.random() * ROOM_CODE_ALPHABET.length));
      part2 += ROOM_CODE_ALPHABET.charAt(Math.floor(Math.random() * ROOM_CODE_ALPHABET.length));
    }
  }

  return `${part1}-${part2}`;
}

/**
 * Generates an internal cryptographically strong Room ID
 */
export function generateInternalRoomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'room_' + crypto.randomUUID().replace(/-/g, '');
  }
  return 'room_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}

export function generateParticipantId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'p_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12);
  }
  return 'p_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
