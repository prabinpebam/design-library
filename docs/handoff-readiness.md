# Handoff readiness

> **TL;DR:** Can an AI agent in a **separate project** pick this library up and implement it with no hiccups? **Not yet.** At F15.R1 (2026-11-09 08:10 +05:30) 12 of 37 checks passed, 22 failed and 3 needed the owner; after F15.R2 (packaging) 22 passed. **The owner decided all three owner rows on 2026-11-09 07:57 (recommendations taken, MIT licence). After F15.R3–R4 (docs, theming, about 09:05): 33 pass, 3 decided and done or under way, 1 fails (B1, SiteHeader at 320 px).** After F15.R5 (about 09:20): B1 passes; nothing fails. The release, the push and the fresh-project proof follow. The library itself is self-contained (core and templates import nothing outside their own folders except React and the font packages), but everything around it assumes you work **inside this repository**: there is no way to get the packages out except copying folders, the guide's paths and checks are repository paths, theming needs this repository's token tools (and a checkout that isn't public), and 275 links point at `127.0.0.1`. Packets F15.R2 onwards fix each failing row; the owner rows stay as decisions with a recommendation. The last packet proves it with a fresh project outside this repository.

Owner's words, 2026-11-09 07:48 +05:30 ([DoD Q81](definition-of-done.md#owner-instructions)): *"Are we ready to hand off this library to an agent in a separate project for that project to implement this library? Make a checklist o qualify the above question objectively and go through each one to make sure everything is addressed and there won't be any hccups when the AI agent in the other project ries to implement this."*

## How to read it

- **The test:** an agent with an empty folder, a product brief and nothing else from this repository. It may read what the package ships (inside `node_modules`) and public URLs. It installs packages only through its own registry.
- **Pass** means the evidence holds today; **fail** means it doesn't, and the row names the packet that fixes it; **owner** means only the owner can decide (licence, publishing, the distribution path), with a recommendation.
- Every row has evidence you can re-run or open: a command, a `file:line` or a URL.

## Distribution: how the other project gets it

| # | Check | Status | Evidence | Fix |
| --- | --- | --- | --- | --- |
| D1 | A separate project can install the packages by one documented command | **Pass** | `npm run pack` ([tools/pack.mjs](https://github.com/prabinpebam/design-library/blob/main/tools/pack.mjs)) writes `.packages/design-library-core-0.1.0.tgz` and `design-library-templates-0.1.0.tgz`; a scratch folder outside the repository installed both with `npm install <core.tgz> <templates.tgz> react@19 react-dom@19` (17 packages, through the proxy). The packages stay `private`, so `npm publish` refuses them | F15.R2 |
| D2 | The distribution path is chosen | **Decided** (owner, 2026-11-09 07:57, [DoD Q82](definition-of-done.md#owner-instructions)) | (b): each version's two tarballs, built by `npm run pack`, attached to a GitHub release and installed by URL ([guide step 1](https://github.com/prabinpebam/design-library/blob/main/packages/core/guide/1-install.md)); (a) building them from a clone stays the fallback; no registry, no `npm publish` | F15.R5 creates the v0.1.0 release |
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
| F15.R5 | B1; push to the public repository, the v0.1.0 release (D2), redeploy | Next |
| F15.R6 | Proof: a fresh project outside this repository, following only the shipped guide | Planned |
