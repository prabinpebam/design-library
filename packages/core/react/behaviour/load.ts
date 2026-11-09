/**
 * The load track (ui-states, perceived-performance): nothing for `duration.indicator-delay`, so content that beats it
 * is drawn directly; once shown, the indicator holds at least `duration.indicator-min`, so it never flickers; past
 * ten seconds the wait is called slow, so the region can say so. Timings come from the duration tokens.
 */
import { useEffect, useRef, useState } from 'react';
import { durationToken, remaining } from './commit';

/** Past this, a wait is long (perceived-performance): say it's taking longer and offer a way out. */
const SLOW_MS = 10_000;

export interface LoadIndicator {
  /** Show the indicator (skeleton, bar, "Updating…") now. Stays true for the minimum hold after the load ends. */
  shown: boolean;
  /** The wait has passed ten seconds. */
  slow: boolean;
}

/** Times one region's indicator from whether its load is running. Pass `loading` true while the data is on its way. */
export function useLoadIndicator(loading: boolean): LoadIndicator {
  const [shown, setShown] = useState(false);
  const [slow, setSlow] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      const show = setTimeout(() => {
        shownAt.current = performance.now();
        setShown(true);
      }, durationToken('--duration-indicator-delay'));
      const late = setTimeout(() => setSlow(true), SLOW_MS);
      return () => {
        clearTimeout(show);
        clearTimeout(late);
      };
    }
    setSlow(false);
    if (shownAt.current === null) return;
    const hide = setTimeout(() => {
      shownAt.current = null;
      setShown(false);
    }, remaining(shownAt.current, durationToken('--duration-indicator-min'), performance.now()));
    return () => clearTimeout(hide);
  }, [loading]);

  return { shown, slow };
}
