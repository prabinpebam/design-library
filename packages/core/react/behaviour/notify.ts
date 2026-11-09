/**
 * Tier 0 behaviour: the notification store behind the one Notifications region (ui-states, notification pill). Plain
 * data and rules, no React: one per subject (a newer message on the same subject updates its pill in place), repeats
 * of the same words coalesce with a count, at most three visible, the rest queued with errors first, then warnings,
 * then the rest, each by time. A pill enters as a visible one leaves; its auto-dismiss clock starts only then.
 */
export type NotificationTone = 'info' | 'success' | 'warning' | 'error' | 'progress';

export interface NotificationAction {
  /** One verb: Undo, Retry, Open, Details. */
  label: string;
  onAction: () => void;
}

export interface NotificationInput {
  /** What it's about (a task, a file). A newer message with the same subject replaces this one in place. */
  subject?: string;
  /** Sets the icon and, with `dismiss`, how long it stays. `progress` stays until updated to another tone. */
  tone?: NotificationTone;
  /** One fact, one line normally; at most three. */
  message: string;
  action?: NotificationAction;
  /** `auto` goes by itself (default for info and success); `manual` stays until closed or acted on (default for warning and error). */
  dismiss?: 'auto' | 'manual';
}

export interface NotificationItem extends Required<Pick<NotificationInput, 'tone' | 'message' | 'dismiss'>> {
  id: string;
  subject?: string;
  action?: NotificationAction;
  /** How many times the same words came in a row: shown as a count from 2. */
  count: number;
  /** When it came, for the queue's order. */
  at: number;
  /** Changes on every update, so a re-shown message is announced and timed again. */
  version: number;
}

const MAX_VISIBLE = 3;
const rank: Record<NotificationTone, number> = { error: 0, warning: 1, progress: 2, info: 2, success: 2 };

let items: NotificationItem[] = [];
let visible: string[] = [];
let serial = 0;
let snapshot = { visible: [] as NotificationItem[], waiting: 0 };
const listeners = new Set<() => void>();

function publish() {
  const byId = new Map(items.map((i) => [i.id, i]));
  // Fill free places from the queue: errors first, then warnings, then the rest, oldest first within each.
  const queued = items.filter((i) => !visible.includes(i.id)).sort((a, b) => rank[a.tone] - rank[b.tone] || a.at - b.at);
  while (visible.length < MAX_VISIBLE && queued.length) visible.push(queued.shift()!.id);
  snapshot = { visible: visible.map((id) => byId.get(id)!).filter(Boolean), waiting: items.length - visible.length };
  listeners.forEach((l) => l());
}

/** Shows a notification, or updates the one with the same subject or the same words. Returns its id. */
export function notify(input: NotificationInput): string {
  const tone = input.tone ?? 'info';
  const dismiss = input.dismiss ?? (tone === 'warning' || tone === 'error' ? 'manual' : 'auto');
  const same = items.find((i) => (input.subject && i.subject === input.subject) || (!input.subject && !i.subject && i.message === input.message && i.tone === tone));
  serial += 1;
  if (same) {
    const repeat = !input.subject && same.message === input.message;
    Object.assign(same, { tone, message: input.message, action: input.action, dismiss, count: repeat ? same.count + 1 : 1, version: serial });
    items = [...items];
    publish();
    return same.id;
  }
  const id = `n${serial}`;
  items = [...items, { id, subject: input.subject, tone, message: input.message, action: input.action, dismiss, count: 1, at: serial, version: serial }];
  publish();
  return id;
}

/** Removes a notification (closed, acted on, timed out or resolved); the next in the queue takes its place. */
export function dismissNotification(id: string) {
  items = items.filter((i) => i.id !== id);
  visible = visible.filter((v) => v !== id);
  publish();
}

export function subscribeNotifications(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The visible pills, newest nearest the bottom edge, and how many wait. Stable between changes. */
export function notificationsSnapshot() {
  return snapshot;
}
