# Setup and provenance

> **TL;DR:** Craft, Orchestration and Slate are installed locally for Copilot, with a docs host named Design Library. Versions below are evidenced against live default-branch HEAD at fetch time, not inferred from the Loushing card.

## Exact source provenance

| Source folder / repository | Package version | Default branch | Checkout SHA = live remote HEAD | Fetch / HEAD verification time |
| --- | --- | --- | --- | --- |
| [agentic-craft](https://github.com/prabinpebam/agentic-craft) | 0.2.0 | main | `8dd2576f41763a9add9863852697fd3961699019` | 2026-11-06T17:21:59.2617651+05:30 |
| [agent-orchestration](https://github.com/prabinpebam/agent-orchestration) | 0.4.0 | main | `5e3ca822794e4826bd8ac8504e1a4084e772bb03` | 2026-11-06T17:21:59.2139886+05:30 |
| [slate](https://github.com/prabinpebam/slate) | 0.15.0 | main | `d23c08aed365f91a2c9a83e08d4efcc3e52faa9b` | 2026-11-07T20:45+05:30 (fast-forward from 0.13.0 `1510a99964c50c566d2eef69906050ebb75300d0`; see [Slate 0.15.0 update](#slate-0150-update)) |

Package versions come from each repository's package.json. Slate's skill frontmatter version is a separate contract version, not its package version. The [Loushing page](https://prabinpebam.github.io/loushing/items/plan-build-document/) links the stack but its pinned card revision does not override live upstream sources.

## Installation and ownership

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">Obtain complete sources</p><p>Clone each named upstream into its own folder and compare the checkout with the live default-branch HEAD.</p></li>
  <li class="slate-step"><p class="slate-step__title">Install Craft, then Orchestration</p><p>Copy Copilot skills/agents and add separate marked root guidance sections. Orchestration also installs the clock and guard.</p></li>
  <li class="slate-step"><p class="slate-step__title">Initialize Slate at docs</p><p>Create the Design Library host, thin skill adapter and synchronized generic runtime.</p></li>
  <li class="slate-step"><p class="slate-step__title">Fill project-owned context and verify</p><p>Edit project facts and documentation, never generic skills/runtime. Check metadata, parity, navigation and evidence.</p></li>
</ol>

Run from the workspace root in PowerShell; clone commands are for a fresh workspace only:

```powershell
git clone https://github.com/prabinpebam/agentic-craft.git agentic-craft
node .\agentic-craft\tools\install.mjs . --for copilot
git clone https://github.com/prabinpebam/agent-orchestration.git agent-orchestration
node .\agent-orchestration\tools\install.mjs . --for copilot
git clone https://github.com/prabinpebam/slate.git slate
node .\slate\scripts\init-project.mjs --repo . --host docs --project "Design Library"
```

Prerequisites verified: Node.js `v26.13.0`, Git `2.56.0.windows.4`. Craft/Orchestration require Node 20+; Slate site tooling requires Node 22+. No root Git repository was required or initialized. No commits, push, publication or remote writes occurred.

- `.github\skills`: 11 Craft skills, five Orchestration skills and one thin Slate adapter.
- `.github\agents`: grounding-critic, design-system-auditor and throughput-reviewer.
- `.github\hooks`: official clock/guard configurations and script; default limits remain intact.
- `AGENTS.md`: project-owned context and facts plus two independent managed marker sections. Updates preserve filled facts and other sections.
- `docs`: five project pages, reader entry/config/theme, manifest and generated `.slate-runtime.json` with 25 canonical runtime files under shell (20 before Slate 0.13.0 added the picker module and its vendored bundle and licences).
- The three source clones and managed customization copies are not project-edit surfaces. Do not hand-edit generated `docs\shell`.

Refresh/reload the VS Code window or start a fresh Copilot session if installed workspace skills, agents or hooks are not yet picked up. No global profile customization was installed. The main chat stays triage-only; workers normally mark only their own clocks. The owner explicitly authorized this setup worker to bootstrap the verified original main identity as described below.

## Checkout, package and hosting hygiene

The three named upstream folders are complete **local tool source checkouts**, not authored Design Library pages, product packages or nested repositories to commit into a future parent repository.

- Root `.gitignore` anchors `/agentic-craft/`, `/agent-orchestration/` and `/slate/`. Their own `.git` metadata is retained for fetch/fast-forward updates, not deleted or staged as parent gitlinks. Re-clone using the commands and provenance above on a new checkout.
- There is no root package.json, pnpm workspace configuration or Lerna configuration. Each upstream's package manifest belongs to that upstream; do not add recursive product workspace globs that include these tool folders.
- Slate's official initializer owns the generated runtime manifest; authored pages are the five manifest entries inside `docs`. The official revision server serves only that host, not the project root or upstream sources. Pinned external source links allow references without exposing local tool directories through the host.
- Copilot reads installed `.github` surfaces and the Slate adapter's local canonical skill; ignoring tool checkouts in future parent Git tracking does not remove those local update/discovery paths.
- The project validator probes the ignore rules with real Git in a named disposable temporary repository, confirms upstream samples are ignored while root guidance/docs are not, and deletes only that task-owned probe. The workspace root remains non-Git; no commit was made.

## Isolated clock roles and execution mode

The installed clock officially accepts `sessionId` or `session_id` in hook JSON, and `--session <id>` on mark/status commands. `findSession` requires the selected clock to match the workspace path (case-insensitively on Windows); ambiguous unqualified marks cannot assign a different session accidentally. These identities are Copilot session IDs, not the host chat URL.

The original main identity was verified from its local workspace metadata and session-start event (matching this request, directory and host-session creation time); it is `1cc91cb9-cf10-44a0-bab1-7f488f8f686f`. This worker's provided session identity is `cdb12ee6-8403-4ec7-bdf8-da5847834bb3`.

The worker's initial explicit marks required a clock that had not yet been created; the official sessionStart payload was used once, then marks succeeded:

```powershell
'{"sessionId":"cdb12ee6-8403-4ec7-bdf8-da5847834bb3"}' | node .\.github\hooks\orchestration-clock.mjs sessionStart
node .\.github\hooks\orchestration-clock.mjs mark role worker --session cdb12ee6-8403-4ec7-bdf8-da5847834bb3
node .\.github\hooks\orchestration-clock.mjs mark mode production-ready --session cdb12ee6-8403-4ec7-bdf8-da5847834bb3
```

At 17:35 +05:30, the main's existing clock had blank role/mode. Following the owner's explicit bootstrap request, these official commands were run once; no sessionStart/reset was issued for main:

```powershell
node .\.github\hooks\orchestration-clock.mjs mark role main --session 1cc91cb9-cf10-44a0-bab1-7f488f8f686f
node .\.github\hooks\orchestration-clock.mjs mark mode production-ready --session 1cc91cb9-cf10-44a0-bab1-7f488f8f686f
node .\.github\hooks\orchestration-clock.mjs status --session 1cc91cb9-cf10-44a0-bab1-7f488f8f686f
node .\.github\hooks\orchestration-clock.mjs status --session cdb12ee6-8403-4ec7-bdf8-da5847834bb3
```

Both marks reported success. Main status showed role main, production-ready, 11 active minutes, 30 tool calls, 0 compactions and no rollover due; worker showed role worker, production-ready, 8 active minutes, 38 tool calls, 0 compactions, last review 17:32 and no rollover due. Checks confirmed neither clock's start was reset and the worker's identity/role/mode were unchanged by the main bootstrap.

This bounded user-requested **toolchain setup** is production-ready. Future component/UI work remains strict design until explicit owner approval; setup test success is not UI approval. Default clock/guard settings remain 30-minute reviews, 60-minute reviewable deliveries (warning at 40), and 90 active minutes/300 calls/2 compactions for rollover. Main never rolls over. A reviewable brief/work plan was marked at 17:26; final documentation is marked separately under the worker identity. No hooks were disabled or weakened.

Progress-review verdict: **keep course**. The initial unassigned main clock was the top setup gap; the authorized explicit-identity bootstrap closed it. The owner already has inspectable docs, there is one worker, no new chats, and future component design/tests have not been started.

**Current phase change:** after accepting setup closure, the owner explicitly moved the continuing comprehensive project brief to design. At `2026-11-06T12:15:18.519Z` and `2026-11-06T12:15:18.578Z` (17:45:18 +05:30), official `mark mode design --session <id>` commands succeeded for main and worker respectively. Rereads preserved role main / role worker and the existing start timestamps. This legitimate new-phase mode change is not a workaround for tests; no tests or product implementation are run in the design draft phase. The production-ready evidence above describes the completed setup, not the current draft mode.

Final hygiene/clock checks: `node .\tools\validate-setup.mjs`, runtime parity and host attribution all passed after these additions. `node --test --test-name-pattern="main chat never rolls over|guard keeps the main chat free|explicit clock selection|status and mark find|limits come|reviewable limit|idle time never counts" .\agent-orchestration\test\clock.test.mjs` passed 7/7 targeted cases. The temporary docs server returned HTTP 200 for the reader and final setup page, and HTTP 404 for `/slate/package.json`, confirming the upstream package is outside the hosted content.

Final browser verification reached this updated page through normal navigation and confirmed both clock identities, the hygiene section and the 7/7 evidence with one H1. Before the owner's later always-running requirement, the temporary server was stopped and `ECONNREFUSED` confirmed; that lifecycle is now superseded by the retained server below. The documentation delivery was marked at 17:37 +05:30 with `node .\.github\hooks\orchestration-clock.mjs mark reviewable "E:\Projects\side-projects\design-library-project\design-library\docs\setup.md" --session cdb12ee6-8403-4ec7-bdf8-da5847834bb3`; worker status showed 10 active minutes, 53 calls, 0 compactions, last review 17:32 and no rollover due.

## Dependency routing

Normal Slate reading and initialization use vendored assets and built-in Node modules; no dependency install is needed for those actions. The required attribution validator initially failed with `ERR_MODULE_NOT_FOUND: parse5`, so development dependencies were restored from the existing lockfile:

```powershell
npm config get registry
npm --prefix .\slate config get registry
npm ci --prefix .\slate --registry=https://packagefeedproxy.microsoft.io/npm/ --no-audit --no-fund
```

Both effective registry checks returned `https://packagefeedproxy.microsoft.io/npm/`. Sanitized project/user/environment inspection found the approved user registry and no conflicting project registry. The upstream lockfile's artifact hosts were approved Microsoft Azure feeds (`ms-feed-2`, `ms-feed-25`, `ms-feed-12` at `pkgs.visualstudio.com`) and `packagefeedproxy.microsoft.io`; no public-registry artifact rerouting was necessary. Restore added 93 packages successfully, preserving the lockfile. No global settings or public-registry fallbacks were used. Python packages were not installed.

## Validation and evidence

Run from the workspace root:

```powershell
node .\tools\validate-setup.mjs
node .\slate\scripts\runtime-host.mjs check --repo . --host docs
node --test --test-name-pattern="every skill|every agent|craft skill routes|relative links|installer" .\agentic-craft\test\harness.test.mjs
node --test .\agent-orchestration\test\harness.test.mjs .\agent-orchestration\test\clock.test.mjs
npm run test:runtime-host --prefix .\slate
npm run test:portability --prefix .\slate
npm run test:attributions --prefix .\slate
node .\slate\scripts\validate-document-attributions.mjs --repo . --host docs
```

The project check verifies actual installed content, frontmatter, unique guidance sections, updater preservation, host identity, local links and all five registered pages. Upstream checks cover discovery/install behavior, clock/guard rules, runtime drift safety and copied-package initialization. Documentation hosting has no build step; the full Slate self-documentation site/Canvas rebuild and product benchmarks are not needed for this setup.

The real YAML parser check used the already available PyYAML, without installing anything:

```powershell
@'
from pathlib import Path
import yaml
root = Path.cwd()
paths = list((root / '.github' / 'skills').glob('*/SKILL.md')) + list((root / '.github' / 'agents').glob('*.agent.md'))
for p in paths:
    parts = p.read_text(encoding='utf-8').split('---', 2)
    assert len(parts) == 3 and parts[0] == '', p
    data = yaml.safe_load(parts[1])
    expected = p.parent.name if p.name == 'SKILL.md' else p.name.removesuffix('.agent.md')
    assert data['name'] == expected, p
    assert isinstance(data['description'], str) and data['description'].strip(), p
print(f'YAML safe_load passed for {len(paths)} installed skills/agents.')
'@ | python -
```

Results verified on 2026-11-06:

| Check | Result |
| --- | --- |
| `node .\tools\validate-setup.mjs` | Passed: 17 skills, three agents, canonical hooks, unique/preserved root sections, five pages, 20 runtime files and three clean source clones. |
| `node .\slate\scripts\runtime-host.mjs check --repo . --host docs` | Passed: no generated runtime drift. |
| Craft targeted command above | 8 tests passed, 0 failed. |
| Orchestration harness/clock command above | 50 tests passed, 0 failed. |
| `npm run test:runtime-host --prefix .\slate` | 15 mutation cases passed. |
| `npm run test:portability --prefix .\slate` | 7 copied-package cases passed. |
| `npm run test:attributions --prefix .\slate` | 9 mutation cases passed. |
| Host attribution validator above | Passed; 0 authored excerpt references. These pages use source links, not fabricated evidence excerpts. |
| Existing Python/PyYAML `yaml.safe_load` over every installed skill/agent frontmatter | All 20 parsed successfully with matching names and nonempty string descriptions; no Python installation. |
| Repeat all three official install/init commands | Passed; 13 project-owned/guidance/configuration files byte-identical by SHA-256; Slate created 0 new host-owned files on rerun. |
| Loopback HTTP readiness | HTTP 200 at `http://127.0.0.1:8765/`; correct title; manifest exposed five entries. |
| VS Code browser normal navigation | Opened fresh isolated task-owned loopback page; all five routes reached through navigation with one H1 each; no page errors during the navigation pass. Overview's promise link reached the brief. |
| Browser theme control | Brief readable with light background `rgb(250, 250, 250)` and dark background `rgb(31, 31, 31)`; one H1 in each. This is a smoke check, not a product accessibility certification. |

The initial missing-parse5 failure was resolved by the approved dependency restore. A first project-check attempt counted PowerShell comments inside fenced examples as headings; the checker now excludes code fences, and the actual reader independently confirmed one H1 per page. Neither issue remains open. No product components, type-checks, benchmarks or full product tests are claimed.

## Local reading and revisions

```powershell
node .\slate\scripts\serve-revisions.mjs --repo . --host docs --port 8765
# Open http://127.0.0.1:8765/
```

**Owner lifecycle requirement: keep the Slate site running at all times.** This supersedes the earlier temporary-preview shutdown instructions. Preserve the already-responsive correct Design Library server; do not duplicate it or stop it after validation/chat completion.

The official server is running as an intentionally detached process:

| Lifecycle field | Current evidence |
| --- | --- |
| Review URL | `http://127.0.0.1:8765/#landing.html` |
| PowerShell tool handle | `design-library-retained-slate-8765-0908` (from 2026-11-08 09:37; earlier `design-library-retained-slate`), `mode: async`, `detach: true` |
| Lifecycle PowerShell PID | `44036` (controlled restart 2026-11-07 ~20:43 by the Slate worker for 0.15.0; previous `7936`, started 17:27 after both servers were found down) |
| Node listener PID / parent | `19316` / `20584` (started 2026-11-08 09:37 by the successor-17 worker on main's request: port 8765 refused connections and no node process held it). Before that `45420` / `44036` (controlled restart by the Slate worker for Slate 0.15.0, see [Slate 0.15.0 update](#slate-0150-update); previous `6196` / `7936` stopped by verified ID and command line, before that `7344`); verified command is the official serve-revisions command above |
| Readiness | HTTP 200; entry title and config say Design Library; five manifest entries; normal overview navigation reached the brief in shared page `2df2d8d1-cc6e-4564-94d7-814ebc1fbd44` |
| Persistence | Deliberately retained beyond this worker's completion; no detach approval blocker occurred |

The universal, AI-first brief increment was checked with `node .\tools\validate-setup.mjs` and the host attribution validator; both passed. The reused shared browser page was refreshed, reached the expanded brief through the normal overview link, and displayed the abstraction/theming/agent sections, proposed DoD rows and this retained lifecycle. Product design-system tests and agent benchmarks were not run; their criteria remain proposed. The server is intentionally left running, not cleaned up as scratch work.

If unavailable, first check the explicit URL and inspect ownership of that port; never kill arbitrary port owners. Restart only the confirmed absent task-owned service using the same official command and the PowerShell tool's `mode: async`, `detach: true`, then verify HTTP/content/browser readiness. A controlled restart of this known lifecycle uses `stop_powershell` with handle `design-library-retained-slate`, not process-name killing; re-record new PIDs after restart. The always-running rule is not permission to stop a responsive server routinely. This is a retained process, not an OS boot service or a crash supervisor; device shutdowns or process failures still require recovery rather than a false uptime guarantee.

The server binds only to loopback. Reader revisions persist locally under `.slate\revisions` in the parent workspace; static hosting supports reading but not saving revisions. Do not use `file://`, because the reader fetches its content. Never use OS-level keyboard/mouse automation or steal focus. After editing already-loaded pages, refresh the reader to clear its in-session content cache; do not restart the server merely to load new Markdown.

The final clock reread confirmed main role main / mode production-ready and worker role worker / mode production-ready persisted separately. The earlier worker reviewable mark's exact stored timestamp is `2026-11-06T12:07:22.138Z` (17:37:22.138 +05:30); last worker review is `2026-11-06T12:02:40.371Z`. Main has no reviewable-delivery timestamp because that worker delivery belongs to the worker clock and main is exempt from delivery/rollover reminders. No role was overwritten or clock reset during this read-only evidence check.

### Slate 0.15.0 update

On 2026-11-07 the owner approved the compact review pane built in the separate dev clone `..\slate-dev` (20:35: "This is approved. Make this a proper part of slate and push it to remote. also update the local slate for Design library"). Slate 0.14.0 (`27cb2c1`) compacted the pane: one row per control group, icon-only controls with tooltips, **Copy prompt** as the single primary action with a modal **Preview prompt**. 0.15.0 (`ee80492`, `d23c08a`) edits comments in place (Save, Cancel or Esc; the composer only adds new comments), shows View details, Edit and Remove only on hover or keyboard focus (always on touch), opens View details as a modal with each target's page, heading trail, selector and snapshot, and replaces the crosshair picking cursor with a selection arrow. The browser harness caught an intermittent in-place save failure (comment time later than the revision's); both now share one time. Pushed to `origin/main` as a fast-forward `1510a99..d23c08a`.

The clean `slate` checkout was fast-forwarded to `d23c08a`, and the host synchronized with `node .\slate\scripts\runtime-host.mjs sync --repo . --host docs` (25 runtime files, `@slate/docs@0.15.0`); project pages, manifest, config and theme were untouched. The 8765 server was restarted (verified PID, official command) so its store code matches the runtime. The scratch preview on 8767 was stopped.

| Check (2026-11-07) | Result |
| --- | --- |
| Slate `test:revisions`, `test:runtime-host`, `test:portability`, `test:navigation`, `test:third-party-notices`, `test:site` | 100, 15, 7, 21, 7 cases and 17 routes passed |
| Revisions browser harness (headless Microsoft Edge, fresh store per run) | 117 workspace assertions, ten consecutive clean runs after the fix; 8 static read-only assertions |
| `runtime-host.mjs check`, `validate-document-attributions.mjs` | Passed |
| Live reader on 8765 (read-only, headless) | HTTP 200, title Design Library; comment actions hidden at rest and shown on hover; View details is a modal; no page errors; the owner's two revisions read unchanged (versions 3 and 1) |

### Slate 0.13.0 update

On 2026-11-07 (owner request 13:44: make Slate's React Grab update work here), the clean `slate` checkout was fast-forwarded from 0.12.2 `6345d55` to 0.13.0 `1510a99964c50c566d2eef69906050ebb75300d0` (= `origin/main`; no local changes, no stash, no commits). 0.13.0 replaces the reader's block checkboxes with a devtools-style element picker on React Grab's framework-agnostic primitives; the bundle `shell/vendor/react-grab-primitives.min.js` is prebuilt and vendored, so no dependency restore was needed. Revision schema version 2 is additive: version 1 files stay valid.

The host was updated the official way with `node .\slate\scripts\runtime-host.mjs sync --repo . --host docs` (25 runtime files, `@slate/docs@0.13.0`); project-owned pages, manifest, config and theme were not touched. The installed skill adapter points to the canonical `slate\SKILL.md`, so it needs no change. The server was then restarted so its CLI and store code match the runtime.

How to use it: open the Revision pane, choose **Select elements**, point (outline and a tag · block · size label), click or Enter to select and stop, Shift to add more, arrow keys to move to the parent, child or sibling, and Esc to stop. Agents read a revision with `node .\slate\scripts\revisions.mjs show --repo . --host docs --id ID --format prompt`.

| Check (2026-11-07) | Result |
| --- | --- |
| `runtime-host.mjs check` | Passed |
| `validate-document-attributions.mjs` | Passed (0 authored references) |
| Revisions `check` / `show --format prompt` on the owner's existing version 1 revision | Exit 0; read unchanged as schema 1, not modified |
| HTTP | 200 for `/`, title Design Library; 200 for `shell/revisions-picker.js` and the vendored bundle |
| Browser, fresh isolated page, after reload | The vendored bundle was not requested until **Select elements**; pointing labelled `strong · block 2 · 40×19`; Up moved to the paragraph and Enter selected `p in block 2`, stopped picking and focused the comment field; a click selected `p in block 6`; Esc stopped picking and returned focus to **Select elements**; selections stayed outlined with full borders |
| Save | A test revision saved to `.slate\revisions` as schema 2 with two element targets, passed `check`, and was archived by CLI with a test-artifact summary (version 3) |

Limits: the VS Code page was hidden (no animation frames), so keyboard steps were dispatched to the picking surface as DOM events and the pointer used Playwright mouse events; no OS-level input was used. After the click pick, focus landed on a scrollable table under the pointer rather than the comment field; Enter did focus the comment field. Slate's own headless browser suite was not run here. `node .\tools\validate-setup.mjs` passes again since 2026-11-07 14:30: it asserts 25 runtime files, `AGENTS.md` is LF (its harness sections are compared byte for byte), and the two `../slate/docs/revisions.md` links now point to the upstream file on GitHub (a docs page may not link outside the host).

## Library app server

The library app (S2 onward) is the second always-running review surface, retained like Slate.

```powershell
# From apps\library (equivalent to: npm run dev -w apps/library)
node ..\..\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 8766 --strictPort
# Open http://127.0.0.1:8766/   Fallback: http://127.0.0.1:8766/diagnostic.html
```

Template sites (Q63, F15.76): the same server serves a second entry, `site.html`. Each template is a standalone site at `http://127.0.0.1:8766/site.html#/app/{template}/{layout}` (no library chrome, its own light/dark and contrast in a FloatingBar, remembered per template in this browser under `template-site.{template}.*`). The library's old `#/app/…` addresses redirect there; `npm run build -w apps/library` builds both entries.

Templates as JSON (Q64, F15.78): the website templates live in the workspace `packages/templates` (listed explicitly in the root `package.json`; `tools/validate-setup.mjs` asserts the list), one folder per template with `template.json`, `content.schema.json`, `content/*.json`, `assets.json` and `assets/`. They render through `@design-library/core/render` (`TemplateView`). `npm run check:content` validates them with the `ajv` dev dependency (JSON Schema 2020-12, installed 2026-11-08 through the approved npm proxy). A new template folder or core file needs a library server restart. Template tokens (`packages/templates/{template}/tokens/tokens.json`) are built into `tokens.css` by `node ./tools/template-tokens.mjs`, part of `npm run tokens` and `tokens:check`; `npm run content:schemas` regenerates the application templates' content schemas from their `types.ts` (ts-json-schema-generator through npx).

| Lifecycle field | Current evidence |
| --- | --- |
| Review URL | `http://127.0.0.1:8766/` |
| PowerShell tool handle | `design-library-retained-library-8766w28b` (from 2026-11-08 about 23:16, worker 28, detached, after `…-8766w28` exited on its own about 23:14); before it `…-8766w28` (from about 22:47); `…-8766c1` (from 2026-11-08 about 20:35, successor 22, detached; before it `…-8766c0` from about 20:08; `…-8766bf` from about 19:50; `…-8766be` from about 19:10 and `…-8766bd` from about 19:00). Before those: successor 21's `…-8766bc` (about 18:48, PID `56892`, which successor 20 saw as "another session"; successor 20's own retry under the same handle found the port taken and exited). Earlier `…-8766bb`, `…-8766ba`, `…-8766az`, `…-8766ay`, `…-8766ax`, `…-8766aw`, `…-8766av`, `…-8766au`, `…-8766at`, `…-8766as`, `…-8766ar`, `…-8766aq`, `…-8766ap`, `…-8766ao`, `…-8766an`, `…-8766am`, `…-8766al`, `…-8766ak`, `…-8766aj`, `…-8766ai`, `…-8766ah`, `…-8766ag`, `…-8766af`, `…-8766ae`, `…-8766ad`, `…-8766ac`, `…-8766ab`, `…-8766aa`, `…-8766z`, `…-8766y`, `…-8766x`, `…-8766w`, `…-8766v`, `…-8766u`, `…-8766t`, `…-8766s`, `…-8766r`, `…-8766q`, `…-8766p`, `…-8766o`, `…-8766n`, `…-8766m`, `…-8766l`, `…-8766k`, `…-8766j`, `…-8766i`, `…-8766h`, `…-8766g`, `…-8766f`, `…-8766e`, `…-8766d`, `…-8766c`, `…-8766b`, `…-8766`), `mode: async`, `detach: true` |
| Node listener PID / parent | `61156` (started 2026-11-08 about 23:14; `63312` was stopped by worker 29 at about 23:14 for new core files (PropertyRow), then 61156 took the port before worker 29's own detached start, which failed on the busy port and exited); before it `63312` (controlled restart 2026-11-08 about 22:47 by worker 28: the browser kept a stale story module after edits; verified PID 43500 by command line, stopped it, started this one); before it `43500` / `55372` (controlled restart 2026-11-08 about 20:35 by successor 22 for the Conference template's own parts and their CSS (Q64): verified PID 58596 by command line, stopped it, started this one; earlier: `58596` / `43120`, controlled restart about 20:08 by successor 22 for the new `packages/templates` workspace and `@design-library/core/render` (Q64): verified PID 52676 by command line, stopped it, started this one; earlier: `52676` / `60040`, controlled restart 2026-11-08 about 19:50 by successor 21 for FloatingBar and the second entry `site.html` (Q63): verified PID 24268 by command line, stopped it, started this one; earlier restart about 19:10 for Board and AppLayout: verified PID 41588 by command line, stopped it, started this one; earlier restart about 19:00 for TreeView, Canvas and EditorLayout: verified PID 56892 by command line, stopped it, started this one; earlier restart about 18:48 for Agenda: verified PID 50812 by command line, stopped it, started this one; earlier controlled restart 2026-11-08 about 18:33 by successor 20 for the new SiteHeader, SiteLayout and ScreenPreview files: verified PID 52452 by command line, stopped, started detached with `npm run dev -w apps/library`; earlier controlled restart 2026-11-08 about 13:05 by the successor-19 worker for the new ConversationList and ChatLayout files, through its own handle; earlier restart about 12:45 for ImageGeneration, PID `23340`; earlier restart about 12:35 for the Composer files, PID `20736`; old PID `17224` stopped by verified ID and command line; earlier restart about 12:20 by the successor-18 worker for the new ChatThinking files; old PID `45384` stopped by verified ID and command line). Before that `45384` / `40372` (controlled restart 2026-11-08 about 12:15 by the successor-18 worker for the new MessageActions files; old PID `51864` stopped by verified ID and command line). Before that `51864` / `33404` (controlled restart 2026-11-08 about 12:10 by the successor-18 worker for the new ChatMessage files; old PID `42500` stopped by verified ID and command line). Before that `42500` / `28476` (controlled restart 2026-11-08 about 10:19 by the successor-17 worker for the new DateField files; old PID `28468` stopped by verified ID and command line). Before that `28468` / `38888` (started 2026-11-08 09:37 by the successor-17 worker on main's request: port 8766 refused connections and no node process held it; the previous `45464` / `42032`, started about 05:40 for the new TimeField files, had gone). Before that `51512` / `44492` (controlled restart 2026-11-08 about 05:37 by the successor-17 worker for the new FileUpload files; old PID `50060` stopped by verified ID and command line). Before that `50060` / `21608` (controlled restart 2026-11-08 about 05:29 by the successor-17 worker for the new EmptyState files; old PID `30244` stopped by verified ID and command line). Before that `30244` / `25880` (controlled restart 2026-11-08 about 05:26 by the successor-17 worker: the Props table reads sources through an eager glob, so the new ErrorSummary file needed it; old PID `46128` stopped by verified ID and command line). Before that `46128` / `52104` (controlled restart 2026-11-08 about 05:20 by the successor-17 worker for the new Alert files; old PID `51736` stopped by verified ID and command line). Before that `51736` / `42376` (controlled restart 2026-11-08 about 05:20 by the successor-16 worker for the new Notifications files; old PID `47612` stopped by verified ID and command line). Before that `47612` / `11360` (controlled restart 2026-11-08 about 05:10 by the successor-16 worker for the new Hero files; old PID `6024` stopped by verified ID and command line). Before that `6024` / `19568` (controlled restart 2026-11-08 about 05:06 by the successor-16 worker for the new Footer files; old PID `16512` stopped by verified ID and command line). Before that `16512` / `10088` (controlled restart 2026-11-08 about 05:12 by the successor-16 worker for the new ListDetail files; old PID `37072` stopped by verified ID and command line). Before that `37072` / `25716` (controlled restart 2026-11-08 about 04:52 by the successor-15 worker for the new MediaPlayer files; old PID `30456` stopped by verified ID and command line). Before that `30456` / `53096` (controlled restart 2026-11-08 about 04:40 by the successor-15 worker for the new Sheet files; old PID `45336` stopped by verified ID and command line). Before that `45336` / `24464` (controlled restart 2026-11-08 about 04:27 by the successor-14 worker for the new Popover files; old PID `44420` stopped by verified ID and command line). Before that `44420` / `52696` (controlled restart 2026-11-08 about 04:20 by the successor-14 worker for the new Tooltip files; old PID `44984` stopped by verified ID and command line). Before that `44984` / `44880` (controlled restart 2026-11-08 about 04:02 by the successor-13 worker for the new Mentions files; old PID `40124` stopped by verified ID and command line). Before that `40124` / `28796` (controlled restart 2026-11-08 about 03:57 by the successor-13 worker for the new InlineEdit files; old PID `40736` stopped by verified ID and command line). Before that `40736` / `48132` (controlled restart 2026-11-08 about 03:46 by the successor-13 worker for the new Quote files; old PID `22492` stopped by verified ID and command line). Before that `22492` / `41880` (controlled restart 2026-11-08 about 03:38 by the successor-12 worker for the new Lightbox files; old PID `30148` stopped by verified ID and command line). Before that `30148` / `42284` (controlled restart 2026-11-08 about 03:34 by the successor-12 worker for the new ImageGrid files; old PID `48612` stopped by verified ID and command line). Before that `48612` / `2384` (controlled restart 2026-11-08 about 03:29 by the successor-12 worker for the new Image files; old PID `21328` stopped by verified ID and command line). Before that `21328` / `34212` (controlled restart 2026-11-08 about 03:26 by the successor-12 worker for the new Accordion files; old PID `33604` stopped by verified ID and command line). Before that `33604` / `50884` (controlled restart 2026-11-08 about 03:23 by the successor-12 worker for the new Statistic files; old PID `37864` stopped by verified ID and command line). Before that `37864` / `48912` (controlled restart 2026-11-08 about 03:15 by the successor-12 worker for the new Card files; old PID `25104` stopped by verified ID and command line). Before that `25104` / `49272` (controlled restart 2026-11-08 about 03:20 by the successor-11 worker for the new Dialog files; old PID `27660` stopped by verified ID and command line). Before that `27660` / `49544` (controlled restart 2026-11-08 about 03:10 by the successor-11 worker for the new Pagination files; old PID `51964` stopped by verified ID and command line). Before that `51964` / `50320` (controlled restart 2026-11-08 about 03:02 by the successor-11 worker for the new Tabs files; old PID `4960` stopped by verified ID and command line). Before that `4960` / `50200` (controlled restart 2026-11-08 about 02:55 by the successor-11 worker for the new Breadcrumbs files; old PID `40200` stopped by verified ID and command line). Before that `40200` / `35972` (controlled restart 2026-11-08 about 02:46 by the successor-10 worker for the new Carousel files; old PID `11168` stopped by verified ID and command line). Before that `11168` / `47912` (controlled restart 2026-11-08 about 02:36 by the successor-10 worker for the new AvatarGroup and Persona files; old PID `52312` stopped by verified ID and command line). Before that `52312` / `48348` (controlled restart 2026-11-08 about 02:24 by the successor-10 worker: Vite could not resolve the new Avatar story file until restarted; old PID `52356` stopped by verified ID and command line). Before that `52356` / `43560` (controlled restart 2026-11-08 about 01:19 by the successor-8 worker for the new RadioGroup files; old PID `44944` stopped by verified ID and command line). Before that `44944` / `50756` (controlled restart 2026-11-08 about 01:13 by the successor-8 worker for the new TagInput files; old PID `38444` stopped by verified ID and command line). Before that `38444` / `48988` (controlled restart 2026-11-08 about 01:07 by the successor-8 worker for the new Field files; old PID `38304` stopped by verified ID and command line). Before that `38304` / `28936` (controlled restart 2026-11-08 about 00:48 by the successor-7 worker for the new Rating files; old PID `49944` stopped by verified ID and command line). Before that `49944` / `29236` (controlled restart 2026-11-08 about 00:33 by the successor-7 worker for the new GradientEditor files; old PID `52928` stopped by verified ID and command line). Before that `52928` / `10808` (controlled restart 2026-11-08 about 00:29 by the successor-7 worker for the new AllocationSlider files; old PID `37848` stopped by verified ID and command line). Before that `37848` / `46440` (controlled restart 2026-11-08 about 00:20 by the successor-6 worker for the new Chip and ChipGroup files, via `stop_powershell` on `…-8766i`). Before that `49036` / `18184` (controlled restart 2026-11-07 about 23:58 by the successor-6 worker: `List.tsx` was replaced and new `behaviour/listbox.ts` added, and the source glob served List without props; old PID `30020` stopped by verified ID and command line). Before that `30020` / `49200` (controlled restart 2026-11-07 about 23:41 by the successor-5 worker for the new Flag files, via `stop_powershell` on `…-8766g`). Before that `44488` / `48080` (controlled restart about 23:31 for the new NumberField files; old PID `43188` stopped by verified ID and command line). Before that `43188` / `27604` (controlled restart 2026-11-07 about 21:49 by the F17 worker for the new icon-set and CheckboxGroup files; old PID `19992` stopped by verified ID and command line. Before that `19992` / `44716`, controlled restart 2026-11-07 about 21:17 by the F13c worker for the new `behaviour/scroll.ts`; old PID `32640` stopped by verified ID and command line. Before that `32640` / `15828`, controlled restart 2026-11-07 about 21:05 by the F13c worker for the new Skeleton, Progress and Loading story files; old PID `42680` stopped by verified ID and command line. Before that `42680` / `46940`, controlled restart 2026-11-07 about 20:55 by the F14b worker: the watcher served a stale Example.tsx; old PID `43356` stopped by verified ID and command line; `43356` was started about 20:47 for the new font and Slider files, replacing `46872`; that one was started 20:36 by the F14 worker for the new ScrollArea files, replacing `28932`. Before that `28932` / `31904`, controlled restart 2026-11-07 20:40 by the F15.1 worker: the watcher missed the new ButtonGroup story file, as it had missed an edited CSS import and `pages.ts` earlier that evening; touching a file fixes an edit, a new file needs a restart. Before that `26780` / `13748`, started 2026-11-07 17:27 after the server was found down, port refused; previous `46936` / `49472`; controlled restart 2026-11-07 13:40 by the C5 worker: the watcher again missed a new story file; old PID `27732` stopped by verified ID and command line; earlier restart 12:47 by the F6 worker, PID `3856`); command line verified as the Vite command above |
| Readiness | HTTP 200 with title "Design Library"; `diagnostic.html` HTTP 200; Colour page measured contrast in four contexts in a task-owned browser page |
| Why 8766, not 5173 | Another project's Vite dev server already answers on `127.0.0.1:5173`; it was left untouched. `netstat` in this environment does not list loopback listeners, so verify by HTTP response content, not by port tables. |

Recovery: request the URL and confirm the title is "Design Library" before acting. If our server is gone, restart with the command above (detached) and re-record the PIDs here; a controlled restart uses `stop_powershell` on the handle, never process-name killing or killing another port owner. Vite hot-reloads source and CSS; rerun `npm run tokens` after editing token JSON.

**Revision API (R2b, 2026-11-07):** `vite.config.ts` mounts the library revision plugin (`apps/library/revisions/api.mjs`) and turns Vite's CORS off. Vite restarted itself in-process on the config change, so the listener is still Node PID `125596` (parent `124400`), checked by command line, with HTTP 200 on `/` and on `/__library/revisions`, and 403 for a foreign `Origin`. Revisions save to `.design-library/revisions/`; agents use `node .\tools\library-revisions.mjs` ([Library revisions](foundation.md#library-revisions)). A static build (`vite build`/preview) has no API and shows the pane read-only.

**Dependencies:** npm 9.6.7 on the user path fails with an arborist `edgesOut` error on these workspaces. Use Node's bundled npm 11 without changing global configuration: `node "<node dir>\node_modules\npm\bin\npm-cli.js" install`. The project `.npmrc` sets `https://packagefeedproxy.microsoft.io/npm/`; the proxy itself serves tarballs from its backing Microsoft feed (`ms-feed-25.pkgs.visualstudio.com/1es-public/...`), so those are the lockfile's resolved hosts. TypeScript is pinned to 6.0 because the catalogue generator (S4) needs the JavaScript compiler API.

**F4 picker dependencies (2026-11-07):** `react-grab@0.2.0` (MIT; only `react-grab/primitives` is imported, never its overlay or `npx grab init`) and `@medv/finder@4.0.2` (MIT), installed into `apps/library` with `--save-exact --ignore-scripts` through the npm proxy using Node's bundled npm 11; neither package has install scripts, and the lockfile holds no `registry.npmjs.org` URL. `vite.config.ts` gained the `virtual:library-source-files` plugin; Vite restarted itself in-process, and the listener stayed on Node PID `3856`.

## Safe updates

For each source folder, first inspect `git -C <folder> remote -v`, `git -C <folder> status --short`, and its current branch. Do not overwrite an unrelated folder or reset a dirty checkout. For clean expected-origin default-branch clones:

```powershell
git -C agentic-craft fetch origin
git -C agentic-craft merge --ff-only origin/main
git ls-remote --symref https://github.com/prabinpebam/agentic-craft.git HEAD
git -C agentic-craft rev-parse HEAD
# Repeat for agent-orchestration and slate, using each live default branch.
node .\agentic-craft\tools\install.mjs . --for copilot
node .\agent-orchestration\tools\install.mjs . --for copilot
node .\slate\scripts\runtime-host.mjs sync --repo . --host docs
node .\slate\scripts\runtime-host.mjs check --repo . --host docs
node .\tools\validate-setup.mjs
```

Record new SHAs, branch, fetch date and test outcomes here. Compare host-owned index markup with a new Slate entry when controls change; runtime sync does not update that host-owned entry. Copied retired skills are not automatically deleted: assess upstream release notes and overlap rather than removing files blindly. Stop on divergent/dirty sources, unmanaged runtime collisions or an approved-feed blocker; preserve work and report the exact sanitized issue.
