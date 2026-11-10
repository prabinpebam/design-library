/**
 * The commit track (ui-states): pending at once, held at least `duration.confirm-min`; then confirmed for its hold;
 * or failed until resolved. One commit in flight per control. Timings are read from the duration tokens, never literals.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** `on` pending, `done` confirmed, `failed` until the person resolves it. Mirrors `data-busy` (perceived-performance). */
export type CommitPhase = 'rest' | 'on' | 'done' | 'failed';

export type HoldToken = '--duration-confirm-min' | '--duration-confirm-read';

/** A duration token as milliseconds, e.g. `--duration-confirm-min` → 200. */
export function durationToken(name: string, el: Element = document.documentElement): number {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return 0;
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n;
}

/** Time still to wait so a phase that began at `start` lasts at least `min`. Pure. */
export const remaining = (start: number, min: number, now: number) => Math.max(0, min - (now - start));

/** Timers can fire early; only the monotonic deadline ends a minimum visibility beat. */
export async function waitMinimum(start: number, min: number) {
  let left = remaining(start, min, performance.now());
  while (left > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, Math.ceil(left)));
    left = remaining(start, min, performance.now());
  }
}

export interface CommitResult {
  ok: boolean;
  error?: unknown;
}

/**
 * Runs one commit on the track. `hold` is how long confirmed shows: the 200 ms beat for a control that shows its new
 * value, or `confirm-read` when the confirmation is words ("Saved"). `onConfirmed` runs as confirmed begins.
 */
export function useCommit(hold: HoldToken) {
  const [phase, setPhase] = useState<CommitPhase>('rest');
  const inFlight = useRef(false);
  const seq = useRef(0);
  const alive = useRef(true);
  const painted = useRef<((start: number | null) => void) | null>(null);
  useLayoutEffect(() => {
    const resolve = painted.current;
    if (!resolve) return;
    // Anchor after React committed the state, not before React rendered the click.
    const frame = requestAnimationFrame(() => {
      painted.current = null;
      resolve(performance.now());
    });
    return () => {
      cancelAnimationFrame(frame);
      if (painted.current === resolve) painted.current = null;
      resolve(null);
    };
  }, [phase]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      painted.current?.(null);
      painted.current = null;
    };
  }, []);

  const run = useCallback(
    async (work: () => unknown, onConfirmed?: () => void): Promise<CommitResult> => {
      if (inFlight.current) return { ok: false };
      inFlight.current = true;
      const id = ++seq.current;
      const pendingPaint = new Promise<number | null>((resolve) => { painted.current = resolve; });
      setPhase('on');
      const min = durationToken('--duration-confirm-min');
      let result: CommitResult = { ok: true };
      try {
        await work();
      } catch (error) {
        result = { ok: false, error };
      }
      const start = await pendingPaint;
      if (start !== null) await waitMinimum(start, min);
      inFlight.current = false; // the lock ends when confirmed (or failed) begins
      if (!alive.current || id !== seq.current) return result;
      if (!result.ok) {
        setPhase('failed');
        return result;
      }
      onConfirmed?.();
      const confirmedPaint = new Promise<number | null>((resolve) => { painted.current = resolve; });
      setPhase('done');
      const confirmedStart = await confirmedPaint;
      if (confirmedStart !== null) await waitMinimum(confirmedStart, Math.max(min, durationToken(hold)));
      if (alive.current && id === seq.current) setPhase('rest');
      return result;
    },
    [hold],
  );

  /** Back to rest without saving, e.g. Revert after a failure. Ignored while a commit is in flight. */
  const reset = useCallback(() => {
    if (inFlight.current) return;
    seq.current++;
    setPhase('rest');
  }, []);

  return { phase, run, reset };
}
