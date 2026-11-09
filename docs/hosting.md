# Hosting

> **TL;DR:** Both sites go on **one GitHub Pages origin**: the Design Library at `https://prabinpebam.github.io/design-library/` and these Slate docs under `/docs/`. Both already use hash routes (`#/button`, `#motion.md`), so neither needs server rewrites. The static output is **built on this machine** (npm resolves through the approved Microsoft proxy, and the token build reads the local `agentic-craft` checkout) and pushed to a `gh-pages` branch; no tokens or secrets are involved. Links between the two sites come from **one config**, `tools/site-links.json`, which says where each site lives locally (8766/8765) and when hosted, and which library page pairs with which doc.

**Owner, 2026-11-09 07:17 ([DoD Q80](definition-of-done.md#owner-instructions)):** the library is the product output and shows the principles behind it; Slate is the complete technical documentation; the two link to each other; both are hosted together on GitHub Pages from a new public repository. This page is the plan (F15.H1) and, once deployed, the record (F15.H3).

## One origin, two sites

| Address | What | Built from |
| --- | --- | --- |
| `https://prabinpebam.github.io/design-library/` | The library (`index.html`, hash routes `#/page`) | `apps/library` with Vite, `base: './'` |
| `…/design-library/site.html#/app/<template>/<layout>` | Template sites opened in their own tab | Same build (second entry) |
| `…/design-library/docs/` | These docs (`#page.md`, `#page.md#anchor`) | The `docs` host as it is |

- **Relative base.** The library builds with `base: './'`, so assets resolve under any sub-path; links inside it are relative (`site.html#…`, `diagnostic.html`), never root-absolute.
- **Hash routing** on both sites: GitHub Pages serves only files, and every route lives after `#`, so deep links work without a `404.html` fallback.
- **Slate needs no static export.** Its `build-site.mjs` builds Slate's own site; a project host such as `docs` is already static: `index.html`, the manifest, the pages and the vendored runtime in `docs/shell` (with its licence texts in `docs/shell/vendor/LICENSES` and `docs/shell/canvas/THIRD_PARTY_NOTICES.txt`). Static hosting reads but can't save revisions, as the [setup guide](setup.md#local-reading-and-revisions) says. So the `slate` checkout itself is never published.
- **Revisions stay local.** The library's Revisions button talks to the dev server's loopback API; the hosted build hides it, as Slate does.
- `.nojekyll` at the root, so `_`-prefixed and dot files are served as they are.

## Links between the sites

`tools/site-links.json` holds:

- `local`: `http://127.0.0.1:8766/` (library) and `http://127.0.0.1:8765/` (docs);
- `hosted`: `https://prabinpebam.github.io/design-library/` and `…/design-library/docs/`;
- `pairs`: each library page and its doc, such as Motion and timing ↔ [Motion and transitions](motion.md), Materials ↔ [Materials and backgrounds](materials.md), Elevation and layering ↔ [Materials and backgrounds](materials.md), Icon ↔ [Visual representation](visual-representation.md#icons), Overview ↔ [How the library works](how-it-works.md).

**Library → docs:** a page's `source` link comes from `docsSource(pageId)` or `docsHref(path)` in `apps/library/src/data/site-links.ts`; on the dev server it points at 8765, in the hosted build at `/docs/`. No page hard-codes `127.0.0.1:8765`.

**Docs → library:** pages keep writing the local address (`http://127.0.0.1:8766/#/motion`), which works on the local servers as it does today; the publish step rewrites the `local` addresses to the `hosted` ones in the published copy only. Same-host links stay in the reader's tab.

## What is published

**The `main` branch (source):** `AGENTS.md`, `package.json`, `package-lock.json`, `.npmrc` (registry address only), `.github` (agents, hooks, installed skills), `apps`, `packages`, `tools` and `docs`.

**The `gh-pages` branch (site):** only the built library and the `docs` host, plus `.nojekyll`.

**Never published** (root `.gitignore`):

| Excluded | Why |
| --- | --- |
| `/agentic-craft/`, `/agent-orchestration/`, `/slate/` | Ignored upstream source checkouts with their own Git metadata; never submodules or nested repositories |
| `.design-library/` (revisions, snapshots), `.slate/` (reader revisions) | Owner review data, local only |
| `.agent-orchestration/`, session state | Local session data (the clock state lives outside the workspace) |
| `node_modules/`, `apps/*/dist/`, `.publish/` | Installs and build output |
| `apps/library/public/zz-sync-probe.html` | A local probe page, not product |
| Secrets, `.env*`, tokens | None exist; a secret scan of every file to be pushed runs before the first push |

## Build and deploy

The build runs here, not in GitHub Actions: the lockfile resolves through `packagefeedproxy.microsoft.io`, which a hosted runner can't be assumed to reach, and `npm run tokens` reads the ignored `agentic-craft` checkout. So:

1. `node .\tools\publish-site.mjs` builds the library (`base: './'`), copies it and the `docs` host into `.publish/`, rewrites `local` to `hosted` addresses in the docs copy, checks every pair links both ways, and writes `.nojekyll`.
2. `node .\tools\publish-site.mjs --push` commits `.publish/` as a single commit and force-pushes it to `gh-pages` (the deploy branch only; `main` is never forced).
3. Pages serves `gh-pages` at `/`.

No token is printed, stored or committed: pushes use the owner's existing `gh` login through Git's credential helper.

## Licences

- The project's own files have **no licence file**: public, but all rights reserved until the owner chooses one. Nothing is added here without the owner.
- Installed skills and agents in `.github` come from the owner's `agentic-craft` and `agent-orchestration` (both MIT, copyright Prabin Pebam).
- `docs/shell` is Slate's runtime. Slate's own repository is public with no licence ([its licensing review](https://github.com/prabinpebam/slate/blob/main/LICENSING-REVIEW.md), finding 1, still open); its vendored libraries ship their licence texts beside them.
- Fonts and icon sets are installed packages with their licences recorded in the [brief](brief.md) (OFL, MIT, Apache-2.0); the build bundles only what the library imports.

## Repository

- **Name:** `prabinpebam/design-library` (checked free on 2026-11-09), public.
- **Pages:** source `gh-pages`, path `/`.
- Recorded here and in the [setup guide](setup.md) after the first deploy, with the redeploy command.
