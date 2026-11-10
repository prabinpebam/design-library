# Adopt 0.5.0-beta.1

> **TL;DR:** 0.5.0-beta.1 is "Brand pictures and openings": the pieces a brand-led site draws by hand around its pictures and openings, now in the library. An opening can keep one height across a series. A picture can carry brand shapes over and under it, show a second picture on hover or focus, and run the site's own reveal, with the library keeping the triggers, the timing and reduced motion. The stipple drawing the library uses is public. It's additive: a site on 0.2.0-beta.1 or later installs it and keeps working unchanged. Paste the block below into your agent to upgrade, then adopt each piece one at a time; the site works between steps.

**Status: draft** (worker 68, 2026-11-10; filled in as each packet lands, released with MP14). Landed: MP7–MP12. Still to land: MP13 (glide pace), MP16 (display-size section titles), MP20–MP23 (`Illustration`).

**Owner, 2026-11-10 01:27 (verbatim, [DoD Q105](definition-of-done.md#owner-instructions)):** *"Improve Design library as per recommendation but want to do it in a way where the Design library stasy true to its goal of being a generic and versatile Design library and at the same time make it super easy for the Design up site to just use the updated version without much work. After the update, we should be just able to pass a detail of what has changed so that DesignUp site can adopt it wiothout breaking the site."* Planned in [Improvement plan, Part 4](improvement-plan.md#part-4-moving-a-site-completely-onto-the-library-q110) (Q110, Q111, Q112).

**Paste this into DesignUp's agent:** *"Upgrade the Design Library to 0.5.0-beta.1: follow node_modules/@design-library/core/UPGRADE.md, section → 0.5.0-beta.1, after running its install line; do steps 1–3 now and stop for review before step 4."*

**Release:** v0.5.0-beta.1 (not cut yet). **In the package:** `node_modules/@design-library/core/UPGRADE.md` (the same block). **Detail:** `CHANGELOG.md`. **Plan and Definition of Done:** [Improvement plan, Part 4](improvement-plan.md#part-4-moving-a-site-completely-onto-the-library-q110), [Definition of Done](definition-of-done.md) rows B5.1–B5.14.

## The brief for your agent

````markdown
# Upgrade the Design Library to 0.5.0-beta.1

## 1. Install (nothing else changes)

npm install https://github.com/prabinpebam/design-library/releases/download/v0.5.0-beta.1/design-library-core-0.5.0-beta.1.tgz https://github.com/prabinpebam/design-library/releases/download/v0.5.0-beta.1/design-library-templates-0.5.0-beta.1.tgz

Then run your type check and build. Install both together; templates needs the core of the same version. Coming
from 0.4.0-beta.2 or earlier: this one install line is all you need. The older blocks' adoption steps still apply, in
any order with these.

## 2. Nothing breaks

Every change is an addition. With nothing set, `Hero` grows with its words as before, `Image` draws only its picture,
nothing fetches a second file, and glides keep their time.
Proof: a copy of a real site on 0.4.0-beta.2 installs this version with no edits; type check, build, every route's
render in light, dark and at 320 px, and console errors are compared (record on the hosted page).

## 3. What's new

Openings
- `Hero` `reserve={{ title, lead }}`: room for that many lines of the title and the lead, so a series of pages keeps
  one opening height and the links under it stay in one place; longer words still grow it. From data, the `hero`
  block's `"reserve": { "title": 3, "lead": 3 }`.

Pictures
- `Image` `decoration` (over the picture) and `under` (behind it): picture-sized layers for brand shapes, an SVG that
  fills the box and may spill past its edge; hidden from screen readers, never take the pointer, never move the
  layout. Colour `--c-image-decoration` (the accent; `applySettings`). `Hero` `picture.decoration` and `picture.under`.
  From data: the `hero` block's `decoration` slot and a prose picture's `decoration` slot hold the template's own
  blocks (core blocks are refused).
- `Image` `alternate` (an address or `{ src, srcSet }`): a second picture that fades in while the picture, or the
  link, button or card around it, is hovered or focused; fetched only on the first hover or focus. In `assets.json`, a
  picture entry's `alternate` file (card and prose pictures pass it).
- `Image` `reveal(frame)`: your own drawing of the change to `alternate` on a canvas over the picture. Each frame gets
  `context`, `width`, `height`, the eased `progress`, `active`, `time` and `paint('picture' | 'alternate')`. The library
  keeps the triggers, the timing (`--c-image-reveal-duration`, the standard easing) and reduced motion (your drawing
  isn't called; the fade shows). Types `PictureReveal`, `PictureRevealFrame`.
- `@design-library/core/effects` (no React): `perlin2`, `poissonPoints`, `layoutStipple`, `stippleTime`,
  `stippleRadius`, `paintStipple`, `stippleSettings`, type `StipplePoint`: the stipple the library's own
  `ImageGeneration` draws, for a reveal or a field of your own.

Checks
- The content check also checks a picture's `alternate` file (it exists, is a safe SVG when it's one, and has the
  picture's shape).

## 4. Optional: move the rest of the site onto the library (in this order; the site works between steps)

Run `npx design-library-check --share` first and keep its output to compare after. Each step names the code it
replaces; stop after any of them.

1. Opening height: on the year pages, `Hero` `reserve={{ title: 3, lead: 3 }}` (or the `hero` block's `reserve`),
   replacing any fixed height the year hero sets for itself (`layouts/Hero.tsx` and its rules in `designup.css`).
2. Colour on hover: a photo with a colour version gets the colour file as `alternate` (in `content/images.json` →
   the template's `assets.json`, `"alternate": "assets/{name}-colour.webp"`; in code `<Image src={grey}
   alternate={colour} … />`), replacing `lib/images.ts`'s `colorSrc` pairs.
3. The stipple reveal: `Image` `reveal={stipple}` where `stipple` is drawn with `layoutStipple` and `paintStipple`
   from `@design-library/core/effects`, replacing `parts/fundamentals/ColorReveal.tsx` (its copied Perlin and
   Poisson code) and `color-reveal.css`. Its timing goes in the template's `tokens.json` as a value for
   `--c-image-reveal-duration`, replacing `--t-designup-reveal-duration` and `--t-designup-reveal-reduced-duration`
   (reduced motion is the library's now). The Image page's "Your own reveal" story is a working stipple to start from.
4. Brand frames: `parts/fundamentals/PhotoFrame.tsx`'s shapes become the template's own decoration blocks
   (`designup.*`, registered in `registry.tsx`) placed in `Image` `decoration` / `under`, or from data in the `hero`
   block's and prose pictures' `decoration` slots; the quote band (`compounds/QuoteBand.tsx`) and the collage
   (`compounds/Collage.tsx`) frames follow the same way. Delete `PhotoFrame` when nothing uses it.

## 5. What to watch

- Decoration is decoration: it's hidden from screen readers, so anything it means goes into words.
- `alternate` needs both pictures in `alt` ("Before and after: …") and the same shape as the picture; the content
  check fails a different shape.
- A reveal draws only while it runs: never start your own timer, and don't read reduced motion yourself.
- Depth motion on decoration layers reads `prefersReducedMotion` and moves only the decoration.

## 6. Verify

1. `npx tsc --noEmit` and `npx vite build` pass.
2. Open every route in light and dark: nothing moved (compare with screenshots taken before the upgrade).
3. After step 1: step through the year pages: the opening and the links under it stay in one place.
4. After step 3: hover and tab to a photo: the stipple runs; with reduced motion on, it fades.
````

## The proof

At the release commit, outside both repositories (MP14, B5.14): to be run.

## What's in it, by plan packet

| Packet | Change | DoD row |
| --- | --- | --- |
| MP7 | `Hero` `reserve`, the `hero` block's `reserve` | B5.1 |
| MP8 | `Image` `decoration` and `under` | B5.2 |
| MP9 | `Hero` `picture.decoration`; `hero.decoration` and `image.decoration` data slots | B5.3 |
| MP10 | `Image` `alternate`; `assets.json` `alternate` | B5.4 |
| MP11 | `Image` `reveal(frame)` | B5.5 |
| MP12 | `@design-library/core/effects` | B5.6 |
| MP13 | Glide pace (to land) | B5.7 |
| MP16 | Display-size section titles (to land) | B5.9 |
| MP20–MP23 | `Illustration` (to land) | B5.10–B5.13 |
| MP14 | This release and brief | B5.8, B5.14 |
