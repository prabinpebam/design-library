# Spacing and layout rhythm

How space groups things in everything the Design library draws, and how to judge that it does. Inferred from the agentic-craft `spacing` skill (its rules, roles and audit) and applied to this library's tokens, tiers and templates (owner Q85, 2026-11-09).

Like every UX framework in this project, it comes in two parts ([the two-part frameworks](#the-two-part-frameworks)):

1. **[The framework](#part-1-the-framework):** what an agent or a person applies while designing a view.
2. **[The checklist](#part-2-the-checklist):** measurable pass/fail rows that judge the finished view. Someone who didn't build the view scores it ([the adversarial loop](#the-adversarial-loop)).

## Grounding: what space promises

- **Promise:** a person sees what belongs together before they read a word. A heading reads as the start of what follows, a group as one thing, a section as a new part of the page.
- **Job:** "When I land on a page, I want to see its parts and their order at a glance, so I know where to look."
- **User can:** scan a template page and name its sections, the heading of each and which items belong to it, without borders or lines to tell them.
- **Failure the owner saw (Q85):** every row of a template's layout sat one equal gap from the next (32 px between page parts, 24 px between a heading, its intro and its content, 16 px between a hero's title, lead and actions), so nothing grouped and nothing led.

## Part 1: the framework

### Terms

- **Page:** the whole thing a person sees at one address: the header (title bar), the page content and the footer.
- **Page content:** the content of the page apart from the header and the footer; what this page is for.
- **Group:** elements more related to one another than to anything around them. Groups nest: a page holds groups, a group holds groups, down to a **pair** that reads as one thing.
- **Unit:** one child of a group, seen from that group.
- **Frame:** a unit presented alone (a stage, a feature): its own room, sized to the window, between its outer edge and its content. Spacing and framing are one model (below): a frame is one unit in its parent group, and inside it the method starts again.

### The method: hierarchy first, then space and frames (owner Q93)

Space isn't chosen per element or per special case. It falls out of the information hierarchy, worked out first (owner Q93: first principles, not hard-coded rules).

1. **Map the hierarchy.** Write the page as a tree of groups: every element belongs to exactly one group, and a group's members are more related to one another than to anything outside it. Ask of each element: what does it belong with? What would a reader name as one thing? At the top, this brings out the page's own groups: the header and footer (which serve every page) and the page content (which serves this one). Inside the page content: its units (bands, sections), each unit's head and content, the groups in that content, their items, and the pairs. Nothing is placed by habit: a closing invitation is one of the page content's units, not part of the footer, because that's what it belongs with.
2. **Give each group one gap, by its depth.** A group's children sit apart by that group's level; the deeper the group, the smaller the gap (the [rhythm](#the-rhythm-five-levels)). One invariant holds at every node: **the space between a group's children is smaller than the space between the group and its siblings** (proximity). A heading is its group's first member, so it sits nearer its own content than the content above. Where space alone can't show a boundary, a group may draw an enclosure instead; inside it, no gap exceeds its inset.
3. **Frame only where isolation gains.** Decide for each unit whether the reader gains from seeing it alone ([Framing](#framing-presenting-one-piece-of-content), Q91). A frame changes how the unit is presented, never where it sits in the tree: to its parent it stays one unit, at the parent's gap.
4. **Inside a frame, start again.** A frame's content is a tree of its own: map it (a quote's words and attribution; an opening's message, its actions and its picture) and give its groups their gaps by depth, from its own root. The frame's room (the space between its edge and its content) is presentation, not a gap between groups (owner Q94).
5. **Build the tree, one wrapper per group.** Each group of the tree is one wrapper (a layout, a compound's part, a Frame) that owns its children's gap and serves only its level; content names the tree (blocks and their order), never sizes.

### One model: a frame is a unit outside and a root inside (owner Q94)

Spacing and framing exist together, so they're one model, not two rulebooks. Spacing works on units and the gaps between them; framing decides how much room one unit takes for itself. The two never measure the same space:

- **Outside, a frame is one unit.** Its parent group places it like any other member, at the parent's gap, measured from the frame's outer edge. Proximity is judged there: the frame's neighbours are its siblings, and the page content's edges against the header and footer (principle 8) count the frame as one unit.
- **Inside, the method applies again on its own.** The frame's content is the root of a new tree; its groups get their own gaps by their own depth (a quote's words → attribution at the group level, its name → role at the pair level). Those gaps are compared only with each other.
- **The room in between belongs to neither.** The space from a frame's edge to its content (a feature's band padding, a stage's share of the window) is the unit's presentation. It isn't a gap between groups, so it never has to be smaller than anything outside, and nothing inside has to be smaller than it.

That's why a frame's large inner space doesn't defy the spacing rules. Seen from outside, a 128 px band around a quote is one unit 64 px from its neighbours, exactly like an unframed section; seen from inside, the quote's own groups sit 16 and 4 px apart, exactly as they would anywhere. The room makes the unit read alone (that's its job); grouping still holds at every node of both trees. A frame that broke grouping would have to change a gap between units or inside its content, and the checklist measures both.

The principles below aren't extra rules; each is the method applied to a case that comes up often.

### Principles

1. **Space groups first.** Proximity shows what belongs together; add an enclosure (a card, a border) only when space isn't enough, and one mechanism per boundary.
2. **Each level of the hierarchy has its own gap, and each level is about twice the one below.** A page's rhythm reads pair < item < group < section < page. Two different levels never share one gap.
3. **Inner space is smaller than outer space.** Inside a group, members sit closer than the group sits to its neighbours: at least 1.5 times, ideally 2 times. Inside an enclosure, no gap between its children exceeds its inset.
4. **A heading belongs to what follows.** The space above a heading's head (eyebrow, heading and intro) is at least twice the space below it.
5. **The layout owns the space.** A parent sets the gap between its children and its own padding; components have no outer margin; nothing depends on a sibling's position.
6. **Every value is a role token.** Components read a role (`space.stack-group`) or their own component token aliasing one, never a literal or a bare scale step. Density swaps the roles' values in one place; the ratios hold in every density.
7. **Content says what it is, never how far apart.** Template content (JSON) names blocks and their order; it never carries a size or a gap. A view that needs a different rhythm gets it from its layout, block or a template token.
8. **The page content's edges come from the tree (owner Q92, Q93).** The page's top-level groups are the header, the page content and the footer, so the invariant applies there too: the page content's units sit no further from one another than the page content sits from the header and the footer. Otherwise its last unit (a closing invitation, a list's last row) reads as part of the footer and its first as part of the header. A frame is one unit: measure from its outer edge and ignore the space inside it. SiteLayout builds it with the column's padding-block at the page level, the same as the gap between its units; any other page layout gets it the same way, from the tree, not from a page-specific rule.

### The rhythm: five levels

| Level | What sits at this distance | Role | Compact | Normal | Loose | Extra loose |
| --- | --- | --- | --- | --- | --- | --- |
| Pair | Reads as one thing: eyebrow and title, label and value, title and subtitle, name and role | `space.stack-pair` | 4 | 4 | 4 | 8 |
| Item | Members of one group: a title and its intro, a card's heading and text, list rows | `space.stack-item` | 8 | 8 | 12 | 16 |
| Group | Groups inside a section: cards in a grid, fields in a form, a hero's message and its lead | `space.stack-group` | 12 | 16 | 24 | 32 |
| Section | A section's head to its content and between its parts; a hero's words to its actions | `space.stack-section` | 24 | 32 | 48 | 64 |
| Page | The page content's units (a site's bands, a library page's sections), and the page content from the header and footer | `space.stack-page` | 48 | 64 | 96 | 128 |

Values are CSS px at a 16 px root. The `stack-page` role is new in Q85 (it replaced a bare `space.16` on PageLayout and the section-level gap on SiteLayout); `space.24` and `space.32` were added to the scale for the loose and extra-loose page level. `tools/space-shape.mjs` checks, in every density, that sections sit at least twice the group space apart and pages at least twice the section space.

Inline space follows the same idea (`inline-pair` < `inline-item` < `inline-group` < `gutter`); insets are a separate family (`inset-sm` < `inset-md` < `inset-lg`) that never grows with nesting.

### Choosing a value

For every space, answer in order; the first answer that settles it wins.

1. **Which relationship?** Inside a container's edge (inset), stacked (stack), side by side (inline), between columns (gutter), content to the window (page margin).
2. **Which level?** Read it from the hierarchy tree ([the method](#the-method-hierarchy-first-then-space-and-frames-owner-q93)): the depth of the group whose children this space separates (pair, item, group, section or page, table above). If two things are at different levels, they get different gaps, even when they're siblings in the content.
3. **Check its neighbours.** Is it smaller than the gap around its group (at least 1.5 times, ideally 2)? Above a heading at least twice the space below? Inside an enclosure no more than the inset?
4. **No level fits?** The structure has a level too many (flatten it, or group with a heading or an enclosure), or a part of a component needs a wrapper so its levels can differ (below). Never a literal or a nudge.

### Anatomy of the common shapes

Each shape gives its levels a wrapper of their own, so one parent `gap` never has to serve two levels.

| Shape | Structure | Gaps (normal) |
| --- | --- | --- |
| Site page (SiteLayout) | header · page content (a column of units) · footer | units `stack-page` 64; the column's padding-block `stack-page` 64, so the page content sits from the header and footer at least as far as its units sit from one another (principle 8) |
| Library page (PageLayout) | page header · sections | sections `stack-page` 64 |
| Section | **head** (heading, intro) · **content** (its parts) | head: heading → intro `stack-item` 8; head → content `stack-section` 32; between the content's parts `stack-group` 16, so the head leads them all |
| Nested section | head · content, inside another section's content (one of its groups) | head: `stack-pair` 4; head → content `stack-item` 8; content's parts `stack-item` 8; sibling groups `stack-group` 16 apart in the outer content |
| Hero | words (**message**: heading part, lead · **doing**: actions, note) · picture | eyebrow → title `stack-pair` 4; title → lead `stack-group` 16; message → doing `stack-section` 32; actions → note `stack-pair` 4; words ↔ picture `stack-section` |
| Card | media (bleeds) · body (heading part, text, actions) | body inset `inset-md` 16; eyebrow → title `stack-pair` 4; heading → text `stack-item` 8 |
| Card grid, statistics | items in rows | `stack-group` 16 (below the section's 32) |
| Form | fields · actions | fields `stack-group` 16; label → field → hint `stack-pair` 4 |
| Quote | text · attribution (avatar, name, role) | text → attribution `stack-group` 16; name → role `stack-pair` 4 |

### Who owns each space

- **Layouts** (tier 3) own the page level: the gap between bands or sections, the page margin and the column width.
- **Compounds** (tier 2) own their internal levels through parts (`data-dl-part="head"`, `"message"`, `"doing"`) and component tokens (`--c-section-gap`, `--c-hero-words-gap`), each aliasing a role.
- **Fundamentals** (tier 1) own only their own insets; they never add space outside their box.
- **Templates** choose a density (`space-shape.config.json` or a template token file) and a layout; their content never carries space.

### Density and small windows

Density changes every role at once (the table above), so the five levels and their ratios survive. Below the `sm` breakpoint the page margin stays `space.margin-page`; levels don't collapse into one, and nothing scrolls sideways at 320 CSS px.

### Framing: presenting one piece of content

Grouping space answers *what belongs together*; **framing** answers *how one piece of content is presented so it stands on its own* (owner Q88, 2026-11-09). A quote, a statement, a statistic, a call to action, a showcase picture or a page's opening isn't just the next group in the flow: it gets a frame, its own room sized to the window and isolated from what's around it, so it's read without distraction and makes sense alone. It's steps 3 and 4 of [the method](#the-method-hierarchy-first-then-space-and-frames-owner-q93), in [one model](#one-model-a-frame-is-a-unit-outside-and-a-root-inside-owner-q94) with grouping: the tree names the units, framing decides which one is presented alone, the frame stays one unit at its parent's gap, and the method runs again inside it.

Grounded in: Mark Boulton's *active* macro whitespace, space added around one element to draw the eye to it, versus the passive space that only gives breathing room ([A List Apart, "Whitespace"](https://alistapart.com/article/whitespace/)); Jan Tschichold's "whitespace is an active element, not a passive background" ([IxDF, Negative space](https://ixdf.org/literature/topics/negative-space)); common region: a background tone groups and separates a region, but overuse creates clutter ([NN/g, Common region](https://www.nngroup.com/articles/common-region/)); visual hierarchy by scale, contrast and grouping ([NN/g, Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)); the false floor: full-screen heroes and vast empty bands read as the end of the page unless the next content peeks in ([NN/g, Illusion of completeness](https://www.nngroup.com/articles/illusion-of-completeness/)); sizing to the window with `svh`/`dvh` units, which account for mobile toolbars ([web.dev, viewport units](https://web.dev/blog/viewport-units)); interpolating space between a small and a large screen instead of jumping at breakpoints ([Utopia, fluid scales](https://utopia.fyi/blog/designing-with-fluid-type-scales/)); and keeping a quotation short and set apart rather than a dumped block ([Butterick, Block quotations](https://practicaltypography.com/block-quotations.html)).

**When to frame.** Frame a piece when it is *one thing to read or look at on its own*, and the page is better if the reader pauses on it: a testimonial or pull quote, a single statement or statistic, a call to action, a showcase picture or video, a page's opening (hero) or a status screen's message. Don't frame lists, grids, forms, navigation, settings or anything a person works through; they flow at the grouping levels. At most one **stage** per page, and two frames never sit next to each other (two spotlights in a row are a flow again).

**Frame only what gains from it: the context decides (owner Q91).** A frame isolates its piece, and isolation interrupts reading: the reader stops, takes the piece in alone, then has to find their way back into the page. That pays only when the piece is worth meeting alone. A page title isn't: a Tickets or Schedule page that opens with its title and intro alone in a window-high stage makes people scroll past an empty screen to the ticket choice or the day tabs they came for, and splits the heading from the content it introduces. Before framing anything, answer in order; the first "no" means don't frame it:

1. **What does the reader gain from seeing this alone?** A statement with weight (a brand opening, a manifesto line, a quote), an invitation that closes a page, or a message that is the whole page (a status screen). "It's the title" or "it's at the top" is not a gain.
2. **What did the reader come to this page to do?** If the answer is a task or a look-up (choose a ticket, read the schedule, scan a list, fill a form, change a setting, read a detail page), the page's title and intro belong *with* that content, at the grouping levels, and the content starts in the first view.
3. **Would the frame delay that?** If the frame pushes the page's main content below the first view, or separates a heading from what it introduces, it fails, however good it looks alone.

In this library that decision is made once, in content: a hero or a call to action is framed only when its block says `"standalone": true` (a brand opening on a home page; a marketing or editorial page's closing invitation). Quotes and status messages are framed by nature. Everything else flows. Applied: the four home openings (Corporate, Conference, Portfolio, Harbour) and nine closing invitations are standalone; the openings of every task and reference page (Tickets, Schedule, Speakers, FAQ, Careers, Services, About, detail pages, lists) flow with their content, and a call to action on an app page (Dashboard, Members, Trash, My tickets, Voice) is one more step of the work, not a frame.

**Three frames, by how much isolation the piece needs:**

| Frame | For | Space | Window-relative | Ground |
| --- | --- | --- | --- | --- |
| **Flow** (no frame) | Ordinary sections, grids, lists, forms | The grouping levels only | No | None |
| **Feature** | A quote, a statement, a statistic, a call to action, a single picture in a long page | `space.frame-feature` above and below, inside the band: fluid between the page level (64 px) at 320 px wide and twice it (128 px) on a wide window | Space grows with the window's width and height (`clamp` with `svh`) | Optional quiet tone (`color.bg-sunken`) edge to edge, when space alone can't separate it from busy neighbours |
| **Stage** | A page's opening, a showcase, a status screen's message | Its least height a share of the window: `size.frame-stage` (about 70 % of the small viewport height), content centred in it | Yes (`svh`, so mobile toolbars never hide it) | Its own picture or none |

**Two modes, by what the reader should do next (owner Q90).** Every frame is in one of two modes:

| Mode | What the reader sees | Use it when | How it answers the window |
| --- | --- | --- | --- |
| **Peek** (default) | The piece, framed, with part of the next (and, scrolled, the previous) content in view | More content follows that the reader should explore: a page's opening, a quote or call to action between sections, a sequence of slides or cards (a Carousel's `peek` shows part of the next item sideways) | A stage takes about 70 % of the window and always leaves at least `c.frame.peek` (48 px) of the next band showing, below the measured header; a feature's band stays shorter than the window less the header and that peek |
| **Distraction-free** | Only the piece, centred in the window below the header; nothing else in view until the reader scrolls | The piece is the page's whole point and nothing follows that competes with it: a status or error screen, a confirmation, a maintenance notice, a single message or showcase meant to be read alone | It fills exactly the window below the header (the layout's own space above and below included), with the content centred; it never steps down, because it has no neighbours to crowd and its least height is the window, so it never forces a scroll |

Choose by the page, not the piece: the renderer frames a stage **distraction-free when it's the only block in its region** and **peek when more follows**; features are peek. The layout tells the frame what it shares the window with: SiteLayout measures its sticky header into `--dl-chrome-block` and gives its first space as `--dl-frame-start`; outside a layout both are 0 and a frame answers the plain window.

**Rules.**

1. **Framing is the unit's room, not a gap.** A frame is the band's own padding (and optional ground), set by the layout's Frame part, between the unit's edge and its content; the gap between units stays the parent's (the page level between the page content's units). So the isolation a reader sees around a framed piece is the parent's gap plus the frame's room, while grouping, measured at the edges, is unchanged.
2. **Isolate by space first, tone second, never a box.** A feature's isolation is space; add the quiet ground only when its neighbours are dense (a card grid, a footer). A ground spans the window edge to edge (a band, not a card) and carries no border or shadow: one mechanism per boundary, coherent with the `visual-noise` skill and the elevation ladder ([Materials](materials.md#elevation-one-ladder)): framing stays on the page plane (elevation 0); lifting with a shadow is for overlays only.
3. **The frame fits the window, and in peek mode leaves a peek.** A peek stage is window-relative but never the full window: at least 48 px of the next band shows on first load, so the page never looks finished (NN/g false floor). On a short window (under about 500 px tall) it shrinks to its content. A distraction-free stage is the exception by design: the whole window below the header, because nothing follows it.
4. **Fluid, not stepped.** Frame space interpolates with the window (`clamp(min, preferred svh/vw, max)`), so a phone gets a calm frame and a wide screen a generous one, without breakpoints; it never drops below the page level.
5. **Inside, the method starts again.** The frame's content is its own tree: a framed quote's words and attribution keep their group gap, its name and role their pair gap; the frame never stretches the gaps inside it, and they're compared only with each other.
6. **Make it make sense alone.** A framed piece carries what it needs to be read standalone: a quote has its attribution, a statistic its label and unit, a call to action its one action.
7. **Measure and alignment.** Framed words sit on the reading measure (at most `size.measure`, 42 rem; a quote's own is 40 rem), centred in the column or aligned to the column's start edge: never wider than the column and never out of line with it.
8. **Type steps up.** A framed statement is set at least one step above body (a quote at `size l`, an opening at display) so the frame and the type agree on its importance.
9. **Chrome is not a neighbour to lean on.** A frame is one of the page content's units, so the page content's edges hold for it like any other (principle 8): never nearer the header or the footer than the page level.
10. **Edges in line.** The footer's and the header's content align with the page column, so a frame's centred words, the column and the footer share one set of edges.
11. **Viewport-aware: the frame adapts to the window's width and height (owner Q89).** Size, space and level all answer the window: frame space interpolates with the window's height (`svh`) between the page level and twice it; a peek stage takes about 70 % of a tall window, shrinks to its content on a short one (under 31 rem tall) and never forces an empty screen or needless scrolling; on a narrow window (under 40 rem wide) a peek stage drops to a feature (space below it the page level, above it only what reaches the page level from the header) and a feature drops to flow when its frame space would exceed a third of the window's height (under 24 rem tall). A stage always keeps the page level from the header, even when its content is taller than its share. The level is chosen for the window it's seen in, not fixed in content.
12. **Frame the unit of comprehension, never fragments (owner Q89).** Content that must be read together to be understood is one frame: a quote with its attribution; a statistic with its label, unit and the sentence that explains it; a call to action with its lead and its action; a picture with its caption; an opening with its title, lead and actions. To choose the unit, ask: would a reader who sees only this piece understand it? If not, widen the unit until they would. Never put two frames around parts of one idea (a heading framed apart from its statement, a statistic apart from its explanation), and never frame a piece whose meaning depends on the list or grid it came from: those stay in flow with their group.

### Never

- Space chosen element by element, or by a rule for one kind of page, before the hierarchy tree is written.
- One gap for two levels: a heading, its intro and its content all at the same distance; a hero's title, lead and buttons at one gap; page content's units at the same distance as a section's parts.
- The page content's last unit nearer the footer (or its first nearer the header) than its units are to each other.
- A heading nearer the content above it than its own content.
- A literal or a bare scale step in a component, a margin on a component, sibling-position selectors (`:first-child`, `+`, `* + *`) to make space.
- Space in content JSON or in a view.

## Part 2: the checklist

Each row passes or fails on a measurement. Rows marked **DOM** are measured by `tools/spacing-probe.js`; **static** rows by the named check; **look** rows by an evaluator reading the page. The evaluator starts the way the builder did: by writing the page's hierarchy tree (SC15); SC2–SC5 and SC14 are then the one proximity invariant measured at different nodes of that tree (a head, a group, an enclosure, the page's top level). Severity follows the `spacing` skill: S1 broken, S2 misgrouped, S3 fragile, S4 polish. A view passes when no S1–S3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| SC1 | Every gap and padding inside the content is a step of the space scale (0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px; a control may give back its border width) | DOM | S3 |
| SC2 | Above every heading's head, the space is at least twice the space below it | DOM | S2 |
| SC3 | Every unenclosed group's own gaps are at most 1/1.5 of the gap around it (S4 note between 1.5× and 2×); a row of enclosed items sits closer than the gap around the row | DOM | S2 |
| SC4 | Inside every enclosure (border or fill with padding), no gap between its children exceeds its inset | DOM | S2 |
| SC5 | No stack of three or more parts that includes a heading sits at one equal gap | DOM | S2 |
| SC6 | The page's stacking gaps form at least three distinct levels | DOM | S2 |
| SC7 | Nothing scrolls sideways; content keeps at least the page margin from the window's edges (320 CSS px and wide) | DOM | S1 |
| SC8 | No component (`data-dl`) carries an outer block margin | DOM | S3 |
| SC9 | Space roles hold their ratios in every density (groups ≥ 1.5 × items, sections ≥ 2 × groups, page ≥ 2 × sections; gaps ≤ insets) | static: `npm run tokens:check` (`tools/space-shape.mjs`) | S2 |
| SC10 | No literal or bare scale step for space in component, layout or app CSS outside the token source | static: `npm run check:views` and review of the diff | S3 |
| SC11 | Content JSON carries no size or gap | static: `npm run check:content` (schemas reject unknown fields) | S3 |
| SC12 | Reading top to bottom, an evaluator can name each band, its heading and what belongs to it without relying on borders | look | S2 |
| SC13 | Hover, focus, press, loading and validation move no box | look, or the motion and clipping probes | S1 |
| SC14 | The invariant at the page's top level (principle 8; Q92, Q93): the page content sits from the header and from the footer at least as far as the largest gap between its own units; a frame is one unit, measured from its outer edge | DOM | S2 |
| SC15 | The evaluator can write the page's hierarchy tree (header · page content · footer, then each unit, its head and content, groups, items, pairs) and every group in it is one wrapper whose gap serves only that level: no wrapper mixes two levels, no group is split across wrappers | look | S2 |

### Framing rows

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| FR1 | Every framed piece is isolated: the space from its content to the nearest content outside it (the parent's gap plus the frame's room) is at least 1.5 times the page level (96 px at normal density); the grouping rows judge the frame's edges as a unit's (SC3, SC14) and its content as a tree of its own | DOM | S2 |
| FR2 | A stage is at least half the window's height on a window 700 px or taller, and at least 48 px of the next band is visible on first load | DOM | S2 |
| FR3 | Framed words sit on the reading measure (at most `size.measure`, 42 rem) and inside the column | DOM | S2 |
| FR4 | A frame has no border or shadow; a ground, where there is one, spans the window edge to edge | DOM | S2 |
| FR5 | Centred framed content is centred in the column (left and right space within 2 px) | DOM | S4 |
| FR6 | Nothing framed is closer than the page level to the header or the footer | DOM | S2 |
| FR7 | At 320 px wide, frame space is at least the page level and nothing scrolls sideways | DOM | S1 |
| FR8 | A framed statement's type is at least the heading-3 size | DOM | S3 |
| FR9 | At most one stage per page; no two framed bands are adjacent | DOM | S2 |
| FR10 | Read alone, each framed piece makes sense (attribution, label, unit or action present) | look | S2 |
| FR11 | Header, column and footer content share one start and end edge at every width | DOM | S2 |
| FR12 | Measured at 1600 × 900, 1280 × 720, 768 × 1024, 390 × 844 and 1280 × 480: a peek stage is 50–80 % of the window's height where the window is 700 px tall or more and no taller than its content on a window under 500 px tall; no peek frame's space exceeds a third of the window's height; no window shows only empty frame space; nothing scrolls sideways | DOM at five sizes | S2 |
| FR13 | Each framed unit holds everything it needs to be understood (no heading, attribution, label, unit, caption or action of the same idea outside it), and no two adjacent frames split one idea | look, with the DOM listing each frame's parts | S2 |
| FR14 | A distraction-free frame shows nothing else: a stage's content is centred in the window below the header (within 2 px) with no other content in view on first load and nothing before it in its region; a feature is at least the window's height less the header | DOM | S2 |
| FR15 | A peek frame invites exploring: a peek stage passes FR2, and a peek feature is shorter than the window less the header and `c.frame.peek` (48 px), so its neighbours stay in view (judged where its content alone would fit: a frame gives back its own space, it can't shrink its content) | DOM | S2 |
| FR16 | Context: every frame gains from isolation. A peek stage holds more than a title and an intro (a picture or an action); no task or reference page (tickets, schedule, lists, forms, settings, detail) frames its heading; an evaluator can name what each frame gains (the three questions in part 1) | DOM, and look | S1 |
| FR17 | The task comes first: with frames at the top of a page, the first band of the page's own content still shows at least 48 px in the first view on a window 700 px tall or more, wherever the frames' own space is what pushes it out (content taller than the window is judged by its own rules) | DOM | S1 |

Grouping rows and framing rows divide the space the same way the model does: SC2–SC5 and SC14 treat each `data-frame` element as one unit (measured from its outer edge) and judge the tree inside it from its own root (a heading inside a frame is compared only with content inside it; a group inside it only with gaps inside it); SC1 skips the frame's own room, which the FR rows judge. `tools/spacing-probe.js` measures FR1–FR9, FR11, FR12 and FR14–FR17 on elements marked `data-frame` (the Frame part sets it, with `data-frame-mode`) at the current window, and lists each frame's parts in `frames` for FR10, FR13 and the look half of FR16.

### How to run it

In the browser, on any library page or template layout:

```js
// Playwright: await page.addScriptTag({ path: 'tools/spacing-probe.js' })
const result = window.spacingProbe(); // the main region by default, or a selector
result.rows;   // { SC1: { pass, findings, count }, … }
result.levels; // the distinct stacking gaps, e.g. [4, 8, 16, 32, 64]
```

A sweep runs the probe over every built layout of every template at a wide window and at 320 CSS px, and records the count of failing rows per template in [Results](#results).

## Results

### Baseline, before the fix (2026-11-09 about 10:05, normal density, a 1000 CSS px window)

167 of 168 built template layouts failed at least one row.

| Template | Layouts | Failing | SC1 | SC2 | SC3 | SC5 | SC6 | SC7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Projects | 24 | 24 | 17 | 9 | 11 | 20 | 3 | 4 |
| Harbour | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 |
| Corporate | 29 | 28 | 21 | 12 | 13 | 25 | 3 | 0 |
| Chat | 25 | 25 | 19 | 11 | 13 | 17 | 5 | 3 |
| Conference | 31 | 31 | 17 | 17 | 18 | 25 | 2 | 0 |
| Blog | 22 | 22 | 11 | 7 | 9 | 19 | 3 | 0 |
| Portfolio | 16 | 16 | 9 | 8 | 7 | 14 | 1 | 0 |
| Design | 20 | 20 | 15 | 12 | 13 | 15 | 2 | 5 |

Corporate home, measured: page bands 32 px apart; each section's heading, intro and card grid 24 px apart (SC2: 32 above a heading, 24 below; SC5); the hero's title, lead and actions 16 px apart (SC5).

### After the core fix, F15.SP1 (2026-11-09 about 10:25)

Fixed at the owners, no content changed: the `stack-page` role (SiteLayout bands and PageLayout sections 64 px); Section's new **head** part (heading → intro 8 px, head → content 32 px); Hero's new **message** part (title → lead 16 px, message → actions 32 px); Quote's part selectors scoped to its own children (they were giving a quoted Persona's name and role the paragraph gap). Corporate home now passes every DOM row with the levels 4, 8, 16, 32, 64.

69 of 168 layouts still fail a row; the next packets fix them by root cause.

### SP2 interim (2026-11-09 about 10:35)

Fixed at the owners: Card's new **message** part (heading and description an item apart; content and footer a group below), the `app-layout` view gap at the page level, DescriptionList pairs at the item level, settings groups as a section's direct parts with their switches an item apart, search results an item apart, prose split into runs at each heading (runs a section apart, a quote as its own run), a person's bio in its own group. The probe now skips a control's own metrics and data-driven indents (SC1), allows a 2 px hairline (SC2), judges SC5 only on a compound's own parts where a heading and a block share one gap, and skips content inside a sideways scroller (SC7). **30 of 168 layouts fail a row** (Projects 4, Corporate 2, Chat 9, Conference 5, Blog 2, Portfolio 0, Design 8, Harbour 0); the rest are mostly the Design editor's inspector and the framing work (Q88).

| Template | Layouts | Failing | SC1 | SC2 | SC3 | SC5 | SC6 | SC7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Projects | 24 | 10 | 1 | 3 | 6 | 5 | 1 | 4 |
| Harbour | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Corporate | 29 | 10 | 1 | 3 | 4 | 5 | 1 | 0 |
| Chat | 25 | 14 | 3 | 3 | 9 | 2 | 3 | 3 |
| Conference | 31 | 9 | 0 | 6 | 4 | 5 | 0 | 0 |
| Blog | 22 | 10 | 1 | 2 | 5 | 6 | 0 | 0 |
| Portfolio | 16 | 6 | 0 | 2 | 1 | 5 | 0 | 0 |
| Design | 20 | 10 | 4 | 4 | 8 | 4 | 2 | 5 |

### F15.SP-page: the page level and the section anatomy (2026-11-09 about 12:00)

Fixed at the owners: SiteLayout's padding-block is now the page level (`c.site-layout.padding-block` → `space.stack-page`), so the title bar → first unit and last unit → footer are never less than the bands' 64 px gap (principle 8, SC14; owner Q92: Conference home's closing invitation sat about 40 px above the footer). Section's content got its own part: head → content stays the section level, the content's parts sit a group apart, and a nested section (one group of the outer one) has its head an item above its rows, so settings pages read h2 → groups → rows instead of one equal 32 px. The probe adds SC14, judges SC3 against a group's sibling groups (not its own head), exempts an accordion's trigger headings from SC2 and judges SC6 only on pages with two or more headings. **17 of 168 layouts fail a grouping row** (29 before); SC14 passes on every page.

### F15.SP-fp: restated from first principles (2026-11-09 about 11:45, owner Q93)

The framework now starts from [the method](#the-method-hierarchy-first-then-space-and-frames-owner-q93): map the page's information hierarchy as a tree of groups, then give each group one gap by its depth and frame only units that gain from isolation. The [terms](#terms) are exact: the *page* is the whole thing; *page content* is everything apart from the header and footer, and it comes out of the tree as one of the page's three top-level groups. Principle 8 and SC14 are now the proximity invariant applied at that top level, not a page-specific rule; SC15 (look) asks the evaluator to write the tree and match each group to one wrapper. The agent guide follows the same order (`principles.json` → `guide/7-principles.md`: "Hierarchy first"). No values changed.

### F15.SP-unit: spacing and framing as one model, and the grouping fails by root cause (2026-11-09 about 12:20, owner Q94, Q85.4)

- **One model (Q94):** [Terms](#terms) define a frame; [the method](#the-method-hierarchy-first-then-space-and-frames-owner-q93) gains step 4 (inside a frame, start again); [One model](#one-model-a-frame-is-a-unit-outside-and-a-root-inside-owner-q94) says why a frame's room doesn't defy grouping. Framing's guideline now sits in Part 1, its rows in Part 2 ([Framing rows](#framing-rows)) and its as-built notes here; framing rules 1, 5 and 9 and row FR1 are restated in unit terms. The probe treats a `data-frame` element as one unit outside (an atom at its outer edge) and the root of its own tree inside (SC2 and SC3 stop at it). The agent guide adds the rule (`principles.json` → `guide/7-principles.md`), and Frame's own docs say it.
- **Fixed at the owners (core first):** PropertySection's rows are their own part (head → rows, rows apart: no stack mixes two levels); ChatMessage splits a reply into runs at each heading (a run's blocks an item apart, a heading leading a body part; the reply's thinking, runs, files and actions a group apart, `c.chat-message.reply-gap`; a list inside a reply keeps its items a pair apart, `c.chat-message.list-gap`); the Design inspector gives each field of a one-column row its own row and marks the selection's name as the panel's head; Conference sponsors' intro units sit at the page level (`t.conference.sponsors-layout.stack-gap`).
- **Probe, measuring what the eye sees:** a boundary is a border or fill whether its padding is on itself or one level down (an outlined card); a heading is judged inside its own surface (a scroll region, an enclosure or a frame), not against the bar above it; a tree's rows keep one rhythm (depth by indent, spacing rule 4); a tab bar is its panel's head; legends, drawn shapes and visible boundaries count as atoms; an optical lift (`--dl-optical: lift`, Alert's first-line alignment) isn't a gap; surfaces may bleed to the window's edge (SC7 judges content).
- **Sweep** (168 layouts, 1000 × 800): **4 fail a grouping row** (17 before): Design drafts (SC6), Projects backlog (SC5) and Projects issue and issue-edit (SC2, SC3). Next packet.

### F15.SP-last: the last four (2026-11-09 about 12:00, Q85.4)

- **AppLayout's head slot (core):** a view is head · content; the title is one of the view's units at the page level (`c.app-layout.head-gap` = `space.stack-page`), so each section's own head stays nearer its content than the title. Projects board, backlog and issue use it; the issue's Description is now a sibling section of Done when and Comments (the Morph swaps it with the fields; the head says "Edit").
- **Probe:** SC6 counts only headings that head flow content (a card's or a statistic's title names an item); a heading's head is the outermost head part within two levels; a Persona counts as one visible unit.
- **Sweep:** 167 of 168 pass every grouping row. Open: Projects issue-edit, where "Done when" sits 38 px under the edit form (the Morph's box looks to hold the view's height in the edit state; the fix belongs in Morph).

### Framing as built, F15.SP-frame2 (2026-11-09 about 10:55)

- New core layout part **Frame** (`packages/core/react/layouts/Frame.tsx`, `css/layouts/frame.css`, tokens `c.frame.space-min` = `space.stack-page` and `c.frame.ground` = `color.bg-sunken`): `kind="feature"` pads the band `clamp(page level, 12svh, 2 × page level)` above and below; `kind="stage"` holds `min(70svh, 100svh − 7rem)` with the content centred and shrinks to its content under a 31 rem tall window; `ground` paints an edge-to-edge tone with `border-image` outset (no negative margin, no clip).
- The renderer frames by block type, so every template gets it with no content change: `quote` and `cta` are features; the first `hero` of a page is its stage (a later one a feature); `status` (error and maintenance screens) is a stage.
- SiteLayout aligns the footer's content with the page column (FR11): on a 1600 px window the first card and the first footer link both start at 219 px (before: the footer's at 16 px).
- Portfolio home measured at 1600 × 867: the stage is 607 px (70 %) with 100 px of the next band showing; the quote sits 144 px below the last card and 112 px above the footer (FR1 needs 96).
- Sweep after framing: 29 of 168 layouts fail a grouping row (no regression). The probe doesn't measure FR1–FR11 yet (next step).

### Framing as built, F15.SP3: step-down, the two modes and the probe (2026-11-09 about 11:05)

- **Two modes (Q90)** on the Frame part: `mode="peek"` (default) and `mode="distraction-free"` (`data-frame-mode`). The renderer chooses by the page: a stage alone in its region (every status, error, maintenance and sold-out screen: 13 layouts) is distraction-free; a stage with more to come, and every feature, peeks. SiteLayout measures its sticky header into `--dl-chrome-block` and gives its first space as `--dl-frame-start`, so a peek stage always leaves `c.frame.peek` (48 px, new token) of the next band below the real header, and a distraction-free stage fills exactly the window below it with its content centred and no scroll.
- **Step-down (Q89 rule 11)** built: under 40 rem wide a peek stage becomes a feature (space below the page level; above, only what reaches the page level from the header); under 31 rem tall it shrinks to its content; under 24 rem tall a feature drops to flow. A stage keeps the page level from the header even when its content is taller than its share (stage padding). Feature space is now fluid by the window's width as well as its height (the page level up to a 25 rem window, twice it from 80 rem, never over 12 % of the height), so a tall phone no longer gets a wide screen's space.
- **Framing the unit (Q89.2)** in the renderer: framing applies only to a page's `main` region (the Conference sponsors page's side-column intro no longer frames its hero), and a feature right after a framed block stays in flow (FR9: Conference home's call to action after its quote).
- **Probe:** `tools/spacing-probe.js` now runs FR1–FR9, FR11, FR12, FR14 and FR15 and lists each frame's parts (`frames`) for FR10 and FR13.
- **Sweep** (every built layout at 1000 × 800; the framed ones at the five FR12 sizes): 64–66 layouts framed, 13 distraction-free. Framing rows fail on 1600 × 900: 1 (Corporate about), 1280 × 720: 2, 768 × 1024: 0, 390 × 844: 1, 1280 × 480: 1. Open: **Corporate about** and **Portfolio project** open with a stacked hero whose picture alone is taller than the window, so no peek (FR2, FR12; the next step is a media seam so a framed picture gives way to the window); **Corporate news article** misses FR15 by 3 px on a phone. Grouping rows: 29 of 168 layouts still fail one (unchanged; next packet). Seen in passing at 390 px (SC7, not framing): Blog and Corporate search buttons 7 px from the edge (open); Conference sponsors scrolled 12 px sideways because SponsorsLayout's intro track kept its width when stacked (fixed: `minmax(0, intro width)`).

### Framing as built, F15.SP-ctx: context-aware framing (2026-11-09 about 11:35)

- **Context decides (Q91):** the hero and cta blocks take `"standalone": true` (schema and types); without it they flow. Set on the four home openings and nine marketing or editorial closing invitations; quotes and status messages frame by nature. Pages with a frame went from 66 (every opening a stage, every call to action a feature) to 26 of the 131 pages with an opening: 4 brand stages, 13 distraction-free status screens and closing features. Conference Tickets and Schedule now open with their title and intro over the ticket choice and the day tabs, in the first view (the day tabs start 295 px down a 720 px window).
- **A framed opening's picture sits beside its words** (the renderer arranges a framed hero with a picture as split; its container still stacks it when narrow), and a stage measures where it starts (`--dl-frame-top`: header, first space, breadcrumbs), so its peek holds under breadcrumbs too.
- **Guidance:** the decision rule is in part 1 above, rows FR16 (context) and FR17 (the task first) in part 2 and the probe, and the agent guide's Spacing rules and decision procedure (`packages/core/principles/principles.json` → `guide/7-principles.md`, `Frame` and the block docs in `agent/`).
- **Sweep** (131 built pages with an opening, at 1280 × 720 and 390 × 844): no framing row fails.

## The two-part frameworks

Every UX framework in this project has the same two parts: the framework to design with, and a checklist of measurable rows to judge with. Spacing and layout rhythm is the first written in this shape; the others follow it.

## The adversarial loop

Create with part 1, judge with part 2, by someone who didn't build it: the evaluator scores every row with its evidence (a measurement, a probe result or a screenshot), the builder fixes the failing rows at their owner (token, layout, compound, then content), and the loop repeats until no S1–S3 row fails.

## Sources

- agentic-craft `spacing` skill and its references (tokens, rules by element, audit, enforcement, sources), installed in `.github/skills/spacing/`.
- Gestalt law of proximity; WCAG 2.2 1.4.10 Reflow, 1.4.12 Text spacing, 2.5.8 Target size (via the skill's sources).
- This library: `packages/core/tokens/space-shape-options.json`, `tools/space-shape.mjs`, `tools/spacing-probe.js`.
