# Upgrading

How to move a project to a newer version of `@design-library/core` and `@design-library/templates`, newest first. Each version has one block you can paste into your agent as it is. What changed in detail is in `CHANGELOG.md`; the proof that nothing breaks is on the hosted page each block links.

## 0.3.0-beta.1 → 0.4.0-beta.1

Proof and the same brief for people: [Adopt 0.4.0-beta.1](https://prabinpebam.github.io/design-library/docs/#adopt-0.4.0-beta.1.md). From 0.2.0-beta.x, the install line below is all you need; the older blocks' adoption steps still apply.

````markdown
# Upgrade the Design Library to 0.4.0-beta.1

## 1. Install (nothing else changes)

npm install https://github.com/prabinpebam/design-library/releases/download/v0.4.0-beta.1/design-library-core-0.4.0-beta.1.tgz https://github.com/prabinpebam/design-library/releases/download/v0.4.0-beta.1/design-library-templates-0.4.0-beta.1.tgz

Then run your type check and build. Install both together; templates needs the core of the same version. Coming from
0.2.0-beta.x: this install line is all you need; the 0.3.0-beta.1 and 0.2.0-beta.2 blocks below list adoption steps you
can still take, in any order with these.

## 2. Nothing breaks

0.4.0-beta.1 is "Data-driven sites": every change is an addition. `TemplateView`, `loadTemplate`, content files and every
component keep their output; a site that doesn't write a `site.json` sees no difference. The new checks only warn unless
you pass `--strict`, and the page-specific warning only runs once your project has a `site.json`.
Proof: a copy of a real site installs this version with no edits; the type check, build, every route's render in
light, dark and at 320 px, and console errors are compared with the previous release (record on the page linked above).

## 3. What's new

A site as data (`@design-library/core/render`, `schemas/`)
- `site.json` (`site.schema.json`): title and title pattern, `home`, `notFound`, `navigation`, `header` and `footer`
  blocks, default layout, `transition`, `aliases` (patterns such as `"/events/:id": "/readings/:id"`, or an `https://`
  address), `derive` and shared `strings`.
- Page documents (`page.schema.json`): `id`, `route`, `title`, `description`, `picture`, `canonical`, `hidden`,
  `transition` and ordered `sections`, each a block with an optional `anchor`.
- Collections (`collection.schema.json`): an `item` schema and `items`. In content, `{ "ref": "talks/…" }` (or with
  `"field"`) is an item; a page with `"route": "/talks/:id", "collection": "talks"` is each item's page, reading
  `{ "item": "title" }`; `{ "from": "talks", "where": …, "sort": …, "limit": … }` lists items in place of a hand list;
  `{ "derived": "talk-count" }` reads a count, distinct values or groups declared in `site.json` `derive`.
- `<SiteView site={loadSite({ site, pages, collections, assets, assetUrls, registry })} />` draws the page at the current
  address on the core router: header, footer, window title, description and preview picture, aliases, the not-found page,
  the first picture loaded first. A section that can't be drawn is named by file and JSON path in development (one
  notice) and left out in production; a bound list that finds nothing leaves its section out. JSON edits update the
  open page in place. `pageFor(site, path)` tells which addresses have a document, for moving page by page.
- Slots: new `split` (`start`, `end`) and `grid` (`items`) blocks, and `hero` `media`, hold other blocks. `Grid`
  `gap="section"` for cells that are sections. `Image` `priority`.
- A template's own parts are block types: `parts.blocks[]` in `template.json` with `example`; placed from page
  documents through the template's registry; `partsSite(template)` previews each in place.

Commands
- `npx design-library-blocks "a list of people with photos"`: the core blocks that fit, with fields and an example,
  then template parts. The library's Core first page lists the same registry.
- `npx design-library-check-content --site src/site`: every site, page and collection document, references, bindings,
  slots, links and anchors, at the JSON path.
- `npx design-library-check`: with a `site.json`, warns about page-specific code (`path === '/talks'`, `case '/x':`);
  `design-library-check.json` lists the words and files that must stay in code (`wordsInCode`, `pageSpecificCode`).
- `npx design-library-types`: `site-types.ts` from your JSON (an interface per collection, page ids, routes, references).
- `npx design-library-generate`: rebuilds collections marked `"generated": { "by": "scripts/x.mjs", "from": "data/x" }`
  and checks them; `--check` fails a build when one is stale.
- Guide: step 2 "A data-driven site" and step 6 "Your parts as blocks".

## 4. Optional: move to a data-driven site (in this order; the site works between steps)

Run `npx design-library-check --share` and `npx design-library-check-content --templates web/src/templates --content web/src/content --src web/src`
first and keep their output to compare after. Each step is optional; stop after any of them.

1. Site document and routes. Write `web/src/site/site.json` from `content/site.json` (header, footer, navigation),
   the title rule in `App.tsx` (`titleFor`) as `titlePattern`, and old addresses as `aliases`. Render
   `<SiteView site={data} />` inside the app's `Router`, and, while moving, send only the addresses `pageFor(data, path)`
   finds to it; the rest still go to `resolve(route)` and the hand-written views.
2. Parts as blocks. Give each part content places (`PhotoTiles`, `TalkGrid`, `NameWall`, `LogoShape`, `ColorReveal`
   if it stays) a block type `designup.{name}`: its schema in the template's `content.schema.json`, an entry with an
   `example` in `template.json` `parts.blocks`, and a `registry.tsx` entry; pass that registry to `loadSite`. Run
   `npx design-library-blocks "<need>"` before each: a core block may already fit.
3. Collections. Move the repeated lists (`content/talks.json`, `editions.json`, `cities.json`, the speakers) into
   `web/src/site/collections/{id}.json`, each with an `item` schema; lists that point at each other use
   `{ "ref": "speakers/…" }`. A collection the archive step writes gets `"generated"` and its step becomes a script for
   `npx design-library-generate`. Run `npx design-library-types` if code still reads them.
4. Pages, one shape at a time, simple repeated pages first: the talk page (`/talks/:id` with `"collection": "talks"`),
   then the year pages, the More pages (`content/more/pages.json` → one page document each), then the indexes
   (`TalksIndex`, `Speakers`, `EditionsIndex`, `Cities`) with list bindings, and Home last (its counts as `derive`).
   After each page, delete its view and its case in `resolve`.
5. Gate. When `resolve` has no cases left, remove it and the views, render `<SiteView>` alone, and add to the build:
   `npx design-library-check-content --site web/src/site --release`, `npx design-library-check --strict=all`,
   `npx design-library-types --check` and `npx design-library-generate --check`.

## 5. What to watch

- One `Router`: `SiteView` uses the app's if there is one; don't nest a second.
- A route literal in code (`path === '/talks'`) is a warning once `site.json` exists; that's the list of what's left to
  move. Put the one router you keep in `design-library-check.json` `pageSpecificCode.files` until it goes.
- Unknown block types without a namespace are errors in the content check; template parts are `{template}.{name}`.
- Bindings with `"today"` depend on the reader's date: a past event leaves "Coming up" by itself.

## 6. Verify

1. `npx tsc --noEmit` and `npx vite build` pass.
2. Open every route in light and dark: nothing moved (compare with screenshots taken before the upgrade).
3. After each migration step, the same routes look the same, `npx design-library-check-content … --site web/src/site`
   passes, and `npx design-library-check` shows fewer page-specific and words-in-code warnings.
````

## 0.2.0-beta.2 → 0.3.0-beta.1

Proof and the same brief for people: [Adopt 0.3.0-beta.1](https://prabinpebam.github.io/design-library/docs/#adopt-0.3.0-beta.1.md). From 0.2.0-beta.1, run the 0.2.0-beta.2 block's adoption steps too; the install line below is all you need.

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
Proof: a copy of a real site installed this version unchanged; it type-checked, built and rendered every route with
no new console errors and no visual change (record on the page linked above).

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
