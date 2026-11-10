# Figma replica: the library stress test (Q118)

The owner's instruction (DoD [Q118](definition-of-done.md#owner-instructions), 2026-11-10 14:50): rebuild the existing Design tool template ([editor](http://127.0.0.1:8766/site.html#/app/design/editor)) into a Figma Design (UI3) replica that a person can't tell apart at a glance, in light and dark, with basic navigation and selection; and use it to find, diagnose and fix the library's shortcomings **without burdening the generic library with Figma-specific looks**. This page is the single truth for that work: the references, the region-by-region Definition of Done, the boundary rule, the gap log, the owner decisions and the loop.

Roles (Q85.3, the [adversarial loop](adversarial-loop.md)): worker 71 builds (components, tokens, theme, template); worker 70 evaluates (did not build it), keeps this page, writes checks, probes and guide sections. Mode: strict design, work with me: build, type check, static checks and probes only, no tests.

## 1. References

Public sources only (Q118.6). Pictures are captured into the git-ignored `.design-library/figma-ref/` (file names below, index in `index.txt` there) for side-by-side comparison; **nothing from them ships**: no Figma logo, icon files, pictures or copy in the product. The replica uses look-alikes from the library's own and licensed icon sets, and its own words.

| Ref | Source | Captured as | What it shows | Scale (image px per UI px) |
| --- | --- | --- | --- | --- |
| R1 | [Explore design files](https://help.figma.com/hc/en-us/articles/15297425105303-Explore-design-files) | `15297425105303-2.png` (1920 × 1080) | UI3 regions: A navigation rail, B left panel, C canvas, D right panel with avatars, E floating toolbar | diagram |
| R2 | same article | `15297425105303-11.png` (1920 × 1080) | Pages list (selected row), Layers with expand chevron, frame/image/text layer icons, hover row with lock and eye, canvas frame with name label, selection box, corner handles, size label | 2× |
| R3 | same article | `15297425105303-3..6, 27.png` (1920 × 694) | Toolbar states and tool groups | 3× |
| R4 | [Access design tools from the toolbar](https://help.figma.com/hc/en-us/articles/360041064174-Access-design-tools-from-the-toolbar) | `360041064174-1.png` (1920 × 694) | Floating toolbar: Move (selected, filled accent), Frame, Shape, Pen, Text, Comment, Actions, each with a flyout chevron; separator; Draw / Design / Dev mode switcher | 3× |
| R5 | [Design, prototype, and explore layer properties in the right sidebar](https://help.figma.com/hc/en-us/articles/360039832014-Design-prototype-and-explore-layer-properties-in-the-right-sidebar) | `360039832014-1.png`, `-2.png` (1920 × 1920) | Right panel head (avatar ▾, Present ▾, Share), Design / Prototype tabs with zoom %, Frame ▾ selection head, Position (align, X/Y, rotation, flip), Layout (flow segmented, W/H), Appearance (opacity, radius), Fill; Prototype settings and Flows | 3.34× |
| R6 | [Layers 101](https://help.figma.com/hc/en-us/articles/26584819173271-Layers-101-Get-started-with-layers) | `26584819173271-1..3.png` | Layer tree nesting and icons | — |
| R7 | [Select layers and objects](https://help.figma.com/hc/en-us/articles/360040449873-Select-layers-and-objects) | `360040449873-1..6` (GIF and PNG) | Selection, hover outline, multi-select, deep select | — |
| R8 | [Update fills using the color picker](https://help.figma.com/hc/en-us/articles/360041003774-Update-fills-using-the-color-picker) | `360041003774-1..6.png` | Colour picker popover | — |
| R9 | [FD4B: Navigate Figma Design files](https://help.figma.com/hc/en-us/articles/30925881896727-FD4B-Navigate-Figma-Design-files) | `30925881896727-1..6.png` | Whole-editor views, file menu | — |
| R10 | [Change themes in Figma](https://help.figma.com/hc/en-us/articles/5576781786647-Change-themes-in-Figma) | `5576781786647-1.png` (1920 × 1080) | Light and dark side by side, **UI2** (older layout); used only for dark colours until a UI3 dark capture exists: panel `#2C2C2C`, divider `#444444`, selected layer row `#2D3953` dark / `#E5F4FF` light | 2× |
| R11 | same article | `5576781786647-2.png` (2878 × 1414; `-2-half.png` for viewing) | **The whole UI3 editor, light, empty file**: left head (menu ▾, panel toggle; "Untitled ▾" / "Drafts"), File / Assets pills + search, Pages +, Page 1, Layers; rulers; toolbar; right head (avatar ▾, Present ▾, Share), Design / Prototype + 100 % ▾, Page (colour field + eye), Variables, Styles, Export. **Primary layout reference** | 1.8× (24 px fields = 43 px, 32 px tools = 58 px) |

**Measured reference values (light).** Colours are pixel samples from R2, R4 and R5; sizes divide the image by its scale (± 1 px):

| Thing | Value |
| --- | --- |
| Panel surface | `#FFFFFF` |
| Canvas | `#F5F5F5` (R1) |
| Field fill, hover row, selected page row, active tab pill, segmented track | `#F5F5F5`, no border |
| Dividers (panel edge, section separators, toolbar separator) | 1 px `#E6E6E6` |
| Accent (Share, selected tool, selection stroke, handles' stroke, size label) | `#0D99FF` |
| Segmented selected segment | `#FFFFFF` on the `#F5F5F5` track, small shadow |
| Type | Inter, 11 px for UI text; section titles 11 px semibold; secondary text about 50 % black |
| Left and right panels | 240 px wide (R11: 430 px at 1.8×), docked, full height, 1 px divider `#E6E6E6` to the canvas |
| Left head | Menu row 48 px (menu glyph ▾ left, panel toggle right) then file name 11 px semibold with ▾ over "Drafts" 11 px secondary: 97 px to the first divider (R11) |
| File / Assets row | 40 px row, 24 px pills (active `#F5F5F5`), search icon at the end; divider below (R11) |
| Section title rows (Pages, Layers; Page, Variables, Styles, Export) | 40 px each, title 11 px semibold at a 16 px inset, trailing 24 px icon button; sections divided by 1 px `#E6E6E6` (R11) |
| Page and layer rows | Highlight 24 px high, inset 8 px each side, radius 5 px, `#F5F5F5` (R11, R2); selected layer `#E5F4FF` (R10); row pitch and child indent 24 px (R2: confirm on a UI3 capture with deep layers) |
| Fields | 24 px high, radius 5 px; two 88 px columns with an 8 px gap plus a 24 px action column; 16 px panel inset |
| Section | 1 px divider between sections; title row 40 px with trailing icon actions; 8 px between field rows |
| Right head | 48 px: avatar 24 px with ▾, Present ▶ ▾, Share 32 px high filled accent, white 11 px medium, radius 5 px (R11) |
| Tabs (Design, Prototype) | 33 px row under the head, 24 px pills radius 5 px, active `#F5F5F5`; zoom "100 % ▾" at the row's end; divider below (R11) |
| Canvas | `#F5F5F5`; rulers optional (on in R11, off in R2) |
| Floating toolbar | 48 px high (8 px padding around 32 px tools), white, radius about 13 px, soft wide shadow; tools: radius 5 px; selected = accent fill with white glyph; flyout chevrons 16 px; mode switcher at the end on a `#F5F5F5` track with the active mode white with an accent glyph (R4, R11) |
| Selection | 1 px accent stroke; 6 px white square handles with an accent stroke at the corners; frame name label 11 px above the frame (accent when selected); size label below: accent fill, white 11 px, radius 2 px |

**Viewport for comparison:** the evaluator compares at the same CSS size as the reference crop: panels at 240 px, the editor at **1440 × 900** (and 1280 × 800); the agent browser pane is 823 × 823, so whole-editor screenshots are taken with Playwright at 1440 × 900 when the pane allows it, otherwise region by region at native size. Reference pictures are compared after dividing by their scale.

## 2. Region-by-region Definition of Done

Each row passes only with evidence: a measured value (probe output or computed style), a side-by-side screenshot at the same size, or both. **Level**: `library` (a generic gap any dense app would hit), `template` (the Design template's theme, tokens, parts or content), `owner` (an owner rule conflicts; see section 5). States: `open`, `building`, `review` (builder says done), `pass` (evaluator measured), `fail` (evaluator found a gap; see the gap log), `decision` (waits on the owner; the default applies meanwhile).

Baseline (evaluator, 2026-11-10 15:05, dark, 823 × 823 pane): panels 256 px, UI text 14 px, tool bar 45 px high with radius 4 px and 7 tools plus zoom, no left-panel head, no File/Assets tabs, fields without fill, dark surface `rgb(24, 24, 28)`, layer rows 32 px (R11: 24 px), tabs 24 px, fields 24 px.

### File and panel heads

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR1 | Left panel head: menu button (look-alike glyph, not the Figma logo), file name, project ("Drafts") with ▾, hide-panel button | R1, R9 | 48 px menu row (menu glyph ▾, panel toggle at the end), then file name 11 px semibold ▾ over "Drafts" 11 px secondary; 97 px to the divider (R11); the menu button opens the main menu (FR40) | template | open |
| FR2 | File / Assets tabs under the head | R9 | 40 px row: two 24 px pills (active `#F5F5F5`) and a search icon at the end (R11); switching shows Pages + Layers or Assets | template | open |
| FR3 | Right panel head: avatars (24 px, overlapping), Present ▶ with ▾, Share | R5 | Avatar 24 px circle; Present 24 px icon button + 16 px chevron; Share filled `#0D99FF`, white 11 px medium, radius 5 px, height and width ± 1 px of R5 | template (accent via theme) | open |
| FR4 | Panel widths and edges | R1, R2 | Left and right panels 240 px, docked full height, 1 px `#E6E6E6` inner edge, panel `#FFFFFF`; canvas fills the rest | library (EditorLayout width token) + template (value) | fail (256 px) |

### Left panel: pages, layers, assets

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR5 | Pages section title row with "+" and collapse | R2 | Title 11 px semibold, 40 px row, + 24 px icon button; collapse hides the list (R11) | template | open |
| FR6 | Page rows: rest, hover, selected | R2 | 24 px row highlight, inset 8 px, radius 5 px, hover and current page `#F5F5F5`, 11 px text (R11) | library (TreeView/ListItem dense row) + template (values) | open |
| FR7 | Layers section title and divider | R2 | 1 px divider above, title 11 px semibold | template | open |
| FR8 | Layer rows: icon per type (frame #, text T, image, rectangle, ellipse, group, component), name, expand chevron | R2, R6 | 24 px rows (R11; pitch to confirm), 16 px icons, 24 px indent per level, chevron outside the icon column | library (TreeView indent token) + template | open |
| FR9 | Layer hover: lock and eye actions at the row end | R2 | Actions appear on hover and focus only, 16 px glyphs, stay while on; see OD2 | owner | decision |
| FR10 | Layer selected: accent-tinted row; children of selected lightly tinted | R7 | Selected row `#E5F4FF` light, `#2D3953` dark (R10); children of the selection a lighter tint (R7) | template | open |
| FR11 | Assets tab: search, libraries, component tiles | R9 | Search 24 px field, tile grid; no proprietary thumbnails | template | open |

### Floating toolbar

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR12 | Bar shape | R4 | 48 px high, radius ± 1 px of R4, white (light), soft shadow, centred bottom with the R1 gap | library (FloatingBar size/radius tokens) + template (values) | fail (45 px, radius 4) |
| FR13 | Tool set and order | R4 | Move ▾, Frame ▾, Shape ▾, Pen ▾, Text, Comment ▾, Actions; separator; Draw / Design / Dev mode | template (content) | fail (Hand, Rect, Ellipse separate; no Pen, Actions, mode switch) |
| FR14 | Tool button rest, hover, selected | R4 | 32 px square, radius 5 px; selected `#0D99FF` fill, white glyph; hover `#F5F5F5` | library (SegmentedControl/Toolbar "filled selected" option if missing) + template | open |
| FR15 | Flyout chevrons and tool flyouts (Move/Hand/Scale; Frame/Section/Slice; Rectangle/Line/Arrow/Ellipse/Polygon/Star/Image; Pen/Pencil) | R3, R4 | 16 px chevron beside each grouped tool; menu opens above the bar with icon, name and shortcut; choosing swaps the tool | library (MenuButton placement "top") + template | open |
| FR16 | Mode switcher (Draw / Design / Dev) | R4 | Segmented track `#F5F5F5`, selected white segment with accent glyph | template | open |

### Canvas

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR17 | Canvas surface | R1 | `#F5F5F5` light; rulers off by default (R2), optional (R11); no grid | template | open |
| FR18 | Frame name labels | R2 | 11 px secondary above each frame's top-left; accent when selected | template | open |
| FR19 | Hover outline | R7 | 1 px accent outline on hover of an unselected layer (2 px for frames per R7 if measured) | template | open |
| FR20 | Selection box and handles | R2 | 1 px `#0D99FF` stroke; 6 px white handles with accent stroke at four corners | template | open |
| FR21 | Size label | R2 | Below the selection, centred, `#0D99FF` fill, white 11 px, radius 2 px, "W × H" | template | open |
| FR22 | Multi-select bounds | R7 | One bounding box around all, each item outlined | template | open |

### Right panel: Design tab

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR23 | Tabs row: Design, Prototype pills + zoom % ▾ | R5 | 24 px pills, active `#F5F5F5`, inactive secondary text, zoom at the end with chevron | template | open |
| FR24 | Selection head: "Frame ▾" type menu + actions (code, component, more) | R5 | 11 px semibold name with ▾; three 24 px icon buttons | template | open |
| FR25 | Position: align row (6 buttons in two touching groups), X/Y, rotation, flip/rotate group | R5 | Groups on the `#F5F5F5` track, touching segments; fields 24 px with inline X/Y glyph labels | library (PropertyRow, touching icon group) + template | open |
| FR26 | Layout: flow segmented (4), W/H, resizing, clip content | R5 | Segmented track as R5; W/H inline labels; clip content per OD3 | template + owner | open |
| FR27 | Appearance: opacity, corner radius, eye and blend actions | R5 | Opacity with a pattern glyph, radius with a corner glyph; independent corners action | template | open |
| FR28 | Fill, Stroke, Effects, Export section heads with styles and + actions | R5 | Each title row 11 px semibold, trailing 24 px icon buttons | template | open |
| FR29 | Fill/stroke row: swatch, hex, opacity %, eye, − | R5, R8 | One row: 16 px swatch, hex, % then actions | library (ColourField compact) + template | open |
| FR30 | Field look: fill `#F5F5F5`, no border at rest, accent border on focus, hover border | R5 | Computed: background `#F5F5F5`, border none at rest; focus zero-offset ring (Q55) | library (field "filled" appearance via token) + template (choose it) | fail (no fill) |
| FR31 | Section separators | R5 | 1 px `#E6E6E6` full panel width; no boxes around sections | template | open |
| FR32 | Typography section | R5 | Font, weight / size, line height / letter spacing rows as DT24 | template | open |

### Right panel: Prototype tab

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR33 | Prototype settings: device, model, orientation, background, preview | R5 | Labels left 11 px secondary, controls right; orientation segmented; preview black panel radius as R5 | template | open |
| FR34 | Flows list | R5 | ▶ glyph and flow name rows | template | open |
| FR35 | Interactions rows when a layer is selected | R5 | Row summaries open a popover editor (DT27) | template | open |

### Overlays, menus and popovers

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR36 | Context menu on canvas and layers | R9 | Dark menu (Figma menus are dark in both schemes), 11 px items, shortcuts right-aligned, separators | owner (menu always dark) + library (Menu shortcut column) | open |
| FR37 | Colour picker popover | R8 | Matches the ColourPicker built for Q49 at the R8 size | library (exists) + template | open |
| FR38 | Zoom menu | R5 | Zoom in/out/fit/50/100/200 with shortcuts | template | open |
| FR39 | Tooltips on icon buttons | R4 | Dark tooltip, name + shortcut | library (Tooltip shortcut slot) | open |
| FR40 | Main menu from FR1 | R9 | Nested menu: File, Edit, View, Object, Text, Arrange, Plugins, Preferences, Help | template | open |

### Schemes and type

| ID | Region / state | Ref | Done when (measured) | Level | State |
| --- | --- | --- | --- | --- | --- |
| FR41 | Light scheme: every surface and text colour equals the table in section 1 | R1–R5 | Probe reports each sampled colour within ΔE 2 | template (theme) | open |
| FR42 | Dark scheme | R10 | Panel `#2C2C2C` and dividers `#444444` (R10, UI2 sample); canvas `#1E1E1E`, fields `#383838`, text white (*ref pending*: no public UI3 dark capture yet) | template (theme) | open |
| FR43 | UI type 11 px Inter, titles semibold | R2, R5 | Computed font sizes in panels and toolbar | owner | decision |
| FR44 | Icons: look-alikes at 16 px (24 px buttons) with 1 px-ish strokes | R4, R5 | Every inspector and toolbar glyph has a look-alike from the library's sets; none copied | template (icon choice) + library (icon set gaps) | open |
| FR45 | Motion: menus and popovers appear without delay; hover is immediate | — | Motion probe: no transitions on hover in panels; popover ≤ 100 ms | template | open |

### Basic behaviour (Q118.2)

| ID | Behaviour | Done when (observed) | Level | State |
| --- | --- | --- | --- | --- |
| FB1 | Navigate pages | Clicking a page row shows its frames and layers; selected row follows | template | open |
| FB2 | Select on canvas ↔ layers | Clicking a canvas layer selects its row (scrolled into view) and vice versa; the inspector shows that layer's type | template | open |
| FB3 | Expand and collapse layers and the Pages section | Chevrons and the arrow keys (APG tree) | library (TreeView exists) | open |
| FB4 | Switch tools | Clicking a tool or its flyout item selects it; keys V, F, R, O, T, C, H | template | open |
| FB5 | Switch tabs | Design / Prototype, File / Assets | template | open |
| FB6 | Open menus and popovers | Main menu, context menu, zoom menu, colour picker; Escape closes and returns focus | library (exists) + template | open |
| FB7 | Hover states | Rows, buttons, canvas outline as their rows above | template | open |
| FB8 | Light / dark | Both schemes match FR41 and FR42 | template | open |

## 3. The boundary: library or template?

**The rule.** The library holds what any dense application would need, reached through a public seam; the template holds everything that makes it look like Figma. Ask, in order, for every gap:

1. **Is it reachable already?** Can the template get the look through a public seam: semantic tokens or its own `t.design.*` tokens, the theme (colour config, type scale choice), density, a component's documented size/appearance prop, a slot, view data, or a template part? If yes: **template**. Done.
2. **Would a second, unrelated UI need it?** Name one (a video editor, an IDE, a spreadsheet, a dashboard). If you can name it and it is about *structure or behaviour* (a dense row size, a touching button group, a menu shortcut column, a panel width token, a filled field appearance): **library**, added as a generic prop, variant or token, never a "figma" mode.
3. **Is it only a value?** A colour, a radius, a size or a font size on an existing seam: **template theme or tokens**, never a new core default.
4. **Does an owner rule forbid it?** (Switch for binary settings, one-sided borders, 14 px text, 44 px targets.) **Owner decision**: keep the rule in the library; the template may only use what the rule allows (section 5).
5. **Otherwise** (a Figma-only part: the canvas selection overlay, the size label, the tool flyout set): a **template part** in `packages/templates/design/`, built on core parts, styled under `[data-dl="design-*"]` with `t.design.*` tokens ([Customization: always inside a template](foundation.md#customization-always-inside-a-template)). A part two templates need is a promotion candidate, by a core change with its own review.

**Never in the library:** Figma's colours, the accent `#0D99FF` as a default, a `figma` variant or flag, Figma names in props or tokens, Figma pictures or glyphs (enforced by `npm run check:generic`, [tools/check-generic.mjs](../tools/check-generic.mjs), part of `npm run check`). The consumer guide states the same test: [Customize a template or extend the library?](../packages/core/guide/6-templates.md#customize-a-template-or-extend-the-library). **Never in the template:** a fork, wrapper-replace or restyle of a core component's `data-dl` markup, `!important`, raw values outside its tokens.

**Worked examples from the earlier audit** ([Design tool audit](design-tool-audit.md)):

| Audit row | Need | Decision | Why |
| --- | --- | --- | --- |
| DT1 | Floating tools bar | library (EditorLayout `tools` slot, FloatingBar) | Structural; any canvas app (whiteboard, map editor) has one |
| DT9 | 32 px rows | library (TreeView `size="s"`) | Dense lists exist in IDEs and file managers |
| DT11 | Row actions on hover | library (TreeView trailing slot) | Generic; the eye/lock glyph choice is template content |
| DT14 | Two-column field rows | library (PropertyRow) | Any inspector (IDE, video editor) |
| DT16 | Touching align buttons | library (Cluster `gap="none"`) | Generic grouping |
| DT19 | Eye vs Switch for visibility | owner | Owner rule: binary settings use a Switch |
| DT25 | Selection colours list | template | Content arrangement only |
| DT27 | Interaction summaries with a popover | template content on a library Popover | Arrangement, not a new part |
| DT29 | Zoom and Share placement | template | Placement inside slots |
| DT30 | Property labels view option | template, Switch per owner rule | Content and a library Switch |

This run's first calls: FR4 panel width → a library **token** for EditorLayout panel width if not already a seam, value 240 in the template theme; FR12 toolbar 48 px/radius → library FloatingBar size and radius **tokens** (values in the template); FR14 filled selected tool → library **appearance** of SegmentedControl/Toolbar if absent (a video editor's tool rail needs it too); FR30 filled fields → library field **appearance** ("filled", generic: search bars, chat composers); FR20–FR21 selection and size label → **template parts**; FR41–FR42 colours → **template theme**.

## 4. Gap log

One row per shortcoming, appended by the evaluator, completed by the builder. A gap closes only when the evaluator re-measures it.

| Gap | FR | Shortcoming (measured) | Diagnosis | Fix | Level | Commit | Re-measured |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | FR4 | Panels 256 px; ref 240 px | EditorLayout panel width fixed in core (DT6 kept 256) | Width as a token the template sets to 240 | library seam + template value | — | — |
| G2 | FR43, FR41 | UI text 14 px; ref 11 px | Owner rule (14 px) and no template type-scale seam for dense chrome | Pending OD1; meanwhile 14 px | owner | — | — |
| G3 | FR12 | Tool bar 45 × 279 px, radius 4 px; ref 48 px, radius ≈ 13 px, white | FloatingBar takes the material token and `radius.sm` | Size and radius tokens on FloatingBar; template values | library seam + template value | — | — |
| G4 | FR13, FR15 | 7 flat tools (Hand, Rectangle, Ellipse separate), no flyouts, no Pen/Actions/mode switch | Content and missing flyout pattern | Tool groups with flyouts; mode switcher | template (+ library MenuButton top placement if missing) | — | — |
| G5 | FR14 | Selected tool is a tinted segment; ref filled accent with white glyph | SegmentedControl has no filled-selected appearance | Generic `appearance` option | library | — | — |
| G6 | FR30 | Fields transparent; ref `#F5F5F5` fill, no border | Field has outline appearance only | Generic filled field appearance (token-driven) | library | — | — |
| G7 | FR1, FR2 | No left panel head (menu, file name, project) and no File/Assets tabs | Template content | Add head and tabs | template | — | — |
| G8 | FR42 | Dark surfaces `rgb(24, 24, 28)`; ref `#2C2C2C` panels, `#1E1E1E` canvas | Template uses core dark theme | Template theme dark values | template | — | — |
| G9 | FR3 | Right panel head order differs (people, zoom, Share, Hide) | DT29/DT33 layout | Avatar ▾, Present ▾, Share; zoom moves to the tabs row (FR23) | template | — | — |
| G10 | FR6, FR8 | Page and layer rows 32 px; R11 highlight 24 px | TreeView `size="s"` is the smallest row (DT9 chose 32 from an unscaled reading) | A 24 px dense row, as a TreeView size or row-size token the template sets | library seam + template value | — | — |
| G11 | FR5, FR28 | Section title rows: ours a 24 px head row (DT13; first field row 32 px below the section top in the baseline); R11 40 px with 16 px inset | PropertySection compact head sized for the old reading | Head row height as a PropertySection token; template value 40 | library seam + template value | — | — |
| G12 | FR8 | Layer names truncate at 55 px ("Welcom…", "Passwor…") in a 240 px panel; R2/R11 names run to the row's end | Row actions (or the trailing slot) reserve width at rest | Trailing actions take no width at rest (overlay on hover/focus), name flexes | library (TreeView) | — | — |
| G13 | FR12, FR14 | Tool bar 52 × 311 px, translucent material (`/ 0.85`); tools 36 px on a `#F5F5F5` segmented track; ref 48 px opaque white, 32 px tools straight on the bar | FloatingBar uses the frosted material; SegmentedControl always draws a track | Bar material as a token the template sets opaque; a track-less SegmentedControl appearance (tool rails); 32 px segment size | library seam + template value | — | — |
| G14 | FR6 | Current page row tinted `#E5F4FF` and its name indented about 45 px; ref `#F5F5F5`, name at the 16 px inset | Pages reuse the layer tree's selection tint and icon column | Pages as a flat list (ListItem/RowList) with the current-row fill, or a TreeView with no icon column | template (+ library if the tree can't drop the column) | — | — |
| G15 | FR1, FR5 | Left head: a tinted icon tile beside the file name; Pages collapse is a tinted filled square button; ref plain glyphs (menu ▾, panel toggle, +) with no fills at rest | Template used tinted/filled buttons | Quiet (ghost) icon buttons at rest | template | — | — |
| G16 | FR3 | Share 24 px high; dark Share `#0C8CE9` | Button size `xs`; dark accent from theme | 32 px (Button `s` or a token); dark accent `#0D99FF` like light (ref pending) | template | — | — |
| G17 | FR17 | Dark canvas reads as panel `#2C2C2C`; ref `#1E1E1E` | Template dark theme maps canvas to the panel surface | Canvas role in the template dark theme | template | — | — |

**Evaluation round 0 (interim, 15:20, worker 71's uncommitted state, 823 × 823, light and dark, `tools/figma-replica-measure.js`):** pass FR4 (240/240, `#FFFFFF` / `#2C2C2C`), FR30 (24 px, `#F5F5F5` / `#383838`, radius 5), FR10 light (`#E5F4FF`); fail FR6/FR8 (32 px rows), FR10 dark (`#4A5878`), FR12, FR14, FR23 (active tab without fill), FR3, FR28 (24 px heads), FR17 dark. FR43: panels are at **11 px** (280 text nodes) although OD1 is open: see section 5.

## 5. Owner decisions

Where an owner rule conflicts with Figma, the library keeps the rule (default, Q118.6) and the template uses only what the rule allows. Each waits for the owner; the default applies meanwhile.

| ID | Conflict | Figma | Owner rule | Default now | Template options the rule allows |
| --- | --- | --- | --- | --- | --- |
| OD1 | UI type size | 11 px Inter | Text stays 14 px (DT15, body-sm) | 14 px in the library. **Note (15:20):** the builder's in-progress template already sets 11 px in the editor through the template; that is a template-level choice the owner hasn't made, so it stays flagged here until the owner decides | A template type-scale token for dense chrome at 11–12 px, only if the owner allows it for this template |
| OD2 | Layer visibility and lock | Eye and lock icon buttons that toggle | Binary settings use a Switch, never a button (brief) | Switch `xs` at row end (DT19) | Icon toggle only if the owner treats canvas-object visibility as an object action, not a setting |
| OD3 | Clip content | Checkbox | Switch for binary settings | Switch `xs` | Checkbox if the owner allows it in inspectors |
| OD4 | Targets | 24–32 px controls | 44 px targets, 36/24 px dense sizes by written exception | Dense sizes (24 px fields, 32 px rows) under the dense-surface exception | Same |
| OD5 | Menus | Always dark menus and tooltips in light mode | Menus follow the scheme | Scheme-following menus | A template "inverse" surface token for menus, if allowed |
| OD6 | Brand mark | Figma logo in the menu button | No Figma logos (Q118.6) | A neutral look-alike glyph | — |

## 6. The loop and when it ends

1. **Build** (worker 71): fix the gaps sent, at the owning level (token, layout, compound, part, then content; never the rendered page, an override or an allow-list), run `npm run check`, and say which FR rows are `review`.
2. **Evaluate** (worker 70, who did not build it): open the editor in an isolated browser page (no OS input), at the comparison viewport, light then dark; run `window.replicaMeasure()` from [tools/figma-replica-measure.js](../tools/figma-replica-measure.js) (template-specific, so it is deliberately not a `*-probe.js` and never ships in core) for the measurable rows, measure the rest with computed styles and the probes (`tools/spacing-probe.js`, `tools/noise-probe.js`, `tools/scroll-probe.js`, `tools/context-probe.js`); put the screenshot beside the reference at the same scale; mark `pass` or `fail` with the number, and log each fail as a gap with its diagnosis and owning level by the test in section 3.
3. **Send** the next prioritized gap list to worker 71; repeat.

**Exit:** every FR and FB row is `pass` (or `decision` with the owner's default applied and recorded), the gap log has no open row, `npm run check` passes, and the library gained nothing Figma-specific (`npm run check:generic` passes: no product name in core identifiers, selectors or tokens, no `#0D99FF` default, no template token namespace in core; comments may cite Figma as a reference). The owner judges "can't tell the difference"; this page proves everything that can be measured.
