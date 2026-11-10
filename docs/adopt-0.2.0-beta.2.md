# Adopt 0.2.0-beta.2

> **TL;DR:** 0.2.0-beta.2 is the first round of improvements from the DesignUp beta. It's additive: a site on 0.2.0-beta.1 installs it and keeps working unchanged (proof below). The one default change is under reduced motion only. Paste the block below into your agent to upgrade, then adopt each improvement when you want, one step at a time.

**Owner, 2026-11-10 01:27 (verbatim, [DoD Q105](definition-of-done.md#owner-instructions)):** *"Improve Design library as per recommendation but want to do it in a way where the Design library stasy true to its goal of being a generic and versatile Design library and at the same time make it super easy for the Design up site to just use the updated version without much work. After the update, we should be just able to pass a detail of what has changed so that DesignUp site can adopt it wiothout breaking the site."*

**Release:** [v0.2.0-beta.2](https://github.com/prabinpebam/design-library/releases/tag/v0.2.0-beta.2). **In the package:** `node_modules/@design-library/core/UPGRADE.md` (the same block). **Detail:** `CHANGELOG.md`. **Plan and Definition of Done:** [Improvement plan](improvement-plan.md), [Stage: DesignUp improvements](definition-of-done.md#stage-designup-improvements) rows B2.1–B2.15.

## The brief for your agent

````markdown
# Upgrade the Design Library to 0.2.0-beta.2

## 1. Install (nothing else changes)

npm install https://github.com/prabinpebam/design-library/releases/download/v0.2.0-beta.2/design-library-core-0.2.0-beta.2.tgz https://github.com/prabinpebam/design-library/releases/download/v0.2.0-beta.2/design-library-templates-0.2.0-beta.2.tgz

Then run your type check and build. Install both together; templates needs the core of the same version.

## 2. Nothing breaks

Every change is an addition, an opt-in, or keeps today's default. The one default change: under reduced motion only,
`viewTransition()` now swaps the view at once instead of fading (pass `{ reducedMotion: 'fade' }` to keep the fade).
Proof: a copy of a real site (about 55 routes) installed this version unchanged; it type-checked, built and rendered
every route with no new console errors and no visual change (record on the page linked above).

## 3. What's new

- Theme settings: `applySettings({...})` / `settingsCss(...)` from `@design-library/core/theme` set the published
  component tokens (`tokens/settings.json`): SiteLayout's frame (width, reading, margin, gap, padding-block,
  padding-start) and link decoration (`--link-decoration`, `--link-decoration-hover`). Other names are refused.
- `SiteLayout` `opening="flush"`: the first band meets the header.
- `applyBrand({ ..., base: { temperature, tint, pins } })`: a warm, cool or tinted neutral canvas.
- Tracking roles `--tracking-wide` and `--tracking-wider`.
- `Button` `href` (a link with the button's look); `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur` on `Link` and `Button`.
- `Section` `tone` (`sunken`, `raised`, `tint`) and `bleed`.
- `Text` `variant="lead"` and `variant="statement"`.
- `Image` ratios `ultrawide` (21:9) and `classic` (4:3), and `focal={{ x, y }}` (0 to 1); also on `Card` and `Hero`'s picture.
- `TextField` `onChange`, `name`, `mode="form"` and `words`; `Select` and `NumberField` `mode="form"`.
- `Hero` `media` (any media), `trail` and `fit="screen"`.
- `npx design-library-check`: the Never rules checked in your project, with file, line and fix. Nothing fails unless
  you pass `--strict`; `--share` shows library vs custom elements per view.
- Guide: install troubleshooting for `edgesOut`; the seam ladder's step 4 now includes theme settings.

## 4. Optional: adopt each improvement (one at a time; the site works between steps)

Run `npx design-library-check --share` first and keep its output to compare after.

1. Page frame: move the `--c-site-layout-*` overrides from your template's `tokens/tokens.css` into one
   `applySettings({ '--c-site-layout-width': …, '--c-site-layout-margin': …, '--c-site-layout-gap': …,
   '--c-site-layout-padding-block': … })` call in your theme file (DesignUp: `web/src/templates/designup/tokens/tokens.css`
   lines 256–272 → `web/src/look.ts`). Where an opening is pulled up under the header, use `opening="flush"` on
   `SiteLayout` or `'--c-site-layout-padding-start': '0px'`.
2. Underlines: replace any global rule that removes link underlines (DesignUp: `:any-link * { text-decoration: none }`
   in `web/src/templates/designup/parts/designup.css:13`) with `applySettings({ '--link-decoration': 'none' })`.
   Keep the hover line; check your link colour stands 3:1 against the text around it.
3. Canvas colour: replace a hand call to `generate()` that writes `--p-base-*` (DesignUp: `web/src/look.ts`, the
   `paper` block) with `applyBrand({ ...brand, base: { temperature: 'warm', pins: { … } } })`.
4. Reduced motion: remove your own reduced-motion test around `viewTransition` (DesignUp: `web/src/App.tsx`,
   `reducedMotion()` before `viewTransition(apply)`) and call `viewTransition(apply)` directly.
5. Tracking: point template tokens that hold raw `em` letter-spacing at `var(--tracking-wide)` or
   `var(--tracking-wider)` (DesignUp: `--t-designup-label-tracking`, `--t-designup-list-tracking` in `tokens/tokens.css`).
6. Link buttons: a `Button` whose `onClick` navigates (sets `location.hash`), or a raw `<a>` styled to look like a
   button, becomes `<Button href="#/…" … />` (DesignUp: the status link in
   `web/src/templates/designup/parts/fundamentals/HeaderEnd.tsx`, and the `Call` part where it draws a button-looking link).
7. Hover previews: a raw `<a onMouseEnter onFocus>` in a part becomes core `<Link onPointerEnter onFocus>`, keeping
   core's focus ring and link rules (DesignUp: the rows in `parts/compounds/YearList.tsx`).
8. Tinted band: a custom band part with a tint becomes `<Section tone="tint" bleed>` (DesignUp: `Band.tsx` with
   `tone="tint"` on Home's sponsors band).
9. Statement and lead text: facts set as a heading or a display part become `<Text variant="statement">`; lead
   paragraphs in parts become `<Text variant="lead">` (DesignUp: `Display.tsx` uses, `NumberStrip.tsx`).
10. Crops: native `img` with `object-position` in frames becomes core `Image` with `ratio` and `focal`
    (DesignUp: `PhotoFrame.tsx`, `Collage.tsx`).
11. Card status: eyebrow text such as "Ended" becomes a `Badge` in `Card`'s `meta`.
12. Live search and forms: a search `TextField` takes `onChange` so the list narrows as people type
    (DesignUp: `web/src/views/talks/TalksIndex.tsx`); form fields take `mode="form"` with `onChange` so none says
    "Saved" on its own (DesignUp: `web/src/views/more/parts/Enquiry.tsx`).
13. Opening: a custom opening that redraws `Hero` can become core `Hero` with `media`, `trail` and `fit="screen"`
    (DesignUp: `web/src/templates/designup/parts/layouts/Hero.tsx`); `fit="screen"` replaces scaling the root font
    size to fit the first screen (`tokens.css` `html { font-size: min(…) }`), which also brings back browser zoom.
14. Data-driven, no library change needed yet: move words written in views into content JSON (the check lists them as
    `words-in-code`), replace copied titles with ids looked up in your data code, prune template manifest screens you
    don't render, and run `npx design-library-check-content --templates src/templates`.

## 5. What to watch

- Under reduced motion, page changes no longer fade. If you relied on the fade, pass `{ reducedMotion: 'fade' }`.
- `applySettings` refuses names off the list and returns errors; read them.
- With underlines off, the hover and focus line is the cue that isn't colour: don't remove it too.
- `fit="screen"` sizes the opening to the window less the sticky header; remove any root font-size scaling at the
  same time, or the two fight.
- `npx design-library-check` may list many findings on a site built before it existed. They're advice until you add
  `--strict`.

## 6. Verify

1. `npx tsc --noEmit` and `npx vite build` pass.
2. Open every route in light and dark: nothing moved (compare with screenshots taken before the upgrade).
3. After each adoption step, the same routes look the same (or as intended), and
   `npx design-library-check --share` shows fewer findings and a higher library share.
````

## Proof: nothing breaks

Run 2026-11-10 about 02:35–03:00 +05:30 by worker 50 (Q105.5). Two copies of the DesignUp site's `web/` folder were made in the system temp folder, outside both repositories (no `node_modules`, `dist` or review files); nothing was written in the DesignUp project. One kept its 0.2.0-beta.1 install from the release URLs; the other had only its two library dependencies swapped for the 0.2.0-beta.2 tarballs. Both were deleted afterwards.

| Step | 0.2.0-beta.1 copy | 0.2.0-beta.2 copy |
| --- | --- | --- |
| `npm install` (npm 11, through the proxy) | Pass | Pass; `@design-library/core` and `templates` at 0.2.0-beta.2 |
| `npx tsc --noEmit` | Pass | Pass, no edits to the site |
| `npx vite build` | Pass | Pass |
| Routes found by following every `#/` link from Home | 213 | 213 |
| DOM compared per route (position and size of every element, colour, background, font size and family, underline, opacity), 1280 × 800 | 213 light + 53 dark (all but the per-talk and per-speaker pages) | 263 of 266 identical on the first pass. The other 3 matched when re-measured after the page settled (Home; Editions in dark: 0 differences of 721 and 335 elements), except one element on one speaker page that varies with when a remote video thumbnail loads |
| Console errors | 0 | 0 |
| Full-page screenshots (Home, Editions, Talks, 2016, a talk, Sponsor; light and dark) | — | Identical to 0.2.0-beta.1, except where the 0.2.0-beta.1 copy differs from itself between runs: Sponsor shows a live countdown; dark Home matched on 2 of 3 runs (raster noise) |

**Result:** the site installs 0.2.0-beta.2, type-checks, builds and renders every route unchanged, with no new console errors and no edits. Install matrix on the 0.2.0-beta.2 tarballs: npm 10.8.2 and 11.21.1 pass (libraries, dev tools, from the lockfile).

## What's in it, by plan packet

| Packet | Change | DoD row |
| --- | --- | --- |
| IP1, IP2 | Install troubleshooting, guide fixes | B2.1, B2.2 |
| IP3 | `viewTransition` swaps at once under reduced motion | B2.3 |
| IP4 | Theme settings, `SiteLayout` `opening="flush"` | B2.4 |
| IP5 | Link decoration settings | B2.5 |
| IP6 | `applyBrand` `base` | B2.6 |
| IP7 | Tracking wide and wider | B2.7 |
| IP8, IP9 | `Button` `href`; pointer and focus handlers | B2.8, B2.9 |
| IP10 | `Section` `tone` and `bleed` | B2.10 |
| IP11 | `Text` lead and statement | B2.11 |
| IP12 | `Image` ultrawide, classic, `focal` | B2.12 |
| IP13 | Card status as a Badge in `meta` | B2.13 |
| IP14 | `TextField` `onChange`, `mode="form"`, `words` | B2.14 |
| Rides along (0.3 work, additive) | `npx design-library-check` (IP37, IP38); `Hero` `media`, `trail`, `fit` (IP19) | B3.20, B3.5 |