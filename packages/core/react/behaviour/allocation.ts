/**
 * Tier 0 behaviour: allocation arithmetic, pure. Shares of a whole sit end to end; boundary k sits between segment k
 * and k + 1 at the running total. Moving a boundary trades share between those two neighbours only.
 */

export interface AllocationLimits {
  total: number;
  step: number;
  /** The least any segment may hold. */
  minShare: number;
  /** Segments that never change. */
  locked: boolean[];
}

const round = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(6));

/** Where boundary k sits: the sum of every share up to and including segment k. */
export const boundaryAt = (shares: number[], k: number) => shares.slice(0, k + 1).reduce((a, b) => a + b, 0);

/** A boundary can move only when neither neighbour is locked. */
export const boundaryActive = (k: number, l: AllocationLimits) => !l.locked[k] && !l.locked[k + 1];

/** How far boundary k may go: each neighbour keeps at least `minShare`. */
export function boundaryRange(shares: number[], k: number, l: AllocationLimits): [number, number] {
  const start = boundaryAt(shares, k) - shares[k];
  const end = boundaryAt(shares, k + 1);
  return [start + l.minShare, end - l.minShare];
}

/** Shares after moving boundary k to `at` (snapped to the step and kept in range). */
export function moveBoundary(shares: number[], k: number, at: number, l: AllocationLimits): number[] {
  if (!boundaryActive(k, l)) return shares;
  const [lo, hi] = boundaryRange(shares, k, l);
  const p = Math.min(hi, Math.max(lo, round(at, l.step)));
  const start = boundaryAt(shares, k) - shares[k];
  const end = boundaryAt(shares, k + 1);
  const next = [...shares];
  next[k] = round(p - start, l.step);
  next[k + 1] = round(end - p, l.step);
  return next;
}

/**
 * Shares after typing a new share for segment i: the difference is taken from (or given to) the next unlocked
 * segment after it, else the nearest before it. Returns the new shares and which segment gave or took, or null when
 * nothing can absorb it.
 */
export function setShare(shares: number[], i: number, want: number, l: AllocationLimits): { shares: number[]; from: number } | null {
  if (l.locked[i]) return null;
  const order = [...shares.keys()].filter((k) => k > i).concat([...shares.keys()].filter((k) => k < i).reverse());
  const from = order.find((k) => !l.locked[k]);
  if (from === undefined) return null;
  const room = shares[i] + shares[from] - l.minShare;
  const v = Math.min(room, Math.max(l.minShare, round(want, l.step)));
  const next = [...shares];
  next[from] = round(shares[from] - (v - shares[i]), l.step);
  next[i] = v;
  return { shares: next, from };
}

/** Whether the shares add up to the total (bad data otherwise). */
export const sumsTo = (shares: number[], total: number) => Math.abs(shares.reduce((a, b) => a + b, 0) - total) < 1e-6;
