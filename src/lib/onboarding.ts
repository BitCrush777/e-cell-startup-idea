/**
 * Lightweight client-side onboarding and first-time user state manager.
 * Stores non-sensitive UX flags in localStorage for subtle contextual hints.
 */

const STORAGE_KEY_ONBOARDING = 'templink_onboarding_v1';
const STORAGE_KEY_SEEN_HINTS = 'templink_seen_hints_v1';

export interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCreatedFirstRoom: boolean;
  hasJoinedFirstRoom: boolean;
  hasSeenSafeRoomTooltip: boolean;
}

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  hasSeenWelcome: false,
  hasCreatedFirstRoom: false,
  hasJoinedFirstRoom: false,
  hasSeenSafeRoomTooltip: false,
};

export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_ONBOARDING_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ONBOARDING);
    if (!raw) return DEFAULT_ONBOARDING_STATE;
    return { ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ONBOARDING_STATE;
  }
}

export function updateOnboardingState(partial: Partial<OnboardingState>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOnboardingState();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(updated));
  } catch {}
}

export function hasSeenHint(hintKey: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEEN_HINTS);
    if (!raw) return false;
    const set: string[] = JSON.parse(raw);
    return set.includes(hintKey);
  } catch {
    return false;
  }
}

export function markHintSeen(hintKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEEN_HINTS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(hintKey)) {
      list.push(hintKey);
      localStorage.setItem(STORAGE_KEY_SEEN_HINTS, JSON.stringify(list));
    }
  } catch {}
}
