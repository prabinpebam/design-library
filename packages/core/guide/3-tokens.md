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
| **Colour** | `applyBrand(brand)` sets the brand and accent ramps and `--color-brand-*` roles on `<html>` (or the element you pass); `brandCss(brand)` returns the same as CSS text for a stylesheet loaded after `css/index.css`; `brandVars(brand)` returns the values and the generator's errors | `colours`: 1 to 4 numbered slots, each a `seed` hex (`#rrggbb`) and optional `pins` per step; `accent` names the slot actions, links, focus and selection read. **`base`** (optional) sets the neutral canvas and inks: `temperature` (`neutral`, `warm` or `cool`), an optional `tint`, and `pins` by step (when you pin a tinted light end such as `0`, pin `900` and `950` too, so dark mode keeps a deliberate inverse); without `base`, the library's greys stay. Status colours (`color.status.*`) and categories stay the library's. **Contrast isn't measured at run time:** try your seeds first on the hosted library's [Colour page](https://prabinpebam.github.io/design-library/#/colour), whose brand editor measures every pair in light, dark and more contrast, and keep only seeds with no failures (pin a darker step if one fails) |
| **Type** | `applyFonts({ preset })`, or `{ roles: { display: 'fraunces' } }` over a preset; it loads the faces from the installed font packages and sets `--font-*` and their axes | Presets and faces from `presets.categories.type` in the index; only those faces (free, openly licensed, self-hosted). An unset role collapses onto the one above (ui → text → display). Without this, the theme's fonts apply once you load them (Step 1) and system fonts until then |
| **Space** | `data-space` on `body`: `compact`, `normal`, `loose`, `extra-loose` | Options re-map the semantic space roles only; the 4 px scale and 44 px targets never change |
| **Shape** | `data-shape` on `body`: `sharp`, `rounded`, `soft`, `super-soft` | Inner segments of a stacked bar stay square in every shape |
| **Material** | `data-material` on `<html>`: `frosted` (default) or `solid` | — |
| **Icons** | `await setIconSet(id, style)` from `@design-library/core/icons` | The library's own outline set is the default; ids and styles in `presets.categories.icons`. A brand's own icons: [Your own icons](#your-own-icons) |
| **Motion** | Nothing to set: durations and easings are the library's, and reduced motion follows the person | Never a literal duration or easing in CSS |
| **Theme settings** | `applySettings({ '--c-site-layout-gap': 'var(--space-stack-section)' })` from `@design-library/core/theme`, or `settingsCss(settings, selector)` for a stylesheet; `themeSettings` lists every name and `settingsErrors(settings)` names what's refused | Only the component tokens on the published allow-list `tokens/settings.json` (each component's `settings`, with defaults, in `agent/components/{Name}.json`); every other `--c-*` token is private. Today: SiteLayout's frame, `--c-site-layout-width`, `-reading`, `-margin`, `-gap`, `-padding-block` and `-padding-start` (space above the first band only; follows `-padding-block` when unset). For an opening that meets the header, use `SiteLayout` `opening="flush"` (content: `settings.SiteLayout.opening`). Link: `--link-decoration` (rest, `underline` by default) and `--link-decoration-hover` (hover and keyboard focus); with the rest line off, the line must come back on hover and focus, and your link colour owes 3:1 against the text around it (check it on the Colour page). Heading's top steps (0.4.0-beta.2): `--type-display-size`, `-weight`, `-leading`, `-tracking` (Hero and page titles, `Heading size="display"`, `Statistic`'s large value) and the same four for `--type-jumbo-*` (`Heading size="jumbo"`), each a token or a value; a display face with one weight sets `--type-display-weight: 400` (and jumbo's) so the browser doesn't fake bold; jumbo stays the larger step (`settingsErrors` refuses a jumbo length below display). Section titles stay at their steps unless asked: `Section` `size="display"` or `"jumbo"` (from data, the `size` field on a block with a `heading`; 0.5.0-beta.1) puts them on these steps |
| **A template's own parts** | `{template}/tokens/tokens.css`, `t.{template}.{part}.*` custom properties written by hand in your template, each `var(--a-semantic-role)` | Each value reads a **semantic** role (`var(--space-gutter)`, `var(--color-bg-sunken)`); raw values, primitives and core component tokens never. (In the library repository, templates write `tokens.json` and `npm run tokens` generates the CSS) |

### The library's theme (library repository only)

| Category | Edit | Then |
| --- | --- | --- |
| **Colour** | `packages/core/tokens/colour.config.json` (schema `colour-config.schema.json`): `brand.colours`, `brand.accent`, `base.temperature`, `functional` (status seeds), `sets[]` (each **must** state its `purpose`) | `npm run tokens`, then `npm run tokens:check`: it refuses any text, focus or control pair under 4.5:1 (text) or 3:1 (non-text) in any of the four contexts |
| **Space**, **Shape** | `packages/core/tokens/space-shape.config.json` → `space`, `shape` | `npm run tokens`, `npm run tokens:check` |
| **Type** | `packages/core/tokens/tokens.json` → `font.*`, `axes.*`, and the matching preset `"default": true` in `packages/core/fonts/registry.json` | `npm run tokens`, `npm run tokens:check` |
| **Motion** | `packages/core/tokens/tokens.json` → `duration.*`, `easing.*`, `motion.*` | `npm run tokens`, `npm run tokens:check`, `npm run check:motion` |

## Your own icons

A brand's icons use the library's semantic names, so one glyph changes that icon everywhere a component or layout draws it: buttons, fields, menus, notifications, navigation, chevrons, close, and `star` for `Rating`. Never fork a component or draw an `<svg>` to change an icon.

1. **Name the SVG files** by the icon each replaces: `close.svg`, `chevron-down.svg`. `npx design-library-icons --names` lists the names. A mark with no matching name (a logo) is an `Image`, not an icon.
2. **Convert them:** `npx design-library-icons src/brand/icons --out src/brand/icons.json --id brand --name "Brand" --licence "Own work"`. Every paint becomes `currentColor`, so the icon follows the text colour in every scheme and in forced colours. A file with a script, event attribute, `foreignObject`, embedded image or external reference is refused; a misnamed file is reported with the nearest names (exit code 1; the rest are written). Add `--check` in CI to fail when the JSON is stale.
3. **Use them**, from `@design-library/core/icons` (and `IconOverrides` from `@design-library/core/components`):

| You have | Do | Every name you didn't draw |
| --- | --- | --- |
| A whole set | `registerIconSet(data)`, then `await setIconSet(data.id)` | Draws from the library's own |
| A few icons, site-wide | `setIconOverrides(data.glyphs)` (`null` clears) | Draws from the active set |
| A few icons, one part of the page | `<IconOverrides icons={data.glyphs}>…</IconOverrides>`; nested ones merge, the inner wins | Draws from the site-wide overrides, then the active set |

For each name, `Icon` draws the first it finds: the nearest `IconOverrides` → `setIconOverrides` → the active set's style → that set's first style → the library's own. An `Icon`'s accessible name or `decorative` doesn't change.

4. **Check:** in development, a glyph under a name no component draws, or without a `viewBox`, logs one warning; `npx design-library-check` warns on the same in your project's icon JSON (`icon-name`).

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
