# How the library works: the contract

**Status:** the technical contract ([DoD Q152.1](definition-of-done.md#owner-instructions)), 2026-11-12, restructured from the earlier explainer. **In the library:** the [Design Library](http://127.0.0.1:8766/#/overview), where every token, component and template renders live.

> **TL;DR:** Every decision about how things look is a **token**. Components are built in four tiers on those tokens and are **sealed**: you change them through props, slots, context and tokens, never your own styles. Screens come from **content written as JSON**, checked against a schema and drawn by one renderer through a template's layouts. A template holds a product's brand values and compositions; core holds only generic patterns, with defaults that never move. Below, the library's rules are **57 numbered invariants**, each naming the check that enforces it or saying "unenforced". 26 are unenforced in whole or in part, and 4 only warn (K9's raw geometry also warns); after core hardening C1–C3 (Worker 109), 19 are unenforced; those are the gaps the [pressure-test loop](pressure-test-loop.md) and the [scorecard](library-scorecard.md) watch.

<figure class="slate-figure">
  <svg viewBox="0 0 960 430" role="img" aria-labelledby="hiw-title hiw-desc" data-slate-svg-motion="viewport" data-slate-safe-margin="24">
    <title id="hiw-title">Content becomes a screen through one renderer and four tiers on tokens</title>
    <desc id="hiw-desc">On the left, a content file written as JSON. An arrow leads to the renderer, which checks the content and picks the template's layout. A second arrow leads into a stack of five tiers: templates at the top, then layouts, compounds, fundamentals, and tokens at the bottom. Every tier above tokens reads only tokens for its look.</desc>
    <g id="hiw-content" data-slate-svg-step="0" data-slate-svg-effect="fade-rise">
      <rect x="24" y="130" width="212" height="170" rx="14" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="44" y="166" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Content</text>
      <text x="44" y="192" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16">Plain JSON data</text>
      <rect x="44" y="212" width="150" height="10" rx="5" fill="var(--color-neutral-stroke-2)"/>
      <rect x="44" y="234" width="120" height="10" rx="5" fill="var(--color-neutral-stroke-2)"/>
      <rect x="44" y="256" width="164" height="10" rx="5" fill="var(--color-neutral-stroke-2)"/>
    </g>
    <g id="hiw-arrow-1" data-slate-svg-step="1" data-slate-svg-effect="draw" fill="none" stroke="var(--color-brand-fg-1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M244 215 H282"/>
      <path d="M272 205 L284 215 L272 225"/>
    </g>
    <g id="hiw-renderer" data-slate-svg-step="1" data-slate-svg-effect="scale-in">
      <rect x="294" y="160" width="196" height="110" rx="14" fill="var(--color-neutral-bg-1)" stroke="var(--color-brand-stroke)" stroke-width="3"/>
      <text x="392" y="200" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700" text-anchor="middle">Renderer</text>
      <text x="392" y="226" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" text-anchor="middle">checks the schema,</text>
      <text x="392" y="248" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" text-anchor="middle">places each block</text>
    </g>
    <g id="hiw-arrow-2" data-slate-svg-step="2" data-slate-svg-effect="draw" fill="none" stroke="var(--color-brand-fg-1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M498 215 H536"/>
      <path d="M526 205 L538 215 L526 225"/>
    </g>
    <g id="hiw-tiers" data-slate-svg-step="2" data-slate-svg-effect="fade-rise">
      <rect x="548" y="24" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="62" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Templates</text>
      <text x="916" y="62" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">a product’s screens</text>
      <rect x="548" y="100" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="138" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Layouts</text>
      <text x="916" y="138" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">named regions</text>
      <rect x="548" y="176" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="214" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Compounds</text>
      <text x="916" y="214" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">arrangements for a need</text>
      <rect x="548" y="252" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="290" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Fundamentals</text>
      <text x="916" y="290" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">building blocks</text>
    </g>
    <g id="hiw-tokens" data-slate-svg-step="3" data-slate-svg-effect="fade-rise">
      <rect x="548" y="340" width="388" height="66" rx="12" fill="var(--color-neutral-bg-1)" stroke="var(--color-brand-stroke)" stroke-width="3"/>
      <text x="568" y="380" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Tokens</text>
      <text x="916" y="380" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">every look decision</text>
      <path d="M742 316 V336" fill="none" stroke="var(--color-brand-fg-1)" stroke-width="4" stroke-linecap="round"/>
    </g>
  </svg>
  <figcaption>Content is data; the renderer turns it into a template’s layout; every tier above tokens reads its look only from tokens.</figcaption>
</figure>

## How to read the contract

Each invariant has an ID, the rule, and how it's **enforced**:

- **Gate:** a command in `npm run check` fails when the rule breaks.
- **Warn:** a command reports it but doesn't fail, so it can be missed.
- **Probe:** a browser probe (`tools/*-probe.js`, shipped as `@design-library/core/probes/*`) that the [adversarial loop](adversarial-loop.md) runs on the screens a packet touched.
- **Sweep:** `npm run check:regression` (`tools/template-regression.mjs`). It's in the template worktrees' `package.json`, not in main's, and it isn't part of `npm run check`.
- **Unenforced:** nothing checks it; only review catches a break. Each unenforced invariant is a candidate for a new check (listed in [Uncovered and weakly enforced](#uncovered-and-weakly-enforced)).

The reasons and the detail live in the pages linked from each group; this page doesn't restate them. The [Template pressure-test loop](pressure-test-loop.md) cites these IDs at its gates, and the [Library scorecard](library-scorecard.md) maps its indicators to them.

## T: tiers

Detail: [Foundation](foundation.md), and [Templates and the library](templates-and-library.md#the-rule-library-or-template) for what goes where.

| ID | Invariant | Enforced by |
| --- | --- | --- |
| T1 | Each part is in exactly one tier (tokens, fundamentals, compounds, layouts, templates) and is made only from the tiers below it: a fundamental never imports a compound or layout, and a compound never imports a layout | **Unenforced** (holds today: 0 upward imports in `packages/core/react/fundamentals` and `compounds`, by a grep) |
| T2 | Templates, the library app and outside projects use core only through its public entries (`@design-library/core/*`) | **Unenforced** for templates; the library app is covered by **Gate** `check:views` (`tools/check-views.mjs`) |
| T3 | A need goes to core only when it passes the three questions: a second, unrelated product would use it; it's more than layout; every brand's look reduces to tokens. Otherwise it's a template part | **Unenforced** (judged at review; the evaluator records it in the boundary audit, RR11) |

## K: tokens

Detail: [Colour model](foundation.md#colour-model), [Token presets](foundation.md#token-presets-q70), [Brand colour](brand-colour.md).

| ID | Invariant | Enforced by |
| --- | --- | --- |
| K1 | Tokens are W3C DTCG JSON in `packages/core/tokens/`; `tokens.css` and `tokens.resolved.json` are generated and never edited by hand | **Gate** `tokens:check` (`agentic-craft/tools/build-tokens.mjs --check`) |
| K2 | Colour changes go through `colour.config.json` and `npm run tokens`, never the generated `tokens.colour.json`; space and shape through their configs | **Gate** `tokens:check` (`tools/colour.mjs --check`, `tools/space-shape.mjs --check`, `tools/token-contexts.mjs --check`) |
| K3 | Layers: primitives → semantic roles → component settings (`c.<component>.*`) → template (`tokens/theme.json`, part tokens `t.<template>.*`). Components read semantic roles and their own `c.*`, never primitives | **Unenforced** in core; **Warn** in templates and projects (`check:project` rule `primitive`, `packages/core/tools/check-project.mjs`) |
| K4 | Status meaning only through `color.status.*`; a template theme may never set it | **Gate** `tokens:check` (`tools/template-tokens.mjs`, R1) |
| K5 | `spectrum.*` and `set.*` tokens are used only for the purpose they declare | **Unenforced** (the purpose is in token data; nothing reads it) |
| K6 | Template part tokens alias core semantic roles | **Gate** `tokens:check` (`tools/template-tokens.mjs --check`) |
| K7 | Every text, focus and control pair passes contrast in light, dark and both contrast contexts; so does every pair a template theme redefines | **Gate** `tokens:check` (`agentic-craft/tools/check-tokens.mjs`, `packages/core/tokens/checks.json`); **Gate** `check:template-contrast` (`tools/check-template-contrast.mjs`) |
| K8 | Core CSS holds no literal look values: colours, sizes, timings, stacking orders, blur and alpha all come from tokens | Timings: **Gate** `check:motion`. Stacking: **Gate** `check:layers`. Blur and alpha: **Gate** `check:materials`. Change points: **Gate** `check:breakpoints`. Colours and sizes: **Unenforced** (0 hex today, by a grep) |
| K9 | Template part CSS sets no core token and writes type only from tokens; a brand value lives in token data: part-scoped core tokens in `tokens/theme.json` `$parts`, measured template values in `tokens/tokens.json` | **Gate** `check:project` (C1, Worker 109, `dl-integrate`): in a template's parts, `core-token` (any core or `--c-*` token set in part CSS) and `raw-size` on type (`font-size`, `letter-spacing`, `line-height`, `font`, `word-spacing`) are errors; `npm run tokens` validates `$parts` (own-namespace selectors, core token names, no primitives, no `color.status.*`) and allows a raw `rem`/`em` template token only as a `dimension` with `$extensions["org.design-library"].measured`. Raw geometry (widths, tracks) stays a counted **Warn** (`raw-size`). L0 had 47 literals ([LG3](library-scorecard.md#fix-list-request-log-format)); C1 moved all 178 core-token settings (Slack 101, Word 72, IKEA 5) and 9 raw type values, with the sweep at 0 different |

## S: sealed components and the seam ladder

Detail: [Seam ladder](pressure-test-loop.md#1-the-seam-ladder), [Foundation](foundation.md).

| ID | Invariant | Enforced by |
| --- | --- | --- |
| S1 | No core component takes `className` or `style`; it changes only through props, slots, context attributes and tokens | **Gate** by type: no such prop exists (`npm run typecheck`, `tsc -p apps/library`) |
| S2 | Nothing outside a component selects its `data-dl` name or reaches into its parts | **Gate** `check:project` rule `core-selector` (error, `--strict`), every attribute-selector form: single, double or no quotes and the `~=`, `|=`, `^=`, `$=`, `*=` operators (L1a, F19); descendant part paths in any quote form: rule `part-path`; **Gate** `check:views` for the library app |
| S3 | A compound, layout or template part reaches its own parts by child paths, never by descendant selectors | **Gate** `check:parts` (`tools/check-parts.mjs`) in core; **Gate** `check:project` rule `part-path` in templates |
| S4 | Nobody copies, wraps or rebuilds a core component: no raw interactive markup and no hand-built widget roles (`role="dialog"`, `"table"`, `"menu"`) in parts | Raw markup: **Warn** `check:project` rule `raw-markup`. Widget roles on plain markup: **Gate** `check:project` rule `widget-role`, an error in template parts, also for string-valued expressions (`role={'dialog'}`) and `aria-modal` (C2, Worker 109; L1a, F21; missed in L0: LG4, LG5) |
| S5 | Seams are tried in order: prop, slot, context, theme, template part, core change. Steps 5 and 6 are findings and get logged | **Unenforced** (review, and the boundary audit) |
| S6 | Native controls that core replaces (`<select>`) aren't used | **Gate** `check:project` rule `native-select` |
| S7 | A binary setting is a Switch unless a written `binary-setting:` reason says otherwise | **Gate** `check:project` rule `toggle-justification` |

## V: views assembled from data

Detail: [Templates, content and customization](foundation.md#templates-content-and-customization).

| ID | Invariant | Enforced by |
| --- | --- | --- |
| V1 | Library and template views hold no styles; they assemble core components from data | **Gate** `check:views` (`tools/check-views.mjs`); **Gate** `check:project` rule `view-style` |
| V2 | Screen content is pure JSON, valid against its template's schema, with every reference (picture, route, icon) resolving | **Gate** `check:content` (`packages/core/tools/check-content.mjs`) |
| V3 | No words written in code, and no page-specific code (a literal route compared in TSX) | **Warn** `check:project` rules `words-in-code` and `page-specific`. The words themselves: **Gate** `npm run check:copy` (C3, `tools/check-copy.mjs`): banned words, "click", three dots and straight quotes (CP1–CP4) fail over core stories, the library's page data and template content (replicas keep their reference's words, so CP1–CP2 warn there); sentence case and action length (CP5, CP6) warn. Debt present at C3 is listed in `tools/copy-baseline.json` (29 findings) and warns until a copy pass |
| V4 | The agent index and the consumer guides match the source | **Gate** `agent:index:check` (`tools/agent-index.mjs --check`); **Gate** `check:names` (`tools/check-names.mjs`) |

## P: templates

Detail: [Templates and the library](templates-and-library.md), [Replica method and rules](replica-rules.md).

| ID | Invariant | Enforced by |
| --- | --- | --- |
| P1 | A template is one folder: `template.json` manifest, content schema, `content/*.json`, `assets.json` and pictures, `tokens/theme.json`, and `parts/` | **Gate** `check:content` |
| P2 | A template's parts are named in its namespace (`data-dl="<template>-…"`, `t.<template>.*`); core never carries a template namespace | Core side: **Gate** `check:generic` (`tools/check-generic.mjs`). Template side: **Unenforced** (holds today by a grep) |
| P3 | Brand values (colours, fonts, shape, component sizes) live in `tokens/theme.json`, never in part code; part CSS has no colour literals | Theme: **Gate** `tokens:check`. Part CSS colours: **Gate** `check:project` rule `colour-literal`, an error in template parts for hex, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()` and `color()` (L1a, F20; a mask stop is `black` or `transparent`) Component settings: see K9 |
| P4 | A part moves into core only when a second, unrelated template needs it (the rule of two), with its look as `c.*` tokens and the old parts deleted | **Unenforced** (review) |
| P5 | A replica uses only invented names, copy and pictures, and the library's own icons and open fonts | **Unenforced** (evaluator licence audit, [RR4](replica-rules.md#the-rules)) |

## C: theming and contexts

Detail: [Colour model](foundation.md#colour-model), [Density: content and chrome](foundation.md#density-content-and-chrome).

| ID | Invariant | Enforced by |
| --- | --- | --- |
| C1 | Light, dark, more contrast, density, reduced motion and materials are context attributes on an ancestor (`data-scheme`, `data-contrast`, `data-density`, `data-material`), followed by every component below it | Contrast: **Gate** `tokens:check`. Density chrome: **Probe** `context-probe.js`. Every component in every context: **Sweep** (light and dark only) |
| C2 | Built-in presets are read-only; a person's own presets are saved in their browser | **Unenforced** |

## R: scroll, clipping, motion, materials, layers, SVG and icons

| ID | Invariant | Detail | Enforced by |
| --- | --- | --- | --- |
| R1 | Every scroll region is a `ScrollArea` at its surface's edge; there's no raw `overflow: auto \| scroll` anywhere (one barless exception: Carousel's track) | [Scrolling](scrolling.md) | **Gate** `check:clipping` (`tools/check-clipping.mjs`); **Gate** `check:project` rule `scroll-region`; **Probe** `scroll-probe.js` |
| R2 | A clip appears only on the allow-list, with its reason; focus rings are never clipped | [Clipping](clipping.md) | **Gate** `check:clipping` (`tools/clipping-allow.json`); **Probe** `clipping-probe.js` |
| R3 | Motion uses duration and easing tokens, never `all`; reduced motion removes movement but keeps every confirmation | [Motion](motion.md) | **Gate** `check:motion`; **Probe** `motion-probe.js` |
| R4 | Blur and see-through fills only through material tokens, in frosted places, above the tint floor | [Materials](materials.md) | **Gate** `check:materials`; **Probe** `material-probe.js` |
| R5 | Every `z-index` reads a layer token | [Foundation](foundation.md) | **Gate** `check:layers` |
| R6 | Window-width change points come from the set | [Layout](layout.md) | **Gate** `check:breakpoints` (core fails, templates warn) |
| R7 | Every SVG is safe, has a `viewBox`, has no SMIL or its own `@keyframes`, and is coloured only by role classes | — | **Gate** `check:svg` (`packages/core/tools/check-svg.mjs`), on `.svg` files. Inline `<svg>` and `createElement('svg')` in template parts: **Gate** `check:project` rule `inline-svg` (C2; L1a, F21), unless a comment within two lines above says why (`inline-svg: <why>`, Word's two live rulers) |
| R8 | Icons are drawn by `Icon` under semantic names; a brand redraws them through `IconOverrides`; a template's own names come only from a `--custom` pack | — | **Warn** `check:project` rule `icon-name`. Custom names are typed by `defineIconPack(pack)` (`name()` for the pack's names, `of()` for names read from content); an `as IconName` cast in a template part is a **Gate** error, `icon-cast` (C2; LG8, Word's 45 casts and YouTube's 2 removed) |
| R9 | Probes in `tools/` and the copies shipped in the package are identical | — | **Gate** `probes:check` (`tools/probes.mjs`) |

## L: layout, spacing, states and noise on rendered screens

| ID | Invariant | Detail | Enforced by |
| --- | --- | --- | --- |
| L1 | Space comes from the scale and its roles; a group's inner space is never larger than the space around it; the layout owns space (gap and padding on the parent) | [Spacing](spacing.md) | **Probe** `spacing-probe.js` |
| L2 | Regions reflow down to 320 px with no page-level horizontal scroll; region geometry comes from layout, not drawn in pictures | [Layout](layout.md) | **Probe** `layout-probe.js`; pictures painting regions: **Probe** `noise-probe.js` row VN7 (C2), whatever the picture's role, and background-image gradients painting bands (L1a, F22) |
| L3 | Every state that can occur (loading, saving, success, error, empty, disabled) has its place, look, timing and announcement | [UI states](ui-states.md) | **Probe** `ui-states-probe.js`; per-component coverage: **Gate** `npm run check:states` (C3, `tools/state-coverage.mjs`): the matrix `tools/state-coverage.json` lists, per component, the states its props allow (disabled, loading, error, empty) and whether its stories show each (44 of 59 at C3); it fails when stale or when a shown state stops being shown |
| L4 | Every mark carries information; enclosures stay within the depth limit; one cue per meaning | [Visual noise](visual-noise.md) | **Probe** `noise-probe.js`; fills painted by a picture (decorative or `role="img"`) or a background-image gradient over a transparent region: **Probe** row VN7, and each painted fill counts toward VN5 (C2; L1a, F22: both planted forms fail) |
| L5 | Charts and visuals follow the representation rules | [Visual representation](visual-representation.md) | **Probe** `visual-probe.js` |

## A: accessibility floors

| ID | Invariant | Enforced by |
| --- | --- | --- |
| A1 | Text and non-text contrast meet WCAG 2.2 AA in every scheme | **Gate** `tokens:check`, `check:template-contrast` (see K7) |
| A2 | Widgets follow their WAI-ARIA APG pattern: roles, keys, focus moving and returning, Escape | Roles and ARIA attributes: **Probe** axe-core in the sweep (`npm run check:regression -- --axe`, C3, every screen and scheme, `.shots/regression/axe.json`). Keys, focus and Escape: **Unenforced** automatically (stories and evaluator; hand-built widget roles now fail `check:project` `widget-role`) |
| A3 | Interactive targets are at least 44 px, or have spacing that makes them equivalent | **Unenforced** (no probe measures targets) |
| A4 | Reduced motion and forced colours are respected; icons paint in `currentColor` | Motion: **Gate** `check:motion`. Icons: built in by `design-library-icons` (`packages/core/tools/icons.mjs`). Forced colours on screens: **Unenforced** |
| A5 | Accessible names exist for every control, picture and region | **Probe** axe-core in the sweep (`--axe`, C3): `button-name`, `link-name`, `image-alt`, `aria-input-field-name` and the rest of its name rules, on every working-copy screen in light and dark |

## Q: performance

Detail: the performance and perceived-performance skills. Nothing has been measured yet.

| ID | Invariant | Enforced by |
| --- | --- | --- |
| Q1 | Loading, rendering and bundle size have budgets, measured by one command against a committed baseline, with noise-aware regression checks | **Unenforced** (no benchmark exists; [scorecard D12](library-scorecard.md#baseline-score-q1513)) |
| Q2 | Every wait a person feels has feedback that fits its length, never blocks or loses input, and keeps the old view until the new one is ready | **Unenforced** (partly through L3 and the UI-states probe) |

## G: core stays generic, and the process that keeps it true

Detail: [Template pressure-test loop](pressure-test-loop.md), [Replica method and rules](replica-rules.md).

| ID | Invariant | Enforced by |
| --- | --- | --- |
| G1 | Core never names a product or holds a product's brand values (code, selectors, token names and values) | **Gate** `check:generic` (`tools/check-generic.mjs`) |
| G2 | A core change keeps every default: every other template and library page stays pixel-identical, except declared catalogue inventory | **Sweep** `check:regression` (`tools/template-regression.mjs`, `tools/regression-noise.json`); not in `npm run check` |
| G3 | Parallel template branches integrate one at a time, with the full sweep on the combined result before the next merge or refreeze | **Unenforced** (procedure; [pressure-test loop 5b](pressure-test-loop.md#3-end-to-end-procedure)) |
| G4 | Every core change is recorded in [Templates and the library](templates-and-library.md), with its reason and default | **Gate** by procedure: `npm run check:core-log` (`tools/check-core-log.mjs`, C2) fails when a core file changed since the frozen base isn't named there by file (case-insensitively), by its component, or for a shared stylesheet by any component it styles (L1a, F27; a change of line endings only is skipped), or a core token added or changed isn't named by its dotted name; run at P3 with `--doc` (this page lives in main's docs, not in the branches) |
| G5 | The same kind of miss twice adds a check or a "Rules agents miss" row in the packet that closes it | **Unenforced** (procedure; [pressure-test loop §7](pressure-test-loop.md#7-feedback-into-checks-and-agent-guidance)) |
| G6 | `npm run check` passes before any packet is called done or pushed | **Gate** by procedure (the guard hook doesn't run it). Line endings: `.gitattributes` (`* text=auto eol=lf`) checks out LF on every platform, so a fresh Windows clone with `core.autocrlf=true` passes (L1a, F23) |

## Uncovered and weakly enforced

| Kind | Invariants | Count |
| --- | --- | --- |
| Unenforced | T1, T2 (templates), T3, K3 (core), K5, K8 (colours and sizes), S5, P2 (template side), P4, P5, C2, A2 (keys and focus), A3, A4 (forced colours), Q1, Q2, G3, G5 | 18 (P3 part colours gate since L1a, F20) |
| Warning only (can be missed) | K3 (templates), K9 (raw geometry only; core tokens and type gate since C1), S4 (raw markup; widget roles gate since C2), V3, R8 (`icon-name`; casts gate since C2) | 4 (plus K9's geometry) |
| Outside `npm run check` (run by procedure) | G2 (sweep), G4 (`check:core-log`); L1–L5 and parts of R1–R4 (probes) | 2 groups and 1 gate |

The cheapest moves from unenforced to gate: turn `raw-markup` into an error for `packages/templates` (S4; `core-token` and raw type became errors in C1, K9; widget roles, inline `<svg>` and icon casts in C2, S4, R7, R8); add widget roles and inline `<svg>` to `check:project` (S4, R7); add `check:regression` to the documented gate list for any packet that touches core (G2); and add a check that every core diff has a row in Templates and the library (G4).

## For agents

Building with the library: read `packages/core/AGENTS.md` first (the Never rules, the seams, the seven step guides, and "Rules agents miss"), and take exact names from `packages/core/agent/index.json`. Building a template or replica in this repository: follow the [Template pressure-test loop](pressure-test-loop.md), whose gates cite the IDs above. Scoring the library: the [Library scorecard](library-scorecard.md).
