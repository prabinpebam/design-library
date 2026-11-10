# Step 6: use a template, then adapt one as your own

Goal: a whole product's screens from a template: first by using one as it is, with your words; then by making your own, starting from the nearest one, without touching the core or another template.

## The templates

`agent/index.json` → `templates[]` lists each with its layouts, regions, accepted blocks and standalone address. Open any at `https://prabinpebam.github.io/design-library/site.html#/app/{template}/{layout}`. Their files are in `node_modules/@design-library/templates/{template}/`.

> **Your templates live in your project**, one folder each under `src/templates/{id}/`, with `src/templates/index.ts` listing them. Never edit a template inside `node_modules`: copy it into your project first.

| Template | Kind | Shape | Start from it for |
| --- | --- | --- | --- |
| `corporate` | Company site: home, about, services, careers, contact, account, help | Regions of core blocks | A marketing or company site |
| `portfolio` | One person's work | Regions | A personal or studio site |
| `blog` | Articles, lists, an author, subscribing | Regions | Publishing, news, documentation-like reading |
| `conference` | An event: programme, speakers, tickets, sponsors; has custom parts | Regions + its own blocks and layout | Anything that needs a custom part (the worked example) |
| `chat` | An AI assistant | A record in `ChatLayout` | A conversational product |
| `design` | A design tool editor | A record in `EditorLayout` | A canvas or builder |
| `projects` | Project management: board, backlog, issue | A record in `AppLayout` | A working tool with lists and details |
| `harbour` | A bookshop's home, the guide's worked example (one screen built, six planned) | Regions of core blocks | The smallest valid template, to copy |

## Use a template as it is

1. **Pick the template** by the table above and open its screens in the hosted library (Templates section) or as standalone sites.
2. **Render it unchanged** to see it in your app: `import corporate from '@design-library/templates/corporate'` and `<TemplateView template={corporate} layout="home" />` (Step 2, "Render it").
3. **To change its words, copy it** into `src/templates/{template}/` (the whole folder) and change only content there: the JSON in `content/` (Step 2). Words, links, pictures (add files to `assets/` and ids to `assets.json`, with alt text), which blocks each page shows.
4. **Theme it** (Step 3): templates take the library's colour, type, icons, space, shape and material, and follow presets live.
5. **Render your copy** with `TemplateView` (import it from `./templates/{template}`), fixing its `index.ts` as in "Start a template from nothing" below (`loadTemplate` from `@design-library/core/render`).
6. **Check:** `npx design-library-check-content --templates src/templates`, then open each screen you changed in light, dark and more contrast.

A copy that keeps the library's id stays a copy of that template; to make it yours, adapt it as below.

## Use a part from another template

A template's own parts (a countdown, a sponsor wall, an app screen) can go into any site without the rest of that template. Import its registry alone: `@design-library/templates/{id}/registry` brings the template's parts, its registry and its token CSS, and none of its content or pictures (templates with parts: `conference`, `chat`, `design`, `projects`).

```tsx
import { Countdown } from '@design-library/templates/conference/registry';

<Countdown label="Doors open in" until="2027-04-20T09:00:00Z" passed="Doors are open" />
```

- **In code:** import the part by name, as above; its props are typed (`CountdownProps`, `SponsorWallProps`).
- **From JSON:** pass the registry to `loadTemplate` or `loadSite` (`registry`), then place the part as a block by its namespaced type (`"type": "conference.countdown"`).
- **Size:** a page placing the conference `Countdown` this way was 305 KB of script and styles, against 442 KB through the template's full entry (`@design-library/templates/conference`), which also brings its pictures and content.
- **Look:** the part reads its own template tokens (`t.conference.*`); set them in your theme like any template token, never by selecting the part in CSS.

Copy a part into your own template only when you need to change what it draws; then it's yours (`npx design-library-new-template {id} --part compounds/{Name}`).

## Your own pictures

Every picture a template shows is a file in its `assets/` folder and an entry in its `assets.json`; content names it by id (`"picture": "shopfront"`). Every version of one picture the library supports (colour, greyscale or duotone, at rest and on hover; the light, dark and more-contrast files; and how they combine) is shown live, with its props and its `assets.json` entry, on the library's [Pictures](https://prabinpebam.github.io/design-library/#/pictures) page.

1. **Size it for where it shows:** twice the largest width it is drawn at (a split hero or card picture about 1200 × 800, a wide hero 2304 × 1296, a square 960 × 960, a portrait 192 × 192). The component reserves its box from the ratio, so the page never jumps while it loads.
2. **Ship WebP** (about quality 82); SVG for drawn marks. File names are lower-case kebab case (`assets/the-long-shore.webp`), the only form `assets.schema.json` accepts.
3. **Trim transparent pictures** to their visible edge: space around a picture comes from the layout, never from empty pixels.
4. **Write the alt from the finished picture:** what it shows or means in this place, in a sentence (`"The shop's lit window on a cobbled quay in the evening…"`), never the medium or the file ("image of", "hero.webp"). Use `""` only when the picture is decoration and the words beside it say everything.
5. **Describe how it's drawn in its entry** (all optional): `ratio` (`wide`, `photo`, `square`, `portrait`… as `Image`) for blocks that don't fix a frame; `focal` (`{ "x": 0.3, "y": 0.6 }`, 0 to 1) the point that stays in view when the frame crops; `treatment` (`none`, `greyscale`, `duotone`, or `{ "rest": "greyscale", "active": "none" }` for a picture that colours in on hover or focus); `decorative: true` for a picture the words beside it already say, which then needs no `alt`; `alternate` (`"assets/{name}-after.webp"`, 0.5.0-beta.1) for a second picture shown while the card or link around it is hovered or focused (say both pictures in `alt`). Every other picture needs `alt`.
6. **Keep a set consistent:** one style across a template's pictures (the same light, palette and finish); example pictures in the shipped templates are stand-ins a real site replaces with its own.
7. **Pictures in every scheme (0.4.0-beta.2):** a picture drawn for a light page that looks wrong on a dark one (a daylight scene, a screenshot, a diagram on white) gets a second file of the same picture: `"dark": "assets/{name}-dark.webp"` in its entry, and `"contrast": { "light": …, "dark": … }` only where more contrast needs its own (otherwise more contrast uses the scheme's file). Both files have the same shape and share the entry's one `alt`: they're the same picture, never a different one. The dark file is one of two kinds, chosen per picture: **dark lighting**, the same scene as it naturally looks at night or in dim light (moon and stars instead of the sun, lit windows, lamps on), or **dark canvas**, the same drawing redrawn on a dark canvas with the light falling the same way (shadows stay darker, highlights lighter). Use one you're given as is, or regenerate it with an image model from the light file; never make it by colour correction, tinting, a filter, an inversion or any other pixel transform of the light file (a darkened photo is a blue day; an inverted drawing swaps its shadows and highlights). The same goes for more-contrast files. The file shown follows the scheme of the picture's own place on the page (the page's, the system's, or a band with its own `data-scheme`), switches without a flash or a jump, and only the file in use is downloaded. In code, the same on `Image` (`dark`, `contrast`), `Hero` `picture` and `EmptyState` `illustration`; a drawing that should simply follow the theme's colours is better as one SVG on colour roles than as two files.
8. **Check:** `npx design-library-check-content --templates src/templates` (every id exists, every file is in `assets/`, every entry has `alt` unless it's decorative, every `dark`, `contrast` and `alternate` file exists and has its picture's shape, every SVG is safe); `npx design-library-check-svg` for SVGs outside a template; the visual probe's VR1, VR2 and VR6 rows in [step 8](8-review.md). How the library's own pictures were made: [Images](https://prabinpebam.github.io/design-library/docs/#images.md).

## Illustrations

Drawn art (a spot on an empty state, an opening's drawing, a loader) is an `Illustration` (0.5.0-beta.1), drawn inline so it follows the theme; a photo, or art that can't follow tokens, stays an `Image`. See it live on the library's [Illustration](https://prabinpebam.github.io/design-library/#/illustration) page.

1. **Draw it as an SVG with a `viewBox`,** by hand or in a vector tool: the picture generator makes raster pictures only, so a vector is drawn, never traced from one.
2. **Colour with the role classes,** never literal colours: `class="ink"` (lines), `muted` (secondary lines), `fill` (large shapes), `surface` (what sits on the page's background), `accent` (one highlight). They read `--c-illustration-{role}`, so one file follows light, dark, more contrast and forced colours. Use `currentColor` or `none` where a shape has no role. Only art that can't (a painting) gets a `dark` file, same shape.
3. **Art per size (optional):** wrap each version in a group marked `data-size="compact"` (below 24rem wide), `"regular"` (to 48rem) or `"wide"` (from 48rem); the illustration shows the one that fits its own width, not the window's. Or give `src` one file per size: `{ compact, regular, wide }`.
4. **Motion (optional):** mark a moving part `data-motion="draw" | "fade" | "float" | "pulse" | "spin"`, never your own `@keyframes`, `<animate>` or script. `play="once"` (default, the first time it's seen), `"hover"` (while it, or its card or link, is pointed at or focused), or `"loop"` (only for a wait or a short loader; it always shows a Pause control). Under reduced motion every part holds its resting frame, so draw the resting frame complete.
5. **Name it or hide it:** `label` says what it shows when it carries meaning (`role="img"`); `decorative` when the words beside it say everything.
6. **Use it:** in code `<Illustration src="/art/lighthouse.svg" ratio="wide" label="…" />` (give a `ratio` for a file, so its space is held while it loads), or children with the `<svg>` inline; in `EmptyState` `illustration` and `Hero` `media`. From data, an `assets.json` entry with an `.svg` `src` and `"illustration": { "play": "hover" }`; then the `illustration` block (`picture`, `ratio`; in `split`, `grid` and `hero.media`), card and prose pictures draw it through `Illustration`.
7. **Check:** `npx design-library-check-svg` (scripts, event attributes, `foreignObject`, outside references, `@import`, self-animation, a missing `viewBox`, literal colours in role-class art, unknown `data-size` and `data-motion` names, each at its element); `design-library-check-content` runs it on template assets. Then open it in light, dark and more contrast, at 320 px and wide, with reduced motion on and off.

## Adapt a template as your own

Two ways in: **start empty** with `npx design-library-new-template {id}` (below, "Start a template from nothing"), the usual choice when your site's screens differ from every template's; or **copy the nearest template** into a new namespace and change it there, when most of its screens are ones you'll keep. Either way, finish with the prune step. Never edit core, and never import another template's parts.

1. **Choose an id:** lower case, one word or kebab case, unique (`harbour`). It is the namespace of everything in the template.
2. **Copy the folder** `node_modules/@design-library/templates/{nearest}/` to `src/templates/{id}/`.
3. **Rename the namespace everywhere** in the new folder:

   | Where | Change |
   | --- | --- |
   | `template.json` | `id`, `title`, `summary`, `version` to `0.1.0` |
   | `content.schema.json` | `$id` to `https://design-library.local/templates/{id}/content/1`, `title`, `description`; custom block `const` types to `{id}.…` |
   | Every content file | `"template": "{id}"` |
   | Custom parts (if any) | Manifest `parts` names `{id}.{Name}`, block types `{id}.{name}`; `data-dl="{id}-{part}"` in TSX and CSS; tokens `t.{id}.*` in `tokens/tokens.json` and `--t-{id}-*` in CSS; story `component: '{id}.{Name}'` |
   | `registry.tsx` | Block type keys and layout names to the new namespace |
   | `types.ts` (application templates) | Rename the record types if you like; keep `$defs/record.{layout}` in `content.schema.json` in step with them (Step 2) |
   | `index.ts` | `import { loadTemplate } from '@design-library/core/render';` in place of `'../load'` |

   Then search the folder for the old id; nothing should remain.
4. **Register it** in `src/templates/index.ts`: `import harbour from './harbour';` and add it to an exported `templates` list. Your app renders it with `import harbour from './templates/harbour'`.
5. **Reshape the screens:** in `template.json`, keep, remove or add `layouts` (one per screen: `id`, `title`, `component`, `content`, `regions`), and group them:
   - `home`: the first screen, its content at `content/{home}.json`. It is also listed in one flow (usually the first section's), where it isn't counted.
   - `sections[]`: `{ id, title, summary, flows: [{ id, title, summary, screens: [layout ids] }] }`. Every screen sits in exactly one flow.
   - **Grouping rule (checked):** every group holds **3 to 5 items**. The top level's items are the home, each section, and "Own parts" if you have custom parts. A section's items are its flows of three or more screens (each counts as **one** item, a group of its own) plus every screen of its shorter flows (each counts one); the home doesn't count. Each flow of three or more screens also holds 3–5 screens. Screens you haven't built yet count: list them as layouts with `"planned": true` and no content file. The smallest valid shape is a home plus two sections of three items each, for example section A with flows `[home, a, b]` (2 items) and `[c]` (1 item), and section B with flows `[d]` and `[e, f]`. A full example is below.
   - Content files live by group: `content/{home}.json`; `content/{section}/{layout}.json` for a flow of one or two screens; `content/{section}/{flow}/{layout}.json` for a flow of three or more. The check names the right path when one is wrong.
   - A state of a screen (a form's error, a list's empty state) is a layout with `stateOf` and a content file holding only `settings.state`.
6. **Write the content** for each built layout and `content/shared.json` (Step 2).
7. **Add custom parts** only where no core part fits (Step 4, step 6), each with tokens and stories. Their tokens live in `tokens/tokens.json`; `npx design-library-template-tokens --templates src/templates` writes `tokens/tokens.css` from it, so renaming a token is one edit and one command, never a hand-kept CSS file.
8. **Prune** what your site won't show, before you build on it: every copied screen, its content file and its place in a flow; every part, block, token, picture and story it brought. Keep the grouping rule (3–5 items per group) with `planned` screens you will build, never with screens you won't. Then `npx design-library-check-content --templates src/templates --src src` lists what's still unlisted or unrendered (a part file the manifest doesn't name, a template nothing renders).
9. **Check and open:** run the checks below, then open the screen in your app.

### Start a template from nothing

```sh
npx design-library-new-template harbour --title "Harbour Books" --part compounds/BookShelf
```

It writes `src/templates/harbour/` (`--templates` for another folder) with nothing copied from another template: the manifest below (a home and six planned screens in two sections, the smallest shape the grouping rule allows), the content schema, `content/home.json` and `content/shared.json`, an empty `assets.json`, `index.ts`, and `tokens/tokens.json` with its generated `tokens.css`. Each `--part fundamentals|compounds|layouts/{Name}` adds the part's TSX, CSS (reading only its own token), a stories file and a token; a fundamental or compound also gets a block type `{id}.{name}`, its schema in `content.schema.json`, an `example` in the manifest's `parts.blocks` and an entry in `registry.tsx`. The result passes the content check as it is. Then register it in `src/templates/index.ts`, prune and rename the planned screens (step 8 above), and write the home page.

The files it writes, by hand: the same as adapting, starting from an empty folder. The worked example is `node_modules/@design-library/templates/harbour/` (one built screen, six planned), shown by [`apps/example`](https://github.com/prabinpebam/design-library/tree/main/apps/example) in the library repository.

**`template.json`**, the smallest valid manifest (required: `id`, `version`, `title`, `summary`, `contentSchema`, `contentVersion`, `layouts`, `sections`):

```json
{
  "$schema": "../../../node_modules/@design-library/core/schemas/template.schema.json",
  "id": "harbour",
  "version": "0.1.0",
  "title": "Harbour Books",
  "summary": "A small bookshop’s site: what’s new, the shop and how to visit.",
  "contentSchema": "content.schema.json",
  "contentVersion": 1,
  "shared": "content/shared.json",
  "assets": "assets.json",
  "home": "home",
  "sections": [
    { "id": "shop", "title": "Shop", "summary": "Find a book and reserve it.", "flows": [
      { "id": "browse", "title": "Browse", "summary": "See what’s new and open a book.", "screens": ["home", "new-books", "book"] },
      { "id": "reserve", "title": "Reserve", "summary": "Hold a book to collect in the shop.", "screens": ["reserve"] } ] },
    { "id": "visit", "title": "Visit", "summary": "Find the shop and its events.", "flows": [
      { "id": "find", "title": "Find the shop", "summary": "Opening hours and the way there.", "screens": ["visit"] },
      { "id": "events", "title": "Events", "summary": "Readings and the book club.", "screens": ["events", "event"] } ] }
  ],
  "layouts": [
    { "id": "home", "title": "Home", "component": "SiteLayout", "content": "content/home.json",
      "regions": [
        { "id": "header", "shared": true, "accepts": ["site-header"] },
        { "id": "main", "accepts": ["*"] },
        { "id": "footer", "shared": true, "accepts": ["site-footer"] } ] },
    { "id": "new-books", "title": "New books", "component": "SiteLayout", "planned": true },
    { "id": "book", "title": "Book", "component": "SiteLayout", "planned": true },
    { "id": "reserve", "title": "Reserve a book", "component": "SiteLayout", "planned": true },
    { "id": "visit", "title": "Visit", "component": "SiteLayout", "planned": true },
    { "id": "events", "title": "Events", "component": "SiteLayout", "planned": true },
    { "id": "event", "title": "Event", "component": "SiteLayout", "planned": true }
  ]
}
```

Then `content.schema.json` (Step 2), `content/home.json` and `content/shared.json` (Step 2), `assets.json` (`{ "$schema": "../../../node_modules/@design-library/core/schemas/assets.schema.json", "assets": {} }`, pictures in `assets/`) and `index.ts`:

```ts
import type { StoryFile } from '@design-library/core/components';
import manifest from './template.json';
import assets from './assets.json';
import { loadTemplate } from '@design-library/core/render';
// import { registry } from './registry';   only with custom blocks, a bound layout or custom parts

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
  undefined, // registry
  Object.values(import.meta.glob<StoryFile>('./parts/*/*.stories.tsx', { eager: true, import: 'default' })),
);
```

## Your parts as blocks (0.4)

A fundamental or compound of your own that content places is a **block type** in your template's namespace, so a page document or a content file places it like a core block. Run `npx design-library-blocks "<the need>"` first: a core block that fits wins.

1. **Schema:** `$defs/{name}` in the template's `content.schema.json`, with `"type": { "const": "{id}.{name}" }` and a one-line `description` (the registry shows it).
2. **Manifest:** an entry in `template.json` `parts.blocks`: `type`, `schema` (`#/$defs/{name}`), `renders` (the part, `{id}.{Part}`) and an `example`, a whole block that is valid against the schema and uses only pictures in `assets.json`.
3. **Registry:** `registry.tsx` maps the type to the part, passing fields as props (pictures through `ctx`), and the template's `index.ts` passes the registry to `loadTemplate`.
4. **Place it** from a page document as `{ "type": "{id}.{name}", … }`. A data-driven site gives `loadSite` the template's registry: `loadSite({ site, pages, collections, assets, assetUrls, registry: template.registry })`. A slot (`split.start`, `grid.items`, `hero.media`) takes namespaced types too.
5. **See it in place:** `<SiteView site={partsSite(template)} />` (`@design-library/core/render`) opens one page per part with an `example`, placed through the registry with its pictures. A part with no stories file still gets a stub story from its example in the library.

`npx design-library-new-template {id} --part compounds/{Name}` writes all four for a new part. The content check validates each `example` against its schema and the registry against the manifest; the worked example is the Conference template's `conference.countdown` and `conference.sponsor-wall`.

## Customize a template or extend the library?

A template may look like any product; the library stays generic so every other product can use it too. For each thing your template needs, ask in order and stop at the first yes:

1. **Is it reachable already?** A prop or size, a slot, a context attribute (`data-density`, `data-scheme`), your theme or theme settings, your own `t.{id}.*` tokens, or a part inside your template ([the seam ladder](../AGENTS.md#the-seam-ladder)). Then it's **yours**: do it in the template.
2. **Is it only a value?** A colour, radius, size or font on a seam that exists. It goes in your **theme or tokens**, never as a new library default. For a look that differs from the library's across your whole template (its own surfaces, text, accent, radii), use the **template theme**: `tokens/theme.json` in the template folder re-decides core semantic roles (`color.*`, `radius.*`, `state.*`) and component tokens (`c.*`), never primitives (`p.*`); each value is raw or `{ "light": …, "dark": … }`. `npx design-library-template-tokens --templates src/templates` writes `tokens/theme.css`, scoped to `[data-template="{id}"]`, which `TemplateView` puts on each layout root (set it yourself on a root you render without `TemplateView`). Known limits today: menus and popovers rendered in a portal sit outside the scope, and the contrast check doesn't cover template themes, so check text contrast yourself (WCAG 2.2 AA, 4.5:1).
3. **Would a second, unrelated product need it?** Name one (a video editor, an IDE, a dashboard). If it's structure or behaviour (a dense row, a touching button group, a filled field, a menu's shortcut column, a panel width that can be set), ask for a **library change**: a generic prop, variant or token, named by what it does.
4. **Does a library rule forbid it?** (Switches for binary settings, no one-sided borders, the text and target sizes.) Keep the rule; use only what it allows, and record the difference for the product owner to decide.
5. **Otherwise** it is a **part inside your template**, built from library parts, styled under `[data-dl="{id}-{part}"]` with `t.{id}.*` tokens. A part that two templates need is a candidate for the library, by its own review.

Never in the library: a product's name in a prop, variant, token or selector (`variant="figma"`), a product's brand colour as a default, a template's tokens. Never in a template: a copy, wrapper or restyle of a library component's markup, `!important`, or raw values outside its tokens. In the library repository `npm run check:generic` fails on the first list. Worked example: the Design tool template rebuilt as a Figma look-alike ([Figma replica](https://prabinpebam.github.io/design-library/docs/#figma-replica.md), section 3).

## Do and don't

| Do | Don't |
| --- | --- |
| Change words and facts in content JSON | Change words in a template's TSX or a core component |
| Keep every custom name in the template's namespace | Reuse another template's id, parts or tokens |
| Start from the nearest template and remove what you don't need | Fork core layouts or blocks into the template |
| Plan screens you'll build later as `planned` layouts | Leave a screen in no flow, or in two |
| Raise `contentVersion` with a migration when the content's shape changes (Step 2) | Rename a block key and leave old content unchanged |

## Check it

| Check | Proves |
| --- | --- |
| `npx design-library-check-content --templates src/templates --index src/templates/index.ts` | Manifest, grouping (3–5 per group), file locations, schema, content, pictures, links and parts are all valid; the template is registered |
| `npx design-library-template-tokens --templates src/templates --check` | Every template token is named `t.{id}.{part}.{name}`, has a description and aliases a core semantic role; `tokens.css` is current (drop `--check` to write it) |
| `npx tsc --noEmit` | The registry, bindings and parts compile |
| `npx vite build`, then open each built screen | Every built screen renders, in light, dark and more contrast, at 320 px and wide |
| Read custom parts and their `tokens/tokens.css` against Step 4's rules | Tokens read semantic roles only; no styles in bindings; parts by child paths |

In the library repository, its templates live in `packages/templates/`, are listed in `packages/templates/index.ts`, and use `npm run check:content`, `npm run tokens`, `npm run tokens:check`, `npm run typecheck`, `npm run check:views`, `npm run check:parts`, `npm run agent:index` and `npm run build -w apps/library` (then open `site.html#/app/{id}/{layout}`).
