/**
 * Tier 0 behaviour: the live announcer (catalogue Feedback "Live announcer", WCAG 4.1.3). One polite and one
 * assertive live region for the whole page, put in the page as soon as this module loads, so the first message is
 * never lost to a region that appeared with it. Status messages go here without moving focus.
 */
let polite: HTMLElement | null = null;
let assertive: HTMLElement | null = null;

function region(kind: 'polite' | 'assertive') {
  const el = document.createElement('div');
  el.dataset.dl = 'announcer';
  el.dataset.politeness = kind;
  el.setAttribute('role', kind === 'polite' ? 'status' : 'alert');
  el.setAttribute('aria-live', kind);
  el.setAttribute('aria-atomic', 'true');
  document.body.append(el);
  return el;
}

/** Puts the two regions in the page; safe to call more than once. */
export function ensureAnnouncer() {
  if (typeof document === 'undefined' || !document.body) return;
  if (!polite?.isConnected) polite = region('polite');
  if (!assertive?.isConnected) assertive = region('assertive');
}

ensureAnnouncer();

/**
 * Says a message once. `polite` (default) waits for a pause; `assertive` interrupts, so keep it for a failure the person
 * must know now and that isn't where their focus is. The same words twice in a row are still said twice.
 */
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  ensureAnnouncer();
  const el = politeness === 'assertive' ? assertive : polite;
  if (!el) return;
  el.textContent = '';
  // A fresh text node after the region empties, so readers hear a repeat as a new message.
  window.setTimeout(() => {
    el.textContent = message;
  }, 50);
}
