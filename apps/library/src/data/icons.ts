/**
 * The icon library the library is previewed in (F17, owner Q36): the theme's own outline set until a person picks a
 * library and style on the Icon page; kept in this browser only and never written to source, like the type, space and
 * shape previews (F12, F16). Applied through core's `setIconSet`, so every Icon on every page follows.
 */
import { iconSetOf, setIconSet, useIconChoice, type IconChoice } from '@design-library/core/icons';
import { watchStored } from '@design-library/core/presets';

const KEY = 'design-library.icons';

function read(): IconChoice {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as IconChoice | null;
    if (v && iconSetOf(v.set)) return v;
  } catch {
    // Unreadable: the theme's own.
  }
  return { set: null, style: null };
}

const first = read();
if (first.set) void setIconSet(first.set, first.style);
// Another tab, window or preview frame changed the icons: follow it (Q70).
watchStored(KEY, () => {
  const v = read();
  void setIconSet(v.set, v.style);
});

export function chooseIcons(set: string | null, style?: string | null) {
  void setIconSet(set, style);
  try {
    if (set) localStorage.setItem(KEY, JSON.stringify({ set, style: iconSetOf(set)?.styles.find((s) => s.id === style)?.id ?? iconSetOf(set)?.styles[0].id }));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
}

export const useIcons = useIconChoice;