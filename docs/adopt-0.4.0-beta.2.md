# Adopt 0.4.0-beta.2

> **TL;DR:** 0.4.0-beta.2 is "Moving a site onto 0.4": small, additive pieces a site needs to move onto the library completely. The router keeps the place between sibling pages, from code or JSON. A template's parts can be used on their own. A theme can set the top type steps. A picture can have light, dark and more-contrast files. A brand can use its own icons. It's additive: a site on 0.2.0-beta.1 or later installs it and keeps working unchanged. Paste the block below into your agent to upgrade, then adopt each piece one at a time; the site works between steps.

**Status: draft** (worker 64, 2026-11-10). Sections marked *(pending)* are filled when their packet lands; the proof is filled at release.

**Owner, 2026-11-10 01:27 (verbatim, [DoD Q105](definition-of-done.md#owner-instructions)):** *"Improve Design library as per recommendation but want to do it in a way where the Design library stasy true to its goal of being a generic and versatile Design library and at the same time make it super easy for the Design up site to just use the updated version without much work. After the update, we should be just able to pass a detail of what has changed so that DesignUp site can adopt it wiothout breaking the site."* Planned in [Improvement plan, Part 4](improvement-plan.md#part-4-moving-a-site-completely-onto-the-library-q110) (Q110, Q111, Q112, Q113).

**Paste this into DesignUp's agent:** *"Upgrade the Design Library to 0.4.0-beta.2: follow node_modules/@design-library/core/UPGRADE.md, section → 0.4.0-beta.2, after running its install line; do steps 1–3 now and stop for review before step 4."*

**Release:** v0.4.0-beta.2 *(pending)*. **In the package:** `node_modules/@design-library/core/UPGRADE.md` (the same block). **Detail:** `CHANGELOG.md`. **Plan and Definition of Done:** [Improvement plan, Part 4](improvement-plan.md#part-4-moving-a-site-completely-onto-the-library-q110), [Migration readiness](definition-of-done.md#migration-readiness-q110) rows BM.1–BM.15.

## The brief for your agent

````markdown
# Upgrade the Design Library to 0.4.0-beta.2

## 1. Install (nothing else changes)

npm install https://github.com/prabinpebam/design-library/releases/download/v0.4.0-beta.2/design-library-core-0.4.0-beta.2.tgz https://github.com/prabinpebam/design-library/releases/download/v0.4.0-beta.2/design-library-templates-0.4.0-beta.2.tgz

Then run your type check and build. Install both together; templates needs the core of the same version. Coming
straight from 0.2.0-beta.1: this one install line is all you need (proved as one step, below). The older blocks'
adoption steps (0.2.0-beta.2, 0.3.0-beta.1, 0.4.0-beta.1) still apply, in any order with these.

## 2. Nothing breaks

Every change is an addition. With nothing set, `Router` lands every page at the top as before, `again` does nothing,
pictures fetch and draw what they did, every icon draws as before, and the type steps keep their sizes. The new checks
only warn unless you pass `--strict`.
Proof: a copy of a real site on 0.2.0-beta.1 installs this version with no edits; type check, build, every route's
render in light, dark and at 320 px, and console errors are compared (record on the hosted page).

## 3. What's new

Keeping the place (`@design-library/core/site`, `schemas/`)
- `Router` `scroll`: `'top'` (default), `'keep'`, or `(to, from) => 'top' | 'keep'`. Kept in place, the new page
  doesn't scroll and focus stays on the link used; its heading is still announced; an anchor always wins.
- `Router` `again`: `'none'` (default) or `'top'`: a link to the page already shown glides back to the top.
- `Router` `focus` also takes `(to, from) => selector | false`.
- From data: a collection page's `"between": "keep"` (moving between its items keeps the place) and `site.json`
  `"again": "top"`; `SiteView` passes both to its router.

Parts and type
- `@design-library/templates/{id}/registry`: a template's parts, registry and token CSS without its content or
  pictures (conference `Countdown`, `SponsorWall`, `SponsorsLayout`; the chat, design and projects apps).
- Theme settings for the top type steps: `--type-display-size`, `-weight`, `-leading`, `-tracking` and the same for
  `--type-jumbo-*`, through `applySettings` or `settingsCss` (a jumbo smaller than display is refused).

Pictures per scheme *(`assets.json` half pending MP18)*
- `Image`, `Hero` `picture` and `EmptyState` `illustration` take `dark` and `contrast: { light?, dark? }`, each a
  path or `{ src, srcSet? }`, raster or SVG; the file shown follows the scheme of the picture's own region (the page,
  the system, a `data-scheme` band, more contrast), with no flash or jump; one alt for all. More contrast falls back:
  in dark `contrast.dark` → `dark` → `src`; in light `contrast.light` → `src`. A layer is fetched only when it first
  shows. In `assets.json`, a picture entry's `dark` and `contrast` files.
- `useRegionScheme(ref)` tells any part which scheme (`light` or `dark`) and contrast its region is in.

Brand icons
- `registerIconSet` (a whole brand set, then `setIconSet(id)`), `setIconOverrides` (a few names, site-wide) and
  `<IconOverrides icons>` (a few names, for one part of the page); every other name falls back to the active set.
  `Rating`'s star is drawn by name (`star`), so a brand star reaches it; with nothing overridden it draws as before.
  In development, an unknown name or a glyph without a `viewBox` logs one warning.

Commands and checks
- `npx design-library-icons <folder> --out icons.json`: SVG icons named by the icon they replace → icon data
  (`--names` lists the names; `--check` for CI).
- `npx design-library-check-svg`: every SVG safe, with a `viewBox`, not animating itself; colour-role art without
  literal colours. The content check also checks a picture's `dark` and `contrast` files (they exist and share its shape).
- `npx design-library-check` warns on icon data under a name no component draws.
- Guide: the brand-led recipe's step 4 "Moving an existing site" (the order, and answers: titles from data, font
  roles, a face only parts use, root scaling's cost); step 6 "Use a part from another template".

## 4. Optional: move the rest of the site onto the library (in this order; the site works between steps)

Run `npx design-library-check --share` first and keep its output to compare after. Each step names the code it
replaces; stop after any of them.

1. Theme. In `look.ts`, map the faces by where the site uses them: `applyFonts({ roles: { display: 'bebas', text:
   'figtree', ui: 'figtree', label: 'archivo', numeral: 'archivo', code: 'plex-mono' }, faces: [...] })` (this
   corrects the 0.3.0-beta.1 block's mapping). Source Serif 4 stays a template token, loaded by the template's own
   `@font-face`. Then `applySettings({ '--type-display-size': '4.6rem', '--type-display-weight': '400',
   '--type-jumbo-size': '6.14rem', '--type-jumbo-weight': '400' })` (or the sizes the design asks for) and delete the
   `--t-designup-display-*` sizes that only existed to reach them. Root scaling (`tokens.css`, the rule that scales
   the root font size with the window): remove it; big screens get type about 20–40% smaller than the scaled design
   and a small laptop no longer fits the whole opening, so check `Hero fit="screen"` on the year pages.
2. Content: nothing new; the content check lists the copied template screens nothing shows, so each becomes a page or
   is removed.
3. Components: the number strip is `Statistic` in a `Grid`; names by tier a `List` per tier under a `Heading`, or the
   conference `SponsorWall` from `@design-library/templates/conference/registry`; breadcrumbs a section before the
   `Hero`. See the recipe's step 1 table.
4. Router. In `App.tsx`, replace the hand router's year logic with core `Router`:
   `scroll={(to, from) => isYear(to) && isYear(from) ? 'keep' : 'top'}`, `again="top"` (replaces the glide for a
   header link to the shown page), and `prepare` to load the year's photo first. Delete `lib/scroll.ts` (core `glide`
   does it). If you used a year in the query as a stopgap, drop it.
5. Site from data: on the year page document, `"between": "keep"`; in `site.json`, `"again": "top"`.
6. Pictures per scheme: a picture drawn for light that looks wrong in dark gets a `dark` file (same shape, same
   alt; never the light file inverted), replacing any code that swaps pictures on the scheme (a `useScheme` check
   around two `<img>`, a `prefers-color-scheme` `<picture>`, or CSS that hides one of two pictures). In code:
   `<Image src="/a/hero.webp" dark="/a/hero-dark.webp" alt="…" />`; from data, the picture entry's `"dark"` file.
   Run `npx design-library-check-content` (the pair must share a shape within 1%).
7. Icons: if the brand draws its own icons, name each SVG by the icon it replaces, convert the folder with
   `npx design-library-icons src/brand/icons --out src/brand/icons.json --licence "Own work"` and pass the glyphs to
   `setIconOverrides` (or `registerIconSet` for a whole set), replacing any custom icon component or hand-drawn `<svg>`.
   Guide: `node_modules/@design-library/core/guide/3-tokens.md`, "Your own icons".

## 5. What to watch

- Keep the place only between true siblings (one year to the next); every other link should still land at the top.
- `between` is for a page with `collection`; the content check fails it anywhere else.
- A `dark` file must have the same shape as the light one; the content check fails it otherwise.
- Icon files are named by the icon they replace; `design-library-icons` names the nearest names for a misnamed file.

## 6. Verify

1. `npx tsc --noEmit` and `npx vite build` pass.
2. Open every route in light and dark: nothing moved (compare with screenshots taken before the upgrade).
3. After step 4: scroll down a year page, follow the next year's link: the page stays where it was; follow a header
   link to the shown page: it glides to the top.
````

## The proof *(pending, filled at release)*

A copy of DesignUp's `web/` on 0.2.0-beta.1 against a copy on the 0.4.0-beta.2 files, outside both repositories, every route in light, dark and at 320 px, type check, build and console errors (MP5, BM.5); the install matrix on npm 10 and 11; the probe sweep on the release build.

## What's in it, by plan packet

| Packet | Change | DoD row |
| --- | --- | --- |
| MP1 | `Router` `scroll`, `again`, `focus` as a function | BM.1 |
| MP2 | `between` and `again` from data | BM.2 |
| MP3 | Guide: moving an existing site, Core first rows | BM.3, BM.8 |
| MP4 | Template registries on their own | BM.4 |
| MP5 | Direct-jump proof from 0.2.0-beta.1 | BM.5 |
| MP15 | Top type steps as theme settings | BM.7 |
| MP17–MP19 | Pictures per scheme (MP17 code and MP19 docs built; MP18 from data pending) | BM.9–BM.11 |
| MP24–MP26 | Brand icons: the seam, the library page "Brand icons", the command and its guide | BM.12–BM.14 |
| MP27 | Lean builds *(pending; stays in this release: the check found only the story re-exports and the fonts' lazy entry)* | BM.15 |
| MP6 | This release and brief | BM.6 |
