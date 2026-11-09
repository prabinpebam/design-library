/**
 * Harbour Books' look (Q76 walkthrough, guide Step 3 "Presets", smallest working example): the shop's own preset for
 * space, shape and material, registered with core's preset store and applied at start, each only through its public
 * seam (data-space and data-shape on body, data-material on the root).
 */
import { applyCategoryPreset, registerPresetCategory, type CategoryPreset } from '@design-library/core/presets';

function attributeCategory(id: 'space' | 'shape' | 'material', target: () => HTMLElement, theme: string, mine: string) {
  const listeners = new Set<() => void>();
  const builtIns: CategoryPreset<string>[] = [
    { id: 'theme', name: 'Theme', category: id, builtIn: true, theme: true, value: theme },
    { id: 'harbour', name: 'Harbour', category: id, builtIn: true, value: mine },
  ];
  registerPresetCategory<string>({
    id, label: id, builtIns,
    get: () => target().dataset[id] ?? theme,
    set: (v) => { target().dataset[id] = v; listeners.forEach((l) => l()); },
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
  });
}
attributeCategory('space', () => document.body, 'normal', 'loose');
attributeCategory('shape', () => document.body, 'rounded', 'soft');
attributeCategory('material', () => document.documentElement, 'frosted', 'solid');
for (const c of ['space', 'shape', 'material']) applyCategoryPreset(c, 'harbour');
