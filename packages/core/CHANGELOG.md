# Changelog

Every release of `@design-library/core` and `@design-library/templates` (they share one version). Newest first.

**Versions:** `MAJOR.MINOR.PATCH`. While the major is `0`, a **minor** release may break a public contract (a prop, a block type, a token name, a content schema version, an export) and says how to upgrade under "Breaking"; a **patch** never breaks one. From `1.0.0`, only a major release breaks.

**Contracts that carry their own version:** the content schemas (`schemas/*.json`, `$id …/1`), the colour config (`colour-config/2`, `CONTRACT` in `@design-library/core/colour`), and each template's `content.schema.json`. A release that changes one names it here with the migration.

## Unreleased: 0.2.0-beta.1, Beta for early trials (draft, Q99)

The first **Beta**: ready for early trials in separate projects (React 19 with Vite 8). Every UX framework now comes in two parts, a guideline to design with and an objective checklist with a browser probe to judge with, and the library passed them on every template layout.

### Breaking

- **Token removed:** `--c-description-list-stacked-gap`. DescriptionList now draws its two columns once and its rows share them (`subgrid`), the term column as wide as its longest term; a narrow container stacks with the role gaps. Remove any override of the old token.
- **StackedBar markup:** the bar is now a `bar` part inside the root, with a `legend` part under it (each part's name and share beside its colour; `legend={false}` only when the numbers are written beside the bar). CSS that reached the segments as `[data-dl='stacked-bar'] > span` reaches them as `[data-dl='stacked-bar'] > [data-dl-part='bar'] > span`.
- **Layouts' regions are ScrollAreas:** AppLayout, ChatLayout and EditorLayout regions, Dialog and Sheet bodies, Canvas, Board, Carousel thumbnails and AvatarGroup's list scroll inside `ScrollArea` (the library's overlay bar), not a raw `overflow: auto`. Custom CSS that styled those regions' scrollbars or padding needs to move to the content inside.

### Added

- **Frame** layout part and framing from the hierarchy (Q88–Q94): a frame is a unit outside and a root inside; standalone `hero` and `cta` blocks (`standalone: true`) are framed; the renderer passes `siblings`, `neighbours` and `region` to blocks.
- **Compact chrome** (Q97): `data-density="compact"` on a chrome region's root gives small text and the shape's small radius; a new shape option, Mild.
- **AppLayout `head`** slot; `ChatLayout` and `EditorLayout` mark their `main` landmark.
- **Blocks:** `people` items, `person` and `byline` take an optional `picture`, an asset id from the template's `assets.json`, drawn as the person's portrait (initials when there's none; `person`'s `portrait: true` still shows initials alone). A form block's fields take `answer` and `invalid` for its failed screen state, so the kept answers show and the fields at fault are marked. Both are additive: existing content stays valid.
- **Canvas:** `CanvasLook` takes an optional `image` (a picture's address, drawn over the fill) and `imageFit` (`cover`, `contain` or `tile`), so an editor can draw image fills.
- **Probes ship in the package:** `@design-library/core/probes/{name}-probe.js` (spacing, layout, context, noise, material, motion, scroll, clipping, ui-states, visual), browser scripts that score each framework's checklist rows on a running screen.
- **Guide:** step 8, review every screen with the adversarial loop (an evaluator who didn't build the screen runs the probes and the look rows; fix at the owner; repeat); "Your own pictures" in step 6; the package `AGENTS.md` names the loop and every probe.
- **Notifications:** each pill carries `data-dismiss` (`auto` or `manual`).
- **Frameworks, two parts each** (docs): spacing and framing, layout, density, visual noise, materials and elevation, motion, scrolling, clipping, UI states and visual representation, each with its probe, and [the adversarial loop](https://prabinpebam.github.io/design-library/docs/#adversarial-loop.md) that runs them.
- **Pictures:** the templates' pictures generated from one reference per template, portraits for their people, sponsor marks.

### Fixed

- Spacing and grouping on every template layout (inner gaps smaller than outer at every level); columns sized by their own content.
- Focus rings no longer cut by FloatingBar's scrolling row or EditorLayout's bar and panel heads; floating shadows kept in previews; ChatMessage file names wrap instead of truncating with no way to read them.
- ListItem's `busy` is locked (`aria-disabled`); Button and MenuButton pending spinners don't turn while hidden; ColourPicker's popup paints its own floating surface.
- SiteLayout's sticky header is matched by scroll padding; AppLayout's view stays the widest region.

### Upgrading from 0.1.1

Install both 0.2.0-beta.1 tarballs together, apply the three breaking notes above (nothing else breaks: every other change is additive), then run your checks (`guide/1-install.md`, "Check it") and review each screen with the loop (`guide/8-review.md`).

## 0.1.1 (2026-11-09)

Fixes from the first separate-project install ([Handoff readiness](https://prabinpebam.github.io/design-library/docs/#handoff-readiness.md), F15.R6). Nothing breaks.

- **Types:** `@design-library/core/colour` ships declarations (`colour/*.d.mts`), so a consumer's `tsc` reads it, and `@design-library/core/theme` with it, from `node_modules`.
- **Guide:** needs npm 10 or later (npm 9 fails on tarball installs).

## 0.1.0 (2026-11-09)

First version handed to separate projects.

- **Core:** tokens (W3C DTCG) with light, dark and more-contrast contexts, generated CSS; 113 components across fundamentals, compounds and layouts (`agent/index.json`); content schemas and the renderer (`/render`); presets (`/presets`); fonts (`/fonts`, twelve self-hosted variable faces); icons (`/icons`); the colour generator (`/colour`); motion and materials; the agent guide (`AGENTS.md`, `guide/`).
- **Templates:** blog, chat, conference, corporate, design, harbour, portfolio and projects.
- **Supported:** React 19 in the browser, bundled by Vite 8 (see `guide/1-install.md`, "Supported").

### Upgrading

Install the new tarballs (or release URLs) for both packages together, read this file from your installed version up, and run your checks (`guide/1-install.md`, "Check it").
