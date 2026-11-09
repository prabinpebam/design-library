# Improvement plan from the DesignUp beta

> **TL;DR:** The first real adoption, the DesignUp site (about 55 routes on 0.2.0-beta.1), confirms the library's model: sealed parts, tokens, context attributes, the seam ladder and exact agent contracts. Plain pages came out 65–88% library elements with no styles in views. Expressive pages left the library: Home is 19% library elements and the Editions index is 22%. We checked the report against both codebases. It holds, with five corrections: Card's `meta` already takes a `Badge`, `Hero` already has `eyebrow`, `lead` and `note`, the probes do ship, the reduced-motion fade was a documented choice, and the guide itself sends people to copy a demo template. We also found 18 issues of our own, among them a core `TextField` that hard-codes "Saved" and a Beta proof that never ran on the npm the guide promises. **Six themes:** (1) brand-safe theming (contrast, base colour, link decoration, own fonts); (2) an open page frame and opening (frame settings, `Hero` media, uneven `Grid`); (3) site plumbing (router-aware links, page transitions, scrolling, live text fields); (4) project-side checks that ship; (5) guidance that sends agents to core first; (6) a proof that behaves like a real brand-led project. **Proposed releases:** **0.2.0-beta.2**, quick wins with no breaking changes (14 packets); **0.3.0-beta.1**, the capabilities that keep a brand-led site inside the library (25 packets, with three changes that can break or shift existing projects noted); **later**, the "could" items. **Data-driven sites (Q107)** are in [Part 3](#part-3-data-driven-sites-q107): foundations in 0.3.0-beta.1, the page and site documents, collections, router and renderer in 0.4.0-beta.1. Build started on 2026-11-10 (Q105); every build packet starts in strict design.

**Owner, 2026-11-09 23:55 (verbatim, [DoD Q104](definition-of-done.md#owner-instructions)):** *"I've tried implementing this library in a real proejct and here's the report from that. E:\Projects\designup-project\designup\docs\research\design-library-beta-report.md This is the project. E:\Projects\designup-project\designup Use the learnings from this and create an extensive plan on how to improve the Design Library. No coding yet."*

**Status:** strict design, planning only (F15.PLAN, worker 50). No code, token, component, package, template or tool changed; nothing was written in the DesignUp project. **Shaped by** `ground` (each workstream starts from a promise and what a person can do), `assumptions` (the risks in each workstream), `definition-of-done` (observable Definitions of Done), `design-system`, `visual-noise`, `ui-states` and `ui-copy`. Builds on [Handoff readiness](handoff-readiness.md) (Beta known issues K1–K7), [The adversarial loop](adversarial-loop.md), [Motion](motion.md), [Layout](layout.md), [Spacing](spacing.md) and the [brief](brief.md#design-constraints).

**Stable IDs on this page:** Part 3 (data-driven sites) has its own list. Findings **F01–F60** (the report's appendix, in its order) and **N01–N18** (our own), workstreams **W1–W13**, packets **IP1–IP44**, assumptions **IA**, validation changes **IV**, owner decisions **ID**.

## Part 1: what we learned

### The verdict in plain words

- **The model is right.** No DesignUp view has a class name or an inline style (0 matches in 10 view files). Agents found seams from one contract file, and every workaround sits on a named step of the seam ladder.
- **The edges are closed where brand sites push.** The page frame, link underlines, the neutral canvas, fonts outside the registry, uneven columns, the opening's media and routing have no public seam. The site wrote custom parts that redraw core parts.
- **Three defaults failed a real brand.** A bright orange made link text 3.8:1 and the filled-button label 2.7:1. The page cross-fade still runs under reduced motion. The npm floor the guide gives wasn't enough.
- **Much of the custom work was the project's choice.** Pages were planned in the template's own part names and matched to mock-ups pixel by pixel. But the guide made that path easy: it tells people to copy the nearest template, and nothing in the guide or the checks pushed back.

### Evidence base

#### What DesignUp built

| Item | What we found (read-only) | Where |
| --- | --- | --- |
| Install | Both 0.2.0-beta.1 tarballs by URL; three self-hosted fonts (`@fontsource/bebas-neue`, `ibm-plex-mono`, `@fontsource-variable/archivo`); React 19.3, Vite 8.3, TypeScript 6. Local note: "Install with `npx -y npm@11 install` (npm 9 and 10 fail with `edgesOut`)" | `web/package.json`, `web/AGENTS.md` |
| Agent entry | The project's `AGENTS.md` pastes the library's block (read `node_modules/@design-library/core/AGENTS.md`, Never rules, seam ladder, the adversarial loop) | `web/AGENTS.md` |
| Theme | `applyBrand` with an orange seed; the warm paper canvas by calling `generate()` from `@design-library/core/colour` and writing `--p-base-*` on the root; `applyFonts` with the `studio` preset and Figtree, Roboto Flex and JetBrains Mono; `data-space="loose"`, `data-shape="sharp"`; the scheme read from storage | `web/src/look.ts` |
| Shell | Core `SiteLayout`, `SiteHeader`, `Footer`, `Notifications`; its own hash router, picture preload, `viewTransition` wrapped in its own reduced-motion test, and a 91-line scroll helper | `web/src/App.tsx`, `web/src/lib/scroll.ts` |
| Template | One template, `designup`: 20 part files (9 fundamentals, 8 compounds, 3 layouts; the report counts 19 in the manifest plus 3 outside it), a 784-line stylesheet, a 284-line token file, a 348-line depth-motion module; manifest is the renamed conference template (1,815 lines); stories for 3 parts | `web/src/templates/designup/` |
| Content | Site, editions, talks (1,589 lines), cities, Home and more pages as JSON outside the template; views read it directly; `loadTemplate` is called in the template's index but nothing renders `TemplateView` | `web/src/content/`, `web/src/views/` |

#### Library share, checked

We re-counted Home: the view places 9 core elements (`Accordion`, `Cluster`, `MediaPlayer`, `Text`), the same as the report's 9 of 48. We didn't re-count every page; the report's table stands as its own count.

| Page | Library elements | Custom elements |
| --- | --- | --- |
| Home | 9 (19%) | 39 |
| Editions index | 5 (22%) | 18 |
| Talks index | 14 (35%) | 26 |
| Talk page | 15 (65%) | 8 |
| Speakers | 22 (69%) | 10 |
| Cities | 30 (75%) | 10 |
| Year page | 32 (82%) | 7 |
| More pages and enquiry | 45 (88%) | 6 |

#### Where we checked the report against the code

| Report claim | Checked | Result |
| --- | --- | --- |
| 4 overrides of core page-frame tokens | `tokens.css:256,257,271,272` set `--c-site-layout-padding-block`, `-gap`, `-width`, `-margin` | **Confirmed** |
| 3 important flags | `designup.css:496` (1) and `:736` (2) | **Confirmed** |
| About 40 raw rem and 9 raw px in the main stylesheet | 40 rem and 9 px in `designup.css` | **Confirmed**; the token file adds 111 rem and 13 px the report didn't count |
| Colour primitives read in template tokens | `tokens.css:28,108,109` read `--p-accent-*` and `--p-base-950`, and rebind `--color-text-link` and `--color-text-on-accent` | **Confirmed** |
| Root size scaled to fit the first screen | `tokens.css:266–268`: `html { font-size: min(100vw * 16 / …, 100svh * 16 / …) }` | **Confirmed** |
| Underlines removed site-wide | `designup.css:13`: `:any-link * { text-decoration: none; }` plus 7 more rules | **Confirmed**; the selector also reaches inside core parts |
| Most parts don't use core components | Only `HeaderEnd` (`Button`), `PhotoFrame` (`Image`) and `SponsorWall` (`Heading`, `Link`) import core components; 11 part files draw raw `<a>`, `<h*>`, `<img>`, `<button>` or `<p>` (26 elements) | **Confirmed** |
| No view uses a class or inline style | 0 matches in `web/src/views/` | **Confirmed** |
| Grid has no minimum width though the guide names one | `Grid.tsx` takes `max?: 2 \| 3 \| 4` only; `packages/core/AGENTS.md:66` says "Grid with `min`" | **Confirmed** |
| The guide's npm floor | `guide/1-install.md:8`: "npm 10 or later" | **Confirmed wrong**, and our own [Beta proof](handoff-readiness.md#the-proof-f15r6) ran on npm 11.20.0, so it never tested the floor (N07) |
| `TextField` commits only on blur or Enter | `TextField.tsx`: `onCommit` required, no `onChange`; it announces "Saved" | **Confirmed**, and "Saved" is hard-coded in core (N03) |
| `viewTransition` ignores reduced motion | `motion.ts:88`: under reduce it sets no names but still starts the transition; `css/motion.css:93` documents "Reduced motion: … it only fades" | **Partly**: a documented choice, not an oversight (N06) |
| `applyBrand` sets brand ramps only | `theme/index.ts:40–79`: no `base` input, no contrast measure | **Confirmed** |
| `applyFonts` takes registry faces only | `fontVars` throws on an unknown face id | **Confirmed** |
| Tracking tokens are zero or negative | `tokens.json` tracking: display, tight, normal | **Confirmed** |
| Private breakpoints | Core CSS: 40rem (4), 30rem (3), 52, 64, 80rem, heights 24 and 31rem; 13 container queries | **Confirmed** |
| `Card` has no badge or status slot | `Card.tsx` has `eyebrow`, `meta: ReactNode` and `actions`; the seam ladder's own step 2 example is "A `Badge` into a `Card`'s `meta`" | **Report incomplete**: the seam exists; the need is where it sits (N10) |
| Core `Hero` takes one picture | `Hero.tsx`: `src`, `alt`, `picture`, `eyebrow`, `lead`, `actions`, `note`, layouts `split`, `stacked`, `divided` | **Partly**: an eyebrow and a note slot exist; any media, a trail and a fit option don't (N11) |
| The checks aren't shipped | `packages/core/tools/` holds only `check-content.mjs`; but `./probes/*` exports all 10 probes | **Partly**: the `check:*` scripts are repository-only, the probes ship (N12) |
| Started from a renamed demo (project choice) | `guide/6-templates.md` "Adapt a template as your own": "Copy the nearest template into a new namespace", and the 3–5 grouping rule keeps planned screens in a manifest | **Partly the guide's doing** (N13) |
| The project's own docs drift | `web/AGENTS.md` says parts live in `src/parts/`; they're in the template. `look.ts` names Archivo as the display face and Source Serif 4 for numerals, the gap log names Bebas Neue, and `package.json` installs both | **Confirmed, and wider than reported** (N17) |

### Findings register

**Root cause:** **Library** (a missing seam or capability, or a wrong default), **Docs** (agent guidance or docs), **Check** (a check or validator that should have caught it), **Self** (the project's own choice). **Severity:** **S1** fails accessibility or blocks install; **S2** forces leaving the library or breaking a Never rule; **S3** a workaround inside the rules; **S4** polish. **Recurrence:** **High** (most adopters), **Med** (most brand-led sites), **Low** (a few sites). **Action:** build, document, check, decide (owner), or won't do. Paths are under `packages/core/` unless they start with `packages/templates/`, `docs/` or `tools/`.

| ID | Area | Symptom | Root cause | Owning files | Severity, recurrence | Action |
| --- | --- | --- | --- | --- | --- | --- |
| F01 | Install | npm 9 and 10 crash with `edgesOut` on the tarballs; npm 11 works | Library + Docs: the peer set and the stated floor were never tested | `package.json`, `guide/1-install.md`, `tools/pack.mjs` | S1, High | Build an install check on npm 10 and 11; state the proven floor (IP1, IP2) |
| F02 | Components | Running code when a link is pointed at or focused needs event delegation | Library: `Link` and `Button` forward data attributes only | `react/fundamentals/Link.tsx`, `Button.tsx` | S3, Med | Build: forward pointer-enter, pointer-leave, focus and blur (IP9) |
| F03 | Components | An index that previews the hovered row became a custom list | Library (mixed with the pixel match) | `react/compounds/IndexList.tsx` | S4, Low | Later (IP40) |
| F04 | Components | One tinted band needed a custom part | Library: `Section` has no tone | `react/compounds/Section.tsx`, `css/compounds/section.css` | S3, Med | Build `tone` from the elevation ladder (IP10) |
| F05 | Typography | Facts read as a sentence became a heading | Library: `Text` has body, small and caption only | `react/fundamentals/Text.tsx`, `tokens/tokens.json` | S3, Med | Build a lead style (IP11) |
| F06 | Typography | No size between heading 1 and display | Library | `react/fundamentals/Heading.tsx`, `tokens/tokens.json` | S3, Med | Build one statement size, after ID9 (no redundant sizes) (IP11) |
| F07 | Imagery | No 21:9 or 4:3, no focal point | Library | `Image.tsx`, `Card.tsx`, `layouts/Hero.tsx`, `css/fundamentals/type-and-media.css` | S3, Med | Build ratios and a focal point (IP12) |
| F08 | Tokens | A warm canvas needed `generate()` called by hand | Library + Docs: no `base` in `applyBrand`; `generate` is public but undocumented (N05) | `theme/index.ts`, `colour/generate.mjs`, `guide/3-tokens.md` | S2, High | Build `base` in `applyBrand` (IP6) |
| F09 | Components | A header action that navigates became a button setting the hash | Library: `Button` has no `href` | `react/fundamentals/Button.tsx`, `css/fundamentals/controls.css` | S2, High | Build `href` on `Button` (IP8) |
| F10 | Components | Play the film in place | Not a gap: `Reveal` and `MediaPlayer` | — | — | Document it as a recipe example (IP16) |
| F11 | Layout | 60/40 and heading-beside-content needed a custom split | Library: equal columns only | `react/fundamentals/Grid.tsx`, its CSS | S2, High | Build ratios and an aside arrangement (IP20) |
| F12 | Forms | Enquiry fields each announce "Saved" | Library: no form mode; core also hard-codes "Saved" (N03) | `TextField.tsx`, `Field.tsx`, `NumberField.tsx` and other commit fields | S2, High | Build a form mode (IP14) |
| F13 | Navigation | An in-page link replaces the hash route | Library: `Link` isn't router-aware | `Link.tsx`, a new routing seam | S2, Med | Build a routing adapter (IP27) |
| F14 | Navigation | No "on this page" or A–Z jumps | Library | new compounds; `docs/component-coverage.md` (atiya `ContentsList`) | S3, Med | Build after IP27 (IP28) |
| F15 | Components | "Ended" and "Coming up" became eyebrow text | Docs mostly: `Badge` in `meta` already works (N10) | `Card.tsx`, `AGENTS.md` seam ladder | S4, Med | Document it in the finder; build a `status` place only if `meta`'s position fails (IP16, ID10) |
| F16 | Imagery | Grayscale tiles in colour on hover | Library (mixed) | `Image.tsx`, `Card.tsx`, `MediaPlayer.tsx` | S3, Med | Build treatments (IP31) |
| F17 | Forms | Search narrows only on Enter or blur | Library | `TextField.tsx` | S2, High | Build `onChange` (IP14), then the filter pattern (IP29) |
| F18 | Imagery | Grayscale video poster | Not a gap | `MediaPlayer.tsx` | — | Covered by IP31 |
| F19 | Content | Topics as an entry point | Not a gap | — | — | None |
| F20 | Tokens | Underlines can't be turned off | Library: hard-coded `text-decoration-line: underline` | `css/fundamentals/type-and-media.css:105–128`, `chip.css:164`, every compound drawing links, `tokens/tokens.json` | S2, Med | Build a link-decoration token, underline stays default (IP5) |
| F21 | Navigation | Year strip on narrow screens | Not a gap; scroll into view to confirm | `react/compounds/Tabs.tsx` | S4, Low | Check at 320 px in IP28 |
| F22 | Imagery | The stipple field is private | Library | `react/…/stipple.ts`, `ImageGeneration.tsx` | S4, Low | Later (IP41) |
| F23 | Typography | Faces outside the registry only in custom parts | Library | `theme/index.ts`, `fonts/loader.ts` | S2, High | Build site-supplied faces (IP23) |
| F24 | Typography | Display axes override `font-stretch` on every h1–h3 | Library (wrong scope) | `theme/index.ts` (`--axes-*`), heading CSS | S4, Low | Later (IP42) |
| F25 | Typography | Long body copy in sans | Not a gap | — | — | None |
| F26 | Tokens | Warm paper and the orange | Library: same as F08 | `theme/index.ts` | S2, High | IP6 |
| F27 | Materials | Paper grain | Library | `css/materials`, [Modifiers](modifiers.md) seams | S4, Low | Later, as a modifier (IP43) |
| F28 | Typography | Tracked labels need raw em values | Library | `tokens/tokens.json` tracking | S3, Med | Build wide and wider (IP7) |
| F29 | Layout | Openings can't sit right under the header | Library + Docs: tokens exist, no sanctioned seam or flush option | `layouts/SiteLayout.tsx`, its CSS (`--c-site-layout-*`) | S2, High | Build frame settings and a flush option (IP4) |
| F30 | Layout | First label 40px under the header, tighter gap | Library + Docs | `--c-site-layout-padding-block`, `--c-site-layout-gap` | S3, Med | IP4 |
| F31 | Layout | One breakpoint; first screen that always fits | Mixed | core CSS media queries (30–80rem, 24/31rem) | S3, Med | Build a shared set and prefer container queries (IP26) |
| F32 | Layout | Browser zoom re-fits instead of enlarging | Self | DesignUp `tokens.css:266–268` | S2 for that site, Low | Won't do in core; a check flags root size overrides (N15); fluid scale later (IP44) |
| F33 | Content | Quote line breaks at every width | Self | — | — | Won't do |
| F34 | Layout | The reference's 56px margin | Mixed | `--c-site-layout-margin` | S4, Med | IP4 |
| F35 | Seams | Header nav place, wordmark size, current style | Mixed | `react/compounds/SiteHeader.tsx`, `css/compounds/site-header.css`; K5 | S3, High | Build options with K5 (IP32) |
| F36 | Tokens | Status link and theme control built by hand | Not a gap, but a scheme control would have saved work | — | S4, High | Build a scheme control (IP25) |
| F37 | Accessibility | Link 3.8:1, label on fill 2.7:1 after `applyBrand` | Library (wrong default): contrast isn't measured | `theme/index.ts` `brandVars`, `colour/generate.mjs:201,240`; `tools/colour.mjs` (repository-only contrast) | S1, High | Build a contrast guard (IP21) |
| F38 | Components | Buttons with the reference's size and arrow | Self | — | — | Won't do; `Button` sizes and icons exist |
| F39 | Imagery | Collage frames use native images | Self (plus F07) | — | S4, Low | IP12 covers the generic part |
| F40 | Seams | Footer can't match the reference | Mixed | `react/compounds/Footer.tsx` | S3, Med | Build arrangements (IP33) |
| F41 | Templates | Template tokens hand-kept after a rename | Library: no shipped token generator | `guide/6-templates.md`, repository token tools | S2, High for template authors | Build a scaffold with a token command (IP35) |
| F42 | Seams | The real logo in header, footer and favicon | Not a gap | — | — | None |
| F43 | Imagery | Generated photos at new pixel sizes | Not a gap | — | — | None |
| F44 | Tokens | A deliberate dark inverse | Not a gap (stopgap) | — | — | IP6 replaces the stopgap |
| F45 | Layout | Opening with any media that fits the first screen | Library | `layouts/Hero.tsx`, `layouts/Frame.tsx` | S2, High | Build a media slot, trail and fit option (IP19) |
| F46 | Tokens | Orange small text on paper | Library: one accent role | `tokens/tokens.json` colour roles, `tokens/colour.config.json` | S2, Med | Build accent text and accent display roles (IP22) |
| F47 | Layout | Words change in place without moving the page | Library | `layouts/Hero.tsx` | S4, Low | Later (IP40) |
| F48 | Motion | Scrolls the site makes itself | Library | `react/behaviour/motion.ts` | S3, Med | Build a scroll helper (IP17) |
| F49 | Motion | Page change that waits, then cross-fades | Library | `layouts/SiteLayout.tsx`, `motion.ts` | S3, Med | Build a page key (IP30) |
| F50 | Guidance | Custom parts duplicate core `Hero`, `Quote`, `Statistic`, `IndexList`… | Self + Docs: no "core first" step, no recipe | `AGENTS.md`, `guide/4-components.md`, `guide/6-templates.md` | S2, High | Document a recipe and a finder (IP16, IP34) |
| F51 | Checks | Raw rem/px and important flags | Self + Check: `check:parts` is repository-only | `tools/check-parts.mjs`, `packages/core/tools/` | S2, High | Ship it (IP37) |
| F52 | Seams | Overrides of core page-frame tokens | Library + Docs: the ladder is silent on core component tokens (N04) | `AGENTS.md` seam ladder, SiteLayout tokens | S2, High | Document theme settings (IP4), check the rest (IP38) |
| F53 | Templates | Manifest is the renamed conference template | Self + Docs: the guide says copy the nearest (N13) | `guide/6-templates.md` | S3, High | Build an empty scaffold; add a prune step (IP35) |
| F54 | Templates | `loadTemplate` unused; parts outside the manifest | Self + Check | `tools/check-content.mjs` | S3, Med | Check (IP39) |
| F55 | Templates | 16 of 19 parts without stories | Self (the check caught it) | `tools/check-content.mjs` | S4, Med | Later: a story starter (IP43) |
| F56 | Content | Words written in code | Self + Check | a new words check | S3, High | Check (IP38) |
| F57 | Guidance | Guide and contracts disagree (Grid `min`, npm floor) | Docs | `AGENTS.md:66`, `guide/1-install.md:8`, `agent/index.json` | S3, High | Fix, then check names against the index (IP2, IV6) |
| F58 | Layout | Core components keep their own breakpoints | Library: same as F31 | core CSS | S3, Med | IP26 |
| F59 | Motion | `viewTransition` fades under reduced motion | Library (a documented choice, N06) | `react/behaviour/motion.ts:88`, `css/motion.css:93` | S2, High | Decide (ID1), then build (IP3) |
| F60 | Checks | Project-side checks not shipped | Check | `tools/check-views.mjs`, `check-parts.mjs`, `check-clipping.mjs`, `check-materials.mjs`, `check-motion.mjs` | S1 for the rules' credibility, High | Ship one command (IP37) |
| N01 | Install | Tarballs by URL are the fragile step behind a package proxy | Library (distribution, decided Q82) | `tools/pack.mjs`, release flow | S3, High | Decide (ID2); fix the peer set first |
| N02 | Guidance | The adversarial loop is heavy for a small static site; whether it ran is unclear | Docs | `guide/8-review.md`, [The adversarial loop](adversarial-loop.md) | S3, Med | Document a light review with a one-command probe run (IP18) |
| N03 | Forms | `TextField` hard-codes "Saved" (Never rule 8 broken in core), and its own doc says forms belong elsewhere, yet no text field fits a form | Library + Check | `TextField.tsx:97–106,287` and other commit fields | S2, High | Build words from props and a form mode (IP14); add core to the words check (IP38) |
| N04 | Seams | The seam ladder neither allows nor forbids setting a core component token (`--c-*`) | Docs | `AGENTS.md` "The seam ladder" | S2, High | Decide (ID4); document an allow-list of theme settings (IP4) |
| N05 | Tokens | `generate()` with a `base` is a public export but undocumented, so it looked like a back door | Docs | `colour/index.d.mts`, `guide/3-tokens.md` | S3, Med | IP6 documents it while adding `base` |
| N06 | Motion | Reduced motion keeps the cross-fade by design (`motion.css:93`), which a real adopter read as a bug | Docs + Decide | `css/motion.css`, [Motion](motion.md) | S2, High | Decide (ID1) |
| N07 | Validation | The Beta proof ran on npm 11.20.0, while the guide promises npm 10 | Check | [The proof](handoff-readiness.md#the-proof-f15r6) | S1, High | An install matrix in the proof (IV2) |
| N08 | Validation | The Beta proof used a dark teal seed; a bright brand was never tried, and contrast is admitted unmeasured (C1) | Check | [Customizing](handoff-readiness.md#customizing-from-the-consumer-side) | S1, High | A bright-brand scenario (IV3) |
| N09 | Guidance | Custom parts draw raw `<a>`, `<h*>`, `<img>`, `<button>` and lose core focus, names and token updates; no rule asks parts to compose core fundamentals | Docs + Check | `AGENTS.md` Never rules, `guide/4-components.md`, `tools/check-parts.mjs` | S2, High | A rule and a check (IP34, IP38) |
| N10 | Components | `Badge` in `Card`'s `meta` already works; the adopter didn't find it | Docs | `Card.tsx`, the finder | S4, Med | IP16 |
| N11 | Layout | Core `Hero` already has `eyebrow`, `lead`, `actions` and `note`; only media, a trail and fit are missing | Docs + Library | `layouts/Hero.tsx` | S2, High | IP19 builds only the missing parts |
| N12 | Checks | The 10 probes ship (`./probes/*`), but the guide still tells people the style checks aren't shipped and to read the rules instead | Docs | `AGENTS.md` "Checks" | S3, High | IP37 replaces that row |
| N13 | Templates | The guide's own path is "copy the nearest template", and the 3–5 grouping rule asks for planned screens, so demo screens stay | Docs | `guide/6-templates.md` | S3, High | IP35 (empty scaffold, prune step) |
| N14 | Templates | The template model is screens with fixed content files; there are no content collections or route parameters (a talk, a year), so a 55-route site keeps its content outside the template and its check | Library (structural) | `render/`, `schemas/template.schema.json`, `tools/check-content.mjs`, `guide/2-content.md` | S2, Med | Decide (ID5); check any schema'd folder now (IP39), collections later |
| N15 | Checks | Root font-size overrides aren't caught | Check | a new project check | S2, Low | IP38 |
| N16 | Checks | Global selectors in template CSS (`:any-link *`, `html`, element selectors) restyle core parts and no check catches them | Check | `tools/check-parts.mjs` | S2, Med | IP38 |
| N17 | Guidance | The project's own notes drifted (parts path, font names) | Self | DesignUp files | S4, Med | Won't do in the library; the paste-in block adds one line: keep local notes current |
| N18 | Process | Never rule 6 promotes to core only when "two or more products need it"; with one adopter, every recommendation fails that bar literally | Docs + Decide | `AGENTS.md` Never rule 6 | S3, High | Decide (ID6) |

**Totals:** 60 report rows (35 real, 6 mixed, 10 project choice and 9 not a gap, as the report counts them) and 18 of ours. Our root causes shift a few report rows: F15 and F53 are mostly guidance, and F59 is a decision rather than a defect.

## Part 2: what we'll do

### Workstreams

Each workstream starts from the library's promise: **a team builds a product in its own brand from the library's parts, through public seams, without forking or styling core, and agents get it right from the contracts.** Each Definition of Done is written as what a person can do and what we'll see.

#### W1 Install and setup

- **Goal:** a person installs both packages on the npm the guide names, behind a package proxy, first time.
- **Items:** a peer set that npm 10 resolves, or a guide that says npm 11 (F01); an install check on npm 10 and 11 from the release files, run by `npm run pack` (F01, N07); the distribution decision kept or revisited (N01, ID2).
- **Done when:** a fresh folder installs both tarballs with `npm install` on npm 10.x and on 11.x with no flags, through the proxy, and the transcript is on [Handoff readiness](handoff-readiness.md); the guide's floor equals the lowest version that passed.
- **Risks and assumptions:** IA1, the `edgesOut` crash is a peer-set problem we can fix, not an npm 10 bug we can only document. Cheapest test: install the 0.2.0-beta.1 tarballs on npm 10.9 in a clean folder with `--loglevel silly`.

#### W2 Agent guidance and docs

- **Goal:** an agent tries core first, names only seams that exist, and knows when a custom part is the right step.
- **Items:** fix `AGENTS.md:66` and the npm floor (F57); a check that every prop, token and command named in `AGENTS.md` and `guide/` exists in `agent/index.json` (F57); a "core first" finder (need → core part → what it can and can't do; F50, N10, N11); a brand-led site recipe with a custom-part budget (F50); a rule that custom parts compose core fundamentals for links, headings, pictures and buttons (N09); a light review for small static sites (N02); the "Checks" table changed when checks ship (N12); the reduced-motion choice written where agents read it (N06).
- **Done when:** the names check passes on the guide and contracts; the finder page opens in the library and covers at least: opening, big number, quote, list of links, key–value facts, tinted band, status on a card, film in place; the recipe names a budget (ID7) and the next step when a page exceeds it.
- **Risks and assumptions:** IA2, agents read a finder before writing parts. Prove it in the next separate-project proof by counting duplicated core parts (IV4).

#### W3 Components and props

- **Goal:** common marketing needs are props, not parts.
- **Items:** `Button` `href` (F09); pointer and focus handlers on `Link` and `Button` (F02); `Section` `tone` (F04); `Text` lead and one statement size (F05, F06); `Image` ratios and a focal point, also on `Card` and `Hero` (F07); a form mode and words from props on commit fields (F12, N03); `TextField` `onChange` (F17).
- **Done when:** each prop shows on its component's library page with a story per value in light, dark and more contrast; `agent/index.json` lists it; a `Button` with `href` is an `<a>` with button looks and the same focus ring; a form-mode field never announces "Saved"; no core component holds a word a person reads.
- **Risks and assumptions:** IA3, a statement size and a lead style are two needs, not one (the owner's no-redundant-variants rule, ID9). IA4, `Button` with `href` doesn't blur the link-versus-action rule; the recipe says when a link should look like a button.

#### W4 Slots and seams

- **Goal:** a brand can tune the header, footer and page frame without a fork.
- **Items:** `SiteLayout` frame settings (top padding, gap, margin, column width) as a documented allow-list, and a flush opening (F29, F30, F34, F52, N04); `SiteHeader` nav place, wordmark size or mark-only, current style (fill, colour, rule; never a one-sided stripe), and the narrow form (F35, K5); `Footer` arrangements (F40).
- **Done when:** a template sets each frame setting through the theme and the library's frame page shows each; DesignUp's four overrides map one to one to documented settings; `SiteHeader` at 320 px is one row of about 64 px (K5); three footer arrangements render at 320 px and wide with no sideways scroll.
- **Risks and assumptions:** IA5, the header's current-page styles stay within the visual-noise rules (one cue per meaning).

#### W5 Tokens and theming

- **Goal:** any brand colour gives AA text by default, and the canvas and link look are brand choices.
- **Items:** a contrast guard in `applyBrand` that measures link, accent text and on-accent, moves to the nearest passing step and returns warnings (F37); `base` with temperature and pins (F08, F26, F44, N05); a link-decoration token with rest and hover, underline the default, and a required replacement cue (F20); accent text (4.5:1) and accent display (3:1) roles (F46); positive tracking (F28); a scheme control (F36); a project command that runs the contrast check for a brand (F37).
- **Done when:** `applyBrand` with seeds `#fd6f02`, `#ffd400`, `#7ed957` and `#00b3ff` gives link and on-accent at 4.5:1 or more in light, dark and more contrast, measured and shown on the Colour page; DesignUp's `look.ts` paper canvas can be written as one `applyBrand` call; with decoration off, every link still has a non-colour cue on hover and focus and a probe row passes.
- **Risks and assumptions:** IA6, moving a role's step doesn't make a brand look wrong (the pinned 500 still shows on fills). IA7, a link with no underline can still pass WCAG 1.4.1 by the technique G183: 3:1 against the surrounding text plus a non-colour cue on hover and focus.

#### W6 Typography

- **Goal:** a brand's own typefaces reach core headings and text.
- **Items:** site-supplied faces in `applyFonts` for any role (family, files or an existing face rule, axes, fallback metrics) (F23); optional label and numeral roles that fall back (report "should"); scoped display axes (F24, later).
- **Done when:** a project registers Bebas Neue for display and core `Heading` on every page uses it; the fallback metrics keep layout shift under 0.05 on load (proposed, not measured); the library's Typography page shows a site-supplied face.
- **Risks and assumptions:** IA8, licences stay the project's: the library loads a face it's given and records nothing.

#### W7 Layout, framing and spacing

- **Goal:** pages lay out in brand proportions while the frameworks still pass.
- **Items:** `Grid` ratios (two to one, three to two, wide–narrow) and a heading-beside-content arrangement that stacks in a narrow container (F11); `Hero` any media, a trail, a foot (or the existing `note`) and a fit-to-first-screen option on `Frame`'s window rules (F45, N11); a shared breakpoint set (F31, F58); K1 and K2 from the Beta known issues; steady opening and fluid scale later (F47, IP44).
- **Done when:** DesignUp's `Split` and `Hero` can be written with core `Grid` and `Hero` (a worked example on each library page); the layout and spacing probes pass at 320, 1000 and 1440 px; every core window query reads the shared set.
- **Risks and assumptions:** IA9, CSS can't use custom properties in media queries; the shared set may need container queries or a build step. Prove with one component before the sweep.

#### W8 Motion

- **Goal:** site motion is token-timed and stops for reduced motion everywhere.
- **Items:** `viewTransition` behaviour under reduce (F59, ID1); a scroll helper (F48); a page key in `SiteLayout` that keeps the old view until the new one is ready (F49); parallax and pointer primitives later.
- **Done when:** with reduced motion set, a route change swaps in the same frame (or fades, per ID1) and the motion probe records it; the scroll helper stops on wheel, touch, pointer and key, and lands at once under reduce.
- **Risks and assumptions:** IA10, a page key in `SiteLayout` works with any router; prove with hash and history routes.

#### W9 Imagery

- **Goal:** pictures crop and treat consistently without custom tiles.
- **Items:** ratios and focal point (with W3); treatments: grayscale, a brand duotone, colour on hover or focus (F16, F18); the stipple field later (F22).
- **Done when:** a Card, an Image and a MediaPlayer poster each show grayscale-to-colour on hover and on focus, and none under `prefers-contrast: more` unless it keeps contrast.

#### W10 Forms and search

- **Goal:** live search and batch forms built from core fields.
- **Items:** `onChange` (F17); form mode (F12, N03); a filter-as-you-type pattern with a polite count (F17).
- **Done when:** the talks finder pattern is a library story: typing narrows the list after a short delay and announces the count once; an enquiry story submits five fields with one Save and one error summary.

#### W11 Navigation and routing

- **Goal:** links, anchors and "on this page" work on static hosts.
- **Items:** a routing adapter (hash or history) used by `Link` and in-page anchors (F13); "on this page" and letter-jump compounds (F14); the year strip check (F21).
- **Done when:** under hash routing a fragment link scrolls to its heading without replacing the route, the back button returns, and focus lands on the heading.
- **Risks and assumptions:** IA11, an adapter is light enough not to be a router; the library never owns routes.

#### W12 Templates and content

- **Goal:** a team starts its own template from empty and keeps it honest.
- **Items:** an empty template scaffold with a token source and a shipped token command (F41, F53, N13); content check flags parts missing from the manifest, manifest screens nothing renders, and any folder with a schema (F54, N14); when to use views versus `TemplateView` (F54); a story starter later (F55).
- **Done when:** `npx design-library-new-template designup` writes a valid empty template that passes the content check; renaming a token and running the token command updates its CSS; the check flags a part file not in the manifest.

#### W13 Checks and validators

- **Goal:** a project enforces the Never rules by running one command.
- **Items:** ship `check:views`, `check:parts`, `check:clipping`, `check:materials` and `check:motion` as `npx design-library-check` (F60, F51); add core-token overrides outside the allow-list, important flags, primitive reads, raw sizes outside token files, root size overrides, global selectors, raw interactive markup in parts and words in TSX (F52, F56, N09, N15, N16); the names check (F57).
- **Done when:** run on a copy of DesignUp's `web/` folder (in a scratch folder, never in the project), the command reports at least: 4 frame overrides (or 0 once they are allowed settings), 3 important flags, 3 primitive reads, the root size override, the global link selector, the 26 raw elements in parts and the hard-coded "Page not found", each with a file, a line and a fix.
- **Risks and assumptions:** IA12, the checks don't drown a real project; ID8 sets fail versus warn.

### Roadmap

Each packet gives an openable result in about 15–60 minutes: a library page, a story, a doc section or a transcript. In the current mode (strict design) every build packet first ships its screens for review; tests come only after the owner approves a design. Packets in one release run in the order shown; a packet may start when the ones in its "After" column are delivered.

#### 0.2.0-beta.2: quick wins (no breaking changes)

| Packet | What the owner opens | Findings | After |
| --- | --- | --- | --- |
| IP1 | Install transcript on npm 10 and 11 in [Handoff readiness](handoff-readiness.md); the peer set fixed or the floor raised | F01, N07 | — |
| IP2 | Guide fixes: the npm floor, `AGENTS.md:66` Grid row, "Checks" row wording | F57, N12 | IP1 |
| IP3 | `viewTransition` under reduce per ID1, shown on the Motion page with reduce on | F59, N06 | ID1 |
| IP4 | `SiteLayout` frame settings page and a flush opening story; allow-list in the seam ladder | F29, F30, F34, F52, N04 | ID4 |
| IP5 | Link-decoration token on the Link page, decoration off in a story, with its cue | F20 | — |
| IP6 | `applyBrand` `base` on the Colour page, the warm paper example | F08, F26, F44, N05 | — |
| IP7 | Wide and wider tracking on the Typography page | F28 | — |
| IP8 | `Button` `href` on the Button page | F09 | — |
| IP9 | Pointer and focus handlers on `Link` and `Button` | F02 | IP8 |
| IP10 | `Section` `tone` on the Section page | F04 | — |
| IP11 | `Text` lead and one statement size | F05, F06 | ID9 |
| IP12 | `Image` 21:9 and 4:3 and a focal point | F07 | — |
| IP13 | `Card` `Badge` in `meta` story (no new prop) | F15, N10 | — |
| IP14 | `TextField` `onChange`, words from props, form mode across commit fields | F12, F17, N03 | — |

**Breaking-change notes:** none in the API. IP3 changes behaviour under reduced motion. IP14 makes the "Saved" word a prop with the same English default. IP8 widens `Button`'s props (an `href` branch), which may change TypeScript narrowing in code that spreads Button props.

#### 0.3.0-beta.1: the next minor

| Packet | What the owner opens | Findings | After |
| --- | --- | --- | --- |
| IP15 | Brand-led site recipe page (draft) | F50 | IP4 |
| IP16 | "Core first" finder page in the library | F10, F15, F50, N10, N11 | IP13 |
| IP17 | Scroll helper story | F48 | IP3 |
| IP18 | Light review section in step 8 and a one-command probe run | N02 | — |
| IP19 | `Hero` media slot, trail and fit-to-first-screen, three variants | F45, N11 | IP4 |
| IP20 | `Grid` ratios and the heading-beside arrangement, three variants | F11 | — |
| IP21 | Contrast guard in `applyBrand`, four bright seeds measured | F37 | IP6 |
| IP22 | Accent text and accent display roles | F46 | IP21 |
| IP23 | Site-supplied faces in `applyFonts` | F23 | — |
| IP24 | Label and numeral roles | report "should" | IP23 |
| IP25 | Scheme control in two forms (ID3) | F36 | ID3 |
| IP26 | Shared breakpoint set, proved on one component, then the sweep | F31, F58 | — |
| IP27 | Routing adapter for `Link` and anchors | F13 | — |
| IP28 | "On this page" and letter jump; year strip at 320 px | F14, F21 | IP27 |
| IP29 | Filter-as-you-type pattern | F17 | IP14 |
| IP30 | `SiteLayout` page key | F49 | IP3, IP27 |
| IP31 | Image treatments | F16, F18 | IP12 |
| IP32 | `SiteHeader` options and the narrow form | F35, K5 | IP4 |
| IP33 | `Footer` arrangements | F40 | IP32 |
| IP34 | Custom-part rule (compose core fundamentals) and budget in the recipe | F50, N09 | IP15, ID7 |
| IP35 | Empty template scaffold with a token command; prune step in step 6 | F41, F53, N13 | — |
| IP36 | K1 and K2 from the Beta known issues | K1, K2 | IP20 |
| IP37 | `npx design-library-check` shipping the five repository checks | F51, F60, N12 | — |
| IP38 | New project checks: overrides, important, primitives, raw sizes, root size, global selectors, raw markup in parts, words in code | F52, F56, N03, N09, N15, N16 | IP37, ID8 |
| IP39 | Template-aware content check (parts vs manifest, unrendered screens, any schema'd folder) | F54, N14 | IP37 |

**Breaking-change notes:** IP21 changes the generated link and on-accent steps for bright brands (a visual change; the changelog lists the four test seeds and their before and after). IP26 may move a component's change point by up to one step. IP38 makes new failures in existing projects; ID8 decides whether they start as warnings. A `0.3.0` minor is right while the version is below 1.0.

#### Later (0.5 or after; 0.4 is data-driven sites, Part 3)

| Packet | Item | Findings |
| --- | --- | --- |
| IP40 | Index list with a preview; steady opening | F03, F47 |
| IP41 | Reusable stipple effect | F22 |
| IP42 | Scoped display axes | F24 |
| IP43 | Surface texture as a modifier; story starter | F27, F55 |
| IP44 | Fluid scale with a body-text floor; parallax and pointer primitives | F32, report "could" |

### Out of scope: what stays in the consuming project

From the report's section 6, each checked against the library's rules:

| Stays in the project | Why | The library's part |
| --- | --- | --- |
| The exact faces (Bebas Neue, IBM Plex Mono, Archivo, Figtree) | Brand choices; licences are the project's | A way to register faces (IP23) |
| The collage, orange shapes and overprint blend | Art direction | A media slot (IP19) and treatments (IP31) |
| Pixel-matching the mock-ups (56px margin, nav start, button size and arrow, the 1228 × 768 frame) | A template's job, through seams | Frame settings (IP4), header options (IP32) |
| A first screen that fits by scaling the root size | Breaks zoom and the text floor | A check that flags it (IP38); a fluid scale with a floor later (IP44) |
| The paper colour and the orange | Palette | `base` and brand seams (IP6) |
| No underlines by default | A brand choice | The token, with underline as the default (IP5) |
| The theme control as an icon button | The owner of DesignUp chose it | A scheme control in both forms (IP25) |
| Depth-motion weights | Per-site tuning | Primitives with ranges, later (IP44) |
| Quote line breaks and the year strip | Content and one site's navigation | None |
| The orange tab on the active year row | A one-sided accent, which the [brief](brief.md#design-constraints) forbids | None; the header's current style uses a fill, colour or full rule (IP32) |
| DesignUp's routes, router and content model | The library never owns routes | A routing adapter (IP27) and content checks (IP39) |

### Changes to how we validate

**Why the Beta proof and the probes missed these:**

1. **The proof spoke the library's language.** It copied `harbour`, the smallest template, built one café home and scored it with our own probes. It never had a brief written in another vocabulary or a mock-up to match, so it never felt the pull out of the library.
2. **The proof's inputs were safe.** A dark teal seed (no contrast stress), registry fonts, one route (no routing, anchors or page transitions), no search and no form.
3. **The proof's install didn't test the guide.** It ran npm 11.20.0 while the guide promises npm 10 (N07).
4. **The probes score a page, not the project.** They check spacing, noise, clipping and states on what is drawn. They don't count custom parts, overrides, raw markup in parts or words in code, and the style checks that would have stayed in the repository.
5. **Reduced motion was checked per component, not per route change.** The motion probe ran on a single page, so the page cross-fade under reduce was never seen.

**What changes:**

| ID | Change | Where |
| --- | --- | --- |
| IV1 | The separate-project proof has a **brand-led scenario**: a brief and a mock-up in the project's own words, at least 6 routes under hash routing, a bright seed, one self-hosted face, a search list, an enquiry form and an in-page anchor | [Handoff readiness](handoff-readiness.md), a new "Proof scenarios" section |
| IV2 | **Install matrix:** npm 10.x and 11.x from the release files, every release | `tools/pack.mjs` or a release step; the transcript in Handoff readiness |
| IV3 | **Bright-brand set:** `#fd6f02`, `#ffd400`, `#7ed957`, `#00b3ff` measured for link, accent text and on-accent in all three contexts | The Colour page; `npx design-library-check` contrast |
| IV4 | **Library share and workaround count** as proof results: library versus custom elements per page, overrides, raw markup in parts; a proof fails if a page that a core part covers is drawn custom | The proof report; IP38's checks produce the counts |
| IV5 | **Route-level motion:** the motion probe runs across a route change with reduce on | `probes/motion-probe.js`, step 8 |
| IV6 | **Names check** on the guide and contracts, run with `npm run check` | `tools/` (IP2, IP37) |
| IV7 | **The adopter's gap log** as a shipped template: every workaround names its seam-ladder step, so the next report is comparable | `guide/8-review.md` |
| IV8 | **Re-run on DesignUp** after 0.3.0-beta.1: the DesignUp team (or its agent) migrates and reports the new share; we never write in that project | Owner (ID11) |

### Open owner decisions

Each has a working default we'll use if the owner doesn't say otherwise.

| ID | Decision | Recommended default |
| --- | --- | --- |
| ID1 | Under reduced motion, does a page change fade or swap at once? | **Swap at once.** A fade is often allowed, but an adopter read it as a leak, and the site checked for itself anyway |
| ID2 | Keep tarballs by URL (Q82), or publish to a registry? | **Keep tarballs** for 0.2.0-beta.2 and fix the peer set (IP1); revisit at 0.3.0 if npm 10 still fails |
| ID3 | Scheme control form | **A three-way `SegmentedControl` (light, dark, system)** as the default, since it isn't binary; a `Switch` form for a two-way dark toggle; an icon button only as a documented option |
| ID4 | May a project set core component tokens? | **Yes, from a published allow-list per component** (frame settings first); everything else stays private and the check flags it |
| ID5 | Should templates model content collections and route parameters? | **Not yet.** For 0.3.0, document "views plus a checked content folder" as a first-class path and extend the content check (IP39); collections later if a second adopter needs them |
| ID6 | Never rule 6 asks for two products before a core change. Does DesignUp plus the library's own templates count? | **Yes:** a real adopter plus one shipped template (or a reference product) is two; the change is still reviewed on its own |
| ID7 | Custom-part budget per page in the recipe | **About a third of a page's elements;** over that, try the finder and the seams before more parts |
| ID8 | Do the new project checks fail or warn? | **Fail** on Never-rule breaks (overrides outside the allow-list, important flags, primitive reads, global selectors, words in code); **warn** on counts (raw sizes, raw markup in parts) for one minor, then fail |
| ID9 | A lead style and a statement size: two variants or one? | **Two:** lead is body-scale prose, statement is a display-scale sentence; neither duplicates an existing size |
| ID10 | `Card` status: `Badge` in `meta`, or a new place near the title? | **`meta` first** (IP13); a `status` place only if the finder shows `meta`'s position fails a real layout |
| ID11 | Ask the DesignUp project to re-run on 0.3.0-beta.1 and report? | **Yes,** with the same appendix shape (IV7) |

## Part 3: data-driven sites (Q107)

**Owner, 2026-11-10 01:52 (verbatim, [DoD Q107](definition-of-done.md#owner-instructions)):** *"Here's another input from the DesignUp site implementation, account for it in the Design library improvement. E:\Projects\designup-project\designup\docs\research\design-library-data-driven-requirement.md"*

> **TL;DR:** DesignUp asks for sites that are **strictly data-driven**: every word, page and section order in JSON, and site code that only starts the app, loads data and calls the library (D1–D8, 45 changes: 22 must, 20 should, 3 could). It's a generic need (conference, marketing, docs, portfolio, shop and news sites all have it). The library already has the base: content schemas, 26 block types, `TemplateView`, namespaced template blocks and a content check that reports JSON paths. We checked the requirement against both codebases. It holds, with five corrections and answers to its eight open questions. The plan adds **workstream W14**, **packets DP1–DP24** and **owner decisions ID12–ID20**. Six existing packets change shape so nothing is built twice: IP27 (a core router, not just a link adapter), IP30 (named page transitions), IP12 and IP31 (props that mirror picture fields), IP19 (a block slot), IP22 (an accent mark) and the checks IP35–IP39. Small foundations go into **0.3.0-beta.1**; the page and site documents, collections, the router and the renderer make **0.4.0-beta.1, "Data-driven sites"**; migrations, conditions, locales and effects come later. Everything is additive: `TemplateView`, views and current content keep working.

**Stable IDs:** findings **DR1–DR45** (the requirement's IDs in brackets), corrections **DC1–DC5**, workstream **W14**, packets **DP1–DP24**, acceptance steps **AT1–AT6**, decisions **ID12–ID20**.

### Checked against the code

| Requirement claim | Checked | Result |
| --- | --- | --- |
| 11 view files and 1 view part arrange pages by hand; `MorePage` renders 18 pages from one shape | `web/src/views/` (10 TSX files plus `more/parts/Enquiry.tsx` and `more/routes.ts`) | **Confirmed** |
| `App.tsx` matches routes, builds titles, maps menu sections, runs transition, scroll and focus | `web/src/App.tsx:19–160` | **Confirmed** |
| `lib/data.ts` derives speakers and copies the core `fill` helper | `web/src/lib/data.ts:21,44` | **Confirmed**; core already exports `fill` from `@design-library/core/render` (`render/index.ts`), so the copy is a docs gap |
| No content file has a `$schema` | 0 of the files in `web/src/content/` | **Confirmed** |
| The manifest lists 19 parts but only 2 block types | `registry.tsx`: `designup.countdown`, `designup.sponsor-wall` | **Confirmed** |
| Home says "107 talks"; the collection has 93 | `content/home.json` (twice), `content/talks.json` `talks` (93) | **Confirmed**: nothing derives the number |
| Accent phrases and "to confirm" fallbacks in views | 19 calls to `accentPhrase`, `accentTail`, "to confirm" or `'Home'` across `views/` | **Confirmed** |
| `TemplateView` shows an alert for unknown types | `render/TemplateView.tsx:6,86` | **Confirmed** |
| `text` is plain, backticks only | `schemas/blocks.schema.json` `$defs.text` and its description | **Confirmed** |
| `action` requires `says` and can't navigate | `blocks.schema.json` `$defs.action`: `required: [label, says]` | **Confirmed** |

**Corrections:**

| ID | The requirement says | What we found |
| --- | --- | --- |
| DC1 | "Links accept only fixed `/layout` ids" | `href` also takes `https://…`, `mailto:…` and `#anchor`; what's missing is routes with parameters and other pages' anchors |
| DC2 | Template CSS has 2 `!important` | 3 flags on 2 lines (`designup.css:496`, `:736`) |
| DC3 | Open question: can the content envelope's `record` serve one page per item? | No. `record` is one application layout's data, checked against `$defs/record.{layout}` (`schemas/content.schema.json:20`); there are no collections or item routes |
| DC4 | Open question: is `motion/zero-latency.json` the start of a motion catalogue? | No. It lists the 22 places that must never animate (Z1–Z22), read by the motion check and probe; an effects catalogue would be new (DP23) |
| DC5 | Open question: is `BLOCKS` loaded in full? | Yes: one static map (`render/blocks.tsx:279`), and `loadTemplate` callers use eager `import.meta.glob` (`templates/harbour/index.ts`) |

### Findings register: data-driven sites

Root causes as in Part 1. "Action" names the packet; **(+IPn)** means an existing packet that changes shape for it.

| ID | Need (requirement) | Priority | Root cause | Owning files (new files marked *new*) | Action |
| --- | --- | --- | --- | --- | --- |
| DR1 | Page document schema (PD1) | Must | Library | `schemas/page.schema.json` *new*, `schemas/content.schema.json`, `tools/check-content.mjs` | Build DP9 |
| DR2 | Page metadata and title (PD2) | Must | Library | `schemas/page.schema.json`, `render/SiteView.tsx` *new* | Build DP9, DP15 |
| DR3 | Site document (PD3) | Must | Library | `schemas/site.schema.json` *new* | Build DP8 |
| DR4 | Frame settings per page (PD4) | Should | Library | `tokens/settings.json`, `schemas/page.schema.json` | Build DP9 on the theme settings (IP4) |
| DR5 | Document versions and migrations (PD5) | Should | Library | `tools/migrate.mjs` *new*, `CHANGELOG.md` | Later DP20 |
| DR6 | Every placeable part has a schema contract (REG1) | Must | Library + Docs | `schemas/blocks.schema.json`, `agent/index.json`, `tools/agent-index.mjs` | Build DP10 |
| DR7 | Slots and nesting (REG2) | Must | Library | `render/types.ts` (`accepts`, `ctx.blocks`), `blocks.schema.json` | Build DP11 (+IP19, +IP20) |
| DR8 | Lists bound to collections (REG3) | Must | Library | `blocks.schema.json`, `render/SiteView.tsx` | Build DP13 |
| DR9 | Conditional sections (REG4) | Should | Library | `schemas/page.schema.json` | Later DP21 |
| DR10 | Actions that navigate (REG5) | Must | Library | `blocks.schema.json` `$defs.action`, `render/blocks.tsx` `actionButtons` | Build DP2 (+IP8) |
| DR11 | Searchable registry (REG6) | Should | Docs + Library | `tools/blocks.mjs` *new* (bin), the finder | Build DP10 (+IP16) |
| DR12 | One render entry for any page (R1) | Must | Library | `render/SiteView.tsx` *new*, `render/index.ts` | Build DP15 |
| DR13 | Failures contained and traceable (R2) | Must | Library | `render/SiteView.tsx`, `render/TemplateView.tsx` | Build DP15 |
| DR14 | Loading and empty per section (R3) | Should | Library | `render/SiteView.tsx`, `Skeleton`, `EmptyState` | Build DP15 |
| DR15 | The "to confirm" pattern (R4) | Must | Library | `blocks.schema.json` (an `unconfirmed` value form), `render/blocks.tsx`, the project check | Build DP4 |
| DR16 | Template parts join the registry (TP1) | Must | Library | `schemas/template.schema.json` (`parts` with schema and example), `render/types.ts` | Build DP18 (+IP35) |
| DR17 | Manifest matches what ships (TP2) | Should | Check | `tools/check-content.mjs` | Build DP7 (+IP39) |
| DR18 | Parts style through tokens only (TP3) | Must | Check | `tools/check-project.mjs` | Done in DP6 (warnings in 0.3) |
| DR19 | Parts extend a core block (TP4) | Could | Library | `schemas/template.schema.json` | Later DP22 |
| DR20 | Rich inline text without markup (CM1) | Must | Library | `blocks.schema.json` `$defs.richText` *new*, `render/rich-text.tsx` *new*, `Text` tone `accent` | Build DP1 (+IP22) |
| DR21 | Typed collections (CM2) | Must | Library | `schemas/collection.schema.json` *new*, `tools/check-content.mjs` | Build DP12 |
| DR22 | References between collections (CM3) | Must | Library | `schemas/collection.schema.json`, `render/SiteView.tsx` | Build DP12 |
| DR23 | Derived values and generated collections (CM4) | Should | Library | `schemas/site.schema.json` (`derive`), `tools/check-content.mjs` | Build DP14 |
| DR24 | Media slots: ratio, focal point, treatment, decorative (CM5) | Must | Library | `schemas/assets.schema.json`, `render/blocks.tsx`, `Image` | Build DP3 (+IP12, +IP31) |
| DR25 | Strings ready for localisation (CM6) | Should | Library | `render/fill.ts`, `schemas/site.schema.json` | Later DP24 |
| DR26 | Named effects catalogue (BH1) | Should | Library | `motion/effects.json` *new*, `react/behaviour/` | Later DP23 (with IP44, IP41) |
| DR27 | Reduced motion built in (BH2) | Must | Library | `react/behaviour/motion.ts` (done for `viewTransition` in IP3), each effect | Build DP17; every later effect declares its calm form |
| DR28 | Page transitions as data (BH3) | Should | Library | `schemas/site.schema.json`, `layouts/SiteLayout.tsx` | Build DP17 (+IP30) |
| DR29 | Routes from page documents (RT1) | Must | Library | `site/router.ts` *new*, `render/SiteView.tsx` | Build DP16 on the IP27 router |
| DR30 | One route pattern per collection (RT2) | Must | Library | `site/router.ts`, `schemas/page.schema.json` | Build DP16 |
| DR31 | Aliases, redirects, 404 page (RT3) | Should | Library | `schemas/site.schema.json`, `site/router.ts` | Build DP16 |
| DR32 | Anchors, scroll, focus, announce (RT4) | Should | Library | `site/router.ts`, `Link` | Build in IP27 (+IP17, +IP28) |
| DR33 | One project check command (V1) | Must | Check | `tools/check-project.mjs`, `tools/check-content.mjs` | DP6 now; DP19 adds site, pages and collections |
| DR34 | No words in code (V2) | Must | Check | `tools/check-project.mjs` (`words-in-code`) | Done in DP6 (a warning in 0.3; exceptions list in DP19) |
| DR35 | No page-specific code (V3) | Should | Check | `tools/check-project.mjs` | Build DP19 (a warning) |
| DR36 | Token-only styling (V4) | Must | Check | `tools/check-project.mjs` (`raw-size`, `important`, `core-token`, `primitive`) | Done in DP6 |
| DR37 | Story for every part (V5) | Should | Check + Library | `tools/check-content.mjs`, scaffold | Build DP18 (stub stories from the schema example) |
| DR38 | Types from schemas (V6) | Should | Library | `tools/types.mjs` *new* (bin), library repository's record types | Build DP19 |
| DR39 | Live preview of JSON edits (AP1) | Should | Library | `render/SiteView.tsx` (keeps scroll on data change) | Build DP20 |
| DR40 | Errors at the JSON path in development (AP2) | Should | Library | `render/SiteView.tsx`, the check's error format | Build DP20 |
| DR41 | Schema addresses for editors (AP3) | Should | Docs + Library | `schemas/*.json` `$id`, hosted `/schemas/{name}/{version}.json` | Build DP5 |
| DR42 | Review view of unconfirmed content (AP4) | Could | Library | `render/SiteView.tsx` | Later, after DP4 |
| DR43 | Code split by block type (PF1) | Should | Library | `render/blocks.tsx`, `render/load.ts` | Later DP24 |
| DR44 | Image loading rules from data (PF2) | Should | Library | `render/SiteView.tsx`, `Image` | Build DP15 |
| DR45 | Data loads per route (PF3) | Could | Library | `render/load.ts` | Later DP24 |

### What stays out, checked

The requirement's own list holds and matches Part 2's out-of-scope list: site content and collections; brand faces (the library ships the way to register them, IP23); specific compositions (the library ships the registry, slots and effects; the template ships the part); brand effects (they register into the catalogue from the template); source-specific build steps such as an archive importer (the library ships the generated-collection hook and the check, DP14). We add one: **the site's own routes and URLs** are data the site owns; the library ships the router that reads them. Nothing in W14 names DesignUp: every schema, block and example uses generic names, and the reference data in the acceptance test is a shipped template's.

### W14 Data-driven sites

- **Goal (promise → user-can):** the library promises that a team builds its product from the library's parts without forking. For sites, that becomes: **an editor, designer, agent or CMS can add a page, reorder sections, change words or add a collection item by editing JSON alone, and one command proves the site has no words or page logic in code.**
- **Items:** DP1–DP24 below.
- **Done when (0.4.0-beta.1):** the acceptance test AT1–AT6 passes on a reference site made from a shipped template with no site code beyond start-up (the `main.tsx`, a `site.json`, page documents and collections); each step is a JSON edit, recorded with screenshots and the check's output; existing `TemplateView` sites and hand-written views still type-check, build and render unchanged (the Q105.5 upgrade proof on a copy of DesignUp).
- **Risks and assumptions:**
  - **IA13:** one page schema can serve both template layouts and site pages. Test: write two harbour screens and one generic blog screen as page documents before DP15.
  - **IA14:** a fixed operator set is enough for list bindings and conditions (filter, sort, limit; equals, in, has, before and after a date). Test: express DesignUp's six list uses in it on paper first (no DesignUp data in the library).
  - **IA15:** a router in core stays small (no data fetching, no nested layouts). Budget: under 4 KB minified, measured from the build output.
  - **IA16:** rich text as JSON stays writable by people. Test: an editor writes three headings with an accent mark from the guide alone.

### Packets

Each gives an openable result (a library page, a story, a schema with its check output, or a transcript). Strict design applies to every new visual; schemas and checks are shown through their output.

#### Into 0.3.0-beta.1 (foundations, non-breaking)

| Packet | What the owner opens | Findings | After | Overlap |
| --- | --- | --- | --- | --- |
| DP1 | Rich inline text: `richText` in `blocks.schema.json` (a string, or a list of strings and `{ text, mark }` with marks `emphasis`, `strong`, `accent`, `code`, `link` and `break`); each block field declares the marks it accepts; one `RichText` renderer; the accent mark reads `Text` tone `accent` | DR20 | IP22 | **IP22 gains** a `tone="accent"` on `Text` and `Heading` for inline spans |
| DP2 | Actions that navigate: `action` takes `href` (a route, anchor or address) instead of `says`; the renderer draws a `Button` with `href` | DR10 | IP8 | **IP8** is the component half |
| DP3 | Picture entries: `assets.schema.json` gains `ratio`, `focal` (`{ x, y }` from 0 to 1), `treatment` (`none`, `greyscale`, `duotone`; `rest` and `active`) and `decorative`; `alt` required unless decorative | DR24 | IP12, IP31 | **IP12 and IP31** name their props exactly as these fields |
| DP4 | Unconfirmed values: any text field may be `{ "unconfirmed": "speaker" }`, shown with the phrase from shared strings in one style; the check counts them by file, and `--release` fails on any | DR15 | DP1 | — |
| DP5 | Schema addresses: each schema served at a stable versioned address on the hosted site; the guide shows `$schema` for editors | DR41 | — | — |
| DP6 | One project command `npx design-library-check` (errors: the stated rules; warnings: everything new) | DR18, DR33 (part), DR34, DR36 | — | **Is IP37 + IP38** (built, being tuned) |
| DP7 | The content check takes any folder with `$schema` and checks manifest against shipped parts and rendered screens | DR17 | DP6 | **Is IP39** |

**IP27 changes shape:** instead of only a link adapter, it becomes the **core router** (`@design-library/core/site`): hash or history mode, `useRoute`, `navigate`, fragment links that scroll to a heading without replacing the route, focus moved to the new page's heading and an announcement (DR32). `Link` reads it when present and works as today without it. Built once here, it carries DP16's routes from data in 0.4. **IP28** reads anchors from the same router. **IP30** becomes the router's page swap with a transition chosen by name (`'fade'` today; data in DP17). **IP17**'s scroll helper is what the router uses for anchors. **IP19**'s `Hero` `media` prop stays a `ReactNode` and its block gets a `media` slot (DP11). **IP35**'s scaffold writes each part's block schema and example (DP18 needs them).

#### 0.4.0-beta.1: Data-driven sites

| Packet | What the owner opens | Findings | After |
| --- | --- | --- | --- |
| DP8 | `site.schema.json`: navigation, header and footer content, global strings (not found, back home, scheme labels), title pattern, default frame settings, page transition, aliases | DR3 | DP1 |
| DP9 | `page.schema.json` (ID12): id, route, metadata (title, description, social picture, canonical, hidden), layout, frame settings, ordered `sections` of blocks with optional `anchor` | DR1, DR2, DR4 | DP8 |
| DP10 | Block registry: every core block has a schema, a one-line purpose and an example; `npx design-library-blocks "a list of people with photos"` lists matches, core first; the finder page reads it | DR6, DR11 | DP9 (+IP16) |
| DP11 | Slots and nesting: named slots with accepted types (`hero.media`, `split.start` and `end`, `grid.items`) | DR7 | DP10, IP19, IP20 |
| DP12 | Collections and references: `collection.schema.json` (id field, item schema), `{ "ref": "talks/…" }` resolved by the check and the renderer | DR21, DR22 | DP9 |
| DP13 | List bindings: `{ "from": "talks", "where": …, "sort": …, "limit": 6 }` in list fields | DR8 | DP12 |
| DP14 | Derived values (`count`, `group`, `distinct`) declared in the site document, evaluated at load; a generated-collection hook with provenance, rebuilt and checked by one command | DR23 | DP12 |
| DP15 | `SiteView`: one entry renders site + page + collections with frame, header and footer; each section in its own error boundary (path-named in development, left out in production); skeleton and empty per section; the first picture eager and high priority | DR2, DR12, DR13, DR14, DR44 | DP9, DP12 |
| DP16 | Routes from data on the IP27 router: page routes, `/talks/{id}`-style patterns bound to a collection, aliases, redirects and the 404 page | DR29, DR30, DR31 | DP15, IP27 |
| DP17 | Page transitions as data on IP30, each with its reduced-motion form | DR27, DR28 | DP16, IP30 |
| DP18 | Template parts as blocks: each part's schema and example in the manifest, placed from page documents; stub stories from the example; the scaffold writes them | DR16, DR37 | DP10, IP35 |
| DP19 | The project check covers site, pages, collections, references and routes; no page-specific code (a warning); words-in-code exceptions list; `npx design-library-types` writes TypeScript types from the schemas | DR33, DR34, DR35, DR38 | DP15, DP16 |
| DP20 | Development: JSON edits update the page in place keeping scroll; a check error shows as one notice with file, path and fix | DR39, DR40 | DP15 |

**Breaking-change notes (0.4.0):** none planned. New entries (`@design-library/core/site`, `SiteView`, three schemas, two commands) are additions; `TemplateView`, `loadTemplate` and content files at `contentVersion` 1 keep working. The page schema starts at version 1 on its own `$id`.

#### Later (0.5 or after)

| Packet | Item | Findings |
| --- | --- | --- |
| DP21 | Conditional sections with a fixed operator set | DR9 |
| DP22 | Template variants of core blocks | DR19 |
| DP23 | Named effects catalogue (reveal on scroll, parallax, pointer response, stipple reveal), each with a reduced-motion form; templates register their own | DR26 (+IP41, +IP44) |
| DP24 | Locales and plural formats; code split by block type; data per route; the unconfirmed-content review view; content migrations command | DR5, DR25, DR42, DR43, DR45 |

### Acceptance test

On a reference site made from a shipped template (generic data, never DesignUp's), every step is a JSON edit only and `npx design-library-check` stays at zero errors after each:

| Step | Do | See |
| --- | --- | --- |
| AT1 | Add a page document with a route, a title and three sections | It opens at its address, with its title in the tab |
| AT2 | Move one of Home's sections up | Home shows the new order |
| AT3 | Change a headline, including an accent mark | The new words and accent show |
| AT4 | Add an item to a collection with a reference to another collection's item | It gets its own page, shows in its list and on the referred item's page, and a derived count on Home goes up by one |
| AT5 | Misspell a block type | The check fails with the file and JSON path; the page renders without that section |
| AT6 | Run the words-in-code and page-specific-code checks | Zero errors |

### Migration for a site like DesignUp (in each adoption brief)

The 0.3 brief lists what a site can do with no library change and with 0.3's foundations: move hard-coded words to content (the check now lists each), give content files a `$schema` (DP5), turn copies into ids, prune the manifest (DP7 reports it), add stories, move raw sizes into tokens (the check counts them), write accent phrases as rich text (DP1), and make hero buttons navigate by data (DP2). The 0.4 brief adds, in order: the site document and routes (replace the route matcher and title rules in the app shell), parts as blocks, then pages one shape at a time (simple repeated pages first, the home page last), then delete the hand-written views and make the check a gate. Each step is optional and the site keeps working between steps.

### Open owner decisions: data-driven sites

| ID | Decision | Recommended default |
| --- | --- | --- |
| ID12 | Page document: extend the content envelope, or a new schema? | **A new `page` schema (version 1)** whose `sections` are the same blocks; a template layout's content file stays valid, and `TemplateView` keeps working |
| ID13 | Router in core or a separate package? | **In core, as its own entry** (`@design-library/core/site`), optional: nothing imports it unless a site does |
| ID14 | Which inline marks? | **emphasis, strong, accent, code, link, break**; each field declares which it accepts; no nesting beyond a link around marked text |
| ID15 | Derived values at build time or run time? | **Declared derivations evaluate at load** (pure: count, group, distinct, no code); generated collections are **build time only** |
| ID16 | Project checks in core or a tooling package? | **In core's `tools/`** with `bin` entries, as `design-library-check-content` already is |
| ID17 | Content migrations | **Hand-written migration notes until 0.5**, then `npx design-library-migrate` (DP24) |
| ID18 | Release placement | **Foundations in 0.3.0-beta.1, the data-driven site in 0.4.0-beta.1** |
| ID19 | Reference site for the acceptance test | **A shipped template extended with one collection** (harbour's events), not a new template |
| ID20 | Words-in-code: warning or error? | **Warning in 0.3 and 0.4** (Q105.3); an error only when a site opts in with `--strict` |
