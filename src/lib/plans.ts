/**
 * Centralized Plan Configuration and Member Limits
 */

export const ROOM_LIMITS = {
  FREE: 3,
  PRO: 10,
  BUSINESS: 25,
} as const;

export type PlanType = keyof typeof ROOM_LIMITS;

/**
 * Returns the authoritative maximum room members permitted for a given plan.
 * FREE -> 3
 * PRO -> 10
 * BUSINESS -> 25 (configurable)
 */
export function getMaxRoomMembers(plan?: string | null): number {
  if (!plan) return ROOM_LIMITS.FREE;
  const normalized = plan.toUpperCase() as PlanType;
  return ROOM_LIMITS[normalized] || ROOM_LIMITS.FREE;
}

export function normalizePlanType(plan?: string | null): PlanType {
  if (!plan) return 'FREE';
  const normalized = plan.toUpperCase();
  if (normalized === 'PRO') return 'PRO';
  if (normalized === 'BUSINESS') return 'BUSINESS';
  return 'FREE';
}
