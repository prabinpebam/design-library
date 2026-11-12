# DesignUp as a library template

**Status:** ruling for review, 2026-11-12. Extends [Template pressure-test loop](pressure-test-loop.md), section 2 "One ruling: who changes core, and when", with a fourth case. Branch `designup`, worktree `..\dl-designup`.

> **TL;DR for agents:**
>
> - **DesignUp is treated as a library template, not an outside consumer.** It lives in its own repository, but every design gap it hits is fixed generically in core here, on branch `designup`, and DesignUp adopts the same change with its workaround deleted. No temporary overrides.
> - **Same gates as an in-repo template:** defaults unchanged, stories, `npm run agent:index`, `npm run check`, `npm run check:regression` against the frozen base before commit.
> - **Brand compositions stay in DesignUp's template** (`web/src/templates/designup/parts/`) until a second product needs them (the rule of two). Owner confirmed 2026-11-12: CityHero, CityStrip, TalkGrid, Shelf, Finder, Call, Grain, Logo, HeaderEnd, the edition index and the page-opening Hero stay DesignUp custom parts.
> - **Composition belongs to the page (owner, 2026-11-12 23:38):** fundamentals are placed only at the page level; compounds, sections and layouts are blocks, preset fixed configurations a page picks by variant and fills by fields, never re-composed inside (amended 23:41); the only add inside a block is more of its own repeating element, and extra parts become on/off options or variants of the reusable block (23:44); one way to do each thing (core `AGENTS.md`, Never 10).
> - **`designup` reaches `main` serially:** only when `main` is clean and no other integration is running, then the full check and sweep on the combined result, and a refreeze only after that.
> - **Mandatory for every DesignUp design change, on both of its templates** (owner, 2026-11-12 18:31 and 18:36): **site**: `templates/designup`; **admin**: `templates/designup-admin` + `src/admin` (`?admin`), the one admin edit mode (`editor-design` is only its design reference). DesignUp's agents start every design request with its `design-change` skill, make the library part here on `designup`, and adopt it with no override; DesignUp's `validate.mjs` and a guard hook fail or deny `!important`, core `data-dl` selectors, private `--c-*` and edits to the installed core.

Owner, 2026-11-12 14:34 (verbatim): *"DesignUp site is behind from the current state of the Design library. We want to update DesignUp to the latest version. While DesignUp site is outside the library as a separate project, it qualifies as a custom template. I want to bring DesignUp site to a point where working on any Design update in DesignUp site is done as a pressure-test loop by directly editing the library core itself and also adopting the same changes in the DesignUp site too. This way, the implementation of the library in DesignUp site doesn't have to use any hack and the stays clean fundamentally and the library itself also gets robust and improved. Do what is necessary to bring the working state to this level. Execute against DoD"*

## The fourth case of the ruling

This row joins the table in [pressure-test loop, section 2](pressure-test-loop.md#2-one-ruling-who-changes-core-and-when); the other three rows are unchanged.

| Situation | What happens | Why |
| --- | --- | --- |
| **An external project treated as a library template** (DesignUp, in its own repository, on the `designup` branch here) | Gaps that pass the [three-question test](templates-and-library.md#the-rule-library-or-template) are fixed **generically in core right away** on `designup`, with defaults unchanged, stories, `npm run check` and a clean frozen-base `npm run check:regression` before commit; the project adopts the change through its live link and deletes its workaround in the same slice. Temporary overrides are not allowed; when a core change can't land in time, the row is logged first and the slice isn't done until the override is gone. Brand compositions stay in the project's template `parts/` (rule of two) | A real site is the strongest pressure test the library has; fixing at the source keeps the site clean and the library growing |

## How it runs

| Step | DesignUp | Library (`designup`) |
| --- | --- | --- |
| Find, log | Seam ladder; 11-field row on DesignUp's Library requests page before any workaround | Row mirrored in the request log below |
| Fix | — | Generic seam at the lowest owning layer, one commit per request; stories; agent index; `npm run check`; `npm run check:regression` against the frozen base |
| Adopt | `npm run dev:linked` reads `packages/core` live from this worktree; switch to the seam, delete the workaround | — |
| Pin | `npm run library:pin` packs the committed core, repins `web/vendor/`, installs | Commit named in DesignUp's `web/vendor/README.md` |
| Ship | Row `shipped` with the commit | Row `shipped` with the commit; the removal step goes into the next `adopt-<version>.md` |

**Branch and base.** `designup` = library `main` + the g14 fixes DesignUp already used (`fix/g14-dialog-close-target`, and the beta.2-only commits from `fix/g14-dialog-target-beta2`), plus the regression tooling from `feat/brand-map`. Frozen base: `3f8609e` (`.shots/base-dist/BASE.json`), before the first request packet.

**Integration.** Serial, per [Keeping other templates unbroken](pressure-test-loop.md#keeping-other-templates-unbroken): rebase `designup` on `main` when `main` is clean and idle, run `npm run check` and the full sweep on the combined result, merge, then refreeze. Until then the branch is kept ready and its status reported.

## Request log (DesignUp)

Mirrors DesignUp's Library requests page; rows move to the [Library request log](pressure-test-loop.md#library-request-log) at integration.

| ID | Date | Need | Exact limitation (evidence) | Step | Proposed API | Override / part | Owner | Status | Shipped in | Removal step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LR1 | 2026-11-11 | Footer "Editions" years in 2 columns under one heading | `FooterSection` renders its links as one flex column; `--c-footer-*` private | Step 6 | `FooterSection.columns?: 1 \| 2` | DesignUp `designup.css` footer block, `data-designup-footer` | DesignUp | `shipped` | `5fe1f23` | Done: `"columns": 2` in `shell.json`, `--c-footer-links-column-min: 4em`; block and attribute deleted |
| LR2 | 2026-11-11 | Menu and search items that navigate are real links | `MenuButtonItem`, `ListItem` rendered `div` + `onSelect` only | Step 6 | `ListItem.href` (router-aware `a[href]`, role kept), `MenuButtonItem.href` | DesignUp `overlay-link.*`, `LinkMenuButton.tsx`, `SiteSearch.tsx` | DesignUp | `shipped` | `2483fe3` | Done: items and results pass `href`; overlay files deleted (DesignUp `aa2e7d4`) |
| LR3 | 2026-11-11 | Focused skip link follows the corner radius | `[data-dl-skip]` has no `border-radius` | Step 6 | `[data-dl-skip]` reads `--radius-md` | DesignUp `designup.css` skip-link block | DesignUp | `shipped` | `089af2f` | Done: `--c-site-layout-skip-radius` set to the control radius; block deleted |
| LR4 | 2026-11-12 | A bar that sticks within its section | Only SiteLayout's header stuck; `--dl-chrome-block` undocumented | Step 6 | `StickyBar` layout (`bleed`, `--c-sticky-bar-padding-block`); `--dl-chrome-block` documented | DesignUp `talk-grid.css`, `TalkSection` | DesignUp | `shipped` | `5681551` | Done: `<StickyBar bleed>` in `TalkSection`; sticky rules deleted (DesignUp `da4a482`) |
| LR5 | 2026-11-12 | An applied-filter state on fields and choices | No `applied` state on TextField, Select, SegmentedControl | Step 6 | `applied` prop and `data-applied` context attribute (`--c-applied-fill`, `--c-applied-border`); SegmentedControl `emphasis="quiet"` | DesignUp `talk-grid.css`, `TalkFilter` | DesignUp | `shipped` | `bb3de9e` | Done: props and `data-applied` on `TalkFilter`; colour re-scoping deleted (DesignUp `d198e47`) |
| LR6 | 2026-11-12 | Section head gap follows the theme | `--c-section-gap` not on the settings allow-list | Step 6 | `--c-section-gap` on the allow-list | DesignUp `tokens/context.css` | DesignUp | `shipped` | `1575ed6` | Done: set with `settingsCss` on DesignUp's content contexts; line deleted |
| LR15 | 2026-11-12 | A page-level layout grid (owner 23:54): rows, split into a fixed set of columns, cells split into rows again, leaf cells are slots for one block; row gaps from a preset list | `Grid` is 2–4 auto-fit columns or two uneven ones for things compared side by side; no layout divides one fixed column count recursively; `split`/`grid` blocks nest blocks inside a block | Step 6 | `PageGrid` layout: `rows` tree (`split`: whole, halves, thirds, quarters, two-thirds-start, two-thirds-end on 12 columns, only those dividing the parent span; `gap`: item, group, section, page), `renderSlot(cell)`; helpers `pageGridSplits`, `pageGridSpans`, `pageGridProblems`; tokens `c.page-grid.*` | none (new; the editor composes pages with it) | DesignUp admin | `shipped` | PENDING | Editor adopts `PageGrid` for page composition |
