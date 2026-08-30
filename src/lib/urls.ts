/**
 * Centralized Application URL, QR Parsing & Normalization Utilities
 */

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://templink.in';
}

export function getJoinUrl(roomCode: string): string {
  const code = normalizeRoomCode(roomCode);
  const base = getAppBaseUrl();
  return `${base}/join/${code}`;
}

export interface ParsedQrResult {
  valid: boolean;
  roomCode?: string;
  joinUrl?: string;
  error?: string;
}

/**
 * Normalizes user input or raw strings into standard XXXX-XXXX format.
 * Example: 'k7xm4p2q' -> 'K7XM-4P2Q', 'k7xm-4p2q' -> 'K7XM-4P2Q', 'K7XM 4P2Q' -> 'K7XM-4P2Q'
 */
export function normalizeRoomCode(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  if (clean.length > 4 && !input.includes('-')) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  }
  if (input.includes('-')) {
    const parts = input.trim().toUpperCase().split('-');
    const p1 = parts[0]?.replace(/[^A-Z0-9]/g, '').slice(0, 4) || '';
    const p2 = parts[1]?.replace(/[^A-Z0-9]/g, '').slice(0, 4) || '';
    return p2 ? `${p1}-${p2}` : p1;
  }
  return clean;
}

/**
 * Robustly extracts a valid room code from a QR payload or returns null.
 * Strictly verifies and prevents arbitrary external URLs.
 */
export function extractRoomCode(payload: string): string | null {
  const result = parseQrContent(payload);
  return result.valid && result.roomCode ? result.roomCode : null;
}

/**
 * Robustly parses and validates scanned QR code content or user input.
 * Protects against arbitrary external URLs and malicious links.
 */
export function parseQrContent(rawContent: string): ParsedQrResult {
  if (!rawContent || typeof rawContent !== 'string') {
    return { valid: false, error: 'Empty or invalid QR code.' };
  }

  const trimmed = rawContent.trim();

  // 1. Check if input is a URL
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const hostname = url.hostname.toLowerCase();

      // Only allow legitimate templink domains, Cloudflare deployments, localhost, or matching origin
      const isAllowedHost =
        hostname === 'templink.in' ||
        hostname === 'www.templink.in' ||
        hostname.endsWith('.templink.in') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.pages.dev') ||
        hostname.endsWith('.workers.dev') ||
        (typeof window !== 'undefined' && (hostname === window.location.hostname || hostname === window.location.host));

      if (!isAllowedHost) {
        return {
          valid: false,
          error: 'This QR code is for an external website and is not a valid TempLink room.',
        };
      }

      // Check path /join/XXXX-XXXX
      const pathMatch = url.pathname.match(/\/join\/([A-Za-z0-9-]+)/i);
      if (pathMatch && pathMatch[1]) {
        const code = normalizeRoomCode(pathMatch[1]);
        if (code && code.length >= 4) {
          return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
        }
      }

      // Check query param ?code=XXXX-XXXX or ?room=XXXX-XXXX
      const queryCode = url.searchParams.get('code') || url.searchParams.get('room');
      if (queryCode) {
        const code = normalizeRoomCode(queryCode);
        if (code && code.length >= 4) {
          return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
        }
      }

      // Check if URL contains an 8-char pattern e.g. /room/XXXX-XXXX
      const anyRoomMatch = url.pathname.match(/([A-Za-z0-9]{4}-[A-Za-z0-9]{4})/i);
      if (anyRoomMatch && anyRoomMatch[1]) {
        const code = normalizeRoomCode(anyRoomMatch[1]);
        return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
      }

      return {
        valid: false,
        error: 'This URL is not a valid TempLink join link.',
      };
    }
  } catch {
    // If not a valid URL, proceed to check as relative path or raw code
  }

  // 2. Check relative path e.g. /join/K7XM-4P2Q
  const relativeMatch = trimmed.match(/^\/?join\/([A-Za-z0-9-]+)/i);
  if (relativeMatch && relativeMatch[1]) {
    const code = normalizeRoomCode(relativeMatch[1]);
    return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
  }

  // 3. Check formatted 8-char code e.g. K7XM-4P2Q
  const formattedCodeMatch = trimmed.match(/^([A-Za-z0-9]{4}-[A-Za-z0-9]{4})$/);
  if (formattedCodeMatch && formattedCodeMatch[1]) {
    const code = normalizeRoomCode(formattedCodeMatch[1]);
    return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
  }

  // 4. Check unhyphenated 8-char code e.g. K7XM4P2Q
  const cleanAlpha = trimmed.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (cleanAlpha.length === 8) {
    const code = `${cleanAlpha.slice(0, 4)}-${cleanAlpha.slice(4, 8)}`;
    return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
  }

  // 5. Short fallback room code (4 to 12 alphanumeric chars)
  if (cleanAlpha.length >= 4 && cleanAlpha.length <= 12) {
    return { valid: true, roomCode: cleanAlpha, joinUrl: getJoinUrl(cleanAlpha) };
  }

  return {
    valid: false,
    error: 'Invalid QR code. Please scan a valid TempLink room QR.',
  };
}
