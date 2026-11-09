# Recipe: a brand-led site

Goal: a site with a strong look of its own (a conference, a launch, a studio, a festival) built mostly from core parts, with a few custom parts where the brand needs one, and none that redraw what core already draws. Read it before you write a part. Steps 3, 4 and 6 hold the detail; this page is the order to apply them in.

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
| Two uneven columns, a heading beside its text | `Grid ratio="2:1" \| "aside"` | Collapse to one column when narrow | Overlap |

## 2. Set the brand through the seams, not CSS

Everything a brand changes has a seam ([the seam ladder](../AGENTS.md#the-seam-ladder)). Change the theme, never a component.

| What | Seam | Example |
| --- | --- | --- |
| Colour | `applyBrand` from `@design-library/core/theme` (`colours` by slot, each with its `seed`; `base` for a tinted page; `contrast: 'guard'` for a bright seed) | `applyBrand({ colours: { 1: { seed: '#ff4f00' } }, contrast: 'guard' })` |
| Type | `applyFonts` (`faces` for the site's own files with a metric-matched fallback; `roles` for display, label and numeral) | A display face on headings and big numbers only |
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

## 4. Check it

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
