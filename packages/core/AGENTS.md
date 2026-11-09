# Design Library: guide for agents using it

You're building a website or app with this library. This file tells you where everything is, the rules you must never break, and the steps for each task. It is for **using** the library; changing the library itself follows the root `AGENTS.md` of [the library repository](https://github.com/prabinpebam/design-library).

**Version 0.1.1** (this guide matches `package.json` beside it; what changed between versions is in `CHANGELOG.md`). MIT licence. Supported: React 19 in the browser, bundled by Vite 8 ([step 1, "Supported"](guide/1-install.md#supported)).

**Where you are:** in your project this package is `node_modules/@design-library/core/`; every path below (`agent/index.json`, `guide/…`, `schemas/…`) is relative to it, and the index writes the same files as `@design-library/core/…`. Inside the library repository it is `packages/core/`.

**First, once per project:** add this to your project's own `AGENTS.md` (or your agent's instructions file), so every agent session finds this guide:

```markdown
## UI: Design Library
This project's UI uses @design-library/core. Before any UI work, read node_modules/@design-library/core/AGENTS.md
and follow it: its Never rules, the seam ladder, and the task steps in its guide/ folder.
```

## What it is

A token-driven, data-driven UI library. Four tiers sit on tokens, and screens are drawn from JSON:

| Tier | What it is | You use it by |
| --- | --- | --- |
| **Tokens** | Every design decision as data (colour, type, space, shape, motion, materials), generated into CSS custom properties | Choosing presets, and your brand colours and fonts with `@design-library/core/theme` (new token values are made in the library repository) |
| **Fundamentals** | Universal building blocks: text, buttons, fields, lists, Stack, Cluster, Grid… | Importing from `@design-library/core/react` and passing props |
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
| How a part looks in every context | [The hosted library](https://prabinpebam.github.io/design-library/): each component's `libraryPage` in the index |
| How the library works, for people | [How the library works](https://prabinpebam.github.io/design-library/docs/#how-it-works.md) and the rest of the [technical docs](https://prabinpebam.github.io/design-library/docs/) |
| Working examples | `@design-library/templates`: eight templates, all content as JSON (`node_modules/@design-library/templates/*/`); [`apps/example`](https://github.com/prabinpebam/design-library/tree/main/apps/example) in the library repository with the `harbour` template, the smallest app built by following this guide |

Search the index before writing anything: `Select-String -Path node_modules/@design-library/core/agent/index.json -Pattern '"name": "Card"'` (PowerShell) or `grep -n '"name": "Card"' node_modules/@design-library/core/agent/index.json`.

## Never

1. **Never style a view.** No `className`, `style`, CSS file, inline colour, size or duration in your pages, views or content. Arrange with layouts and Stack, Cluster and Grid; the look comes from tokens.
2. **Never fork a component.** Don't copy, wrap-and-replace, patch or restyle a core component, and never select `[data-dl='…']` in your CSS. Use the [seam ladder](#the-seam-ladder).
3. **Never read primitives.** Read semantic roles (`--color-text`, `--space-stack-item`) or a part's own tokens; never `p.*`, and `spectrum.*` and `set.*` only for their declared purpose (charts, identity), never for meaning.
4. **Never put markup in content.** Content is pure JSON: plain text, numbers, enums, ids and links. No HTML, Markdown, CSS, class names, colours or pixel values.
5. **Never edit a generated file.** `tokens.colour.json`, `tokens.space-shape.json`, `css/tokens.css`, `tokens/generated/*`, a template's generated `content.schema.json`, and everything in `agent/` are written by commands.
6. **Never add a core component to solve one product's need.** Make a custom part inside your template; promotion to core is a separate, reviewed change.
7. **Never use colour alone for meaning, or a button as an on/off toggle.** Status reads `color.status.*` with an icon or words; binary settings use `Switch`.
8. **Never hard-code words a person reads inside a component.** They come from content or props.
9. **Never make a scroll region yourself.** No `overflow: auto` or `scroll` on any element, in CSS or inline: it draws the browser's bar beside the content. Every scroll region is a `ScrollArea`, placed where the region meets its surface's edge, with padding on the content inside. A `TextArea` scrolls its own text and already uses the library's bar.

## Rules agents miss

These rules are easy to miss: each one is written down, but nothing at the moment you write the code points you to it. Before you call a screen done, go down this list. Each row names the seam to use and the check that catches a miss.

| Rule | Use | Not | Caught by |
| --- | --- | --- | --- |
| Every scroll region uses the library's scrollbar, with the bar at the surface's edge and focus never cut off | `ScrollArea` (`axis`, `maxSize`, `inset`; `contain` only in a popup or modal); layouts and Dialog, Sheet, Canvas and Board already have it | `overflow: auto` or `scroll`, a padded scroll box, a scroll box held in from its surface's edge | `check:clipping` in the library; [`tools/scroll-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/scroll-probe.js) on the screen (SB1–SB5) |
| Chrome is sized as chrome: small text and the shape's small corners in sidebars, inspectors, property and layers panels, details columns and editors; content stays at the body size | `data-density="compact"` on the chrome region's root (AppLayout's sidebar and details column and ChatLayout's sidebar have it; put it on an EditorLayout); see [Density: content and chrome](https://prabinpebam.github.io/design-library/docs/#foundation.md#density-content-and-chrome) | `size="s"` on every control in a panel, a radius override, compact on a main view or a document | [`tools/context-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/context-probe.js) (CX1–CX4) |
| Space comes from the layout and role tokens, from the hierarchy | Stack, Cluster, Grid, Section, a layout's own gaps | Margins, literal sizes, one equal gap between everything | [`tools/spacing-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/spacing-probe.js), `check:views` |
| Columns come from each group's own content: a label column as wide as its longest label, the rest to the values; a shared column only across the members whose alignment a reader sees | A compound that draws its own columns (DescriptionList, PropertyRow, Grid with `min`); `fit-content` and `subgrid` inside one group | A fixed label width, the page's grid or a window breakpoint deciding a panel's columns, text that wraps beside unused space | [`tools/spacing-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/spacing-probe.js) (SC16), with every panel open |
| Regions come from a layout, and the main region stays the widest and first: one `main`, a sticky header matched by scroll padding, source order as reading order, components that respond to their container | SiteLayout, AppLayout, ChatLayout, EditorLayout, ListDetail; `@container` inside components | Regions from loose `div`s, `order` or reversed flex, a window `@media` query inside a component, a fixed side column that squeezes the main one | [`tools/layout-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/layout-probe.js) (LY1–LY8) at 1000 and 320 CSS px |
| Colour means something only through semantic roles | `color.status.*` with an icon or words; text and surface roles | `p.*`, `spectrum.*` for meaning, colour alone | `tokens:check`, `check:views` |
| Every mark carries something nothing else carries: one boundary per group, members of an enclosed group bare, at most two enclosures deep, state cues only while the state is active, no one-sided stripe | Space first; a group's own boundary; Button `emphasis="quiet"` inside a toolbar, card or menu; state attributes (`aria-pressed`, `aria-selected`, a drag attribute) for state cues | A border on every member, a card in a card, a cue left on at rest, a stripe on one edge | [`tools/noise-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/noise-probe.js) (VN1–VN6), in light and dark |
| Layers stack through layer tokens | `layer.*` tokens; Dialog, Sheet, popups and FloatingBar | A literal `z-index` | `check:layers` |
| Motion runs through motion tokens and the motion parts, and nothing loops at rest | `Morph`, `Reveal`, `duration.*` and `easing.*`; a loading indicator shown only while loading | A literal duration or easing, an animated size outside the motion parts, an animation left running on something hidden | `check:motion`, [`tools/motion-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/motion-probe.js) (MV2, MV5, MV7, MV9) |
| Blur and see-through fills come only from materials, painted by the element that carries `data-material`; shadows only on what floats | `data-material` (chrome, floating, modal, veil) and `data-elevation`; `shadow.raised` and `shadow.overlay` | A `backdrop-filter` or translucent fill of your own, a shadow on a card at rest, the seam on one element and the paint on another | `check:materials`, [`tools/material-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/material-probe.js) (ME1–ME6) |
| Nothing clips without a reason, and focus rings are never cut off | The component's own crop or truncation | `overflow: hidden` on a wrapper | `check:clipping`, [`tools/clipping-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/clipping-probe.js) |
| A custom part reaches its own children by child paths | `> [data-dl-part='…']` | A descendant selector into another component's parts | `check:parts` |
| A binary setting is a switch; a choice from a list is a Select | `Switch`, `Select`, `SegmentedControl` | A button used as an on/off toggle, a native `<select>` | `check:views` (native selects), and review |
| Content is plain JSON | Text, numbers, enums, ids and links | HTML, Markdown, sizes or colours in content | `check:content` |

Missed rules share a cause: the rule lives in a document, while the code is written somewhere else. So each row points to one seam you can find in the component index (`agent/components/{Name}.json`), and a check that fails with the fix in its message. In the library repository, `npm run check` runs every static check at once.

## The seam ladder

When something doesn't look or behave as you need, take the first step that works:

| Step | Seam | Example |
| --- | --- | --- |
| 1 | A **prop or variant** the component already has | `<Button label="Delete page" emphasis="danger" size="l" />` (check `agent/components/Button.json`) |
| 2 | A **slot**: pass another part as children or a `ReactNode` prop | A `Badge` into a `Card`'s `meta`, buttons into its `actions` |
| 3 | A **context attribute** on an ancestor | `data-density="compact"` (app chrome: small text, tighter corners), `data-scheme="dark"`, `data-contrast="more"` |
| 4 | The **theme**: a preset, your brand colours and fonts (`@design-library/core/theme`) | `applyBrand({ colours: { 1: { seed: '#1f6f8b' } } })`, `applyFonts({ preset: 'bookish' })`, `data-space="loose"` ([step 3](guide/3-tokens.md)) |
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
| Use a template, then adapt one as your own | [guide/6-templates.md](guide/6-templates.md) | Ready |
| Apply the principles: the rules and decision procedure for each token category and component family | [guide/7-principles.md](guide/7-principles.md) (generated from `principles/principles.json`) | Ready |
| Decide how to show information: a visual (chart, icon, picture, illustration, media) or exact text | [Visual representation](https://prabinpebam.github.io/design-library/docs/#visual-representation.md): run the reasoning chain RC1–RC8 | Ready to follow; chart components and picture roles are planned (BP1–BP10), not built |

Steps are written in the order an agent usually needs them; each stands alone and ends with its checks.

## Checks

**In your project.** Each one exits non-zero and names the file and the fix.

| After you change | Run |
| --- | --- |
| Content JSON, a manifest or a template schema | `npx design-library-check-content --templates src/templates` (the folder holding your template folders; add `--index src/templates/index.ts` to check each is registered) |
| TypeScript or TSX | `npx tsc --noEmit` |
| Anything before you call it done | `npx vite build`, then open the screen in light, dark and more contrast, at 320 px and wide |
| A view, content or a custom part | Read it against the [Never](#never) rules and [Rules agents miss](#rules-agents-miss): no `className`, `style` or CSS in views; no scroll region outside `ScrollArea`; custom-part CSS reaches its children by child paths and reads only semantic roles or its own tokens. The library repository enforces these with `check:views`, `check:parts`, `check:clipping`, `check:materials` and `check:motion`; they aren't shipped. On the screen, run [`tools/scroll-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/scroll-probe.js) and [`tools/spacing-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/spacing-probe.js) in the browser console (`window.scrollProbe()`, `window.spacingProbe()`) |

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
