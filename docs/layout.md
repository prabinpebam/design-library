# Layout: regions, columns and reflow

How a Design library page or app divides the window into regions and columns, and how it reflows from a wide window to 320 CSS px (owner Q85.2, 2026-11-09). Like every UX framework here it has two parts: [the framework](#part-1-the-framework) to build with and [the checklist](#part-2-the-checklist) to judge with ([the two-part frameworks](spacing.md#the-two-part-frameworks)). Layout is the outer end of [Spacing and layout rhythm](spacing.md): the same hierarchy tree decides the regions, their space, their frames and their columns.

## Part 1: the framework

### Terms

- **Window:** what the person sees; it can be any width from 320 CSS px up, and any text size.
- **Region:** a top-level group of the page with its own job and landmark: the header (`banner`), the main region (`main`: the page content, or an app's view), navigation, a sidebar or details column (`complementary`), the footer (`contentinfo`).
- **Column:** a track that holds content side by side with another. Columns belong to one group of the tree (owner Q98).
- **Measure:** the width of a line of running text; at most `size.measure` (42 rem).

### The method: from the tree, outside in

Layout is decided in the same order as space (the [method](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93)), starting at the top of the tree:

1. **Regions come from the tree.** Map the page's top-level groups: what serves every page (header, navigation, footer), what this page is for (the main region), and what supports it (a sidebar of chats, a details column, an inspector). Each is one region with one landmark. Pick the layout that has those regions (SiteLayout, AppLayout, ChatLayout, EditorLayout, ListDetail, LibraryLayout); never build regions from loose `div`s.
2. **The main region comes first.** It's the widest region at every width, first in the source after the header, and first in view on a narrow window. Supporting regions give way to it: they narrow, wrap under it, or become a drawer, never squeeze it.
3. **Widths come from content.** Running text sits on the measure (`size.measure`); a page's column is `c.site-layout.width` (72 rem) or the reading measure; a sidebar takes `size.nav-width` (resizable between `size.nav-width-min` and `size.nav-width-max`); a details column `c.app-layout.aside`. Columns inside a group follow [step 5 of the method](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93): each group's own content, a shared column only as far as the alignment it serves is seen.
4. **Respond to the container, not the window.** A component or a group decides its columns from its own width (`@container`, `fit-content`, `auto-fit` with `size.column-min`, flex wrap with a minimum), so the same list works on a page and in a 240 px panel. Only a layout reads the window (`@media`), and only at `breakpoint.sm`, `breakpoint.md` and `breakpoint.lg` (40, 64, 80 rem), each with its token named in a comment.
5. **One scroller per region.** The window scrolls a site; an app's regions scroll on their own (each a `ScrollArea`, see [Scrolling](scrolling.md)), and nothing inside a scroller scrolls the same way. A sticky header is matched by the scroller's scroll padding, so nothing focused or jumped to hides under it (WCAG 2.4.11).
6. **Source order is reading order.** What's drawn follows the DOM: no `order`, no reversed flex, no grid placement that moves content ahead of what comes before it. A component that shows a picture after its words renders it after its words.
7. **Reflow without loss.** At 320 CSS px wide and at 200 % text, nothing scrolls the page sideways (WCAG 1.4.10); a wide thing (a table, code, a canvas) scrolls inside its own region.

### Principles

1. **Region before column, column before component.** A component never decides the page's columns, and the page never decides a component's.
2. **The main region is never the smallest.** If a supporting region would make it narrower than itself, the supporting region moves (wraps, collapses to a drawer, or hides behind a toggle).
3. **Breakpoints are the layout's, not the content's.** A window breakpoint inside a component is a column imposed from another context (Q98): it breaks the moment the component sits in a panel.
4. **Space and layout are one tree.** A region is one unit of the page; inside it, the spacing method starts again (Q94).

### Never

- A `div` region with no landmark; two `main` regions; a page with no `main`.
- A supporting region wider than the main region, or a fixed-width column that squeezes it.
- `order`, `flex-direction: row-reverse` or `wrap-reverse` to move content.
- A window `@media` query in a component, or a threshold that isn't a breakpoint token.
- A sticky header without matching scroll padding.
- A scroller inside a scroller on the same axis.
- Running text wider than the measure.

## Part 2: the checklist

Each row passes or fails on a measurement. **DOM** rows are measured by `tools/layout-probe.js`; **static** rows by the named check; **look** rows by an evaluator, who starts by writing the page's regions from its hierarchy tree. Severity follows the `spacing` skill: S1 broken, S2 misgrouped, S3 fragile, S4 polish. A view passes when no S1–S3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| LY1 | Nothing scrolls the page sideways, and nothing reaches past the window unless a scroller of its own holds it, at 1000 and 320 CSS px | DOM | S1 |
| LY2 | Running text of two lines or more is no wider than `size.measure` | DOM | S2 |
| LY3 | What's drawn follows the source order: no `order` other than 0, no reversed flex direction or wrap | DOM | S2 |
| LY4 | A sticky or fixed bar at the top of a scroller is matched by that scroller's scroll padding (WCAG 2.4.11) | DOM | S1 |
| LY5 | No scroller inside another that scrolls the same way (a text field's own scrolling excepted) | DOM | S2 |
| LY6 | Every column of a multi-column Grid is at least `size.column-min` (16 rem) wide | DOM | S2 |
| LY7 | One `main` region; at most one banner and one content-info region at the top level | DOM | S1 |
| LY8 | The main region is the widest region; under `breakpoint.sm` it spans the window and starts in its first half | DOM | S2 |
| LY9 | Columns come from each group's own content (spacing SC16, SC17): no short text wraps beside unused space | DOM (`tools/spacing-probe.js`) and look | S2 |
| LY10 | No component or compound reads the window: `@media` width queries only in layouts, every threshold a breakpoint token named in a comment | static: review of `@media` and `@container` in the diff | S3 |
| LY11 | The evaluator can name each region, its landmark and its job from the hierarchy tree, and the layout chosen has exactly those regions | look | S2 |

### How to run it

```js
// Playwright: await page.addScriptTag({ path: 'tools/layout-probe.js' })
const result = window.layoutProbe(); // the page's layout by default, or a selector
result.rows;    // { LY1: { pass, findings, count }, … }
result.regions; // each region and its width
```

Sweep every template layout at 1000 CSS px with every panel open and at 320 CSS px (the agent browser scales by 1.5: set the viewport to 1500 × 1200 and 480 × 1200).

## Results

### F15.LY1: the layout framework and its first sweep (2026-11-09 about 13:50, owner Q85.2)

First sweep of the 168 rendered template layouts at 1000 CSS px (before the fixes): LY4 failed on every SiteLayout page (156: the sticky header with no scroll padding, so a focused field or a jumped-to heading could stop under it), LY7 on ChatLayout and EditorLayout (8: no `main` region at all), LY3 on Card's row layout (6: the picture drawn after the words by `order` while it came first in the source), LY8 on the Projects issue pages (2: the details column 352 px beside a 336 px view). LY2 and LY5 findings were probe misreads (a schedule slot is a group, not running text; a text field scrolls its own words) and the probe now skips them.

Fixed at the owners:

- **SiteLayout** writes its header's height as the page's scroll padding (it already measured it for Frame), and removes it when it unmounts.
- **ChatLayout**'s main area and **EditorLayout**'s work area are `main` regions.
- **Card** renders a row's picture after its body; the `order` is gone.
- **AppLayout**'s view takes what the details leave, never less than half the body; where that can't hold, the details wrap under the view, across the body. The decision is the body's own width, not the window's.
- **Field**'s control is one track as wide as the field (`minmax(0, 1fr)`): at 320 px a search field with its button (Blog and AI chat search) pushed 21 px past the window, because the input's default width set the track's minimum.

**After:** the 168 rendered template layouts pass every DOM row (LY1–LY8) at 1000 CSS px with every panel open and at 320 CSS px. (Harbour's six layouts other than its home aren't registered in the preview yet, so they weren't swept.)

Open (LY10, static): components that still read the window: Section's indexed head and RowList (`@media` at `breakpoint.sm`), Dialog, Sheet and Lightbox (`@media` at 30, 52 and 80 rem, the first two not breakpoint tokens), ContextMatrix (`breakpoint.sm`); container thresholds at 30, 32, 36, 38, 42 and 48 rem name no token. A Field with `orientation="horizontal"` gives its label a fixed third (SC17). The library's own preview bar (the floating controls over a template preview) scrolls the page sideways at 320 px where it has a screen-state control (Blog and AI chat search); the probe now judges only the layout. Next: give each a container of its own and a named threshold.

## Sources

- agentic-craft `spacing` skill (rule 12, small windows; the audit at 320 px), installed in `.github/skills/spacing/`.
- WCAG 2.2: 1.3.2 Meaningful sequence, 1.4.10 Reflow, 2.4.11 Focus not obscured, 1.3.1 Info and relationships (landmarks).
- This library: `packages/core/tokens/tokens.json` (`size.*`, `breakpoint.*`), the layouts in `packages/core/react/layouts/`, `tools/layout-probe.js`.
