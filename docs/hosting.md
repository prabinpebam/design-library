# Hosting

> **TL;DR:** Both sites go on **one GitHub Pages origin**: the Design Library at `https://prabinpebam.github.io/design-library/` and these Slate docs under `/docs/`. Both already use hash routes (`#/button`, `#motion.md`), so neither needs server rewrites. The static output is **built on this machine** (npm resolves through the approved Microsoft proxy, and the token build reads the local `agentic-craft` checkout) and pushed to a `gh-pages` branch; no tokens or secrets are involved. Links between the two sites come from **one config**, `tools/site-links.json`, which says where each site lives locally (8766/8765) and when hosted, and which library page pairs with which doc.

**Owner, 2026-11-09 07:17 ([DoD Q80](definition-of-done.md#owner-instructions)):** the library is the product output and shows the principles behind it; Slate is the complete technical documentation; the two link to each other; both are hosted together on GitHub Pages from a new public repository. This page is the plan (F15.H1) and, once deployed, the record (F15.H3).

## One origin, two sites

| Address | What | Built from |
| --- | --- | --- |
| `https://prabinpebam.github.io/design-library/` | The library (`index.html`, hash routes `#/page`) | `apps/library` with Vite, `base: './'` |
| `…/design-library/site.html#/app/<template>/<layout>` | Template sites opened in their own tab | Same build (second entry) |
| `…/design-library/docs/` | These docs (`#page.md`, `#page.md#anchor`) | The `docs` host as it is |
| `…/design-library/schemas/{name}/{version}.json` | Each core schema at a stable versioned address (`blocks`, `content`, `template`, `assets`; DP5), for `$schema` in content files; a new version is a new file, never a changed one | `packages/core/schemas/*.schema.json`, `$id` rewritten to the address by `tools/publish-site.mjs` |

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

**The `main` branch (source):** `AGENTS.md`, `package.json`, `package-lock.json` (tarball URLs on `registry.npmjs.org`; no `.npmrc`, the proxy is this machine's user config, [Handoff readiness](handoff-readiness.md) B3), `LICENSE` (MIT), `.github` (agents, hooks, installed skills), `apps`, `packages`, `tools` and `docs`.

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

1. `node .\tools\publish-site.mjs` builds the library (`base: './'`), copies it and the `docs` host into `.publish/`, rewrites `local` to `hosted` addresses in the published copy (docs pages, and sample content built into the library), checks every pair links both ways, and writes `.nojekyll`.
2. `node .\tools\publish-site.mjs --push` commits `.publish/` as a single commit and force-pushes it to `gh-pages` (the deploy branch only; `main` is never forced).
3. Pages serves `gh-pages` at `/`.

No token is printed, stored or committed: pushes use the owner's existing `gh` login through Git's credential helper.

## Licences

- The project's own files are **MIT** (owner, 2026-11-09 07:57, [DoD Q82](definition-of-done.md#owner-instructions)): `LICENSE` at the root and in each package (`"license": "MIT"`), copyright Prabin Pebam.
- Installed skills and agents in `.github` come from the owner's `agentic-craft` and `agent-orchestration` (both MIT, copyright Prabin Pebam).
- `docs/shell` is Slate's runtime. Slate's own repository is public with **no licence** (GitHub reports none, checked 2026-11-09 08:40), so the MIT licence of this repository does **not** cover `docs/shell`: it stays all rights reserved by its author (the same owner) until Slate picks a licence ([its licensing review](https://github.com/prabinpebam/slate/blob/main/LICENSING-REVIEW.md), finding 1, still open); its vendored libraries ship their licence texts beside them.
- Fonts and icon sets are installed packages with their licences recorded in the [brief](brief.md) (OFL, MIT, Apache-2.0); the build bundles only what the library imports.

## Repository

| Field | Value (deployed 2026-11-09, F15.H3) |
| --- | --- |
| Repository | [prabinpebam/design-library](https://github.com/prabinpebam/design-library), public, MIT (since 2026-11-09, Q82; `docs/shell` excepted, see Licences) |
| Branches | `main` (source); `gh-pages` (the built site, one commit, replaced on every deploy) |
| Library | [prabinpebam.github.io/design-library/](https://prabinpebam.github.io/design-library/), deep links such as [`#/motion`](https://prabinpebam.github.io/design-library/#/motion) and [`site.html#/app/projects/dashboard`](https://prabinpebam.github.io/design-library/site.html#/app/projects/dashboard) |
| Docs | [prabinpebam.github.io/design-library/docs/](https://prabinpebam.github.io/design-library/docs/) |
| Pages | Source `gh-pages` at `/`, HTTPS enforced; turned on by the first `gh-pages` push |
| Releases | [v0.3.0-beta.1](https://github.com/prabinpebam/design-library/releases/tag/v0.3.0-beta.1) (current, 2026-11-10, pre-release: the next minor from a real site and data-driven foundations; tagged at 8131eee; the Pages site was built from 8131eee in a temporary worktree, with the docs from the commit after it so the brief carries its proof; [adoption brief](adopt-0.3.0-beta.1.md)); [v0.2.0-beta.2](https://github.com/prabinpebam/design-library/releases/tag/v0.2.0-beta.2) (2026-11-10, pre-release: first improvements from a real site, owner Q105; tagged at a0cc3c8, not at `main`, because 0.3.0 work was committed on top; the Pages site was built from a0cc3c8 in a temporary worktree, with the docs from `main` so the [adoption brief](adopt-0.2.0-beta.2.md) is hosted; `design-library-core-0.2.0-beta.2.tgz` 581 files 2.39 MB, `design-library-templates-0.2.0-beta.2.tgz` 316 files 6.26 MB), [v0.2.0-beta.1](https://github.com/prabinpebam/design-library/releases/tag/v0.2.0-beta.1) (2026-11-09, pre-release: the Beta for early trials, owner Q99; `design-library-core-0.2.0-beta.1.tgz` 576 files 2.37 MB, `design-library-templates-0.2.0-beta.1.tgz` 316 files 6.26 MB), [v0.1.1](https://github.com/prabinpebam/design-library/releases/tag/v0.1.1) (fixes from the separate-project proof) and [v0.1.0](https://github.com/prabinpebam/design-library/releases/tag/v0.1.0) (2026-11-09, owner Q82): `design-library-core-0.1.0.tgz` and `design-library-templates-0.1.0.tgz` from `npm run pack`, how separate projects install the library ([Handoff readiness](handoff-readiness.md) D2). A new version: raise both `version`s together, add a `CHANGELOG.md` entry, commit and push, `npm run pack`, then `gh release create v<version> .packages/*.tgz`; then prove it from a fresh folder outside the repository with `node .\tools\separate-project-proof.mjs --release <version>` (guide step 1 alone, then type check, build and serve; the folder is deleted after) |

**Redeploy** (from the workspace root, with the local servers' sources current):

```powershell
git add -A; git commit -m "…"; git push            # the source, when it changed
node .\tools\publish-site.mjs --push               # build, assemble .publish\, force-push gh-pages
gh api repos/prabinpebam/design-library/pages/builds/latest --jq .status   # "built" after about a minute
```

**Before the first push** the 963 tracked files were checked: no Git links or nested repositories, no upstream checkout, review data, build output or file over 1 MB. No secret scanner is installed, so a pattern scan ran over every tracked file (GitHub, AWS, Slack, Google and OpenAI tokens, private keys, npm auth, password/secret/key assignments, Azure keys and SAS signatures, JWTs): **0 hits**. Also seen and accepted: example addresses (`example.com`, `contoso.com`), the npm proxy and Microsoft package feed hostnames in `.npmrc` and `package-lock.json` (addresses, not credentials), local session-folder paths in two work-plan lines and the chat links in `AGENTS.md`.

**Verified live** (2026-11-09 about 07:32): the library root, `#/motion`, a template site and the docs reader at `#motion.md` open; the Motion header links to `…/docs/#motion.md` and the doc's "In the library" line to `…/#/motion`; no `127.0.0.1` address is left outside the vendored runtime; the Revisions button is absent.
