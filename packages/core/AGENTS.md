# Design Library: guide for agents using it

You're building a website or app with this library. This file tells you where everything is, the rules you must never break, and the steps for each task. It is for **using** the library; changing the library itself follows the root `AGENTS.md` of [the library repository](https://github.com/prabinpebam/design-library).

**Version 0.5.0-beta.1** (Beta, for early trials; upgrading: `UPGRADE.md`) (this guide matches `package.json` beside it; what changed between versions is in `CHANGELOG.md`). MIT licence. Supported: React 19 in the browser, bundled by Vite 8 ([step 1, "Supported"](guide/1-install.md#supported)).

**Where you are:** in your project this package is `node_modules/@design-library/core/`; every path below (`agent/index.json`, `guide/…`, `schemas/…`) is relative to it, and the index writes the same files as `@design-library/core/…`. Inside the library repository it is `packages/core/`.

**First, once per project:** add this to your project's own `AGENTS.md` (or your agent's instructions file), so every agent session finds this guide:

```markdown
## UI: Design Library
This project's UI uses @design-library/core. Before any UI work, read node_modules/@design-library/core/AGENTS.md
and follow it: its Never rules, the seam ladder, and the task steps in its guide/ folder. No screen is done until it
passes the adversarial loop in guide/8-review.md, scored by an evaluator who did not build it.
```

## What it is

A token-driven, data-driven UI library. Four tiers sit on tokens, and screens are drawn from JSON:

| Tier | What it is | You use it by |
| --- | --- | --- |
| **Tokens** | Every design decision as data (colour, type, space, shape, motion, materials), generated into CSS custom properties | Choosing presets, brand colours/fonts with `@design-library/core/theme`; template-owned brand compositions and selective contexts in `tokens.json` ([step 3](guide/3-tokens.md#context-dependent-template-tokens)); new core roles/scales in the library repository |
| **Fundamentals** | Universal building blocks: text, buttons, fields, lists, Stack, Cluster, Grid… | Importing from `@design-library/core/components` (or `/react`, the same plus the library's stories) and passing props |
| **Compounds** | Arrangements of fundamentals for a need: Card, Dialog, Toolbar, Navigation… | The same import; content through props and slots |
| **Layouts** | A screen or section with named regions: SiteLayout, AppLayout, ChatLayout, EditorLayout… | The same import, or by name in a template manifest |
| **Templates** | A collection of layouts for one kind of product, with a content schema, content JSON and any custom parts | `TemplateView` from `@design-library/core/render` with a template's content |

Components are **sealed**: no `className` or `style` props. Their look comes only from tokens; their content from props or content JSON.

## Find things here first

| You need | Read |
| --- | --- |
| Any exact name: a component and its props, a block type and its fields, a layout and its required settings, a template and its layouts, a token and its CSS variable, a preset, an icon, a schema, a command | `agent/index.json` (generated from source; never hand-edited) |
| One component's full contract: every prop with its type, default and comment, accessibility, keys, the tokens it reads, what it's built from | `agent/components/{Name}.json` (template parts: `{template}.{Name}.json`) |
| The content schemas | `schemas/` (`template.schema.json`, `content.schema.json`, `blocks.schema.json`, `assets.schema.json`) and each template's `content.schema.json` |
| An entry that isn't a component (`effects`, `theme`, `icons`) | The comment at the top of its source (`effects/index.ts`, `theme/index.ts`, `icons/sets.ts`) and its guide step; every entry is listed in `agent/index.json` → `package.exports` |
| How a part looks in every context | [The hosted library](https://prabinpebam.github.io/design-library/): each component's `libraryPage` in the index |
| How the library works, for people | [How the library works](https://prabinpebam.github.io/design-library/docs/#how-it-works.md) and the rest of the [technical docs](https://prabinpebam.github.io/design-library/docs/) |
| Working examples | `@design-library/templates`: eight templates, all content as JSON (`node_modules/@design-library/templates/*/`); [`apps/example`](https://github.com/prabinpebam/design-library/tree/main/apps/example) in the library repository with the `harbour` template, the smallest app built by following this guide |

Search the index before writing anything: `Select-String -Path node_modules/@design-library/core/agent/index.json -Pattern '"name": "Card"'` (PowerShell) or `grep -n '"name": "Card"' node_modules/@design-library/core/agent/index.json`.

## Never

1. **Never style a view.** No `className`, `style`, CSS file, inline colour, size or duration in your pages, views or content. Arrange with layouts and Stack, Cluster and Grid; the look comes from tokens.
2. **Never fork a component.** Don't copy, wrap-and-replace, patch or restyle a core component, and never select `[data-dl='…']` in your CSS. Use the [seam ladder](#the-seam-ladder).
3. **Never read primitives.** Read semantic roles (`--color-text`, `--space-stack-item`) or a part's own tokens; never `p.*`, and `spectrum.*` and `set.*` only for their declared purpose (charts, identity), never for meaning.
4. **Never put markup in content.** Content is pure JSON: plain text, numbers, enums, ids and links. No HTML, Markdown, CSS, class names, colours or pixel values.
5. **Never edit a generated file.** `tokens.colour.json`, `tokens.space-shape.json`, `css/tokens.css`, `tokens/generated/*`, a template's `tokens/tokens.css` (from its `tokens.json` by `npx design-library-template-tokens`), a template's generated `content.schema.json`, and everything in `agent/` are written by commands.
6. **Never add a core component to solve one product's need.** Make a custom part inside your template; promotion to core is a separate, reviewed change. A custom part composes core fundamentals (`Link`, `Heading`, `Image`, `Button`, `Text`), never raw `<a>`, `<h*>`, `<img>` or `<button>`, and custom parts stay at about a third of a page's elements ([the recipe](guide/recipe-brand-led-site.md)).
7. **Never use colour alone for meaning, or an unexplained button as an on/off toggle.** Status reads `color.status.*` with an icon or words; a binary setting is a `Switch` by default; a toggle button (`Button` with `pressed`) or a `Checkbox` only where a Switch doesn't fit the surface (a toolbar, a dense inspector), with its reason in a comment above it (`{/* binary-setting: … */}`); visibility (eye) and lock are the established `VisibilityToggle` and need no reason.
8. **Never hard-code words a person reads inside a component.** They come from content or props.
9. **Never make a scroll region yourself.** No `overflow: auto` or `scroll` on any element, in CSS or inline: it draws the browser's bar beside the content. Every scroll region is a `ScrollArea`, placed where the region meets its surface's edge, with padding on the content inside. A `TextArea` scrolls its own text and already uses the library's bar. A screen shown in a frame is a region of the page: show it with `ScreenPreview`, never a raw `<iframe>`.
10. **Never nest a page inside a page; one way to do each thing.** Fundamentals (text, image, button) are placed only at the page level. Compounds, sections and layouts are blocks: preset fixed configurations a page picks, choosing one of their variants and filling their fields; a template never adds, removes or rearranges parts inside a block or configures a new compound from parts. The only add inside a block is more of its own predefined repeating element (more photos in an image grid, more FAQ items), with reorder and remove; an extra part goes into the reusable block definition as an on/off option or a variant, never a one-off on one instance (owner 23:44). If a design can be reached both by page composition and by nesting, use the page and drop the nesting (owner, DesignUp, 2026-11-12, amended 23:41).

## Rules agents miss

These rules are easy to miss: each one is written down, but nothing at the moment you write the code points you to it. Before you call a screen done, go down this list. Each row names the seam to use and the check that catches a miss.

| Rule | Use | Not | Caught by |
| --- | --- | --- | --- |
| A template's own look (surfaces, text, accent, radii, component values) is a template theme, never a library default or a restyle | `tokens/theme.json` in the template (core semantic roles and `c.*` tokens, raw or `{ light, dark }`), generated to `theme.css` under `[data-template]` ([Customize a template or extend the library?](guide/6-templates.md#customize-a-template-or-extend-the-library)) | Selecting a core `data-dl` to restyle it, `p.*` primitives, a product's name or brand value in core | `design-library-check` (core `data-dl` selected); `check:generic` in the library |
| Every scroll region uses the library's scrollbar, with the bar at the surface's edge and focus never cut off; a screen shown in a frame is a region too | `ScrollArea` (`axis`, `maxSize`, `inset`; `contain` only in a popup or modal); layouts and Dialog, Sheet, Canvas and Board already have it; `ScreenPreview` for a screen in a frame (its document takes the library's bar) | `overflow: auto` or `scroll`, a padded scroll box, a scroll box held in from its surface's edge, a raw `<iframe>` showing a screen | `check:clipping` in the library; [`probes/scroll-probe.js`](probes/scroll-probe.js) on the screen, inside its frames too (SB1–SB5, SB9) |
| Chrome is sized as chrome: small text and the shape's small corners in sidebars, inspectors, property and layers panels, details columns and editors; content stays at the body size | `data-density="compact"` on the chrome region's root (AppLayout's sidebar and details column and ChatLayout's sidebar have it; put it on an EditorLayout); see [Density: content and chrome](https://prabinpebam.github.io/design-library/docs/#foundation.md#density-content-and-chrome) | `size="s"` on every control in a panel, a radius override, compact on a main view or a document | [`probes/context-probe.js`](probes/context-probe.js) (CX1–CX4) |
| Space comes from the layout and role tokens, from the hierarchy | Stack, Cluster, Grid, Section, a layout's own gaps | Margins, literal sizes, one equal gap between everything | [`probes/spacing-probe.js`](probes/spacing-probe.js), `check:views` |
| Columns come from each group's own content: a label column as wide as its longest label, the rest to the values; a shared column only across the members whose alignment a reader sees | A compound that draws its own columns (DescriptionList, PropertyRow); Grid for equal columns (`max` caps how many); `fit-content` and `subgrid` inside one group | A fixed label width, the page's grid or a window breakpoint deciding a panel's columns, text that wraps beside unused space | [`probes/spacing-probe.js`](probes/spacing-probe.js) (SC16), with every panel open |
| Regions come from a layout, and the main region stays the widest and first: one `main`, a sticky header matched by scroll padding, source order as reading order, components that respond to their container | SiteLayout, AppLayout, ChatLayout, EditorLayout, ListDetail; `@container` inside components | Regions from loose `div`s, `order` or reversed flex, a window `@media` query inside a component, a fixed side column that squeezes the main one | [`probes/layout-probe.js`](probes/layout-probe.js) (LY1–LY8) at 1000 and 320 CSS px |
| Colour means something only through semantic roles | `color.status.*` with an icon or words; text and surface roles | `p.*`, `spectrum.*` for meaning, colour alone | `tokens:check`, `check:views` |
| Every mark carries something nothing else carries: one boundary per group, members of an enclosed group bare, at most two enclosures deep, state cues only while the state is active, no one-sided stripe | Space first; a group's own boundary; Button `emphasis="quiet"` inside a toolbar, card or menu; state attributes (`aria-pressed`, `aria-selected`, a drag attribute) for state cues | A border on every member, a card in a card, a cue left on at rest, a stripe on one edge | [`probes/noise-probe.js`](probes/noise-probe.js) (VN1–VN6), in light and dark |
| Layers stack through layer tokens | `layer.*` tokens; Dialog, Sheet, popups and FloatingBar | A literal `z-index` | `check:layers` |
| Motion runs through motion tokens and the motion parts, and nothing loops at rest | `Morph`, `Reveal`, `duration.*` and `easing.*`; a loading indicator shown only while loading | A literal duration or easing, an animated size outside the motion parts, an animation left running on something hidden | `check:motion`, [`probes/motion-probe.js`](probes/motion-probe.js) (MV2, MV5, MV7, MV9) |
| Blur and see-through fills come only from materials, painted by the element that carries `data-material`; shadows only on what floats | `data-material` (chrome, floating, modal, veil) and `data-elevation`; `shadow.raised` and `shadow.overlay` | A `backdrop-filter` or translucent fill of your own, a shadow on a card at rest, the seam on one element and the paint on another | `check:materials`, [`probes/material-probe.js`](probes/material-probe.js) (ME1–ME6) |
| Nothing clips without a reason, focus rings and shadows are never cut off, and text is truncated only where its full text is one step away | The component's own crop or truncation; padding of at least a ring's reach (`--size-focus-width` + `--size-focus-offset`) inside any box that clips; text that wraps where nothing opens it in full | `overflow: hidden` on a wrapper, controls flush against a clipping edge, an ellipsis on text nothing links, opens or names | `check:clipping`, [`probes/clipping-probe.js`](probes/clipping-probe.js) (CL1–CL4; [Clipping](https://github.com/prabinpebam/design-library/blob/main/docs/clipping.md)) |
| A custom part reaches its own children by child paths | `> [data-dl-part='…']` | A descendant selector into another component's parts | `check:parts` |
| Every change, wait, failure and empty place shows itself at the smallest scope: a saving control stays focused and locked, a failed form marks its fields and keeps the answers, every error has a way on, an empty list says why in the list's own place | The controls' own `pending`/`busy` states; Skeleton inside an `aria-busy` region; Alert with `actions`, field `error`; EmptyState in the content's wrapper; `notify` (errors stay until closed); a form block's `answer`/`invalid` for its failed state | `disabled` while saving, a spinner for the whole page, an error with no action, a pill for a field's error, a blank container | [`probes/ui-states-probe.js`](probes/ui-states-probe.js) (US1–US6; [UI states](https://github.com/prabinpebam/design-library/blob/main/docs/ui-states.md)), with each screen state shown |
| Every picture and graphic has its words: alternatives say what it shows, icon-only controls have a name, parts of a whole are named beside their colours | Image `alt` (empty when decorative), Button `iconOnly` + `label`, StackedBar's legend | An alt that names the medium or a file, an unnamed icon button, colour as the only cue | [`probes/visual-probe.js`](probes/visual-probe.js) (VR1–VR7; [Visual representation](https://github.com/prabinpebam/design-library/blob/main/docs/visual-representation.md)) |
| A picture that differs by scheme is one picture with a file per scheme: same shape, one alt, swapped by the library for the scheme of its own place on the page; the dark file is the same scene at night (moon, lit windows, lamps) or the same drawing redrawn on a dark canvas, supplied or regenerated with an image model, never derived from the light file | `Image` `dark` and `contrast` (also `Hero` `picture`, `EmptyState` `illustration`, and a picture entry's `dark` and `contrast` in `assets.json`); `useRegionScheme` for a part that draws its own art; every version side by side on the library's [Pictures](https://prabinpebam.github.io/design-library/#/pictures) page | Two `Image`s shown and hidden with CSS per scheme, `<picture>` with `prefers-color-scheme` (misses the scheme control and dark bands), a dark or more-contrast file made by colour correction, tinting, a filter, `invert()` or any pixel transform of the light file (a blue day; swapped shadows and highlights), a different alt per scheme | `check:content` (each file exists and has its picture's shape), `check:svg`; the dark file's look by eye |
| Shapes on a picture and a picture's change on hover belong to the picture, so they keep its box, its alt, its triggers and reduced motion (0.5.0-beta.1) | `Image` `decoration` and `under`, `alternate`, `reveal(frame)` (also `Hero` `picture`, a hero block's or prose picture's `decoration` naming a template preset from `registry.decorations` (LR20), a picture entry's `alternate`); `Hero` `reserve` for openings that keep one height ([recipe step 1](guide/recipe-brand-led-site.md#1-find-the-core-part-first)) | An absolutely positioned `<svg>` or second `<img>` beside the picture, a hover handler and a timer of your own, a canvas that runs at rest or under reduced motion, a fixed `min-height` on an opening | [`probes/motion-probe.js`](probes/motion-probe.js), [`probes/visual-probe.js`](probes/visual-probe.js) (VR1) |
| Drawn art follows the theme, fits its own space and moves only through the library's motion parts (0.5.0-beta.1) | `Illustration` (role classes `ink`, `muted`, `fill`, `surface`, `accent`; `data-size` groups; `data-motion` parts with `play`; `label` or `decorative`); from data an `assets.json` entry's `illustration` and the `illustration` block ([guide 6](guide/6-templates.md#illustrations)) | An `<svg>` pasted into a view, literal colours or a second file per scheme for art that could use roles, `@keyframes`, `<animate>` or a script in the file, a loop without Pause, an `Image` of an SVG that should follow the theme | `check:svg`, `check:content`, [`probes/motion-probe.js`](probes/motion-probe.js) with reduce on and off |
| A brand's own icons replace the library's by name, so one glyph changes that icon in every component and layout that draws it | `npx design-library-icons <folder>` → `registerIconSet` (a whole set) or `setIconOverrides` / `<IconOverrides icons>` (a few names), from `@design-library/core/icons` and `@design-library/core/components` ([guide 3](guide/3-tokens.md#your-own-icons)) | An `<svg>` drawn in a component or view, a forked Button or Rating to change its icon, an icon name the library doesn't have (a logo mark is an `Image`) | `design-library-check` (`icon-name`), development warnings for unknown names and missing `viewBox` |
| A binary setting is a Switch by default; a toggle button or a checkbox needs a written reason; visibility and lock are eye and lock toggle buttons; a choice from a list is a Select | `Switch`, `Select`, `SegmentedControl`; `Button` with `pressed` or a `Checkbox` where a Switch doesn't fit (a toolbar, a dense inspector, formatting such as Bold), with `{/* binary-setting: <why a Switch doesn't fit> */}` within the three lines above it; for showing or hiding an item, or locking it, `VisibilityToggle` (the eye and padlock pattern: `aria-pressed`, a name that never changes, "Show Logo" / "Lock Logo"; no reason needed, Q125) | A toggle button or a standalone checkbox with no reason, a Switch for visibility, a Button that changes its look to fake a pressed state, a native `<select>` | `design-library-check` (`toggle-justification`, error), `check:views` (native selects), and review |
| A field's leading swatch or icon is as far from the field's top, start and bottom edges as each other (Q127) | The field's own leading slot: `leading` (icon) or the colour field's swatch on `TextField`, `NumberField`, `Select`; the library sizes that cell square to the box at every size and density | Padding, a margin or a wrapper around a leading mark in a view or template, or a custom leading element outside the slot | `spacing-probe` SC18 (`@design-library/core/probes/spacing-probe`, `spacingProbe().rows.SC18`, ± 1 px) |
| Content is plain JSON | Text, numbers, enums, ids and links | HTML, Markdown, sizes or colours in content | `check:content` |
| Where a page change lands is the router's: the top (or the anchor) by default, the same place between sibling pages when asked, back to the top from a link to the shown page when asked | `Router` `scroll` (`'keep'` or a function per change), `focus` as a function, `again: 'top'`; `glide={{ pace: 'distance' }}` so a short glide is quicker than a long one (`glide(to, { pace })` in your own code; 0.5.0-beta.1); in data, a collection page's `"between": "keep"` and `site.json` `"again": "top"` | `window.scrollTo` or a scroll helper after a route change, a hand router, a query string used only to keep the place | `check:content` (`between` only on a collection page), and review on the [Routing](https://prabinpebam.github.io/design-library/#/routing) page |

Missed rules share a cause: the rule lives in a document, while the code is written somewhere else. So each row points to one seam you can find in the component index (`agent/components/{Name}.json`), and a check that fails with the fix in its message. In the library repository, `npm run check` runs every static check at once.

## The adversarial loop

No screen is done until it passes the loop ([guide/8-review.md](guide/8-review.md)): **create** with part 1 of each framework the screen touches; an **evaluator who did not build it** (a fresh session, a review agent or a person, given only the routes, windows, schemes and states) writes the hierarchy tree, runs every probe and scores every part 2 row with evidence; **fix** each fail at its owner (your theme → layout choice → props and slots → your custom part → content; never the rendered page); **repeat** until every framework's pass rule holds. Frameworks: spacing and framing, layout, visual noise, materials and elevation, motion, clipping, UI states, scrolling, chrome context, visual representation; the probes and pass rules are in step 8.

## The seam ladder

When something doesn't look or behave as you need, take the first step that works:

| Step | Seam | Example |
| --- | --- | --- |
| 1 | A **prop or variant** the component already has | `<Button label="Delete page" emphasis="danger" size="l" />` (check `agent/components/Button.json`) |
| 2 | A **slot**: pass another part as children or a `ReactNode` prop | A `Badge` into a `Card`'s `meta`, buttons into its `actions` |
| 3 | A **context attribute** on an ancestor | `data-density="compact"` (app chrome: small text, tighter corners), `data-scheme="dark"`, `data-contrast="more"` |
| 4 | The **theme**: a preset, your brand colours and fonts (`@design-library/core/theme`), and **theme settings**: the component tokens on the published allow-list `tokens/settings.json` (each component's `settings` in `agent/components/{Name}.json`), set with `applySettings({...})` or `settingsCss({...}, selector)`, which refuse any other name. Every other `--c-*` token is private | `applyBrand({ colours: { 1: { seed: '#1f6f8b' } } })`, `applyFonts({ preset: 'bookish' })`, `data-space="loose"`, `applySettings({ '--c-site-layout-gap': 'var(--space-stack-section)', '--c-site-layout-padding-start': '0px' })` ([step 3](guide/3-tokens.md)) |
| 5 | A **custom part inside your template** (fundamental, compound, layout or block type) with its own `t.{template}.*` tokens | `conference.SponsorWall` in `@design-library/templates/conference/parts/` |
| 6 | A **core change**: a new variant or slot, reviewed on its own | Only when two or more products need it |

## Tasks

| Task | Steps | Status |
| --- | --- | --- |
| Install and integrate into a website or app | [guide/1-install.md](guide/1-install.md) | Ready |
| Write a content or view schema (JSON) and its content | [guide/2-content.md](guide/2-content.md) | Ready |
| Customize tokens: presets, colour, type, space, shape, materials, motion | [guide/3-tokens.md](guide/3-tokens.md) | Ready |
| Customize fundamentals and compounds through public seams | [guide/4-components.md](guide/4-components.md) | Ready |
| Use a layout, or make one inside a template | [guide/5-layouts.md](guide/5-layouts.md) | Ready |
| Build a brand-led site: core parts first, the seams for colour, type and frame, then custom parts that compose core, about a third of a page at most | [guide/recipe-brand-led-site.md](guide/recipe-brand-led-site.md) | Ready |
| Use a template, then adapt one as your own (or start empty: `npx design-library-new-template {id}`, then prune) | [guide/6-templates.md](guide/6-templates.md) | Ready |
| Apply the principles: the rules and decision procedure for each token category and component family | [guide/7-principles.md](guide/7-principles.md) (generated from `principles/principles.json`) | Ready |
| Review a screen before calling it done: the adversarial loop, every framework's checklist and probe | [guide/8-review.md](guide/8-review.md) | Ready |
| Decide how to show information: a visual (chart, icon, picture, illustration, media) or exact text | [Visual representation](https://prabinpebam.github.io/design-library/docs/#visual-representation.md): run the reasoning chain RC1–RC8 | Ready to follow; chart components and picture roles are planned (BP1–BP10), not built |

Steps are written in the order an agent usually needs them; each stands alone and ends with its checks.

## Checks

**In your project.** Each one exits non-zero and names the file and the fix.

| After you change | Run |
| --- | --- |
| Content JSON, a manifest or a template schema | `npx design-library-check-content --templates src/templates` (the folder holding your template folders; add `--index src/templates/index.ts` to check each is registered, `--content <folder>` for content outside templates that names a ``, `--src src` to warn about templates nothing renders) |
| A section to place, before you write a part | `npx design-library-blocks "<the need>"` (for example `"a list of people with photos"`): the core blocks that fit, best first, each with its purpose, fields and an example in use, then template parts placed as blocks (the shipped templates' and yours under `--templates`, default `src/templates`). No words lists every block; `--full` prints whole examples, `--json` the lot. The library's Core first page shows the same registry. Place a core block when one fits |
| A data-driven site's JSON (site, pages, collections), before code reads it | `npx design-library-types` (finds `site.json` under `src/`, or `--site <folder>`; writes `site-types.ts` beside it, or `--out <file>`): an interface per collection from its `item` schema, and `CollectionItems`, `CollectionId`, `{Collection}Id`, `Ref`, `PageId`, `Route`, `DerivedName`, `SiteCollections`. Run it after editing the JSON; `--check` fails a build when the file is stale |
| A collection written from another source (an archive, a spreadsheet, a feed) | Give it `"generated": { "by": "scripts/{name}.mjs", "from": "data/{source}" }` and a script whose default export takes `{ from, collection, root }` and returns the items; then `npx design-library-generate` (finds the site under `src/`, or `--site <folder>`; `--only <id>`) writes them with `generated.at`, only when they changed, and runs the content check on the site. `--check` writes nothing and fails a build when a generated collection is stale or was edited by hand. Build time only: the site never runs a generator while it loads |
| A page's look, before you call it done | `npx design-library-review <url>…` (the probes at 1000 and 320 px, light and dark; needs `playwright-core`; [the light review](guide/8-review.md#the-light-review-a-site-of-words-and-pictures)) |
| A template's `tokens/tokens.json` | `npx design-library-template-tokens --templates src/templates` (writes `tokens.css`; `--check` only reads) |
| TypeScript or TSX | `npx tsc --noEmit` |
| Anything before you call it done | `npx vite build`, then open the screen in light, dark and more contrast, at 320 px and wide |
| A view, content or a custom part | `npx design-library-check` (add `--src` and `--templates` if your folders differ from `src/` and `src/templates/`). **Errors** are the [Never](#never) rules and [Rules agents miss](#rules-agents-miss), checked: `className`, `style` or an own stylesheet in a view; a native `<select>`; selecting a core component's `data-dl`; custom-part CSS reaching its parts by a descendant path instead of child paths (`> [data-dl-part=…]`); a raw scroll region or scrollbar styling; blur outside `var(--material-backdrop)`; a literal duration or curve, `transition: all`, the private duration scale. **Warnings** point at a missing seam: a core token set outside the theme settings, `!important`, a primitive read, raw sizes, a scaled root font size, a global selector, raw `<a>`, `<button>`, `<img>` or headings in a custom part (compose `Link`, `Button`, `Image`, `Heading`), words written in code, an unexplained clip, and, when the project has a site document (`site.json`, or `--site <folder>`), page-specific code: a literal route compared in TSX (`path === '/talks'`, `case '/talks':`), which belongs in that page's document. Words or files that must stay in code are declared in `design-library-check.json` (`{ "wordsInCode": { "allow": ["…"], "files": ["…"] }, "pageSpecificCode": { "files": ["…"] } }`); the summary names entries that allowed nothing. Each names file, line and fix. During the Beta nothing fails the run unless you pass `--strict` (errors) or `--strict=all` (both); `--share` prints each view's library and custom elements. On the screen, the evaluator runs every framework's probe from `probes/*.js` (`@design-library/core/probes/{name}`) in the browser ([guide/8-review.md](guide/8-review.md)) |
| A screen, before you call it done | The [adversarial loop](#the-adversarial-loop): a separate evaluator scores every checklist row with evidence; fix at the owner and repeat until each framework's pass rule holds |

**In the library repository** (changing the library itself), from its root:

| After you change | Run |
| --- | --- |
| Anything | `npm run check`: every static check below at once (tokens, views, layers, motion, materials, clipping and scroll regions, parts, content, the agent index) |
| Content JSON, a manifest or a template schema | `npm run check:content` |
| A template's `types.ts` (application records) | `npm run content:schemas`, then `npm run check:content` |
| A token config, a template's tokens | `npm run tokens`, then `npm run tokens:check` |
| TypeScript or TSX | `npm run typecheck` |
| A view or a template's bindings | `npm run check:views` |
| A custom part's CSS | `npm run check:parts`, `npm run check:materials`, `npm run check:motion`, `npm run check:clipping` |
| Core code, CSS or tokens while a template imitates a product | `npm run check:generic`: no product name in a prop, variant, selector or token, no product brand value as a default, no template token namespace in core ([Customize a template or extend the library?](guide/6-templates.md#customize-a-template-or-extend-the-library)) |
| A component, block type, template or token | `npm run agent:index` (keeps this index true; `npm run agent:index:check` fails when stale) |
| A principle or the elevation ladder (`principles/*.json`) | `npm run agent:index` (rewrites `guide/7-principles.md`; the library's Principles sections read the same file) |
| Anything before you call it done | `npm run build -w apps/library`, then open the screen |

## Words

| Term | Means |
| --- | --- |
| **Semantic role** | A token named for its job (`color.text`, `space.stack-item`); what components read |
| **Component token** | A part's own token (`c.button.*`, `t.conference.countdown.*`) aliasing semantic roles |
| **Primitive** | A raw value token (`p.*`); private |
| **Context** | A setting the whole subtree follows: scheme (light, dark), contrast (standard, more), motion (reduce), density, material |
| **Preset** | A saved set of token choices for one category (colour, type, icons, space, shape, material), or a global preset naming one per category |
| **Material** | The surface a part sits on (canvas, raised, floating, overlay…); frosted or solid by one global setting |
| **Template** | A folder with `template.json` (manifest), `content.schema.json`, content files, assets and custom parts |
| **Layout** | In a manifest: one screen (an id, a layout component and its regions) |
| **Region** | A named slot of a layout (`header`, `main`, `footer`) that holds blocks |
| **Block** | One typed piece of content in a region (`{ "type": "hero", … }`), drawn by a component through the registry |
| **Record** | An application layout's content: one typed object (a chat's threads, a board's issues) in place of regions |
| **Custom part** | A fundamental, compound, layout or block type that lives inside one template, named `{template}.{Part}` |
| **Seam** | A public way to change something: a prop, slot, context attribute, token or template part |
| **Principle** | A rule from one of the frameworks behind the library (colour, spacing, motion…); all of them, with their decision procedures, are in `guide/7-principles.md` |
