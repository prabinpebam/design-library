# Handoff readiness

> **Beta audit (Q99, F15.AUDIT draft, 2026-11-09 about 16:05 +05:30, worker 48):** re-run of every row below against the current source, plus 14 new rows for what changed since 0.1.1 ([Beta audit](#beta-audit-q99)). **Not yet Beta:** of the original 37 rows, 19 pass re-checked, 11 are carried to the Beta proof, 5 hold again only after the Beta release, and 2 regressed (B2 `validate-setup`, G7 the agent index); of the 14 new rows, 6 pass and 8 fail. The numbered gaps (15 open; E6 closed in this packet) in [Gaps to close](#gaps-to-close) are worker 47's to close, ending with the Beta release and a fresh separate-project proof.

> **TL;DR (0.2.0-beta.1, Beta for early trials, 2026-11-09 about 17:35 +05:30):** Ready to hand off for early trials in a separate React 19 + Vite 8 project. Install both tarballs from the [v0.2.0-beta.1 release](https://github.com/prabinpebam/design-library/releases/tag/v0.2.0-beta.1) and give the project's agent the [Get started "For AI agents" block](get-started.md#for-ai-agents) first. Proof: a fresh project outside this repository, installed from the release by the shipped guide, type-checked, built and served; it built a themed café site from its own template (copied from `harbour`); a separate evaluator scored it with all 10 probes at 1000 and 320 px in light, dark and more contrast. The round-1 fails were fixed at their owners and the release files re-uploaded. Round 2 was still running when the owner called the Beta (Q103), so its result isn't recorded here. The template sweep passes 168 of 168 layouts at 1000 px and 166 of 168 at 320 px. Open items are in [Beta known issues](#beta-known-issues).

Owner's words, 2026-11-09 07:48 +05:30 ([DoD Q81](definition-of-done.md#owner-instructions)): *"Are we ready to hand off this library to an agent in a separate project for that project to implement this library? Make a checklist o qualify the above question objectively and go through each one to make sure everything is addressed and there won't be any hccups when the AI agent in the other project ries to implement this."*

## How to read it

- **The test:** an agent with an empty folder, a product brief and nothing else from this repository. It may read what the package ships (inside `node_modules`) and public URLs. It installs packages only through its own registry.
- **Pass** means the evidence holds today; **fail** means it doesn't, and the row names the packet that fixes it; **owner** means only the owner can decide (licence, publishing, the distribution path), with a recommendation.
- Every row has evidence you can re-run or open: a command, a `file:line` or a URL.

## Distribution: how the other project gets it

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| D1 | A separate project can install the packages by one documented command | **Pass** | `npm run pack` ([tools/pack.mjs](https://github.com/prabinpebam/design-library/blob/main/tools/pack.mjs)) writes `.packages/design-library-core-0.1.0.tgz` and `design-library-templates-0.1.0.tgz`; a scratch folder outside the repository installed both with `npm install <core.tgz> <templates.tgz> react@19 react-dom@19` (17 packages, through the proxy). The packages stay `private`, so `npm publish` refuses them | F15.R2 |
| D2 | The distribution path is chosen | **Decided** (owner, 2026-11-09 07:57, [DoD Q82](definition-of-done.md#owner-instructions)) | (b): each version's two tarballs, built by `npm run pack`, attached to a GitHub release and installed by URL ([guide step 1](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/1-install.md)); (a) building them from a clone stays the fallback; no registry, no `npm publish` | Done in F15.R5: release [v0.1.0](https://github.com/prabinpebam/design-library/releases/tag/v0.1.0) with both tarballs (core 538 files, 1.34 MB; templates 258 files); the guide's URL answers 200 |
| D3 | `@design-library/templates` installs beside core without a registry | **Pass** | Installed together, `npm ls` shows `@design-library/templates@0.1.0 └ @design-library/core@0.1.0 deduped`; `npm run pack` refuses to pack when the two versions differ | F15.R2 |
| D4 | It needs no build step (or ships one) | **Pass, Vite only** | Ships TypeScript/TSX source and CSS; the consumer's Vite compiles it ([guide step 1, "Supported"](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/1-install.md)) | — |
| D5 | Each release has a version and a changelog | **Pass** | [CHANGELOG.md](https://github.com/prabinpebam/design-library/blob/main/packages/core/CHANGELOG.md) in core (exported as `./CHANGELOG.md`, in the tarball), with the versioning rule; both packages share one version | F15.R2 |
| D6 | The tarball holds only what a consumer needs | **Pass, noted** | 534 files, 1.33 MB packed. It includes the component stories and their four media files because `@design-library/core/react` exports the stories (the library app reads them); splitting them into their own entry is a breaking change left for a later minor | F15.R2 |

## The package contract

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| P1 | Every public entry is in `exports` | **Pass** | [core package.json](https://github.com/prabinpebam/design-library/blob/main/packages/core/package.json): `./react`, `./render`, `./presets`, `./fonts`, `./icons`, `./colour`, `./css/*`, `./tokens/*`, `./schemas/*`, `./motion/*`, `./agent/*`, `./AGENTS.md` | — |
| P2 | `./package.json` is exported (tools read it) | **Pass** | Both packages export `./package.json` | F15.R2 |
| P3 | React is a peer dependency, with the version stated | **Pass** | `peerDependencies` `react` and `react-dom` `^19.0.0` in both packages; `engines.node` `>=20.19` | F15.R2 |
| P4 | A bundler keeps the CSS | **Pass** | No `sideEffects` field, so bundlers keep every import, including `css/index.css`. Declaring modules side-effect free is left out on purpose: some modules register icon sets and presets when imported | — |
| P5 | Types reach the consumer | **Pass, scoped** | The source is TypeScript; `exports` point at `.ts` files, which `moduleResolution: "Bundler"` reads | — |
| P6 | Licence and repository fields | **Pass** | `license: "MIT"`, `repository` (with `directory`), `homepage`, `bugs` in both | F15.R2, R3 |
| P7 | The supported stack is stated, and what isn't | **Pass** | [guide step 1, "Supported"](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/1-install.md): React 19 + Vite 8 supported; other bundlers not in 0.1 (`import.meta.glob`, `?url`); server rendering not proven; other frameworks not supported (CSS and tokens work anywhere); React 18 not supported | F15.R2 |

## Assets outside the monorepo

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| A1 | Core and templates import nothing outside their own folders | **Pass** | A scan of every import in `packages/core` and `packages/templates`: no relative import leaves its package; bare imports are only `react`, `react-dom`, twelve `@fontsource-variable/*` and core itself | — |
| A2 | Fonts resolve from the installed packages | **Pass** | The twelve `@fontsource-variable/*` faces are core `dependencies`; the loader imports them ([fonts/loader.ts](https://github.com/prabinpebam/design-library/blob/main/packages/core/fonts/loader.ts)) | Proven in the final test |
| A3 | Icons resolve without the icon-set dev dependencies | **Pass** | The sets are subset into `packages/core/icons/sets/` by `tools/icon-sets.mjs`; the icon packages are root dev dependencies only | Proven in the final test |
| A4 | Template pictures resolve in the consumer's build | **Pass, scoped** | Loaded with `import.meta.glob(…, { query: '?url' })`: Vite only (P7) | — |

## Docs an agent finds by itself

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| G1 | The package ships an entry doc an agent opens first | **Pass** | `node_modules/@design-library/core/AGENTS.md` ([AGENTS.md](https://github.com/prabinpebam/design-library/blob/main/packages/core/AGENTS.md)) | — |
| G2 | The consumer's own `AGENTS.md` points there | **Pass** | [AGENTS.md](https://github.com/prabinpebam/design-library/blob/main/packages/core/AGENTS.md) "First, once per project" gives the block to paste; guide step 1, step 5 says to | F15.R3 |
| G3 | The guide's install step works for a separate project | **Pass** (proof in R6) | [Step 1](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/1-install.md) is now the separate project: install both tarballs by URL, `vite.config.ts` with no repository paths, a full `tsconfig.json`, then the entry; working inside the library repository moved to its own short section | F15.R3 |
| G4 | Paths in the guide are package paths, not repository paths | **Pass** | AGENTS.md "Where you are": paths are relative to the installed package; steps 2–6 use `agent/…`, `node_modules/@design-library/templates/…` and `src/templates/{id}/`; repository paths remain only where marked *library repository*. The index writes `@design-library/core/…` (0 `"packages/` strings in `agent/`) | F15.R3 |
| G5 | No link points at `127.0.0.1` or a repository-only doc | **Pass** | 0 `127.0.0.1` in `agent/` (the index reads the hosted address from `tools/site-links.json`) and in AGENTS.md and `guide/`; doc links go to the hosted docs or GitHub | F15.R3 |
| G6 | Checks the guide asks for run in a separate project | **Pass** | The content check ships: `npx design-library-check-content --templates src/templates [--index …]` ([tools/check-content.mjs](https://github.com/prabinpebam/design-library/blob/main/packages/core/tools/check-content.mjs), `bin` in core; the repository's `npm run check:content` now calls it); every step's "Check it" lists `npx tsc --noEmit` and `npx vite build`; the style checks (`check:views`, `check:parts`, …) are named as library-repository checks with the rules to read instead | F15.R3 |
| G7 | The agent index and schemas ship and parse | **Pass** | `agent/index.json`, 113 files in `agent/components/`, four `schemas/*.json` | — |

## Customizing from the consumer side

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| C1 | Brand colours can be set without this repository's tools | **Pass** | `applyBrand`, `brandCss`, `brandVars` from `@design-library/core/theme` ([theme/index.ts](https://github.com/prabinpebam/design-library/blob/main/packages/core/theme/index.ts)) run the public colour generator and set the same `--p-brand-*`, `--p-accent-*` and `--color-brand-*` the token build writes; measured in `apps/example`: `--p-brand-1-500 = #1f6f8b`, accent follows. Contrast isn't measured at run time: the guide sends seeds through the hosted Colour page first | F15.R4 |
| C2 | Space, shape and material presets apply from the consumer side | **Pass** | `data-space`, `data-shape`, `data-material` attributes with core's preset store ([apps/example/src/look.ts](https://github.com/prabinpebam/design-library/blob/main/apps/example/src/look.ts)) | — |
| C3 | Type (font) presets apply from the consumer side | **Pass** | `applyFonts({ preset })` and `fontVars` from `@design-library/core/theme`; in `apps/example`, `bookish` sets `--font-display` to Literata and loads Literata and Nunito Sans | F15.R4 |
| C4 | A fresh clone of the public repository can run `npm run tokens` | **Pass, documented** | Consumers never need it ([step 3](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/3-tokens.md), "Three levels"). Library contributors restore the `agentic-craft` checkout (public, MIT) as the [setup guide](setup.md) says, then run it | F15.R4 |

## Templates and rendering

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| T1 | `TemplateView` renders a shipped template in a consumer app | **Pass, scoped** | `apps/example` renders `@design-library/templates/harbour` ([App.tsx](https://github.com/prabinpebam/design-library/blob/main/apps/example/src/App.tsx)), inside this repository only | Proven in the final test |
| T2 | A consumer can make its own template in its own project | **Pass** (proof in R6) | [Step 6](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/6-templates.md): templates in `src/templates/{id}/`, `loadTemplate` now public from `@design-library/core/render`, checked with `--templates src/templates --index src/templates/index.ts` | F15.R3 |

## Licence

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| L1 | The project has a licence | **Decided** (owner, 2026-11-09 07:57, [DoD Q82](definition-of-done.md#owner-instructions)) | MIT, copyright Prabin Pebam (name from the owner's GitHub profile): `LICENSE` at the root and in each package, `"license": "MIT"` in every `package.json`. **Exception:** `docs/shell` is the vendored Slate runtime, whose [repository](https://github.com/prabinpebam/slate) GitHub reports with **no licence** (checked 2026-11-09): it isn't covered by this MIT licence and stays all rights reserved by its author (the same owner) until Slate picks one. It isn't in either package | F15.R3 |
| L2 | Bundled third-party licences are respected | **Pass** | Fonts OFL-1.1 (installed packages carry their licences); icon subsets MIT/Apache-2.0 recorded in the [brief](brief.md) | — |

## Known bugs

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| B1 | SiteHeader doesn't scroll sideways at 320 px | **Pass** | In the narrow form the bar wraps and the actions sit under the name, at the end ([site-header.css](https://github.com/prabinpebam/design-library/blob/main/packages/core/css/compounds/site-header.css)); measured at a 320 px viewport: page width 310 px for Harbour (was 90 px over) and Corporate (was 69 px over) | F15.R5 |
| B2 | `validate-setup` passes | **Pass** | `node .\tools\validate-setup.mjs` passes: `apps/example` in its workspace list, its stale docs-page list replaced by required pages, and the proxy check moved to the user npm config (B3) | F15.R3 |
| B3 | A public clone can `npm install` | **Decided** (owner, 2026-11-09 07:57, [DoD Q82](definition-of-done.md#owner-instructions)) | Done: `.npmrc` removed from the repository (this machine's user npm config holds the proxy, `npm config get registry`); all 105 lockfile URLs on `registry.npmjs.org` (`node .\tools\lockfile-hosts.mjs`, `--check`), which npm swaps for the configured registry (`replace-registry-host`, default `npmjs`; read in npm's `reify.js`), so this machine still installs only through the proxy | F15.R3 |

## Version and upgrades

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| V1 | The guide says which library version it describes | **Pass** | AGENTS.md opens with "Version 0.1.0" and the changelog; the index carries `package.version` and `license` | F15.R3 |
| V2 | There is an upgrade path | **Pass, partly** | The changelog's versioning rule and "Upgrading"; contracts that carry their own version are named. The content migration command isn't built (G21 in the [consumer audit](consumer-audit.md)): a breaking schema change must say how to migrate by hand | F15.R2 |

## Packets

| Packet | Rows | Status |
| --- | --- | --- |
| F15.R1 | This checklist | Done for review |
| F15.R2 | Packaging: D1, D3, D5, D6, P2–P4, P6, P7, V2 | Done for review (about 08:30) |
| F15.R3 | Docs: G2–G6, T2, V1; owner decisions L1, B3 (and B2) | Done for review (about 09:05) |
| F15.R4 | Consumer theming: C1, C3, C4 (`@design-library/core/theme`) | Done for review (about 09:05) |
| F15.R5 | B1; push to the public repository (`1a6ac55`), the v0.1.0 release (D2), redeploy | Done for review (about 09:25) |
| F15.R6 | Proof: a fresh project outside this repository, following only the shipped guide | Done for review (about 09:50): clean run on 0.1.1 |
| F15.R7 | Q83: Get started in the library and the technical [Get started](get-started.md) in these docs | Done for review (about 10:10) |

## The proof (F15.R6)

**Setup:** an empty folder in the system temp directory (outside this repository and its workspaces; deleted afterwards), Node 26, packages from the approved proxy only (the library from the GitHub release). The agent read only what the package ships: `node_modules/@design-library/core/AGENTS.md`, `guide/1-install.md`, `3-tokens.md` and `6-templates.md`, and the index. **Built:** *Tidewater Café*: the guide's step 1 files (`vite.config.ts`, `tsconfig.json`, `index.html`, the `AGENTS.md` block), a theme in `src/look.ts` (`applyBrand` with two brand colours, `applyFonts({ preset: 'editorial' })`, its own space and shape presets through `registerPresetCategory`), and its own template `src/templates/tidewater/`, adapted from `harbour` by step 6 (namespace renamed, new content, `loadTemplate` from `@design-library/core/render`), rendered with `TemplateView`.

| # | Hiccup | Cause | Fix | Release |
| --- | --- | --- | --- | --- |
| H1 | The second `npm install` failed: `Cannot read properties of null (reading 'edgesOut')` | npm 9.6.7 (this machine's default) mishandles tarball dependencies; npm 11 installs them | Guide step 1 asks for npm 10 or later and quotes the error | 0.1.1 |
| H2 | `npx tsc --noEmit` failed: `TS7016: Could not find a declaration file for module '../colour/index.mjs'` | TypeScript doesn't read JavaScript inside `node_modules`; inside this repository the workspace link hid it | `colour/*.d.mts` declarations ship (`npm run colour:types`); `npm run pack` refuses stale ones | 0.1.1 |

**Clean run on 0.1.1** (a second empty folder, npm 11.20.0):

| Step | Result |
| --- | --- |
| `npm install <core 0.1.1 URL> <templates 0.1.1 URL> react@^19 react-dom@^19`, then the dev tools | Installed; the two library tarballs from `github.com`, every other package through the proxy |
| `npx design-library-check-content --templates src/templates --index src/templates/index.ts` | `1 templates, 2 content files, 26 core block types: all valid.` |
| `npx tsc --noEmit` | No errors |
| `npx vite build` | Built |
| `npx vite`, opened at 800 px and 320 px | The café's own words and picture; headings in Fraunces (the `editorial` preset); `--p-brand-1-500` = `#0f766e`; `data-space="loose"`, `data-shape="super-soft"`; no sideways scroll (310 px of 320) |

## Beta audit (Q99)

Owner's words, 2026-11-09 12:46 +05:30 ([DoD Q99](definition-of-done.md#owner-instructions)): *"When everything is done, I want a final audit for the readiness of the design library for being handed over to other projects for implementation in other projects. Complete anything pending and we will declare this as the Beta version ready for early trials."*

**Method (F15.AUDIT, 2026-11-09 about 16:05 +05:30, worker 48, read-only):** every row above re-checked against the current working tree (not the 0.1.1 tarballs), then new rows for what changed since 0.1.1: the two-part frameworks and their probes, the adversarial loop, chrome context, `npm run check`, "Rules agents miss", picture assets and the modifiers spec. Commands run from the repository root; URLs checked with a HEAD request. No package was built or released and no separate project was made: those are the Beta packet's (worker 47).

### The 37 rows, re-run

| Result | Rows | Evidence |
| --- | --- | --- |
| **Pass, re-checked** (19) | D2, D3, D4, P1–P7, G1, G2, G4, G5, G6, L1, L2, B3, V2 | Both packages `0.1.1`, `MIT`, `LICENSE` in root and both packages; `exports` now also has `./theme`, `./guide/*`, `./tools/*`, `./CHANGELOG.md`; 0 `127.0.0.1` in `agent/`, `AGENTS.md`, `guide/`; `npm run check:content`: *8 templates, 174 content files, 26 core block types: all valid*; `node .\tools\lockfile-hosts.mjs --check`: every tarball URL on `registry.npmjs.org`; the v0.1.1 core tarball URL answers 200 |
| **Carried** (11): unchanged since R6, proved again only by the Beta proof | A1–A4, C1–C4, T1, T2, B1 | No change to imports, fonts, icons, `theme/`, `render/` or SiteHeader was audited here; the fresh separate-project proof on the Beta re-proves them |
| **Holds again only after the Beta release** (5) | D1, D5, D6, G3, V1 | The source has moved past 0.1.1 (CHANGELOG `## Unreleased`; new guide step 8; the forms' failed state; picture and image-fill fields), so the 0.1.1 tarballs, the guide's install URLs (`v0.1.1`), the `Version 0.1.1` line and the tarball file count no longer describe it |
| **Regressed** (2) | G7, B2 | **G7:** `node .\tools\agent-index.mjs --check` fails: *stale: agent/components/StackedBar.json, agent/index.json*. **B2:** `node .\tools\validate-setup.mjs` fails at line 49: the project skill list gained `image-prompting` (Q84), which the expected list doesn't have |

### New rows since 0.1.1

| # | Check | Status | Evidence |
| --- | --- | --- | --- |
| E1 | Every UX framework comes in two parts (Q85.2) | **Pass** | `## Part 1: the framework` and `## Part 2: the checklist` in spacing, layout, visual noise, materials (with elevation), motion, clipping, UI states, scrolling and visual representation; density (chrome context) in [Foundation](foundation.md#density-content-and-chrome) with CX rows |
| E2 | Every part 2 has a probe or check and a pass rule | **Pass** | Ten probes in `tools/*-probe.js`, each `window.{name}Probe()` returning `{ rows }`; each checklist states its pass rule ([When the loop ends](adversarial-loop.md#when-the-loop-ends)) |
| E3 | The adversarial loop is written and wired in (Q85.3) | **Pass** | [The adversarial loop](adversarial-loop.md); root `AGENTS.md` project rule; package `AGENTS.md` section, task row, checks row and paste-in block; `guide/8-review.md` with the evaluator prompt |
| E4 | A separate project gets the probes from the package it installed | **Fail** | `packages/core/tools/` holds only `check-content.mjs`; the probes are repository-only, so step 8 links GitHub `main` (unversioned: a consumer on one version runs another's probes) |
| E5 | Every probe link in the shipped guide resolves | **Fail** | `raw.githubusercontent.com/…/main/tools/visual-probe.js` answers 404 (not pushed yet); `ui-states-probe.js` answers 200 |
| E6 | "Rules agents miss" has a row for every framework with its probe | **Pass** (fixed in this packet, about 16:00, at worker 47's request) | 18 rows: spacing, columns, layout, chrome context, scrolling, visual noise, motion, materials, clipping, UI states and now visual representation (Image `alt`, Button `iconOnly` + `label`, StackedBar's legend; `visual-probe.js` VR1–VR7) |
| E7 | Chrome context reaches the consumer | **Pass** | "Rules agents miss" row (CX1–CX4, `context-probe.js`); seam ladder step 3 `data-density="compact"`; guide steps 3 and 4 |
| E8 | `npm run check` passes | **Fail** | Stops at `check:parts`: *packages/core/css/compounds/stacked-bar.css: 1 descendant part selectors (allowed 0)*; `check:content` passes alone; the agent index is stale (G7). Every check before `check:parts` passes |
| E9 | The frameworks' own pages agree with the loop page | **Fail** | [Spacing](spacing.md#the-two-part-frameworks)'s frameworks table has no visual representation row, and its "The adversarial loop" section is one paragraph that doesn't link [the loop page](adversarial-loop.md) |
| E10 | A consumer knows how to prepare its own pictures | **Fail** | The guide covers `assets.json` ids with alt text (step 2, step 6) and the content check validates them, but not format, display resolution, transparent trimming or what good alt text says; [Images](images.md) and the `image-prompting` skill are repository-only |
| E11 | Modifiers are spec-only and the package claims nothing about them | **Pass** | [Modifiers](modifiers.md) is a spec; 0 mentions of modifiers in the package `AGENTS.md`, `guide/` or `CHANGELOG.md` |
| E12 | The people-facing Get started pages match the shipped guide | **Fail** | The paste-in `AGENTS.md` block in [Get started (technical)](get-started.md) and the library's Get started (`apps/library/src/data/pages.ts`) is the old one (no adversarial loop); neither names step 8, the frameworks or the probes |
| E13 | The changelog records everything since 0.1.1 | **Fail** | `## Unreleased` lists only the people `picture` and Canvas image fill; missing: guide step 8 and the loop, the frameworks and probes, the forms' failed state (`answer`/`invalid`), ListItem `busy` locked, layout fixes (SiteLayout scroll padding, `main` in ChatLayout/EditorLayout, AppLayout head slot), Morph when hidden, paused hidden spinners, clipping fixes, StackedBar changes |
| E14 | The hosted docs serve every page the guide links | **Fail until the release deploy** | `…/docs/adversarial-loop.md` answers 404 (Q101: one push and deploy at the Beta); library and docs roots and `ui-states.md` answer 200 |

### Gaps to close

For worker 47, in this order; each names the row it closes.

1. **E8, `check:parts`:** use child paths in `packages/core/css/compounds/stacked-bar.css` (the descendant part selector), then `npm run check` to the end.
2. **G7:** `npm run agent:index` after the StackedBar work; `npm run agent:index:check` passes.
3. **B2:** add `image-prompting` to the expected project skills in `tools/validate-setup.mjs`; `node .\tools\validate-setup.mjs` passes.
4. **E6 (done in F15.AUDIT, about 16:00):** a "Rules agents miss" row for visual representation in `packages/core/AGENTS.md` (use: an alternative that says what the picture means, icon-only controls named, part-to-whole parts named in words, square inner segments, reserved picture boxes, no autoplay with sound; caught by `visual-probe.js` VR1–VR7).
5. **E4, E5 (docs side done by worker 48, about 16:15: guide step 8, the package `AGENTS.md` and the loop page name `probes/{name}-probe.js` in the package; worker 47 ships the files and the `./probes/*` export):** ship the probes in core (copy `tools/*-probe.js` into the package, e.g. `packages/core/probes/` with a `./probes/*` export, kept identical by a check), then point guide step 8 and the package `AGENTS.md` probe links at `node_modules/@design-library/core/probes/…`.
6. **E9 (done, about 16:15: VR row by worker 47, loop link by worker 48):** in [Spacing](spacing.md), add the visual representation row to the frameworks table and replace the short loop section with a link to [The adversarial loop](adversarial-loop.md).
7. **E12 (done by worker 48, about 16:15: both blocks updated; the library Get started has "Check every screen", the technical one "Review every screen" and a Checks row):** update the paste-in block in [Get started (technical)](get-started.md) and the library Get started (`pages.ts`) to the package `AGENTS.md` wording, and add one step there: review each screen with the loop (guide step 8).
8. **E10 (done by worker 48, about 16:15: "Your own pictures" in guide step 6):** a short "Your own pictures" section in guide step 6 (WebP at the size shown, transparent pictures trimmed, `width`/`height` or ratio reserved, alt text says what the picture shows or means; decorative pictures marked) with a link to the hosted [Images](images.md).
9. **E13:** complete `## Unreleased` in `packages/core/CHANGELOG.md` and turn it into the Beta version's entry, saying whether anything breaks (the form block's new fields are additive).
10. **D1, D5, D6, G3, V1:** the Beta release: bump both packages together, update the `Version` line in the package `AGENTS.md` and the install URLs in guide step 1 and Get started, `npm run pack`, recount the tarball (D6), attach both tarballs to the GitHub release.
11. **E14:** one push and Pages deploy at the release; then HEAD-check every hosted link the guide and the package `AGENTS.md` name (including `adversarial-loop.md` and each probe).
12. **A1–A4, C1–C4, T1, T2, B1 (carried):** the fresh separate-project proof on the Beta, following only the shipped guide, with the clean-run table recorded here as for R6.
13. **E3 in the proof:** in that proof, run step 8 once: an evaluator session scores the built screen with every probe and the table is recorded here; any fail is fixed at its owner before the Beta is declared.
14. **The sweep (Q101.2):** the full probe sweep over the 168 template layouts and the library pages once, at the release, with the counts recorded in each framework's Results.
15. **Rows above:** after the release, mark D1, D5, D6, G3, V1, G7, B2 and E4–E14 with their new evidence and update this page's TL;DR to say Beta.
16. **Q100:** main tells the owner the library is ready to hand off, with the release link and this page.

### The sweep (gap 14)

**Method (F15.BETA, 2026-11-09 about 16:20–17:05 +05:30, worker 49):** every probe in `packages/core/probes/` (clipping, context, layout, material, motion, noise, scroll, spacing, UI states, visual) loaded into each screen on the library dev server, every row with `pass: false` collected. Template screens at `site.html#/app/{template}/{layout}`, the full window, at **1000 × 800** and **320 × 667** CSS px (the earlier sweeps ran inside the library's template viewer with its panels open, so the screen was narrower than the window; that hid the fails below). 168 routable layouts (the six Harbour layouts other than home are the example app's and have no `site.html` route).

| Pass | Fails found | Fixed at the owner |
| --- | --- | --- |
| Templates, 1000 px | 7 layouts: SC3 on blog and chat empty search; FR1 on the conference and corporate home stage; SC3 on conference sponsors, projects issue and issue edit | A section's EmptyState sits closer inside than the section's parts (`c.empty-state.actions-space-section`, `silhouette-gap-section`); a peek stage tops the band gap below it to one and a half page levels (`frame.css`); AppLayout's view and details and the sponsors' intro and levels sit one and a half page levels apart |
| Templates, 320 px | 8 layouts: SC3 in four heroes, blog subscribe confirm's actions and note, the schedule's slots and sponsors; SC7 on blog feeds (a feed address pushed the page 88 px sideways) | A stacked hero steps its levels down once (`c.hero.stacked-*`); the hero's actions and note a group apart (`c.hero.doing-gap`); an Agenda's slots a section apart and, narrow, the time a group above its sessions; DescriptionList breaks a long word anywhere |
| **Result** | **168 of 168 pass at 1000 px; 166 of 168 at 320 px** | Two open S2 findings at 320 × 667: corporate home's contact feature (FR15: its 438 px content plus the page-level space FR7 requires leaves less than the peek), corporate contact's DescriptionList (SC16: "Rotterdam (head office)" wraps in the term column's three-fifths cap while the details have 61 px spare) |

**Library pages (265):** 45 sampled (start, foundations, fundamentals) at 1000 px; every one fails on the library's own chrome, the same few rows: ME6 (the title bar is chrome with no fill), SC5 (the page header's heading, intro and first block all 8 px apart), and SC2/SC3 on specimens and the index list. These are the library's documentation pages, not something a consumer ships; they're a known issue of the Beta and the first item after it. The template sweep above is what a consumer's screens are held to.

## Beta known issues

Recorded at the Beta call (owner Q103, 17:31); none blocks a trial.

| # | Issue | Where | Severity |
| --- | --- | --- | --- |
| K1 | A feature taller than about two thirds of a 320 × 667 window can't leave the next band in view and also keep the page-level space FR7 requires | corporate home, the contact feature (FR15) | S2 |
| K2 | DescriptionList's term column stops at three fifths, so a long term wraps while the details have room to spare | corporate contact at 320 px (SC16) | S2 |
| K3 | The proof evaluator's second round, after the round-1 fixes (FR2/FR17 peek stage, VN1 expanded toggle, VR10 header mark, VN10 repeated footer link), wasn't recorded before the Beta call | Tidewater proof project | Re-run on the next round |
| K4 | Motion rows MV1, MV3, MV4 and MV7 weren't scored: they need the animation timeline, which a headless evaluator couldn't read | Proof, motion | Not scored |
| K5 | At 320 px SiteHeader takes two rows (the name, then the actions and Menu), 104 px tall instead of about 64 | SiteHeader narrow form | Decision pending |
| K6 | The library's own documentation pages fail on their chrome: the title bar has no chrome fill (ME6), the page header's parts are all 8 px apart (SC5), and SC2/SC3 fail on specimens (45 of 45 sampled) | Library pages, not shipped to consumers | First after the Beta |
| K7 | The release files were re-uploaded at 17:25 with the round-1 fixes, under the same version | v0.2.0-beta.1 assets | Note |
