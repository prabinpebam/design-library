# YouTube replica: scoring tracker (Q145.Y)

## Where the YouTube time went (Q159)

*Worker 123, the evaluator, 2026-11-13 08:30. Sources: git log on `feat/brand-map` (23 YouTube commits, from `ceecfd1` at 2026-11-12 16:29 to `4d050e1` at 2026-11-13 07:15) and this tracker. The hours are rough, and they overlap: wall time was about 15 hours.*

| Time sink | Roughly | Good use? | What should have happened |
| --- | --- | --- | --- |
| **Never clicking anything** (the root cause) | All of it | **No** | For about 15 hours every score came from static screenshots and box measurements. No one clicked a link. Every link led to "no template layout", there were 0 pictures, and half the controls were dead (Q156). One click-through on `42a5ad8` (16:58) would have found the core navigation gap on day one. **Run the click-through first, every batch.** |
| Pixel-level fail rounds | ~6 h | **No** | About 15 of 46 fail IDs were ≤4 px or glyph ink: the logo 148.7→123, Sign in 107.1→104.6, a placeholder 3 px, a channel name 1.5 px, the chapters' radius 10→8, a chevron 10×6→14×8, CC and gear 2 px, full-screen arms 6→8, and 2–4 grey edge pixels (F46: 2 h 45 m from `82c202c` to `4d050e1`). None of them is visible at normal viewing. **Should have been skipped,** or batched into one final polish round after function passed. |
| Regression sweep on every packet (~15 min, 1044 screens) | ~3.5 h | **Partly** | It ran on about 14 packets, including template-only ones that can't touch other templates. **Sweep only core batches,** once per batch: that's about 3 sweeps, 45 min. |
| Rescoring every commit | ~3 h | **No** | 14 rounds of build, sweep, measure and write a fail list, each 30–60 min, often for a single fail (F33, F34c–e, F46). **Batch the fails** and score twice: after links and pictures, then after menus and controls. |
| Bug hunts and side work on the same line | ~3 h | Partly | F43, the dark-region bundler bisect and base refreeze, about 1.5 h, was a real bug, but it wasn't YouTube's. Also the Word integration merges (`eed781d`, `974cee5`), core hardening C1 and C2 (`68a0cdc`, `8b8ab1f`) and the L1 scorecard. **Run these on a separate track,** not between replica packets. |
| Roll-overs and re-reading | ~3 h | **No** | 9 builder handovers (Workers 100→124) and 3 evaluator handovers (102→114→116→123), each about 15 minutes of reading the rules and a long tracker. Because the evaluator page grew to more than 600 lines, every successor paid for it. **Use short briefs and one-paragraph handoffs,** and size packets so fewer workers hit 90 minutes. |
| Frozen tool calls | ~4 h | **No** | Workers 119–122 each sat 30–100 minutes on one stuck call, mostly send_message or tool search. This evaluator sat 28 min. **Use only already-loaded tools,** report by ending the turn, and main checks on any silent worker after 10 min. |
| Relays through main and idle waiting | ~1.5 h | **No** | Commits waited for main to relay them, and the evaluator sat idle between relays: 04:32–07:14 with one 2 px fail in flight. **Rebuild the review build per commit** (cheap) and give the full score per batch. |
| Reference capture (Y.1) and the first build (Y.2a) | ~1 h | **Yes** | Measured references and a home screen in the first 30 min of building were the right start. |

**Bottom line:** about 15 hours went in, and roughly 3 of them produced the visible replica. The rest went on pixels no one can see, repeated sweeps and rescoring, handovers and frozen calls, while the basics were broken. Under the lean loop ([pressure-test-loop.md §0](pressure-test-loop.md)), the same work would be one reference capture, two batches and two scores.

## Progress so far (Q155)

*Written by Worker 123, the evaluator, on 2026-11-13 at 07:30 for the owner's question "Why does making youtube replica taking so long?"*

**Try it.** The review build is commit `82c202c`, built into `dl-brand-map/.shots/eval-dist-82c202c` and served by `vite preview` on port 8771. It stays up until you're done with it.

- Home: <http://127.0.0.1:8771/site.html?chrome=none#/app/youtube/home>
- Search: <http://127.0.0.1:8771/site.html?chrome=none#/app/youtube/search>
- Watch: <http://127.0.0.1:8771/site.html?chrome=none#/app/youtube/watch>

The schemes follow your system's light or dark setting, and the narrow layout appears below about 792 px. The evaluator opened all 12 views headless (home, search and watch at 1280 and 720, light and dark): each rendered with 0 page errors (`dl-brand-map/.shots/q155-review/`).

**What's built and passing.** The `youtube` template has three screens: home, search and watch. Each works at 1280 and at 720, in light and in dark. Against the measured captures of the real site, about 98 scored rows pass. Each row is one region compared with one criterion, within ±1 px and ±3 per colour channel. The scored rows are:

| Area | Rows | Fails fixed and closed |
| --- | --- | --- |
| Home | 49 | F1–F19, F11 |
| Watch | 19 | F20–F31, F42, F44 |
| Search | 14 | F32–F34, F45 |
| 720 | 6 | F35–F40 and F40a |
| Dark | 10 | Passes with the fails above |

F43 was a build bug that showed up only in dark regions; it was found and fixed on the way. The new core seams are generic, and each keeps its default: a Navigation mini form, the TextField underline, `c.chip.edge-width`, Link plain, Button `iconEnd`, a ScrollArea inset, and others. The latest regression sweep compared 1044 screens with 0 differences.

The latest commit is `82c202c` (2026-11-13 04:29). Worker 124 is now finishing F46.

**What's open.**

- **F46:** PASS at `4d050e1` (07:40). These were grey pixels on the chip row's left edge at 1280, about 2–4 px at x95, plus 2 px at x611 in search dark: the first chip's own corner anti-aliasing. The review build now serves `4d050e1`.
- **F41, states:** dropped by the owner (Q158, 08:20). YouTube is completed on home, search and watch only.
- **Y.2 sign-off:** given only when every row passes.

**Time.** The work so far has taken about 12 hours:

- **2026-11-12 06:45:** the row was written.
- **16:29:** Y.1 was committed (Worker 100's reference capture).
- **16:58:** the first screen, home, was committed.
- **21:04:** search was committed.
- **2026-11-13 04:29:** the latest fix, `82c202c`, was committed.

That's 23 YouTube commits in `feat/brand-map`. The builders were Workers 100, 103, 105, 108, 112, 115, 119, 120, 122 and now 124: ten workers, so nine handovers. The evaluators were Workers 84 (the row review), 102, 114, 116 and 123: three handovers.

**Where the time went.**

1. **Fourteen scoring rounds of about 30–60 minutes each.** Each round was a build, a fail list, a fix, a regression sweep and a rescore. About 46 fail IDs, with sub-rows, came through. About 15 of them were pixel-level, for example:
   - the logo box 148.7 → 123 wide;
   - Sign in 107.1 → 104.6 wide;
   - a row gap 36 → 32;
   - the placeholder 3 px too low;
   - a channel name 1.5 px off;
   - the chapters strip's radius 10 → 8;
   - its chevron 10×6 → 14×8;
   - the CC and gear glyphs 2 px off;
   - the full-screen arms 6 → 8 long;
   - the 2–4 grey chip-edge pixels of F46.
2. **The ~15-minute, 1044-screen regression sweep on every builder packet** (Q150, RR3). That's about 3 hours on its own.
3. **Workers that froze.** Workers 119–122 each sat 30–100 minutes on one stuck tool or message call. This evaluator sat 28 minutes on one too.
4. **Roll-overs every 90 active minutes.** There were 12 handovers, each costing a handoff plus a re-read.
5. **Side work on the same line:**
   - the Word integration merges (`eed781d`, `974cee5`);
   - core hardening C1 and C2 (`68a0cdc`, `8b8ab1f`);
   - the L1 library scorecard;
   - the F43 dark-region bundler bisect and base refreeze, about 1.5 hours.

**Scope creep.** These went past "an exact replica of home, search and watch, as far as a person can see":

- **F41, the states.** They aren't in the Q145.Y row. They came from the evaluator's own section 1 #3 and would need new captures, a build and scoring, which is several more hours.
- **Pixel-exact scoring.** The ±1 px and ±3 per channel rule, plus the ink boxes of every glyph, is stricter than "can't be told apart". It produced F46 and most of the late rounds.
- **The player behaving like the real one.** The playing state (F42a) and sizing from the video's own aspect ratio (F40a) go past the screenshots.
- **The search page's 4K/New badges and chapters strip (F34).** These are visible in the reference, so they're borderline.

The 720 width is *not* creep: the row asks for "1280 and a narrow width".

**Proposed cut, for the owner to decide.**

1. Close F46 by ruling: sub-pixel corner anti-aliasing that a person can't see.
2. Move F41 states out of Y.2 into a later, optional row.
3. Score the rest with "no difference visible side by side at the same window size", with ±2 px as the guide.

With that cut, **Y.2 can be signed off within about an hour** on `82c202c`, or on Worker 124's F46 commit. It needs:

- one side-by-side of home, search and watch at 1280 and 720, light and dark, against `youtube-ref/shots/`;
- the builder's last sweep showing 0 differences;
- `npm run check` exiting with 0.

One thing you may notice: the thumbnails are neutral grey frames, which the row allows. Generated pictures would be a separate, small packet if you want them.

**Status:** evaluator's tracker for the YouTube replica ([DoD Q145.Y](definition-of-done.md#owner-instructions)), the third template under the [Hardening method](hardening-method.md). Owned since 2026-11-12 17:00 by Worker 102, who doesn't build it (Worker 112 builds in `dl-brand-map` since 21:06, after Workers 100, 103, 105 and 108); section 1 was written by Worker 84. The scoring rules are the same as for [Slack](slack-replica.md) and [Word](word-replica.md): PASS within ±1 px and ±3 per colour channel of a measured reference value; n/m where the reference is unmeasured (n/m can't support "indistinguishable"); main's icon ruling (icon box, ink bounding box, stroke and colour within ±1 px, never the glyph outline). Scored only against the captures in `dl-brand-map/.design-library/youtube-ref/shots/` and its region spec. **How builds are served (owner Q153, 2026-11-12 20:07):** only Slate (8765) and the library app (8770) stay running. Each builder commit is scored from its own build: `node .shots/youtube-q145y-eval/eval-serve.mjs <commit> -- <script> [args]` git-archives the commit, links `node_modules` and `slate` (workspace packages point at the archive), builds it to `.shots/eval-dist-<sha>`, and serves it on `127.0.0.1:8771` only while the measurement scripts run, then closes it. Checked on `480e81e`: same grid boxes as the live server, and 0 listeners afterwards. **Not signed off:** home fails 2 of 49 rows (B2, and C2 reopened by the search chips), watch fails 3 of 19 at `454ebad` (player now black; WA3b, WA12 and the sweep's evidence open), and search fails 3 of 14 at `3370740` (section 2). At `454ebad` (Worker 114, 22:00): 720 fails 6 of 6, dark passes 8 of 10 (1 carried player fail, 1 n/m), and the 9 states are n/m for want of references.

> **TL;DR (row scored 2026-11-12 07:15, before any build):** the row is close to testable. Before the reference packet starts it needs eight fixes (section 1): named scoring windows that match YouTube's own guide breakpoints, frozen references with computed styles, a states list, a decision on the player, the icon and type pass rules, the live-feed shelves declared in or out, Slack and Word in the sweep once signed off, and how pictures are judged.

## 1. Scoring the Q145.Y row (before any build)

| # | Finding | Why it matters | Proposed fix to the row |
| --- | --- | --- | --- |
| 1 | "1280 and a narrow width" doesn't name the narrow width, and 1280 doesn't show the expanded guide | YouTube's guide is persistent only on wide windows (about 1313 px and up, to confirm in Y.1); at 1280 it shows the 72 px mini guide, and below about 792 no guide at all. Y.1 asks for the 240 guide, which a 1280 capture won't contain | Score at three windows, each captured at exactly that size: **1440 × 900** (expanded 240 guide), **1280 × 800** (mini guide), **720 × 900** (no guide, fewer grid columns). Record the measured breakpoints in the region spec |
| 2 | Live pages change between captures (feed, ads, personalisation, consent and sign-in prompts) | A reference that moves can't be re-measured; Y.1's "URL and time" isn't enough to re-check a value | Freeze each capture: save the screenshot at device scale 2 **and** the computed styles of every measured element (size, padding, radius, font, colour) to `youtube-ref/`. Values come from computed styles where they exist, pixels otherwise. Dismiss consent and sign-in prompts before capture and declare them out of scope |
| 3 | No states are listed | Indistinguishable includes interaction (the Q143 and Q145.W lesson) | Add: chip hover and selected; guide item hover and selected; video card hover (the three-dot menu appears) and the open card menu; search box focus (the inset search icon) and the suggestions list; Subscribe and Subscribed; Like toggled; tooltips on masthead buttons; keyboard focus on each; description collapsed and expanded |
| 4 | The player isn't specified | A real player is a separate product; an empty box can't be scored | Score the player as a static 16:9 frame plus its control bar at rest and on hover (progress line and its colour, button row, time text). Declare playback, captions, settings menus, ads and the theatre and full-screen modes out of scope |
| 5 | Icons have no pass rule | YouTube's masthead and guide icons are 24 px single-colour glyphs; colour and size are visible | State main's icon ruling for this row: box, ink bounding box, stroke and colour within ±1 px; glyphs from the library's set or an MIT or Apache-2.0 open set, never YouTube's artwork |
| 6 | "An OFL face close to Roboto" is redundant and untestable | Roboto (Apache-2.0) is already in `packages/core/fonts/registry.json`; "close" has no pass rule. YouTube also uses its own non-open face for some headings | Use Roboto from the registry. Score text by its boxes: label and title widths within ±2 px, cap height ±1 px, line height ±1 px; record any heading face difference as allowed |
| 7 | The live home feed holds shelves the row doesn't mention (Shorts, news, mixes, ads) | Unlisted regions are either silently skipped or argued about later | Declare the Shorts shelf, ad slots and topical shelves out of scope; the home route shows the chip bar and the plain video grid only |
| 8 | Y.4 doesn't include the earlier replicas | Slack and Word would be unguarded while YouTube changes core | Y.4 sweeps every other template, with Slack and Word included once each is signed off |

Two smaller notes, no row change needed: thumbnails are judged only by their box (16:9, radius, duration badge position, size and colours), not by picture content; and `check:generic` should name the brand red values found in Y.1 (expected around `#FF0000` and `#FF0033`, to confirm) before the build (RR7).

## 2. Scores

### Rescore: F39, F40, F40a and F45 at `82c202c` (Worker 122, relayed by main), 720 and 1280; scored 2026-11-13 04:40 by Worker 116

One production build on 8771, closed after the run (Q154). Scripts: `y2j/sweep.mjs` and `y2t/order.mjs`. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2u/`: `order.txt`, `crop-filters.png` (reference above, replica below; 1280 left, 720 right; ×4) and the 11 sweep screens.

**6 rows: 4 PASS, 1 FAIL, 1 confirmed.**

| # | Reference | Replica at `82c202c` | Score |
| --- | --- | --- | --- |
| F39 search at 720 | title w280; snippet ≤ 2 lines (36) | title 368, w280; snippet 2 lines (36) on every row | PASS |
| F40 watch order at 720 | description, then up next, then comments | description y565, up next y649–2114, comments y2114 | PASS |
| F40a player aspect | sizes from the video's aspect (main's ruling) | content field `aspect` (schema enum, default `16:9`) → `data-aspect` on the player; `site.css:101` gives `4:3` its own ratio. Our 16:9 video is 720×405 | PASS (allowed content difference) |
| F45 Filters | words from x1172 (x612 at 720), tune glyph 20×18 at x1218 (x658), y75–92 | the same; glyph 20×17, y75–91 | PASS |
| F46 1280 chip edge | home and search identical to `7a69ff9` | still 2–4 grey pixels at x95 (home and search, both schemes); new in search dark: 2 pixels at x611, y219 and y517 (29 per channel) | **FAIL** |
| Sweep | — | `.shots/w122-sweep1.log`: 1044 screens, 1020 identical, 10 noise, 14 inventory, 0 different (confirmed from the log) | confirmed |

### Rescore: F35–F40 (720) at `1e6b66d` (Worker 120), home, search and watch at 720 × 800 light and dark, plus 1280; scored 2026-11-13 03:30 by Worker 116

One production build on 8771, closed after each run (Q154). Scripts: `y2j/sweep.mjs` and `y2t/order.mjs` (section order and snippet lines). References: `H-720`, `T-720` (`grid-hashtag-720`), `S-720`, `W-720`. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2t/`: `sbs-{home,search,watch}-720.png` (reference left, replica right), `order.txt`, `crop-1280-*.png`, and the 12 sweep screens with every box. Light and dark have the same geometry at 720.

**9 rows: 4 PASS, 5 FAIL.**

| # | Reference | Replica at `1e6b66d` | Score |
| --- | --- | --- | --- |
| N1 guide | none below ≈792; content from x24 | none; content x24 | PASS |
| N2 masthead | logo 113; field x245 w114; button x359 w64; voice x439; Sign in x599.4 w104.6 | logo 114; field x245; button x358.4 w65; voice x439.4; ⋮ x551.4; Sign in x599.4 w104.6 | PASS |
| N3 home grid | 2 × 328 at x24 and x368; rows 316.5 apart | the same; rows 316.5 apart | PASS |
| N4 chip row | one row at y66.5 from x24, Filters at the end | one scrolling row; search chips at y66.5 from x24, Filters at the end | PASS |
| N5 search rows | thumbnail 328×184 at x24; title x368, **w280** (room for ⋮), 18/26, 2 lines max; snippet clamped at **2 lines** (max 36) | thumbnail 328×184.5; title x368 but **w328**; snippet **3 lines** (54 high) on every row | **FAIL** |
| N6a watch player | 720×540 full-bleed for the 4:3 reference video | 720×405 full-bleed, square. Main's ruling: allowed as a content difference only if the player sizes from the video's own aspect. It doesn't: `site.css:99` fixes the player at `aspect-ratio: 16 / 9`, and the content has no aspect field | **FAIL** |
| N6b order | title 12 below the player; description; **up next (y803–2332); then comments** (y2332) | title 12 below; description y565; **comments y649; up next only from y1060** | **FAIL** |
| F45 Filters (new; 1280 too) | words "Filters", then a tune glyph (sliders) to the right of the words | a lines glyph to the left of the words | **FAIL** |
| 1280 regression | `7a69ff9` (`y2s`): home and search unchanged | 2–4 stray grey pixels at x95, outside the left edge of the first chip (y73–75 and y91–92; up to 35 per channel; light and dark): the new inline ScrollArea's inset. Watch is unchanged | **FAIL** |

### Rescore: F34c/d/e at `7a69ff9` (Worker 120), search 1280 light and dark; scored 2026-11-13 03:00 by Worker 116

One production build on 8771, closed afterwards (Q154). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2s/`: `crop-chapters.png` (reference above, replica below; ×2) and the 6 sweep screens.

**4 rows: 4 PASS. F34 closed.**

| # | Reference (`S-1280-L/D`) | Replica at `7a69ff9` | Score |
| --- | --- | --- | --- |
| F34c corners | run 4, 3, 2, 1 (radius 8) | 4, 3, 2, 1 | PASS |
| F34d fill | `#F4F1F8` / `#2C2733` | `#F4F1F8` / `#2C2733` | PASS |
| F34e chevron | ink 14×9 at 1225, +14; `#0F0F0F` / `#F1F1F1` | 14×8 at 1225, +14; `#0F0F0F` / `#F1F1F1` | PASS |
| Geometry and R1 | `927059e` (`y2r`) | home and watch 0 px; search changes only inside the strip (x612–1256, y289–325). Builder's sweep against `c9e9f4a`: 1044 screens, 0 different | PASS |

### Rescore: F33 and F34 at `927059e` (Worker 119), search 1280 light and dark; scored 2026-11-13 02:20 by Worker 116

One production build on 8771, closed afterwards (Q154). Reference row: `S-1280-L/D`, the second result (the first result with 4K and chapters), compared with the replica's first result relative to the avatar's top. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2r/`: `overview.png` (reference above, replica below), `crop-badge-chapters.png` (×2) and the 6 sweep screens.

**8 rows: 5 PASS, 3 FAIL.**

| # | Reference | Replica at `927059e` | Score |
| --- | --- | --- | --- |
| F33 channel line | 612 w644 h51, padding 12; avatar 24; name at avatar + 4.5 | 51 high, padding 12; avatar 24 at y168; name at 172.5 (+ 4.5) | PASS |
| F34a 4K badge | 22×18 at x612, edge `#CCCCCC` / `#3F3F3F`; top = last snippet line's ink top + 23 | 22.4×18 at x612, same edges; + 23 | PASS |
| F34b strip box | 644×36 at x612, badge top + 38; frame 88 wide (x612–699 with its inset) | 644×36, + 38; frame x612–699 | PASS |
| F34c strip corners | radius 8 (corner run 4, 3, 2, 1) | computed `border-radius: 10px` (run 6, 4, 3, 2, 1, 1) | **FAIL** |
| F34d strip fill | `#F4F1F8` light, `#2C2733` dark (a cool tint, the same in both captures) | `#F2F2F2` / `#272727` (neutral tonal); blue 6 and 12 off | **FAIL** |
| F34e chevron | ink 14×8 from x1225, `#0F0F0F` | 10×6 from x1231, lightest `#2B2B2B` | **FAIL** |
| F34f words | "N chapters" w500, titles truncated; ink from x701 | ink from x701 | PASS |
| Geometry and R1 | `6846963` (`y2q`) | home and watch unchanged; only search's result rows move. Builder's sweep: 1044 screens, 1 different (`blog--saved` dark, 0.0022 % at the lake photo); run alone it's identical (`.shots/w119-sweep4b.log`: 4 identical), so it's load noise as with `chat--images` before. Declare it if it repeats | PASS |

### Rescore: F32 chips at `6846963` (Worker 119), home, search and watch 1280 light and dark; scored 2026-11-13 01:50 by Worker 116

One production build on 8771, closed afterwards (Q154). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2q/6846963/` (6 screens with every box). Reference: `S-1280-L` (`searchFilterChips`, `chip`, `chipText`).

**4 rows: 4 PASS. F32 closed; SR3 and C2 pass again.**

| # | Reference | Replica at `6846963` | Score |
| --- | --- | --- | --- |
| SR3 chip boxes | 6 chips at y66.5, 32 high: x96 w40.4, 144.4 w65.4, 217.8 w94, 319.8 w67.2, 395 w139.5, 542.4 w49.5 | the same six boxes exactly, light and dark; row 96,56 1160×56 | PASS |
| C2 chip | radius 8, padding `0 12`, 14/20 w500; selected `#0F0F0F` with `#F1F1F1` words (dark: inverted) | radius 8, no edge (`c.chip.edge-width` 0), 14 w500, same fills and words in both schemes | PASS |
| Home chips | no chip capture on home; spec values (C2) | "All" 40.4 at y68, the row otherwise as before | PASS |
| Geometry and R1 | `e493100` (`y2p`) | watch 0 px; home and search change only in the chip row (y66–100). Core default unchanged (hairline edge); builder's sweep against `c9e9f4a`: 1044 screens, 0 different | PASS |

### Rescore: F42a/d/e/g at `e493100` (Worker 119), watch 1280 light and dark; scored 2026-11-13 01:35 by Worker 116

One production build on 8771, closed afterwards (Q154). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2p/`: `crop-controls.png` (reference above, replica below; ×4) and the 6 sweep screens. Ink measured at min channel ≥ 160 against `watch169-1280-L`.

**6 rows: 6 PASS. F42 closed.** Every control's ink box matches the reference exactly, in both schemes.

| # | Reference | Replica at `e493100` | Score |
| --- | --- | --- | --- |
| F42a pause | 14×18 at 41,526 | 14×18 at 41,526 (Pause; toggles to Play) | PASS |
| F42d CC | 22×18 at 701,526 | 22×18 at 701,526, whole pixels | PASS |
| F42e gear | 20×22 at 750,524 | 20×22 at 750,524 | PASS |
| F42g full screen | 18×18 at 847,526, arms 8 | 18×18 at 847,526, arms 8 | PASS |
| Others | volume 22×20, autoplay 30×18, theatre 22×18 | unchanged and identical | PASS |
| Geometry and R1 | `b8a83d3` (`y2o`) | home and search 0 px; watch changes only at y524–546 (the control row). Builder's sweep against `c9e9f4a`: 1044 screens, 0 different | PASS |

Noted, not a fail under the icon ruling (box, ink box, stroke within ±1, colour): the gear and theatre carry about 30 % less bright ink than the reference (a slightly lighter stroke; the reference theatre also has a heavier lower edge).

### Rescore: F28d and F44 at `b8a83d3` (Worker 119), watch 1280 light and dark; scored 2026-11-13 01:15 by Worker 116

One production build on 8771, closed afterwards (Q154). Scripts: `y2n/score.mjs` and `y2j/sweep.mjs`. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2o/`: `crop-comments.png` (reference, replica; light, then dark; ×2) and the 6 sweep screens.

**4 rows: 4 PASS.**

| # | Reference | Replica at `b8a83d3` | Score |
| --- | --- | --- | --- |
| F28d placeholder | ink y114–124, x52–161 | y114–124, x52–159; line y135, first thread y168 unchanged | PASS |
| F44 Sort by | three-line glyph 20×14 at y63–76; count ink end to glyph +36 (light) / +35 (dark); words at glyph +30 | 20×14 at y63–76, +37 / +36, words +30. The builder's correction is accepted: by ink the gap is 36, not 34 (34 was measured from the count's box) | PASS |
| Geometry | `dda5504` (`y2n`) | home and search: 0 px in both schemes; watch changes only at x205–293, y779–798 (the Sort by row) | PASS |
| R1 | — | builder's sweep against `c9e9f4a`: 1044 screens, 1027 identical, 11 noise, 6 inventory, 0 different; stale `lib--link` and `lib--buttongroup` noise rows pruned | PASS |

### Rescore: F28 add-comment field (`c8197c7`) and F42 player glyphs (`dda5504`), watch 1280 light and dark; scored 2026-11-13 00:05 by Worker 116

One production build of `dda5504` (it contains `c8197c7`), served by `eval-serve.mjs` on 8771 only while `y2n/score.mjs` and `y2j/sweep.mjs` ran, then closed (Q154: 0 listeners after). The comment count was scrolled to y59, where `WC-1280` has it, so both images share coordinates. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2n/`: `crop-comments.png` (reference, replica; light then dark; ×2), `crop-controls.png` (reference above, replica below; ×4), `dda5504/score.txt` (field boxes), `dda5504/comments-focus-*.png`, and the 6 sweep screens.

**18 rows: 11 PASS, 6 FAIL, 1 n/m.**

| # | Criterion | Reference | Replica at `dda5504` | Score |
| --- | --- | --- | --- | --- |
| F28a | Field and line | line y135, x52–879 (828), 1 px | input 52,111 828×25; line y135 x52–879 | PASS |
| F28b | Line colour | `#CCCCCC` / `#3F3F3F` | `#CCCCCC` / `#3F3F3F` | PASS |
| F28c | Placeholder colour | `#606060` / `#AAAAAA` | `#606060` / `#AAAAAA` | PASS |
| F28d | Placeholder position | ink y114–124, x52–161 | ink **y117–127**, x52–159 (3 low) | **FAIL** |
| F28e | Avatar | ink y111–133 x16–39 | y112–133 x16–39 | PASS |
| F28f | Count to first thread | 109 (thread y168) | 109 (y168) | PASS |
| F28g | Focus | no capture | 2 px focus-colour line at y134–135 (`#4F5BD5` / `#A5ADFF`) | n/m |
| F42a | Play | pause (the frame is playing), ink 14×18 at x41 | play, 14×18 at **x43** (thr 160; 13×17 at thr 200) | **FAIL** |
| F42b | Volume | 22×20 at x89,525 | 22×20 at x89,525 | PASS |
| F42c | Autoplay and knob | 30×18; black knob, play glyph cut out | 30×18; same knob and glyph (within 1) | PASS |
| F42d | CC | 22×18 at y526, crisp | **22×20** at y525 (edge rows half-covered) | **FAIL** |
| F42e | Gear | 20×22 at y524 | **20×20** at y525 | **FAIL** |
| F42f | Theatre | 22×18 | 22×18 (box rule; outline not scored) | PASS |
| F42g | Full screen | 18×18; arms 8 long, stroke ≈3 diagonal / 2 straight | 18×18; arms **6** long, stroke ≈1.5 | **FAIL** |
| WA12b | Sort by (new) | lines glyph 20×14 at count end + 34; words at glyph + 30 | A–Z glyph **16×18** at count end **+ 51**; words at glyph + 28 | **FAIL** |
| F43 | `word--dark` | — | Cause bisected by Worker 115: putting only the `light-dark()` polyfill back makes `word--dark` identical (`.shots/w115-f43-revert.log`); the 632 px are Word's unavailable ribbon commands taking their dark ink (`w115-f43-crop.png`), i.e. the `454ebad` defect fix. Base refrozen at `c9e9f4a` after that (pressure-test-loop.md) | PASS (closed) |
| Geometry | Other screens | `c9e9f4a` sweep (`y2m`) | home and search light and dark: 0 px, 0 box changes; watch: only the control glyphs (y524–546), the knob svg and the comments section +1 high | PASS |
| R1 | Sweep | — | `result.json` 18:20Z: 1044 compared, 0 failed, 10 noise, 6 inventory, 1 load-only | PASS |

### Rescore: F11 plain Link at `c9e9f4a` (Worker 112), home, watch and search at 1280; scored 2026-11-12 22:45 by Worker 114

`effa247` and `c9e9f4a` built by `eval-serve.mjs` on 8771 (closed after). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2m/`: `probe-link.txt`, `names.txt`, `focus-{home,watch,search}.png`. Scripts: `y2j/probe-link.mjs`, `y2j/probe-names.mjs`.

**4 rows: 3 PASS, 1 FAIL.**

| # | Now | Evidence at `c9e9f4a` |
| --- | --- | --- |
| B2 / F11 | **PASS** | Every template anchor is core: 14 / 13 / 7 core `Link` (home / watch / search) and 17 inside core Navigation; none raw. Wordmark `data-presentation="plain"` 122×24 at x56, no link colour or line in either scheme |
| Geometry | PASS | Home, search and watch at 1280 in light and dark are pixel-identical to `effa247` (0 px on all 6) |
| Names and focus | PASS | Wordmark "Reelhouse Home"; each frame's link is named by its video title (accessibility tree). Tabbing to a frame gives core's 2 px ring, offset 2, following the frame radius (12 / 8 / 10), drawn outside and unclipped (overflow visible on the frame and its parent) |
| R1 | **FAIL** (F43 carried) | `result.json` (16:58Z): 1044 compared, 11 failed. 8 are the `light-dark()` fix; the 2 `lib--link` (88 and 90 px, scrollbar track from the appended story) are now declared in `regression-noise.json`. `word--dark` light (458 px) is still undeclared |

### Check: merge `974cee5` (Word into brand-map, base `eed781d`), YouTube 1280 light and dark; checked 2026-11-12 22:30 by Worker 114

`454ebad` and `974cee5` each built by `eval-serve.mjs` on 8771 (closed after), then `y2j/sweep.mjs` on home, search and watch in both schemes. **PASS:** every box and every pixel are identical on all 6 screens (`dl-brand-map/.shots/youtube-q145y-eval/y2l/`). R1 at `454ebad`: the builder reports `chat--images` identical when run alone and absent from later sweeps; it's absent at 16:40Z too, so it's closed as load noise. Other templates after the merge: see F43 (`word--dark`), which is still unattributed between this merge and `effa247`.

### Rescore: player controls at `effa247` (Worker 112), watch 1280 light, production build; scored 2026-11-12 22:20 by Worker 114

Built by `eval-serve.mjs` and served on 8771 only while `y2g/player.mjs` ran (0 listeners afterwards). Reference `watch169-1280-L`. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2k/`: `player.txt`, `player-rest.png`, `crop-controls.png` (reference above, replica below, ×2) and `crop-word-dark.png` (sweep base above, working copy below).

**4 rows: 2 PASS, 2 FAIL.**

| # | Now | Evidence at `effa247` |
| --- | --- | --- |
| WA3b (F29–F31) | **PASS** | Icon ink `#FFFFFF` by pixel (play and gear, both images); time `#EEEEEE` 14/21 w500; seek track 4 high (`rgba(255,255,255,.2)`), dot 12 in `#FF0033`; autoplay track white 30×18, knob black 14. Dark is the same player, so D9 now follows WA3c only |
| WA3c (new) | **FAIL** | Main's icon ruling scores stroke and colour, not the glyph's outline. The reference's control glyphs are filled (pause/play, speaker, the CC box with cut-out letters, theatre, full screen) and its autoplay knob carries a small play glyph; the replica's are 2 px outline strokes and the knob is plain |
| B | PASS | Core `c.switch.on-fill`, `on-fill-hover` and `on-thumb` default to the `color.map` roles controls.css read before, so other templates' switches are unchanged; the design, ikea and word `theme.css` lines restate those defaults. `check:generic` names `#FF0033` |
| R1 | **FAIL** (evidence) | `.shots/regression/result.json` (16:40Z): 1044 compared, 9 failed, 10 noise, 8 inventory. `chat--images` no longer differs (closed). 8 are the known `light-dark()` fix (refreeze owed by main). The 9th is new: `word--dark` light, 632 px (max channel 38) at x52–100 and x900–953, y86–123, the same in the parallel pass and invisible at ×2. It's undeclared: name the cause (this commit's Word `--c-switch-on-fill` line or the Word merge `974cee5`) and fix it or declare it |

### First score: 720, dark and states at `454ebad` (Worker 112), production build; scored 2026-11-12 22:00 by Worker 114

Built by `eval-serve.mjs` and served on 8771 only while the scripts ran (0 listeners afterwards). 720 is scored at 720 × 800, the size the references were captured at (`H-720`, `T-720`, `S-720`, `W-720`); dark at 1280 × 800 against the `*-D` captures. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2j/454ebad/`: `sbs-<route>-<w>-<scheme>.png` (reference left, replica right), `<route>-<w>-<scheme>.txt` (every box in the masthead and `main`) and `probe-dark.txt` (search capsule, voice, Sign in, Subscribe, pills, hover and focus). Scripts: `y2j/sweep.mjs`, `y2j/probe-dark.mjs`.

**720 (light and dark, same geometry): 6 rows, 6 FAIL.** The page keeps its 1280 layout instead of switching to the narrow one.

| # | Criterion | Reference (720) | Replica | Score |
| --- | --- | --- | --- | --- |
| N1 | Guide | none below the ≈792 breakpoint; content from x24 (search, hashtag grid) | the 72 mini guide stays; content from x96 | **FAIL** |
| N2 | Masthead | logo box 113 wide; field x245, 114 wide; button 64 at x359; voice x439; ⋮ x551.4; Sign in x599.4 | logo box 122; field group from x206, 273.4 wide; voice x495.4; end x551.4 (the end passes) | **FAIL** |
| N3 | Home grid | 2 columns, 328 wide at x24 and x368, gap 16; thumbnail 328×184.5 | 3 columns from x96 in a 600 column | **FAIL** |
| N4 | Chip row | one row at y66.5 from x24, Filters at the row's end (search) | wraps to 2 rows (72 high) | **FAIL** |
| N5 | Search rows | column x24, 672 wide; thumbnail 328×184; title at x368, 18/26 | column x96; thumbnail 255.2×143.6 | **FAIL** |
| N6 | Watch | player full-bleed 720×540 at x0 y56, square corners; title 12 below (y608, x16); up next below the primary column | player 688×387 at x16 y68, radius 12; title y467 | **FAIL** |

**Dark (1280): 10 rows; 8 PASS, 1 FAIL, 1 n/m.**

| # | Criterion | Reference (`*-1280-D`) | Replica | Score |
| --- | --- | --- | --- | --- |
| D1 | Page | `#0F0F0F` | template `#0F0F0F` | PASS |
| D2 | Text | primary `#F1F1F1`, secondary `#AAAAAA` (titles, meta, subscribers, snippet `#F1F1F1`) | same | PASS |
| D3 | Search capsule | field `#121212`, edge `#303030`; button `rgba(255,255,255,.08)`, edge `#303030` | same | PASS |
| D4 | Voice | `rgba(255,255,255,.10)` | same | PASS |
| D5 | Sign in | `#3EA6FF`, edge `rgba(255,255,255,.2)`, 104.6 at x1159.4 | same | PASS |
| D6 | Selected chip | `#F1F1F1` fill, `#0F0F0F` words; others `rgba(255,255,255,.1)` | same | PASS |
| D7 | Subscribe | `#F1F1F1` fill, `#0F0F0F` words, 94.5×40 | same | PASS |
| D8 | Tonal fills | action pills, description `rgba(255,255,255,.10)` | same | PASS |
| D9 | Player controls | as light | the light fails F29–F31 carry over (not counted twice in the open list) | **FAIL** |
| D10 | Thumbnail placeholder | pictures (judged by box only) | `#000000` placeholders; boxes as light | n/m |

**States (section 1 #3): 9 rows, all n/m.** No hover, focus, open-menu, Subscribed, liked, tooltip or expanded-description capture exists in `youtube-ref/shots/`, so none can be scored. Observed on the replica, for the record: mini-guide hover `rgba(0,0,0,.05)` / `rgba(255,255,255,.1)`; the card ⋮ visible at rest; the search field doesn't change on focus (no edge colour, no inset icon); keyboard focus is core's 2 px ring, offset 2 (`#4F5BD5` light, `#A5ADFF` dark).

### Rescore: player colour root cause at `454ebad` (Worker 112), watch 1280 light, production build; scored 2026-11-12 21:40 by Worker 102

Built from the commit by `eval-serve.mjs` (vite build with the commit's own config) and served on 8771, then closed. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2i/` (`player.txt`, `player-rest.png`, `crop-contextmatrix.png`).

| # | Now | Evidence at `454ebad` |
| --- | --- | --- |
| WA2 (F20) | **PASS** | Player fill `rgb(0,0,0)` in light. Cause confirmed: the Lightning CSS polyfill of `light-dark()` resolved tokens where they were declared; `css.lightningcss.exclude: Features.LightDark` keeps it native, and `check-build-css.mjs` guards it |
| WA3b (F29) | **FAIL**, narrower | Controls now use light ink: time text `#F1F1F1` (ref `#EEEEEE`, within 3), but the icon ink is `#F1F1F1` by pixel (play icon) where the reference's icons are `#FFFFFF` (14 off). Seek (F30) and the autoplay switch (F31, now the dark-scheme accent `#8590FF` on a dark thumb; ref white track) are unchanged |
| R1 | **FAIL** (evidence) | `result.json` (15:57Z): 996 compared, 962 identical, 9 noise, 16 inventory, **9** failed, not 8. The 8 library differences are the declared fix: `lib--contextmatrix`, `elevation`, `illustration` and `materials` in both schemes, each a box over the dark columns. `crop-contextmatrix.png`: the "Dark" and "Dark, more contrast" columns now render dark, as intended; they were light before (a real defect, now fixed). The 9th is `chat--images` light: 6 px in a photo (x661–775, y257–325), different in both the serial and parallel passes, so not load-only. It's undeclared: explain it and declare it, or fix it |
| B | PASS, with a note | The build change is generic and core-wide (the library and example vite configs, a core build check, and the consumer guide line in `packages/core/AGENTS.md`). The 8 changed library screens are a defect fix. Under Q150.2 they need the base refrozen after this is integrated (main's call, recorded with its commit), not a standing exception |

### First score: search at `3370740` (Worker 108), 1280 light; scored 2026-11-12 21:15 by Worker 102

Served by `eval-serve.mjs` on 8771 and closed afterwards. Reference `S-1280-L` (its first result is a sponsored row, so the reference's first plain result is at y405.7; the replica's is at y112). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2h/`: `search-1280.txt/.png`, `crop-row.png` (reference result above, replica below), `crop-chips.png` (same order) and `probes-search.json`.

**Search: 14 rows; 3 FAIL, 10 PASS, 1 n/m.**

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| SR1 | Masthead and mini guide | as home at 1280 | same; results column from x96 | PASS |
| SR2 | Filters row | x96, y56, 1160×56 | same | PASS |
| SR3 | Chips | 32 high, radius 8, 14/20 w500, gap 8, selected `#0F0F0F`/`#F1F1F1`; "All" is 40.4 wide at y66.5 (words + 12 + 12, no edge) | same, except "All" is 42.4 at y68: core Chip keeps a 1 px transparent edge on each side, so every chip is 2 wider and the row ends 11 px further right by "Live" | **FAIL** (also reopens home C2, which took its chip values from this capture) |
| SR4 | Filters button at the end | visible, unmeasured | 101.2×40 at x1154.8 | n/m |
| SR5 | Rows | from y112, 16 apart | y112, 409.3 (281.3 + 16) | PASS |
| SR6 | Thumbnail | 500×280.5–281.3, 16:9; radius ≈ 10 from the corner pixels (edge reaches the side 7–8 px down; spec open item 3) | 500×281.3, radius 10; badge 20 high, 8 from bottom and end | PASS |
| SR7 | Title | x612 (16 after the thumbnail), 18/26 w400 | x612, 18/26 w400; 48 kept for the menu | PASS |
| SR8 | Meta | 12/18 `#606060`, directly under the title | same | PASS |
| SR9 | Channel line | padding `12 0`; avatar 24; name 12/18 secondary, 8 after the avatar, at avatar + 4.5 | padding 12; avatar 24; name x644, at avatar + 3 | **FAIL** (1.5 high) |
| SR10 | Snippet | 12/18, under the channel line | 12/18, 36 high (two lines) | PASS |
| SR11 | Row menu | ⋮ at the row's top end | 40×40 at x1216, 8 above the title | PASS |
| SR12 | Row content | Under the snippet, a `4K` badge (outlined, about 12/18) and a chapters strip (a 32-high tonal bar, radius 8: a thumbnail, "N chapters" and a list, chevron) on rows that have them | neither built | **FAIL** (the sponsored row stays out of scope, section 1 #7) |
| SR13 | Probes | Clipping, scroll and context pass. VN1, VN3 and VN5 are reference values. SC6 (S2: one heading level for the five result titles) matches the reference's flat list; advisory | | PASS |
| SR14 | Boundary and sweep | Template only, no core change. Sweep `result.json` (15:34Z): 996 compared, 970 identical, 10 noise, 16 inventory, 0 failed | | PASS |

### Rescore: watch player at `d2ecf46` (Worker 108), 1280 light; scored 2026-11-12 20:55 by Worker 102

Served by `eval-serve.mjs` on 8771 and closed afterwards. Reference: `watch169-1280-L` (16:9, 880×495; the pointer is over the player and the video is playing). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2g/`: `player.txt` (every box under the player), `player-rest.png`, `player-hover.png`, `crop-controls.png` (reference above, replica below) and `probes-watch.json`.

**Watch: 19 rows (WA3 split into 3a geometry and 3b look); 3 FAIL, 15 PASS, 1 n/m.** Home is unchanged: 1 FAIL (B2).

| # | Now | Evidence at `d2ecf46` (reference) |
| --- | --- | --- |
| WA2 | **FAIL** | Player still `#F4F4F6` in light (box fill `rgb(244,244,246)`); ref black. Not changed since `c472b8e` |
| WA3a | PASS | Controls box from y501, 62 high; seek row 856×6 at 28,501; play 40 round at 28,515; volume 40 round at 80; time pill at x128, 40 high; right pill 248×40 at 636, round ends, `0 4` padding, five 48-wide slots at 640/688/736/784/832; every fill `rgba(0,0,0,.3)` (ref the same boxes, same fill) |
| WA3b | **FAIL** | (1) Icons and time text compute `#0F0F0F` (dark ink on the light player); ref icons white and time `#EEEEEE`. (2) Seek track 2 high (y503–504); ref 4 high (y502–505), the rest of the line white ≈ 20 % over the picture. (3) Seek dot 16 at x28, `#FF0000`; ref dot 12×12 (x28–39, y498–509) and the played line `#FF0033` by pixel. The region spec's `#FF0000` is the logo value, not the player's, so `check:generic` should name `#FF0033` too. (4) The autoplay switch track is core's accent `#4F5BD5`; ref white track with a dark thumb (builder knows). Pause versus play glyph: the reference is playing; accepted as a state difference |
| WA12 | **FAIL** | The add-comment field is still boxed (F28) |
| WA17 | PASS | Clipping, scroll and context pass. New VN3 items (slider fill and thumb at depth 3) are the reference's seek line. SC2, SC3 and SC16 as at `c472b8e` (SC3 advisory) |
| B | PASS | New core `--material-media-control` and a captions icon, recorded in templates-and-library.md. Sweep `result.json` (15:11Z): 996 compared, 971 identical, 9 noise, 16 inventory, 0 failed |

### Rescore: watch and home at `c472b8e` (Worker 108), 1280 (home also with the drawer and at 1440), light; scored 2026-11-12 20:30 by Worker 102

Served under Q153 by `eval-serve.mjs` on 8771 and closed afterwards (0 listeners). Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2f/`: `watch-1280*.txt/.png`, `crop-comments.png` (WC-1280-L | replica), `rep-*` (home), `probes-home.json` and `probes-watch.json`.

**Home: 49 rows; 1 FAIL (B2), 46 PASS, 2 n/m.** M9 passes: Sign in is 104.6 at x1159.4 (1280) and x1319.4 (1440), and ⋮ is at x1111.4. B2: the search width is now core `size.search-width`, set in the theme; three raw `<a>` remain while core has `Link`.

**Watch: 18 rows; 4 FAIL, 13 PASS, 1 n/m.**

| # | Now | Evidence at `c472b8e` (reference) |
| --- | --- | --- |
| WA2 | **FAIL** | The player still renders `#F4F4F6` in light: the pixel at its centre and the box's computed fill are both `rgb(244,244,246)`. `site.css:92` paints it with `--color-bg-sunken`, whose theme value is `{p.base.50}` in light and `#000000` only in dark. The theme note says "the player part takes the dark scheme", but nothing puts the player in the dark scheme. Ref `#000000` in both schemes |
| WA3 | **FAIL** | No control bar (open, F21) |
| WA5 | PASS | Avatar at title + 36 (611); name and Subscribe at avatar + 2 (ref 1.5); pills at avatar + 4 (ref 3.5) |
| WA7 | PASS | Words `#F1F1F1` on `#0F0F0F`, 94.5×40 |
| WA8 | PASS | Like 90.7 (its width follows the count's words) + dislike 57 (ref 56); the group ends at x704 (ref 704); inner corners square |
| WA9 | PASS | Share x712, Download x760, Save x808, ⋯ x856, ending at x896 (ref 712, 760, 808, 856) |
| WA12 | **FAIL** | Positions pass: count 28 high at y59, add-comment avatar 24, first thread at y167 (ref 168). The add-comment field is a boxed pill 40 high; the reference is an underline-only field with no box (`crop-comments.png`). The builder notes core has no underline variant: a generic core seam |
| WA14 | PASS | Comment actions 32×32 round, the first at x60 |
| WA15 | PASS | Up-next text at x1144 |
| WA17 | PASS | Clipping, scroll and context pass. Spacing SC2 (12 above the title, 8 below the title box to the avatar) and noise VN1, VN3 and VN5 match the reference. New SC3 (S2): each comment thread has 16 inside and 16 between threads; the reference's thread spacing isn't measured, so this is advisory |
| B | PASS | 3 new core seams (`c.button.strong-text`, `c.button-group.icon-padding-inline`, `size.search-width`) with defaults unchanged, recorded in templates-and-library.md:177–179. Sweep `result.json` (14:45Z): 996 compared, 970 identical, 10 noise, 14 inventory, 2 failed (`lib--buttongroup`, both schemes), re-run in `result-partial.json` as inventory with 0 px outside the scrollbar track. 0 different |

Unchanged rows pass as at `480e81e`; WA11 (comments header text size) stays n/m.

### Rescore: home and first score of watch at `480e81e` (Worker 105), 1280 light; scored 2026-11-12 19:55 by Worker 102

Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2e/`: home `rep-light.json` and `nav.mjs` (the Navigation-based guide in all three states), `drawer.png`; watch `dump.mjs` with `watch-1280.txt/.png` (at rest) and `watch-1280-comments.txt/.png` (scrolled so the comments header sits at y59, as in `WC-1280-L`), `crop-player-owner.png` (W-1280-L above, replica below), and `probes-home-1280.json` and `probes-watch-1280.json`.

**Home: 49 rows; 2 FAIL, 45 PASS, 2 n/m.** The guide and mini guide now use core Navigation (`presentation="mini"`) with the same geometry: mini entries 64×76 from y60 with icon 24,76 and label 22.5,106; guide entries 204×40 at x12 with icon 24 and label 72, w500 when current. Spacing from separator to content in the drawer is 20 to the prompt and 23 to a section title (ref 20 and 23). The sweep (14:06Z) shows 996 compared, 974 identical, 10 noise, 12 inventory (`lib--navigation` added) and 0 failed. The core Navigation change is generic, keeps its defaults, and is recorded in templates-and-library.md:176 (B1 PASS).

| # | Now | Evidence |
| --- | --- | --- |
| M9 | **FAIL** | Unchanged from `8185344`: Sign in is 106.6 at x1157.4 (ref 104.6 at 1159.4) (F16) |
| B2 | **FAIL** | Narrower now. `inline-size: min(100%, 37.5rem)` is still a raw size; the `82.0625rem` and `64rem` media queries are breakpoints, accepted. Three raw `<a>` (the wordmark and two picture links) remain while core has `Link` |

**Watch (Y.2b): 18 rows; 9 FAIL, 8 PASS, 1 n/m.** Reference `W-1280-L` (its player is a 4:3 video, 880×660; the replica's 16:9 player is 880×495 as the spec computes, so vertical positions are compared from the title down) and `WC-1280-L` (scrollY 900).

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| WA1 | Columns | primary x16, content 880; secondary x912, 352 | 16 / 880; 912 / 352 | PASS |
| WA2 | Player frame | 880 wide at y68, rounded corners (corner pixel white), black `#000000` | 880×495 at 16,68, radius 12, `#0F0F0F` | **FAIL** (fill) |
| WA3 | Player control bar at rest | Progress line, play, volume, time pill, chapter, and on the right autoplay, CC, settings, theatre, full screen (spec section 1 #4) | None | **FAIL** |
| WA4 | Title | 12 below the player, 20/28 w700 | 12 below, 20/28 w700 | PASS |
| WA5 | Owner row placement | avatar 40 round at title + 36; name at avatar + 1.5; Subscribe at avatar + 1.5; action pills at avatar + 3.5 | avatar at title + 40, name, Subscribe and pills all at avatar + 0 | **FAIL** |
| WA6 | Owner text | name 16/22 w500; subscribers 12/18 `#606060`, 22 below the name | same | PASS |
| WA7 | Subscribe | 94.5×40, round, 14 w500, fill `#0F0F0F`, words `#F1F1F1` | 94.5×40, round, fill `#0F0F0F`, words `#FFFFFF` | **FAIL** (words colour; the gap before it is n/m: the reference text block's width isn't measured) |
| WA8 | Like and dislike | one segmented pill, like 90.2 + dislike 56 (146.2), inner corners square, tonal | like 92.7 + dislike 40 (132.7), inner corners square | **FAIL** (dislike 40, not 56) |
| WA9 | Action set | Like/dislike, Share, two more 40×40 circles (at x760 and x808), then ⋯ at x856; 8 apart, ending at x896 | Like/dislike, Share, ⋯; ending at x896 | **FAIL** (two circles missing) |
| WA10 | Description | 12 below the owner row (title + 91), 880 wide, radius 12, tonal, padding 12; stats 14/20 w500, body 14/20 | title + 92, same box and type | PASS |
| WA11 | Comments header | 24 below the description; text size unmeasured (spec open item 3) | 24 below; 20/28 w700 | n/m |
| WA12 | Header to first thread | The header block, with the add-comment row, is 77 high (y59–136); first thread at y168 | header 40, add row to y163; first thread at y187 (+19) | **FAIL** |
| WA13 | Thread | avatar 36; text at +52; author 12/18 w500 | 36; +52; 12/18 w500 | PASS |
| WA14 | Comment action buttons | 32×32 radius 16, the first at x60 (8 left of the text) | 36×36 at x68 | **FAIL** (builder knows) |
| WA15 | Up-next text inset | text 12 after the thumbnail (x1144) | x1140 (8 after) | **FAIL** |
| WA16 | Up-next rows | 352 wide, thumbnail 220×123.8 radius 8, pitch ≈ 132; title 14/20 w500; meta 12/18 `#606060` | same; pitch 131.8 | PASS |
| WA17 | Probes (watch) | Clipping, scroll and context pass. Spacing SC2 (12 above and below the title) matches the reference. SC16 (up-next titles near their room) is S2 and matches the reference's 2–3-line titles. Noise VN1, VN3 and VN5 are reference values, apart from the player fill counted in WA2 | | PASS |
| WA18 | Masthead and guide | Same masthead; no guide on watch at 1280 | same; no guide | PASS |

### Rescore: home at `8185344` (Worker 105), 1280 at rest, 1280 with the drawer open, 1440; light; scored 2026-11-12 18:50 by Worker 102

Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2d/` (`rep-light.json` and `rep-*.png` from `y2c/measure3.mjs`, `probes-1280-light.json`, `signin.mjs`).

**Result: 49 rows; 2 FAIL, 45 PASS, 2 n/m (C4, C5).** Since `92acbdc`, M3, GD1, D2, D3 and T1 pass.

| # | Now | Evidence at `8185344` (reference) |
| --- | --- | --- |
| M3 | PASS | Logo box 122 from x56 (ref 123); field at x321.7 (ref 322) and at x401.7 at 1440 (ref 402); text at x338.7 (339); button at x856.7 (858, 65 vs 64 wide); voice at x937.7 (938) |
| M9 | **FAIL** | Box 106.6 (ref 104.6, +2) at x1157.4 (ref 1159.4), so ⋮ sits at x1109.4 (ref 1111.4). The blue ink spans x1177–1247 (ref 1176–1246), so the words and icon match; the extra 2 px is on the left, inside the box. The parts are 1 + 15 + icon 24 + gap 8 + words 42.6 + 15 + 1. Make the box 104.6 with the ink where it is (likely a 6 gap or 14 start padding, read from the reference) |
| GD1 | PASS | First mini entry at y60, padding `16 0 14`, icon at 24,76, label at 22.5,106 and 26.9 wide (ref 24,76; 22.5,106; 26.9) |
| D2 | PASS | Scrim reads `rgb(127,127,127)` on white (ref 127) |
| D3 | PASS | Prompt text ink starts at x33 (ref 33) |
| T1 | PASS | Registry Roboto (`Roboto Variable`); Sign in's words are 1 px off the reference's ink at both ends |
| P1–P5 | PASS | Spacing, clipping, scroll and context pass; noise findings VN1, VN3 and VN5 are each reference values (as at `92acbdc`) |
| R1, R2 | PASS | `result.json` (13:11Z): 996 compared, 976 identical, 10 noise, 10 inventory, 0 failed; only `youtube` excluded |
| B1 | PASS | No core change in this commit (template files and the agent index only) |
| B2 | **FAIL** | Raw values `37.5rem`, `0.625rem`, `line-height: 1.6`, `82.0625rem` in `site.css`; guide and mini-guide entries still raw `<a>` (Navigation seam, the builder's next packet) |

Every other row passes as at `92acbdc`.

### Rescore: home at `92acbdc` (Worker 103), 1280 × 800 at rest, 1280 with the drawer open, 1440 × 900; light; scored 2026-11-12 17:55 by Worker 102

Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2c/`: `measure3.mjs` and `rep-light.json` (computed boxes for all three states), the `rep-*.png` screenshots, `crop-masthead.png` (H-1280-L above, replica below), `crop-mini.png` (H-1280-L | replica), `crop-drawer.png` (G-1280-L | replica), `gestalt-1280.png` (T | replica | H) and `probes-1280-light.json`. New references: `G-1280-L` for the drawer, `H-1440-L` and `C-1440-L` for 1440.

**Result: 49 rows (the 44 below plus D1–D3 and W1–W2); 6 FAIL, 40 PASS, 3 n/m.** Since `c4c7aa7`: G1, M2, M4–M8, M10, GD3, V2, V4, V8, V10, P1 and R1 now pass.

| # | Now | Evidence at `92acbdc` (reference) |
| --- | --- | --- |
| G1 | PASS | 72 mini guide; grid from x96 with 3 items 376 wide at 96/488/880 (T-1280-L 96/488/880, 376) |
| M2, M8, M10 | PASS | Guide, ⋮ and voice buttons 40×40 and round; every masthead icon 24 |
| M3 | **FAIL** | Wordmark 148.7 wide from x56 (ref logo box 123). It pushes the whole search group right by 6.8 at both widths: field x328.8 (ref 322), and x408.8 at 1440 (ref 402) |
| M4–M7 | PASS | Capsule 535×40 (ref 536), left end round, `#FFFFFF`, edge `rgba(136,136,136,.2)`; text 17 in (ref 17); button 65×40 (ref 64), right end round, `#F8F8F8`, edge `#D3D3D3`, icon 24; voice 40 round with `rgba(0,0,0,.05)`, 16 after the button. Their x offsets come from M3 |
| M9 | **FAIL** | No fill, round end, 1 px `rgba(0,0,0,.2)`, 14 w500 `#065FD4`, padding 15, 24 icon in the link colour all pass; width 107.1 (ref 104.6, +2.5), so ⋮ sits at x1108.9 (ref 1111.4). Probably the face: Roboto Flex words are wider than Roboto's (T1) |
| GD1 | **FAIL** | Mini guide 72 wide with padding-inline 4, entries 64×76 radius 10, icon 24, label 10/16 one line all pass. But the first entry starts at y56 (ref 60), so icon y72 (ref 76) and label y104 (ref 106); padding is `16 0 12` (ref `16 0 14`) |
| GD3 | PASS | Icon 24 at x24, y+8; label at x72, 14/20; w500 when current, w400 otherwise (G-1280-L, C-1440-L) |
| V4, P1 | PASS | Rows 32 apart (479.5 − 447.5); the spacing probe passes every row |
| V8 | PASS | Title 16/22, two lines 44; meta 4 below |
| V10 | PASS | ⋮ MenuButton 40×40 round at x444, 8 above the avatar's top, icon 24 (T-1280-L 444, avatar − 8) |
| P2 | PASS | VN1 (search, voice, Sign in, chip fills and edges), VN3 (badge at depth 3) and VN5 (5 fills: page, `#F8F8F8`, tonal, frame, badge) are each a reference value |
| R1 | PASS | `result.json` (12:16Z): 996 compared, 976 identical, 10 declared noise, 10 inventory, 0 failed; `lib--progress` 0 px in both schemes; 1 load-only (`harbour--home` dark) identical alone |
| B1 | PASS | `c.button.link-edge` and `c.field.action-fill` / `-edge` / `-padding-inline` default to the existing button values; the tone-link fill fix restates the rule at higher specificity. Recorded in templates-and-library.md:171–172; the sweep shows the defaults are unchanged |
| B2 | **FAIL** | 0 core tokens set in part CSS. Raw values left: `37.5rem`, `0.625rem`, `line-height: 1.6`, `82.0625rem`. The guide and mini-guide entries are still raw `<a>` (the builder's known core seam: Navigation has no icons or mini form) |
| D1 | PASS | Drawer: 240 wide over the content from y0, its own 56 head with the guide button and wordmark, sections from y56, entries as GD2–GD5 (G-1280-L) |
| D2 | **FAIL** | Scrim over the content reads `rgb(136,136,137)` on white (ref `rgb(127,127,127)`, i.e. black at 50 %). Now `rgba(17,17,20,.5)` |
| D3 | **FAIL** | The guide's sign-in prompt text starts at x29 (ref x33) |
| W1 | PASS | 1440: persistent 240 guide, content and chips from x256 (H-1440-L gridContents 256), masthead as at 1280 apart from M3 |
| W2 | PASS | 1440: 3 columns 378.7 wide, 16 apart, rows 32 apart |

Unchanged: M1, GD2, GD4–GD6, C1–C3, V1, V3, V5–V7, V9, V11, P3–P5, R2 and B3 pass; C4, C5 and T1 are n/m.

### Rescore: home, 1280 × 800, light (commit `c4c7aa7`), scored 2026-11-12 17:35 by Worker 102

Same route, rows and method as Y.2a below. Evidence: `dl-brand-map/.shots/youtube-q145y-eval/y2b/` (`rep-home-1280-light.*`, `gestalt-home-1280-light.png`, `crop-masthead.png`, `crop-card.png`, `probes-home-1280-light.json`, `probe2.mjs`).

**Result: 44 rows; 19 FAIL, 22 PASS, 3 n/m.** Fixed: V6 and R2. Regressed: V8 and R1. Every other Y.2a score stands; the rows that moved, or whose evidence changed, are below.

| # | Was | Now | Evidence at `c4c7aa7` |
| --- | --- | --- | --- |
| M2, M8 | FAIL | FAIL | Now 40×40 at y8 (settings at x1110.9), but still radius 8, not round |
| M3 | FAIL | FAIL | Wordmark at x56 now, but still 153.6 wide (ref 123); the mark is now a blank black tile, its play glyph gone |
| M4 | FAIL | FAIL | Joined capsule (`999 0 0 999`), but the field is 560 at x332.2 (ref 536 at x322), fill `#E9E9ED` (ref `#FFFFFF`), border `#D6D6DD` |
| M5 | FAIL | FAIL | Text starts at x345.2 (ref 339) |
| M6 | FAIL | FAIL | Joined to the field, but 40×40 at x892.2 (ref 64×40 at x858), radius `0 8 8 0` (ref `0 40 40 0`), fill `#E9E9ED` (ref `#F8F8F8`) |
| M7 | FAIL | FAIL | Still radius 8, no fill |
| M9 | FAIL | FAIL | Width 105.1 and link-coloured words now pass, but the fill is still `#E9E9ED`, radius 8, border `#D6D6DD`. Core defect: `[data-tone='link'] { background-color: transparent }` (controls.css:64) loses to `[data-emphasis='default']` (controls.css:187), which has the same specificity and comes later, so the new tone never clears the fill |
| M10, GD3 | FAIL | FAIL | Every icon still 20 |
| GD1, V2, G1 | FAIL | FAIL | Still the persistent 240 guide; items 325.3 at x256 |
| V4, P1 | FAIL | FAIL | Rows still 36 apart (445.4 − 409.4). Spacing SC1 again, plus SC6 (S2, levels 12 and 36) |
| V6 | FAIL | **PASS** | 39.1×20, 12/18 w500, white on `rgba(0,0,0,.6)` (`oklab(0 0 0 / .6)`), 8 from bottom and end |
| V8 | PASS | **FAIL** | Regression: `Heading lines` sets the title to 16/19.2, so two lines are 38.4 (ref 44); the meta starts 0 below the title (ref 4) at y369.4 instead of y379 |
| P2 | PASS | PASS | VN1 (chip fills) and the new VN3 (badge at depth 3 on the frame) both match the reference |
| R1 | PASS | **FAIL** | `result.json` (11:49Z): 996 compared, 977 identical, 10 declared noise, 4 inventory, 5 failed. `result-partial.json` re-runs 4 (`lib--badge`, `lib--heading`, both schemes) as inventory with 0 px outside it. `lib--progress` light (75 px at y893–899, and different again in the parallel pass) is neither declared nor re-run, so "0 different" isn't shown |
| R2 | FAIL | **PASS** | Base refrozen at `5fc801a` (11:36Z, 0 dirty files); `exclude: youtube` only; 28 Slack screens swept |
| B1 | PASS | PASS | 3 more core changes, each opt-in and recorded (templates-and-library.md:166–168): Badge `emphasis="media"` with `--material-media-label`, Button `tone="link"`, Heading `lines`. Defaults unchanged (sweep). The tone has the defect in M9 |
| B2 | FAIL | FAIL | 0 core tokens set in part CSS now (moved to `theme.json`). Still 11 raw values (`-0.02em`, `1.75rem`, `1.25rem`, `37.5rem`, `0.375rem`, `0.625rem`, `2.25rem`, line-heights `1.375`, `1.4286` ×2), and the guide and card are still hand-built |

### Y.2a home, 1280 × 800, light (commit `42a5ad8`), scored 2026-11-12 17:20 by Worker 102

Route `http://127.0.0.1:8768/site.html?chrome=none#/app/youtube/home`, headless Chromium, DPR 1, no pointer. References: `H-1280-L` (masthead, mini guide; its feed is the signed-out empty nudge), `T-1280-L` (the grid at 1280 with the mini guide), `G-1280-L` (the guide drawer's geometry), `C-1280-L`. Evidence (git-ignored): `dl-brand-map/.shots/youtube-q145y-eval/y2a/`: the replica's screenshot and computed boxes (`rep-home-1280-light.*`), the full-window composite `gestalt-home-1280-light.png` (H | T | replica), the crops `crop-masthead.png` (reference above, replica below) and `crop-card.png`, the probe results `probes-home-1280-light.json` and the scripts that made them.

**Result: 44 rows; 19 FAIL, 22 PASS, 3 n/m.** (Corrected 17:35: first published as 43 rows with 21 PASS, a counting slip.)

#### Full-window gestalt

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| G1 | Same window reads as the same page | 72 mini guide; grid from x96 with 3 items 376 wide | Persistent 240 guide; grid from x256 with items 325 wide; the frame's proportions differ at first glance | FAIL |

#### Masthead

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| M1 | Bar | 56 high, padding-inline 16, no border, page fill | 56, 16, none, page fill | PASS |
| M2 | Guide button | 40×40 at 16,8, round | 44×44 at 16,6, radius 8 | FAIL |
| M3 | Logo box | x56, 123 wide (search starts x322) | wordmark x60, 153.6 wide (search starts x329.3) | FAIL |
| M4 | Search box | 536×40 at x322; radius `40 0 0 40`; fill `#FFFFFF`; border `hsla(0,0%,53.3%,.2)` | 536×40 at x329.3; full pill (999); fill `#E9E9ED`; border `#D6D6DD`; not joined to the button | FAIL |
| M5 | Search text | starts x339, 16/22 w400 `#0F0F0F` | starts x342.3, 16/24 | FAIL |
| M6 | Search button | 64×40 at x858, radius `0 40 40 0`, fill `#F8F8F8`, border `#D3D3D3` | 64×40 at x865.3, radius 8, fill `#E9E9ED`, border `#D6D6DD`, a separate shape | FAIL |
| M7 | Voice search | 40×40 round at x938, fill `rgba(0,0,0,.05)` | 40×40 at x945.3, radius 8, no fill | FAIL |
| M8 | Settings ⋮ | 40×40 round at 1111,8 | 44×44 at 1101,6, radius 8 | FAIL |
| M9 | Sign in | 104.6×40, radius 20, 1 px `rgba(0,0,0,.2)`, no fill, 14 w500 `#065FD4`, padding `0 15`, person-in-circle icon in the link colour | 110.9×40, radius 8, fill `#E9E9ED`, border `#D6D6DD`, 16 w500 `#0F0F0F` | FAIL |
| M10 | Icon boxes | 24 (guide, search, mic, ⋮, sign-in) | 20 everywhere | FAIL |

#### Guide

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| GD1 | Guide at 1280 | Persistent 72 mini guide (entries 64×76, radius 10, icon 24 at y+16, label 10/16 one line); the 240 guide is a drawer over the content, opened by the guide button | Persistent 240 guide; no mini guide; no drawer | FAIL |
| GD2 | Expanded entry box | 204×40 at x12, radius 10 | 204×40 at 12, radius 10 | PASS |
| GD3 | Entry icon and label | icon 24 at x24; label at x72, 14/20 | icon 20 at x24; label at x68 | FAIL |
| GD4 | Active entry | fill `rgba(0,0,0,.05)` | `rgba(0,0,0,.05)` | PASS |
| GD5 | Section padding | 12 (entries 204 wide) | `12 24 12 12`, entries 204 | PASS |
| GD6 | Section title | 16/22 w500, padding `6 12 4` | same (declared in site.css) | PASS |

#### Chip bar

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| C1 | Row | 56 high under the masthead | 56 | PASS |
| C2 | Chip | 32 high, radius 8, padding `0 12`, 14 w500, gap 8 | 32, 8, 12, 14 w500, gap 8 | PASS |
| C3 | Selected chip | fill `#0F0F0F`, text `#F1F1F1` | same | PASS |
| C4 | Resting chip fill | unmeasured on a chip (spec borrows the pills' tonal fill) | `rgba(0,0,0,.05)` | n/m |
| C5 | Chip bar on home | not visible signed out (spec gap) | present | n/m |

#### Video grid and card

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| V1 | Columns at 1280 | 3 | 3 | PASS |
| V2 | Item width and starts | 376 at x96, 488, 880 | 325.3 at x256, 597.3, 938.7 (follows GD1) | FAIL |
| V3 | Column gap | 16 | 16 | PASS |
| V4 | Row gap | 32 (`--ytd-rich-grid-row-margin: 32px` on `H-1280-L` and `T-1280-L`; rows measured 32) | 36 (the spec's "home declares 36" is contradicted by `H-1280-L`'s own variables) | FAIL |
| V5 | Thumbnail | 16:9, radius 12 | 325.3×183, radius 12 | PASS |
| V6 | Duration badge | 8 from bottom and end; 20 high, radius 4, padding `1 4`, 12/18 w500 white on `rgba(0,0,0,.6)` | 8 and 8; 21 high, radius 4, padding `0 4`, 14/21, opaque `#55555F` | FAIL |
| V7 | Avatar | 36 round, 12 below the thumbnail | 36 round, 12 below | PASS |
| V8 | Title | x+48, 16/22 w500, 2 lines (44), padding-end 24 | x+48, 16/22 w500, 44, 24 | PASS |
| V9 | Meta lines | channel, then views · age; 14/20 w400 `#606060`; 4 below the title | same | PASS |
| V10 | Card menu | 40×40 round ⋮ at the item's top end beside the title, visible at rest (`T-1280-L`, `C-1280-L`) | absent | FAIL |
| V11 | Grid top | 24 below the chip row | 24 | PASS |

#### Type

| # | Criterion | Reference | Replica | Score |
| --- | --- | --- | --- | --- |
| T1 | Face | Roboto (in the font registry as `roboto`) | Roboto Flex; the row allows an OFL face close to Roboto, but label widths (±2) can't be checked without matching copy. Recommend `roboto` | n/m |

#### Framework probes (`tools/*-probe.js`, whole page)

| # | Probe | Result | Score |
| --- | --- | --- | --- |
| P1 | Spacing | SC1 S3: the grid's row gap 36 is off the scale (same root as V4); every other row passes | FAIL |
| P2 | Visual noise | VN1 flags resting fills on the 22 chips; the reference shows the same tonal chips, so it's reference fidelity, not noise; VN2–VN6 pass; 2 strokes, 3 fills, 1 shadow | PASS |
| P3 | Clipping | CL1–CL4 pass (the two-line title is on the allow-list) | PASS |
| P4 | Scroll | SB1–SB9 pass: guide and feed are ScrollAreas | PASS |
| P5 | Context | CX1–CX4 pass | PASS |

#### Sweep (Y.4) and boundary (Y.3)

| # | Criterion | Evidence | Score |
| --- | --- | --- | --- |
| R1 | Builder's sweep claim (920: 892 identical, 10 noise, 18 inventory, 0 different) | `.shots/regression/result.json` (11:26Z): 920 compared, 892 at 0 px, 10 declared noise, 14 inventory, 4 failed (`lib--chip`, `lib--clipping`, light and dark); `result-partial.json` (11:27Z) re-runs those 4 with their declarations: inventory, 0 px outside the scrollbar track. The numbers reconcile | PASS |
| R2 | Sweep scope (Q150.2, Q150.4) | `exclude: word, slack, youtube`. Slack is signed off (5fc801a) and must be swept; only the template under construction may be excluded. The base (`.shots/base-dist/BASE.json`, 38236f8, frozen 08:06) predates Slack's sign-off, so Slack is unguarded | FAIL |
| B1 | Core changes generic, defaults unchanged | One: `c.chip.selected-text`, default `{color.text}` (every chip unchanged, confirmed by the sweep); recorded in templates-and-library.md | PASS |
| B2 | Template layer: no literal core-token overrides, raw values or hand-built core components (scorecard LG, F) | `parts/layouts/site.css` sets 11 core tokens in part CSS (`--c-field-radius`, `--c-field-size`, `--c-button-size` ×4, `--c-badge-radius`, `--c-badge-padding-inline`, `--size-icon-sm` ×2, `--type-label-size`); 14 raw values (`1.75rem`, `1.25rem`, `0.75rem`, `37.5rem`, `4rem`, `0.375rem`, `0.625rem`, `2.25rem`, `-0.02em`, line-heights `1.375` ×2 and `1.4286` ×2); guide entries hand-built as links although core has Navigation and Rail; the video card hand-built although core has Card | FAIL |
| B3 | No inline decorative SVG | 0; every glyph is `Icon` | PASS |

## 3. Fail log

### Click-through (Q156)

**Final batch score, menus and controls, at `4201072` (packet C; Worker 123, 2026-11-13 10:20).** Click-through first, then hand checks of every "DOM only" row, then the look in light and dark. Logs: `.shots/q156/4201072.txt`, `hand.mjs` and `hand2.mjs`; screenshots `.shots/q156/4201072-*.png`. The screenshots of open menus cover the card menu, Settings, the guide, Filters and Sort by, in light and dark.

| Area | Result |
| --- | --- |
| Links: cards, results, up next, logo and guide | **PASS.** In `site.html` and the library, every one goes to the right view or video (`?v=` checked by title). There are no error pages and 0 page errors. |
| Search | **PASS.** Enter and the Search button go to `search?q=…`, and `?q=guitar` shows only the guitar video. The field keeps the query. Core gap G1 covers the query. |
| Pictures | **PASS.** Thumbnails, the player, up next, and now the channel avatars: home has 24 images, search 10 and watch 13, with 0 404s. The pictures the library page leaves unloaded are lazy-loaded below the frame, which is correct. |
| Menus | **PASS.** Each one opens: the guide, masthead Settings, Sign in, the card ⋮ and the watch ⋯ menus, Filters (upload date and type), Sort by (Top comments ✓, Newest first) and the player's Settings. G2 is the core MenuButton avatar, chevron and `iconEnd`. |
| Controls | **PASS.** All of these respond: the chips select, Subscribe → Subscribed, and like and dislike toggle. Pause → play, Mute → Unmute and CC toggle. The seek bar moves (from the keyboard 0 → 1, and a click at x400 gives 43). Autoplay toggles, Show chapters expands and the comment field takes focus. |
| Share, Download, Save, voice search | **PASS (an honest stand-in).** Share shows a "Link copied" notification. The others show a notification rather than a dialog, which is acceptable signed out. |
| Theatre mode, Full screen | **Accepted stub.** They show "This page isn't part of the replica yet." Q156's list doesn't include them, and no new views are allowed (Q158). |
| Look | **PASS.** No visible difference from the references at normal viewing in light or dark. Titles no longer hyphenate (`hyphens: manual` through G3, `c.heading.hyphens`). |
| Regression | The builder's one batch sweep found 0 different of 1044 screens (Q159: once per batch, not re-run by the evaluator). |

**Verdict: PASS.** Y.2 is signed off (§4). Time for this batch: rebuild 3 min, click-through 7 min, hand checks 6 min, writing 5 min.

**Builder, packet B avatars + packet C, at `4201072` (Worker 125, 2026-11-13).** For the evaluator: channel avatars (11 pictures), search `?q=` carried into results (G1b), every menu from MenuButton (Settings with Appearance → theme, Sign in → Create, Notifications, Account on the avatar; card, result and up-next more menus; Sort by; Filters; player Settings → speed), and the controls (guide, chips, Subscribe, like/dislike pressed pair, comment like/dislike, play/pause, mute, captions, full screen, Show chapters). Hyphenated titles fixed by core G3 (`c.heading.hyphens`). Builder's own click-through: `dl-brand-map/.shots/w125-controls.mjs <origin>` 31/31 pass, log `.shots/w125-controls.log`; links `.shots/w125-links.log`. **Time:** avatars 12 min (generation in the background), build of C 35 min, checks 6 min, click-through 10 min, sweep see below; C took over 20 minutes because it touched every control on three screens and two core seams at once. Sweep vs `c9e9f4a` (`--exclude youtube`, 18 min): 1044 screens, 1018 identical, 10 noise, 16 catalogue inventory (MenuButton's new story among them), 0 different.

**Batch score, links and pictures, at `7dd73d8` (packets A and B; Worker 123, 2026-11-13 09:15).** The click-through came first, then a look at the pictures; there are no pixel rows (Q158). Log: `.shots/q156/7dd73d8.txt`; screenshots `.shots/q156/7dd73d8-*.png`.

| Area | Result | Level |
| --- | --- | --- |
| Links: card, result and up-next → watch `?v=…` | **PASS.** Each one opens its own video (`v1`, `v2` and `v7` checked by title) in `site.html` and in the library, with no "no template layout" anywhere. | Core gap G1 closed (`e4d6540`) |
| Links: logo and guide Home → home | **PASS.** They go home from search and watch. On home they do nothing, which is expected. | |
| Search submit → results for the query | **FAIL.** Enter goes to `#/app/youtube/search`, but the query isn't in the address and the results don't change. | **Core gap** (a route that carries a query: G1's seam for `?q=`) |
| Thumbnails: home grid, search results, up next | **PASS.** 12 pictures on home and watch and 5 on search, 0 404s. The pictures fit their titles in light and dark. In the library, the pictures below the frame load lazily, which is correct. | Template (B) |
| Player picture | **PASS.** The watched video's picture fills the player under the control bar, with alt text ("A newly built cedar planter box…"). | Template (B) |
| Thumbnail alt text | Card thumbnails have `alt=""`. That's acceptable: the linked title next to each one names the video. | |
| **Visible difference: hyphenated titles** | **FAIL.** Card titles break words with hyphens ("after-noon", "walk-ing", "mean-ders"); YouTube never does. | **Core gap.** Core Heading always sets `hyphens: auto` (`packages/core/css/fundamentals/type-and-media.css`, the `[data-dl='heading']` rule). Add a seam, for example a token `c.heading.hyphens` or a `hyphens` prop, defaulting to `auto` so other templates are unchanged; YouTube sets it to `manual`. |
| Menus and controls | Not scored yet (packet C, Worker 125). These are still dead: Filters, Seek, CC, like 9.4K and dislike, and in the library Mute, player Settings, Theatre, Full screen and Show chapters. | See the core-gap table below |

**Batch verdict:** links and pictures pass, apart from **search with a query** (a core gap) and **hyphenated titles** (a core gap). Give both to Worker 125 with packet C. Review build: `7dd73d8` on 8771, node PID 21172. Time for this batch: rebuild 2 min, click-through 6 min, pictures and look 6 min, writing 4 min.

**Links-only check at `e4d6540` (packet A, Worker 123, 2026-11-13 08:40).** This is a quick check for the owner to try, not the full score. Log: `.shots/q156/e4d6540-links.txt`.

- **Video links:** every card, result and up-next link goes to `#/app/youtube/watch?v=…` in `site.html` and inside the library, and shows that video. For example, `v2` shows "Slow morning in the harbour town" and `v7` "Restoring a rusted hand plane". The "no template layout" error no longer appears anywhere.
- **Logo and guide links:** Home and the logo go to home. On home itself they don't change anything, which is expected.
- **Search submit:** pressing Enter in the field goes to `#/app/youtube/search`. The query isn't carried in the address, though: `search?q=…` isn't read, so the results don't change with the query. Open, and the same core-gap seam as G1, a route with a query.
- **Watch with an unknown video:** `watch?v=nope` silently shows the first video. That's acceptable for now, though a not-found state would be the real behaviour.
- **Clips:** the guide's Clips entry now points at home. That's acceptable, since there's no Clips view (Q158).
- **Pictures:** still 0 on every page (packet B).

*Worker 123, 2026-11-13 08:20, on the 8771 review build of `4d050e1`, at 1280 light. Each control was clicked once on a freshly loaded page, both in `site.html` and inside the library page (`#/youtube-*`). Text fields were clicked, given "guitar" and Enter.*

The script only records what changed after the click:

- **navigates:** the URL changed.
- **error:** the "There's no template layout" message appeared.
- **popup:** a menu, dialog or listbox opened.
- **state:** an `aria-*` or `data-state` attribute changed.
- **DOM only:** something in the page changed but it isn't proven to work. It may be just a focus ring or tooltip, so it is **unverified**, not a pass.
- **dead:** nothing changed.

Log: `dl-brand-map/.shots/q156/4d050e1.txt`; the screenshots sit beside it.

**Pictures: missing everywhere.** All six pages (home, search and watch, in `site.html` and in the library) have 0 `<img>` and 0 `<video>`. Every thumbnail, the player frame and the up-next pictures are empty boxes.

| Element | What it should do in YouTube | In `site.html` | In the library page |
| --- | --- | --- | --- |
| Guide (hamburger) | Opens or closes the guide | popup: works | popup: works |
| Logo (`#home`) | Goes to home | **error** | DOM only: the URL stays, unverified |
| Guide entries Home, Clips (`#home`, `#clips`) | Go to that page | **error** | DOM only: unverified |
| Search field, then Enter | Shows results for the query | DOM only: no route change, unverified | same |
| Search button | Submits the query and shows results | **dead** on home and watch; DOM only on search | **dead** on home and watch |
| Clear search (×) | Empties the field | DOM only | DOM only |
| Voice search | Opens the voice prompt | DOM only: no popup, unverified | same |
| Settings ⋮ (masthead) | Opens the settings menu | DOM only: **no menu** | same |
| Sign in | Goes to sign in | DOM only: no navigation | same |
| Chip "All" (already selected) | Stays selected | no change (expected) | same |
| Other chip (Music, Shorts) | Selects it and filters the feed | state: selects, works | same |
| Video card link (home, search) | Goes to watch | **error** ("no template layout called v1/v2/v7") | DOM only: **no route change** |
| Card ⋮ Action menu | Opens the card menu | popup: works | popup: works |
| Filters (search) | Opens the filters dialog | **dead** | **dead** |
| Show chapters (search) | Expands the chapters | DOM only | **dead** |
| Seek slider (watch) | Seeks | **dead** | **dead** |
| Play/Pause | Toggles playback (needs a real video or picture) | DOM only | DOM only |
| Mute | Toggles the sound | DOM only | **dead** |
| Autoplay switch | Toggles | state: works | state: works |
| Subtitles (CC) | Toggles captions | **dead** | **dead** |
| Player Settings, Theatre, Full screen | A menu, a wider layout, full screen | DOM only | **dead** |
| Subscribe | Becomes Subscribed | DOM only: no pressed state | same |
| Like 9.4K, Dislike | Toggle the pressed state and the count | **dead** | DOM only |
| Share, Download, Save | Open a dialog or menu | DOM only: **no dialog** | same |
| ⋯ More actions | Opens a menu | state | popup: works |
| Sort by (comments) | Opens the sort menu | DOM only: **no menu** | same |
| Add a comment | Expands with Cancel and Comment | DOM only | DOM only |
| Comment like and dislike | Toggle | DOM only | DOM only |
| Up next links (`#v2`, `#v3`) | Go to that video's watch page | **error** | DOM only: **no route change** |

**Summary at `4d050e1`:** the replica fails Q156.

- **Links:** every link fails. In `site.html` each one shows the "no template layout" error. In the library page none of them changes the route.
- **Pictures:** none render on any page.
- **What works:** only the guide, the chips, the card ⋮ menu, the watch ⋯ menu and the autoplay switch.
- **Dead or no menu:** Search submit, Filters, Settings, Sort by, Share, Save, like and dislike, seek, CC, Subscribe's pressed state, and the player's theatre and full screen.

The builder's order holds: links (A), then pictures (B), then menus and controls (C). The rescore will be click-through first, with the "DOM only" rows checked by hand.

**Core gap or template-only (Q158).** This is the evaluator's reading of the source at `4d050e1`, for the builder to confirm at each fix:

| Fail | Level | Why |
| --- | --- | --- |
| A. Links show the error in `site.html` and do nothing in the library | **Core gap** | Core only knows a layout's address: `defaultHref(template, layout)` in `packages/core/render/TemplateView.tsx`, which differs by host (`#/app/youtube/home` in `site.html`, `#/youtube-home` in the library). Template content has no way to name "layout `watch`, record `v1`". YouTube wrote raw `#home` and `#v1`, which neither host resolves. Any template with list → detail pages (a shop, a mail app, a blog) hits this. Fix it generically: a content link names `{ layout, record? }`, core resolves it per host, and the target layout reads the record. Search submit → results is the same seam (a route with a query). |
| B. No pictures | **Template-only, mostly** | `packages/templates/youtube/assets.json` has `"assets": {}`, but core already has `assets.json`, Image, Picture and a MediaPlayer `poster`. Generate the pictures with image-prompting and wire them in. If a card or player part can't take a picture through a core seam, that part is a core gap: say which. |
| C1. Menus that don't open: masthead Settings, Sort by, Share, Save, Filters, player Settings | **Template-only** unless a pattern is missing | Core has Popover, Dialog and the menu the card ⋮ already uses. Wire them up. A gap would be, for example, a menu with radio items (Sort by) or one that opens from a player control: log any such gap as core. |
| C2. Toggles that don't hold their state: like and dislike (a mutually exclusive pair with a count), Subscribe → Subscribed, CC | **Likely core gap** | Another project needs a pressed toggle with a count and a pair where only one can be on. If core Button has no `pressed` or toggle-group seam, add it generically. Otherwise it's template wiring. |
| C3. The player's seek, theatre and full screen, plus Mute in the library | **Template-only** (the player's own part) | Unless the template's control bar should be core MediaPlayer's own controls: then it's a core gap in MediaPlayer, which can't restyle its controls. |
| Search button dead on home and watch | Same as **A** (core route with a query) | |

Sent to Worker 100 on 2026-11-12 17:25. Fix each at its owning source (token, layout, compound, part, then content), never the rendered page.

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2a-F1 | GD1, V2, G1 | Layout (core seam if missing) | At 1280 render the 72 mini guide persistently and the 240 guide as a drawer opened by the guide button; the 240 guide is persistent only at 1440 (breakpoint per the spec). Content then starts at x96 with 376-wide items. Check core Rail/Navigation for the mini guide before building one |
| Y2a-F2 | M4, M5, M6 | Template theme, then a generic core seam | One capsule: field `40 0 0 40`, fill page `#FFF`, border `hsla(0,0%,53.3%,.2)`; button `0 40 40 0`, `#F8F8F8`, `#D3D3D3`, joined; text starting x339 |
| Y2a-F3 | M2, M7, M8, M10 | Template theme | Icon buttons 40×40 round, icons 24; voice keeps the tonal fill `rgba(0,0,0,.05)` |
| Y2a-F4 | M3 | Part | Logo box 123 wide from x56, so search starts at x322 |
| Y2a-F5 | M9 | Template theme / Button variant | Sign in: outline `rgba(0,0,0,.2)`, no fill, radius 20, 14 w500 link colour, padding `0 15`, person-in-circle icon in the link colour; 104.6 wide |
| Y2a-F6 | GD3 | Template theme | Guide icons 24; label at x72 |
| Y2a-F7 | V4, P1 | Template token | Row gap 32 (on the spacing scale), not 36 |
| Y2a-F8 | V6 | Core material seam | Duration badge 20 high, padding `1 4`, 12/18 w500, white on see-through `rgba(0,0,0,.6)` in both schemes |
| Y2a-F9 | V10 | Part | The ⋮ card menu, 40×40 round, at the item's top end beside the title, visible at rest |
| Y2a-F10 | R2 | Process (main) | Refreeze the base at Slack's signed-off commit after a clean integration sweep, and sweep with only `youtube` excluded (Word joins when integrated) |
| Y2a-F11 | B2 | Template theme and core | Move the 11 core-token settings from `site.css` to `tokens/theme.json` (or declare a seam); replace the 14 raw values with tokens; build the guide on Navigation/Rail and the card on Card or a generic media-card compound (Y.3) |

Advisory, not a fail: T1, use `roboto` from the registry so text boxes can be checked at ±2.

**Status at `c4c7aa7` (17:35):** F8 and F10 closed. F2, F3, F4, F5 and F11 are partly done; their remaining parts are in the rescore table. F1, F6, F7 and F9 are still open. New:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2b-F12 | M9 | Core (controls.css) | `tone="link"` must clear the fill and take its own edge when emphasis is `default`. Today `[data-emphasis='default']` (line 187) overrides `[data-tone='link']` (line 64). Then Sign in takes radius 20 and edge `rgba(0,0,0,.2)` from the theme |
| Y2b-F13 | V8 | Core (Heading `lines`) or template theme | Keep the title's 22 line height (two lines = 44) and the 4 gap to the meta when `lines` clamps |
| Y2b-F14 | R1 | Sweep | Re-run `lib--progress` light, or declare its 75 px (y893–899) as noise with a reason; then the claim is 0 different |
| Y2b-F15 | M3 | Part | Restore a glyph in the neutral mark; the tile is now blank |

**Status at `92acbdc` (17:55):** closed F1–F3, F5–F10, F12–F15. Open:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2c-F4 | M3 | Part / template token | Logo box 123 wide from x56 (now 148.7), so the field starts at x322 at 1280 and x402 at 1440 |
| Y2c-F16 | M9 | Type (T1) or theme | Sign in 104.6 wide (now 107.1); try the registry's `roboto` before changing any space |
| Y2c-F17 | GD1 | Template layout | Mini guide: first entry at y60 (4 above it), entry padding `16 0 14` |
| Y2c-F18 | D2 | Template theme (scrim) | Drawer scrim black at 50 % (reads `#7F7F7F` on white), not `rgba(17,17,20,.5)` |
| Y2c-F19 | D3 | Part | Guide sign-in prompt text at x33 (now 29) |
| Y2c-F11 | B2 | Core seam, then template | Guide and mini-guide entries on core (a Navigation icon item and a mini form); tokenise `37.5rem`, `0.625rem`, `line-height: 1.6`, `82.0625rem` |

**Status at `8185344` (18:50):** F4, F17, F18 and F19 closed. Open: F16 (Sign in box 104.6, ink already in place) and F11. Still to score before Y.2 can be signed off: 720, dark, the states in section 1 #3, then watch and search.

**Status at `480e81e` (19:55):** F11 narrowed (the guide is on core Navigation): 37.5rem and three raw `<a>` remain. F16 open. Watch fails:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2e-F20 | WA2 | Template theme | Player frame black `#000000` |
| Y2e-F21 | WA3 | Part (on core MediaPlayer controls if they fit) | The control bar at rest: progress line, then play, volume, time pill, chapter on the left and autoplay, CC, settings, theatre, full screen on the right (W-1280-L, measure its boxes first) |
| Y2e-F22 | WA5 | Template layout | Owner row: avatar 8 below the title's 28 box (title top + 36; now 12 below); name and Subscribe at avatar + 1.5; pills at avatar + 3.5 |
| Y2e-F23 | WA7 | Template theme | Subscribe words `#F1F1F1` (dark `#0F0F0F`) |
| Y2e-F24 | WA8, WA9 | Part / content | Dislike half 56 wide; add the two missing 40×40 action circles between Share and ⋯ |
| Y2e-F25 | WA12 | Part | Comments header and add-comment row together 77 high; first thread 32 below (y168 when the header is at y59) |
| Y2e-F26 | WA14 | Template theme | Comment action buttons 32×32, radius 16, the first at text x − 8 |
| Y2e-F27 | WA15 | Template layout | Up-next text 12 after the thumbnail |

**Builder (Worker 108, 20:25, commit `c472b8e`), for rescore:** F16, F20, F22, F23, F24, F25, F26, F27 and the `37.5rem` part of F11 addressed; F21 (control bar) and the 3 raw `<a>` (F11) are the next packet. Measured headless at 1280 light (`dl-brand-map/.shots/w108-m1.log`, `w108-watch.png`): Sign in 104.6 at x1159.4; player `#000000` (theme `color.bg-sunken` dark, read by the dark-scheme player); avatar at title + 36, name and Subscribe at avatar + 2, pills at avatar + 4 (ref 1.5 and 3.5, nearest steps); like pill ends x704 with dislike 57 (ref 56; the extra 1 is the reserved transparent end border), then Share x712, Download, Save, ⋯ x856; description at owner + 56 (ref 55); comments: count 28 high, add row centred where the reference field sits, first thread at count + 108 (ref 109); comment actions 32×32 from x60; up-next text at x1144. Search width reads the new `size.search-width` (theme 37.5rem). Core seams (defaults unchanged, rows in templates-and-library.md): `c.button.strong-text`, `c.button-group.icon-padding-inline`, `size.search-width`. Sweep: 996 screens, 970 identical, 10 noise, 16 inventory (`lib--buttongroup` newly declared: scrollbar track only), 0 different, 1 load-only (harbour home dark). Known gap: the add-comment field is boxed (TextField) where the reference has an underline-only field; no core variant yet.

**Builder (Worker 108, 20:50, commit `d2ecf46`), F21 for rescore:** the player's control bar at rest, from a new 16:9 capture (`watch169-1280-L`, `.design-library/youtube-ref/capture-player.mjs`; region spec row added, open item 2 closed: player 880×495). Seek line 856×6 at x28 y501 (core Slider, small, value hidden; theme `c.slider.fill` and `thumb-fill` `#FF0000`, `track-fill` white 20 %); play and volume 40 circles at x28 and x80, time pill at x128 (14/40 w500), right pill 248×40 at x636 of 48-wide slots (core Switch for autoplay, subtitles, settings, theatre, full screen), every fill the new `--material-media-control` (black 30 %). Core: the material and a `captions` icon (rows in templates-and-library.md). Open: the autoplay switch keeps core's on colour (reference: white track, dark thumb); the reference plays (pause glyph) where the replica rests on play. Sweep: 996 screens, 971 identical, 9 noise, 16 inventory, 0 different, 3 load-only.

**Builder (Worker 108, 21:05, commit `3370740`), Y.2c search for first score:** route `#/app/youtube/search` (`content/browse/search.json`, `record.search`: the query, six filters and five results with original snippets). At 1280 light (`.shots/w108/m3.log`, `search2.png`): the query in the masthead field with its clear button; filters in a 56 row at x96 with Filters at the end; rows from y112, 16 apart; frame 500×281.3, radius 10 (corner pixels on S-1280-L; spec open item 3); words at x612, title 18/26 w400 (theme `type.heading-2`), the ⋮ menu at the title's end out of the flow, views · age 12/18 right under it, the channel line padded 12 with a 24 avatar and the name 8 after it, the snippet 12/18. No core change. Not built: the sponsored first row, badges (4K, New) and the chapters strip. Sweep: 996 screens, 970 identical, 10 noise, 16 inventory, 0 different, 3 load-only.

**Evaluator at `c472b8e` (20:30):** closed F16, F22–F27 and the size part of F11. Still open:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2e-F20 | WA2 | Template theme or core scheme seam | Not closed. Built from the commit and served headless, the player's computed fill is `#F4F4F6` in light. It carries `data-scheme="dark"`, but `--color-bg-sunken: light-dark(var(--p-base-50), #000000)` resolves light on it, so that attribute doesn't make the element dark here. Give the player its own black token (e.g. a `t.youtube.player-fill` of `#000000`), or fix the scheme seam so a `data-scheme="dark"` element resolves `light-dark()` dark. Check it in a production build |
| Y2e-F21 | WA3 | Part | Control bar at rest (next packet) |
| Y2f-F28 | WA12 | Core seam (TextField variant), then template | Add-comment field underline-only, no box (WC-1280-L) |
| Y2c-F11 | B2 | Template | The three raw `<a>` on core `Link` |

**Evaluator at `d2ecf46` (20:55):** F21's geometry passes. Open: F20 (player still light), F28, F11, and:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2g-F29 | WA3b | Template theme (player scheme) | Control icons white and time `#EEEEEE`; most of this follows once the player really is dark (F20) |
| Y2g-F30 | WA3b | Template theme or core Slider seam | Seek track 4 high; dot 12; played part and dot `#FF0033` (pixel-measured; add it to `check:generic`) |
| Y2g-F31 | WA3b | Core Switch seam, then template | Autoplay switch: white track with a dark thumb when on |

**Evaluator at `3370740` (21:15), search:**

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2h-F32 | SR3, C2 | Core Chip seam (edge width), then template theme | Chips without the 1 px transparent edge (or with padding 11), so "All" is 40.4 wide, and centred at y66.5 in the 56 row as the reference has it. This affects home too |
| Y2h-F33 | SR9 | Template layout | Channel name at avatar + 4.5 (now + 3) |
| Y2h-F34 | SR12 | Part and content | The `4K`/`New` badges under the snippet and the chapters strip on rows that have them (measure their boxes from S-1280-L first) |

**Evaluator at `454ebad` (Worker 114, 22:00), 720, dark and states:** dark passes except the carried player fails. New:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2j-F35 | N1 | Template layout (breakpoint) | Below the ≈792 breakpoint hide the mini guide (the guide button opens the 240 drawer); content starts at x24 |
| Y2j-F36 | N2 | Template theme / part | At 720: logo box 113 wide; the field shrinks to 114 at x245 while the button keeps 64 and voice 40 (x439) |
| Y2j-F37 | N3 | Template layout | Home grid 2 columns at 720: 328 wide at x24 and x368, gap 16 (`T-720-L`) |
| Y2j-F38 | N4 | Template layout | The chip row stays one row (Filters at its end); after F35 the search row fits in 672. If chips overflow, scroll the row, never wrap |
| Y2j-F39 | N5 | Template layout | Search at 720: column x24, 672 wide; thumbnail 328×184; words at x368 |
| Y2j-F40 | N6 | Template layout | Watch at 720: player full-bleed 720×540 at x0 y56, square corners; title at y608 x16; up next under the primary column (`W-720-L`) |
| Y2j-F41 | States | References first (Y.1), then part/theme | Capture the states in section 1 #3 into `youtube-ref/shots/` with computed styles (chip hover, guide entry hover, card hover and open menu, search focus and suggestions, Subscribed, liked, masthead tooltips, keyboard focus, description expanded), add them to the region spec, then build them. Until then the states are n/m and Y.2 can't be signed off |

**Evaluator at `effa247` (Worker 114, 22:20):** F29, F30, F31 and the `chat--images` difference closed. New:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2k-F42 | WA3c, D9 | Icon set (library or an MIT/Apache-2.0 set), then the part | Filled control glyphs as in `watch169-1280-L` (play, volume, CC, theatre, full screen; ink boxes within ±1), and the small play glyph inside the autoplay knob |
| Y2k-F43 | R1 | Sweep | `word--dark` light: 632 px at y86–123 (x52–100, x900–953). Explain its cause and fix it, or declare it as noise with the reason |

**Builder (Worker 115, 22:58), F43 settled and base refrozen:** neither `974cee5` nor `effa247` caused it. With only the build's `light-dark()` polyfill put back (`apps/library/vite.config.ts`), HEAD `c9e9f4a` matches the old base exactly on `word--dark` (2 identical). The 632 px are Word's unavailable ribbon commands (Sensitivity, the clipboard pair) in its dark region, whose ink now takes its dark value: the `454ebad` fix. Main refroze the base at `c9e9f4a` (approved 21:50, built in a clean worktree, `dirtyFiles: 0`): 1044 screens, 1035 identical, 9 noise, 0 different (pressure-test-loop.md refreeze log; Q150).

**Builder (Worker 115, 23:35, commit `c8197c7`), F28 for rescore:** core `TextField appearance="underline"` (default box unchanged; token `c.field.underline-edge`; story "Underline"; row in templates-and-library.md). The add-comment field uses it at xs. Theme `$parts` on the add row sets the height to 25 and lifts the measure. Measured headless at 1280: field x52–880 (828), 25 high, the line 1 px `#CCCCCC` light, `#3F3F3F` dark; placeholder `#606060`/`#AAAAAA`; avatar 24 at x16; the count to the field is 52 and the count to the first thread 109 (WC-1280-L: 52 and 109). Focus: a 2 px focus-colour line in place of the 1 px line. Evidence: `dl-brand-map/.shots/w115-f28-sbs.png`. Sweep against `c9e9f4a`: 1044 screens, 1029 identical, 11 noise, 4 inventory (`lib--textfield` scrollbar, newly declared), 0 different.

**Builder (Worker 115, 23:55, commit `dda5504`), F42 for rescore:** filled control glyphs from a template icon pack, `packages/templates/youtube/icons/`. Play, volume, captions and full screen come from Material Symbols 0.48.2 (Apache-2.0): `play_arrow`, `volume_up`, `closed_caption` filled, and `pan_zoom` mirrored. Their viewBoxes are cropped to the reference's ink boxes. Theatre is a drawing of my own: an outlined 22×18 box with `< >`. The pack reaches the controls through `IconOverrides`. The autoplay knob carries the play glyph through the new core `Switch thumbIcon` (default unchanged; story "Glyph in the knob"; row in templates-and-library.md). Ink boxes at 1280 light against watch169-1280-L:

| Control | Replica | Reference |
| --- | --- | --- |
| play | 13×17 at x43 | pause 14×18 (the reference is playing) |
| volume | 22×20 at x89 | 22×19 |
| CC | 22×20 at x701 | 22×18 |
| theatre | 22×18 at x797 | 22×18 |
| full screen | 18×18 at x847 | 18×18 |

The gear is unchanged (20×20; the reference is 20×22). Evidence: `dl-brand-map/.shots/w115-f42-sbs.png`. Sweep: 1044 screens, 1028 identical, 10 noise, 6 inventory, 0 different.

**Evaluator at `dda5504` (Worker 116, 00:05):** F43 closed (cause bisected to the `454ebad` fix; refreeze accepted). F28 and F42 narrowed. Ink boxes are measured at min channel ≥ 160. Open:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2f-F28 | F28d | Template theme `$parts` (add row) | Placeholder ink 3 px too low: y117–127, reference y114–124 with the line still at y135. Raise the text inside the 25 high field; keep the line where it is |
| Y2k-F42 | F42a | Part / content | The reference frame is playing: show the pause glyph, ink 14×18 at x41 (or capture a paused reference first and score play against it) |
| Y2k-F42 | F42d | Template icon pack | CC ink 22×18 from y526 on whole pixels (now 22×20 from y525, with half-covered edge rows) |
| Y2k-F42 | F42e | Template icon pack | Gear ink 20×22 from y524 (now 20×20) |
| Y2k-F42 | F42g | Template icon pack | Full screen arms 8 long with the reference stroke (≈3 diagonal, 2 straight); now 6 long and ≈1.5 |
| Y2n-F44 | WA12b | Template icon pack, then layout | Sort by: a lines glyph with ink 20×14 (reference: three lines, shortening), at the count's end + 34 (now + 51), words 30 after the glyph's ink start |

**Evaluator at `927059e` (Worker 116, 02:20):** F28, F32, F33, F42 and F44 closed (scores in §2). F34 narrowed to:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2h-F34 | F34c | Template theme `$parts` (chapters strip) | Radius 8; now 10 |
| Y2h-F34 | F34d | Template token | Strip fill `#F4F1F8` light and `#2C2733` dark, as measured on `S-1280-L/D` (now neutral `#F2F2F2` / `#272727`). If you can show the tint follows the picture, record that with its evidence instead |
| Y2h-F34 | F34e | Template icon pack | Chevron ink 14×8 from x1225 in `#0F0F0F` (now 10×6 from x1231, `#2B2B2B`) |

**Evaluator at `1e6b66d` (Worker 116, 03:30):** F34 closed at `7a69ff9`. At 720, F35 (guide), F36 (masthead), F37 (grid) and F38 (chip row) are closed (§2). Open:

| ID | Rows | Fix at | What to change |
| --- | --- | --- | --- |
| Y2j-F40a | N6a | Template content and layout | Size the player from the video's own aspect ratio, a field in the video's content (e.g. `aspect: "16:9"`), not a fixed `aspect-ratio: 16 / 9` in `site.css:99`. Then 720×405 for our 16:9 video passes as an allowed content difference (main's ruling, 03:18) |
| Y2j-F39 | N5 | Template layout / theme | Search at 720: title box 280 wide (the ⋮ sits outside it), as `S-720-L`; snippet clamped at 2 lines (max 36), as the reference's `-webkit-line-clamp: 2`. At 1280 the snippet already stops at 2 |
| Y2j-F40 | N6b | Template layout | Watch at 720: up next goes between the description and the comments, as `W-720-L` has it (description to y803, up next to y2332, then comments) |
| Y2t-F45 | Filters | Template icon pack, then part | Filters at 720 and 1280: the words first, then a tune (sliders) glyph to their right, as `S-1280-L` and `S-720-L` show |
| Y2t-F46 | 1280 regression | Core ScrollArea inline inset, or template | The chip row's inline ScrollArea leaves 2–4 grey pixels at x95, outside the first chip's left edge, at 1280 (y73–75, y91–92; up to 35 per channel; both schemes). Home and search at 1280 must stay pixel-identical to `7a69ff9` |

**Builder (Worker 122, 2026-11-13 04:55, F39, F40, F40a, F45 at `82c202c` for rescore; F46 ruling asked; one generic core prop):** F40a: the player sizes from the video's own shape: content `aspect` on a video (`"16:9"` | `"4:3"`, default 16:9; types and schema regenerated; the watched video says 16:9), read as `data-aspect` on the player, so 720×405 here and 880×660 for a 4:3 video; no fixed ratio decides it. F39: at 720 the title box is 280 (`margin-inline-end` 48, the ⋮ positioned in that room, outside it), and the snippet is clamped at 2 lines (36 high on every row at 720 and 1280; on the clipping allow-list). F40: on the one-column watch page (`max-width: 64rem`, the width site.css already uses) up next renders between the description and the comments, in the reading order too: description y565, up next y649 (24 above its first row), comments y2114 at 720; 1280 unchanged (up next x912 y68). F45: generic core `Button iconEnd` (`data-icon-end`, the layer in `row-reverse`; default unchanged; story "Icon after the words"; row in templates-and-library.md) with an own-drawn `filters-tune` glyph (two 2-thick bars with ring knobs, ink 20×18 in a 24 box) in the template pack: Filters words first, glyph ink x1218–1237 y75–91 at 1280 (reference x1218–1237 y75–92) and x658–677 at 720 (reference the same). **F46, ruling asked:** the x95 pixels (values 248–249 light) are the first chip's own corner anti-aliasing near its tangent; in `7a69ff9` the sticky chip row's layer began at x96 and cropped them; the chip-scroll span (drawn back 8 so focus rings are whole) now holds them. Proof: a `clip-path` at x96 on the span makes 1280 search identical to `7a69ff9` apart from Filters. Matching `7a69ff9` exactly needs a rest-state clip that serves no user and would cut the first chip's focus ring unless lifted on `:focus-within`; I propose accepting it as correct rendering. Evidence: `dl-brand-map/.shots/w122-f45-sbs.png` (reference above, replica below, ×4), `w122-m1-*` (720 and 1280, light and dark, search, watch, home). Sweep `.shots/w122-sweep1.log`.

**Builder (Worker 124, 2026-11-13 07:35, F46 for rescore; template CSS only):** the x95 pixels: Worker 122's rest-state crop on the chip-scroll span (`clip-path: inset(0 0 0 8px)` while no chip has focus; lifted on `:focus-within`, so the first chip's ring stays whole; on the clipping allow-list). The x611 pixels (search dark, y219 and y516) were the snippet's first glyph anti-aliasing, cut by F39's line clamp (`overflow: hidden`); the clamp now clips only the block axis (`overflow-y: clip`), 2 lines and the ellipsis unchanged. Measured: home and search at 1280, light and dark, identical to `7a69ff9` outside Filters (0 pixels); at 720 the same crop at x23 and the snippet's x367 fringe back. `npm run check` exit 0; build exit 0. Sweep not run (owner Q155: commit F46 within 15 minutes; both edits are YouTube-scoped selectors). F41 on hold until the owner has seen the review.

**Builder (Worker 124, 08:30, Q156 packet A links, `47eba1a` then `e4d6540`; core gap G1 in templates-and-library.md):** cards, results and up next open `watch?v={id}` (core `params`/`splitRoute`), logo and guide go home, search goes to results; never "no template layout". Time: building 18 min, checking 10, sweep 0 (deferred to the batch end, Q159), waiting 4 (owner pause Q157).

**Builder (Worker 124, 08:55, Q156 packet B pictures, `7dd73d8`):** 12 thumbnails (one reference, one style block, WebP 1280×720 via assets.json, alt from each picture) on every card, result and up-next item, and the watched video in the player; no core change (the Image `--image-radius` seam was enough). Avatars still initials. Time: building 22 min (generation 6), checking 6, sweep 0 (batch end), waiting 0.

**Builder (Worker 119, 2026-11-13, F28d and F44 for rescore; template only, no core change):** F28d: the add-comment field is 31 high (theme `$parts` `c.field.size-xs` 1.9375rem) with the row bottom-aligned and its top margin 18, so the text centres 3 higher while the line, the avatar and the first thread stay put. F44: a `comments-sort` glyph in the template icon pack (Material Symbols 0.48.2 `sort`, Apache-2.0, viewBox cropped to a 20 wide ink), wrapped by `IconOverrides`; the Sort by button has no inline padding and an 8 gap (theme `$parts` on the comments head), and a template `sort` span lifts it 3. Measured headless at 1280 against `watch-comments-1280-L/D` with the count at y59, light and dark identical: count ink x17–169 y66–83; glyph x205–224 y63–76 (20×14, count end + 36; reference 219 → 255, + 36, y63–76); words from x235 (glyph + 30; reference 285, + 30) y63–76; placeholder ink x52–159 y114–124 (reference y114–124); line y135 x52–879; avatar y112–136; first thread y168 (count + 109). `tools/regression-noise.json`: the stale `lib--link` and `lib--buttongroup` declarations pruned (the base `c9e9f4a` contains them). Evidence: `dl-brand-map/.shots/w119-f28f44-light.png` beside `w119-ref-light.png`.

**Builder (Worker 119, 2026-11-13 01:20, F42a/d/e/g for rescore; template only, no core change):** the player plays, so its first control is Pause (a `playing` state, default on; the button toggles Play and Pause, content `copy.pause`). New pack glyphs, all at the reference ink boxes in `watch169-1280-L`: `player-pause` (own drawing, two 5×18 bars 4 apart) 14×18 at x41 y526; `player-captions` now Material `closed_caption` fill scaled on each axis to 22×18 (whole pixels, y526–543); `player-settings` Material `settings` scaled to 20×22 at x750 y524, with its centre an own ring (outer 4, hole 2) as the reference draws it; `player-fullscreen` own drawing, arms 8 long with straight strokes 2 and diagonals ≈3, ink 18×18 at x847 y526. Measured headless: pause (41,526) 14×18, CC (701,526) 22×18, gear (750,524) 20×22, full screen (847,526) 18×18, each identical to the reference. Evidence: `dl-brand-map/.shots/w119-f42-sbs.png` (reference above, replica below).

**Builder (Worker 119, 2026-11-13 01:45, F32 for rescore; one generic core token):** core `c.chip.edge-width` (default `{border.hairline}`, every chip unchanged; the on ring draws `c.chip.selected-ring` less it; row in templates-and-library.md). The YouTube theme sets it to 0, and the search chip row keeps 3 at its foot so the chips sit 10.5 into the 56 row as the reference's do (S-1280-L `searchFilterChips` y56 h56, chip y66.5). Measured headless at 1280, light and dark: search "All" x96 y66.5 40.42×32, Shorts x144.42 (ref 144.4), Unwatched x217.78, Videos x319.81; home "All" 40.42×32 at y68 (centred in its 56 row; the home capture has no chips to place it by). Filters on search is unchanged (ink y76–88; the reference's y75–92 includes its icon, not scored here).

**Builder (Worker 119, 2026-11-13 02:00, F33 and F34 for rescore; one generic core prop):** F33: the search channel line is 51 high (padding 12, avatar at the top, the name in a template `name` span padded 4.5), so the name sits at avatar + 4.5 (S-1280-L `searchChannel` h51, avatar y+12, name y+16.5); measured channel 51, avatar y168, name box y168 with text from y172.5. F34: content `badges` and `chapters` on search results (types, schema regenerated; the first result has `4K` and 6 chapters). The badge is the new generic core `Badge emphasis="outline"` (token `c.badge.outline-edge`, story "Format mark"; row in templates-and-library.md), themed by `$parts` to 18 high, radius 2, edge #CCCCCC: measured 22×18 at x612, 8 under the snippet, words ink 12×9 at +5,+4 (reference 22×18 at x612 y527, ink 617/531: the same offsets). The chapters strip is template parts: 644×36 at x612, 20 under the marks, radius 8, the chips' tonal fill (`$parts` `color.bg-control` → `c.chip.fill`; the reference's rgb 244 241 248 is tinted from its picture), a 50×28 frame 8 in, "6 chapters" 12/18 w500, the titles muted on one line ending in an ellipsis (on the clipping allow-list), the chevron as a small quiet icon button at the end (chevron ink 16×9 at x1224, reference 14×7 at x1225). Evidence: `dl-brand-map/.shots/w119-f34-strip2.png` beside `w119-ref-strip.png`.

**Builder (Worker 120, 2026-11-13 02:45, F34c/d/e for rescore; template only, no core change):** the chapters strip's `$parts` sets `radius.md` 0.5rem (radius 8), `color.bg-control` `#F4F1F8` / `#2C2733` (the tint measured on `S-1280-L/D`) and `size.icon-sm` 1.5rem; its end padding is now 8, like its start. The expand chevron is an own drawing in the template icon pack (`chapters-expand`, a filled 14×8 chevron about 1.3 thick in a 24 box), wrapped by `IconOverrides`. Measured headless at 1280 (search, first result): strip 644×36 at x612, computed radius 8, fill rgb(244,241,248) light and rgb(44,39,51) dark; chevron ink x1225–1238, 8 high, darkest `#0F0F0F` light, lightest `#F1F1F1` dark. Evidence: `dl-brand-map/.shots/w120-s-light.png`, `w120-s-dark.png`.

**Builder (Worker 120, 2026-11-13 03:15, F35–F40 the 720 layout for rescore; two generic core changes):** below the reference's 792 change point (`@media (max-width: 49.4375rem)`, template) the mini guide is hidden (the guide button still opens the 240 drawer) and content starts at x24. F36 masthead: no column gap, logo box 114 (end padding 0), the field from x245, 113.4 wide, the search button 65 at x358.4, voice x439.4, settings x551.4 (core: the text field's joined action is `flex: none`, so a narrow field shrinks in its box, not its button). F37 home: 2 columns, 328 at x24 and x368. F38 chips: core `ChipGroup wrap={false}` in a template `chip-scroll` span holding an inline `ScrollArea inset="sm"` (drawn back by its inset so the chips don't move; focus rings whole): one 56 row at 720 with All x24, Shorts x72.4, Unwatched x145.8, Videos x247.8, Recently uploaded x323, Live x470.4, all at y66.5, Filters at the row's end (x594.8–696); at 1280 every chip is where it was (home All x96 y68, search x96/144.42/217.78/319.81 y66.5). F39 search: column x24, 672 wide; frame 328×184.5 at x24 y112; title x368, 328 wide (its box includes the menu's 48). F40 watch: the player full-bleed at x0 y56, 720 wide, square corners; the rest 16 in (title x16), up next under the primary column. **Ruling asked:** the player is 720×405, not 540: the replica's video is 16:9 (scored at 1280 as 880×495 against `watch169-1280-L`), and the 720×540 in `W-720-L` is the 4:3 reference video; the title follows 12 below it. Evidence: `dl-brand-map/.shots/w120-sbs-home.png`, `w120-sbs-search.png`, `w120-sbs-watch.png` (reference left, replica right, at half size), `w120-focus.png` (keyboard focus on All at 720).

## 4. Sign-off

**Y.2 SIGNED OFF at `4201072` (Worker 123, the evaluator, 2026-11-13 10:20).** Under the Q158 rule, the Q156 click-through passes on home, search and watch, in `site.html` and in the library: links, pictures, menus and controls, with theatre and full screen as accepted stubs. No visible difference remains, the core gaps G1–G3 are logged in `templates-and-library.md`, and the batch sweep found 0 different. F41 states were dropped (Q158). The review build is `4201072` on 8771, node PID 63136, until the owner is done.

**Sign-off rule from Q158 (08:20).** Y.2 is signed off when the Q156 click-through passes on home, search and watch, in `site.html` and in the library, and no difference is visible side by side at normal viewing. Pixel-level rows no longer block, and F41 is dropped. Each fail is marked core gap or template-only (§3).

For each commit main relays:

1. Rebuild 8771 on it and record the PID in Q155.
2. Run `node .shots/q156/click.mjs .shots/q156/<sha>.txt`.
3. Check the "DOM only" rows by hand.
4. Do the side-by-side.

**Evaluator at `4d050e1` (Worker 123, 2026-11-13 07:40): F46 PASS.** Built from the commit and swept headless:

- Home and search at 1280, light and dark, are pixel-identical to `7a69ff9` except Filters (x1171–1240, F45), with 0 off-background pixels at x88–95.
- The x611 snippet anti-aliasing in search dark is back, with the 2-line clamp clipping only the block axis.
- Watch is identical to `82c202c`.
- At 720 the only change from `82c202c` is the first chip's edge column at x23 and, in search dark, the snippet anti-aliasing that also returns at 1280.

Focus with the clip lifted wasn't probed. Evidence: `dl-brand-map/.shots/y2u/4d050e1/`. Every row at 1280, 720 and in dark now passes. Open: only F41 (states), held by Q155 until the owner rules on the proposed cut (top of this page). **Not signed off:** Y.2 needs either F41 or the cut. The review build on 8771 is now `4d050e1`, with node PID 63060.

**Evaluator handoff (Worker 116 rolling over at its 90-active-minute limit, 2026-11-13 04:40):** last scored `82c202c`: F39, F40, F40a and F45 closed. Open: **F46** (1280 chip-edge pixels at x95, plus 2 px at x611 in search dark) and **F41** (states: capture references first, then build). Every other row passes at 1280, 720 and in dark. Routing: main relays each commit; send fails to the builder (Worker 122, `…?chat=a9fe8fd3-afd7-4980-90eb-b4494b977961`) and scores to main. Tools and method: see the 03:20 handoff below. Not signed off.

**Evaluator handoff (Worker 116, 2026-11-13 03:20, at 70 of 90 active minutes):** scored `dda5504`, `b8a83d3`, `e493100`, `6846963`, `927059e`, `7a69ff9` and `1e6b66d`. How: `node .shots/youtube-q145y-eval/eval-serve.mjs <sha> -- <script> <args> [-- <script> ...]` (one production build, port 8771, closed afterwards; Q154: never run `check:regression` yourself, read the builder's `.shots/w*-sweep*.log`). Scripts: `y2j/sweep.mjs <outDir> route:w:scheme,...` (screens plus every box), `y2n/score.mjs <outDir>` (player, add-comment row at the reference's scroll), `y2t/order.mjs <outFile>` (watch section order at 720, search snippet lines). Compare with the previous commit's sweep folder (`y2s/7a69ff9`, `y2t/1e6b66d`) using PIL `ImageChops.difference(...).getbbox()`; measure reference ink from `.design-library/youtube-ref/shots/*.png` and boxes from the `*.json` `els`. Open: F39, F40, F40a, F45, F46 (§3 at `1e6b66d`) and F41 (states: references first). Builder: Worker 122 (`…?chat=a9fe8fd3-afd7-4980-90eb-b4494b977961`). Routing since 04:01: main relays each commit to the evaluator; the evaluator sends fails to the builder's chat and scores to main. Not signed off.

**Evaluator (Worker 116, 2026-11-13 00:05):** owner since 22:56, successor to 114. Scored `dda5504` (with `c8197c7`): 18 rows, 11 PASS, 6 FAIL, 1 n/m. F43 closed, refreeze at `c9e9f4a` accepted. Added `y2n/score.mjs <outDir>` (watch at 1280 light and dark: the player screenshot, then the comment count scrolled to y59 for the add-comment row and its focus). Pixel analysis of reference and replica is inline Python with PIL (ink at min channel ≥ 160). Open: F28 (placeholder 3 low), F32–F42, F44. Builder: Worker 119 (`agent-host-session://ahp-session/b58b0c3d-4717-435f-9b68-25cab520a087?chat=c375c1d2-9bc5-48e5-b8d0-88697c901067`). Not signed off. At `b8a83d3` (01:15): F28 and F44 closed. At `e493100` (01:35): F42 closed. At `6846963` (01:50): F32 closed. At `927059e` (02:20): F33 closed; F34 narrowed to the chapters strip's radius, fill and chevron; open F34–F41. Worker 119 stopped at its limit; Worker 120 (`…?chat=e29cfdaf-e4fd-4abc-a62a-7a190de7275f`) has the fails. At `7a69ff9` (03:00): F34 closed. At `1e6b66d` (03:30): F35–F38 closed; open F39, F40, F40a (player aspect from content, main's ruling), F41, F45, F46. Script added: `y2t/order.mjs <outFile>` (section order on watch at 720, snippet line counts on search). Not signed off.

**Evaluator handoff (Worker 114 rolling over at its 90-active-minute limit, 2026-11-12 22:55):** scored `454ebad` (720, dark, states), `effa247` (player), `974cee5` (merge, YouTube identical) and `c9e9f4a` (F11 PASS). Scripts in `dl-brand-map/.shots/youtube-q145y-eval/`, all run under `eval-serve.mjs <commit> -- <script> [args]` (8771, closed afterwards): `y2j/sweep.mjs <outDir> [route:w:scheme,...]` (screens plus every box, at any width and scheme), `y2j/probe-dark.mjs <outFile>` (capsule, voice, Sign in, Subscribe, pills, hover and focus), `y2j/probe-link.mjs <outDir>` and `y2j/probe-names.mjs <outFile>` (anchors, names, frame focus), `y2g/player.mjs <outPrefix>` (player boxes). To compare two commits, run `sweep.mjs` on each and diff the `.txt` and `.png` files (see `y2l`, `y2m`). The latest sweep is `.shots/regression/result.json`. Open: F28, F32–F43. Builder Worker 115 is settling F43, then the refreeze, then F28, F42, F32–F34 and F35–F41; it has every fail. Next evaluator: tell Worker 115 your chat link.

**Evaluator handoff (Worker 114, 2026-11-12 22:00):** owner since 21:31, successor to 102. Added `y2j/sweep.mjs <outDir> [route:w:scheme,...]` (screens and every box at any width and scheme) and `y2j/probe-dark.mjs <outFile>` (capsule, voice, Sign in, Subscribe, pills, hover and keyboard focus); both run under `eval-serve.mjs`. Open at `454ebad`: F11, F28, F29–F31, F32–F34, the sweep's `chat--images` 6 px, and F35–F41 (720 and states). At `effa247` (22:20): F29–F31 and `chat--images` closed; new F42 (filled player glyphs) and F43 (`word--dark` sweep difference). At `c9e9f4a` (22:45): F11 closed. Open: F28, F32–F43. Builder: Worker 115 since 22:32 (`agent-host-session://ahp-session/b58b0c3d-4717-435f-9b68-25cab520a087?chat=6e9738de-f2f2-4f8c-a73b-5a3d9d3cc95e`), successor to Worker 112 (archived); it has the open list.

**Evaluator handoff (Worker 102, 2026-11-12 21:15):** scripts in `dl-brand-map/.shots/youtube-q145y-eval/`. Use `eval-serve.mjs <commit> -- <script> [args]` (Q153: it builds the commit, serves it on 8771 while the scripts run, then closes it). Then:

- `y2c/measure3.mjs <outDir> light`: home at 1280, with the drawer open and at 1440.
- `y2e/nav.mjs`: guide entries.
- `y2e/dump.mjs <out> <route> <w> <h> [scrollY]`: every box in `main`.
- `y2g/player.mjs`: the player and its controls.
- `y2a/probes.mjs`, `y2e/probes-watch.mjs`, `y2h/probes-search.mjs`: the five framework probes.

Open fails are in section 3. As of `454ebad` (21:40): F11, F28, F29 (icon ink `#FFFFFF`), F30, F31, F32–F34, and the sweep's `chat--images` 6 px. F20 is closed. Main owes a base refreeze for the 8 fixed library screens after integration. Not scored yet: 720, dark, the states (section 1 #3). Builder: Worker 112 (`agent-host-session://ahp-session/b58b0c3d-4717-435f-9b68-25cab520a087?chat=c1372537-ee4b-4f0d-b3d0-7fb660926c44`). Worker 102 rolled over at 90 active minutes (21:40).

Not signed off. Y.2a needs every row above at PASS (n/m rows need a measured reference or a recorded ruling). Next packets once Y.2a passes: 1440 and 720, dark, states (chip and guide hover, card hover menu, search focus), then watch and search.
