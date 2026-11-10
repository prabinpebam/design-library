# Adopt 0.3.0-beta.1

> **TL;DR:** 0.3.0-beta.1 is the second round of improvements from the DesignUp beta and the foundations for data-driven sites. It's additive: a site on 0.2.0-beta.2 installs it and keeps working unchanged (proof below). Paste the block below into your agent to upgrade, then adopt each improvement when you want, one step at a time; the site works between steps.

**Owner, 2026-11-10 01:27 (verbatim, [DoD Q105](definition-of-done.md#owner-instructions)):** *"Improve Design library as per recommendation but want to do it in a way where the Design library stasy true to its goal of being a generic and versatile Design library and at the same time make it super easy for the Design up site to just use the updated version without much work. After the update, we should be just able to pass a detail of what has changed so that DesignUp site can adopt it wiothout breaking the site."*

**Release:** [v0.3.0-beta.1](https://github.com/prabinpebam/design-library/releases/tag/v0.3.0-beta.1). **In the package:** `node_modules/@design-library/core/UPGRADE.md` (the same block). **Detail:** `CHANGELOG.md`. **Plan and Definition of Done:** [Improvement plan](improvement-plan.md), [Stage: DesignUp improvements](definition-of-done.md#stage-designup-improvements) rows B3.1–B3.28.

## The brief for your agent

````markdown
# Upgrade the Design Library to 0.3.0-beta.1

## 1. Install (nothing else changes)

npm install https://github.com/prabinpebam/design-library/releases/download/v0.3.0-beta.1/design-library-core-0.3.0-beta.1.tgz https://github.com/prabinpebam/design-library/releases/download/v0.3.0-beta.1/design-library-templates-0.3.0-beta.1.tgz

Then run your type check and build. Install both together; templates needs the core of the same version.

## 2. Nothing breaks

Every change is an addition, an opt-in, or keeps today's default. Without the new props, `Router`, theme options and
content fields, every page draws as it did. Three small fixes change what you may see: on a phone, a tall feature in a peek `Frame` has less space under
it, so the next band shows (wide windows unchanged); a `TextField` with
`mode="form"` now follows its `value` while focused (so a Clear button empties it), and a `clearable` search field no
longer shows the browser's own cancel mark beside the library's Clear. New checks only warn unless you pass `--strict`.
Proof: a copy of a real site (226 routes) installed this version unchanged; it type-checked, built and rendered every
route with no new console errors and no visual change, in light, dark and at 320 px (record on the page linked above).

## 3. What's new

Components and props
- `Grid` `ratio`: `'2:1'`, `'3:2'`, `'1:2'`, `'2:3'` and `'aside'` (a heading beside its content; width from
  `applySettings({ '--c-grid-aside': … })`); stacks in a narrow container.
- `Hero` `media` (any media), `trail` and `fit="screen"`.
- `SchemeControl` (light, dark or system; `form` `choice`, `switch` or `button`) over `useScheme`, `readScheme`,
  `applyScheme`.
- `TableOfContents` (`layout` `list` or `row`, router-aware) and `letterItems(letters)`; `Section` `anchor`.
- `Image` `treatment` (`'none'`, `'greyscale'`, `'duotone'`, or `{ rest, active }` for colour on hover or focus);
  `MediaPlayer` `posterTreatment`.
- `SiteHeader` `nav`, `wordmark`, `current`, `tools` and `narrow="row"` (one 64 px row at 320 px); `Footer`
  `arrangement` (`'columns'`, `'line'`, `'identity'`).
- Fixed: a tall peek `Frame` feature on a phone leaves the next band in view (only there; wide windows unchanged).
- `Text` and `Heading` `tone="accent"`; `Text` `variant="inherit"` for an accent span inside other text.

Theme and tokens
- `applyBrand({ ..., contrast: 'guard' })`: links, the label on the accent fill and the focus ring move to the nearest
  step that passes; returns warnings naming each failing pair. Off by default.
- Accent word roles `color.text-accent` (4.5:1) and `color.text-accent-display` (3:1).
- `applyFonts({ faces: [...] })` for your own typefaces, and the optional `label` and `numeral` roles.
- One breakpoint set (`breakpoint.xs` 30 rem, `sm` 40, `md` 64, `lg` 80); `breakpointQuery()`, `useBreakpoint()`.

Routing, motion and search (`@design-library/core/site`, `@design-library/core/react`)
- `<Router>` (hash or history), `useRoute()`, `useNavigate()`, `matchPath()`: focus and announcement on a page change,
  in-page links that keep the route, Back returns to where you were. `transition="fade"`, `prepare`, `warm` and
  `loadPicture` for a page swap that waits for its picture. Inside a `Router`, `Link`, `Button href` and `SiteHeader`
  write route addresses; without one they work as before.
- `glide(target)`: scrolls the site makes itself, on the motion tokens, stopping on the person's own scroll.
- `useFilter(items, query, …)`: a list narrows as people type and says the count once.

Content (`@design-library/core/render`, schemas)
- Rich text in content: `["Design ", { "text": "up", "mark": "accent" }]`, drawn with `richText(...)`.
- `action.href` in content: hero and call-to-action buttons go to a page, an anchor or an address.
- Picture entries: `ratio`, `focal`, `treatment` and `decorative` (alt required unless decorative).
- `{ "unconfirmed": "speaker" }` in any text field, shown as the phrase in the shared file's `strings.unconfirmed`.
- Each core schema at a stable address for `$schema`:
  `https://prabinpebam.github.io/design-library/schemas/blocks/1.json#/$defs/hero` (also `content`, `template`, `assets`).

Commands
- `npx design-library-check-content --content <folder>`: checks any JSON with a `$schema`; warns about parts missing
  from the manifest and, with `--src`, screens nothing renders; `--release` fails on unconfirmed values.
- `npx design-library-new-template <id>` and `npx design-library-template-tokens`.
- `npx design-library-review <url>…`: the light review (needs `npm i -D playwright-core`).
- Guide: `guide/recipe-brand-led-site.md` and the "Core first" finder: the core part for each need, before a custom one.

## 4. Optional: adopt each improvement (one at a time; the site works between steps)

Run `npx design-library-check --share` first and keep its output to compare after.

1. Uneven columns: hand `grid-template-columns` splits (DesignUp: `parts/designup.css` `526fr 565fr`, `553fr 530fr`,
   `665fr 520fr`) become `<Grid ratio="…">`; the sponsors intro beside the wall (`sponsors-layout.css`,
   `--t-designup-sponsors-layout-intro-width`) becomes `<Grid ratio="aside">` with `--c-grid-aside` in `applySettings`.
2. Contrast: add `contrast: 'guard'` to the brand in `web/src/look.ts`; then remove any hand-darkened link colour or
   label override.
3. Accent words: `accentPhrase`/`accentTail` in views become content rich text (`{ "text": …, "mark": "accent" }`)
   drawn with `richText(...)`, or `<Text as="span" variant="inherit" tone="accent">` in code.
4. Typefaces: the `@font-face` rules and the custom parts that set Bebas Neue, IBM Plex Mono, Archivo and Figtree
   become one `applyFonts({ roles: { display: 'bebas', label: 'plex-mono', numeral: 'archivo', … }, faces: [...] })`
   in `look.ts`; core `Heading`, `Text`, `Hero`, `Card` and `Statistic` then carry them.
   **Correction (0.4.0-beta.2):** map faces by where the site uses them: `label` and `numeral` both Archivo, `code`
   IBM Plex Mono (`display` Bebas Neue, `text` and `ui` Figtree); see the 0.4.0-beta.2 block's step 4.
5. Scheme: the `HeaderEnd` scheme button (`useState`, `dataset.scheme`, `localStorage`) becomes
   `<SchemeControl form="button" storageKey={…} words={{ toDark, toLight }} />`; the boot lines in `look.ts` become
   `applyScheme(readScheme(SCHEME_KEY) ?? 'system')`.
6. Routing: `readRoute`/`useRoute` in `App.tsx` (the `hashchange` listener, `lastRoute`, the skip-link case, the
   `preload` race, the `viewTransition`/`flushSync` swap and the `pointerover` warm-up) become
   `<Router transition="fade" prepare={…loadPicture(…)} warm={…}>` with views reading `useRoute()`.
7. Scrolling: `smoothInPageLinks` and the easing loop in `web/src/lib/scroll.ts` go; the router glides to anchors,
   and any other scroll the site makes calls `glide(target)`.
8. Letter jumps: the speakers index (`views/talks/Speakers.tsx`) adds
   `<TableOfContents label="Jump to a letter" layout="row" items={letterItems(letters)} />` and `anchor` on each Section.
9. Search: the talk finder (`views/talks/TalksIndex.tsx`, narrowing only on Enter) becomes
   `<TextField mode="form" onChange={setQ}>` with `useFilter(...)`; its status line reads `status`.
10. Colour on hover: `ColorReveal` and the `colorSrc`/`colorReveal` props on `PhotoFrame`, `TalkGrid`, `PhotoTiles`
    and `Speakers` become `<Image treatment={{ rest: 'greyscale', active: 'none' }}>` or the picture entry's
    `"treatment"`; the video poster takes `posterTreatment`.
11. Header and footer: in `App.tsx`, pass the scheme button to `SiteHeader` as `tools` (or `<SchemeControl form="button">`), the status link as `actions`, and `narrow="row"`, so the 320 px header is one 64 px row; `wordmark`, `nav` and `current="colour"` or `"rule"` replace hand CSS for the nav place, wordmark size and current style (an orange one-sided tab stays out). The footer that passes the logo through `identity` can take `arrangement="identity"` to put the logo and its line beside the sections. A tall feature in a peek `Frame` on a phone now leaves the next band in view by itself (IP36): nothing to do.
12. Data-driven steps, in this order (each one alone is fine):
    1. Give each JSON file in `web/src/content` a `$schema` (a hosted address above, or the package path under
       `node_modules`), and run `npx design-library-check-content --templates web/src/templates --content web/src/content --src web/src`.
    2. List the five parts the manifest misses (`ColorReveal`, `LogoShape`, `NameWall`, `PhotoTiles`, `TalkGrid`) and
       remove the 31 copied conference screens nothing renders (guide step 6, prune).
    3. Move words written in views into content: accent phrases as rich text, the three "to confirm" fallbacks as
       `{ "unconfirmed": … }` with the phrases in `strings.unconfirmed`, hero button handlers as `"href"`.
    4. Move focal points and greyscale rules kept in CSS or code into the picture entries in `assets.json`.
    5. Generate `tokens/tokens.json` for `web/src/templates/designup` from the hand-kept `--t-designup-*` CSS and run
       `npx design-library-template-tokens` instead of editing CSS.
    6. Run the check with `--release` for the production build. Routes from data, pages as documents and collections
       come in 0.4.0-beta.1.

## 5. What to watch

- `contrast: 'guard'` changes colours only where they fail; read the warnings it returns before and after.
- Inside a `Router`, links you write as `#/talks` keep working; `/talks` is the new form. Don't wrap the site in two routers.
- `transition="fade"` waits at most 300 ms for `prepare`; a slow picture shows when it arrives.
- `useFilter` waits 250 ms after typing stops; a test that types and reads at once must wait for it.
- `--strict` turns the check's warnings into failures: add it once the findings you keep are resolved.

## 6. Verify

1. `npx tsc --noEmit` and `npx vite build` pass.
2. Open every route in light and dark: nothing moved (compare with screenshots taken before the upgrade).
3. After each adoption step, the same routes look the same (or as intended), `npx design-library-check --share`
   shows fewer findings and a higher library share, and `npx design-library-check-content … --content …` passes.
````

## Proof: nothing breaks

Run 2026-11-10 about 04:15–04:45 +05:30 by worker 56 (Q105.5). Two copies of the DesignUp site's `web/` folder were made in the system temp folder, outside both repositories (no `node_modules`, `dist` or review files); nothing was written in the DesignUp project. Both had only their two library dependencies changed: one to the 0.2.0-beta.2 release files, the other to the 0.3.0-beta.1 tarballs uploaded to the release (packed from a clean worktree at the release commit). Both were deleted afterwards.

| Step | 0.2.0-beta.2 copy | 0.3.0-beta.1 copy |
| --- | --- | --- |
| `npm install` (npm 11, through the proxy) | Pass | Pass; `@design-library/core` and `templates` at 0.3.0-beta.1 |
| `npx tsc --noEmit` | Pass | Pass, no edits to the site |
| `npx vite build` | Pass | Pass |
| Routes found by following every `#/` link from Home | 226 | 226 |
| DOM compared per route (position and size of every element, colour, background, font size and family, underline, opacity), production builds, reduced motion | — | **226 of 226 identical** at 1280 × 800 light, 1280 × 800 dark and 320 × 667 light |
| Console errors | 0 | 0 |

A dry run of the same comparison, the 0.2.0-beta.2 copy against itself, also gave 226 of 226, so the comparison is stable.

**Result:** the site installs 0.3.0-beta.1, type-checks, builds and renders every route unchanged in light, dark and on a phone, with no new console errors and no edits. **Install matrix** on the 0.3.0-beta.1 tarballs: npm 10.9.9 and 11.21.1 pass (libraries, dev tools, from the lockfile).

## What's in it, by plan packet

| Packet | Change | DoD row |
| --- | --- | --- |
| IP15, IP34 | Brand-led site recipe; compose-core rule for custom parts | B3.1, B3.2 |
| IP16 | "Core first" finder | B3.1 |
| IP17 | `glide` | B3.3 |
| IP18 | `npx design-library-review` | B3.4 |
| IP19 | `Hero` `media`, `trail`, `fit` | B3.5 |
| IP20 | `Grid` `ratio` | B3.6 |
| IP21, IP22 | Contrast guard; accent word roles | B3.7, B3.8 |
| IP23, IP24 | Site typefaces; label and numeral roles | B3.9 |
| IP25 | `SchemeControl` | B3.10 |
| IP26 | One breakpoint set | B3.11 |
| IP27, IP28 | Core router; `TableOfContents` | B3.12 |
| IP29 | `useFilter` | B3.13 |
| IP30 | Router page swap | B3.14 |
| IP31 | Picture treatments | B3.15 |
| IP32, IP33 | `SiteHeader` options; `Footer` arrangements | B3.16, B3.17 |
| IP35 | Template scaffold and token command | B3.18 |
| IP36 | K1, K2 | B3.19 |
| IP37–IP39, DP6, DP7 | Project and content checks | B3.20, B3.21 |
| DP1–DP5 | Rich text, actions, picture fields, unconfirmed values, schema addresses | B3.22–B3.26 |
| IV6 | Names check (repository) | B3.27 |
