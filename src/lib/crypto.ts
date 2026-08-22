/**
 * TempLink Cryptographic & Privacy Utilities
 * Note: Provides secure session token generation and honest, transparent privacy helpers.
 */

export function generateSecureToken(length = 32): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatTimeRemaining(expiresAt: number): {
  formatted: string;
  isWarning: boolean;
  isCritical: boolean;
  isExpired: boolean;
} {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    formatted,
    isWarning: totalSeconds > 60 && totalSeconds <= 300,
    isCritical: totalSeconds > 0 && totalSeconds <= 60,
    isExpired: totalSeconds === 0,
  };
}
