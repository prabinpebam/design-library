/** Automatic scroll focusability follows the enabled axes; an explicit focus order always wins. */
export function scrollTabIndex(axis: 'block' | 'inline' | 'both', overflow: { inline: boolean; block: boolean }, explicit?: number, named = false) {
  if (explicit !== undefined) return explicit;
  if (!named) return undefined;
  return ((axis !== 'inline' && overflow.block) || (axis !== 'block' && overflow.inline)) ? 0 : undefined;
}
