import { useLayoutEffect, useRef } from 'react';

/**
 * Gives the element drawn right after it an id, so a link such as `/visit#hours` lands on it (DP9 `anchor`). Renders a
 * `hidden` marker: no box, so no gap in a flex or grid parent. An element that already has an id keeps it. Internal to
 * the renderer; not a public component.
 */
export function SectionAnchor({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const target = ref.current?.nextElementSibling;
    if (!target || target.id) return;
    target.id = id;
    return () => target.removeAttribute('id');
  }, [id]);
  return <span ref={ref} hidden data-dl-anchor={id} />;
}
