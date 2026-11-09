import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { applySettings } from '../../theme';

/**
 * A story's own theme settings (ID4): applies allow-listed settings to this subtree only, through the same
 * `applySettings` a project calls on its root, so a story can show a setting without changing the page around it.
 */
export function WithSettings({ settings, children }: { settings: Record<string, string>; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    applySettings(settings, el);
    return () => {
      applySettings(null, el);
    };
  }, [settings]);
  return <div ref={ref}>{children}</div>;
}
