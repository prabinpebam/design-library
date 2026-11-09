# Modifiers and add-ons

> **TL;DR:** A **modifier** is an optional layer that changes how the library *looks*, never what it *does*: UI Lighting (long shadows from one light) and Liquid Glass (refraction on compact floating surfaces and control thumbs) first, more later. This page studies both kits from their source ([Studies](#studies)), then specifies one architecture every modifier follows and an implementation plan in packets. The core stays complete without any modifier; a modifier plugs in only through public seams (surface attributes, tokens, contexts, the `addons` layer, the preset store) and stands down whenever a person's settings ask for plainness. Spec and plan only: nothing here is built, installed or approved.

**Owner, 2026-11-09 12:03 (verbatim, [DoD Q95](definition-of-done.md#owner-instructions)):** *"We originally planned to integrate the Ui lighting kit. [UI lighting · Loushing](https://prabinpebam.github.io/loushing/items/ui-lighting/) Go through it and figure out details about how exactly this can/should be integrated. This should be an optional layer than can be toggled on/off to apply the effect in the design library. We also intend to integrate liquid glass effect as onme of the materials and apply it to specific fundamental components. We may add more such modifiers later. [prabinpebam/liquid-glass-for-web](https://github.com/prabinpebam/liquid-glass-for-web) We should have a robust scalable architecture that allows for these kind of modifications and addons later. Create detailed architecture design so that we can implement this vision later. No coding, just spec and plan for this for now."*

**Status:** strict design, documentation only (F15.AX1–AX3, worker 45). No code, package, kit file or asset was installed or copied. Builds on [Materials and backgrounds](materials.md) (Q73: roles MT1–MT10, the frosted finish, add-on seams AS1–AS5), the brief's [optional add-ons contract](brief.md#optional-add-ons-and-integrations) (W0d, A8–A13, O11–O17, PD10), [Foundation: materials and add-on seams](foundation.md#materials-and-add-on-seams-q73), [layers](foundation.md#layers-z-index), [Motion](motion.md) and [token presets (Q70)](foundation.md#token-presets-q70). Shaped by `ground`, `assumptions`, `design-system`, `visual-noise`, `ui-states`, `perceived-performance` and `performance`.

**Stable IDs on this page:** study findings **LS** (lighting) and **GS** (glass), conflicts **XC**, promises **XP**, jobs **XJ**, user-can **XU**, architecture rules **XR**, seams **XS**, descriptor fields **XD**, budgets **XB**, guidelines **MG-G / LG-G / GL-G**, checklists **MG-C / LG-C / GL-C**, checks **XK**, done rows **XV**, assumptions **XA**, owner decisions **XO**, packets **AXn / MD-Pn / MDn**.

## Studies

Both kits were read from source on 2026-11-09 (read-only: GitHub pages, raw files and the GitHub API; nothing cloned or installed). Both repositories are the owner's own.

### UI Lighting (Loushing skill `ui-lighting` 0.3.0)

**Source:** [the Loushing card](https://prabinpebam.github.io/loushing/items/ui-lighting/), the [skill at commit `6482839`](https://github.com/prabinpebam/loushing/tree/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting) (still the head of `main` on 2026-11-09, the same pin the brief recorded on 2026-11-06), its `SKILL.md`, [`references/integration.md`](https://github.com/prabinpebam/loushing/blob/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting/references/integration.md), [`references/renderer.md`](https://github.com/prabinpebam/loushing/blob/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting/references/renderer.md), [`references/controls.md`](https://github.com/prabinpebam/loushing/blob/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting/references/controls.md), `assets/lighting.css` and `assets/lighting-host.js`.

**What it is.** One distant light for the whole page. Raised surfaces stand as solid blocks and cast long shadows that stay attached, start crisp and soften with distance by the light's size; overlapping shadows never darken; lit walls bounce their own colour onto the ground; edges are lit on the side facing the light (rims); shadows from tall off-frame objects (or a palm gobo) drift slowly across the page. A **Long shadows** switch turns it on; a **Lighting** panel sets direction, elevation, source size, global illumination, bounce, intensities, tints, off-frame shadows, gobo and motion. It is *not* a drop-shadow system: the card says "Not for: ordinary drop shadows from a design system's elevation tokens".

**How it works.**

| # | Finding | Source |
| --- | --- | --- |
| LS1 | **Kit, not package.** Files are copied into the host unchanged; nothing is installed and there is no build step. `lighting.mjs` (engine, 35.5 KB, pure, no DOM) and `light-renderer.js` (62.7 KB, WebGL2) and `lighting.css` (4.9 KB) are **never edited**; `host-tokens.css`, `lighting-host.js` (adapter), `lighting-panel.js/.css` may be replaced by the host's own. A palm gobo PNG is loaded only when chosen. `scripts/check-lighting.mjs` runs 30 checks (physics against a brute-force ray tracer, CSS and renderer contracts) on the host's copies. | SKILL.md "The kit"; GitHub contents API sizes |
| LS2 | **Casters are marked by `data-elevation="0"`–`"4"`**, heights `[0, 2, 6, 12, 24]` px: 0 flat or sunken (casts nothing, no rims), 1 primary buttons and small raised controls, 2 cards and tiles, 3 highlighted cards and side panels, 4 floating panels. Heights add up through nesting. Only opaque, rounded-rectangle surfaces cast; never text, icons, images or focus rings. The renderer's `selector` option narrows which elements cast, but height and rims always come from the `data-elevation` attribute itself. | SKILL.md step 5; integration.md "Choosing elevations" |
| LS3 | **Rims replace the surface's own `box-shadow`** while lighting is on: `[data-lighting='on'] [data-elevation]:not([data-elevation='0']) { box-shadow: var(--data-light-rim) }`, only under `(forced-colors: none) and (prefers-contrast: no-preference)`. `data-lighting` can sit on any ancestor. | `lighting.css` |
| LS4 | **One page-level layer.** The renderer appends `[data-light-layer]` to `<body>` (no stacking context of its own) holding one canvas per scroll frame, multiplied over the page at `z-index: var(--layer-lighting)`: above all content, below sticky bars, menus, popovers, dialogs and toasts. Content above that layer is not shaded. Up to 8 scroll frames (page, view, sticky surfaces and scroll boxes) follow the compositor through `ScrollTimeline`; only top-sticky surfaces are followed. | renderer.md "What it builds", "Scroll frames" |
| LS5 | **The host must provide:** `html` and `body` each with their own background, `body { isolation: isolate }` (the blend group), `color-scheme` following the theme (the CSS uses `light-dark()`), four host tokens (`--layer-lighting`, `--lighting-dark-tint`, `--color-lighting-ink`, `--size-lighting-panel`), surfaces marked with `data-elevation`, overlays above the layer. Skip the backgrounds or isolation and "a dark page turns white, or shadows vanish". | integration.md "The contract" |
| LS6 | **Theme re-read** happens only when `class`, `data-scheme`, `data-theme` or `style` change on `<html>`, or the system scheme changes. Colours are read through probe elements: the ink, each caster's `background-color` (its albedo for bounce), its corner radius and an optional cut corner (`--light-cut-size`, `--light-cut-corner`). | renderer.md "Colours it reads" |
| LS7 | **Redraws** on scroll, resize, pointer, focus, transition events and any DOM change under `<body>` (a `MutationObserver` and `ResizeObserver`), for 600 ms after each; every 33 ms while off-frame objects move; never while idle. A host that writes styles every frame (a rAF loop) makes it rebuild every frame and restarts sticky timelines. | renderer.md "When it redraws"; integration.md troubleshooting |
| LS8 | **Limits:** 128 casters (nearest first), 8 scroll frames, 32 source wedges, 600 ms settle, 33 ms motion step. Canvases at most 1 device pixel per CSS pixel by default. | renderer.md "Limits" |
| LS9 | **Cost in the reference:** frames held at 4.2 ms, layer work 1.1–2.1 ms per update, p95 4.3 ms in fast scroll, on an RTX 4090 at 240 Hz. "Measure your own host; these numbers are a reference, not a promise." Mobile GPUs not measured. | renderer.md "Performance in the reference" |
| LS10 | **Preferences built in:** reduced motion stops off-frame movement (shadows stay); more contrast, forced colours and print hide the layer and remove rims; page hidden pauses motion; no WebGL2 leaves rims only; no JavaScript leaves the switch disabled with a `<noscript>` note. Saved settings apply when the module loads, "not before first paint". | controls.md "Accessibility and preferences"; renderer.md "Known approximations" |
| LS11 | **Settings** are one validated object (`validateLighting` throws on unknown fields or out-of-range values; `LIGHT_CONTROLS` lists the sliders with labels, ranges and units in panel order), saved to `localStorage` under `${storageKey}.v3`, upgraded with `upgradeLighting(saved, version)`. Defaults: off, azimuth 315°, altitude 0°, source 9°, GI 30 %, bounce 100 %, highlight 15 %, shadow 33 %, tints `#ffdfb3` / `#294573`, off-frame on, gobo none, animated, speed 5. | controls.md "Settings", "Saving" |
| LS12 | **Two integration paths.** The bundled adapter `mountLighting({ storageKey, root, selector, heights, gobos, toggle, panel })` wires its own markup; or the host drives the engine and renderer directly (`validateLighting`, `lightingProperties`, `lightingMotion`, `createLightRenderer({ selector, heights, gobos })`, `renderer.update(settings, { visible, motion })`, `renderer.destroy()`). Its documented recipe for design systems: "Give components an `elevation` prop that writes `data-elevation` … keep the levels data, not styles … put the four host tokens in the token source." | integration.md "Without the bundled adapter", "Design systems and component libraries" |
| LS13 | **Browser support:** certified only in Chromium desktop. Safari and Firefox lack `ScrollTimeline` in some versions (sticky and scrolled shadows can lag); the gobo merges exactly only where `plus-lighter` blending exists. | renderer.md "Known approximations" |
| LS14 | **Accessibility cost it admits:** "Shadows lower the contrast of text they fall on, as real shadows do." | Loushing card, "Good to know" |

**Licence.** The skill's [`about.md`](https://github.com/prabinpebam/loushing/blob/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting/about.md) declares `license: MIT`, `origin: original`, `owner: Prabin Pebam`, and the Loushing card shows "MIT · Original". The GitHub API reports **no repository licence** for `prabinpebam/loushing` (checked 2026-11-09) and the skill folder has no LICENSE file. The declaration is the owner's own; copying the kit into a published package still needs a LICENSE text (or a notice citing the declaration) shipped beside the copies (the brief's gate stands: [First effect candidates](brief.md#first-effect-candidates)).

### Liquid Glass for Web

**Source:** [the repository](https://github.com/prabinpebam/liquid-glass-for-web) at `8b38bd717de1053b73125a6ffa854a02302f156a` (still the head of `master` on 2026-11-09, last push 2026-10-13; the same commit the brief inspected), [`packages/core/README.md`](https://github.com/prabinpebam/liquid-glass-for-web/blob/8b38bd717de1053b73125a6ffa854a02302f156a/packages/core/README.md), [`packages/core/src/glass.ts`](https://github.com/prabinpebam/liquid-glass-for-web/blob/8b38bd717de1053b73125a6ffa854a02302f156a/packages/core/src/glass.ts), [`docs/reference/api-reference.md`](https://github.com/prabinpebam/liquid-glass-for-web/blob/8b38bd717de1053b73125a6ffa854a02302f156a/docs/reference/api-reference.md), [`docs/reference/attribution.md`](https://github.com/prabinpebam/liquid-glass-for-web/blob/8b38bd717de1053b73125a6ffa854a02302f156a/docs/reference/attribution.md), [`docs/reference/design-library/material-usage.md`](https://github.com/prabinpebam/liquid-glass-for-web/blob/8b38bd717de1053b73125a6ffa854a02302f156a/docs/reference/design-library/material-usage.md), the root and core `package.json`.

**What it is.** A framework-agnostic TypeScript engine that makes an element look like a slab of curved glass: the backdrop behind it is **refracted** through a bezel (a displacement map built from Snell's law over a chosen cross-section: convex, concave, lip, flat or custom), with a generated **specular rim**, **chromatic aberration**, optional **frost** (blur) and **tint**. A pnpm monorepo: `@liquid-glass/core` (engine), `@liquid-glass/react` (`useLiquidGlass`, `<LiquidGlass>`), `@liquid-glass/element` (`<liquid-glass>`), `@liquid-glass/ui` (its own token-driven component library) and a hosted Design Library and playground.

| # | Finding | Source |
| --- | --- | --- |
| GS1 | **API:** `liquidGlass(el, options) → { update(partial), setScale(0..1), dispose() }`. Options: `radius` (24), `bezel` (16 in code, 18 in the docs), `thickness` (refractive index, 1.5), `surface`, `scale`, `chromatic` (1), `blur` (2), `specular { opacity, saturation, angle }`, `mode: 'backdrop' \| 'filter'`, `fallback: 'blur' \| 'none'`; `width`/`height` default to the element's box. Low-level exports (`buildDisplacementField`, `toDisplacementMap`, `toSpecularMap`, `buildFilter`, `nextFilterId`) allow a custom pipeline. "Signatures may evolve until 0.1.0." | api-reference.md; glass.ts |
| GS2 | **Pipeline:** surface → displacement field → RGBA displacement map and specular map (rasterised to data URLs on the CPU) → an SVG `<filter>` (`feImage` → `feDisplacementMap`, per-channel for chromatic, `feBlend`) in **one shared hidden `<svg><defs>` appended to `<body>`** (reference-counted, removed with the last handle) → applied as `backdrop-filter: url(#id)`. | core README "How it works"; glass.ts `acquireDefs` |
| GS3 | **It writes inline styles on the element:** `el.style.backdropFilter` (and `-webkit-`), or `el.style.filter` in `filter` mode, cleared on `dispose()`. A `ResizeObserver` per element **rebuilds the maps whenever the box size changes**; `setScale` only rewrites the displacement scale (a "cheap fade"). | glass.ts `applyCss`, `ro`, `setScale` |
| GS4 | **Browser support:** `backdrop-filter: url(#…)` is Chromium-only. Elsewhere `fallback: 'blur'` sets a plain `blur(Npx)` backdrop; `'none'` falls to `filter` mode, which **distorts the element's own content** (text included). | core README; glass.ts `effectiveMode` |
| GS5 | **Maturity:** all packages `0.0.0`, the root package `private: true`, nothing published to npm. Phase 1 (refraction math) done; "Phase 2 (raster map tuning + pixel-snapshot verification against the reference) is in progress". `sideEffects: false`, ESM + CJS via tsup. | core README "Status"; package.json files |
| GS6 | **Placement policy** (its own, from Apple HIG and WWDC25): glass is a functional layer, never the content layer, never glass on glass, applied sparingly. Roles: `glass-control` (switch knob, slider thumb, segmented and tab indicator: always glass, opaque at rest and glass **while held**), `navigation` (bars, sidebars, toolbars), `floating-control` (FAB, carousel arrows over media, mini player), `overlay` (menu, popover, tooltip, toast, compact sheet, command palette), `control` (buttons, fields, checkboxes: solid unless explicitly forced), `content` (cards, tables, forms, alerts: never). Controls inside a glass shell are flat fills, never a second glass. Full-height sheets go opaque. | material-usage.md §3 |
| GS7 | **Accessibility policy:** reduced transparency, increased contrast and forced colours disable the refractive filter and use solid surfaces, "including when forced glass is requested"; reduced motion uses the motion runtime. "A backdrop/filter cannot itself guarantee text contrast." Regular for text-heavy surfaces, Clear only over bright media, with a 35 % dimming layer. | material-usage.md §2 |
| GS8 | **Presets** `clear`, `optic`, `softFrost`, `satin`, `deepFrost`, `milk` vary only size-driven parameters of one engine; "optical-engine demonstration presets, not Apple's native variant API". | README "Material model"; material-usage.md §2 |

**Licence.** The root and core `package.json` say `"license": "MIT"` and the core README says "MIT. Clean-room implementation". The [attribution policy](https://github.com/prabinpebam/liquid-glass-for-web/blob/8b38bd717de1053b73125a6ffa854a02302f156a/docs/reference/attribution.md) says the code is *intended* to ship under MIT and to "add a top-level `LICENSE` file before release"; the GitHub API reports **no licence file** (checked 2026-11-09). Required credit: *"Effect and technique inspired by kube.io's 'Liquid Glass in the Browser: Refraction with CSS and SVG.'"* The playground's kube.io map PNGs must never be redistributed; the engine generates its own maps at runtime, so the library needs none of them.

### Where the kits meet this library

What each kit expects, against what the core already provides. Each conflict needs a decision in the architecture ([Modifier architecture](#modifier-architecture)); none is a reason to fork a component.

| # | Conflict | Kit expects | Core today | Consequence |
| --- | --- | --- | --- | --- |
| XC1 | **Two meanings of `data-elevation`.** | Lighting: a *physical height* 0–4 on casters (cards 2, primary buttons 1, floating panels 4); never on the sticky header (it sits above the shadow layer and would shade what it covers). | AS1 puts `data-elevation="2"` on chrome (SiteLayout header, TitleBar), `"3"` on floating surfaces and `"4"` on modal ones: the *ladder level* from [Materials](materials.md#elevation-one-ladder). Content cards carry nothing. | Turned on as it is, lighting would make the site header cast a shadow over the page, give popovers the height of a highlighted card, and leave every card flat. The core must settle one meaning before any adapter reads it (XR6). |
| XC2 | **Rims replace `box-shadow` everywhere `data-elevation` > 0.** | Its rule at (0,3,0) wins unless the host is more specific or uses `!important`. | Core shadows live in cascade layers; an unlayered kit stylesheet would beat every layer. | Import `lighting.css` unchanged *into* the `addons` layer (`@import url(...) layer(addons)`) so it wins over core layers by order, not by specificity, and loses to nothing the core forces. |
| XC3 | **The blend group.** | `html` and `body` each paint a background; `body { isolation: isolate }`. | `:root` paints `--color-bg`; `body` paints nothing and does not isolate (`packages/core/css/base.css`). | One small core seam in the `base` layer (XS7): `body` paints `--color-bg` and isolates. Harmless without lighting; required with it. |
| XC4 | **Contrast as an attribute.** | Hides the layer and rims only for `prefers-contrast: more` and `forced-colors: active` media queries; re-reads colours only on `class`/`data-scheme`/`data-theme`/`style` changes on `<html>`. | The library also sets `data-contrast="more"` on the root *and on specimen subtrees* (context previews), and `data-scheme` on subtrees. | The adapter must treat `data-contrast="more"` as "hide" (pass `visible: false`, clear `data-lighting`), exclude casters inside more-contrast subtrees, and add an `addons`-layer rule removing rims there. A shadow from outside can still fall across a more-contrast specimen: a known limit (XA6). |
| XC5 | **Stacking.** | `--layer-lighting` above content, below sticky bars and overlays (reference: content < 99 < sticky 100). | `layer.base` 0, `layer.raised` 1, `layer.sticky` 10, `layer.popover` 100… ([layers](foundation.md#layers-z-index)). | A new layer token `layer.lighting` = 5 (between `raised` and `sticky`), mapped to `--layer-lighting`; `check:layers` learns it. |
| XC6 | **Shadows lower text contrast** (LS14). | Accepted by the kit as physical. | Every text role holds 4.5:1 in four contexts (`tokens:check`). | In light mode a full umbra darkens the canvas under `text-muted`. The adapter caps shadow intensity so `text-muted` keeps 4.5:1 in the deepest umbra, or the cap is an owner decision (XO3). |
| XC7 | **DOM churn.** | Any mutation under `body` triggers 600 ms of redraws; per-frame style writes cause a rebuild every frame. | The library page is full of live specimens (Progress, Morph heights, motion demos, ticking timers). | Risk of constant redraws on the library itself (XA3). Measure before claiming; the library may need to pause lighting over motion specimens or accept it only on template previews. |
| XC8 | **Glass writes inline `backdrop-filter`** on the host (GS3). | It owns the element's `backdrop-filter`. | Floating and chrome surfaces write `backdrop-filter: var(--material-backdrop)`, and their fill is an 85 % tint (AR9). | Use the low-level API: the adapter builds the filter itself and supplies it through a core-read hook property (XS3) instead of inline styles, so the core still decides fill, fallback and when the effect may show. |
| XC9 | **Glass needs see-through to be seen; text needs the floor.** | Clear presets use near-zero tint. | A6 and AR9: the tint never goes below 85 % behind text, with no help from blur. | Refraction lives in the bezel rim, where there is no text; the centre is flat. Glass on text-bearing surfaces keeps the 85 % floor in the centre and shows refraction at the rim (Regular). Clear (low tint) is allowed only on parts with no text: control thumbs (GL-G4). |
| XC10 | **Indicators that aren't elements.** | Glass on a segmented or tab indicator needs one gliding element. | SegmentedControl paints its selection as `::before` on each segment; Tabs has no indicator element. Switch and Slider thumbs are real elements (`[data-dl-part='thumb']`). | Only Switch and Slider thumbs can take glass without a core change. A gliding indicator for SegmentedControl and Tabs is a separate core proposal (XO6). |
| XC11 | **Both kits ship their own controls.** | Lighting: `lighting-panel.js` markup with `<button role="switch">`; Glass: `@liquid-glass/ui`, a complete component library. | Sealed fundamentals; binary settings use `Switch`; one component per need. | Never adopt either kit's UI. The Lighting panel is rendered from `LIGHT_CONTROLS` data with core `Switch`, `Slider`, `ColourField` and `RadioGroup`; `@liquid-glass/ui` is not used at all. |
| XC12 | **Not on npm.** | Copy (lighting) or a private pnpm monorepo (glass). | npm workspaces, packages only through the approved proxy. | Lighting is vendored unchanged with its hashes checked; Glass is vendored from a pinned build of `packages/core` (or waits for a published release). No other workspace or registry is touched (XO1, XO2). |

**Integration options considered.**

| Option | UI Lighting | Liquid Glass | Verdict |
| --- | --- | --- | --- |
| A. Copy the kit's own adapter and UI as they are | `mountLighting` with its markup beside the theme toggle | `@liquid-glass/ui` components or `<liquid-glass>` wrappers | **Rejected:** a second set of controls and components (XC11), inline styles on sealed hosts (XC8), owner rule "one component per need". |
| B. Fork core components to call the engines | an `elevation` prop that also wires the renderer | glass branches inside Popover, Switch… | **Rejected:** forks the core and makes the engines core dependencies (brief: "no core tier imports an add-on"). |
| C. **Adapter above the core, through public seams** | engine and renderer unchanged; our own adapter reads public attributes, our own panel from engine data, settings in the preset store | low-level engine API; filter supplied through a core-read hook; hosts found by public attributes | **Chosen:** matches the brief's add-on contract and the Q73 seams; core works with nothing installed. Specified below. |

## Modifier architecture

### Grounding: what modifiers promise

| # | Promise | What breaks it |
| --- | --- | --- |
| XP1 | **The plain library is always whole.** With every modifier off, absent or failed, every page looks and works exactly as the core alone. | A component that needs the add-on to be readable; a half-applied effect after an error. |
| XP2 | **One switch per modifier, everywhere at once.** Turning one on or off changes every tab, window and template preview, and turns off cleanly. | Effects hard-coded per component; leftovers (filters, observers, layers) after off. |
| XP3 | **It lands where it means something.** An effect goes only on the surfaces its guideline names, and says something true (height, layer, being held). | Glass on cards and tables; shadows from the sticky header; decoration on every box. |
| XP4 | **Your settings win.** Reduced transparency, more contrast, forced colours, reduced motion, print and data-saver choices beat every modifier. | Rims in more contrast; drifting shadows with reduced motion. |
| XP5 | **It never costs what you didn't ask for.** Off means no engine code, assets, observers or GPU work. On stays inside its budgets, or it steps down. | A WebGL context created while lighting is off; janky scroll with glass on. |

| # | Job (when…, I want…, so I can…) |
| --- | --- |
| XJ1 | When I review the library or a template, I want to turn long shadows or glass on and off in one place, so I can judge whether the effect helps. |
| XJ2 | When I adopt the library in a product, I want to install one modifier package and choose where it applies, so I get the look without touching components. |
| XJ3 | When I build a new modifier later, I want one contract and a checklist, so it plugs in like the first two and is judged the same way. |
| XJ4 | When a person's device or settings can't carry an effect, I want it to step down on its own, so nobody gets a broken or unreadable page. |

**A person can:** XU1 turn each modifier on or off from the gear's settings dialog and the library's Modifiers page, and see every surface follow in every tab; XU2 choose a modifier preset (for lighting: the light's direction and mood; for glass: Regular or Clear thumbs) as part of a global preset; XU3 apply or exclude a modifier for one view, a region or a component kind; XU4 get the plain core automatically under reduced transparency, more contrast, forced colours, print and unsupported browsers; XU5 read every text role at 4.5:1 with any modifier on; XU6 see on each component's page which modifiers it accepts and how it looks with each.

### Three kinds of modifier

Every modifier is one of three kinds. The kind fixes which seams it may use, so a new modifier is classified first.

| Kind | Changes | Where it acts | First member | Possible later members (not planned) |
| --- | --- | --- | --- | --- |
| **Finish** | the finish of a material role (how a surface is painted) | hosts tagged with a material role, through core-read effect hooks | **Liquid Glass**: a third finish beside solid and frosted | grain or paper texture on canvas |
| **Scene** | the whole page's environment, drawn in its own layer between content and chrome | casters tagged with a height; one layer under `body` | **UI Lighting**: one light and its shadows | ambient colour wash, a seasonal gobo |
| **Part** | a control's moving part while a state is active | indicator parts tagged by the core while held | **Liquid Glass on thumbs** (a part use of the glass finish) | a press ripple, a focus glow |

A modifier never changes layout, size, spacing, type, words, behaviour, focus order, keyboard handling or state. Those belong to the core; a modifier that needs one of them is a core proposal, not a modifier.

### The layers

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">Core (unchanged by any modifier)</p><p>Tokens, fundamentals, compounds, layouts and templates paint a complete, accessible look. They expose public seams: surface attributes, effect hooks, layer tokens, contexts and the preset store. No core file imports a modifier.</p></li>
  <li class="slate-step"><p class="slate-step__title">Modifier runtime: <code>@design-library/core/modifiers</code></p><p>A few kilobytes with no engine: the descriptor schema, the registry, scope and preference resolution, the settings store (on the Q70 preset store), the lifecycle and the status a person sees. Present whether or not any modifier is installed.</p></li>
  <li class="slate-step"><p class="slate-step__title">Modifier packages: <code>@design-library/modifier-lighting</code>, <code>@design-library/modifier-glass</code></p><p>One package per modifier: its descriptor, adapter, CSS in the <code>addons</code> layer and the vendored engine, loaded by dynamic import only when the modifier first turns on.</p></li>
  <li class="slate-step"><p class="slate-step__title">The app wires them</p><p>The app (the library, a template site, a product) lists the modifiers it trusts in code. Content and view data may name a modifier and a scope, never load code.</p></li>
</ol>

### Rules

| # | Rule |
| --- | --- |
| XR1 | **Above, never inside.** A modifier is a separate package. The core never imports it, never branches on its presence, and passes every check with no modifier installed. |
| XR2 | **Public seams only.** A modifier finds hosts by the public attributes in [Seams](#seams) and reads exported tokens. It never selects `[data-dl]` or `[data-dl-part]`, never reaches into component markup, never sets a core token. |
| XR3 | **Own namespace.** Its custom properties are `--<id>-*` (`--lighting-*`, `--glass-*`); its attributes `data-<id>-*`; its storage keys `design-library.modifier.<id>`. The only core names it writes are the effect hooks (XS3) on registered hosts and its own scope attribute. |
| XR4 | **Paint only.** It may change fill, backdrop, shadow and decoration (`::before` reserved slot); never geometry, type, colour of text or icons, focus rings, cursor or pointer events. Geometry never moves when it turns on. |
| XR5 | **The core paints the fallback.** Every host is complete before the modifier arrives; the modifier upgrades it. Its fallback chain ends in the core's own finish (glass → frosted → solid; lighting → core shadows). |
| XR6 | **One meaning per attribute.** `data-material` says what a surface is made of (role); `data-elevation` says how high it stands (0–4, physical). Neither carries anything else. |
| XR7 | **Settings win, in this order:** forced colours › more contrast › reduced transparency › print › unsupported browser › reduced motion (motion parts only) › person's scope choice › global setting › theme default. |
| XR8 | **Off means gone.** Off disposes engines, observers, filters, layers and listeners and removes its attributes and hook values; the DOM returns to the core's. No code or asset of a modifier loads until it first turns on. |
| XR9 | **Budgets or step down.** Each modifier declares budgets (XB); exceeding one steps down the degradation ladder, never blocks input. |
| XR10 | **No second component set.** A modifier's controls (switches, panels) are core components rendered from the modifier's data; it ships no UI kit. |
| XR11 | **Never glass on glass, never effect on effect.** At most one finish modifier per host; a host inside an effect host stays on the core finish. Scene modifiers never draw over chrome or overlays. |
| XR12 | **Engines stay pristine.** Vendored engine files are copied unchanged, pinned by commit, hash-checked, with their licence and attribution beside them. Fixes go upstream. |
| XR13 | **Content never runs code.** View data and content may carry `modifiers: { lighting: 'off' }` style choices on a scope; descriptors and engines come only from the app's trusted list. |
| XR14 | **One status, honest.** When a modifier can't run as asked (unsupported, forced off, over budget), the settings dialog and Modifiers page say so in one line; nothing pops up on the page. |

### The modifier descriptor

Each package exports one descriptor (data, validated against `schemas/modifier.schema.json` in core) and an adapter. The library's generator reads descriptors into `agent/index.json` and the Modifiers page, as it does components.

| # | Field | Meaning | Lighting | Glass |
| --- | --- | --- | --- | --- |
| XD1 | `id` | stable, lowercase; namespace for tokens, attributes, keys | `lighting` | `glass` |
| XD2 | `name`, `summary` | words a person reads (ui-copy) | "Long shadows", "One light casts soft long shadows from raised surfaces." | "Liquid glass", "Floating surfaces and held controls bend what's behind them." |
| XD3 | `kind` | `finish` \| `scene` \| `part` (a package may declare a finish plus a part use) | `scene` | `finish` + `part` |
| XD4 | `version`, `core` | the package's semver and the compatible core range (`peerDependencies` mirrors it) | `0.1.0`, `>=0.2 <0.3` | same |
| XD5 | `hosts` | which public seams it acts on, by role, with per-role default (`on`, `off`, `never`) | casters `[data-elevation]` 1–4, excluding chrome, more-contrast scopes | floating anchored and free, chrome bars (`off` by default), indicators (`on` while held) |
| XD6 | `seams` | seams read and set (XS ids) | XS1, XS2, XS4, XS5, XS6, XS7, XS8, XS9 | XS1, XS2, XS3, XS4, XS6, XS8, XS9, XS10 |
| XD7 | `settings` | the settings schema, defaults, ranges and labels, versioned with an upgrade function | the engine's `LIGHT_CONTROLS` and `LIGHT_SCHEMA` (3), with our caps | `variant` (Regular, Clear thumbs), `strength` (0–1), `bezel` preset |
| XD8 | `presets` | built-in named settings for the preset dialog | Off, Morning (315°/20°), Noon (high, short), Studio (no off-frame) | Off, Regular, Regular + clear thumbs |
| XD9 | `requires` | capability tests, each with the step it takes when missing | WebGL2 (else rims only, or off: XO5), `ScrollTimeline` (else sticky lag accepted) | `CSS.supports('backdrop-filter','url(#x)')` (else frosted) |
| XD10 | `preferences` | how each preference changes it (must at least meet XR7) | the AR table below | the AR table below |
| XD11 | `budgets` | XB values it promises and how it measures them | XB1–XB5 | XB6–XB10 |
| XD12 | `resources` | files, sizes, lazy chunks, network requests | engine 35.5 KB, renderer 62.7 KB, CSS 4.9 KB, palm gobo only when chosen | engine chunk (size measured in MD8) |
| XD13 | `licence` | licence id, notice file, upstream source and pinned commit, attribution text | MIT (declared in `about.md`), loushing@6482839 | MIT (declared), liquid-glass-for-web@8b38bd7, kube.io credit |
| XD14 | `docs` | guideline and checklist ids (Q85), library page | LG-G/LG-C | GL-G/GL-C |
| XD15 | `conflicts` | modifiers or finishes it can't share a host with | none | other finish modifiers on the same host |
| XD16 | `status` | `experimental` \| `preview` \| `stable` | `preview` | `experimental` (upstream phase 2) |

### Registration and lifecycle

```ts
// The app's trusted list (apps/library/src/modifiers.ts): code, never content.
import { registerModifier } from '@design-library/core/modifiers';
import lighting from '@design-library/modifier-lighting/descriptor';
import glass from '@design-library/modifier-glass/descriptor';
registerModifier(lighting, () => import('@design-library/modifier-lighting'));
registerModifier(glass, () => import('@design-library/modifier-glass'));
```

`registerModifier` validates the descriptor, checks the core range and namespace clashes (two modifiers claiming one id, attribute or hook on one role) and refuses with a named reason, keeping the page as it was. The adapter module exports one function:

```ts
export function mount(ctx: ModifierContext): ModifierInstance;
// ctx: settings, resolved scopes, preference state, host query (public seams only), status reporter, budget meter
// instance: update(next), suspend(reason), resume(), dispose()
```

| State | Enter when | What the page shows |
| --- | --- | --- |
| `off` | default; switched off; disposed | the core |
| `loading` | switched on, chunk not yet loaded | the core (old view kept); status "Loading long shadows…" only after 300 ms (perceived-performance: name a wait after 300 ms) |
| `active` | mounted, preferences allow, budgets hold | the effect on its hosts |
| `suspended` | a preference forces it off, the page is hidden, or a budget step-down reached "off" | the core; status says why |
| `degraded` | a capability is missing or a budget step-down is partial | the step's look (frosted instead of glass; rims only) with a status line |
| `failed` | the chunk failed to load or the engine threw | the core; status "Long shadows couldn't start. Try again." with Retry; nothing else changes |

Turning a modifier on acknowledges within 100 ms (the Switch commits, Q65 rules), keeps the old view until the effect is ready, and never blocks input. Switching off lands in one frame (`suspendMotion`), like the frosted switch (AR14).

### Toggling, scope and persistence

**Three levels, nearest wins, preferences above all (XR7):**

| Level | How it's set | Stored | Example |
| --- | --- | --- | --- |
| Global | the modifier's Switch in the gear's settings dialog (Q70.2) and on the library's Modifiers page; a global preset | `design-library.modifier.<id>` (`{ enabled, settings, schema }`), followed live in every tab through `watchStored` | Long shadows on everywhere |
| Scope | `data-modifier-<id>="on" \| "off"` on any element (a view, a layout region, a preview frame), set by the app or by view data `modifiers` on a layout or block | not stored by the runtime; part of the view | Lighting off inside the Design tool canvas; glass off in the chat sidebar |
| Host role | the descriptor's per-role defaults (XD5), overridable per app in `registerModifier(…, { hosts })` | in the app's code | Glass on popovers, off on chrome bars |

A component kind can't be singled out except by its public role, on purpose: "glass on Popover but not Tooltip" is expressed as host roles (anchored floating vs hint), so new components with the same role behave the same. A per-instance prop on sealed components is not added (XO7).

**Presets (Q70).** Each modifier registers a preset category through `registerPresetCategory` (the API the material store already uses): **Lighting** (Off, Morning, Noon, Studio, and a person's own saved settings) and the **Material** category gains a third built-in, **Glass**, beside Frosted and Solid. Global presets name one preset per category (working default: Theme default = lighting Off, material Frosted; a new "Showcase" global preset = Morning + Glass, XO4). The gear dialog's simple view picks presets only; the Lighting panel's sliders live on the library's Modifiers page and in an "Adjust" disclosure in the dialog, rendered from `LIGHT_CONTROLS` with core Slider, ColourField, RadioGroup and Switch (XC11).

**Glass as a material finish.** The root keeps the core's own vocabulary: `data-material="frosted" | "solid"`. Choosing Glass stores `material: glass`; the store writes `data-material="frosted"` (the core paints frosted underneath, so no-JS, unsupported browsers and a failed load all show frosted) and `data-finish="glass"` on the root. The glass adapter upgrades eligible hosts from there. AS3's reserved third value `effect` is superseded by `data-finish` (it never shipped), so the core's two values never change meaning (XO8).

### Seams

What the core exposes; existing ones keep their AS ids from [Materials](materials.md#the-optional-add-on-layer-ui-lighting-liquid-glass).

| # | Seam | Core provides | Modifiers may | Status |
| --- | --- | --- | --- | --- |
| XS1 | **Surface role** (AS1) | `data-material="chrome" \| "floating" \| "modal"` on every functional surface; adds `data-float="anchored" \| "free"` and `data-hint` on tooltips so roles can be told apart | find hosts by these only | exists; `data-float`, `data-hint` new (MD1) |
| XS2 | **Height** (AS1, redefined by XR6) | `data-elevation="0"`–`"4"` as a physical height on the [elevation ladder](#elevation-one-meaning): raised cards 2, primary actions 1, anchored floating 3, free floating and modal 4; chrome carries none | read heights; never set them | exists with the old meaning; remapped in MD1 |
| XS3 | **Effect hooks** (new; replaces AS3's `effect`) | on functional hosts the core reads `--effect-fill`, `--effect-backdrop`, `--effect-shadow` and `--effect-edge` before its own tokens: `background-color: var(--effect-fill, var(--material-floating-bg))` and so on, only inside `:root[data-finish] …` and never when solid is forced | set these four properties on hosts it owns, inline or by rule in `addons` | new (MD2) |
| XS4 | **Tokens** (AS2) | `--material-*`, `--color-bg-*`, `--shadow-*`, `--layer-*`, motion durations and easings as exported roles | read them | exists |
| XS5 | **Layer token** | `layer.lighting` (5): above content and `layer.raised`, below `layer.sticky`; `--layer-lighting` for the kit | stack its scene layer there | new (MD1) |
| XS6 | **Cascade layer** (AS4) | `addons`, last in `css/index.css`; the `::before` slot on functional hosts reserved for decoration under content | put all its CSS in `@layer addons.<id>` | exists |
| XS7 | **Blend root** | `html` and `body` each paint `--color-bg`; `body { isolation: isolate }`; `color-scheme` follows `data-scheme` (exists in `tokens.css`) | rely on them | `body` part new (MD1) |
| XS8 | **Preferences** (AS5) | the forced-solid conditions resolved first (AR1–AR6), exposed to scripts as `prefs()` and an event from the runtime, including the `data-contrast` and `data-motion` attributes on subtrees | stand down; never re-test media queries on its own | exists in CSS; runtime API new (MD3) |
| XS9 | **Scope attribute** | `data-modifier-<id>` read by the runtime, nearest ancestor wins; view-data field `modifiers` on layouts and blocks maps to it | read the resolved scope from `ctx` | new (MD3) |
| XS10 | **Indicator part** | `data-material="indicator"` on a control's moving part (Switch thumb, Slider thumb) and `data-held` while it's pressed or dragged; the core keeps painting it | upgrade the part while `data-held` | new (MD5) |

#### Elevation: one meaning

XC1 is settled by giving `data-elevation` one physical meaning (XR6) that both the core's ladder and any scene modifier read. The ladder in [Materials](materials.md#elevation-one-ladder) gains a height column; only the attribute changes, not a single pixel of the core's look.

| Ladder level | Surfaces | `data-material` | `data-elevation` (height) | Lighting height |
| --- | --- | --- | --- | --- |
| −1 / 0 | wells, canvas, control fills, quiet buttons | none | none (or `0`) | casts nothing |
| 1 | raised cards, panels, tiles | none | `2` | 6 px |
| 1 | primary and danger buttons (the filled action) | none | `1` | 2 px |
| 2 | sticky chrome (site header, TitleBar, app bars) | `chrome` | none (above the shadow layer, LS4) | casts nothing |
| 3 | anchored floating (popovers, menus, lists, pickers, tooltips) | `floating`, `data-float="anchored"` | `3` | 12 px |
| 3 | free floating (FloatingBar, notification pills, standard sheets, chat jump button) | `floating`, `data-float="free"` | `4` | 24 px |
| 4 | modal (Dialog, modal Sheet, Lightbox) | `modal` | `4` | 24 px (under the scrim) |

A surface nested in another adds height in the lighting engine (LS2): a primary button in a card stands 8 px. Popovers that render in the top layer but sit in a card's DOM add the card's height; accepted (a slightly longer shadow), noted in XA7.

### UI Lighting: the integration in detail

| Part | Design |
| --- | --- |
| Package | `@design-library/modifier-lighting`: `descriptor.ts`, `adapter.ts` (our own; the kit's `lighting-host.js` and `lighting-panel.*` are **not** used), `lighting.css` imported as `@import url('./vendor/lighting.css') layer(addons.lighting)`, `host-tokens.css` replaced by token mappings, `vendor/` holding `lighting.mjs`, `light-renderer.js`, `lighting.css` and `gobos/palm.png` unchanged from loushing@6482839 with `LICENSE`/`NOTICE` and `vendor/hashes.json`. |
| Host tokens | `--layer-lighting: var(--layer-lighting-token)` (5); `--lighting-dark-tint` and `--color-lighting-ink` as lighting tokens in the token source (`lighting.dark-tint` 0.12, `lighting.ink` `light-dark(#1b1f23, #000)` mapped from `p.neutral` primitives in the tokens build, so the core's colour model owns them); `--size-lighting-panel` unused (no kit panel). |
| Adapter | Drives the engine directly (LS12 "Without the bundled adapter"): `validateLighting` → `lightingProperties` on the root → `createLightRenderer({ selector, heights: LIGHT_LEVELS, gobos })` on first enable → `update(settings, { visible, motion })` on every settings, preference, scope or visibility change → `destroy()` on off. `visible` is false when any of XS8's forced conditions holds (including `data-contrast="more"` on the root, XC4). |
| Casters | `selector`: `[data-elevation]:not([data-elevation='0']):not(:where([data-modifier-lighting='off'], [data-contrast='more'], [data-material='chrome']) *)` (the casters' own subtree exclusions); the core never adds `data-elevation` to chrome (XS2). |
| Rims | The kit's rim rule applies wherever `data-lighting="on"` sits; the adapter sets it on the root only when active and adds one `addons.lighting` rule restoring core shadows inside `[data-contrast='more']` and `[data-modifier-lighting='off']` scopes. |
| Theme | The library sets `data-scheme` on `<html>`, which the renderer watches (LS6). Brand, space and preset changes write custom properties on the root `style`, also watched. A scheme set only on a subtree (a specimen) isn't re-read: specimens are shaded with the page's ink (XA6). |
| Settings | Stored under `design-library.modifier.lighting` (`schema` = the engine's `LIGHT_SCHEMA`, upgraded with `upgradeLighting`); validated with `validateLighting`; our caps applied after it: `shadowIntensity` ≤ the text-contrast cap (XC6, XO3). |
| Controls | Long shadows Switch (gear dialog, Modifiers page); the panel built from `LIGHT_CONTROLS` with core components, copy from the kit's [controls reference](https://github.com/prabinpebam/loushing/blob/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting/references/controls.md) re-written to our ui-copy glossary ("across the library" for the library, "across the site" for templates). |
| Library-specific | Lighting runs on the library page and inside every same-document preview; standalone template tabs (`site.html`) mount their own instance from the same stored setting. Motion specimens that mutate every frame get `data-modifier-lighting="off"` on their stage if XA3 proves the redraw cost (XB4). |
| Not supported | Bottom/left/right sticky followers, right-to-left horizontal scroll followers (LS: renderer limits) are accepted limits listed on the Modifiers page. |

### Liquid Glass: a material finish on chosen components

**Which components, and why.** Glass goes where the materials framework already allows a see-through finish (the functional layer, A3) and where Apple's guidance and the kit's own policy agree (GS6). It is never on the content layer.

| Host | Tier | Role (XS1/XS10) | Glass | Why |
| --- | --- | --- | --- | --- |
| **Switch** thumb | fundamental | indicator | **while held** (Clear thumb or Regular, by setting) | Apple: toggles turn to glass during interaction (GS6); a transient cue that exists only while its state is active (visual-noise). The track stays solid. |
| **Slider** thumb | fundamental | indicator | **while dragged** | as Switch; the fill and track stay solid. |
| **Popover** | fundamental | floating anchored | yes, Regular | transient, light-dismiss (FR4); already frosted. |
| **Tooltip** (hint) | fundamental | floating anchored, `data-hint` | yes when short; solid when long (AR8) | as FR5. |
| Select, MenuButton, Combobox and Mentions lists (`pickers.css`) | fundamental | floating anchored | yes, Regular; rows stay flat | FR4; glass shell, flat items (GS6). |
| DatePicker, DateRangePicker, ColourPicker popups | fundamental | floating anchored | yes, Regular | FR4; content inside stays solid-on-glass (flat fills). |
| FloatingBar | compound | floating free | yes, Regular | FR3, navigation/toolbar role (GS6). |
| Notification pill | compound | floating free | yes, Regular | FR6, toast role. |
| Standard (non-modal) Sheet ≤ half the window | compound | floating free | yes, Regular | FR7; full or over-half sheets stay solid (AR11, GS6 "full-height sheets become opaque"). |
| Chat "jump to latest", ImageGeneration status | fundamental Button / compound | floating free | yes, Regular | floating controls over content and media. |
| Sticky chrome (site header, app bars) | layout | chrome | **off by default**, on by setting | navigation role in GS6, but large (AR11) and text-dense; the owner decides (XO9). |
| Buttons, fields, checkboxes, chips, cards, tables, dialogs, modal sheets, lightbox, alerts | all | content or modal | **never** | content layer (A3); modal holds forms and long text; GS6 `content` and `control` roles. No "force glass" switch (it would be a second variant: one variant per need). |
| SegmentedControl, Tabs indicators | fundamental, compound | — | **not yet** | no single indicator element (XC10); needs a core proposal first (XO6). |

**How it paints.** The adapter uses the low-level engine (GS1) so it never writes inline `backdrop-filter`:

1. Find hosts: `[data-material='floating']`, plus `[data-material='indicator'][data-held]` and `[data-material='chrome']` when those roles are on, outside `[data-modifier-glass='off']`, never inside another glass host (XR11).
2. For each host, measure its box and radius once per size (cache maps by `width × height × radius × bezel × preset`; popovers of one size share one filter), build the displacement and specular maps and one `<filter>` in the engine's shared hidden `<defs>`.
3. Set the effect hooks on the host: `--effect-backdrop: url(#lg-n) saturate(…)` (Regular adds the frost blur inside the filter), `--effect-fill`: the role's tint at the AR9 floor (Regular) or the thumb's Clear tint (indicators only), `--effect-edge`: none (the specular map draws the rim; never a CSS border).
4. The core's materials CSS reads the hooks only under `:root[data-finish='glass']` and never when solid is forced, so a forced-solid preference wins without the adapter doing anything.
5. Resize: rebuild only when the box settles (the core's motion end), not every frame; during enter/exit and while a sheet is dragged, the host shows its frosted finish (`--effect-backdrop` unset) and glass returns on settle. Indicators use `setScale`-style displacement fades within `motion.duration.fast` (0 under reduced motion).
6. Off: remove every hook value and filter; the shared `<defs>` goes with the last host.

**Fallback chain:** glass → frosted (no `backdrop-filter: url()` support: Firefox, Safari; or over budget) → solid (AR1–AR6). The engine's own `fallback: 'blur'` and `filter` mode are never used (`filter` would distort text, GS4).

### Contexts, preferences and accessibility

| Condition | Lighting | Glass | How it's enforced |
| --- | --- | --- | --- |
| Light and dark | ink and tints from `light-dark()`; the dark tint `lighting.dark-tint` | the tint floor per scheme (80/85 %, AR9) on text hosts | `tokens:check` (floors), LG-C/GL-C |
| More contrast (`data-contrast="more"` or the media query) | layer hidden, rims removed, core borders and shadows back | no glass; solid + 3:1 outline (AR3) | XS8; CSS in core and `addons` |
| Forced colours | hidden; rims removed (kit) | none; system colours (AR4) | same |
| Reduced transparency | unaffected (shadows aren't transparency) | solid (AR2), so glass and frosted both off | XS8 |
| Reduced motion (`prefers-reduced-motion` or `data-motion="reduce"`) | off-frame shadows stop moving (LS10); shadows remain | indicator glass appears without the scale fade | adapter reads XS8 |
| Print | hidden | solid | CSS |
| Page hidden | motion paused | nothing to do | adapter |
| SSR (no pre-paint script) / no JavaScript | core shadows; Switch disabled with a note | frosted (`data-material="frosted"` from the material store or the server) | [first paint](#server-rendering-and-first-paint) |
| Missing capability | no WebGL2 → rims only, or off (XO5) | no `url()` backdrop → frosted | XD9 |
| Text over shadows (XC6) | `shadowIntensity` capped so `text-muted` keeps 4.5:1 in the deepest umbra (light mode); dark mode only gains contrast | text sits on the floor tint; refraction lives in the bezel | a computed cap in the adapter, checked by `check:modifiers` |
| Focus | rings are outlines, never `box-shadow`, so rims can't erase them (verified in `controls.css`) | focus rings sit outside the filter (outline isn't filtered by `backdrop-filter`) | LG-C/GL-C |
| Screen readers | nothing announced; the layer is `aria-hidden` and `pointer-events: none` | the `<defs>` host is `aria-hidden` | — |

### Performance budgets and degradation

Proposed budgets, to be measured on the reference machine (the owner's PC) and a mid-range laptop on the longest template page and the library's Design tool. Nothing here is a measured result (performance skill).

| # | Budget | Lighting | Measured by |
| --- | --- | --- | --- |
| XB1 | Off costs nothing | 0 bytes of engine JS, 0 WebGL contexts, 0 observers, 0 requests | network and memory panels with the setting off (PD10) |
| XB2 | Scroll stays smooth | p95 frame ≤ 16.7 ms while fast-scrolling a long template with lighting on; layer work ≤ 4 ms per update | performance trace |
| XB3 | Idle is idle | no redraw after the 600 ms settle with nothing moving and off-frame motion off | `renderer.stats.frames` stable for 5 s |
| XB4 | Live pages don't thrash | ≤ 1 rebuild per second on the library's busiest page | `renderer.stats`; else stages opt out (XA3) |
| XB5 | First light | lighting visible ≤ 300 ms after the switch on a warm cache; old view kept | trace from commit to first layer frame |

| # | Budget | Glass | Measured by |
| --- | --- | --- | --- |
| XB6 | Off costs nothing | 0 bytes of engine JS, no `<defs>`, no observers | as XB1 |
| XB7 | Map build | ≤ 8 ms per new size on the reference machine; cached sizes 0 ms | `performance.measure` around the build |
| XB8 | Area | total glass area ≤ 25 % of the viewport at once; any single host ≤ 480 × 480 CSS px (larger goes frosted) | the adapter's area meter |
| XB9 | Count | ≤ 6 glass hosts at once; the oldest beyond that go frosted | adapter |
| XB10 | Scroll under glass | p95 frame ≤ 16.7 ms scrolling content under a glass FloatingBar and an open popover | performance trace |

**Degradation ladder** (each step is tried before the next, automatically, with one status line): lighting: full → off-frame motion off → off-frame shadows off → rims only → off. Glass: full → chromatic off → frost-only (frosted finish) on large hosts → frosted everywhere → solid. The ladder runs on measured long frames (3 consecutive frames over 33 ms during the modifier's own work), never on guesses about the device.

### Server rendering and first paint

The library and the template sites are client-rendered: the stores apply scheme, space, shape and material as their modules load, before React renders the first view, so the modifier stores (`data-finish`, `data-lighting="on"`) join them there and rims and the frosted-under-glass finish are right in the first rendered frame. A product that renders on the server adds one small inline pre-paint script (shipped by the runtime as `modifiers/prepaint.js`, reading the same storage keys) before its stylesheet; without it the first frame shows the core and the effect arrives with the chunk. The scene layer and the filters always arrive when their chunks load, with no layout shift (XR4). Without JavaScript the switches render disabled with one line: "Long shadows need JavaScript. The page works without them."

### Packaging, versioning and licences

| Topic | Design |
| --- | --- |
| Where | `packages/modifiers/lighting` and `packages/modifiers/glass`, each its own explicit npm workspace (XO1); never a broad glob (AGENTS rule). |
| Dependencies | `peerDependencies: { "@design-library/core": "^0.2.0" }` (the core version that ships the seams); no runtime dependencies; engines vendored. `sideEffects: ["*.css"]` so tree-shaking drops unused JS. |
| Loading | descriptor (tiny, static) separate from the adapter chunk (dynamic import on first enable). The library build reports each modifier chunk's size; budgets XB1/XB6 fail the check if the chunk is reachable from the core entry. |
| Versioning | modifier semver independent of core. A seam change in core is a minor version with the seam listed in the core changelog; a modifier declares the range it was checked against (XD4). Settings carry a `schema` number and an upgrade function (kit precedent LS11). |
| Upstream pins | `vendor/SOURCE.md` names repository, commit, files, hashes and date; updating is its own packet with the kit's check run again (lighting: `node --test scripts/check-lighting.mjs` against our copies). |
| Licences | Each package ships `LICENSE` (MIT) and `NOTICE` with upstream attribution (Glass: the kube.io credit line, exactly as GS licence text). **Gate:** both upstream repositories need a LICENSE file first, or the owner, as author, states the licence in writing in this repository (XO2). The palm gobo is the owner's own asset (kit) and ships under the same notice. No kube.io map PNG ever enters the repository. |
| Publishing | packaged by `tools/pack.mjs` with the core; not published until the owner says so. |

### How the library documents and previews modifiers

| Place | What it shows |
| --- | --- |
| Library page **Modifiers** (`#/modifiers`, new) | One section per registered modifier, generated from its descriptor: summary, kind, status, Switch, settings (lighting panel from `LIGHT_CONTROLS`), presets, the host roles it acts on, budgets and the live status line; a specimen board (cards, a primary button, a popover, a FloatingBar, a Switch and Slider to hold) over stripes and a photo, in light, dark and more contrast, with the modifier off and on side by side. |
| Each component page | a "Modifiers" row in the contract table: which roles it exposes (XS1, XS2, XS10) and therefore which modifiers touch it; nothing for components no modifier touches. |
| Materials page | Glass as the third finish in the specimen (solid, frosted, glass), falling back visibly where unsupported. |
| Gear settings dialog (Q70.2) | Material: Solid / Frosted / Glass; Long shadows Switch; presets. |
| `agent/index.json` and `agent/modifiers/<id>.json` | the descriptor, seams, host roles, guideline and checklist ids, for agents adopting the library. |
| `packages/core/AGENTS.md` | a "Modifiers" section and task guide `guide/8-modifiers.md`: how to install one, set scope, and the never-rules (no `[data-dl]`, no inline styles on hosts, no forks), ending in the checklist, so external agents can't miss it (the lesson of Q96). |
| Slate | this page: architecture, studies, guidelines and checklists. |

### Static checks

`npm run check:modifiers` (`tools/check-modifiers.mjs`, dependency-free, like `check:materials`), run in production-ready only:

| # | Check |
| --- | --- |
| XK1 | No file in `packages/core`, `packages/catalogue` or `packages/templates` imports a modifier package. |
| XK2 | Modifier CSS lives only in `@layer addons.<id>`; selects only public attributes (no `[data-dl]`, `[data-dl-part]`, class names of core); sets only its own namespace and the XS3 hooks. |
| XK3 | Modifier scripts query hosts only through the runtime's host query; no `querySelector('[data-dl…')`; no `style.backdropFilter`, `style.filter`, `style.boxShadow` writes. |
| XK4 | Every descriptor validates against the schema; ids, attributes and hooks don't clash. |
| XK5 | Vendored files match `vendor/hashes.json`; `LICENSE`, `NOTICE` and `SOURCE.md` present. |
| XK6 | The adapter chunk is not reachable from any core entry (XB1, XB6). |
| XK7 | Lighting: the `shadowIntensity` cap keeps `text-muted` at 4.5:1 over the light canvas in full umbra; glass: the Regular fill is the AR9 floor; Clear only on `indicator` hosts. |
| XK8 | Every forced-solid condition (XS8) appears in the core's hook guard, so no hook applies when solid is forced. |
| XK9 | `check:layers` knows `layer.lighting` and that no core surface below `layer.sticky` other than content uses it. |

## Guidelines and checklists

Every modifier comes in the two parts Q85 asks for: a **guideline** an agent or a person applies while building (G rows), and an **objective checklist** an independent reviewer runs against the result (C rows), adversarially, until it passes. Each C row is pass or fail with a stated method; "looks fine" is not a method. The general rows apply to every modifier, now and later; each modifier adds its own.

### Every modifier

| # | Guideline (apply) |
| --- | --- |
| MG-G1 | Classify it first: finish, scene or part. If it changes layout, type, words or behaviour, it isn't a modifier. |
| MG-G2 | Start from the core's look with the modifier off; the effect is an upgrade of a complete surface. |
| MG-G3 | Name the meaning it carries (height, layer, being held). An effect that carries none is decoration; drop it (visual-noise ink budget). |
| MG-G4 | Choose hosts by public role, never by component; list the roles it must never touch. |
| MG-G5 | Write the descriptor before the adapter, including fallbacks, budgets, licence and checklist ids. |
| MG-G6 | Build its controls from core components; its words follow the ui-copy glossary. |
| MG-G7 | Measure before claiming: every budget has a trace or a number, or it's marked "not measured". |

| # | Check (evaluate) | Method | Pass when |
| --- | --- | --- | --- |
| MG-C1 | Core whole without it | uninstall the package; build; open five pages in four contexts | builds; pages identical to before the package existed (screenshot diff = 0) |
| MG-C2 | Off is gone | turn it off after use | no element, attribute, custom property, filter, canvas, observer or listener of it remains (DOM and Performance monitor) |
| MG-C3 | Off costs nothing | load with it off | 0 bytes of its adapter or engine in the network panel |
| MG-C4 | One switch, every tab | two tabs and a template tab; switch in one | all follow within 1 s; persists after reload |
| MG-C5 | Settings win | emulate each XR7 condition | the core finish shows under each; status line says why |
| MG-C6 | Hosts only by public seams | `check:modifiers` XK2–XK3 | 0 findings |
| MG-C7 | No geometry change | box sizes of 20 hosts with it off and on | identical to the pixel |
| MG-C8 | Text stays readable | contrast of every text role on every host, worst backdrop, four contexts | ≥ 4.5:1 text, ≥ 3:1 identifying non-text and focus |
| MG-C9 | Budgets hold | the descriptor's measurements on the reference machine | every budget met, or the degradation step it took is shown |
| MG-C10 | Licence and source | `vendor/SOURCE.md`, `LICENSE`, `NOTICE`, hashes | present and matching |
| MG-C11 | Documented | Modifiers page section, component contract rows, agent guide | generated from the descriptor; no hand-written drift |

### UI Lighting

| # | Guideline (apply) |
| --- | --- |
| LG-G1 | Lighting is a scene: one light for the whole view. Never a second light, never per-component lights. |
| LG-G2 | Only opaque, raised content surfaces cast: cards 2, primary actions 1, floating 3–4. Never chrome, text, icons, images, focus rings or sunken wells. |
| LG-G3 | Keep heights few: most of the look comes from height-2 cards; don't raise children to compensate for nesting. |
| LG-G4 | Long shadows replace the core's drop shadows while on (rims replace `box-shadow`); never stack both. |
| LG-G5 | The light is quiet by default: shadow intensity at or under the contrast cap, off-frame motion slow, no gobo unless chosen. |
| LG-G6 | Over live, every-frame specimens (motion demos), turn lighting off on that stage rather than let it redraw constantly. |
| LG-G7 | Never edit the engine, renderer or kit CSS; adapt in our adapter or ask upstream. |

| # | Check (evaluate) | Method | Pass when |
| --- | --- | --- | --- |
| LG-C1 | Chrome never casts | inspect sticky headers and bars with lighting on | no `data-elevation` on chrome; no shadow falls from them |
| LG-C2 | Cards cast, wells don't | the specimen board | every raised card casts; sunken and control fills cast nothing |
| LG-C3 | No double shadows | computed `box-shadow` on 10 lit hosts | equals the kit's rim value; no core shadow remains |
| LG-C4 | Text under the umbra | `text-muted` on the light canvas multiplied by the deepest shadow at the capped intensity | ≥ 4.5:1 (XK7) |
| LG-C5 | Overlays above the layer | open a menu, dialog, toast over a long shadow | none is shaded |
| LG-C6 | Contrast subtrees | a more-contrast specimen on a lit page | no rims and no casters inside it |
| LG-C7 | Reduced motion | emulate it with off-frame shadows on | shadows stay, nothing moves |
| LG-C8 | Idle is idle | 5 s with nothing moving | `renderer.stats.frames` unchanged (XB3) |
| LG-C9 | Engine pristine | `vendor/hashes.json`, the kit's check on our copies | hashes match; `check-lighting.mjs` 30 of 30 |
| LG-C10 | No WebGL2 | disable WebGL | the chosen fallback (rims only or off, XO5) and its status line |

### Liquid Glass

| # | Guideline (apply) |
| --- | --- |
| GL-G1 | Glass is a finish of the functional layer only: floating surfaces, optionally chrome, and control thumbs while held. Never the content layer, never modal. |
| GL-G2 | Never glass on glass: anything inside a glass host is a flat fill. |
| GL-G3 | Regular on every surface with text: the AR9 tint floor in the centre, refraction at the bezel. |
| GL-G4 | Clear (low tint) only on parts with no text: Switch and Slider thumbs, and only while held. |
| GL-G5 | Compact only: a host bigger than half the window or 480 × 480 px is frosted (AR11, XB8). |
| GL-G6 | The rim is the specular map, never a CSS border; no extra shadow beyond the role's own. |
| GL-G7 | Never `filter` mode; text is never refracted. |

| # | Check (evaluate) | Method | Pass when |
| --- | --- | --- | --- |
| GL-C1 | Only listed hosts | query glass hosts on every library page and template | each is in the host table; 0 content or modal hosts |
| GL-C2 | No nesting | glass host inside a glass host | 0 |
| GL-C3 | Floor on text hosts | computed `--effect-fill` alpha on text-bearing hosts | ≥ 0.85 (the AR9 floor) |
| GL-C4 | Clear only on thumbs | hosts with tint below the floor | all `data-material='indicator'` |
| GL-C5 | Text not distorted | zoom 400 % on popover text over stripes | glyphs straight; displacement only in the bezel |
| GL-C6 | Unsupported browsers | Firefox and Safari | frosted, status "Glass needs a Chromium browser; frosted is shown." |
| GL-C7 | Size limit | open a sheet over half the window | frosted, not glass |
| GL-C8 | Resize settles | open and drag a sheet; open popovers | no map rebuild per frame (≤ 1 build per settled size) |
| GL-C9 | Held only | Switch and Slider at rest and while held | glass only while `data-held` |
| GL-C10 | Credit and licence | package `NOTICE` and the Modifiers page | kube.io credit present, no kube.io map files anywhere |

## Assumptions and risks

| # | Assumption or risk | Kind | Impact if wrong | Evidence today | Criterion | Cheapest check | Changes | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XA1 | Long shadows make the library and templates read better, not busier. | Desirability | High (XP3; the whole lighting packet) | Owner's Loushing use (anecdote) | the owner keeps it on for two templates after side-by-side review | MD-P1 spike on one template page | drop lighting or keep it to templates only | Open |
| XA2 | Lighting's renderer stays inside XB2 on our heaviest pages. | Feasibility | High (XP5) | Reference only: RTX 4090 (LS9) | p95 ≤ 16.7 ms scrolling the longest template, mid-range laptop | MD-P1 trace | degrade earlier; templates only | Open |
| XA3 | The library's live specimens don't make the renderer rebuild constantly (LS7). | Feasibility | High (library unusable with lighting) | None; the kit's troubleshooting warns of it | ≤ 1 rebuild per second on the busiest library page (XB4) | MD-P1 with `renderer.stats` on the Motion page | opt stages out; lighting only in previews | Open |
| XA4 | SVG `backdrop-filter` on compact hosts is cheap enough (XB7, XB10). | Feasibility | Medium (glass packet) | None measured; upstream unmeasured | map build ≤ 8 ms; p95 ≤ 16.7 ms under an open popover and FloatingBar | MD-P2 spike on Popover | smaller host list; frosted on more hosts | Open |
| XA5 | The 85 % floor still lets glass read as glass. | Desirability | Medium (GL-G3) | None | the owner tells Regular glass from frosted in a blind side-by-side | MD-P2 screenshots | lower floor with a stronger border (as AR9), or Clear on more parts | Open |
| XA6 | Specimens in another scheme or contrast inside a lit page are acceptable with the page's ink. | Usability | Low | None | owner review of the Materials page with lighting on | MD4 review | turn lighting off on context specimens | Open |
| XA7 | Height adding through DOM nesting (popover in a card) looks right. | Usability | Low | Kit rule (LS2) | no visibly wrong shadow length in the specimen board | MD4 review | stop heights at floating hosts via the selector | Open |
| XA8 | Upstream licences get a LICENSE file (owner is the author). | Viability | High (no shipping without it) | Declarations only (studies) | LICENSE present upstream or the owner's written statement here | ask the owner (XO2) | vendor or not | Open |
| XA9 | Liquid Glass's API holds until 0.1.0 (GS1, GS5). | Viability | Medium (adapter churn) | Upstream says it may change | the pinned commit's low-level exports used unchanged | pin and wrap in our adapter | re-pin packet | Accepted (pinned) |
| XA10 | Remapping `data-elevation` breaks nothing: no consumer reads it yet. | Feasibility | Medium | Grep: only core CSS and docs | no reference outside core and docs | grep in MD1 | keep old meaning under a new attribute | Open |
| XA11 | Firefox and Safari people are fine with frosted instead of glass. | Desirability | Low | Glass is Chromium-only (GS4) | — (accepted fallback) | — | — | Accepted |

## Owner decisions (working defaults)

| # | Decision | Options | Recommendation (working default) |
| --- | --- | --- | --- |
| XO1 | New workspaces for modifier packages | (a) `packages/modifiers/lighting`, `packages/modifiers/glass` as explicit workspaces; (b) inside `packages/core` under an `addons/` folder; (c) only in the library app | **(a)**: separate packages are the only way to prove XR1 and zero cost when off; needs the AGENTS rule "product source lives only in…" to list them. |
| XO2 | Licence for vendored kits | (a) add a LICENSE file to each upstream repo; (b) the owner's written statement in this repository; (c) wait | **(a)**, a two-minute change by the owner as author; until then nothing is copied into the repository (spikes stay outside it). |
| XO3 | Shadows over text | (a) cap shadow intensity so `text-muted` keeps 4.5:1 in the umbra; (b) accept the kit's physics (LS14) | **(a)**: a quieter light, text always readable (XP4). |
| XO4 | Defaults | lighting off and material frosted by default; a "Showcase" global preset with Morning light + Glass | **As stated**: effects never default on (brief O17). |
| XO5 | No WebGL2 | (a) rims only (kit default); (b) off entirely | **(b) off**: rims without shadows are a partial effect the brief rejects unless accepted. |
| XO6 | Glass on SegmentedControl and Tabs | (a) a core proposal for one gliding indicator element; (b) not now | **(b)**, revisit after thumbs are reviewed. |
| XO7 | Per-instance opt-in | (a) a `modifiers` prop on every component; (b) scope attribute and roles only | **(b)**: sealed components keep their API; a scope wraps any instance. |
| XO8 | AS3's reserved `effect` value | (a) keep; (b) replace with `data-finish` | **(b)**: core values keep one meaning; `effect` never shipped. |
| XO9 | Glass on sticky chrome | (a) off by default, a setting; (b) never; (c) on | **(a)**: big text-dense surfaces cost the most and gain least (AR11). |

## Implementation plan

Packets of about 15–20 minutes, each ending in something the owner can open. **Spikes** (prove the risky assumption) run first and stay outside the repository's product source (`.design-library/spikes/`, ignored), so no kit file is copied in before XO2. Product packets run in the owner's current mode (strict design: screens, no tests); the check packet waits for production-ready.

| Packet | Mode | What | Reviewable result | Depends on |
| --- | --- | --- | --- | --- |
| **MD-P1** | prove assumption | Lighting spike: the kit's own adapter on a built copy of one template page and the library's Motion page, outside the repo; traces and `renderer.stats` | a spike page and a numbers table here (XA1–XA3) | — |
| **MD-P2** | prove assumption | Glass spike: the pinned engine on a Popover and FloatingBar copy over stripes and a photo; map build times; Regular vs frosted screenshots | spike page, numbers and screenshots (XA4, XA5) | — |
| **MD1** | design | Core seams with no visual change: `data-elevation` remapped to heights (XS2), chrome loses it, cards and primary buttons gain it; `data-float`, `data-hint` (XS1); `layer.lighting` (XS5); `body` blend root (XS7); the ladder's height column on the Elevation page and in Materials | Elevation page with the height column; any page looks identical | XA10 grep |
| **MD2** | design | Effect hooks (XS3) and `data-finish`; Material gains **Glass** in the Materials page switch and presets, showing frosted plus "Glass needs the glass add-on" while none is installed | Materials page: Solid / Frosted / Glass | MD1 |
| **MD3** | design | Runtime `@design-library/core/modifiers`: descriptor schema, registry, scope (XS9), preferences API (XS8), store on presets; library **Modifiers** page generated from descriptors (empty state: "No modifiers installed") | Modifiers page | MD2 |
| **MD4** | design | `@design-library/modifier-lighting`: vendored kit (after XO1, XO2), our adapter, host tokens, Long shadows Switch in the gear dialog and on the Modifiers page | Long shadows on across the library and a template | MD1, MD3, MD-P1 |
| **MD5** | design | Lighting panel from `LIGHT_CONTROLS` with core components; Lighting presets; contrast cap (XO3); stages opted out per MD-P1 | Modifiers page panel; presets in the gear | MD4 |
| **MD6** | design | Indicator part seam (XS10): Switch and Slider thumbs tagged, `data-held` while pressed or dragged; no visual change | Switch and Slider pages unchanged | MD1 |
| **MD7** | design | `@design-library/modifier-glass`: vendored engine build (after XO2), adapter on floating hosts through hooks, cache, size and count limits | Materials Glass option live on popovers, lists, FloatingBar, pills | MD2, MD3, MD-P2 |
| **MD8** | design | Glass on held thumbs (Regular / Clear setting), chrome option (XO9); Modifiers page specimen board | Hold a Switch and a Slider | MD6, MD7 |
| **MD9** | prove assumption | Budgets measured on the reference machine and a mid-range laptop (XB1–XB10); degradation thresholds set from traces | a measured table replacing "proposed" here | MD5, MD8 |
| **MD10** | design | Agent docs: `packages/core/AGENTS.md` Modifiers section, `guide/8-modifiers.md`, `agent/modifiers/*.json`, the "Modifiers" row on component pages | the guide and a component page row | MD3 |
| **MD11** | production-ready | `check:modifiers` XK1–XK9, `check:layers` update, the kit's check on our copies | the checks in the repository's command list | MD9, owner sign-off |

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">Prove first (parallel): MD-P1, MD-P2</p><p>Answers XA1–XA5 before any core change; either can stop or narrow its modifier.</p></li>
  <li class="slate-step"><p class="slate-step__title">Core seams: MD1 → MD2 → MD3, and MD6 after MD1</p><p>No visual change except the Materials and Modifiers pages; the core stays complete.</p></li>
  <li class="slate-step"><p class="slate-step__title">Lighting: MD4 → MD5. Glass: MD7 → MD8</p><p>Two tracks that share no files beyond the runtime; they can run back to back or by two builders.</p></li>
  <li class="slate-step"><p class="slate-step__title">Measure, document, enforce: MD9, MD10, MD11</p><p>MD11 only after the owner approves the look (no tests on unapproved designs).</p></li>
</ol>

### Definition of Done for modifiers

| # | Row | Evidence |
| --- | --- | --- |
| XV1 | With no modifier installed, the library and templates are unchanged | MG-C1 |
| XV2 | Each modifier turns on and off in one place, everywhere, and leaves nothing behind | MG-C2–MG-C4 |
| XV3 | Settings and unsupported browsers return the core or the next fallback | MG-C5, LG-C10, GL-C6 |
| XV4 | Effects only on listed hosts, meaning-carrying, never on content | LG-C1–C2, GL-C1–C4 |
| XV5 | Text 4.5:1 and non-text 3:1 with every modifier on, four contexts | MG-C8, LG-C4, GL-C3 |
| XV6 | Budgets measured, met or stepped down | MG-C9, MD9 |
| XV7 | Licences, sources and credits shipped | MG-C10, GL-C10 |
| XV8 | A new modifier needs no core change beyond a listed seam | the descriptor and seams tables; a third modifier's descriptor written as a dry run |

## Sources

- UI Lighting: [Loushing card](https://prabinpebam.github.io/loushing/items/ui-lighting/); skill at [loushing@6482839](https://github.com/prabinpebam/loushing/tree/6482839e10370d31942bb96db89bc882638fe558/skills/ui-lighting): `SKILL.md`, `about.md`, `references/integration.md`, `references/renderer.md`, `references/controls.md`, `assets/lighting.css`, `assets/lighting-host.js` (read 2026-11-09).
- Liquid Glass: [liquid-glass-for-web@8b38bd7](https://github.com/prabinpebam/liquid-glass-for-web/tree/8b38bd717de1053b73125a6ffa854a02302f156a): README, `packages/core/README.md`, `packages/core/src/glass.ts`, `docs/reference/api-reference.md`, `docs/reference/attribution.md`, `docs/reference/design-library/material-usage.md`, `package.json` files (read 2026-11-09); technique credit: [kube.io, Liquid Glass in the Browser](https://kube.io/blog/liquid-glass-css-svg/).
- Licence status: GitHub REST API `repos/{owner}/{repo}` (`license: null` for both, 2026-11-09).
- Platform: [MDN `backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter), [MDN `prefers-reduced-transparency`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency), [MDN `ScrollTimeline`](https://developer.mozilla.org/en-US/docs/Web/API/ScrollTimeline), [MDN `mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode).
- Guidance: [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials) (as cited by the kit's placement policy).
- This project: [Materials and backgrounds](materials.md), [brief: optional add-ons](brief.md#optional-add-ons-and-integrations), [Foundation: materials and add-on seams](foundation.md#materials-and-add-on-seams-q73), [layers](foundation.md#layers-z-index), [token presets](foundation.md#token-presets-q70), [Motion](motion.md), [DoD Q95](definition-of-done.md#owner-instructions).

