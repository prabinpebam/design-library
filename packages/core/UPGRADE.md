# Upgrading

How to move a project to a newer version of `@design-library/core` and `@design-library/templates`, newest first. Each version has one block you can paste into your agent as it is. What changed in detail is in `CHANGELOG.md`; the proof that nothing breaks is on the hosted page each block links.

## 0.2.0-beta.1 → 0.2.0-beta.2

Proof and the same brief for people: [Adopt 0.2.0-beta.2](https://prabinpebam.github.io/design-library/docs/#adopt-0.2.0-beta.2.md).

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
