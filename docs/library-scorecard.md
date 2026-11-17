# Library scorecard: boundary audit, rating framework and baseline

**Status:** for review ([DoD Q151, Q152](definition-of-done.md#owner-instructions)), 2026-11-12, Worker 101 (docs and read-only audit). Five parts: the [boundary audit](#how-this-was-checked) (Q151.1), the [rating framework](#rating-framework-q1512) (Q151.2), which [maps to the contract](#what-each-dimension-verifies-in-the-contract-q1523) (Q152.3), the [baseline score](#baseline-score-q1513) (Q151.3): **2.13 weighted, reported as 2.00 / 4, capped by UI copy and performance**, and the [findings routing](#findings-routing-q1524) (Q152.4). **[Loop L1](#loop-l1-score)** (Worker 111, `afcaba8`): **2.32 weighted, still reported as 2.00, now capped by performance alone**; 12 new findings, F19–F30. **[Loop L2](#loop-l2-score)** (Worker 127, `9f8749a`): **2.32 weighted, reported as 2.00, capped by performance**; D5 up to 4, D4 down to 2 after the first click-through (about half of Slack's and Word's controls dead); 4 new findings, F31–F34. **[Loop L3](#loop-l3-score)** (Worker 132, frozen build of `a80c7c0`): **2.42 weighted, reported as 2.00, capped by performance**; D4 back to 3 (click-through: Word 0 dead, YouTube 0, Slack 3 of 1,003, IKEA 54 of 351); 5 new findings, F35–F39.

> **The short answer.** **Core stayed generic; the template layer mostly held, but not ideally.** No product name, brand value or product-only icon leaked into core in either branch: 0 of 36 core change groups are product-specific. All three process defects are on the Word branch: one core change was never recorded, one uncommitted change alters a default without a sweep, and one recorded row is out of date. In the template layer, Slack keeps every hard rule. Word breaks the boundary in three places: it hand-builds a popup and a table instead of using core Popover and DataTable, and it paints its regions with one fixed-size SVG backdrop instead of fills on its layout. Both templates hard-code control sizes and dimensions in their part CSS (47 settings of core component tokens, 140 raw `rem` sizes), so the open question Q145.1 has now come up twice. Eight fixes are listed below for main to route.

## How this was checked

Read-only, on 2026-11-12 between 16:20 and 16:50, with no build, sweep or edit in either worktree.

| Copy | Branch and head | Template under audit | Core range audited |
| --- | --- | --- | --- |
| `dl-brand-map` | `feat/brand-map` at `5fc801a` (Slack signed off) | `packages/templates/slack` | `cd4c6f8` (main) → `38236f8` (shared base) → `5fc801a` |
| `dl-word` | `feat/word-q147` at `0fb6a25`, plus uncommitted work by Worker 99 | `packages/templates/word` | `cd4c6f8` → `38236f8` → `9f51b12` (fork point with Slack) → working copy |

Commands, all read-only:

- `git diff -w --ignore-cr-at-eol <range> --stat -- packages/core ':!packages/core/agent'`. Ignoring whitespace matters: without it, `tokens.json` and `pickers.css` show about 13,000 and 1,300 changed lines from line-ending noise alone.
- Diffs of `packages/core/css/tokens.css` and `packages/core/icons/icons.ts` for the names each template added.
- A case-insensitive grep of core CSS, TS, TSX, MJS, token JSON and Markdown for `slack`, `ikea`, `office`, `microsoft`, `copilot`, `huddle`, `segoe`, `aptos` and `lato`.
- Pattern counts over each template's `parts/` (`Select-String`): `!important`, `overflow: auto | scroll`, hex and `rgb()` colours, `px` and `rem` literals, `--c-*` settings without `var()`, `[data-dl=` selectors outside the template's own namespace, descendant (non-child) part selectors, and raw `<button>`, `<input>`, `<svg>` and `role=` elements.
- The [Templates and the library](templates-and-library.md) core-change tables, compared with the diffs.

## Core changes, judged

A change is **generic** when a second, unrelated product could use it and every default is unchanged ([the three-question rule](templates-and-library.md#the-rule-library-or-template)). It is a **leak** when it names a product, holds a brand value or draws a product-only glyph.

| Template | Change groups | Generic | Product-specific leak | Process defect |
| --- | --- | --- | --- | --- |
| Slack (Q143 packets A–L, Q146 packets A–E) | 19 | 19 | 0 | 0 |
| Word (Q145.W W1–W8, Q147 packets A–D, working copy) | 17 | 17 | 0 | 3 |
| **Both** | **36** | **36** | **0** | **3** |

Growth in core across both branches (`packages/core/css/tokens.css` lines, which repeat per context; `icons.ts` entries):

| Copy | `--c-*` lines | All custom properties | Core icons |
| --- | --- | --- | --- |
| main (`cd4c6f8`) | 2,314 | 2,956 | 94 |
| `dl-brand-map` (Slack signed off) | 2,542 | 3,232 | 176 |
| `dl-word` (working copy) | 2,514 | 3,204 | 176 |

### Slack: 19 change groups, all generic

Each group is recorded in [Core changes from the Slack replica](templates-and-library.md#core-changes-from-the-slack-replica-q143-q1453).

| Area | Groups | Why it's generic (verified in the diff) |
| --- | --- | --- |
| Icons | 4 (messaging, picker and create-menu kinds, shell and navigation, editor and arrows): about 40 names | Semantic names (`send`, `at`, `hash`, `home`, `bell`, `quote`, `code-block`…), drawn on the library grid; no Slack mark |
| Scales | 2 (`weight.black`, `space.5`) | Fill holes in the type and space scales; read only through roles |
| Fundamentals | 7 (`AvatarGroup.shape`, `c.icon.fill`, `MenuButtonItem` icon, tone and `startsGroup`; submenus; `ListItem` plates with category slots; hover, danger and submenu ink tokens; `Avatar` cached-image fix) | Menus, facepiles and plates are generic shapes; every default reads the old value |
| Compounds and behaviour | 6 (`Dialog.aside`, `Dialog.initialFocus` and its insets; `MenuButton` controlled `open`, `heading`, `side`, `openSubmenu`; `placePopup` inline-end alignment; `c.popup.*`, `c.popover.cross-offset`; `TextArea` tray tokens) | Onboarding modals, cascading menus and side popovers are desktop-shell mechanics; the sweep logged no unexplained pixel change |

What isn't core, and rightly so: Slack's colours, sizes and fonts are in `tokens/theme.json`; the solid material is an existing context attribute; the plum gradient, rim and cards are part CSS in the template's namespace.

### Word: 17 change groups, all generic, 3 process defects

| Area | Groups | Judgement |
| --- | --- | --- |
| Compound | `Ribbon` (tabs of named command groups, launcher, `extra`, `end`), `Ribbon.aside`, `RibbonGroup.hideLabel`, `c.ribbon.*` | Generic: the command surface of every document, sheet and drawing editor |
| Fundamentals | `Button.stacked`; `c.button.inherit-disabled`; Switch `tone="inherit"`, `stateText`, `labelPosition="start"` DOM order; `NumberField.steppers="stacked"`; `ScrollArea bar="gutter"`; Tabs text, weight and inline-start padding tokens | Generic, with unchanged defaults |
| Icons | About 29 editing, clipboard and history names (`bold`, `pilcrow`, `format-painter`…); `IconData.accent` and `accentFill` with `c.icon.accent-1…8` | Generic semantics. Both branches later removed the accent split from the ten W7 icons (Slack packet E for `lib--ribbon` parity, Word in `4d45ae1` when its own pack took over the colour), so the shared core icons agree |
| Tooling | `design-library-icons --custom`, `data-dl-part` preserved in packs, a `custom` flag on `BrandIconSet`, `check-project` accepting custom names | Generic mechanism, but it loosens the "icons have semantic names" check, and core gives no typed path for a custom name (finding LG8) |

The three process defects, all on the Word branch:

1. **Not recorded (RR11):** `c.button.pressed-edge`, `c.switch.off-border` and `c.switch.off-thumb` were committed in `0fb6a25` (Q147 packet D), but they're absent from [Templates and the library](templates-and-library.md).
2. **Default changed, no sweep:** in the uncommitted `packages/core/css/compounds/ribbon.css`, the ribbon card's `end` part changes from a flex item to `position: absolute` at the card's bottom inline-end corner, with `position: relative` on the card. That changes the default layout of every `Ribbon` with an `end` slot (`lib--ribbon` included). It needs a sweep or an opt-in before it's committed.
3. **Out of date:** the W7 row still says ten core icons "split their colour-cue part out", but both branches have since removed that split.

## The template layer, checked

Counts over each template's `parts/` folder. Generated `tokens/theme.css` is data and is left out.

| Check | Slack | Word | Rule |
| --- | --- | --- | --- |
| Part CSS / TSX lines | 2,151 / 1,871 | 1,272 / 950 | — |
| `!important` | 0 | 0 | Never |
| `overflow: auto \| scroll` outside ScrollArea | 0 | 0 | Q96 |
| Hex or `rgb()` colours in CSS rules (not comments) | 0 | 0 | Colours only through tokens |
| `[data-dl=…]` selectors outside the template's namespace (core restyles) | 0 | 0 | Never select a core component |
| Descendant part selectors (not child paths) | 0 | 0 | `check:parts` |
| Raw `<button>`, `<input>`, `<table>` | 0 | 0 | Use core controls |
| Hand-built widget roles (`role="dialog"`, `"table"`…) | 0 | **2** | Use core Popover, Dialog, DataTable |
| Inline `<svg>` drawings in TSX | 0 | **20** | Pictures, `Icon` or CSS fills |
| `as IconName` casts | 0 | **39** | Typed names only |
| Core component tokens set to literals in part CSS | **25** (popup and menu geometry) | **22** (18 are control sizes `--c-button-size-xs`, `-s`, `--c-field-size-*`) | Values belong in token data (Q145.1) |
| Raw `rem` sizes in declarations | **93** (widths, heights, grid tracks; 5 `font-size`) | **47** (widths, heights; 1 `letter-spacing`) | Sizes from tokens; type always from `text.*` |
| Key handlers in parts | 2 (thread Escape, dialog Enter) | 0 | Behaviour belongs in core |

### What the Word counts are

- **A hand-built popup.** The Design tab's style-set gallery is a `div` with `role="dialog"`, `data-material="floating"` and `data-elevation="3"` (`parts/layouts/Window.tsx`, line 659). It has no anchoring, no Escape, no focus return and no outside-click dismissal: core `Popover` does all of that.
- **A hand-built table.** Backstage's file list is ARIA `role="table"` built from `div`s (line 601), while core has `DataTable`.
- **Regions painted by a picture.** A `1349 × 922` SVG `backdrop` (line 343) paints the title bar, tab band, canvas, status bar and Backstage rail as fixed-coordinate `rect`s stretched with `preserveAspectRatio="none"`, and a second SVG draws the window ring. The colours are tokens, but the geometry is fixed: the 46 px title band scales with window height and doesn't follow the layout. The part CSS keeps those regions transparent "so enclosure depth stays 0 (VN1, VN3)", so the visual-noise probe never sees these fills. That is a workaround for the probe, not a pass. Twelve more inline SVGs draw backgrounds, separators and the active box. `check:svg` reads only `.svg` files, so none of these are checked.
- **Type casts.** 39 `as IconName` casts reach the custom pack's names (`'qat-chevron'`, `'step-first'`), because `Icon` only types core names.

### What the Slack counts are

Slack keeps every hard rule. Its two soft spots are the same as Word's: popup and menu geometry set as literals on core component tokens in part CSS (`--c-popup-width`, `--c-menu-button-list-min-width`…), and 93 raw `rem` dimensions, five of them font sizes. Its two key handlers are local: Escape closes the thread pane and Enter submits the create-channel name. A `Pane` close seam would remove the first.

## Fix list (request-log format)

These continue the [Library request log](pressure-test-loop.md#library-request-log) numbering. Main routes them; this page doesn't change any code.

| ID | Date | Need | Exact limitation (evidence) | Step | Proposed API | Override / part | Owner | Status | Shipped in | Removal step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LG3 | 2026-11-12 | A template gives one control a non-standard size (Slack's 22 px search pill; Word's 18 ribbon controls) as token data, not literals in part CSS | Q145.1 has now come up twice: 47 literal `--c-*` settings in part CSS (Slack 25, Word 22). Under the two-strike rule, the packet that closes it must add a check | Step 6 | Template `tokens.json` gains component-token overrides scoped to a part (`t.<template>.<part>.c.<component>.*`), emitted on the part by `npm run tokens`; `check:parts` warns on a literal `--c-*` setting in part CSS | `slack/parts/layouts/workspace.css`, `word/parts/layouts/window.css` | Library core | `shipped` (C1: `$parts` in `theme.json` rather than `tokens.json`, since the values re-decide core tokens; `check:project` `core-token` is an error, stricter than the proposed warning) | `dl-integrate` (C1, Worker 109) | Move each literal into template token data; delete the declarations |
| LG4 | 2026-11-12 | Word's style-set gallery opens as a proper popup | Hand-built `role="dialog"` `div` with no anchoring, Escape, focus return or outside dismissal (`Window.tsx` line 659) | Step 1 (existing seam) | Core `Popover`, anchored to the gallery's More button (`anchorRef`, `side="over"`) | `word/parts/layouts/Window.tsx` | Word worker | `shipped` | `dl-word 2d623d8` | Wrap the gallery content in `Popover`; delete the `role="dialog"` div and its material attributes |
| LG5 | 2026-11-12 | Backstage's recent-files list | ARIA `div` table (`Window.tsx` line 601), while core has `DataTable` | Step 1, or step 6 if `DataTable` lacks a quiet, borderless density | `DataTable` styled via existing `c.data-table.*` tokens in `word/tokens/theme.json` | `word/parts/layouts/Window.tsx`, `window.css` (`word-file-table` deleted) | Word worker | `shipped` | `dl-word 2d623d8` | Render with `DataTable`; delete `word-file-table` markup and CSS |
| LG6 | 2026-11-12 | Word's window regions (title bar, tab band, canvas, status bar, Backstage rail) have their own fills | A fixed `1349 × 922` SVG backdrop paints them, and the regions stay transparent, so the visual-noise enclosure probe doesn't see them | Step 4 or 6 | Fills on the layout regions from theme tokens. If the visual-noise rules count a full-bleed band as an enclosure, fix the probe so a region's own fill isn't one (a core probe rule), not the template | `Window.tsx`; `window.css` | Word worker (`shipped`); Library core for the probe rule (`shipped`, C2 VN7) | `shipped` (template); `shipped` (probe, `dl-integrate` C2) | `dl-word 2d623d8` | Delete the backdrop and frame-ring SVGs; set the region fills in part CSS from tokens; rerun the probe |
| LG7 | 2026-11-12 | Inline SVG in template code is checked as SVG files are | `check:svg` scans only `.svg` files (`packages/core/tools/check-svg.mjs` line 74), so 20 inline drawings in Word's TSX aren't checked | Step 6 (check) | `check:svg` (or `check:parts`) flags `<svg` in `packages/templates/*/parts/**/*.tsx` unless it's in a declared allow-list with a reason (rulers, for example) | — | Library core | `shipped` (check, C2 `inline-svg` in `check:project`; Word drawings moved to `Icon` in `dl-word 2d623d8`) | `dl-integrate` (C2) | Move decorative drawings to template pictures or `Icon`; allow-list the rulers |
| LG8 | 2026-11-12 | Custom icon names from a template pack typed without casts | `IconName` covers core names only, so `--custom` packs need `as IconName` (39 in Word) | Step 6 | `Icon` accepts a branded `CustomIconName` (a string from `defineIconPack(pack)`), or a pack-generated union type | `word/parts/layouts/Window.tsx` | Library core | `shipped` (`defineIconPack`) | `dl-integrate` (C2) | Replace the casts with the pack's typed names |
| LG9 | 2026-11-12 | Ribbon `end` placement change goes through the sweep | Uncommitted `ribbon.css` makes `end` `position: absolute` for every Ribbon (a default change) | Step 6 | Make it opt-in (`Ribbon` `endPlacement="corner"`, default `'flow'`) and prove it with `check:regression` | `dl-word` (`Ribbon.tsx`, `ribbon.css`, `Window.tsx`) | Word worker | `shipped` | `dl-word 2d623d8` | Keep the default in flow; opt Word in |
| LG10 | 2026-11-12 | Every core change appears in Templates and the library (RR11) | Word packet D's `c.button.pressed-edge`, `c.switch.off-border` and `c.switch.off-thumb` are unrecorded; the W7 icon-split row is out of date | — (docs) | Add the rows; correct W7 | — | Word worker | `shipped` | `templates-and-library.md` (2026-11-12) | Not applicable |

Lower priority, not logged: raw `rem` dimensions in parts (140) and raw `font-size` and `letter-spacing` (6). Replica geometry is measured, so raw widths are tolerable in step-5 parts, but type isn't: those six should become `text.*` roles or template part tokens. Slack's thread Escape handler would go away with a `Pane` close seam if a second template needs one.

## Rating framework (Q151.2)

The scorecard rates the library as a design library: how easily people and agents build with it, how far it bends without breaking, and how well its rules and checks keep screens good. It has 13 dimensions. Each has a definition, a weight, 0–4 anchors, and indicators that are counts or scores from a command, a probe or an evaluator, never opinion.

### When it's scored, and by whom

- **After each pressure-test loop:** after each template's sign-off, and after each serial integration of parallel branches ([pressure-test loop, step 5b](pressure-test-loop.md#3-end-to-end-procedure)). Also before each `@design-library/core` release.
- **By an evaluator who didn't build the loop** (the [adversarial loop](adversarial-loop.md) rule). The evaluator records the commit for each copy, runs the indicators and links each score to its evidence.
- **Unmeasured means n/m:** an indicator nobody has measured is written **n/m**, never estimated. A dimension scores only on its measured indicators. If none are measured, the dimension is n/m and its weight is listed as unmeasured.
- A new row goes into the [history table](#history) each time; old rows are never rewritten.

### Levels: what 0–4 means

Each dimension's anchors below make these levels specific.

| Level | Name | Meaning |
| --- | --- | --- |
| 0 | Absent | No rule, mechanism or evidence |
| 1 | Written | Rules exist in skills or docs; nothing checks them, or the checks fail |
| 2 | Working, leaking | A mechanism and a check exist and mostly hold, but there are known misses the checks don't catch |
| 3 | Enforced | Automated checks or probes catch every known kind of miss, and the latest loop shows 0 open misses |
| 4 | Proven | Level 3, held across at least two unrelated products and an outside consumer, with a regression gate that would fail if it slipped |

### Overall score, and the rule that a failing dimension can't hide

1. **Weighted mean** of the measured dimensions (weights below, total 100), shown to two decimals out of 4.
2. **Floor rule:** if any measured dimension scores 0 or 1, the overall score is **capped at 2.00** and shows the dimensions holding it down. A strong dimension can't average away a failing one.
3. **Coverage rule:** the overall score is shown with the share of weight that was measured. Under 70% measured, it is **provisional**.
4. **Per dimension, the weakest layer counts:** where a dimension covers both core and the template layer (token and component discipline), it takes the lower of the two.

### Dimensions

| # | Dimension | Weight | Definition |
| --- | --- | --- | --- |
| D1 | Ease of use: people | 8 | A developer or designer finds the right component, prop or token and gets a correct screen without asking |
| D2 | Ease of use: agents | 10 | An agent builds with the library from the consumer guide and index alone, reaches for the right seam, and is stopped by a check when it doesn't |
| D3 | Ease of customization | 12 | A product's look and structure come from steps 1–4 of the [seam ladder](pressure-test-loop.md#1-the-seam-ladder) (props, slots, context, theme) with little part code |
| D4 | Versatility | 10 | Unrelated products (shop, messenger, editor, sites) are built on one core, and none of them breaks another |
| D5 | Token discipline | 10 | Every colour, size, space, type and motion value comes from a token with a declared meaning, in core and in templates |
| D6 | Component discipline | 12 | Core holds generic patterns with unchanged defaults; templates compose core and never rebuild, restyle or fork it ([the rule](templates-and-library.md#the-rule-library-or-template)) |
| D7 | Spacing | 6 | Space comes from the scale and roles, grouped by proximity and owned by the layout ([spacing](spacing.md)) |
| D8 | Layout and reflow | 6 | Regions, columns and scroll regions follow the layout rules at every width down to 320 px ([layout](layout.md), [scrolling](scrolling.md)) |
| D9 | UI states | 6 | Every component and view has its loading, saving, success, error, empty and disabled states, placed and announced as [UI states](ui-states.md) requires |
| D10 | Visual noise | 5 | Every mark carries information; enclosure depth and cues stay within the [visual-noise](visual-noise.md) limits |
| D11 | UI copy | 4 | The words follow the voice, the glossary and the per-element rules (ui-copy skill) |
| D12 | Performance and perceived performance | 5 | Loads, renders and waits have budgets, a baseline and the right feedback (performance and perceived-performance skills) |
| D13 | Accessibility | 6 | WCAG 2.2 AA in every scheme: contrast, keyboard (APG patterns), names, targets, reduced motion, forced colours |

### Anchors and indicators per dimension

Each indicator lists the command, probe or record that collects it.

<details><summary><strong>D1 Ease of use: people</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Components exist; the docs are scattered |
| 2 | Every component has a library page and stories; there's a consumer guide; nobody has tested how long a newcomer takes |
| 3 | A first-time person builds a given screen unaided within the time budget; no open consumer request has been waiting more than one release |
| 4 | Level 3 for two outside consumers |

| Indicator | Collected by |
| --- | --- |
| Stories files per core component | Count `packages/core/react/**/*.stories.tsx` against components per tier |
| Consumer guide present, with steps and "Rules agents miss" | `packages/core/AGENTS.md`, `packages/core/guide/*.md` |
| Open and accepted consumer requests (LR rows) | [Library request log](pressure-test-loop.md#library-request-log) |
| Minutes for a first-time person to build a reference screen | Timed session (none run yet) |

</details>

<details><summary><strong>D2 Ease of use: agents</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Agents read source to find APIs |
| 2 | A machine-readable index and a "Rules agents miss" table exist; agents reach evaluator sign-off, but some misses get past every check |
| 3 | Every miss an evaluator found in the last loop is now caught by a check (two-strike rule closed); a cold agent finishes a reference screen with 0 seam misses |
| 4 | Level 3 in an outside consumer project too |

| Indicator | Collected by |
| --- | --- |
| Index entries and freshness | `npm run agent:index:check`; count `packages/core/agent/components/*.json` |
| "Rules agents miss" rows | Count table rows in `packages/core/AGENTS.md` |
| Names in the guides that exist | `npm run check:names` |
| Boundary misses that passed every check in the last loop | This page's [template-layer table](#the-template-layer-checked) (misses the evaluator signed off on) |
| Seam misses for a cold agent on a reference screen | Agent trial (none run yet) |

</details>

<details><summary><strong>D3 Ease of customization</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | A product's look needs forks or overrides |
| 2 | Theme and component tokens carry the brand, but each product still needs large part CSS and literal component-token settings |
| 3 | A new product needs core changes only for truly new mechanics, and its part CSS holds only arrangement: 0 literal `--c-*` settings and type only from tokens |
| 4 | Level 3 for a third product with no core change at all |

| Indicator | Collected by |
| --- | --- |
| Core change groups each template needed (seam ladder step 6) | The [core-change tables](templates-and-library.md) and `git diff --stat -- packages/core` |
| Part CSS lines per template, and per replicated screen | Line counts in `packages/templates/<t>/parts/**/*.css` |
| Literal core component tokens set in part CSS | Count `--c-*:` declarations without `var(` in part CSS |
| Theme overrides in token data | Count keys in `packages/templates/<t>/tokens/theme.json` |

</details>

<details><summary><strong>D4 Versatility</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | One kind of product |
| 2 | Several templates of a similar kind |
| 3 | Two unrelated products replicated to evaluator sign-off, with the sweep proving no other template moved |
| 4 | Three or more unrelated replicas plus an outside consumer at parity |

| Indicator | Collected by |
| --- | --- |
| Templates in the repository | `packages/templates/*` |
| Replica screens and regions passing | The [Slack](slack-replica.md#7-sign-off) and [Word](word-replica.md#7-sign-off) trackers |
| Screens in the regression sweep; failed count | `npm run check:regression` (`verify-sweep.mjs` summary) |

</details>

<details><summary><strong>D5 Token discipline</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Tokens exist, but literals are common |
| 2 | Core is literal-free and checked; templates still hold literal component settings or raw type |
| 3 | 0 literal colours, type or component settings in core and in template parts; raw dimensions only in step-5 parts, and only where measured |
| 4 | Level 3, enforced by a check that fails on a planted literal |

| Indicator | Collected by |
| --- | --- |
| Generated tokens fresh; status not re-coloured by a theme | `npm run tokens:check`, `npm run tokens` |
| Hex, `rgb()` and raw `px` in core CSS outside `tokens.css` | Pattern count over `packages/core/css` |
| Hex in template part CSS rules; literal `--c-*`; raw `font-size` and `letter-spacing` | Pattern count over `packages/templates/<t>/parts` |
| Template contrast | `npm run check:template-contrast` |

</details>

<details><summary><strong>D6 Component discipline</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Templates fork or restyle core |
| 2 | Core changes are generic and templates never select core, but some templates rebuild widgets core has, or core changes go unrecorded |
| 3 | 0 product-specific core changes, 0 rebuilt widgets, 0 unrecorded or unswept core changes in the loop |
| 4 | Level 3, with a check that flags a rebuilt widget role or inline drawing |

| Indicator | Collected by |
| --- | --- |
| Core change groups judged generic or product-specific | This page's [core audit](#core-changes-judged) |
| Core restyles, descendant part selectors | `npm run check:parts`, `npm run check:generic`, and the pattern counts above |
| Hand-built widget roles; inline `<svg>` in part TSX | Pattern counts (LG7 would automate them) |
| Unrecorded or unswept core changes | `git diff` compared with [Templates and the library](templates-and-library.md); the sweep ledger |

</details>

<details><summary><strong>D7 Spacing</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | A scale exists; raw gaps are common |
| 2 | Roles and a probe exist; some screens fail it |
| 3 | `tools/spacing-probe.js` reports 0 findings on every replica screen in the last loop, at full width and at 320 px |
| 4 | Level 3 in the full release sweep across all templates |

| Indicator | Collected by |
| --- | --- |
| Spacing probe findings per screen | `tools/spacing-probe.js`, as reported in the tracker's Gate 3 |

</details>

<details><summary><strong>D8 Layout and reflow</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Fixed layouts |
| 2 | Layout rules exist; some screens overflow at 320 px |
| 3 | Layout and scroll probes clean; `scrollWidth` is 320 at 320 px on every route; no region geometry is hard-coded outside the layout |
| 4 | Level 3 in the full release sweep |

| Indicator | Collected by |
| --- | --- |
| Layout and scroll findings; routes with 320 px overflow | `tools/layout-probe.js`, `tools/scroll-probe.js` |
| Raw overflow outside ScrollArea | `npm run check:clipping` |

</details>

<details><summary><strong>D9 UI states</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Only the default state is shown |
| 2 | State components and a probe exist; state coverage per component is partial or unmeasured |
| 3 | Every interactive component's stories show each state that applies to it; the UI-states probe is clean on replicas |
| 4 | Level 3, with a generated coverage matrix that fails when a state is missing |

| Indicator | Collected by |
| --- | --- |
| Stories files showing disabled, loading, error and empty | Pattern count over `*.stories.tsx` |
| UI-states probe findings | `tools/ui-states-probe.js` |
| Per-component coverage of the states that apply | Coverage matrix (doesn't exist yet) |

</details>

<details><summary><strong>D10 Visual noise</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Rules written only |
| 2 | Noise probe clean, but a template is known to work around it |
| 3 | Noise probe clean, and no known workaround |
| 4 | Level 3, and the probe catches the known workarounds (fills painted by SVG, for example) |

| Indicator | Collected by |
| --- | --- |
| Noise probe findings (VN1–VN5) | `tools/noise-probe.js` |
| Known workarounds | This page's audit (LG6) |

</details>

<details><summary><strong>D11 UI copy</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Rules exist in the ui-copy skill; nothing checks the words |
| 2 | Evaluators review copy per loop |
| 3 | A check enforces the glossary, sentence case, button verbs and the error pattern on stories and template content |
| 4 | Level 3 across all templates |

| Indicator | Collected by |
| --- | --- |
| Automated copy check exists | `package.json` scripts (none today) |
| Copy rows in the replica trackers | Trackers (none today) |

</details>

<details><summary><strong>D12 Performance and perceived performance</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Budgets proposed, none measured |
| 2 | One command measures a baseline (bundle, LCP, INP) for the library and the templates |
| 3 | A committed baseline, budgets met, and a regression check that accounts for noise |
| 4 | Level 3, plus field metrics |

| Indicator | Collected by |
| --- | --- |
| Benchmark command and committed baseline | `package.json` scripts (none today) |
| Bundle size and LCP per template route | Benchmark (none today) |

</details>

<details><summary><strong>D13 Accessibility</strong></summary>

| Level | Looks like |
| --- | --- |
| 1 | Some semantics |
| 2 | Contrast checked and APG keyboard behaviour on components, but no automated audit across templates and schemes |
| 3 | An automated audit (axe) reports 0 serious findings on every template route in light, dark and more-contrast, with keyboard paths verified |
| 4 | Level 3, plus screen-reader passes with real users |

| Indicator | Collected by |
| --- | --- |
| Template contrast in every scheme | `npm run check:template-contrast` |
| Automated audit findings | axe run in the sweep (none today) |
| Hand-built widgets that miss keyboard behaviour | Pattern counts (LG4, LG5) |

</details>

### What each dimension verifies in the contract (Q152.3)

The scorecard checks whether the library still works the way [the contract](how-it-works.md) says. Each dimension's indicators verify these invariants. Indicators marked *added* were added in Q152.3 to cover invariants no indicator measured before; they're collected from the next run (L1).

| Dimension | Invariants verified | Indicators added in Q152.3 |
| --- | --- | --- |
| D1 People | V4, P1, S1 | — |
| D2 Agents | V4, S5, R8, G5, G6 | *added:* `npm run check` exit code on the scored commits (G6); misses the two-strike rule should have turned into checks (G5) |
| D3 Customization | S5, T3, K9, P3, P4 | — |
| D4 Versatility | G2, G3, P1, P2 | *added:* combined-sweep result after each serial integration (G3) |
| D5 Tokens | K1, K2, K3, K4, K6, K7, K8, K9, P3 | *added:* primitive reads in core CSS and templates (`check:project` rule `primitive`, K3) |
| D6 Components | T1, T2, T3, S1–S7, V1, P2, P4, P5, G1, G4, R8 | *added:* upward imports between tiers (grep, T1); deep imports from templates into core (grep, T2); evaluator licence audit result (P5); `probes:check` (R9) |
| D7 Spacing | L1 | — |
| D8 Layout | L2, R1, R2, R6 | — |
| D9 UI states | L3, R3, Q2 | — |
| D10 Visual noise | L4, L5, R4, R5 | — |
| D11 UI copy | V3 | — |
| D12 Performance | Q1, Q2 | — |
| D13 Accessibility | A1–A5, K7, C1, R7 | — |

**Not verified by any indicator:** K5 (spectrum and set colours used only for their declared purpose) and C2 (built-in presets read-only). Neither has a check or a countable signal yet. They stay listed here until one exists.

### Run independently, compared with the last run

- **Who runs it:** an evaluator who built none of the loop being scored (protocol step [P10](pressure-test-loop.md#0-the-protocol-what-agents-do-in-order)). The builder's notes are inputs to check, never evidence.
- **Compared with the last run:** each run adds a [history](#history) row and a per-dimension change (↑, ↓, =). The routed findings of the previous run are each verified first: closed with evidence, or carried forward with their age in loops.
- **"Better" means:** the reported score rose, or a dimension rose with none falling, or the routed findings closed. A rise from scoring an n/m indicator for the first time is noted as coverage, not improvement.

## Baseline score (Q151.3)

**Loop L0, scored 2026-11-12 by Worker 101** (who built neither replica). Scored on Slack signed off at `dl-brand-map` `5fc801a`, and Word near sign-off at `dl-word` `0fb6a25` plus its working copy.

| # | Dimension | Weight | Score | Evidence | n/m indicators |
| --- | --- | --- | --- | --- | --- |
| D1 | People | 8 | **2** | 121 stories files for 119 components (51 fundamentals, 59 compounds, 9 layouts); a consumer guide with steps; 3 consumer requests (LR1–LR3) accepted and not shipped ([log](pressure-test-loop.md#library-request-log)) | Minutes for a newcomer |
| D2 | Agents | 10 | **2** | Agent index with 119 component entries; 87 rows in "Rules agents miss"; `check:names` and `agent:index:check` in `npm run check`. Agents reached sign-off on Slack (45/45 regions). Word passed every check while hand-building a popup and a table and hiding fills from the noise probe (LG4–LG6) | Cold-agent trial |
| D3 | Customization | 12 | **2** | Every template's colours, fonts and sizes come through the theme. Core still needed 36 change groups across Slack and Word. Part CSS: Slack 2,151 lines for 11 screens, Word 1,272 for 13; 47 literal `--c-*` settings (LG3) | — |
| D4 | Versatility | 10 | **3** | 11 templates. Slack replica 11/11 screens and 45/45 regions; Word 9/13 screens and 23/30 regions. Sweeps: 920 screens, 0 failed, on both branches ([Slack](slack-replica.md#7-sign-off), [Word](word-replica.md#7-sign-off)) | — |
| D5 | Tokens | 10 | **2** | Core: 0 hex outside `tokens.css`, 1 raw `px` line, `tokens:check` passes. Templates: 0 hex in rules, but 47 literal component settings and 6 raw type values (LG3); the weaker layer counts | — |
| D6 | Components | 12 | **2** | 0 of 36 core change groups product-specific; 0 core restyles; every part selector a child path. Word rebuilds a popup and a table and has 20 inline SVGs; 3 process defects (LG4–LG7, LG9, LG10) | — |
| D7 | Spacing | 6 | **3** | Spacing probe 0 findings: Slack 56 runs over 14 routes × 4 viewports; Word 12 screens plus 320 px ([trackers](slack-replica.md#7-sign-off)) | Release-wide sweep over all templates |
| D8 | Layout | 6 | **3** | Slack `scrollWidth` is 320 on all 14 routes; Word: 0 layout findings at 320 px; core has one raw scroll (`carousel.css` `overflow-x: auto`), allow-listed by `check:clipping` | Release-wide sweep |
| D9 | UI states | 6 | **2** | `tools/ui-states-probe.js` exists. Of 121 stories files: 24 show disabled, 25 loading, 26 error, 18 empty. Replica trackers score static screens, not states | Coverage of the states that apply |
| D10 | Visual noise | 5 | **2** | Noise probe 0 findings on both replicas, but Word keeps regions transparent and paints them with an SVG "so enclosure depth stays 0" (LG6), a known workaround | — |
| D11 | UI copy | 4 | **1** | No copy check among the 16 steps of `npm run check`; no copy rows in either tracker | Copy review scores |
| D12 | Performance | 5 | **1** | No benchmark command or baseline; budgets are proposals only (AGENTS.md: "not measured") | Bundle size, LCP, INP |
| D13 | Accessibility | 6 | **2** | `check:template-contrast` in `npm run check`; APG keyboard on core widgets; icons in `currentColor` for forced colours. Two Word widgets lack Escape and focus return (LG4) | Automated audit; screen reader |

**Overall:** weighted mean **2.13 / 4** (213 of 400 weighted points); 100% of the weight has at least one measured indicator. **Reported score: 2.00 (capped)**, held down by **D11 UI copy (1)** and **D12 Performance (1)**.

### Weakest dimensions

1. **D11 UI copy and D12 Performance (1 each):** rules only, with nothing that checks or measures them. Each one alone caps the overall score.
2. **D3 Customization and D6 Component discipline (2, weight 12 each):** the largest weight not yet scored. Replicas still need large part CSS, literal component settings and some rebuilt widgets.
3. **D2 Agents (2, weight 10):** agents pass every check while breaking the boundary, so the checks, not the agents, are the gap.

### Top improvements, ranked

Ranked by weighted points gained per unit of effort, and by whether an improvement lifts the cap.

| Rank | Improvement | Lifts | Size |
| --- | --- | --- | --- |
| 1 | `check:copy`: glossary terms, sentence case, button verbs and error pattern over stories and template `content/*.json` | D11 1→2 or 3, and removes one cap | M |
| 2 | One benchmark command (bundle size per entry, LCP and INP on the library and each template route) with a committed baseline | D12 1→2 or 3, and removes the other cap | M |
| 3 | LG3: component-token overrides in template token data, plus a `check:parts` rule against literal `--c-*` and raw type | D3, D5 2→3 | M |
| 4 | LG4–LG7: Word onto Popover and DataTable, backdrop removed; inline `<svg>` and widget roles flagged in parts; the noise probe catches painted fills | D6, D10, D13 2→3, and D2 through the new checks | M |
| 5 | A per-component state coverage matrix generated from stories, failing when an applicable state is missing | D9 2→3 | M |
| 6 | An axe run in the regression sweep, in every scheme | D13 2→3 | M |
| 7 | A cold-agent trial and a timed newcomer session on one reference screen | Measures D1 and D2 (n/m today) | S each |

If ranks 1 and 2 reach level 2, the cap lifts and the overall score is about 2.22. If ranks 1–4 reach level 3, it's about 2.86.

## Loop L1 score

**Scored 2026-11-12, 21:00–21:55, by Worker 111**, who built none of this loop (Q151, Q152, protocol P10). Scored on `integrate/word-into-brand-map` at `afcaba8` (Slack and Word signed off, IKEA, core packets C1–C3), read-only in `dl-integrate`. Every build, sweep and planted violation ran in two throwaway worktrees of `afcaba8`, removed afterwards; the only servers were short-lived ones inside the runs (Q153). **YouTube is scored only from [its tracker](youtube-replica.md#4-sign-off)**, since it's still on its own branch. Strict design mode: no unit, end-to-end or benchmark runs.

> **The short answer.** **2.32 weighted (232 of 400), reported as 2.00 capped by D12 performance** (L0: 2.13, also capped). All 10 L0 findings marked shipped hold: each check fails its planted violation. Customization, tokens and visual noise each rose a level, and UI copy left the floor. Two dimensions fell, because L1 measured them directly instead of taking the trackers' word: Word's `comments` screen overflows at 320 px, and Word and IKEA fail spacing rows. The planted violations also found holes in gates the contract calls complete. The worst: a core-component selector written with double quotes, `[data-dl="button"]`, passes every check.

### How L1 was measured

| Indicator | Command, as run | Result at `afcaba8` |
| --- | --- | --- |
| G6 static gate | `npm run check` (all 18 steps) | **Exit 0** on a checkout with LF line endings. **Exit 1** on a fresh Windows worktree with Git's default `core.autocrlf=true`: `tokens:check` reports 10 template `tokens.css` / `theme.css` files stale from CRLF alone (F23) |
| Type check, build | `npm run typecheck`, `npm run build -w apps/library` | Exit 0, exit 0 |
| G2, G3 combined sweep | `npm run regression:freeze` at `eed781d`, then `npm run check:regression -- --axe` at `afcaba8` | **1044 screens, 1033 identical, 11 declared noise, 0 inventory, 0 different** (`harbour--home` dark differed 0.0042% only under parallel load). Reproduces Worker 109's result independently |
| A2, A5 axe | Same sweep, `--axe` | 1044 screens audited, 186 clean. **Serious:** `color-contrast` 48 screens (Slack 25, library 16, design 4, Word 3), `label-content-name-mismatch` 16 (design 10, library 6), `scrollable-region-focusable` 4 (`lib--listdetail`, `lib--rail`). Moderate: `region` 666, `landmark-unique` 396, `page-has-heading-one` 172, `heading-order` 22, `landmark-main-is-top-level` 10, `landmark-no-duplicate-main` 10. Minor: `aria-allowed-role` 4 |
| L1, L2, L3, L4, R2, C1 probes | `spacing`, `layout`, `scroll`, `noise`, `clipping`, `context` and `ui-states` probes from `tools/`, on every layout of Slack (14), Word (16), IKEA (7) and YouTube (1) at 1280 × 900 and 320 × 900, light and dark: 152 runs | **Slack:** 0 spacing, layout, scroll, clipping, context or state findings, `scrollWidth` 320 on all 14 layouts. **Word:** `comments` at 320 px overflows (`scrollWidth` 341, LY1 27, LY7 1); `navigation` at 320 px fails LY8; both fail SC2 and SC6 at both widths and SC7 at 320 px. **IKEA:** spacing fails on 5 of 7 layouts (SC1, SC2, SC3, SC5, SC16), and LY4 and LY6 on `home` and `product`. **YouTube** (not signed off, 320 px not yet in its scope): overflows at 320 px (350), CL1, CL3. VN1, VN3 and VN5 fail on nearly every replica screen; the trackers accept these against the reference (F29) |
| G4 core record | `npm run check:core-log -- --base <commit> --doc docs/templates-and-library.md` | Since `eed781d`: 4 files, **0 unrecorded**. Since L0's Slack commit `5fc801a`: 26 files, **6 flagged**, of which a reading finds at most 2 truly unrecorded (F27). Since main `cd4c6f8`: 79 files and 177 tokens, 175 flagged (history before the request log) |
| K9, S4, R7, R8 template counts | Pattern counts over `packages/templates/*/parts` | Literal or `var()` `--c-*` settings **0** in every template (L0: 47). Raw `font-size`, `letter-spacing`, `line-height` **0** (L0: 6). Widget roles **0** (L0: 2). Inline `<svg>` **2**, Word's two commented rulers (L0: 20). `as IconName` **0** (L0: 39). `!important` 0, raw overflow 0, `<button>`, `<input>`, `<table>`, `<select>` 0. Hex in rules: IKEA 2, both `#000` stops in a mask gradient. Raw `rem`: Slack 96, Word 50 (plus 4 `px`), IKEA 5, YouTube 2, conference 1. `check:project` warnings: `raw-markup` 16 (IKEA 12, YouTube 3, conference 1), `raw-size` 4 files |
| D3 size | Line counts; `theme.json` keys | Part CSS / TSX lines: Slack 2,041 / 1,873 (L0 2,151 / 1,871); Word 1,233 / 872 (L0 1,272 / 950); IKEA 724 / 731; YouTube 83 / 164. `theme.json` settings: Slack 262 (52 `$parts`), Word 235 (37), IKEA 90 (3), YouTube 46, design 51 |
| D3, D6 core change | `git diff -w --ignore-cr-at-eol --shortstat` over `packages/core` (not `agent/`) | `5fc801a..afcaba8`: 35 files, +597 −69. C1–C3 (`eed781d..afcaba8`): 6 files, +129 −9, all tooling (`check-project.mjs`, `template-tokens.mjs`, `noise-probe.js`), `defineIconPack` in `icons.ts`, `components.ts`, `AGENTS.md`. `--c-*` lines in `tokens.css`: 2,572 (L0 Slack 2,542) |
| T1, T2 | Grep for imports | Fundamentals importing compounds or layouts **0**; compounds importing layouts **0**; template imports reaching into core by a relative path or a deep path **0** |
| V4, D1, D2 | `npm run agent:index:check`, `npm run check:names`, counts | Index current: 133 components, 29 block types, 12 templates, 322 semantic tokens, 176 icons. `check:names`: 11 guides, every name exists. 121 stories files for 119 components (51, 59, 9); 9 guide files. Rows under "Rules agents miss": 29 (27 at `5fc801a`; L0's figure of 87 can't be reproduced, F30). Request log: LR2 and LR3 `accepted`, not shipped |
| L3 states | `npm run check:states` | Current: 44 of 59 applicable states shown (disabled 20/26, loading 8/11, error 14/20, empty 2/2) |
| V3 copy | `npm run check:copy` | 0 errors; 94 warnings (CP5 61, CP2 15, CP4 13, CP1 3, CP3 1, CP6 1); 29 findings held in `tools/copy-baseline.json` |
| R9, G1, K7 | `probes:check`, `check:generic`, `check:template-contrast` | Pass (part of `npm run check`) |

Evidence files (outside the repository, in the evaluator's session folder): `check.log`, `plants.log`, `probes.json`, `probes-summary.txt`, `sweep.log`, `axe.json`, `result.json`, `counts.json`.

### L1 scores

| # | Dimension | Weight | L0 | L1 | Change | Evidence | n/m |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | People | 8 | 2 | **2** | = | 121 stories files for 119 components; consumer guide with steps; LR2 and LR3 still accepted and not shipped. A fresh Windows clone fails `npm run check` (F23), which a newcomer meets first | Newcomer timing |
| D2 | Agents | 10 | 2 | **2** | = | Index current (133); `check:names` passes; every L0 miss (LG3–LG8) now fails a check (planted). But a gated invariant is bypassable by ordinary syntax: a double-quoted core selector passes the whole of `npm run check` (F19), and five more plants get through (F20–F22). G6 fails on a default Windows clone (F23) | Cold-agent trial |
| D3 | Customization | 12 | 2 | **3** | ↑ | 0 literal `--c-*` settings and 0 raw type in any template's parts; 178 settings live in `theme.json` `$parts`. C1–C3 added mechanisms only (checks, a probe row, `defineIconPack`); YouTube needed no core change ([tracker SR14](youtube-replica.md#2-scores)). Part CSS is still large (Slack 2,041 lines) but holds arrangement and measured geometry | — |
| D4 | Versatility | 10 | 3 | **3** | = | 12 templates; Slack and Word signed off; combined sweep 1044 screens, 0 different, run independently. Not 4: YouTube isn't signed off (9 open fails), and no outside consumer is measured at parity | Outside-consumer parity |
| D5 | Tokens | 10 | 2 | **3** | ↑ | Core: 0 hex or `rgb()` outside `tokens.css`, `tokens:check` passes. Templates: 0 literal component settings, 0 raw type; the only hex is IKEA's mask stops. Planted core-token and type literals fail. Not 4: a planted hex or `rgb()` colour in part CSS passes every check (F20) | — |
| D6 | Components | 12 | 2 | **2** | = | 0 product-specific core changes; widget roles 0; inline SVG 2, with reasons; casts 0; T1 and T2 hold; `probes:check` and `check:generic` pass. Still level 2: 16 raw elements rebuild core Link, Image and Heading (IKEA 12, YouTube 3, conference 1) and `raw-markup` only warns (F28); `check:core-log` can't tell recorded from unrecorded for shared files (F27) | Licence audit (P5) |
| D7 | Spacing | 6 | 3 | **2** | ↓ | Measured directly in L1, where L0 took the trackers' figures. Slack 0 findings at both widths. Word `navigation` and `comments` fail SC2 and SC6 at 1280 and 320, plus SC7 at 320; IKEA fails on 5 of 7 layouts (F24, F25) | Release-wide sweep |
| D8 | Layout | 6 | 3 | **2** | ↓ | Word `comments` at 320 px: `scrollWidth` 341, LY1 27; `navigation`: LY8. IKEA LY4 and LY6. `check:clipping` passes. L0's "0 layout findings at 320 px" for Word didn't include these two side-pane layouts (F24) | Release-wide sweep |
| D9 | UI states | 6 | 2 | **2** | = | The matrix now exists and gates (planted removal fails): 44 of 59 applicable states shown, so level 3 isn't met. 0 UI-states probe findings on the 152 replica runs. Measuring coverage for the first time counts as coverage, not improvement | — |
| D10 | Visual noise | 5 | 2 | **3** | ↑ | LG6's painted backdrop is gone and VN7 catches a planted one. Under the replica rule, VN1, VN3 and VN5 are judged against the reference, as in L0, with no known workaround in any template. Not 4: two evasions pass VN7 (F22), and the reference exceptions aren't recorded where the probe can read them (F29) | — |
| D11 | UI copy | 4 | 1 | **2** | ↑ | `check:copy` is in `npm run check`; a planted "Click here… Field Notes..." fails CP1 and CP3. Not 3: sentence case and action length only warn, there's no glossary rule, 29 findings are held as debt, and replicas warn on CP1–CP2 | Copy rows in trackers |
| D12 | Performance | 5 | 1 | **1** | = | No benchmark or baseline; F12 deferred to production-ready mode (strict design forbids benchmarks) | Bundle size, LCP, INP |
| D13 | Accessibility | 6 | 2 | **2** | = | Contrast gates pass; axe now runs on every screen in light and dark (measured for the first time). Not 3: serious findings on 68 screen runs (F26); keyboard paths unverified; no target-size check | Screen reader; target size |

**Overall:** weighted mean **2.32 / 4** (232 of 400; L0 213). 100% of the weight has at least one measured indicator. **Reported score: 2.00 (capped)**, held down by **D12 Performance (1)**. D11 has left the floor, so the cap now rests on D12 alone. Without it, the reported score would be 2.32.

**Better or not (the "better" rule):** better. Four dimensions rose (D3, D5, D10, D11) and L0's routed findings closed. Two fell (D7, D8), but both falls come from measuring directly what L0 took from the trackers, not from a regression; the sweep shows 0 pixels changed. The reported score is unchanged because the cap holds.

### L0 findings, verified

Each finding marked shipped was checked at `afcaba8` with its own check and, where the routing asks for one, a planted violation (reverted after each run).

| # | Verified? | How |
| --- | --- | --- |
| F1 | **Verified** | 0 `--c-*` settings in any template's part CSS. Planted `--c-popup-width: 10rem` and `--c-popup-width: var(--t-…)` in Slack's `workspace.css`: `check:project` error `core-token`, exit 1 |
| F2, F3 | Verified (counts) | 0 widget roles in Word's parts; planted `role="dialog"` on a `div`: error `widget-role`, exit 1 |
| F4 | **Verified, with a gap** | A planted, stretched, `aria-hidden` SVG backdrop over a transparent layout: VN7 fails and its 3 fills count toward VN5; without it, VN7 passes. Word has no backdrop. Gap: the same backdrop marked `role="img"`, or bands painted by a `background-image` gradient, pass VN7 (F22) |
| F5 | **Verified** | Planted `<svg>` in Word's `Window.tsx`: error `inline-svg`, exit 1. Word's 2 remaining inline SVGs carry `inline-svg:` reasons |
| F6 | **Verified** | 0 `as IconName` in every template; a planted cast: error `icon-cast`, exit 1 |
| F7 | Verified | The sweep includes `lib--ribbon`, 0 different |
| F8 | **Verified, with a gap** | A planted unrecorded core file (`Planted.tsx`): `check:core-log` exit 1; clean since `eed781d`: exit 0. Gap: it isn't in `npm run check` and needs a base, and its file-to-name mapping flags shared files that can't be named (F27) |
| F9 | **Verified** | `npm run check:project` exits 1 on a planted literal `--c-*`, on `font-size: 0.7rem` and on `font: 700 0.7rem/1 sans-serif`. `raw-markup` still warns (F28) |
| F10 | Not verified, still open | Main's `package.json` (`cd4c6f8`) has no `check:regression`; it lands when the integration branch merges |
| F11 | **Verified** | "Click here to see Field Notes..." planted in blog content: CP1 and CP3 errors, exit 1 |
| F12 | Deferred (unchanged) | No benchmark; out of scope in strict design |
| F13 | **Verified** | Matrix current (44 of 59); removing AlignmentPicker's disabled story: "stories no longer show AlignmentPicker disabled", exit 1 |
| F14 | **Verified** (axe); target size open | The independent sweep reproduces 1044 audited and 186 clean, and adds rules C3's summary didn't list: `scrollable-region-focusable` (serious, 4) and the `landmark-*-main` rules. Results routed as F26 |
| F15 | Open (unchanged) | No newcomer or cold-agent trial run; D1 and D2 stay n/m on it |
| F16 | **Verified** | 0 raw type values in every template's parts; the planted `font-size` and `font` shorthand fail |
| F17 | Declined (unchanged) | — |

### What made scoring hard (framework notes)

1. **Indicators without exact commands don't reproduce.** L0's "87 Rules agents miss rows" and "1 raw `px` line in core" can't be recreated. The rows under that heading number 27 at L0's commit, and core has 10 non-zero `px` lines, mostly visually-hidden 1 px boxes, grid rounding and scrollbar arrows (F30).
2. **Trackers aren't evidence, but L0 scored D7 and D8 from them.** Measuring directly on every layout, rather than on the touched screens, moved two dimensions down. The scorecard should require the evaluator's own probe run on every signed-off layout.
3. **The replica exception for noise lives in prose.** The raw probe fails VN3 on every replica screen, and only the trackers say which of those are the reference's own enclosures (F29).
4. **A fresh Windows checkout fails the gate** until line endings are normalized (F23). Builds and sweeps outside the builder's worktree need the ignored upstream checkouts and correct workspace links, or `@design-library/*` silently resolves into another worktree.
5. **G6 and G2 are procedure gates.** `check:core-log` and the sweep live outside `npm run check`, so "`npm run check` exit 0" doesn't cover them.

## Loop L2 score

**Scored 2026-11-13, 11:30–12:30, by Worker 127**, who built none of this loop. Scored on `dl-integrate` at `9f8749a` (Slack, Word, IKEA and YouTube; the L1 fixes `51c33a2`, `cde91e6` and `f2ca211`; the dark-scheme bundler fix `454ebad`; YouTube's core gaps G1–G3), served on the shared app at `http://127.0.0.1:8770/`. Read-only: plants ran in a throwaway worktree, removed afterwards; no server was started or stopped. Strict design mode: no unit, end-to-end or benchmark runs. **New in L2, after the YouTube lesson ([Q156–Q159](youtube-replica.md#where-the-youtube-time-went-q159)):** a headless click-through of every layout, scored as what an agent can build *and make work*, not only what it can make look right.

> **The short answer.** **2.32 weighted (232 of 400), reported as 2.00, still capped by D12 performance** (L1: 2.32, also capped). Token discipline reached 4: every planted literal now fails. Versatility fell to 2: clicked, about half the controls in Slack and Word do nothing, so only YouTube meets today's sign-off rule (Q158). The L1 check holes F19–F23 and F27 are closed; Word's side panes are clean. Still open: IKEA's spacing, `raw-markup` as a warning, and two core files that L1b changed without a record.

### How L2 was measured

| Indicator | Command, as run | Result at `9f8749a` |
| --- | --- | --- |
| G6 static gate | `npm run check` (all 18 steps) in `dl-integrate` | **Exit 0** in 30 s. `check:project`: 0 errors, 17 warnings (`raw-markup` 12: IKEA 11, conference 1; `raw-size` 3; `clip` 2). 3 breakpoint warnings, all YouTube's measured change points |
| F19–F21, F28 plants | Throwaway `git -c core.autocrlf=false worktree add` of `9f8749a`, then `check-project.mjs --strict` per plant, each reverted | `[data-dl="button"]` in Slack's `workspace.css`: exit 1. `color: #ff0000`: exit 1. In YouTube's `Site.tsx`: `role={'dialog'}`, `aria-modal`, `style={{ fontSize: 12 }}` and `createElement('svg')` each exit 1. A raw `<a>`: **exit 0** (warning only, F28). The same plants in a `*.stories.tsx` under `parts/` pass, as stories aren't part code |
| F23 | `.gitattributes` | `* text=auto eol=lf`, present |
| G4 core record | `npm run check:core-log -- --base <b> --doc ../design-library/docs/templates-and-library.md` | Base `5fc801a`: 40 files, 32 tokens, **2 unrecorded**. Base `afcaba8`: 33 files, **2 unrecorded**, both the same: `AllocationSlider.tsx` and `GradientEditor.tsx` (L1b's `aria-disabled`, F31) |
| D3, D6 core change | `git diff -w --ignore-cr-at-eol --stat afcaba8 9f8749a -- packages/core ':!packages/core/agent'` | 40 files, +634 −56. Besides L1a/L1b tooling and `ScrollArea` keyboard reach, YouTube added about 12 generic seams with unchanged defaults: `params`/`splitRoute` (G1), MenuButton `avatar`, `chevron`, `iconEnd` (G2), `c.heading.hyphens` (G3), Link `plain`, Badge `outline`, TextField `underline`, Switch `thumbIcon` and `on-fill` tokens, ChipGroup `wrap={false}`, Button `iconEnd`, `c.chip.edge-width`, `--material-media-control`. L1's "YouTube needed no core change" was read from its tracker before these landed |
| D3 size | Line counts over `parts/` (stories excluded); `$parts` entries | Part CSS / TSX: Slack 2,010 / 1,793; Word 1,216 / 827; IKEA 623 / 425; YouTube 200 / 431. `$parts`: Slack 52, Word 37, YouTube 6, IKEA 3. Lines with a raw `rem`: Slack 93, Word 50, IKEA 5, YouTube 4 |
| L1, L2 probes | `tools/spacing-probe.js` and `tools/layout-probe.js` injected headless on 8770: Word (`navigation`, `comments`, `document`, `home`), IKEA (all 7), YouTube (all 3), Slack (`channel`, `thread`, `search`), at 1280 × 900 and 320 × 900, light and dark: 68 runs | **`scrollWidth` equals the window on all 68** (L1: Word `comments` 341, YouTube 350). Word and Slack: 0 findings. **IKEA:** spacing still fails on 5 of 7 (`home` SC1, SC2, SC3, SC5, SC16; `products`, `room`, `product`, `bag`), LY6 on `home` and `product`, LY4 on `home` at 320. **YouTube:** `search` SC1 11 and SC3, `watch` SC2, SC3 and SC7 at 320; LY4 on `home` and `search`. Same in both schemes |
| Click-through (new) | Headless Playwright from `dl-integrate`'s `playwright-core`, own process, no OS input: each layout at 1280 × 900; every link opened; the first 25 visible buttons, tabs, switches and checkboxes clicked, and a click counted dead when it changed no DOM node, no address and no focus into a field | **Slack** (14 layouts): 0 page errors, 0 broken pictures, 0 "no template layout", 10 links all resolve; **147 of 299 clicks dead (49%)**: window chrome, but also the rail's Home, DMs, Threads, Saved, Agents & tools, Switch theme and Write message on every layout. **Word** (16 layouts): 0 errors, 0 broken pictures, no links; **168 of 355 dead (47%)**: window chrome, Customise Quick Access Toolbar, Save, and Backstage's Save As, Print, Share and Export. **IKEA and YouTube: n/m** (the bounded run stalled and was stopped); YouTube's own click-through passed at `4201072` ([tracker](youtube-replica.md#4-sign-off)), which is a tracker, not L2 evidence |
| V4, D1, D2 | Counts | Index 133 components; 121 stories files; 30 rows under "Rules agents miss" (L1 29). Request log: LR1 and LR3 `accepted`, LR2 `open` |
| L3 states, V3 copy | `npm run check:states`, `npm run check:copy` | 44 of 59 (unchanged). Copy 0 errors, 94 warnings (unchanged) |
| A2 axe | — | **n/m:** axe-core's MPL-2.0 dev dependency isn't approved, so the sweep's `--axe` wasn't run. L1's results aren't carried as L2 evidence |
| L4 noise | — | **n/m** in L2 (not re-run); F22's plants are the builder's (`51c33a2`), not re-planted |

Evidence files (outside the repository, in the evaluator's session folder): `click.mjs`, `click.log`, `probes.mjs`, `probes.json`, `probes.log`.

### L2 scores

| # | Dimension | Weight | L1 | L2 | Change | Evidence | n/m |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | People | 8 | 2 | **2** | = | 121 stories files; consumer guide; a fresh Windows clone now passes (F23). LR2 open, LR1 and LR3 accepted, not shipped | Newcomer timing |
| D2 | Agents | 10 | 2 | **2** | = | Every L1 plant now fails a check (F19–F21). But the biggest miss of the loop passes every check: Slack and Word were signed off with about half their controls dead, and nothing in `npm run check`, the sweep or the probes clicks anything (F32). L1b's own core change went unrecorded and `npm run check` didn't notice, since `check:core-log` is outside it (F31) | Cold-agent trial |
| D3 | Customization | 12 | 3 | **3** | = | 0 literal `--c-*` and 0 raw type in parts; values in `$parts`. YouTube needed about 12 core seams, each generic with its default unchanged and recorded (G1–G3 among them), so level 3's "core changes only for truly new mechanics" holds narrowly: G3 (`hyphens`) and the look variants were missing seams, not new mechanics. Not 4 | — |
| D4 | Versatility | 10 | 3 | **2** | ↓ | 12 templates; the batch sweep at `9f8749a`: 1044 screens, 17 different, all explained ([refreeze log](pressure-test-loop.md)). But under the sign-off rule that now applies (Q158: links, pictures, menus and controls work), only YouTube is signed off by a click-through; Slack and Word leave 49% and 47% of clicked controls dead, and IKEA's wasn't measured. Level 3 needs two unrelated products at sign-off | Outside-consumer parity; IKEA and YouTube click rates |
| D5 | Tokens | 10 | 3 | **4** | ↑ | Level 3 holds (0 literal colours, type or component settings in core or any template's parts; raw sizes are measured replica geometry), and now every literal kind fails a planted check: hex in part CSS, literal `--c-*`, raw type, and type and colour literals in a part's `style` prop (F20, F21 verified) | — |
| D6 | Components | 12 | 2 | **2** | = | T1, T2, `check:generic`, widget roles and inline SVG gated (plants fail). Still 2: `raw-markup` only warns, with 12 raw `<a>`, `<img>` and `<h2>` rebuilding Link, Image and Heading (IKEA 11, conference 1; YouTube's 3 gone) (F28); 2 core files changed without a record (F31) | Licence audit (P5) |
| D7 | Spacing | 6 | 2 | **2** | = | Word 0 at both widths (F24 closed); Slack 0. IKEA still fails 5 of 7 layouts (F25); YouTube fails SC1, SC2, SC3 and SC7 on `search` and `watch` (F33) | All layouts of Slack and Word |
| D8 | Layout | 6 | 2 | **2** | = | `scrollWidth` equals the window on all 68 runs (Word and YouTube overflow fixed). LY4 on YouTube `home` and `search`, LY4 and LY6 on IKEA (F25, F33) | All layouts of Slack and Word |
| D9 | UI states | 6 | 2 | **2** | = | 44 of 59 applicable states (unchanged); YouTube's state rows were dropped by Q158 | UI-states probe |
| D10 | Visual noise | 5 | 3 | **3** | = | No known workaround in any template; F22's probe change shipped; F29 open. Probe not re-run in L2, so carried on L1's measurement plus F22's commit | Noise probe (L2) |
| D11 | UI copy | 4 | 2 | **2** | = | `check:copy` 0 errors, 94 warnings, 29 held as debt (unchanged) | Copy rows in trackers |
| D12 | Performance | 5 | 1 | **1** | = | No benchmark or baseline (F12 deferred) | Bundle size, LCP, INP |
| D13 | Accessibility | 6 | 2 | **2** | = | `check:template-contrast` passes; L1b gave `ScrollArea` keyboard reach for unlabelled overflowing regions and `aria-disabled` on Chip, Slider, AllocationSlider and GradientEditor. Not 3: no automated audit could run | axe (dependency not approved); target size; screen reader |

**Overall:** weighted mean **2.32 / 4** (232 of 400; L1 232). 100% of the weight has a measured indicator, although D10's is carried. **Reported score: 2.00 (capped)**, held down by **D12 Performance (1)**. Without the cap, 2.32.

**Better or not:** mixed. D5 rose and six L1 findings closed with planted evidence; D4 fell because L2 measured whether the replicas work, which no earlier loop did. The fall is a change in what's measured, not a regression in code: the controls were dead at L1 too.

### L1 findings, verified

| # | Verified? | How |
| --- | --- | --- |
| F19 | **Closed** | Planted `[data-dl="button"]` in Slack's part CSS: exit 1 |
| F20 | **Closed** | Planted `color: #ff0000`: exit 1; IKEA passes |
| F21 | **Closed** | `role={'dialog'}`, `aria-modal`, `style={{ fontSize: 12 }}`, `createElement('svg')` in a part: each exit 1 |
| F22 | Shipped, not re-verified | The builder's plants in `51c33a2`; L2 didn't re-plant |
| F23 | **Closed** | `.gitattributes` `eol=lf`; `npm run check` exit 0 |
| F24 | **Closed** | Word `navigation` and `comments`: 0 spacing and layout findings, `scrollWidth` 320, both schemes |
| F25 | Still open | IKEA as above |
| F26 | Partly shipped, not re-verified | `ScrollArea` focusability shipped (`f2ca211`); axe n/m, so contrast and names are unverified |
| F27 | **Closed** | `check:core-log --base 5fc801a` flags only files truly missing from the record (F31) |
| F28 | Still open | A planted raw `<a>` exits 0; 12 warnings |
| F29 | Still open | No exceptions file |
| F30 | Still open | L2 numbers come from the commands in the table above, not one script |
| F10, F12, F14 target size, F15 | Still open (carried) | Unchanged |

## Loop L3 score

**Scored 2026-11-13, 16:01–17:00, by Worker 132**, who built none of this loop. Scored on the frozen build of `a80c7c0` (`dl-integrate\.shots\base-dist`, `BASE.json` head `a80c7c0`, `dirtyFiles: 0`): Slack, Word and YouTube Q156 click-through work merged (`c26d341`), core G4 (`Ribbon collapsed`), G5 (`WindowControls`) and S1 (`inputRef`), and Q160. Served read-only by a few-line Node static server on a short-lived port 8791, stopped afterwards (8770 and 8765 untouched). Static checks ran on a scratch clone of `a80c7c0` in the evaluator's session folder (upstreams and `node_modules` linked, `@design-library/*` pointing at the clone); nothing was written in `dl-integrate`. Strict design: no unit, end-to-end, benchmark or regression run. axe stays **n/m** (axe-core's MPL-2.0 licence approval is pending with the owner).

> **The short answer.** **2.42 weighted (242 of 400), reported as 2.00, still capped by D12 performance** (L2: 2.32). Click-through comes first, and it mostly holds: Word 0 dead of 1,193 clicks, YouTube 0 of 125, Slack 3 of 1,003 (three links that point at the page they're on). IKEA, outside this batch, has 54 dead of 351 (15%). That lifts D4 back to 3. But "alive" includes the honest stub note: Word gives "isn't part of the replica yet" on 392 clicks over 209 distinct controls, about a third of what it shows, and nothing separates a working control from a stub (F37). Unchanged: IKEA and YouTube probe fails, `raw-markup` a warning, L1b's 2 unrecorded core files.

### How L3 was measured

| Indicator | Command, as run | Result at `a80c7c0` |
| --- | --- | --- |
| Click-through (Q156, first) | `dl-integrate\tools\click-probe.mjs` (copied read-only into the session folder, plus a counter for clicks whose only visible effect adds text matching "part of (the\|this) replica") with `--template <t> --origin http://127.0.0.1:8791`, every non-planned layout at 1280 × 900 | **Slack** (14 layouts): 1,003 clicked, **3 dead**, 154 skipped (93 on `vip-modal`, where the modal covers the window, correctly), 0 page errors, **150 note-only clicks**. Dead: on `channel`, the topic link `https://studiohangout.org/conduct` and two message links render as `<Link href="#/app/slack/channel">` on that same page (`Workspace.tsx` lines 733 and 2016), so the click changes nothing. **Word** (16): 1,193 clicked, **0 dead**, 103 disabled, 3 skipped, **392 note-only clicks over 209 distinct control names** (builders: 215; Home 29, Insert 43, Review 33, Draw 33). **YouTube** (3): 125 clicked, **0 dead**, **4 note-only** (Search with your voice ×3, Download). **IKEA** (7): 351 clicked, **54 dead (15%)**, 48 skipped (33 on `products`: tile links whose click times out), 0 note-only. IKEA's dead: header Favourites, Your account, EN and Offers on every layout; on `home`, 28 including the footer list (Careers, Contact us, Gift cards, Returns, Track your order…) |
| L1, L2, L4 probes | `spacing-probe.js`, `layout-probe.js`, `noise-probe.js` from the clone's `tools/`, headless on every layout of Slack (14), Word (16), IKEA (7) and YouTube (3) at 1280 × 900 and 320 × 900, light and dark (`colorScheme`): **160 runs**, 0 load errors | **`scrollWidth` equals the window on all 160.** Slack and Word: **0 spacing and 0 layout findings** on every layout (L2 measured 4 Word and 3 Slack layouts). IKEA (as L2): spacing fails on 5 of 7 (`home` SC1, SC2, SC3, SC5, SC16; `products`, `room`, `product`, `bag`), LY6 on `home` and `product`, LY4 on `home` at 320. YouTube (as L2): `search` SC1 11 and SC3, `watch` SC2, SC3 and SC7 at 320, LY4 on `home` and `search`. Noise (first run since L1): VN3 on every replica run (Slack 56/56, Word 64/64, IKEA 28/28, YouTube 12/12); VN5 on most; **VN7 on Slack 30 of 56**, every layout at 1280 (`slack-workspace.titlebar` and the workspace tile in the rail, "background-image gradient", 2 fills each): the plum gradient of the reference, now caught by F22's rule, with no exception recorded (F38) |
| G6 static gate | `npm run check` (18 steps) on the clone | **Exit 0.** `check:project` 0 errors, 17 warnings (`raw-markup` 12, `raw-size` 3, `clip` 2); 3 breakpoint warnings (YouTube); `check:template-contrast` 110 pairs, 0 below AA; `check:copy` 0 errors, 94 warnings; `check:states` 44 of 59 |
| Plants | Appended to Slack's `workspace.css` and an IKEA part TSX in the clone, `npm run check:project`, each reverted (`git status` clean) | `color: #ff0000`, `--c-popup-width: 10rem`, `[data-dl="button"]`, `font-size: 0.7rem`, `<div role="dialog">`: each **exit 1**. A raw `<a href>`: **exit 0** (F28) |
| G4 core record | `npm run check:core-log -- --base <b> --doc design-library/docs/templates-and-library.md` | Base `9f8749a`: 12 files, 3 tokens, **0 unrecorded**. Base `afcaba8`: **2 unrecorded**, still `AllocationSlider.tsx` and `GradientEditor.tsx` (F31) |
| D3, D6 core change | `git diff -w --ignore-cr-at-eol --stat 9f8749a a80c7c0 -- packages/core ':!packages/core/agent'` | 21 files, +263 −23: `Ribbon` `collapsed` (G4), new `WindowControls` compound with stories (G5), `TextArea`/`TextField` `inputRef` (S1), one icon, `check-project.mjs` toggle-justification (Q160). Each generic with defaults unchanged and recorded |
| D3 size | Line counts over `parts/` (stories excluded); `$parts` entries | Part CSS / TSX: Slack 2,062 / 2,306 (L2 2,010 / 1,793); Word 1,285 / 1,260 (1,216 / 827); IKEA 717 / 443; YouTube 213 / 463. `$parts`: 52, 37, 3, 6. Literal `--c-*` in part CSS 0; `as IconName` 0; inline `<svg>` 2 (Word's commented rulers) |
| V4, D1, D2 | Counts on the clone | Index 134 components (L2 133); 122 stories files; 30 rows under "Rules agents miss"; request log LR1–LR3 all `accepted`, none shipped |
| A2 axe | — | **n/m** (licence approval pending) |

Evidence files (outside the repository, in the evaluator's session folder `files/l3/`): `click-probe-notes.mjs`, `click-{slack,word,youtube,ikea}.log`, `click-{word,youtube,ikea}.json`, `click-slack-search.json`, `probes.mjs`, `probes.json`, `check.log`, `serve.mjs`. Slack's 13-layout JSON wasn't written: the run lost its server on `search` (an interrupted tool call), so those 13 come from the log and `search` was re-run alone.

### L3 scores

| # | Dimension | Weight | L2 | L3 | Change | Evidence | n/m |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | People | 8 | 2 | **2** | = | 122 stories files; consumer guide; LR1–LR3 accepted, none shipped | Newcomer timing |
| D2 | Agents | 10 | 2 | **2** | = | Every planted literal and widget role fails. Still 2: a click probe exists but no gate runs it, so IKEA's 54 and Slack's 3 dead controls pass `npm run check` (F32); a stub note counts as working (F37); a raw `<a>` passes (F28); `check:core-log` outside `npm run check` (F31) | Cold-agent trial |
| D3 | Customization | 12 | 3 | **3** | = | 0 literal `--c-*`, 0 raw type in parts. G4, G5 and S1 are generic seams with defaults unchanged. Part TSX grew with behaviour (Slack +513, Word +433 lines): wiring controls, which belongs in parts | — |
| D4 | Versatility | 10 | 2 | **3** | ↑ | Two unrelated products work at sign-off by an evaluator's click-through: Word 0 dead of 1,193, YouTube 0 of 125; Slack 3 of 1,003. The batch sweep (`c26d341` against `9f8749a`: 1044 screens, 77 different, all explained, 0 on any other template) is Worker 130's, not re-run here. Not 4: IKEA 54 dead, no outside consumer | Outside-consumer parity; independent sweep |
| D5 | Tokens | 10 | 4 | **4** | = | Plants of hex, literal `--c-*` and raw type each exit 1; 0 literals in parts | — |
| D6 | Components | 12 | 2 | **2** | = | 0 product-specific core changes; widget roles and inline SVG gated. Still 2: `raw-markup` warns (12; a planted `<a>` passes, F28); 2 core files unrecorded since `afcaba8` (F31) | Licence audit (P5) |
| D7 | Spacing | 6 | 2 | **2** | = | Slack and Word 0 on **every** layout at both widths, both schemes (new coverage). IKEA 5 of 7 fail (F25); YouTube `search`, `watch` fail (F33) | — |
| D8 | Layout | 6 | 2 | **2** | = | `scrollWidth` equals the window on all 160 runs. LY4 and LY6 on IKEA, LY4 on YouTube (F25, F33) | — |
| D9 | UI states | 6 | 2 | **2** | = | 44 of 59 applicable states (unchanged) | UI-states probe |
| D10 | Visual noise | 5 | 3 | **3** | = | Measured again (L2 carried L1's). F22's VN7 rule now catches gradient bands: it flags Slack's plum title bar and rail tile on 30 runs. That's the reference's look, not a hiding workaround, but the exception isn't recorded where the probe reads it (F29, F38). Held at 3, at risk | — |
| D11 | UI copy | 4 | 2 | **2** | = | `check:copy` 0 errors, 94 warnings (unchanged). The stub note itself reads well | Copy rows in trackers |
| D12 | Performance | 5 | 1 | **1** | = | No benchmark or baseline (F12 deferred) | Bundle size, LCP, INP |
| D13 | Accessibility | 6 | 2 | **2** | = | `check:template-contrast` 110 pairs, 0 below AA. Not 3: no automated audit | axe (licence pending); target size; screen reader |

**Overall:** weighted mean **2.42 / 4** (242 of 400; L2 232). 100% of the weight has a measured indicator. **Reported score: 2.00 (capped)**, held down by **D12 Performance (1)**. Without the cap, 2.42.

**Better or not:** better. D4 rose with none falling, and F34 closed. The rise is real work, not new coverage: L2 measured the same controls dead.

### L2 findings, verified

| # | Verified? | How |
| --- | --- | --- |
| F31 | **Still open** | `check:core-log --base afcaba8`: 2 unrecorded (`AllocationSlider.tsx`, `GradientEditor.tsx`); `npm run check` still doesn't run it |
| F32 | **Partly shipped** | `tools/click-probe.mjs` exists (`f4225eb`) and finds dead controls (IKEA 54, Slack 3). Not a gate: it isn't in `npm run check` or the sweep, and no template declares stubs. Slack and Word fixed (147 → 3, 168 → 0) |
| F33 | Still open | YouTube's probe findings identical to L2 |
| F34 | **Closed** | Click rates for all four replicas above |
| F22 | **Verified in use** | VN7 reports "background-image gradient" bands on Slack's title bar (F38) |
| F25, F28, F29, F30 | Still open | As above; F30: L3's numbers again come from the commands in the table, not one script |
| F10, F12, F14 target size, F15, F26 | Still open (carried) | F26 can't be re-verified while axe is n/m |

## Findings routing (Q152.4)

Every scorecard run ends here. Each finding goes to one or more of three places: the **framework** (the [protocol](pressure-test-loop.md#0-the-protocol-what-agents-do-in-order), [the contract](how-it-works.md) or a check), the **library** (core), or the **template**. Each has an owner and a status. The next run verifies each one first, with the method in the last column, before scoring anything else. Main routes the code fixes: Word's to the Word builder now, and core's to one core packet after Word is merged.

### L0 findings

| # | Finding (evidence) | Contract | Framework | Library (core) | Template | Owner | Status | Next run verifies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | 47 literal core component tokens in part CSS (LG3) | K9 | P4 treats `core-token` and `raw-size` warnings as fails; Never #6 | Component-token overrides in template token data; `check:project` makes `core-token` an error for templates | Move Slack's 25 and Word's 22 literals into token data once core has the seam | Framework: Worker 101. Core: core packet. Templates: Word builder, then Slack's maintainer | Framework **done** (Q152.2). Core **shipped** (C1, Worker 109, `dl-integrate`: `$parts` seam in `theme.json`, `core-token` an error in template parts). Templates **shipped** in `dl-integrate`: Slack 101, Word 72 and IKEA 5 core-token settings moved to `$parts` (0 left in part CSS), sweep 0 different. YouTube: Worker 108 runs the same move on its own parts when it merges `integrate/word-into-brand-map` | Count of literal `--c-*` in parts is 0 |
| F2 | Word's style gallery is a hand-built popup (LG4) | S4, A2 | P5 counts widget roles; Never #5 | — | Use core `Popover` | Word builder | Framework **done**; template **shipped** (`dl-word 2d623d8`) | 0 widget roles in Word's parts; Escape and focus return work |
| F3 | Word's file list is a hand-built table (LG5) | S4 | P5 (as F2) | Only if `DataTable` lacks a borderless, quiet density: add `c.data-table.*` look tokens | Use `DataTable` | Word builder (core only if needed) | Framework **done**; template **shipped** (`dl-word 2d623d8`, existing `c.data-table.*` tokens sufficed) | As F2 |
| F4 | Word paints its regions with a fixed SVG backdrop that hides them from the noise probe (LG6) | L2, L4 | P5 greps for transparent regions with a painted backdrop; Never #2 | Noise probe counts a picture that paints a region as that region's fill | Fill regions from tokens on the layout; delete the backdrop and frame-ring SVGs | Framework: Worker 101. Probe: core packet. Template: Word builder | Framework **done**; template **shipped** (`dl-word 2d623d8`); probe **shipped** (C2, Worker 109, `dl-integrate`: `noise-probe.js` VN7, Word 0, a planted stretched backdrop fails and its 2 fills count toward VN5) | Backdrop gone; noise probe 0 with the regions filled |
| F5 | Inline `<svg>` in template TSX isn't checked (LG7) | R7 | P5 counts inline SVG | `check:svg` or `check:project` flags inline `<svg>` in parts, with an allow-list | Move decorative drawings to pictures or `Icon`; allow-list the rulers | Core packet; Word builder | Framework **done**; template **shipped** (`dl-word 2d623d8`, 24 drawings moved to `Icon`, only 2 commented metric rulers left); core **shipped** (C2: `check:project` `inline-svg` error in template parts, with an `inline-svg: <why>` comment as the allow-list; a planted `<svg>` fails, exit 1) | The check exists and a planted inline SVG fails it |
| F6 | 39 `as IconName` casts for custom icon names (LG8) | R8 | — | A typed path for custom names | Drop the casts | Core packet, then Word builder | **shipped** (C2, `dl-integrate`: `defineIconPack` with `name()` and `of()`, `IconName = CoreIconName \| CustomIconName`; Word's 45 casts and YouTube's 2 removed; `check:project` `icon-cast` is an error) | 0 casts in Word's parts |
| F7 | Uncommitted Ribbon `end` change alters the default (LG9) | G2 | P3 and P6 gates; Never #9 | — (the change is in core, but the Word branch owns it) | Make it opt-in or prove it with the sweep before commit | Word builder | **shipped** (`dl-word 2d623d8`: opt-in `endPlacement="corner"`, 920-screen sweep `failed: 0`) | The Word branch's sweep `failed: 0` including `lib--ribbon`; or the prop exists |
| F8 | Core changes unrecorded and one row out of date (LG10) | G4 | P3 gate requires the row | A check that every core diff has a Templates and the library row | Add the rows for packet D; correct W7 | Word builder; core packet for the check | Framework **done**; rows **shipped** (`templates-and-library.md`); check **shipped** (C2: `npm run check:core-log`, a P3 procedure gate with `--doc`, since this record lives in main's docs; it caught C1/C2's own 4 files until their rows were written) | Rows present; the check exists |
| F9 | Warnings that would have caught F1 and F2 don't gate | K9, S4, R8, V3 | P4 makes them fails for the template under work | `check:project --strict` gates those rules for `packages/templates` | — | Framework: Worker 101. Core: core packet | Framework **done**; core **shipped** for `core-token` and raw type (C1: errors for template parts, so `npm run check` fails on a planted `--c-popup-width: 10rem` or `font-size: 0.7rem`, exit 1); `raw-markup` still warns | `npm run check` fails on a planted literal in part CSS |
| F10 | `check:regression` isn't in main's `package.json`, nor in `npm run check` | G2 | P6 names it as a mandatory gate | Lands in main when the brand-map branch merges | — | Main (integration) | Framework **done**; merge **open** | Script present in main |
| F11 | No copy check (D11 = 1, one of the two caps) | V3 | — | `check:copy` over stories and template content | — | Core packet | **shipped** (C3, Worker 109, `dl-integrate`: `npm run check:copy` in `npm run check`, rules CP1–CP6; 29 findings at C3 listed as debt in `tools/copy-baseline.json`, a ratchet, since fixing them changes rendered pages; a planted "Field Notes... click here" fails, exit 1) | The command exists; D11 rescored |
| F12 | No benchmark; the contract had no performance invariant (D12 = 1, the other cap) | Q1, Q2 | Contract gained Q1 and Q2 | One benchmark command and a committed baseline | — | Framework: Worker 101. Core: core packet | Framework **done**; core **deferred** to production-ready mode (Worker 109, 2026-11-12: strict design forbids benchmarks, and the guard denies them) | The baseline file exists; D12 rescored |
| F13 | State coverage per component unmeasured (D9) | L3 | — | A coverage matrix generated from stories | — | Core packet | **shipped** (C3: `tools/state-coverage.json` from `tools/state-coverage.mjs`, `npm run check:states` in `npm run check`; 44 of 59 applicable states shown: disabled 20/26, loading 8/11, error 14/20, empty 2/2) | The matrix exists |
| F14 | No automated accessibility audit (D13) | A2, A3, A5 | — | axe in the sweep, in every scheme; a target-size check | — | Core packet | **shipped** for axe (C3: `npm run check:regression -- --axe` runs axe-core 4.14, MPL-2.0 dev dependency, on every working-copy screen in light and dark, writing `.shots/regression/axe.json`; a probe that doesn't fail the sweep. First run, `afcaba8`: 1044 screens audited, 186 with no violations, 10 rules: `region` 666 screens, `landmark-unique` 396, `page-has-heading-one` 172, `color-contrast` (serious) 48, `heading-order` 22, `label-content-name-mismatch` (serious) 16; for the L1 evaluator to judge and route). Target size **open** | axe results in the sweep |
| F15 | No timed newcomer session or cold-agent trial (D1, D2 n/m) | V4, S5 | P10's evaluator runs one cold-agent trial per loop | — | — | Main (schedule) | **open** | Trial result recorded |
| F16 | Six raw type values in part CSS (Slack 5 `font-size`, Word 1 `letter-spacing`) | K9 | P5 counts them | — | Use `text.*` roles or part tokens | Word builder; Slack's maintainer | Word **shipped** (`dl-word 2d623d8`, `--t-word-window-grip-tracking`); Slack **shipped** (C1, `dl-integrate`: 7 values to measured `t.slack.workspace.*` tokens; IKEA's 1 and YouTube's 1 too) | 0 raw type values in parts |
| F17 | Slack's thread pane closes on Escape through its own key handler | S4 | — | A `Pane` close seam, only when a second template needs one (rule of two) | Keep | — | **declined** (rule of two) | Re-opened if a second template needs it |
| F18 | No indicator measured eight invariants (T1, T2, K3, G3, G5, G6, P5, R9) | — | Indicators added to D2, D4, D5 and D6 (above) | — | — | Worker 101 | **done** (Q152.3) | Collected in L1 |

**Routed for code:**

- **Word template:** F2, F3, F4 (template part), F5 (template part), F7, F8 (rows), F16 (Word's value), and F1 and F6 once their core seams ship.
- **Core packet** (after Word is merged): F1, F3 (only if needed), F4 (probe), F5 (check), F6, F8 (check), F9, F11, F12, F13, F14.
- **Main:** F10 (merge), F15 (schedule the trials), and Slack's share of F1 and F16 after the core seams ship.

### L1 findings

Found by Worker 111 at `afcaba8` ([how L1 was measured](#how-l1-was-measured)). The next run (L2) verifies each one first, by the method in the last column.

| # | Finding (evidence) | Contract | Framework | Library (core) | Template | Owner | Status | Next run verifies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F19 | The S2 gate matches only `[data-dl='x']` with single quotes. `[data-dl="button"]` or `[data-dl=button]` in part CSS, even with a hex colour added, passes the whole of `npm run check` (exit 0) | S2 | The contract marks S2 as **Gate**; until this is fixed, note "single-quoted form only". P5 adds a grep for core `data-dl` names in any quote form | `check:project` `core-selector` matches every attribute-selector form, including `~=`, `^=` and `*=` operators | — | Core packet | **shipped** (L1a `51c33a2`, Worker 113): `core-selector` reads single, double and no quotes and every operator; `part-path` any quote form. Planted `[data-dl="button"]`, `[data-dl=button]`, `[data-dl^="butt"]` and a double-quoted descendant path each exit 1 | Planted double-quoted and unquoted selectors fail, exit 1 |
| F20 | Hex and `rgb()` colours in template part CSS pass every check (P3 unenforced; a planted `color: #ff0000` exits 0) | P3, K9 | Remove P3 from "unenforced" once gated | `check:project` `colour-literal` error in template parts; a declared exception for mask stops | IKEA: write its 2 `#000` mask stops as `black` or as a token, depending on the rule | Core packet; IKEA owner | **shipped** (L1a `51c33a2`): `colour-literal` error in template part CSS (hex, `rgb()`, `hsl()`, `oklch()`…); IKEA's two mask stops are `black` (same pixels). Planted `#ff0000` and `rgb(1 2 3)` exit 1; IKEA passes | Planted hex fails; IKEA passes |
| F21 | TSX evasions pass `check:project`: `style={{ fontSize: 12, color: '#f00' }}` on a part, `role={expr}`, `createElement('svg')`, a `div` with `aria-modal` | S4, R7, K9 | P5 greps cover the expression forms until the check does | `widget-role` also reads string-valued expressions and `aria-modal`; `inline-svg` also reads `createElement('svg')`; a `style-literal` rule for literal look values in a part's `style` prop | — | Core packet | **shipped** (L1a `51c33a2`): `widget-role` reads `role={'dialog'}` and `aria-modal`; `inline-svg` reads `createElement('svg')`; new `style-literal` error for type and colour literals in a part's `style` prop. Each planted form exits 1; `var(--…)` passes | Each planted form fails |
| F22 | VN7 misses two ways of painting regions: the same stretched backdrop marked `role="img"`, and bands painted by a `background-image` gradient over a transparent region | L2, L4 | Never #2 names both forms | `noise-probe.js` VN7 treats any picture stretched over most of a transparent region as painting it, whatever its role, and counts gradient stops on a region's `background-image` as fills | — | Core packet | **shipped** (L1a `51c33a2`): VN7 counts any stretched or multi-fill picture whatever its role, and background-image gradient bands over a clear region. Both planted pages fail VN7, a plain filled region passes | Both planted pages fail VN7 |
| F23 | `npm run check` fails on a fresh Windows clone with Git's default `core.autocrlf=true`: `tokens:check` reports 10 generated template `tokens.css` and `theme.css` files stale from CRLF alone. There's no `.gitattributes` | G6, K1 | [Setup guide](setup.md): the checkout setting, until fixed | A `.gitattributes` with `eol=lf` for generated and source text, or generators and `--check` that compare text with line endings normalized | — | Core packet (repository) | **shipped** (L1a `51c33a2`, `cde91e6`): `.gitattributes` `* text=auto eol=lf` and the index renormalised (21 CRLF blobs). A fresh `core.autocrlf=true` clone in a temp folder (a path with a space, which also exposed and fixed a `URL.pathname` bug in `tools/template-tokens.mjs` and `tools/check-content.mjs`) passes `npm run check`, exit 0; folder removed | A fresh `core.autocrlf=true` worktree passes `npm run check` |
| F24 | Word at 320 px: `comments` overflows (`scrollWidth` 341, LY1 27, LY7 1) and `navigation` fails LY8; both fail SC2 and SC6 at 1280 and 320, and SC7 at 320, in light and dark. The tracker reports 0 | L1, L2 | P6 and P10: the evaluator's own probe run covers **every** signed-off layout at full width and 320 px, saved as JSON, not only the touched screens | — | Fix the side-pane layouts' reflow and spacing at their source | Word builder | **open** | Probes 0 non-noise findings and `scrollWidth` 320 on both layouts |
| F25 | IKEA fails spacing on 5 of 7 layouts (SC1, SC2, SC3, SC5, SC16 on `home`, `products`, `room`, `product`, `bag`) and LY4 and LY6 on `home` and `product`, at both widths and in both schemes | L1, L2 | — | — | Fix at the owning layout or part | IKEA owner (main assigns) | **open** | Spacing and layout probes 0 on IKEA |
| F26 | Serious axe findings: `color-contrast` on 48 screens (Slack 25, library 16, design 4, Word 3), `label-content-name-mismatch` 16 (design 10, library 6), `scrollable-region-focusable` 4 (`lib--listdetail`, `lib--rail`). Moderate landmark rules on most screens (`region` 666, `landmark-unique` 396) | A1, A2, A5 | P6: serious axe findings on the template under work count as fails | `ScrollArea` focusable when it scrolls and has no focusable content; layouts give unique landmark names; the library pages' contrast and names | Slack, Word, design: the failing contrast pairs and accessible names | Core packet; Slack's maintainer; Word builder | **open** | `axe.json` serious count 0 |
| F27 | `check:core-log` maps a shared file to a name that can't exist in the record (`controls.css` → `Controls`, `type-and-media.css` → `TypeAndMedia`) and flags `Chip` although the record names it. Since `5fc801a` it flags 6 files; by reading, at most 2 are truly unrecorded (`icons/sets.ts`, `tools/icons.mjs`, the `--custom` pack flag, recorded only in prose) | G4 | — | Map shared CSS to the components it styles, match names case-insensitively, and accept tool and file names | Record `sets.ts` and `icons.mjs` by file name | Core packet | **shipped** (L1a `51c33a2`): file names case-insensitive, shared CSS by any component it styles, line-ending-only changes skipped; `sets.ts`, `icons.mjs` and `behaviour/anchor.ts` named in the record. `check:core-log --base 5fc801a` 0 unrecorded; a planted new core file fails | `check:core-log --base 5fc801a` flags only truly unrecorded files |
| F28 | `raw-markup` only warns: 16 raw elements rebuild core Link, Image and Heading (IKEA 12, YouTube 3, conference 1) | S4 | P4 already treats it as a fail for the template under work | `raw-markup` becomes an error in template parts (the contract's cheapest next move) | IKEA, YouTube, conference: use `Link`, `Image`, `Heading` | Core packet; template owners | **open** | `check:project` shows 0 `raw-markup` |
| F29 | Replica noise exceptions live only in tracker prose. The raw probe fails VN3 on every Slack, Word, IKEA and YouTube screen, and only the trackers say which failures are the reference's own enclosures | L4 | A per-template file of reference-approved VN exceptions (region, row, reference screenshot), read by the probe, like `regression-noise.json` | `noise-probe.js` reads the exceptions and reports the rest | Slack and Word write theirs from the trackers | Framework: main assigns; core packet for the probe | **open** | The probe reports 0 unexcepted VN findings on Slack and Word |
| F30 | L0 indicators that don't reproduce: "87 Rules agents miss rows" (27 rows under that heading at `5fc801a`) and "1 raw `px` line" in core (10 non-zero `px` lines at `afcaba8`) | — | Each indicator gets an exact command; better, one `tools/scorecard-indicators.mjs` that prints them all as JSON | — | — | Framework (scorecard owner) | **open** | L2 numbers come from the script |

**Routed for code:**

- **Core packet:** F19, F20 (check), F21, F22, F23, F26 (`ScrollArea`, landmarks, library pages), F27, F28 (check), F29 (probe).
- **Templates:** Word builder for F24 and Word's share of F26; IKEA owner for F20, F25 and F28; Slack's maintainer and the design template for F26; YouTube for F28 when it merges.
- **Framework:** F24 (P6 and P10 coverage), F26 (P6), F29 (exceptions format), F30 (indicator script); the contract's S2 note (F19).
- **Carried from L0:** F10 (merge), F12 (deferred), F14 target size, F15 (trials).

### L2 findings

Found by Worker 127 at `9f8749a` ([how L2 was measured](#how-l2-was-measured)). The next run (L3) verifies each one first.

| # | Finding (evidence) | Contract | Level that fixes it | Owner file | Owner | Status | Next run verifies |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F31 | L1b changed `AllocationSlider.tsx` and `GradientEditor.tsx` (`aria-disabled`) without a row in Templates and the library; `npm run check` passed because `check:core-log` is a separate procedure gate | G4 | Process (record the rows; run `check:core-log` in every core packet's gate), then core (a `check:core-log` step that `npm run check` runs against the frozen base when one exists) | `docs/templates-and-library.md`; `package.json` `check` | Core packet | **open** (L3: still 2 unrecorded since `afcaba8`) | `check:core-log --base afcaba8` 0 unrecorded |
| F32 | **No check clicks anything.** Headless at `9f8749a`, 49% of Slack's clicked controls (147 of 299) and 47% of Word's (168 of 355) change nothing: Slack's rail Home, DMs, Threads, Saved and Write message on every layout; Word's Save, Quick Access, Backstage Save As, Print, Share, Export; both window bars. Both were signed off on screenshots, before Q158 | V4, S5 (new invariant: a rendered control does something or is visibly disabled) | Core: a `tools/click-probe.js` (or `check:regression -- --click`) that opens every link and clicks every enabled control per layout and fails a dead one unless the template declares it a stub with a reason. Process: P6 and P10 run it before any pixel row. Templates: Slack and Word wire or declare each control | `tools/`; `pressure-test-loop.md` P6, P10; `slack/parts/layouts/Workspace.tsx`, `word/parts/layouts/Window.tsx` | Core packet; Slack's maintainer; Word builder | **partly shipped** (L3: probe `f4225eb`; Slack 3 dead, Word 0; not a gate, no stub declarations) | Probe exists; dead clicks 0 undeclared on Slack, Word, IKEA, YouTube |
| F33 | YouTube fails the evaluator's own probes: `search` SC1 (11) and SC3, `watch` SC2, SC3 and SC7 at 320, LY4 on `home` and `search`, both schemes. Its sign-off reports none | L1, L2 | Template (or a recorded reference exception, F29) | `youtube/parts/layouts/site.css` | YouTube owner | **open** (L3: unchanged) | Probes 0 unexcepted findings on YouTube |
| F34 | Click-through coverage for IKEA and YouTube is n/m in L2: the bounded run stalled (probably on a link `goto` or the full-screen control) and was stopped | — | Process (the probe in F32 sets a per-step timeout and skips full-screen requests) | `tools/` (F32's probe) | Scorecard owner | **closed** (L3: all four measured) | L3 has click rates for all four replicas |

### L3 findings

Found by Worker 132 at `a80c7c0` ([how L3 was measured](#how-l3-was-measured)). The next run (L4) verifies each one first.

| # | Finding (evidence) | Contract | Level that fixes it | Owner file | Owner | Status | Next run verifies |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F35 | **IKEA: 54 of 351 clicked controls dead (15%)**, plus 48 skipped (33 product-tile links on `products` time out). Header Favourites, Your account, EN and Offers on every layout; on `home`, 28 including the whole footer list. IKEA wasn't in the Q156 batch | V4 (Q156) | Template: wire each control or give the honest note | `ikea/parts/**` | IKEA owner (main assigns) | **new** | Click probe 0 dead, 0 timed-out on IKEA |
| F36 | **Slack: 3 dead links on `channel`.** The channel topic link and two message links render `<Link href="#/app/slack/channel">` on the channel page itself, so clicking changes nothing | V4 (Q156) | Template: open the note, a preview or the thread instead | `slack/parts/layouts/Workspace.tsx` lines 733, 2016 | Slack's maintainer | **new** | Click probe 0 dead on Slack |
| F37 | **A stub counts as working.** The probe counts the honest "isn't part of the replica yet" note as alive. Word gives it on 392 of 1,193 clicks (209 distinct controls), Slack on 150 of 1,003, YouTube on 4. "0 dead" says nothing about how much works, and no gate bounds it (Q156 wants the note rare) | V4, S5 | Core: `notify` (or a `stub()` helper) marks a stub so `click-probe.mjs` reports stubs apart from working controls. Process: P6 sets a ceiling per template, and trackers list stubs by name | `tools/click-probe.mjs`; `pressure-test-loop.md` P6; `word/parts/layouts/Window.tsx` | Core packet; Word builder | **new** | Probe reports stubs separately; Word's stub share falls |
| F38 | VN7 flags Slack's plum title bar and rail tile ("background-image gradient", 2 fills) on 30 of 56 runs, every layout at 1280. That's the reference's look, but the exception lives nowhere the probe can read | L4 | Framework and core, as F29 (an exceptions file the probe reads); or the gradient as a region fill from a token | `slack/tokens/theme.json`; F29's file | Slack's maintainer; core packet | **new** | Noise probe 0 unexcepted VN7 on Slack |
| F39 | The click probe is fragile as an evaluator tool: when the server drops, it throws on the next `goto` and writes no JSON for the layouts already done; a modal layout skips 93 controls behind it by timeout, with no reason given | — | Core tooling: write the report as each layout finishes; report "covered by a modal" apart from timeouts | `tools/click-probe.mjs` | Core packet | **new** | A killed run leaves partial JSON |

**Top 5 findings (current, L3) by impact on "an agent can quickly build a well-defined UI that works":**

1. **F32 and F37: "works" still isn't a gate.** The probe exists, but `npm run check` and the sweep don't run it, so IKEA's 54 and Slack's 3 dead controls pass every gate; and where it is run, a stub note counts as working, so Word's 209 stubbed controls read as "0 dead".
2. **F35: IKEA is 15% dead.** The only replica that fails Q156 outright.
3. **F28: `raw-markup` only warns.** A planted raw `<a>` still exits 0; 12 raw elements rebuild Link, Image and Heading.
4. **F31: core changes slip past `npm run check`.** Still 2 unrecorded files since `afcaba8`.
5. **F25, F33 with F29 and F38: probe fails and exceptions without a file.** IKEA and YouTube fail spacing and layout rows their sign-offs don't report, and Slack's reference gradient now trips VN7 with nowhere to record it. Behind these, F15 and F12 (no cold-agent trial, no benchmark) still keep "quickly" unmeasured and the score capped.

<details><summary>L2's top 5 (superseded)</summary>

1. F32: no check clicks anything. 2. F28: `raw-markup` only warns. 3. F31: core changes slip past `npm run check`. 4. F25 and F33: spacing and layout fails sign-off didn't report. 5. F15 and F12: no cold-agent trial and no benchmark.

</details>

## History

| Loop | Date | Scored on | Scorer | Overall (weighted) | Reported | Capped by | Lowest dimensions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L0 baseline | 2026-11-12 | Slack `5fc801a` (signed off); Word `0fb6a25` plus working copy (near sign-off) | Worker 101 | 2.13 | 2.00 | D11, D12 | D11 1, D12 1; D1, D2, D3, D5, D6, D9, D10, D13 at 2 |
| [L1](#loop-l1-score) | 2026-11-12 | `integrate/word-into-brand-map` `afcaba8` (Slack and Word signed off, IKEA, core C1–C3); YouTube from its tracker only | Worker 111 | 2.32 | 2.00 | D12 | D12 1; D1, D2, D6, D7, D8, D9, D11, D13 at 2. Change from L0: D3 ↑3, D5 ↑3, D10 ↑3, D11 ↑2; D7 ↓2, D8 ↓2 (measured directly, not taken from the trackers); D1, D2, D4, D6, D9, D12, D13 = |
| [L2](#loop-l2-score) | 2026-11-13 | `dl-integrate` `9f8749a` (Slack, Word, IKEA, YouTube signed off at `4201072`; L1 fixes `51c33a2`, `f2ca211`; `454ebad`), on 8770 | Worker 127 | 2.32 | 2.00 | D12 | D12 1; D1, D2, D4, D6, D7, D8, D9, D11, D13 at 2. Change from L1: D5 ↑4; D4 ↓2 (first click-through: Slack 49%, Word 47% dead controls); the rest =. axe n/m (dependency not approved) |
| [L3](#loop-l3-score) | 2026-11-13 | Frozen build of `a80c7c0` (`dl-integrate\.shots\base-dist`: Slack, Word, YouTube Q156 work; core G4, G5, S1; Q160), on a short-lived port 8791 | Worker 132 | 2.42 | 2.00 | D12 | D12 1; D1, D2, D6, D7, D8, D9, D11, D13 at 2. Change from L2: D4 ↑3 (click-through: Word 0 dead of 1,193, YouTube 0 of 125, Slack 3 of 1,003; IKEA 54 of 351); the rest =. Note-only clicks: Word 392 (209 controls), Slack 150, YouTube 4. axe n/m (licence pending) |
