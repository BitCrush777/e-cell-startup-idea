/**
 * Lightweight, privacy-first client product event tracking for startup validation.
 * STRICT PRIVACY INVARIANTS:
 * - NO message contents, text, or file data collected.
 * - NO personal identity or passwords collected.
 * - Event metrics are anonymous and focus purely on funnel completion rates.
 */

export type ProductEventType =
  | 'room_created'
  | 'room_joined'
  | 'qr_scan_success'
  | 'chat_started'
  | 'room_expired'
  | 'room_full'
  | 'upgrade_clicked'
  | 'feedback_submitted';

export interface ProductEvent {
  type: ProductEventType;
  timestamp: number;
  plan?: string;
  durationMinutes?: number;
  memberCount?: number;
  useCase?: string;
}

const STORAGE_KEY_EVENTS = 'templink_product_events_v1';

export function trackProductEvent(type: ProductEventType, metadata?: Partial<Omit<ProductEvent, 'type' | 'timestamp'>>): void {
  if (typeof window === 'undefined') return;

  const event: ProductEvent = {
    type,
    timestamp: Date.now(),
    ...metadata,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    const events: ProductEvent[] = raw ? JSON.parse(raw) : [];
    // Keep last 100 anonymous event logs locally for validation export
    events.push(event);
    if (events.length > 100) events.shift();
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch {}
}

export function getProductEventStats(): Record<ProductEventType, number> {
  const stats: Record<ProductEventType, number> = {
    room_created: 0,
    room_joined: 0,
    qr_scan_success: 0,
    chat_started: 0,
    room_expired: 0,
    room_full: 0,
    upgrade_clicked: 0,
    feedback_submitted: 0,
  };

  if (typeof window === 'undefined') return stats;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) return stats;
    const events: ProductEvent[] = JSON.parse(raw);
    events.forEach((ev) => {
      if (stats[ev.type] !== undefined) {
        stats[ev.type]++;
      }
    });
  } catch {}

  return stats;
}
