# Step 3: customize tokens

Goal: your product's look (colour, type, icons, space, shape, materials, motion) changed only through tokens, so every component, context and template follows without a line of CSS.

## Three levels: pick the right one

| Level | Changes | Where | Who sees it |
| --- | --- | --- | --- |
| **Your product's theme** (in your project) | Your brand colours, your fonts, your space, shape and material options | `@design-library/core/theme` (`applyBrand`, `applyFonts`) and attributes on the root, run once at start-up | Everyone using your app |
| **Choice** (run time) | One of the built-in options per category, for your app or a subtree, picked by the person | Attributes on the root and the core loaders, optionally saved as **presets** | That person, in their browser |
| **The library's theme** (in the library repository only) | The defaults every product starts from, and new values (a new space scale, a new semantic role) | Config files in `packages/core/tokens/` of the library repository, then `npm run tokens` | Every product, in the next library version |

In a separate project you use the first two. You can't run the library's token build there, and you don't need it: never copy the token files into your project or edit them in `node_modules`. When your product needs a value the library doesn't have, that's a library change (the seam ladder's last step). Never write a token value into a view, a style or content.

## Find what exists

`agent/index.json`:

- `tokens.semantic[]`: every role a component may read, with its CSS variable, light and dark values and what it's for.
- `tokens.componentTokens`: each component's own tokens (`--c-button-*`); read only by that component.
- `presets.categories`: the built-in options of each category, with ids (font presets under `type`, icon sets under `icons`). `presets.global`: the built-in global presets.
- `tokens.sources`: the library's own token files (library repository only); `tokens.sources.generated`: files nobody edits.

## Your product's theme

Put it in one module, imported once in your entry after the CSS (`import './look';`):

```ts
// src/look.ts
import { applyBrand, applyFonts } from '@design-library/core/theme';

applyBrand({ colours: { 1: { name: 'Harbour blue', seed: '#1f6f8b' } }, accent: 1 });
void applyFonts({ preset: 'bookish' });
document.body.dataset.space = 'loose';
document.body.dataset.shape = 'soft';
```

| Category | How | Rules |
| --- | --- | --- |
| **Colour** | `applyBrand(brand)` sets the brand and accent ramps and `--color-brand-*` roles on `<html>` (or the element you pass); `brandCss(brand)` returns the same as CSS text for a stylesheet loaded after `css/index.css`; `brandVars(brand)` returns the values and the generator's errors | `colours`: 1 to 4 numbered slots, each a `seed` hex (`#rrggbb`) and optional `pins` per step; `accent` names the slot actions, links, focus and selection read. Status colours (`color.status.*`), greys and categories stay the library's. **Contrast isn't measured at run time:** try your seeds first on the hosted library's [Colour page](https://prabinpebam.github.io/design-library/#/colour), whose brand editor measures every pair in light, dark and more contrast, and keep only seeds with no failures (pin a darker step if one fails) |
| **Type** | `applyFonts({ preset })`, or `{ roles: { display: 'fraunces' } }` over a preset; it loads the faces from the installed font packages and sets `--font-*` and their axes | Presets and faces from `presets.categories.type` in the index; only those faces (free, openly licensed, self-hosted). An unset role collapses onto the one above (ui → text → display). Without this, the theme's fonts apply once you load them (Step 1) and system fonts until then |
| **Space** | `data-space` on `body`: `compact`, `normal`, `loose`, `extra-loose` | Options re-map the semantic space roles only; the 4 px scale and 44 px targets never change |
| **Shape** | `data-shape` on `body`: `sharp`, `rounded`, `soft`, `super-soft` | Inner segments of a stacked bar stay square in every shape |
| **Material** | `data-material` on `<html>`: `frosted` (default) or `solid` | — |
| **Icons** | `await setIconSet(id, style)` from `@design-library/core/icons` | The library's own outline set is the default; ids and styles in `presets.categories.icons` |
| **Motion** | Nothing to set: durations and easings are the library's, and reduced motion follows the person | Never a literal duration or easing in CSS |
| **A template's own parts** | `{template}/tokens/tokens.css`, `t.{template}.{part}.*` custom properties written by hand in your template, each `var(--a-semantic-role)` | Each value reads a **semantic** role (`var(--space-gutter)`, `var(--color-bg-sunken)`); raw values, primitives and core component tokens never. (In the library repository, templates write `tokens.json` and `npm run tokens` generates the CSS) |

### The library's theme (library repository only)

| Category | Edit | Then |
| --- | --- | --- |
| **Colour** | `packages/core/tokens/colour.config.json` (schema `colour-config.schema.json`): `brand.colours`, `brand.accent`, `base.temperature`, `functional` (status seeds), `sets[]` (each **must** state its `purpose`) | `npm run tokens`, then `npm run tokens:check`: it refuses any text, focus or control pair under 4.5:1 (text) or 3:1 (non-text) in any of the four contexts |
| **Space**, **Shape** | `packages/core/tokens/space-shape.config.json` → `space`, `shape` | `npm run tokens`, `npm run tokens:check` |
| **Type** | `packages/core/tokens/tokens.json` → `font.*`, `axes.*`, and the matching preset `"default": true` in `packages/core/fonts/registry.json` | `npm run tokens`, `npm run tokens:check` |
| **Motion** | `packages/core/tokens/tokens.json` → `duration.*`, `easing.*`, `motion.*` | `npm run tokens`, `npm run tokens:check`, `npm run check:motion` |

## Choice: pick an option at run time

| Category | How | Example |
| --- | --- | --- |
| Space | `data-space` on `body` or any subtree | `document.body.dataset.space = 'compact'` |
| Shape | `data-shape` on `body` or any subtree | `document.body.dataset.shape = 'soft'` |
| Material | `data-material` on `<html>` or a subtree | `document.documentElement.dataset.material = 'solid'` |
| Density | `data-density="compact"` on a dense region (an inspector, a property panel), passed as a prop to the layout or compound that holds it (they pass `data-*` through) | `<PropertySection data-density="compact" …>`; never a wrapper `div` in a view |
| Icons | `setIconSet(id, style)` from `@design-library/core/icons` | `await setIconSet('phosphor', 'regular')`; ids and styles in `presets.categories.icons` |
| Type | `applyFonts(choice)` from `@design-library/core/theme` | `void applyFonts({ preset: 'editorial' })` |
| Colour | `applyBrand(brand)` from `@design-library/core/theme`; `applyBrand(null)` returns to your theme's | Prefer your product's theme for a fixed product colour |

Scheme, contrast and motion are the **person's** settings, not presets: follow the system, or offer a control that sets `data-scheme`, `data-contrast`, `data-motion` (Step 1).

## Presets: let people pick and save

A preset is a named value of one category; a global preset names one preset per category. The model is `@design-library/core/presets`:

1. **Register each category** once at start-up with `registerPresetCategory({ id, label, builtIns, get, set, subscribe })`, where `set` applies the value through the seam above. `set` is one of the theme helpers above (`applyBrand`, `applyFonts`, `setIconSet`) or an attribute; the example below registers three.
2. **Apply** with `applyGlobalPreset(id)` or `applyCategoryPreset(category, id)`; read the current one with `currentGlobal()` and `currentPreset(category)`.
3. **Save** a person's own with `saveCategoryPreset` and `saveGlobalPreset`; rename and delete with `renamePreset` and `deletePreset` (it returns an undo). Built-in presets are read-only. Saved presets live in this browser (`design-library.presets`).
4. **Offer a dialog:** build it only from Dialog, RadioGroup, Select, Heading and Stack, as the library's own Presets dialog is.
5. **Built-in global presets** (`presets.global` in the index) name one preset per category; a product's own go through `saveGlobalPreset`. New built-ins are a library change.

**Smallest working example** ([`apps/example/src/look.ts`](https://github.com/prabinpebam/design-library/blob/main/apps/example/src/look.ts) in the library repository): a product's own preset for the three attribute categories, registered and applied at start, with no app stores to copy:

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
| Set your product's theme with `@design-library/core/theme` and attributes, once at start-up | Edit `tokens.colour.json`, `tokens.space-shape.json`, `css/tokens.css` or `tokens/generated/*` |
| Give every new colour set a `purpose` | Add a colour for status outside `color.status.*` |
| Try brand seeds on the hosted Colour page first and pin a darker step when a pair fails | Ship a seed whose pairs fail there |
| Use the material roles (`--material-*`) for a floating surface in a template part | Write a `backdrop-filter` or a see-through fill of your own |

## Check it

| Check | Proves |
| --- | --- |
| `npx tsc --noEmit` | Brand, font and preset ids have the right shape |
| `brandVars(brand).errors` is empty | The generator accepts your brand (`applyBrand` returns the same errors) |
| Your brand seeds on the hosted [Colour page](https://prabinpebam.github.io/design-library/#/colour) | No contrast failures in light, dark or more contrast |
| `npx vite build`, then open your screens in light, dark and more contrast, then a template | Your theme everywhere, in every context |

In the library repository: `npm run tokens`, `npm run tokens:check`, `npm run check:motion`, `npm run check:materials`, `npm run agent:index`, then the library's [Colour](https://prabinpebam.github.io/design-library/#/colour), [Space](https://prabinpebam.github.io/design-library/#/space), [Shape](https://prabinpebam.github.io/design-library/#/shape) and [Materials](https://prabinpebam.github.io/design-library/#/materials) pages.
