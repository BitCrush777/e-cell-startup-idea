/**
 * Centralized Application URL and QR Parsing Utilities
 */

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://templink.in';
}

export function getJoinUrl(roomCode: string): string {
  const code = (roomCode || '').toUpperCase().trim();
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

      // Only allow legitimate templink domains, localhost, or matching origin
      const isAllowedHost =
        hostname === 'templink.in' ||
        hostname === 'www.templink.in' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        (typeof window !== 'undefined' && hostname === window.location.hostname);

      if (!isAllowedHost) {
        return {
          valid: false,
          error: 'This QR code is for an external website and is not a valid TempLink room.',
        };
      }

      // Check path /join/XXXX-XXXX
      const pathMatch = url.pathname.match(/\/join\/([A-Za-z0-9-]+)/i);
      if (pathMatch && pathMatch[1]) {
        const code = pathMatch[1].toUpperCase().trim();
        return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
      }

      // Check query param ?code=XXXX-XXXX
      const queryCode = url.searchParams.get('code') || url.searchParams.get('room');
      if (queryCode) {
        const code = queryCode.toUpperCase().trim();
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
    const code = relativeMatch[1].toUpperCase().trim();
    return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
  }

  // 3. Check formatted 8-char code e.g. K7XM-4P2Q
  const formattedCodeMatch = trimmed.match(/^([A-Za-z0-9]{4}-[A-Za-z0-9]{4})$/);
  if (formattedCodeMatch && formattedCodeMatch[1]) {
    const code = formattedCodeMatch[1].toUpperCase().trim();
    return { valid: true, roomCode: code, joinUrl: getJoinUrl(code) };
  }

  // 4. Check unhyphenated 8-char code e.g. K7XM4P2Q
  const cleanAlpha = trimmed.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (cleanAlpha.length === 8) {
    const formatted = `${cleanAlpha.slice(0, 4)}-${cleanAlpha.slice(4, 8)}`;
    return { valid: true, roomCode: formatted, joinUrl: getJoinUrl(formatted) };
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
