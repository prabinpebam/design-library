/** Tier 0 behaviour: reordering a list, pure. */

/** The ids with the item at `from` moved to `to` (both indexes in the original list). */
export function moveItem(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

/** The moves that make sense for the item at `index` of `count`, for a Move menu (impossible ones left out). */
export function movesFor(index: number, count: number): { value: string; label: string; to: number }[] {
  const moves: { value: string; label: string; to: number }[] = [];
  if (index > 0) moves.push({ value: 'up', label: 'Move up', to: index - 1 });
  if (index < count - 1) moves.push({ value: 'down', label: 'Move down', to: index + 1 });
  if (index > 1) moves.push({ value: 'top', label: 'Move to top', to: 0 });
  if (index < count - 2) moves.push({ value: 'bottom', label: 'Move to bottom', to: count - 1 });
  return moves;
}

/** Where a dragged item lands: the index whose box centre the pointer has passed, given each item's top and height. */
export function dropIndex(boxes: { top: number; height: number }[], y: number): number {
  let i = 0;
  while (i < boxes.length && y > boxes[i].top + boxes[i].height / 2) i++;
  return i;
}
