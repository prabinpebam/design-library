/**
 * Finds a revision target on its page. A block is found by its catalogue anchor. A picked element is found by its
 * selector, and only counts if it still sits in the same catalogue block with the same tag: identity and selector must
 * agree. Never by position on screen or by approximate text, so a moved or changed element is reported, not guessed.
 */
export interface Resolvable {
  anchor: string;
  occurrence?: number;
  element?: { selector: string; block: string; tag: string };
}

export function resolveTarget(t: Resolvable, root: HTMLElement): HTMLElement | null {
  if (!t.element) return root.querySelectorAll<HTMLElement>(`[data-rev="${CSS.escape(t.anchor)}"]`)[(t.occurrence ?? 1) - 1] ?? null;
  const { selector, block, tag } = t.element;
  if (!selector) return null;
  let found: HTMLElement | null = null;
  try {
    found = root.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
  if (!found || found.tagName.toLowerCase() !== tag) return null;
  const owner = found.closest<HTMLElement>('[data-rev]');
  const ownerAnchor = owner && root.contains(owner) ? owner.dataset.rev ?? '' : '';
  return ownerAnchor === block ? found : null;
}
