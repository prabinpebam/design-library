# Step 3: customize tokens

Goal: your product's look (colour, type, icons, space, shape, materials, motion) changed only through tokens, so every component, context and template follows without a line of CSS.

## Two levels: pick the right one

| Level | Changes | Where | Who sees it |
| --- | --- | --- | --- |
| **Theme** (build time) | The default of every category | Config files in `packages/core/tokens/`, then `npm run tokens` | Every app and template built from this repository |
| **Choice** (run time) | One of the built-in options per category, for your app or a subtree | Attributes on the root and the core loaders, optionally saved as **presets** | Your app, in this browser |

Change the theme when your product owns this repository's look. Make a choice when your app needs a different option of what's already there. Never write a token value into a view, a style or content.

## Find what exists

`packages/core/agent/index.json`:

- `tokens.semantic[]`: every role a component may read, with its CSS variable, light and dark values and what it's for.
- `tokens.componentTokens`: each component's own tokens (`--c-button-*`); read only by that component.
- `presets.categories`: the built-in options of each category, with ids. `presets.global`: the built-in global presets.
- `tokens.sources`: the files you edit; `tokens.sources.generated`: the files you never edit.

## Theme: change the defaults

| Category | Edit | Rules | Then |
| --- | --- | --- | --- |
| **Colour** | `packages/core/tokens/colour.config.json` (schema `colour-config.schema.json`) | `brand.colours`: 1 to 4 numbered slots, each a `seed` hex and optional `pins` per step; `brand.accent` names the slot actions, links, focus and selection read. `base.temperature`: `neutral`, `warm` or `cool` (or tint the greys by hand with `base.pins`). `functional`: info, success, warning, danger seeds (status colours; keep them recognisable). `sets[]`: named extra colours, each **must** state its `purpose` (never status, never an action, never the only cue). Or start from a preset in `colour-presets.json` by copying its `brand` block. | `npm run tokens`, then `npm run tokens:check`. It refuses a theme where any text, focus or control pair misses its contrast (4.5:1 text, 3:1 non-text) in any of the four contexts, naming the pair, the context and the ratio. |
| **Space** | `packages/core/tokens/space-shape.config.json` → `space` | One of `compact`, `normal`, `loose`, `extra-loose`. Options re-map the semantic space roles only; the 4 px scale and 44 px targets never change. | `npm run tokens`, `npm run tokens:check` |
| **Shape** | the same file → `shape` | One of `sharp`, `rounded`, `soft`, `super-soft`. Inner segments of a stacked bar stay square in every shape. | `npm run tokens`, `npm run tokens:check` |
| **Type** | `packages/core/tokens/tokens.json` → `font.display`, `font.text`, `font.ui`, `font.code` (and `axes.*`), and mark the matching preset `"default": true` in `packages/core/fonts/registry.json` | Faces only from the registry (free, openly licensed, self-hosted). An unset role collapses onto the one above (ui → text → display). Keep the system stack after the face name. | `npm run tokens`, `npm run tokens:check`; load the faces with `loadFace` (Step 1) |
| **Icons** | Nothing in the theme: the library's own outline set is the default | A different set is a run-time choice (below) | — |
| **Material** | The theme default is frosted | Solid for the whole product is a run-time choice on the root (below) | — |
| **Motion** | `packages/core/tokens/tokens.json` → `duration.*`, `easing.*`, `motion.*` | Durations by job (`instant`, `fast`, `medium`, `slow`); never a literal duration or easing in CSS. Reduced motion collapses movement, never the state timings (`duration.confirm-min`, `notice`). | `npm run tokens`, `npm run tokens:check`, `npm run check:motion` |
| **A template's own parts** | `packages/templates/{template}/tokens/tokens.json`, `t.{template}.{part}.*` | Each value aliases a **semantic** role (`"{space.gutter}"`, `"{color.bg-sunken}"`); raw values, primitives and core component tokens fail | `npm run tokens` (writes the template's `tokens/tokens.css`), `npm run tokens:check` |

## Choice: pick an option at run time

| Category | How | Example |
| --- | --- | --- |
| Space | `data-space` on `body` or any subtree | `document.body.dataset.space = 'compact'` |
| Shape | `data-shape` on `body` or any subtree | `document.body.dataset.shape = 'soft'` |
| Material | `data-material` on `<html>` or a subtree | `document.documentElement.dataset.material = 'solid'` |
| Density | `data-density="compact"` on a dense region (an inspector, a property panel), passed as a prop to the layout or compound that holds it (they pass `data-*` through) | `<PropertySection data-density="compact" …>`; never a wrapper `div` in a view |
| Icons | `setIconSet(id, style)` from `@design-library/core/icons` | `await setIconSet('phosphor', 'regular')`; ids and styles in `presets.categories.icons` |
| Type | `loadFace(id)` from `@design-library/core/fonts`, then set the role variables on the root | `root.style.setProperty('--font-display', "'Fraunces Variable', Georgia, serif")`; follow `apps/library/src/data/type.ts` |
| Colour | Generate the brand with `generate()` from `@design-library/core/colour` and set the variables it returns on the root | Follow `apps/library/src/data/brand.ts`; prefer the theme for a fixed product colour |

Scheme, contrast and motion are the **person's** settings, not presets: follow the system, or offer a control that sets `data-scheme`, `data-contrast`, `data-motion` (Step 1).

## Presets: let people pick and save

A preset is a named value of one category; a global preset names one preset per category. The model is `@design-library/core/presets`:

1. **Register each category** once at start-up with `registerPresetCategory({ id, label, builtIns, get, set, subscribe })`, where `set` applies the value through the seam above. The library registers all six in `apps/library/src/data/presets.ts`; copy that file's pattern (its stores live in the app today, so a consumer copies them too).
2. **Apply** with `applyGlobalPreset(id)` or `applyCategoryPreset(category, id)`; read the current one with `currentGlobal()` and `currentPreset(category)`.
3. **Save** a person's own with `saveCategoryPreset` and `saveGlobalPreset`; rename and delete with `renamePreset` and `deletePreset` (it returns an undo). Built-in presets are read-only. Saved presets live in this browser (`design-library.presets`).
4. **Offer the dialog:** the library's Presets dialog (`apps/library/src/inspectors/presets.tsx`) is built only from Dialog, RadioGroup, Select, Heading and Stack; build yours the same way.
5. **New built-in global presets** go in `packages/core/presets/presets.json`, each naming an existing preset id (or `"theme"`) for every category.

**Smallest working example** (`apps/example/src/look.ts`): a product's own preset for the three attribute categories, registered and applied at start, with no app stores to copy:

```ts
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
```

Import it once in your entry, after the CSS (`import './look';`). Values must be ids from `presets.categories` in the index; a person's own choices on top of it follow the same store.

## Do and don't

| Do | Don't |
| --- | --- |
| Read semantic roles (`var(--color-text)`, `var(--space-stack-item)`) in a template part's CSS | Read `--p-*` primitives, another component's `--c-*` tokens, or `spectrum`/`set` colours for meaning |
| Change a theme in its config, then run the generator | Edit `tokens.colour.json`, `tokens.space-shape.json`, `css/tokens.css` or `tokens/generated/*` |
| Give every new colour set a `purpose` | Add a colour for status outside `color.status.*` |
| Let the contrast check fail and pick a darker seed or pin a step | Silence the check or lower a ratio |
| Use the material roles (`--material-*`) for a floating surface in a template part | Write a `backdrop-filter` or a see-through fill of your own (`npm run check:materials` fails) |

## Check it

| Check | Proves |
| --- | --- |
| `npm run tokens` | Every generated token file and CSS is rewritten from the configs |
| `npm run tokens:check` | Nothing generated is stale; every contrast pair passes in light, dark and both contrasts; spectrum and sets stay out of components |
| `npm run check:motion`, `npm run check:materials` | No literal durations, easings, blurs or see-through fills outside tokens |
| `npm run agent:index` | The index lists the new values |
| Open the library's [Colour](http://127.0.0.1:8766/#/colour), [Space](http://127.0.0.1:8766/#/space), [Shape](http://127.0.0.1:8766/#/shape) and [Materials](http://127.0.0.1:8766/#/materials) pages, then a template | The new theme everywhere, in every context |
