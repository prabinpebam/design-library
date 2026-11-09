/**
 * Board moves (tier 0, F15.75): pure. Takes a card out of its column and puts it in another (or the same) at a
 * position, so a board's owner can apply a Board `onMove` to its own data in one line.
 */
export interface BoardMoveColumn<C extends { id: string }> {
  id: string;
  cards: C[];
}

export function moveCard<C extends { id: string }, K extends BoardMoveColumn<C>>(columns: K[], cardId: string, toColumn: string, toIndex: number): K[] {
  const from = columns.find((c) => c.cards.some((x) => x.id === cardId));
  const card = from?.cards.find((x) => x.id === cardId);
  if (!from || !card) return columns;
  const without = columns.map((c) => (c.id === from.id ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c));
  return without.map((c) => {
    if (c.id !== toColumn) return c;
    const at = Math.max(0, Math.min(toIndex, c.cards.length));
    return { ...c, cards: [...c.cards.slice(0, at), card, ...c.cards.slice(at)] };
  });
}
