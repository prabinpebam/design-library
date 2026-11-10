# Adopt 0.5.0-beta.1

> **TL;DR:** 0.5.0-beta.1 is "Brand pictures and openings": the pieces a brand-led site draws by hand around its pictures and openings, now in the library. An opening can keep one height across a series, and section titles can take the opening's size. A picture can carry brand shapes over and under it, show a second picture on hover or focus, and run the site's own reveal, with the library keeping the triggers, the timing and reduced motion. The stipple drawing the library uses is public. Drawn art is a new `Illustration` that follows the scheme, fits its space and moves only on the motion tokens. Glides can take their time from their distance. It's additive: a site on 0.2.0-beta.1 or later installs it and keeps working unchanged. Paste the block below into your agent to upgrade, then adopt each piece one at a time; the site works between steps.

**Status: released** (worker 68, 2026-11-10).

**Owner, 2026-11-10 01:27 (verbatim, [DoD Q105](definition-of-done.md#owner-instructions)):** *"Improve Design library as per recommendation but want to do it in a way where the Design library stasy true to its goal of being a generic and versatile Design library and at the same time make it super easy for the Design up site to just use the updated version without much work. After the update, we should be just able to pass a detail of what has changed so that DesignUp site can adopt it wiothout breaking the site."* Planned in [Improvement plan, Part 4](improvement-plan.md#part-4-moving-a-site-completely-onto-the-library-q110) (Q110, Q111, Q112).

**Paste this into DesignUp's agent:** *"Upgrade the Design Library to 0.5.0-beta.1: follow node_modules/@design-library/core/UPGRADE.md, section → 0.5.0-beta.1, after running its install line; do steps 1–3 now and stop for review before step 4."*

**Release:** [v0.5.0-beta.1](https://github.com/prabinpebam/design-library/releases/tag/v0.5.0-beta.1). **In the package:** `node_modules/@design-library/core/UPGRADE.md` (the same block). **Detail:** `CHANGELOG.md`. **Plan and Definition of Done:** [Improvement plan, Part 4](improvement-plan.md#part-4-moving-a-site-completely-onto-the-library-q110), [Definition of Done](definition-of-done.md) rows B5.1–B5.14.

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
nothing fetches a second file, section titles keep their size, and glides keep their time. Nothing draws an
`Illustration` until you place one.
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

Titles and glides
- `Section` `size="display"` or `"jumbo"`: section and closing titles at the type ramp's top steps (themed through
  `--type-display-*` and `--type-jumbo-*`); the level still follows the outline. From data, the optional `size` field
  on every block with a `heading`. Type `SectionTitleSize`.
- `glide(to, { pace: 'distance' })`: a short glide on `duration.move`, from `motion.glide-far` (40rem) on `move-far`;
  `Router` `glide={{ pace: 'distance' }}` for its own glides. Type `GlidePace`. The default is as before.

Illustrations
- `Illustration`: drawn art inline, from `children` (an `<svg>`) or `src` (a same-origin `.svg`, or one per size
  `{ compact, regular, wide }`), cleaned before it's drawn. Colours from the role classes `ink`, `muted`, `fill`,
  `surface`, `accent` (`--c-illustration-*`), so one file follows light, dark and more contrast; `dark` only for art
  that can't. Groups marked `data-size="compact" | "regular" | "wide"` show by its own width. Parts marked
  `data-motion="draw" | "fade" | "float" | "pulse" | "spin"` move with `play` `once` (default), `hover` or `loop`
  (with a Pause control); nothing moves under reduced motion. `label` or `decorative`.
- From data: an `assets.json` entry's `illustration: { play }` (its `src` an `.svg`), the `illustration` block
  (`picture`, `ratio`; in `split`, `grid` and `hero.media`), and card and prose pictures whose asset is one.

Checks
- The content check also checks a picture's `alternate` file (it exists, is a safe SVG when it's one, and has the
  picture's shape).
- `npx design-library-check-svg` also refuses unknown `data-size` and `data-motion` names in illustration files.
- Guide: step 6 "Illustrations"; the brand-led recipe's step 1 rows for each piece above.

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
5. Section titles: big section and closing titles take `Section` `size="display"` (or `"jumbo"`), or the block's
   `"size": "display"` in content, replacing the `--t-designup-display-*` sizes in `designup.css` that set them.
6. Glides (optional): `Router` `glide={{ pace: 'distance' }}` so a jump to a nearby anchor is quicker than one down
   the page.
7. Illustrations (optional): drawn art that should follow the scheme, fit its space or move (empty states, a
   loader, an opening drawing) becomes an `Illustration` with role classes, replacing hand-placed `<svg>` and per-scheme
   copies of the same drawing. Run `npx design-library-check-svg` on the files. Guide:
   `node_modules/@design-library/core/guide/6-templates.md`, "Illustrations".

## 5. What to watch

- Decoration is decoration: it's hidden from screen readers, so anything it means goes into words.
- `alternate` needs both pictures in `alt` ("Before and after: …") and the same shape as the picture; the content
  check fails a different shape.
- A reveal draws only while it runs: never start your own timer, and don't read reduced motion yourself.
- Depth motion on decoration layers reads `prefersReducedMotion` and moves only the decoration.
- An illustration that loops always shows its Pause control; draw every motion's resting frame complete, since
  reduced motion holds it there.

## 6. Verify

1. `npx tsc --noEmit` and `npx vite build` pass.
2. Open every route in light and dark: nothing moved (compare with screenshots taken before the upgrade).
3. After step 1: step through the year pages: the opening and the links under it stay in one place.
4. After step 3: hover and tab to a photo: the stipple runs; with reduced motion on, it fades.
````

## The proof

At the release commit, outside both repositories (MP14, B5.14, Q114):

| Check | 0.4.0-beta.2 → 0.5.0-beta.1 |
| --- | --- |
| Install the two tarballs into a copy of DesignUp's `web/` with no other edit | Pass |
| `tsc --noEmit` and `vite build` | Pass, Pass |
| Every route (226), each element's box, colour, background, size, face, underline and opacity, light | 226 identical |
| The same in dark | 226 identical |
| The same at 320 px | 226 identical |
| Console errors | 0 before, 0 after |

The 0.4.0-beta.2 brief proved 0.2.0-beta.1 → 0.4.0-beta.2 identical on the same 226 routes, so a site on 0.2.0-beta.1 or later reaches this version unchanged. Install matrix: npm 10.9.9 and 11.21.1 pass (the libraries, the dev tools, again from the lockfile). `npm run check` passes at the release commit. **Probe sweep** (once, on the release build): 181 pages (the 174 of 0.4.0-beta.1, the display-titles site demo, and the library's Hero, Image, Pictures, Section, Motion and Illustration pages) at 1000 and 320 px in light and dark, every probe, 52,128 rows. The template pages: 4 fails, all the known K9 (spacing FR14, S2, at 320 px on the blog's unsubscribed and not-found pages), unchanged. The library pages: the same library-chrome rows as unchanged pages such as Button and Card (title bar ME6, SC2, SC3 and SC5 on the page header and examples, VN3 for a picture in a card in an example frame), plus one new S2: SC4 on the Motion page at 320 px (a list item with a gap and no inset), handed to the components worker. Spacing now skips shapes inside an SVG, so an illustration's groups aren't counted as stacks.

## What's in it, by plan packet

| Packet | Change | DoD row |
| --- | --- | --- |
| MP7 | `Hero` `reserve`, the `hero` block's `reserve` | B5.1 |
| MP8 | `Image` `decoration` and `under` | B5.2 |
| MP9 | `Hero` `picture.decoration`; `hero.decoration` and `image.decoration` data slots | B5.3 |
| MP10 | `Image` `alternate`; `assets.json` `alternate` | B5.4 |
| MP11 | `Image` `reveal(frame)` | B5.5 |
| MP12 | `@design-library/core/effects` | B5.6 |
| MP13 | Glide pace: `glide` `pace`, `Router` `glide` | B5.7 |
| MP16 | Display-size section titles: `Section` `size`, the blocks' `size` | B5.9 |
| MP20–MP22 | `Illustration`, from code and `assets.json`; `check:svg` names | B5.10–B5.12 |
| MP23 | Guide "Illustrations", Rules agents miss row, catalogue, Images notes, this brief's step 7 | B5.13 |
| MP14 | This release and brief | B5.8, B5.14 |
