# Recipe: a brand-led site

Goal: a site with a strong look of its own (a conference, a launch, a studio, a festival) built mostly from core parts, with a few custom parts where the brand needs one, and none that redraw what core already draws. Read it before you write a part. Steps 3, 4 and 6 hold the detail; this page is the order to apply them in. Moving a site that already exists: [step 4](#4-moving-an-existing-site).

## 1. Find the core part first

Before any custom part, look the need up here, then in `agent/index.json` → `components[]`. Each row is a need brand-led sites rebuilt by hand that core already meets.

| Need | Core part | It can | It can't (then a custom part is fair) |
| --- | --- | --- | --- |
| The page's opening: eyebrow, big title, lead, buttons, a picture or film | `Hero` (`eyebrow`, `title` takes rich words, `lead`, `actions`, `note`, `picture` with `focal`, `media`, `trail`, `fit="screen"`) | Fill the first screen; a picture or any media beside or under; a trail of facts under the actions | Animate its own title letter by letter |
| A big number with its label | `Statistic` (`value`, `format`, `unit`, `label`, `size="l"`) | Format numbers in the reader's language; a change and a trend | Count up as it scrolls in |
| A quote with who said it | `Quote` (`author` with `name`, `role`, `src`; `size`; `align`) | Three sizes, a portrait, a source link | Sit on a photo as a collage |
| A list of links to pages (talks, years, cities) | `IndexList`, `RowList`, `Card` in a `Grid` | Titles, summaries and links, read in order | A filtering finder with its own search |
| Key–value facts (date, place, price) | `DescriptionList` | Terms and details, wrapping cleanly | A timeline |
| A tinted band between sections | `Section` `tone="tint"` (or `sunken`, `raised`) with `bleed` | A full-width band in every scheme and contrast | A gradient or texture of the brand's own |
| A status on a card (Ended, Coming up, Sold out) | `Card` `meta` with a `Badge` | A status in words and colour, in its own place | — |
| Film or a picture that plays in place | `Reveal` around a `MediaPlayer` or `Image` | Swap the still for the film on request, with controls | Autoplay with sound |
| Accent words in a heading | Rich text in content (`{ "text": "…", "mark": "accent" }`) or `Heading tone="accent"` | A brand colour that keeps 3:1 (display) or 4.5:1 (text) | A per-letter colour |
| Two uneven columns, a heading beside its text | `Grid ratio="2:1" \| "3:2" \| "1:2" \| "2:3" \| "aside"` | Collapse to one column when narrow; space separates the columns | Overlap; a rule between columns; other ratios (`2:3` is the nearest to 5:7) |
| A strip of big numbers (attendees, talks, years) | `Statistic` in a `Grid` (its figure reads the `numeral` font role) | Format each number in the reader's language, with its label | Count up as it scrolls in |
| Names grouped by tier (sponsors, partners, donors) | A `List` or `DescriptionList` under a `Heading` per tier, in a `Section`; a template's tier sizes are its own template tokens | Any number of tiers, read in order, in every scheme | Logos sized by tier from core tokens (core has no tier sizes) |
| Cards that sit picture-beside-words when wide | `Card` `layout="beside"` (stacks when the card is narrow) or `layout="row"` (a small square picture at the end) | Both in a `Grid` | — |
| Breadcrumbs above the opening | `Breadcrumbs` as the section before the `Hero`, with the default spaced opening (under `SiteLayout opening="flush"` the trail sits closer to the content than the page's own gaps: the spacing probe fails SC14) | A trail in reading order before the eyebrow | A slot inside the `Hero` (there's none) |
| Moving between sibling pages (years, versions, items of one kind) without losing the place | `Router` `scroll` (`'keep'`, or a function per change), `focus` as a function, `again: 'top'`; from data, a collection page's `"between": "keep"` and `site.json` `"again": "top"` | Keep scroll and focus between siblings, land other links at the top, glide back to the top from a link to the shown page | — |

## 2. Set the brand through the seams, not CSS

Everything a brand changes has a seam ([the seam ladder](../AGENTS.md#the-seam-ladder)). Change the theme, never a component.

| What | Seam | Example |
| --- | --- | --- |
| Colour | `applyBrand` from `@design-library/core/theme` (`colours` by slot, each with its `seed`; `base` for a tinted page; `contrast: 'guard'` for a bright seed) | `applyBrand({ colours: { 1: { seed: '#ff4f00' } }, contrast: 'guard' })` |
| Type | `applyFonts` (`faces` for the site's own files with a metric-matched fallback; `roles` for display, label and numeral); the top steps' size, weight, leading and tracking through `applySettings` (`--type-display-*`, `--type-jumbo-*`) | A display face on headings and big numbers only; a one-weight condensed face at `--type-display-weight: 400` and a larger `--type-display-size` |
| Frame and space | Theme settings (`applySettings`, `settingsCss`): `--c-site-layout-width`, `-margin`, `-gap`, `-padding-start`; `SiteLayout opening="flush"` | A hero right under the header, a wider column |
| Links | `--link-decoration: none` (the link colour must then stand 3:1 from the text) | Brand links without underlines |
| Scheme | `SchemeControl` in the header | Light, dark and system |

## 3. Then, and only then, a custom part

A custom part is right when the brand needs something core doesn't draw: a collage, a sponsor wall, a countdown. Make it inside your template (`npx design-library-new-template {id} --part compounds/{Name}`, [Step 6](6-templates.md)).

**Compose core fundamentals inside it.** A part never draws its own interactive or semantic element:

| Inside a custom part | Use | Never |
| --- | --- | --- |
| A link | `Link`, or `Button` with `href` | A raw `<a>` |
| A heading | `Heading` (its `level` from the page's outline) | A raw `<h1>`–`<h6>` |
| A picture | `Image` (`ratio`, `focal`, `alt`) | A raw `<img>` |
| An action | `Button` | A raw `<button>` or a clickable `<div>` |
| Words | `Text` (`variant`, `tone`) | Styled `<span>`s |

They bring focus rings, accessible names, 44 px targets, link decoration, contrast and every future token update; a raw element brings none, and `npx design-library-check` warns about each one (`raw-markup`). The part's own CSS lays these out (grid, gap, position) and reads only its own `t.{template}.*` tokens, never restyles the core parts inside it.

**Budget:** custom parts draw **about a third of a page's elements** at most. Over that, go back to step 1 and step 2: a part that redraws a core part, or a look a seam would give, is the usual cause. `npx design-library-check --share` prints the core and custom share for each view.

## 4. Moving an existing site

When a site already exists with its own router, scroll helper, opening and frames, move it in this order, one step at a time, checking after each. Each step replaces site code with a library row; brand art that core doesn't draw stays as named parts of your template.

| Step | Do | Replaces | Library rows |
| --- | --- | --- | --- |
| 1. Theme | `applyBrand`, `applyFonts`, `applySettings` (step 2 above) | Token overrides, root font-size scaling, CSS that restyles core parts | Step 2 |
| 2. Content | Move words, pictures and lists into JSON ([content](2-content.md)); `npx design-library-check-content` lists screens a template ships but nothing shows, so each becomes a page or is removed | Words and lists inside components | `assets.json`, page and collection documents |
| 3. Components | Each need from step 1's table; a part only where the table says it can't | Hand-built openings, quotes, number strips, index lists, bands | Step 1 |
| 4. Router | Core `Router` with `scroll`, `focus`, `again`, `prepare` (load the next page's picture before it shows) | A hand router, `window.scrollTo` after a route change, a scroll helper | Step 1, last row |
| 5. Site from data | `site.json`, `pages/`, `collections/`, `SiteView` (the window title from `titlePattern` and each page's `title`; the header's current place from the navigation) | Route lists and titles in code | [Content](2-content.md) |
| 6. Brand parts | What's left: the brand's art, as named parts of your template on public seams (step 3) | Everything else that was custom | Step 3 |

**On 0.4.0-beta.1** (before `scroll` and `again`): moving with a query (`/archive?year=2024`) keeps the place, because only a change of path lands at the top; and `onChange` can `glide(0)` for a link to the shown page. Drop both once on 0.4.0-beta.2.

**Answers people ask when moving:**

| Question | Answer |
| --- | --- |
| Page titles from data? | `site.json` `titlePattern` (`{page}` and `{site}`) and each page's `title`; `SiteView` sets the window title, description and picture |
| Fonts: which face goes in which role? | Map by where the site uses each face, not by name: `display` for headings and big numbers, `text` and `ui` for body and controls, `label` and `numeral` often share one face, `code` another. Naming a `code` face replaces the library's default (JetBrains Mono); a site with no code shows neither |
| A face only my template's parts use? | `applyFonts` loads only faces a role names. Load the extra face with your template's own `@font-face`, or write its rule with `fontFacesCss`, and read it from a template token; there's no extra named role |
| My own font files? | `applyFonts({ faces: [{ family, sources, fallback }] })`: the site's files, with a metric-matched fallback so the page doesn't jump as the face arrives |
| Can I scale the root font size with the window? | Don't: the library keeps the root at 16 px so zoom and every token keep working, and `check` warns on a root size. The cost of dropping root scaling: on big screens type is smaller than a window-scaled design (often 20–40%), and a small laptop no longer fits the whole opening in the first screen. `Hero fit="screen"` fills the first screen with a minimum height and grows with its content |
| Serif years in an index? | `IndexList` shows each entry's title as a link and one line of summary in the text face; it has no number column. A list of years in a face of their own stays a template part for now |

## 5. Check it

| Check | Proves |
| --- | --- |
| `npx design-library-check --share` | No styles in views, no raw interactive markup in parts (warnings), and each view's core and custom share |
| `npx design-library-check-content --templates src/templates --src src` | Content is valid; every part is in the manifest; the template renders |
| [Step 8](8-review.md), the light review | Each page at 320 px and wide, in light, dark and more contrast |

## Do and don't

| Do | Don't |
| --- | --- |
| Look the need up in step 1 before writing a part | Rebuild `Hero`, `Quote`, `Statistic` or `IndexList` as a part to change its look |
| Change colour, type, frame and space through the theme | Override a core token or select a core part in CSS |
| Compose `Link`, `Heading`, `Image`, `Button` and `Text` inside parts | Draw raw `<a>`, `<h*>`, `<img>` or `<button>` in a part |
| Keep custom parts to about a third of a page | Make a page mostly custom parts |
