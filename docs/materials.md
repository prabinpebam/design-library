# Materials and backgrounds

**In the library:** [Materials](http://127.0.0.1:8766/#/materials) and [Elevation and layering](http://127.0.0.1:8766/#/elevation), live.

> **TL;DR:** A material is the stuff a surface is made of: what it shows of what's behind it, how far it sits above the page, and how it lets text on it stay readable. This library has **ten material roles**, from the page canvas up to the scrim. Components read the roles and never mix their own backgrounds. **Frosted** is not a separate material: it's the *finish* of the two floating roles (chrome and floating surfaces), switched on or off by **one global token setting** that is part of the [token presets](foundation.md#token-presets-q70). Frosted always has a solid fallback and turns solid for reduced transparency, more contrast, forced colours, print, unsupported browsers and wherever the worst-case backdrop would break 4.5:1. The optional UI Lighting and Liquid Glass add-on sits above the core and plugs in through the same roles, a public `data-material` slot and its own token namespace, never by forking a component. This page is the framework (F15.MAT1), the [audit of the library](#audit-report) against it and the [build plan](#build-plan) (F15.MAT2). Nothing here is approved or built yet.

**Owner, 2026-11-08 23:22 (verbatim, [DoD Q73](definition-of-done.md#owner-instructions)):** *"We need to have a thorough and complete framework around materials and bg. - What's the purpose of materials - What are the different kind of materials that can be used - When to use what material - When is frosted bg to be used? We want to use frosted bg where applicable. This can be anoptional thing that can be enable or disabled at the global token level. --- Remember we still have a customization layer for UI lighting and Liquid glass effect that's an optional customization we want to be able to do. Plan everything with that architecture in mind."*

**Status:** framework draft for review (strict design, docs only). Shaped by `ground`, `assumptions`, `design-system`, `visual-noise`, `ui-states`, `performance` and `perceived-performance`; builds on the [colour model](foundation.md#colour-model), [Q71 control fills](foundation.md#controls-are-told-apart-by-fill-not-outline-q71), [layers](foundation.md#layers-z-index), [motion](motion.md) and the brief's [optional add-ons](brief.md#optional-add-ons-and-integrations). Stable IDs: promises **AP**, jobs **AJ**, user-can **AU**, principles **A**, materials **MT**, frosted places **FR**, rules **AR**, tokens **AT**, add-on seams **AS**, assumptions **AA**, decisions **AD**, done rows **AV**.

## Grounding: what materials promise

| # | Promise | What breaks it |
| --- | --- | --- |
| AP1 | You always know what's content and what's the tool working on it. | Chrome and content made of the same stuff; a toolbar that looks like a card. |
| AP2 | You can tell how far above the page something sits, and what it's covering. | Popovers with no edge or shadow; dialogs over an undimmed page; three shadow styles for one level. |
| AP3 | Text and controls on any surface stay readable, whatever scrolls behind them. | Translucent bars over photos with grey text; glass over glass. |
| AP4 | One choice changes the finish everywhere, and turns off cleanly. | Frosted hard-coded per component; a switch that leaves half the surfaces translucent. |
| AP5 | Your system settings win. | Translucency that ignores reduced transparency or more contrast. |

| # | Job (when…, I want…, so I can…) |
| --- | --- |
| AJ1 | When I scroll a long page under a sticky header, I want to sense the content passing beneath, so I keep my place without losing the header. |
| AJ2 | When a menu or popover opens over content, I want it to read as on top and temporary, so I know a click outside will close it. |
| AJ3 | When I choose a look for a product (a preset), I want frosted or solid to be one setting, so I can compare and decide quickly. |
| AJ4 | When I add the optional glass or lighting add-on, I want it to apply to the right surfaces without rewriting components, so removing it gives me back the plain library. |

**A person can:** AU1 tell content from chrome on every page and template; AU2 see the level of a floating surface from its fill, edge and shadow; AU3 read every text role at 4.5:1 on every material in all four contexts; AU4 switch frosted on or off once and see every frosted surface follow, in every tab; AU5 get solid surfaces automatically when they ask the system for less transparency or more contrast; AU6 add or remove an effect add-on on chosen surfaces with the core unchanged underneath.

## What materials are for

A material does three jobs, and only these:

1. **Separate layers.** Content sits on the canvas; tools float above it; a modal blocks everything below. The material says which layer a surface belongs to ([Apple HIG](#sources): "a visual effect that creates a sense of depth, layering, and hierarchy between foreground and background elements").
2. **Say how far above.** Elevation is shown by a lighter or darker tone first and a shadow second ([Material 3](#sources): tonal elevation; shadows only where separation needs them). In dark mode, nearer is lighter.
3. **Keep a sense of place.** A translucent finish lets content show through chrome, so a person knows what's beneath without it competing ([Fluent acrylic](#sources), [Apple standard materials](#sources)).

Anything else (brand moods, decoration, "premium" sheen) is not a material's job; it belongs to colour or to the optional add-on.

## Principles

| # | Principle |
| --- | --- |
| A1 | **Roles, not recipes.** A component names the material it is (`canvas`, `floating`…); the tokens decide how it's painted. No component mixes colours, alphas or blurs. |
| A2 | **Tone first, shadow second, edge last.** Follow the visual-noise cue order: a fill step separates; a shadow adds height only for surfaces that float; a hairline only where tone can't (more contrast raises edges). One cue per meaning. |
| A3 | **Two layers, kept apart.** The content layer (canvas, wells, raised cards, control fills) is always solid. The functional layer (chrome and floating surfaces) may be frosted. Never frosted in the content layer ([Apple HIG](#sources): don't use glass in the content layer). |
| A4 | **Frosted is a finish, not a material.** It applies only to `chrome` and `floating`, and is one global switch. Turning it off changes no layout, size or contrast; the solid finish is the same role at full opacity. |
| A5 | **Never glass on glass.** A frosted surface never sits on another frosted surface; the inner one goes solid. |
| A6 | **The worst backdrop decides.** A frosted tint must keep every text role at 4.5:1 and identifying non-text at 3:1 over a uniform black (light) or white (dark) backdrop, without counting on blur. |
| A7 | **Settings win.** Reduced transparency, more contrast, forced colours and print are solid, always. |
| A8 | **Values interpolate; finishes switch.** Fills and shadows ease (M3, motion); the frosted switch and context changes land in one frame (Q65 M10); blur radius never animates. |
| A9 | **Add-ons decorate above, never replace.** The core paints a complete, accessible surface; an add-on may draw over a registered surface and must leave it whole when it's removed. |

## The material roles

Ten roles. Most exist today under colour names; the new ones are marked. *Opaque* means the role is solid in every context.

| # | Material | Layer | What it is | Token (today → proposed) | Opaque | Elevation cue |
| --- | --- | --- | --- | --- | --- | --- |
| MT1 | **Canvas** | content | The page itself; what everything else sits on. | `color.bg` | yes | none |
| MT2 | **Sunken (well)** | content | A region set into the page: navigation rail, code, sidebars, board columns, empty tracks. | `color.bg-sunken` | yes | one tone step *down* |
| MT3 | **Raised (surface)** | content | A card, panel or field set onto the page. | `color.bg-raised` | yes | one tone step *up*; hairline `color.border` where tone can't separate |
| MT4 | **Tint** | content | A neutral fill that marks one item among many: current page, a person's chat bubble, selection. | `color.bg-tint` | yes | none (a state, not a height) |
| MT5 | **Control fill** | content | The fill that tells a control from its surface (Q71). | `color.bg-control` | yes | none; soft `color.border-control` |
| MT6 | **Chrome** (new) | functional | Bars that stay while content moves: sticky site and app headers, the library title bar, toolbars docked to an edge, the chat composer bar. | new `material.chrome.bg` (today `bg` or `bg-raised` per component) | frosted when on | tone; a hairline only at the edge content scrolls under |
| MT7 | **Floating** (new) | functional | Transient or free surfaces above content: popovers, menus and select lists, date pickers, tooltips, the floating toolbar, notification pills, sheets. | new `material.floating.bg` (today `bg-raised`, `c.popup.bg`) | frosted when on | `shadow.raised` (anchored) or `shadow.overlay` (free); hairline `color.border` |
| MT8 | **Modal** | functional | A surface that blocks the page: dialogs, the lightbox's frame. | `color.bg-raised` + `shadow.overlay` | yes, always | shadow + the scrim beneath |
| MT9 | **Scrim** | functional | Dims what a modal blocks ([Fluent smoke](#sources), [Material 3 scrim](#sources)). | `color.bg-overlay` | translucent by nature | — |
| MT10 | **Media veil** (new) | functional | A dimming layer under controls that sit on photos or video (a carousel's arrows, a hero's text, an image's caption). | new `material.veil` | translucent by nature | — |

**Not materials:** accent, status and category fills (colour roles with meaning), state layers (`state.hover`, `state.pressed`, `state.selected`: interaction, laid over any material) and skeleton fills (loading).

### Elevation: one ladder

| Level | Layer token (`layer.*`) | Material | Shadow | Example |
| --- | --- | --- | --- | --- |
| −1 | base | MT2 sunken | none | nav rail, code block |
| 0 | base | MT1 canvas | none | the page |
| 1 | base | MT3 raised, MT4 tint, MT5 control | none (hairline when needed) | card, field |
| 2 | sticky | MT6 chrome | none, or a hairline where content scrolls under | sticky header, title bar |
| 3 | popover, toast, tooltip | MT7 floating | `shadow.raised` anchored; `shadow.overlay` free | menu, floating toolbar, notification |
| 4 | overlay, dialog | MT9 scrim + MT8 modal | `shadow.overlay` | dialog, sheet over a scrim |

In dark mode each step up is one base tone lighter (canvas 900, raised 850, control 800); shadows still mark floating levels but carry less, so the tone step does the work ([Material 3](#sources) tonal elevation). In more contrast every level gains a 3:1 outline and frosted is off.

## When to use which

| You're building… | Use | Not |
| --- | --- | --- |
| A page or screen (layout, template) | MT1 canvas; MT2 for rails and sidebars | raised panels for whole regions (enclosure noise) |
| A card, tile, panel inside content | MT3 raised | chrome or floating; shadows at rest |
| A form control's box | MT5 control fill | raised + strong outline (Q71) |
| The current item in a list or nav | MT4 tint | accent fills for neutral selection |
| A bar that stays while content scrolls | MT6 chrome | floating (no shadow at rest for chrome) |
| A popup anchored to a trigger | MT7 floating + `shadow.raised` | modal |
| A free floating toolbar or notification | MT7 floating + `shadow.overlay` | chrome |
| A sheet (side panel over content) | MT7 floating when it doesn't block (no scrim); MT8 modal when it does | frosted over a scrim |
| A dialog | MT8 modal over MT9 scrim | frosted (the scrim already separates; text-heavy) |
| Controls over a photo or video | MT10 veil under them | frosted pills over busy media without a veil |

**By tier.** Tokens own the materials and their contexts. Fundamentals read MT3–MT5 (fields, buttons, chips) and never chrome or floating. Compounds that float (Popover, MenuButton list, Select list, DatePicker, Tooltip, FloatingBar, Notifications, Sheet, Dialog) read MT7–MT9. Layouts own MT1, MT2 and MT6 (SiteLayout header, AppLayout, EditorLayout, ChatLayout bars, LibraryLayout title bar). Templates never paint a material; they choose layouts and parts.

## Frosted

### Where frosted applies

Frosted applies to every MT6 chrome and MT7 floating surface, **when the global setting is on** and nothing below forces solid:

| # | Place | Role | Why it's worth it |
| --- | --- | --- | --- |
| FR1 | Sticky site and app headers (SiteLayout, AppLayout, ChatLayout top bar) | chrome | content scrolls under (AJ1) |
| FR2 | The library title bar and the Design tool's top bar | chrome | as FR1 |
| FR3 | FloatingBar (template preview toolbar, Design tool tools) | floating | sits over the canvas and pages |
| FR4 | Popovers, menus, select and combobox lists, date and colour pickers | floating | transient, light-dismiss ([Fluent acrylic](#sources): "used only for transient, light-dismiss surfaces") |
| FR5 | Tooltips | floating | small and transient; solid when its text is long |
| FR6 | Notification pills | floating | over any page |
| FR7 | Non-blocking sheets and inspector panels that overlap content | floating | content stays visible beside them |
| FR8 | Chat composer bar over the conversation | chrome | messages scroll under it |

**Never frosted:** content surfaces (cards, panels, tables, forms, code), control fills, dialogs and blocking sheets (the scrim separates and they hold forms or long text), anything inside a frosted surface (A5), long-reading surfaces, and surfaces that don't overlap content (a header above a page that never scrolls under it gains nothing).

### The recipe (tokens, not components)

A frosted surface is the role's solid colour at a tint opacity, plus a backdrop filter:

| Token | Light | Dark | Solid finish |
| --- | --- | --- | --- |
| AT1 `material.chrome.bg` | `bg` at 80 % | `bg` at 85 % | `bg` (100 %) |
| AT2 `material.floating.bg` | `bg-raised` at 80 % | `bg-raised` at 85 % | `bg-raised` |
| AT3 `material.backdrop` | `blur(20px) saturate(1.6)` | `blur(20px) saturate(1.4)` | `none` |
| AT4 `material.veil` | black at 35 % ([Apple HIG](#sources)) | same | same (a veil is always translucent) |
| AT5 `material.frosted` | `on` / `off`: the global switch, a context like space and shape | | |

**Why 80 % and 85 %.** Measured against the worst uniform backdrop with no help from blur (A6): over black, the light tint keeps `text-muted` at 4.59:1 at 80 % (4.01:1 at 75 %); over white, the dark tint keeps `text-muted` at 4.09:1 at 80 % and 4.86:1 at 85 %. Body text is far above (11:1 and 9:1). So 80 % (light) and 85 % (dark) are floors; a check holds them.

Components write `background-color: var(--material-floating-bg); backdrop-filter: var(--material-backdrop);` and nothing else. The switch is a token context (`data-material="frosted" | "solid"` on the root, a resolver modifier like `space` and `shape`), so turning it off re-declares the tokens as their solid values and no component changes.

### Fallbacks: when frosted goes solid

| # | Condition | Result |
| --- | --- | --- |
| AR1 | Global setting off (`data-material="solid"`) | solid finish everywhere |
| AR2 | `prefers-reduced-transparency: reduce` ([MDN](#sources); Windows "Transparency effects" off, macOS and iOS "Reduce transparency") | solid; overrides the setting |
| AR3 | More contrast (`data-contrast="more"` or `prefers-contrast: more`) | solid + 3:1 outline |
| AR4 | `forced-colors: active` | system `Canvas`, no filter |
| AR5 | `@supports not (backdrop-filter: blur(1px))` | solid (the tint alone would be translucent without blur, so the colour falls back too) |
| AR6 | Print | solid |
| AR7 | Nested in another frosted surface (A5) | the inner one solid |
| AR8 | Long text (a tooltip or popover with more than about two lines, or any scrolling content) | solid, set by the component's own mode, not by a separate role |

### Contrast, performance and motion rules

| # | Rule |
| --- | --- |
| AR9 | Tint floors (80 % light, 85 % dark) are checked in `tokens:check` against the worst uniform backdrop for `text`, `text-muted`, `focus` and `border-strong`. |
| AR10 | Blur radius at most 24 px; one blur value for the whole library. |
| AR11 | No frosted surface larger than about half the viewport at once (sheets count); a larger one goes solid. Backdrop filters cost a compositing pass over their area each frame they or their backdrop change. |
| AR12 | Never animate `backdrop-filter` or the blur radius; enter and exit fade and scale the surface (motion M6) with the filter already set. |
| AR13 | No `will-change` for frosted; no frosted on items in long lists. |
| AR14 | Frosted on/off is a context switch in one frame (`suspendMotion`), never a fade. |
| AR15 | Measure before claiming: scroll and open/close cost with frosted on vs off on the Design tool and a long template page (performance skill; proposed budget, not a result). |

## Global setting and presets

Frosted is one setting, `material: frosted | solid`, stored like space and shape (`design-library.material`), applied as `data-material` on the root, followed live by every tab, window and preview (Q70). It joins the token presets as a sixth category, **Material**, with two built-in presets (Frosted, Solid) and global presets choosing one (working default: Theme default = frosted, Dense tool = solid). The theme's own default is set in a config beside `space-shape.config.json`.

## The optional add-on layer (UI Lighting, Liquid Glass)

The brief's [add-on contract](brief.md#optional-add-ons-and-integrations) asks for public seams only. Materials are those seams:

| # | Seam | What the core provides | What an add-on may do |
| --- | --- | --- | --- |
| AS1 | **Surface slot** | Every chrome, floating and modal surface carries `data-material="chrome" \| "floating" \| "modal"` and `data-elevation="2" \| "3" \| "4"` (public, documented, stable) | Find its host surfaces by these attributes only; never by component internals |
| AS2 | **Material tokens** | `--material-*` and `--color-bg-*`, `--shadow-*` as exported roles | Read them; set only its own namespace (`--glass-*`, `--lighting-*`) |
| AS3 | **Context** | `data-material` modifier with a reserved third value, `effect`, meaning "an add-on paints this finish": the core paints the solid finish underneath | Set `effect` on the scopes it owns; remove it to restore |
| AS4 | **Layer** | A dedicated cascade layer `addons` after `components`, and an empty decoration slot (`::before` reserved on material surfaces, under content) | Paint in that layer and slot; never style foreground text or controls |
| AS5 | **Preferences** | The fallbacks AR2–AR6 resolve first and set `data-material="solid"` | Must stand down whenever solid is forced |

**Liquid Glass for Web** maps to AS1–AS4 on FR3–FR6 compact floating surfaces only (the brief restricts glass to compact floating and navigation surfaces), with its displacement filter on the slot, never on text. **UI Lighting** reads `data-elevation` and the elevation tokens through AS1–AS2 to cast its shadows and rims; core shadows stay as the fallback. Neither is installed (O14); this page plans the seams so adding one needs no core change.

## Assumptions and risks

| # | Assumption | Risk if wrong | Cheapest check |
| --- | --- | --- | --- |
| AA1 | Frosted chrome and floating surfaces help people keep their place more than they distract. | Busy look; slower reading. | Owner review of the same pages frosted and solid (one switch). |
| AA2 | The 80/85 % floors stay readable in practice even though blur would allow less. | Surfaces look nearly solid, so frosted adds little. | Compare 70 % with a stronger saturate on photos and dense text. |
| AA3 | Backdrop-filter cost is acceptable on the Design tool and long templates. | Janky scroll on low-end GPUs. | AR15 measurement. |
| AA4 | A reserved `effect` context and slot are enough for both add-ons. | UI Lighting still needs `body`-level hooks (brief feasibility gap). | Prototype the adapter against AS1–AS4 before adoption. |

## Open decisions (working defaults)

| # | Decision | Working default |
| --- | --- | --- |
| AD1 | Frosted on by default? | On (the owner wants it where it applies); Dense tool preset solid |
| AD2 | Is the chrome hairline drawn always or only once content scrolls under? | Only when scrolled under (a scroll-driven attribute), to cut resting ink |
| AD3 | Tooltips frosted? | Yes when short (FR5); solid when long |
| AD4 | Non-blocking sheets frosted? | Yes up to about half the viewport (AR11) |

## Definition of Done for materials

| # | Row | Evidence |
| --- | --- | --- |
| AV1 | Every surface in core and templates reads one of MT1–MT10; no literal backgrounds, alphas or backdrop filters outside tokens | a `check:materials` static check |
| AV2 | The frosted switch flips every FR place and nothing else, in one frame, in every tab | open a template and the library, switch once |
| AV3 | AR2–AR6 force solid | emulate each preference |
| AV4 | Text at 4.5:1 and identifying non-text at 3:1 on every material in four contexts, frosted floors included | `tokens:check` |
| AV5 | No glass on glass; no frosted in the content layer | audit table (MAT2) |
| AV6 | Add-on seams AS1–AS5 present and documented; core unchanged with no add-on | slot attributes on every material surface |

## As built

**MB1 (about 00:45, worker 30):** `packages/core/css/materials.css` (tier 0, `tokens` layer) defines `--material-chrome-bg`, `--material-floating-bg`, `--material-backdrop` and `--material-veil`, with `data-material="frosted" | "solid"`, the 85 % tint floor for both schemes (one value; the dark floor decides), and solid forced by more contrast, reduced transparency, forced colours, print and no backdrop-filter support. Hand-authored CSS rather than DTCG: the builder has no composite colour type (as motion T10); leaf switches inherit and composites are re-declared where a leaf changes. [Materials](http://127.0.0.1:8766/#/materials) in the library draws all ten roles in four contexts over stripes (TokenSpecimen `material` kind). Not yet: a `tokens:check` floor test (AR9), no component reads the roles yet (MB3+).

**MB3 (about 23:55, worker 31):** every floating surface reads the floating material: Popover, Tooltip (the hint), Select, MenuButton and Mentions lists (`pickers.css`), DatePicker and DateRangePicker, the ColourPicker panel in its popover, AvatarGroup's popup, FloatingBar and the notification pill write `background-color: var(--material-floating-bg, …)` with `backdrop-filter: var(--material-backdrop)`, so each is frosted when the setting is on and solid otherwise (AR1–AR6 unchanged). Each carries `data-material="floating"` and `data-elevation="3"` (AS1 seam; the global switch keeps the values `frosted` and `solid` on the root, so the two never collide). Anchored popups take `shadow.raised` (`c.popup.shadow`, G3); FloatingBar and notifications keep `shadow.overlay` (free). AR7 in `materials.css`: a floating surface nested in another, other than a top-layer popover, is solid. F4: List sticky group headings paint `--list-surface`, the raised tone inside a floating surface, so no canvas strip crosses a popup. Audit corrections: F5 (`list.css` 148) is the row being dragged, not a popup list, so it stays as is; F8 (cut-out rings) and L5 (Design tool toolbar, Q68 worker) are left for later; Design tool tools that use FloatingBar already inherit this.

**MB4 (about 00:00 11-09, worker 31):** SiteLayout's sticky header (every website template: Corporate, Portfolio, Blog, Conference) is chrome: `--material-chrome-bg` + `--material-backdrop`, `data-material="chrome"` and `data-elevation="2"`, and its hairline shows only while content is under it (AD2: `data-under` from the window's scroll; the border is always there, transparent at rest, so nothing moves). The library TitleBar carries the same attributes and stays solid (L6: nothing scrolls under it). Audit correction L2: ChatLayout's composer sits below the conversation's own scroll box, so nothing scrolls under it and it stays as is (never-frosted rule); the surface with `bg-raised` + overlay shadow over the conversation is the "jump to latest" button, now floating material with `data-material="floating"`.

**MB5 (about 00:05 11-09, worker 31):** non-blocking surfaces over content are floating material (MT7, FR7), frosted when on: ChatLayout's and AppLayout's sidebars once they overlay the view (below 48 rem), standard Sheets (`modal={false}`, also tagged `data-material="floating"`, `data-elevation="3"`), and the library's Revision pane when it's a bottom sheet (half the screen at most). AR11 is enforced in CSS: drawers go solid in containers under 32 rem (16 rem drawer over more than half), standard sheets s/m under 52 rem and l under 80 rem windows. Dialog, the modal Sheet and Lightbox are MT8 and stay solid, tagged `data-material="modal"`, `data-elevation="4"`. Left for the Q68 worker: EditorLayout's overlaid panels (L4). Drawers carry no attribute (they are content in wide windows; a CSS-only switch); bottom sheets are not sized against AR11 yet.

**MB6 (about 00:08 11-09, worker 31):** re-audit of every place a control or text sits on a picture or video found only one: ImageGeneration's status pill over the generating picture, now floating material (frosted when on, `data-material="floating"`). The rest of the C5–C8 and T1 findings were wrong on a closer read, so no veil was added: Lightbox puts Previous, Next and the caption beside the picture, never over it (C5); Carousel's controls are a row under the slides (C6); MediaPlayer's play button (primary, accent) and length badge (strong neutral) over the poster are opaque and contrast-checked already (C7); no Hero layout puts words over a picture (T1: split and stacked only). `--material-veil` stays a ready role (Materials page) for the first cover layout, a hero or caption over a picture, which must put it under its words.

**MB7 (about 00:10 11-09, worker 31):** `npm run check:materials` (`tools/check-materials.mjs`) enforces AV1 and the rules around it: M1 backdrop filters only through `--material-backdrop` and one blur ≤ 24 px (AR10); M2 no translucent literal backgrounds outside `materials.css`; M3 every frosted fill paired with the backdrop; M4 frosted only in the 14 listed FR places; M5 `backdrop-filter` never animated (AR12); M6 the AR7 nesting rule and AR1–AR6 fallbacks present; M7 the tint floor (AR9, which MB1 left open): 32 pairs pass at 85 %, the weakest dark floating over white, `border-strong` 3.07:1 against 3:1, so the tint can't go lower without a stronger border. One named exception: the Materials page specimen draws `material.backdrop` by name. The add-on seams (AS1–AS5) and the `addons` cascade layer (G6) are documented in [Foundation](foundation.md#materials-and-add-on-seams-q73). Not built: AS3's reserved `effect` value; AV2/AV3 are checked by opening the pages, not by this script.

## Audit report

F15.MAT2 (2026-11-08): every surface in `packages/core/css`, the library app and the templates read against the framework. Severity: **H** breaks a promise or a rule, **M** inconsistent or missing a role, **L** naming or polish. "Today" is what the CSS reads now.

### Global and tokens

| # | Finding | Sev | Fix (packet) |
| --- | --- | --- | --- |
| G1 | No material roles exist: chrome, floating and veil surfaces each pick `bg`, `bg-raised` or a component alias; nothing says what layer a surface belongs to. | H | AT1–AT4 tokens (MB1) |
| G2 | No frosted finish, no `material` context, no global switch; nothing honours `prefers-reduced-transparency`. | H | `material` modifier + fallbacks (MB1, MB2) |
| G3 | `shadow.raised` is described as "menus, popovers", but `c.popup.shadow` reads `shadow.overlay`; the ladder's anchored vs free distinction isn't followed. | M | Popups read `shadow.raised` when anchored; free floating keeps `overlay` (MB3) |
| G4 | No `data-material` / `data-elevation` attributes on any surface: the add-on seam AS1 is absent. | M | Set by each floating, chrome and modal component (MB3–MB5) |
| G5 | No literal colours in core, template or app CSS (rgba, hex, hsl): every fill already goes through tokens. | — (holds) | keep with `check:materials` (MB7) |
| G6 | Correction: the `addons` cascade layer already exists last in `css/index.css`; AS4 needs only its documented use. | — | document (MB7) |

### Fundamentals (content layer: solid, MT3–MT5)

| # | Component | Today | Finding | Sev | Fix |
| --- | --- | --- | --- | --- | --- |
| F1 | Fields, Select trigger, DateField, TimeField, TagInput, NumberField, code cells | `bg-control` (Q71) | Already MT5 | — | none |
| F2 | Button default, MenuButton, Chip, RadioGroup tiles | `bg-control` (Q71) | Already MT5 | — | none |
| F3 | Card outlined | `bg-raised` + `border` | MT3, correct; media well `bg-sunken` MT2 | — | none |
| F4 | List sticky group headings (`data-sticky`) | `bg` | Inside a popup (Select list) the heading paints canvas `bg` over a `bg-raised` popup: a visible strip, and an opaque band over a frosted popup | M | headings read the surrounding material (`inherit` from the list's surface token) (MB3) |
| F5 | List popup variant (`list.css` 148) | `bg-raised` + `shadow.raised` | Floating list: should be MT7 | M | `material.floating.bg` (MB3) |
| F6 | Tooltip | `c.popup.bg` | MT7, frosted when short (FR5) | M | MB3 |
| F7 | Popover, MenuButton list, Select list (pickers.css), DatePicker, ColourPicker, AvatarGroup popup | `c.popup.bg` / `bg-raised` + `shadow.overlay` | MT7 anchored; frosted candidates (FR4) | M | MB3 |
| F8 | Badge, AllocationSlider, GradientEditor | `bg` as a cut-out ring | Not a material (a knock-out matching the canvas); breaks when placed on raised or control surfaces | L | read a `--surface` variable the material sets (MB3, optional) |

### Compounds

| # | Component | Today | Finding | Sev | Fix |
| --- | --- | --- | --- | --- | --- |
| C1 | FloatingBar | `c.floating-bar.fill` = `bg-raised`, `shadow.overlay`, fixed | MT7 free floating, FR3 | M | MB3 |
| C2 | Notifications pill | `bg-raised` + `shadow.overlay`, fixed | MT7, FR6 | M | MB3 |
| C3 | Sheet | `bg-raised` + `shadow.overlay` over `bg-overlay` scrim | Blocking: MT8 modal, stays solid (correct). Needs `data-material="modal"`. A non-blocking variant doesn't exist yet | L | attribute (MB5) |
| C4 | Dialog | `bg-raised` + `shadow.overlay` over scrim | MT8, correct; attribute only | L | MB5 |
| C5 | Lightbox | `bg` filling the window | MT8 full-bleed; its arrows and caption over the picture have no veil (MT10) | M | `material.veil` behind controls over media (MB6) |
| C6 | Carousel | `bg-sunken` controls area | Arrows over slides lack a veil when they overlap media | M | MB6 |
| C7 | MediaPlayer | `bg-sunken` | Controls over video need MT10 | M | MB6 |
| C8 | ImageGeneration status | `bg-raised` + `shadow.raised` over the image | Floating over media: MT7 with a veil-strength floor, or MT10 | L | MB6 |
| C9 | Canvas frame | `bg` + `shadow.raised` on `bg-sunken` | Content (an artboard), correct; shadow is an artboard cue, not elevation | — | none |
| C10 | ContextMatrix sticky label | `c.context-matrix.label-bg` = `bg` | Content-layer sticky label; stays solid (not chrome) | — | none |
| C11 | Board, Agenda, Composer, ConversationList, TreeView, SiteHeader items, AlignmentPicker | sunken, raised, tint | Content materials, correct | — | none |
| C12 | TokenSpecimen, CodeBlock, DataTable head, EmptyState, FileUpload, Footer, Image | sunken / raised | Correct | — | none |

### Layouts and the library app

| # | Layout | Today | Finding | Sev | Fix |
| --- | --- | --- | --- | --- | --- |
| L1 | SiteLayout header (sticky) | `bg`, content scrolls under | MT6 chrome, FR1: the main frosted case on every website template | H | `material.chrome.bg` + hairline when scrolled under (AD2) (MB4) |
| L2 | ChatLayout composer bar | `bg-raised` + `shadow.overlay` over the conversation | MT6 chrome (FR8), not floating: shadow at rest is noise | M | MB4 |
| L3 | ChatLayout, AppLayout narrow sidebars (overlay mode) | `sidebar-fill` = `bg-sunken` + `shadow.overlay` | Overlay drawers: non-blocking MT7 (frosted up to AR11's size) or MT8 with a scrim | M | MB5 |
| L4 | EditorLayout bar and panels | `bg`; narrow panels overlaid with `shadow.overlay` | Bar is chrome but content doesn't scroll under it (no frosted gain); overlaid panels are MT7 | M | panels MB5; bar attribute only |
| L5 | EditorLayout tools (Design tool toolbar) | owned by the Q68 worker | Floating over the canvas: MT7 via FloatingBar | M | MB3 (after Q68 settles) |
| L6 | LibraryLayout title bar | grid row, content never under it | Chrome without overlap: stays solid (never-frosted rule) | — | attribute only |
| L7 | LibraryLayout narrow aside (Revision pane) | `bg-raised` + `shadow.overlay`, fixed, no scrim | Non-blocking sheet: MT7, frosted within AR11 | L | MB5 |
| L8 | Skip link (library.css 23) | `bg-raised` | Transient; solid is right | — | none |

### Templates

| # | Template | Finding | Sev | Fix |
| --- | --- | --- | --- | --- |
| T1 | Corporate, Portfolio, Blog, Conference | Sticky site header over hero pictures and long pages: the clearest frosted gain (L1); hero text over pictures has no veil | H | MB4, MB6 |
| T2 | Chat | Composer chrome (L2); sidebar drawer (L3) | M | MB4, MB5 |
| T3 | Project management (AppLayout) | Drawer (L3); otherwise content materials | L | MB5 |
| T4 | Design tool | Floating tools and panels (L4, L5); canvas correct | M | MB3, MB5 |
| T5 | Conference's own parts (sponsor wall, countdown, sponsors layout) | Read core roles only; no material of their own | — | none |
| T6 | Standalone template FloatingBar (Light/Dark, presets) | C1 | M | MB3 |

**Same-wrapper and motion check.** No surface animates `backdrop-filter` today (none exists); popups already enter by fade and scale (motion M6), which AR12 keeps.

### Build plan

Each packet is one openable result, interleaved with the Q70 preset packets.

| Packet | Builds | Opens at | Depends on |
| --- | --- | --- | --- |
| **MB1** material tokens | AT1–AT4 in light and dark; `material` resolver modifier (`frosted`, `solid`) with a `material.config.json` (theme default frosted, AD1); solid forced by `prefers-reduced-transparency`, more contrast, forced colours, print and `@supports not (backdrop-filter)`; tint floors checked in `tokens:check` (AR9); a Materials library page showing MT1–MT10 over a busy backdrop | library Materials page | — |
| **MB2** the frosted switch | `design-library.material` store, `data-material` on the root, live across tabs; Material as the sixth Q70 preset category (Frosted, Solid); global presets updated | any template, the library | MB1, F15.P1 |
| **F15.P2** preset Dialog | Settings button in the template FloatingBar and the library title bar: global preset plus per-category presets, Material included | template toolbar | MB2 |
| **MB3** floating surfaces | Popover, pickers, Select and MenuButton lists, DatePicker, ColourPicker, AvatarGroup, Tooltip, FloatingBar, Notifications read `material.floating.*`; anchored popups on `shadow.raised` (G3); `data-material`/`data-elevation` (G4); List sticky headings inherit (F4) | Popover, Select, FloatingBar pages | MB1 |
| **F15.P3** save presets | Create, name, save, rename, delete per category and global | preset Dialog | F15.P2 |
| **MB4** chrome | SiteLayout header and ChatLayout composer on `material.chrome.*`; hairline only when scrolled under (AD2) | Corporate home, Chat | MB1 |
| **MB5** sheets, drawers, modals | non-blocking drawers and the Revision pane as MT7 within AR11; Dialog, blocking Sheet, Lightbox tagged MT8 | narrow library, Chat drawer | MB3 |
| **MB6** media veil | `material.veil` under controls and text over pictures and video (Lightbox, Carousel, MediaPlayer, ImageGeneration, template heroes) | Carousel, Corporate hero | MB1 |
| **MB7** enforcement and seams | `check:materials` (AV1: backdrop-filter and translucent fills only through material tokens; frosted only on FR roles; no nesting); `addons` cascade layer (G6); the add-on seam section in Foundation | `npm run check:materials` | MB3–MB6 |

## Sources

- Apple, Human Interface Guidelines: [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) (Liquid Glass as a separate functional layer, not for the content layer; regular vs clear variants; a 35 % dimming layer under clear glass over bright media; standard materials, vibrancy; behaviour under reduce transparency and increase contrast).
- Microsoft, [Materials used in Windows apps](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials) and [Fluent 2 Material](https://fluent2.microsoft.design/material): acrylic (frosted, transient light-dismiss surfaces only), Mica (opaque, tinted app base), Smoke (dims beneath a modal).
- Google, Material Design 3: [Elevation](https://m3.material.io/styles/elevation/applying-elevation) (relative distance on the z-axis; tonal elevation, shadows where needed) and [Color roles](https://m3.material.io/styles/color/roles) (surface, surface-container lowest to highest, scrim).
- MDN: [`prefers-reduced-transparency`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency) (Media Queries Level 5; Windows, macOS and iOS settings) and [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter).
- W3C, WCAG 2.2: [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- This project: [Brief, optional add-ons](brief.md#optional-add-ons-and-integrations) (UI Lighting and Liquid Glass candidates, fallbacks, contract), [Motion](motion.md), [Colour model](foundation.md#colour-model), [Token presets](foundation.md#token-presets-q70).
