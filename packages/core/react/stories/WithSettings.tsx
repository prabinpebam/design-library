import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { applySettings } from '../../theme';

/**
 * A story's own theme settings (ID4): applies allow-listed settings to this subtree only, through the same
 * `applySettings` a project calls on its root, so a story can show a setting without changing the page around it.
 */
export function WithSettings({ settings, contents = false, children }: { settings: Record<string, string>; contents?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    applySettings(settings, el);
    return () => {
      applySettings(null, el);
    };
  }, [settings]);
  // contents: the wrapper takes no box, so a layout inside sizes to the example as it would without it.
  return <div ref={ref} style={contents ? { display: 'contents' } : undefined}>{children}</div>;
}
