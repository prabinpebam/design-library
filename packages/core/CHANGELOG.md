# Changelog

Every release of `@design-library/core` and `@design-library/templates` (they share one version). Newest first.

**Versions:** `MAJOR.MINOR.PATCH`. While the major is `0`, a **minor** release may break a public contract (a prop, a block type, a token name, a content schema version, an export) and says how to upgrade under "Breaking"; a **patch** never breaks one. From `1.0.0`, only a major release breaks.

**Contracts that carry their own version:** the content schemas (`schemas/*.json`, `$id …/1`), the colour config (`colour-config/2`, `CONTRACT` in `@design-library/core/colour`), and each template's `content.schema.json`. A release that changes one names it here with the migration.

## Unreleased

Nothing breaks.

- **Blocks:** `people` items, `person` and `byline` take an optional `picture`, an asset id from the template's `assets.json`, drawn as the person's portrait (initials when there's none). `person`'s `portrait: true` still shows initials alone.
- **Canvas:** `CanvasLook` takes an optional `image` (a picture's address, drawn over the fill) and `imageFit` (`cover`, `contain` or `tile`), so an editor can draw image fills.

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
