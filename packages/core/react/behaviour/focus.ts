/** The next boundary target, or null to leave native Tab order inside the modal alone. */
export function tabBoundary<T>(stops: readonly T[], active: T | null, backwards: boolean): T | null {
  if (!stops.length) return null;
  const index = active === null ? -1 : stops.indexOf(active);
  if (index < 0) return backwards ? stops[stops.length - 1] : stops[0];
  if (backwards && index === 0) return stops[stops.length - 1];
  if (!backwards && index === stops.length - 1) return stops[0];
  return null;
}

/** Automatic scroll focusability follows the enabled axes; an explicit focus order always wins. */
export function scrollTabIndex(axis: 'block' | 'inline' | 'both', overflow: { inline: boolean; block: boolean }, explicit?: number) {
  if (explicit !== undefined) return explicit;
  return ((axis !== 'inline' && overflow.block) || (axis !== 'block' && overflow.inline)) ? 0 : undefined;
}

/** Current, visible native Tab stops; re-read on each key so dynamic content never leaves a stale trap. */
export function tabStops(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable="true"]';
  const stops = [...container.querySelectorAll<HTMLElement>(selector)].filter((element) =>
    element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') &&
    element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible',
  );
  return stops.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name) return true;
    const group = stops.filter((other): other is HTMLInputElement =>
      other instanceof HTMLInputElement && other.type === 'radio' && other.name === element.name && other.form === element.form,
    );
    return element === (group.find((radio) => radio.checked) ?? group[0]);
  }).sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}

/** Wrap only at the modal boundary; a title remains the fallback when there are no controls. */
export function containTab(event: KeyboardEvent, modal: HTMLDialogElement) {
  if (event.key !== 'Tab' || event.defaultPrevented || !modal.open) return;
  const stops = tabStops(modal);
  const active = modal.ownerDocument.activeElement;
  const target = tabBoundary(stops, active instanceof HTMLElement ? active : null, event.shiftKey);
  if (!target && stops.length) return;
  event.preventDefault();
  (target ?? modal.querySelector<HTMLElement>('[data-dl-part="heading"]'))?.focus();
}
