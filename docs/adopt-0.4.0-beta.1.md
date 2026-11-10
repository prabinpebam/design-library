# Adopt 0.4.0-beta.1

> **TL;DR:** 0.4.0-beta.1 is "Data-driven sites": a whole site as JSON (a site document, page documents and collections) drawn by one `SiteView`, with commands to find blocks, check the site, write its types and rebuild generated collections. It's additive: a site on 0.3.0-beta.1 or 0.2.0-beta.x installs it and keeps working unchanged. Paste the block below into your agent to upgrade, then move to data one step at a time; the site works between steps.

**Owner, 2026-11-10 01:27 (verbatim, [DoD Q105](definition-of-done.md#owner-instructions)):** *"Improve Design library as per recommendation but want to do it in a way where the Design library stasy true to its goal of being a generic and versatile Design library and at the same time make it super easy for the Design up site to just use the updated version without much work. After the update, we should be just able to pass a detail of what has changed so that DesignUp site can adopt it wiothout breaking the site."* **Owner, 2026-11-10 01:52 ([DoD Q107](definition-of-done.md#owner-instructions)):** the data-driven requirement, folded into [Part 3 of the plan](improvement-plan.md).

**Paste this into DesignUp's agent:** *"Upgrade the Design Library to 0.4.0-beta.1: follow node_modules/@design-library/core/UPGRADE.md, section 0.3.0-beta.1 → 0.4.0-beta.1, after running its install line; do steps 1–3 now and stop for review before step 4 of its migration."*

**Release:** [v0.4.0-beta.1](https://github.com/prabinpebam/design-library/releases/tag/v0.4.0-beta.1). **In the package:** `node_modules/@design-library/core/UPGRADE.md` (the same block). **Detail:** `CHANGELOG.md`. **Plan and Definition of Done:** [Improvement plan, Part 3](improvement-plan.md), [Stage: DesignUp improvements](definition-of-done.md#stage-designup-improvements) rows B4.1–B4.15.

## The brief for your agent

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

## Proof: nothing breaks

To be run before the release (Q105.5): two copies of the DesignUp site's `web/` folder outside both repositories, one on 0.3.0-beta.1 and one on the 0.4.0-beta.1 tarballs; type check, build, every route compared in light, dark and at 320 px, console errors; and the install matrix on npm 10 and 11. The results replace this paragraph.

## The reference site and the acceptance test

Harbour Books (`@design-library/templates/harbour/site/`, open at [site.html?demo=site](https://prabinpebam.github.io/design-library/site.html?demo=site)) is the whole flow in generic data: three pages and a page per reading, two collections, a binding, derived counts. The acceptance test (plan AT1–AT6) ran on it as JSON edits only: a new page opens at its address with its title, a moved section moves, a headline with an accent mark changes, a new book raises Home's counts, a misspelt block type fails the check at its JSON path while the page leaves the section out, and the words-in-code and page-specific checks report zero ([B4.14](definition-of-done.md#stage-designup-improvements)).

## What's in it, by plan packet

| Packet | Change | DoD row |
| --- | --- | --- |
| DP8, DP9 | Site and page documents | B4.1, B4.2 |
| DP10 | Block registry and `design-library-blocks` | B4.3 |
| DP11 | Named slots: `split`, `grid`, `hero.media` | B4.4 |
| DP12 | Collections and references, item pages | B4.5 |
| DP13 | List bindings | B4.6 |
| DP14 | Derived values; `design-library-generate` | B4.7 |
| DP15 | `SiteView`: section boundaries, empty sections, first picture first (skeletons moved to DP24) | B4.8 |
| DP16 | Routes, item routes, aliases, not found from data | B4.9 |
| DP17 | Page transitions as data | B4.10 |
| DP18 | Template parts as blocks, `partsSite`, stub stories | B4.11 |
| DP19 | Site content check, page-specific and words-in-code exceptions, `design-library-types` | B4.12 |
| DP20 | Development notice and in-place JSON updates | B4.13 |
