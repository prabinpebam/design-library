# Brand colour: which part takes which colour, and how much

**In the library:** nothing yet. This page is a framework and spec for review (strict design, documentation only: [DoD Q131 and Q132](definition-of-done.md#owner-instructions)). No token, component or library page has changed. What the colour model and the core would need is in [Config, tokens and core](#config-tokens-and-core); the library control is specified in [The control](#the-control).

> **TL;DR:** Each brand colour is a **column**, and there is one more column, **Neutral**. Every coloured part of the UI sits in exactly one column and takes that column's colour: the button fill, the switch handle, the focus ring, a brand band. Parts come in **seven preset groups**: Primary elements, surfaces and accents; Secondary elements, surfaces and accents; and Highlights. In the library you drag a whole group, or a single part, to another column.
>
> - Group names say how **prominent** a part is, never which colour it gets. Colours keep their numbers 1–4.
> - **Presets** place the groups for one, two, three or four colours.
>   - With one colour, every group takes it.
>   - With two, the first colour that can carry controls takes the Primary groups. The other takes the signature: IKEA's yellow ring inside a blue button, the yellow handle on a blue switch.
>   - A third colour takes Highlights. A fourth starts as identity only.
> - **Any map is safe.** Each part is checked against what it sits on, in light, dark and more contrast.
>   - When the colour fails, the part tries nearby steps of the same colour.
>   - When those fail too, it shows its **plain look** and the control says so.
>   - IKEA yellow on the blue switch passes in light (3.7:1) and falls back in dark (2.3:1).
> - Maps that work but read badly, like actions split across colours or more than three signature marks, get a **note**, never a block.
> - **How much** colour depends on the surface.
>   - A brand surface (a hero, a campaign) can be 60–75% brand colour, like the Coca-Cola and Pepsi boards.
>   - A product screen stays 80–90% neutral.
>   - Status colours are never brand colours.
>
> Agents: run the [procedure](#the-procedure), then the [checklist](#part-2-the-checklist).

**Owner, 2026-11-11 09:42 (verbatim, [DoD Q131](definition-of-done.md#owner-instructions)):** *"We need an ui-element to brand-color mapping strategy. In case of single color, it's simple, map all elements that needs color to the brand color. In casse of 2, one color can be primary and the other can be secondary, and a third color can be tertiary. A btn can for example be blue color with yellow border. A switch toggle can be blue fill with yellow handle. This blue and yellow combination can make it look the Familiar Ikea brand where their brand color is blue and yellow. De a deep research on color theory for layout and composition. How do you distribute percentage of color in a given layout for proper use of color in a palette to represent the brand. Refer the Pepsi vs Cocal Cola example. Do deep research and Document this framework and spec in slate. No implementation coding yet."*

**Owner, 2026-11-11 10:34 (verbatim, [DoD Q132](definition-of-done.md#owner-instructions)):** *"We want to expose this as control in the Design library. - User can pick more than one color as brand color - There should be preset mappings defined for each color. - Imagine each color is represented as a column and in each column you can select which elements of the UI is mapped to used that color - These UI elements would already be pre-defined as preset groups of elements - I can drag an individual element, or the whole group from one column to another colum to map those elements to the color of the other column. - The preset groups of UI elements that I believe people would want to control separately are - Primary elements - Primary surfaces - Primary accents - Secondary elements - Secondary surfaces - Secondary accents - These would be stuff like toggle switch handles - Button border colors etc. --- Work this out to complete and extend it and make it coherent and not break and self contradict in certain places. Update the spec and documentation first."*

**How Q132 changes Q131.** Q131 proposed primary, secondary and tertiary as roles that colours play. Q132 puts the choice on the parts instead: the map. The two don't conflict:

- The owner's "one colour is primary, the other secondary" is now the **Signature** preset.
- "A third colour can be tertiary" is the **Highlights** group.
- The "blue button with yellow border" and "blue fill with yellow handle" are two of the Secondary accents.

What was dropped: a colour is never called primary or secondary, because F7d keeps colours numbered. Group names describe parts.

Like every UX framework here it has two parts: [the framework](#part-1-the-framework) to build with and [the checklist](#part-2-the-checklist) to judge with ([the two-part frameworks](spacing.md#the-two-part-frameworks)). It sits on [the colour model](foundation.md#colour-model) and changes nothing in it yet. Status: strict design, not approved.

<figure class="slate-figure">
  <svg viewBox="0 0 960 416" role="img" aria-labelledby="bcb-title bcb-desc" data-slate-svg-motion="viewport" data-slate-safe-margin="24"><title id="bcb-title">Share of area by colour: theory, the owner's brand boards, and the proposed budgets</title><desc id="bcb-desc">Six stacked bars, each 100% wide. Itten's harmonious balance puts blue at about 73% and yellow at 27%. The Coca-Cola board is about 65% red, 25% white and 10% black. The Pepsi board is about 75% blue, 20% white and 5% red. The FILA board is about 65% navy, 25% white and 10% red. The proposed brand-surface budget is 60% blue as the lead colour, 30% neutral and 10% yellow as the second colour. The proposed product-screen budget is 88% neutral, 9% blue and 3% yellow.</desc><g id="bcb-itten" data-slate-svg-step="0" data-slate-svg-effect="fade-rise"><text x="24" y="46" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Itten, harmonious</text><text x="24" y="66" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">yellow : blue = 3 : 8</text><rect x="320" y="34" width="447.8" height="32" fill="#0058A3"/><text x="332" y="55" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="14" font-weight="700">Blue 73%</text><rect x="767.8" y="34" width="168.2" height="32" fill="#FFDB00"/><text x="779.8" y="55" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">Yellow 27%</text><rect x="320" y="34" width="616" height="32" fill="none" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/></g><g id="bcb-coke" data-slate-svg-step="1" data-slate-svg-effect="fade-rise"><text x="24" y="110" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Coca-Cola board</text><text x="24" y="130" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">owner mock-up, brand surface</text><rect x="320" y="98" width="400.4" height="32" fill="#F40009"/><text x="332" y="119" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">Red 65%</text><rect x="720.4" y="98" width="154" height="32" fill="#FFFFFF"/><text x="732.4" y="119" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">White 25%</text><rect x="874.4" y="98" width="61.6" height="32" fill="#111111"/><rect x="320" y="98" width="616" height="32" fill="none" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/></g><g id="bcb-pepsi" data-slate-svg-step="2" data-slate-svg-effect="fade-rise"><text x="24" y="174" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Pepsi board</text><text x="24" y="194" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">owner mock-up, brand surface</text><rect x="320" y="162" width="462" height="32" fill="#004B93"/><text x="332" y="183" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="14" font-weight="700">Blue 75%</text><rect x="782" y="162" width="123.2" height="32" fill="#FFFFFF"/><text x="794" y="183" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">White 20%</text><rect x="905.2" y="162" width="30.8" height="32" fill="#C9002B"/><rect x="320" y="162" width="616" height="32" fill="none" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/></g><g id="bcb-fila" data-slate-svg-step="3" data-slate-svg-effect="fade-rise"><text x="24" y="238" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">FILA board</text><text x="24" y="258" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">owner mock-up, brand surface</text><rect x="320" y="226" width="400.4" height="32" fill="#002D62"/><text x="332" y="247" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="14" font-weight="700">Navy 65%</text><rect x="720.4" y="226" width="154" height="32" fill="#FFFFFF"/><text x="732.4" y="247" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">White 25%</text><rect x="874.4" y="226" width="61.6" height="32" fill="#E31837"/><rect x="320" y="226" width="616" height="32" fill="none" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/></g><g id="bcb-brand" data-slate-svg-step="4" data-slate-svg-effect="fade-rise"><text x="24" y="302" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Brand surface</text><text x="24" y="322" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">proposed budget, IKEA colours</text><rect x="320" y="290" width="369.6" height="32" fill="#0058A3"/><text x="332" y="311" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="14" font-weight="700">Blue 60%</text><rect x="689.6" y="290" width="184.8" height="32" fill="#FFFFFF"/><text x="701.6" y="311" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">Neutral 30%</text><rect x="874.4" y="290" width="61.6" height="32" fill="#FFDB00"/><rect x="320" y="290" width="616" height="32" fill="none" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/></g><g id="bcb-product" data-slate-svg-step="5" data-slate-svg-effect="fade-rise"><text x="24" y="366" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Product screen</text><text x="24" y="386" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="14">proposed budget, IKEA colours</text><rect x="320" y="354" width="542.1" height="32" fill="#FFFFFF"/><text x="332" y="375" fill="#111111" font-family="var(--font-family-base)" font-size="14" font-weight="700">Neutral 88%</text><rect x="862.1" y="354" width="55.4" height="32" fill="#0058A3"/><rect x="917.5" y="354" width="18.5" height="32" fill="#FFDB00"/><rect x="320" y="354" width="616" height="32" fill="none" stroke="var(--color-neutral-stroke-2)" stroke-width="1.5"/></g></svg>
  <figcaption>Brand surfaces can be mostly brand colour; product screens are mostly neutral, with a little of the lead colour and less of the others. The boards are the owner's AI-made mock-ups (midpoints of their suggested ranges), not brand guidelines; the last two rows are proposals.</figcaption>
</figure>
<details class="slate-figure-data">
  <summary>Data</summary>
  <table>
    <thead><tr><th>Row</th><th>Dominant</th><th>Second</th><th>Accent</th><th>Source</th></tr></thead>
    <tbody>
      <tr><td>Itten, harmonious yellow and blue</td><td>Blue 8 parts (73%)</td><td>Yellow 3 parts (27%)</td><td>None</td><td>Itten, <em>The Elements of Color</em>, pp. 59–60</td></tr>
      <tr><td>Coca-Cola board</td><td>Red 60–70%</td><td>White 20–30%</td><td>Black 5–10% (text and contrast)</td><td>Owner's mock-up</td></tr>
      <tr><td>Pepsi board</td><td>Blue 70–80%</td><td>White 15–25%</td><td>Red 5–10%</td><td>Owner's mock-up</td></tr>
      <tr><td>FILA board</td><td>Navy 60–70%</td><td>White 20–30%</td><td>Red 5–10%</td><td>Owner's mock-up</td></tr>
      <tr><td>Brand surface (proposed)</td><td>Lead colour 50–70%</td><td>Neutral 20–40%</td><td>Second colour 5–15%, others under 5%</td><td>This page</td></tr>
      <tr><td>Product screen (proposed)</td><td>Neutral 80–90%</td><td>Lead colour 5–15%</td><td>Second colour under 5%, others under 2%</td><td>This page</td></tr>
    </tbody>
  </table>
</details>

## Part 1: the framework

### The brand map

The brand map says which column each coloured part takes. It is part of the theme: one map for the whole product, so a part looks the same on every screen.

| Term | Meaning |
| --- | --- |
| **Brand colour** | One of up to four colours in the theme, numbered 1–4: numbers, never ranks (F7d). Each has a seed, a name and a generated ramp of steps 50–950. The generator places the seed at its own step: IKEA blue `#0058A3` lands on 600, IKEA yellow `#FFDB00` on 200. |
| **Column** | A place parts can go. There is one column per defined brand colour, plus **Neutral**, which is always last. An undefined colour has no column. A colour whose column holds no parts is identity only: logo, illustration, campaign. |
| **Part** | One coloured job in the UI, such as *Switch handle* or *Focus ring*. There are 23 parts, a closed list ([below](#the-parts)). A part's states (hover, pressed) move with it. |
| **Group** | A preset set of parts that people usually move together. There are seven groups. Which group a part belongs to is fixed; the column the group sits in isn't. |
| **Ground** | What the part sits on. That is either a page surface, a brand surface (a band or a feature panel), or another part: the switch handle sits on the On fill. |
| **Kind** | One of fill, tint, line, text, mark, surface or decoration. The kind sets the contrast need and the plain look. |
| **Tone** | Which steps of the column's ramp the part reads. **Action tone** is the steps today's accent reads (500 in light, 400 in dark, with 600 and 700 for hover and pressed, and 600 for text), used for controls. **Brand tone** is the seed's own step, used for bands, panels, signature marks and highlights, so the colour looks like the brand. |
| **Need** | The contrast the part must hold against its ground: 4.5:1 for text; 3:1 for fills, lines and marks that identify a control or its state; none for tints, surfaces and decoration (their own text still needs 4.5:1). |
| **Plain look** | What the part shows with no brand colour. It is built from its ground's on-colours, so it always passes. |
| **Action colour** | The colour of the column holding *Action fill*. The control tags that column "Actions". |

The library holds action and checked fills to 3:1 against the page. That is stricter than WCAG, which doesn't require a boundary when a button's text identifies it. The colour model already holds fills to it.

<!-- BOARD-FIGURE -->

### Groups, not ranks

F7d numbers colours and rules out ranking them (*"we won't refer to them as Primary, secondary and tertiary"*). The owner's group names use primary and secondary for **parts**: how prominent the part is. Material 3 uses the words the same way: a *primary* key colour is "used for main components like prominent buttons, active states, and the tint of elevated surfaces", and a *secondary* key colour is "used for less prominent components in the UI, such as filter chips, and expands the opportunity for color expression" ([Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)).

So:

- **Groups name prominence.** "Primary elements" means the most prominent controls, in whichever column they sit. Put them in Neutral and they are still Primary elements.
- **Colours keep numbers and names.** Never call a colour primary or secondary. Say "colour 2", "the yellow" or "the action colour".
- **Components read part roles** (`color.map.<part>`), never a colour number.
- **A colour's role is the parts in its column.** No separate role setting is needed, so nothing can disagree with the map.

### The groups

The owner's six groups, plus **Highlights**, which completes them. Highlights is where Q131's "tertiary" goes: the rare marks that say "look here, once". Each group holds parts that read as one decision.

| Group | Holds | Why it moves as one | One colour | Two colours (IKEA) |
| --- | --- | --- | --- | --- |
| **Primary elements** | Filled actions, on and checked states, links, focus | One colour means "act here, this is on, this has focus" | Colour 1 | Blue |
| **Primary surfaces** | Tints behind selection, the brand band | The surfaces that frame the action colour | Colour 1 | Blue |
| **Primary accents** | Selection indicators, marks on fills, progress, brand text, drop targets | Small marks that point at the current item or activity | Colour 1 | Blue |
| **Secondary elements** | Chosen segment, selected chips, brand badges, rating | Less prominent controls, where a second colour can add expression | Colour 1 | Blue: yellow is too light for controls on white |
| **Secondary surfaces** | Feature panel, feature tint | Areas that feature content without being actions | Colour 1 | Yellow |
| **Secondary accents** | Button ring, switch handle, band indicator | **The signature**: a second colour on a few parts of the action colour | Colour 1 (shows plain) | Yellow |
| **Highlights** | Highlight badge ("New"), illustration accents | Rare marks, a few per screen | Colour 1 | Yellow; a third colour when there is one |

If the only colour can't carry controls, as with a lemon-only brand, the elements groups and Primary accents go to Neutral instead ([Presets](#presets)).

### The parts

Every part, with what decides its colour. A part not in this list stays neutral. "New" means the part needs a new hook in the core ([Config, tokens and core](#config-tokens-and-core)).

| Part | Group | Where it shows | Ground | Kind, tone | Needs | Plain look | Today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Action fill** | Primary elements | Primary Button fill (rest, hover, pressed), fill progress | Page | Fill, action | 3:1 | Near-black fill on light, near-white on dark; label in the opposite | `color.accent` |
| **On fills** | Primary elements | Switch track (on), Checkbox and Radio (checked), Slider fill and thumb, Calendar and picker chosen day | Page | Fill, action | 3:1 | As Action fill | `color.accent` |
| **Links** | Primary elements | Link text, Pagination links | Page | Text, action | 4.5:1 | Body text colour, underline kept | `color.text-link` |
| **Focus ring** | Primary elements | Every focusable part | Any surface | Line, action | 3:1 on every surface | Body text colour | `color.focus` |
| **Selected tint** | Primary surfaces | Selected rows, current nav item, current page, pressed and expanded buttons, selected tab layer | Page | Tint, action | None: its indicator or text carries the state | Neutral selected tint (text colour at low alpha) | `state.selected` |
| **Brand tint** | Primary surfaces | FileUpload drag-over, date and time segments, fill-progress track | Page | Tint, action | None | Neutral tint | `color.accent-subtle` |
| **Brand band** | Primary surfaces | A header or section band | Page | Surface, brand | Its text 4.5:1 | Strongest neutral surface | New |
| **Selection indicators** | Primary accents | Tabs indicator, Carousel current dot, selected radio card outline, Avatar ring | Page | Line or mark, action | 3:1 | Body text colour | `c.tabs.indicator-fill`, `color.accent` |
| **Marks on fills** | Primary accents | Checkbox tick, Radio dot, Slider step dots on the fill | On fills | Mark, brand | 3:1 on the fill | The fill's on-colour | `color.text-on-accent` |
| **Progress and activity** | Primary accents | Progress fill, busy-field border, spinners, the Button's progress arc | Page | Fill or line, action | 3:1 | Body text colour | `color.accent` |
| **Brand text and icons** | Primary accents | Section index numbers, SiteHeader mark, accent text | Page | Text, action | 4.5:1 | Body text colour | `color.text-accent`, `color.accent` |
| **Drop targets** | Primary accents | Board drop target, FileUpload outline, Canvas selection, AlignmentPicker mark | Page | Line, action | 3:1 | Body text colour | `color.accent` |
| **Chosen segment** | Secondary elements | SegmentedControl chosen segment | Page | Fill, action | 3:1 | As Action fill | `color.accent` |
| **Selected chips** | Secondary elements | Selected Chip and filter (outline and tint) | Page | Line and tint, action | 3:1 outline | Body text outline, neutral tint | `color.accent`, `color.accent-subtle` |
| **Brand badges** | Secondary elements | Badge `tone="accent"`, subtle and strong | Page | Fill or tint with text, action | Text 4.5:1 | Neutral badge | `color.accent`, `color.accent-subtle` |
| **Rating** | Secondary elements | Rating filled stars | Page | Mark, action | 3:1 | Body text colour | `color.accent` |
| **Feature panel** | Secondary surfaces | Card or Section with `surface="feature"` | Page | Surface, brand | Its text 4.5:1 | Raised neutral surface | New |
| **Feature tint** | Secondary surfaces | A pale wash behind a callout, promotion or empty state | Page | Tint, brand (light steps) | None | Sunken neutral surface | New |
| **Button ring** | Secondary accents | A ring inset inside the primary Button's edge | Action fill | Decoration, brand | 3:1 on the fill, to be seen at all | None | New (the Button's `ring` part is the progress arc, so this one needs another name) |
| **Switch handle** | Secondary accents | Switch handle while on | On fills | Mark, brand | 3:1 on the track | The track's on-colour | `color.text-on-accent` |
| **Band indicator** | Secondary accents | Current item indicator of Tabs, Navigation and SiteHeader on a brand band | Brand band | Line, brand | 3:1 on the band | The band's on-colour | New |
| **Highlight badge** | Highlights | Badge `tone="highlight"`: "New", a promotion | Page | Fill, brand | Its label 4.5:1 | Neutral strong badge | New |
| **Illustration accents** | Highlights | The `accent` role class in art, Image duotone and decoration | Page | Decoration, action | None | Body text colour | `color.accent` |

**Never mappable:** status (info, success, warning, danger), categories and charts, body text and headings, page surfaces, dividers, and off, unchecked or resting states. They stay as the [colour model](foundation.md#colour-model) defines them.

**Derived, never mapped:** labels and icons on a filled part read that part's on-colour, so they always pass. Moving Action fill moves its label colour with it.

**Two choices worth knowing:**

- **The Slider thumb stays with On fills.** It sits on the page as much as on the track, and a yellow thumb on white would fail.
- **Illustration accents keep the action tone,** so existing art doesn't change. Art that should show a brand colour as itself uses the identity colours (`color.brand.<n>`), which no map changes.

### How a part gets its colour

The generator resolves every part in every context: light and dark, each at standard and more contrast. These rules apply in order:

1. **Neutral column:** the part shows its plain look.
2. **Same colour as its ground:** a part whose column is the same colour as its ground shows its plain look. A yellow handle on a yellow track would vanish, so it shows the track's on-colour. This is intended, so it isn't flagged.
3. **Read the column's ramp at the part's tone.** If that step fails the part's need, try the nearest steps, at most two either way on the scale 50, 100–900, 950. The first step that passes is used, and the part is **shifted**.
4. **If no step passes,** the part shows its plain look and **falls back**. The control and the generator's report name the part and the context.
5. **Plain looks always pass,** so no map ever ships a failing pair.

Content placed on a **brand surface** (a band or a feature panel) treats that surface as its ground. Its text, icons and focus ring read the surface's on-colours, and the map is resolved again inside it. A blue button on a blue band fails against the band, so it shows its plain look there: a white fill with a dark label. The yellow ring on that white fill then fails too, so it isn't drawn.

**Compact chrome** (`data-density="compact"`, [Q97](foundation.md#density-content-and-chrome)) shows the Secondary accents in their plain look. Dense toolbars and tables keep one colour for action and selection.

What each part can show:

| Result | Means | In the control |
| --- | --- | --- |
| **Fine** | The column's colour at its tone passes | Nothing extra |
| **Shifted** | A nearby step of the same colour passes | "Shifted in dark: lighter step" (info) |
| **Same as its ground** | Plain look by rule 2 | "Same colour as the switch track: shows the track's on-colour" (info) |
| **Falls back** | No step passes, so the plain look shows | "Too little contrast in dark: shows the plain look" (warning, naming each context) |

### Hard rules and notes

**Hard rules** come from resolution. They never block a move and can't be broken:

- Every part sits in exactly one column. Parts can't be removed, and no part can sit in two columns.
- No part ships a failing pair: rules 3–5.
- Status is never a brand colour: it isn't in the map.
- Labels on fills are derived.
- At least one brand colour stays: the last colour can't be cleared.

**Notes** flag maps that work but read badly. The control shows them on the column or the part, and the checklist judges them. Each has a written way out:

| Note | When | Why |
| --- | --- | --- |
| **Actions split** | Action fill and On fills sit in different columns | People learn one colour as "act here and this is on" |
| **Focus or links apart** | Focus ring or Links sit outside the action colour and Neutral | A third colour for focus or links reads as a different kind of thing |
| **Too many signature marks** | More than three accents show a colour different from both their ground and the action colour | Rarity is what makes a signature work ([below](#the-signature-budget)) |
| **Group split** | A group's parts sit in more than one column | Allowed, but harder to keep consistent; the group card says "2 of 4" |
| **Near a status hue** | The action colour's hue is within 30° of danger or warning | A primary button could read as destructive ([Brand hue on a status hue](#brand-hue-on-a-status-hue)); try Neutral actions |
| **Light colour on controls** | A colour whose seed sits at step 200 or lighter holds an action-tone part | Its action step is much darker than the brand colour: IKEA yellow becomes mustard `#836F00` |

### Presets

Presets are recipes, worked out from the colours rather than stored column by column. They use three colours:

- **L, the lead:** the lowest-numbered colour that can **carry controls**. Its seed sits at step 300 or darker, and its action-tone parts pass in every context. If no colour can, the Primary and Secondary elements and Primary accents go to Neutral.
- **S:** the lowest-numbered colour other than L.
- **T:** the next one after S.

| Preset | Primary elements | Primary surfaces | Primary accents | Secondary elements | Secondary surfaces | Secondary accents | Highlights |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **One colour** | L | L | L | L | L | L | L |
| **Signature** | L | L | L | S if it can carry controls, else L | S | S | T, else S |
| **Quiet** | L | L | L | L | L | L | S |
| **Neutral actions** | Neutral | L | Neutral | Neutral | S, else L | S, else L | T, else S, else L |

Which preset a colour count starts with:

| Brand colours | Starts as | IKEA, Coca-Cola, Citrus |
| --- | --- | --- |
| **One** | One colour | Coca-Cola alone: everything red, with the status note |
| **Two** | Signature | IKEA: blue leads; yellow takes the surfaces, the signature and Highlights. Secondary elements stay blue because yellow can't carry controls |
| **Three** | Signature | The Citrus colour preset (lemon, lime, teal): teal leads as L, lemon is S, lime is T and takes Highlights |
| **Four** | Signature | As three; the fourth column starts empty, so that colour is identity only |

How presets behave:

- **A map nobody has edited follows the colours.** Change colour 2 and the recipe runs again.
- **An edited map stays where it was left.** It shows as **Custom**. Picking a preset replaces it, with undo.
- **Each colour preset names its map preset** in `colour-presets.json`, Signature unless stated. Royal (navy and gold) gets Signature, so gold becomes the ring and the handle, as its description already promises with "a gold accent mark".
- **Neutral actions** is the Coca-Cola case: the brand colour leads bands and identity, and actions are black, as on Coca-Cola's boards and Pepsi's 2023 identity. It is also the answer to the status note.

### The control

The brand map is edited on the library's **Colour page**, in a new block below the brand editor. It is built from core components only, and the whole library recolours live as the map changes, as the brand editor does today. The editor's **Accent** choice is replaced by the map: the column holding Action fill is the action colour.

**Layout**

- A **specimen row** above the board, built from real components, each showing its part in its current colour: a primary Button (with its ring), a Switch (on), a checked Checkbox, Tabs on a brand band, a SegmentedControl, a selected Chip, a brand Badge, a highlight Badge, a Link, a Progress bar, a Rating and a feature panel.
- A **board** with one column per defined colour, in number order, then Neutral.
  - Each colour column is headed by its swatch, number and name ("1 Blue"). The action colour's column is tagged "Actions".
  - Neutral is headed "Neutral" with the line "Shows the plain look".
  - An empty column says: "Identity only. Drag parts here to use this colour in the UI."
- In each column, **group cards** in the fixed group order. A card shows the group name and its count. When the group is split across columns, the count reads "2 of 4", and the card appears in each column holding any of its parts.
- A card **expands** to its part rows. A row shows the part name, a small specimen, and a status only when the part isn't fine: the results and notes [above](#how-a-part-gets-its-colour).
- Above the board, an **arrangement** MenuButton lists One colour, Signature, Quiet, Neutral actions and, after an edit, Custom. Next to it is a Reset action that runs the starting preset again.

**Moving parts**

- **Drag a group card** to another column to move the parts in that card. In a split group, that is the parts in this column only.
- **Drag a part row** to move that part alone. If the part moves into a column where its group has no card, a card for it appears there.
- **The whole column is the drop target.** Order within a column is fixed, so there is no reordering and no insertion line. The drop target shows the Board's existing drop outline.
- **Every card and row has a Move menu** with the other columns ("Move to 2 Yellow", "Move to Neutral"). A group card in a split group also has "Gather all 4 here". So every drag has a single-click and keyboard equivalent ([WCAG 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)).
- **Each colour column's header has Use for actions**, which moves Primary elements and Primary accents to that colour. This keeps F7d's "mark any colour as accent" as one action.
- After a move, **focus follows** the moved item, and a live region announces it: "Moved Switch handle to Neutral". Every move can be undone: a notification says what moved, offers Undo and dismisses itself.

**Colours changing**

- **Adding a colour** runs the preset again if the map hasn't been edited. If it has, the new column starts empty and a message says so: "Colour 3 added. It's identity only until you move parts to it."
- **Clearing a colour** moves its parts to the action colour's column. If the cleared colour held Action fill, they go to the lowest-numbered remaining colour. A message names the move and offers Undo.
- **Changing a colour** never moves parts. Their results (fine, shifted, falls back) update live.

**Narrow windows:** below the board's change point the columns stack as sections, one per column, and the Move menu becomes the main way to move parts. Dragging still works.

**Draft and config:** the map is saved with the brand draft. The config block the editor already shows gains the `brand.map` object, ready to paste into `colour.config.json` before running `npm run tokens`, as today.

**States:** every part row and group card has its rest, hover, focus, dragging and drop-target states. Every column has an empty state. The specimen row and board each have a loading state for the first render.

### The signature budget

Pairing a second colour with the action colour, like the yellow ring on IKEA's blue button, is what makes a theme look like the brand. It is also the easiest way to add noise. These rules keep it a signal:

1. **At most three visible signature marks.** A visible signature mark is an accent shown in a colour different from both its ground and the action colour. In the Signature preset these are the button ring, the switch handle and the band indicator: exactly three. Moving more accents into another colour adds a note.
2. **Each mark sits where it has contrast.** Resolution makes this automatic: a yellow mark on white falls back, so yellow only shows on blue or dark grounds.
3. **No signature in compact chrome.** There the action colour alone carries action and selection.
4. **The same everywhere.** The map is theme-wide, so a signature can't differ between screens.

**Why rarity matters.** The isolation (von Restorff) effect: "when multiple homogeneous stimuli are presented, the stimulus that differs from the rest is more likely to be remembered" ([Von Restorff effect](https://en.wikipedia.org/wiki/Von_Restorff_effect)). A yellow ring on one kind of button is distinctive; yellow on every edge is wallpaper. [Visual noise](visual-noise.md) asks the same: a resting mark must carry information. The signature carries identity, and only while it is rare and consistent.

### IKEA, worked through

<figure class="slate-figure">
  <svg viewBox="0 0 960 380" role="img" aria-labelledby="bci-title bci-desc" data-slate-svg-motion="viewport" data-slate-safe-margin="24"><title id="bci-title">IKEA colours on three parts: where yellow works and where it fails</title><desc id="bci-desc">Three white specimen panels. Primary button: a blue button with a yellow ring inset inside its blue edge and a white label works, because the blue edge is 7.2 to 1 on white and the ring is 5.3 to 1 on blue; a white button with a yellow outer border fails, because yellow on white is 1.4 to 1. Switch: on, a blue track with a yellow handle, 5.3 to 1; off, a neutral outline and grey handle with no brand colour. Blue band: a navigation band with a yellow indicator bar under the selected item and a yellow New badge with dark text, 13.8 to 1; a card with a one-sided yellow stripe is not allowed.</desc><g id="bci-button" data-slate-svg-step="0" data-slate-svg-effect="fade-rise"><text x="24" y="28" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Primary button</text><rect x="24" y="44" width="290" height="320" rx="16" fill="#FFFFFF" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/><text x="44" y="76" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="14" font-weight="700">Do: ring inside the edge</text><rect x="44" y="88" width="200" height="52" rx="10" fill="#0058A3"/><rect x="49.5" y="93.5" width="189" height="41" rx="6" fill="none" stroke="#FFDB00" stroke-width="3"/><text x="144" y="120" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="16" font-weight="700" text-anchor="middle">Add to bag</text><text x="44" y="164" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Blue edge on white: 7.2:1</text><text x="44" y="184" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Yellow ring on blue: 5.3:1</text><text x="44" y="226" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="14" font-weight="700">Don't: yellow edge on white</text><rect x="45.5" y="239.5" width="197" height="49" rx="10" fill="#FFFFFF" stroke="#FFDB00" stroke-width="3"/><text x="144" y="270" fill="#0058A3" font-family="var(--font-family-base)" font-size="16" font-weight="700" text-anchor="middle">Add to bag</text><text x="44" y="314" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Yellow on white: 1.4:1,</text><text x="44" y="334" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">so the button has no edge</text></g><g id="bci-switch" data-slate-svg-step="1" data-slate-svg-effect="fade-rise"><text x="335" y="28" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">Switch</text><rect x="335" y="44" width="290" height="320" rx="16" fill="#FFFFFF" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/><text x="355" y="76" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="14" font-weight="700">On</text><rect x="355" y="92" width="80" height="40" rx="20" fill="#0058A3"/><circle cx="415" cy="112" r="14" fill="#FFDB00"/><text x="451" y="117" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="15" font-weight="400">Email me offers</text><text x="355" y="164" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Yellow handle on blue: 5.3:1</text><text x="355" y="184" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Blue track on white: 7.2:1</text><text x="355" y="226" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="14" font-weight="700">Off</text><rect x="356" y="243" width="78" height="38" rx="19" fill="#FFFFFF" stroke="#6C6C78" stroke-width="2"/><circle cx="375" cy="262" r="12" fill="#6C6C78"/><text x="451" y="267" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="15" font-weight="400">Email me offers</text><text x="355" y="314" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Off carries no brand colour;</text><text x="355" y="334" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">position says the state</text></g><g id="bci-band" data-slate-svg-step="2" data-slate-svg-effect="fade-rise"><text x="646" y="28" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" font-weight="700">On a blue band</text><rect x="646" y="44" width="290" height="320" rx="16" fill="#FFFFFF" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/><rect x="662" y="60" width="258" height="116" rx="10" fill="#0058A3"/><text x="682" y="100" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="15" font-weight="700">Rooms</text><text x="752" y="100" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="15" font-weight="700">Products</text><text x="842" y="100" fill="#FFFFFF" font-family="var(--font-family-base)" font-size="15" font-weight="700">Offers</text><rect x="752" y="110" width="66" height="4" rx="2" fill="#FFDB00"/><rect x="682" y="134" width="56" height="26" rx="13" fill="#FFDB00"/><text x="710" y="152" fill="#111111" font-family="var(--font-family-base)" font-size="13" font-weight="700" text-anchor="middle">New</text><text x="666" y="204" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Yellow indicator on blue: 5.3:1</text><text x="666" y="224" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Dark text on yellow: 13.8:1</text><text x="666" y="262" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="14" font-weight="700">Don't: a one-sided stripe</text><rect x="666" y="276" width="250" height="44" rx="8" fill="#FFFFFF" stroke="#D6D6DD" stroke-width="1.5"/><rect x="666" y="276" width="6" height="44" fill="#FFDB00"/><text x="686" y="303" fill="#1B1B1F" font-family="var(--font-family-base)" font-size="14" font-weight="400">Brand in use</text><text x="666" y="346" fill="#3F3F48" font-family="var(--font-family-base)" font-size="14" font-weight="400">Owner rule: never one-sided</text></g></svg>
  <figcaption>Yellow carries meaning only on blue or a dark surface: a ring inside the blue button, the handle on the blue track, the indicator on the blue band. On white, yellow has no contrast. The panels use IKEA's own blue and are fixed light specimens, so they look the same in dark mode; the library's generated steps are in the second table below.</figcaption>
</figure>

| Pair (approximate IKEA colours) | Ratio | Needs | Verdict |
| --- | --- | --- | --- |
| Yellow `#FFDB00` on blue `#0058A3` | 5.26:1 | 3:1 for a handle, ring or indicator; 4.5:1 for text | Passes both: yellow text on blue also reads |
| Blue `#0058A3` on white | 7.18:1 | 3:1 for a fill's edge; 4.5:1 for link text | Passes |
| White on blue `#0058A3` | 7.18:1 | 4.5:1 for a label | Passes |
| Yellow `#FFDB00` on white | 1.37:1 | 3:1 | **Fails.** Never a boundary, indicator, focus ring or text on white |
| Near-black `#111111` on yellow | 13.83:1 | 4.5:1 | Passes: a yellow fill takes dark text |
| Blue seed `#0058A3` on a dark surface `#18181C` | 2.47:1 | 3:1 | **Fails.** Dark mode reads a lighter step of the ramp (`#4B94E4`, 5.61:1), as the accent already does |
| Yellow `#FFDB00` on a dark surface `#18181C` | 12.97:1 | 3:1 | Passes |

The hex values are close approximations for the example, not IKEA's specification. The ratios are WCAG 2 relative-luminance contrast, calculated for this page.

**In the library.** The generator doesn't use the seed for controls. Blue's action tone is step 500 `#2670BD` in light and 400 `#4B94E4` in dark. Yellow's seed sits at step 200, so the yellow parts read `#FFDB00` itself (brand tone). With the Signature preset, here is what each signature part resolves to:

| Part | Light | Dark |
| --- | --- | --- |
| Action fill and On fills | Blue `#2670BD` on white, 5.08:1: fine | Blue `#4B94E4` on `#18181C`, 5.61:1: fine |
| Button ring, on the Action fill | Yellow on `#2670BD`, 3.72:1: fine | Yellow on `#4B94E4`, 2.31:1. The nearest yellow steps reach 2.68:1 (100) and 2.93:1 (50), so it falls back: no ring |
| Switch handle, on the track | Yellow on `#2670BD`, 3.72:1: fine | Same pair, falls back: the track's on-colour |
| Band indicator, on the blue band | Yellow on `#0058A3` (the band keeps its seed), 5.26:1: fine | Same, 5.26:1: fine |
| Secondary elements, if moved to yellow | Yellow's action step is mustard `#836F00` (4.95:1 on white): passes, but reads as another colour. That's why the preset keeps them blue, with the "Light colour on controls" note | — |

A brand that wants its exact seed on the button can pin step 500 of its ramp to the seed (`pins` in the colour config). The handle and ring are then 5.26:1 in light, as in the figure.

The IKEA map is the Signature preset, untouched. In config it is a single field: `"map": { "preset": "signature" }`.

**The button with a yellow border.** The owner's "blue button with yellow border" works when the yellow is a **ring inside the blue edge**:
- The blue edge carries the boundary on white (7.2:1).
- The ring shows against the blue (5.3:1).
- The label is white on blue (7.2:1).

A yellow border on the **outside**, against a white page, is 1.4:1: the button loses its edge, and a thin yellow line reads as a glow, not a shape. WCAG's guidance also notes that thin lines render fainter than their colour, which argues for more than the 3:1 minimum ([Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).

**The switch with a yellow handle.** On, the track is blue and the handle yellow. The handle reads at 5.3:1 against IKEA's blue (3.7:1 against the library's light step), and the track at 7.2:1 against the page. In dark mode the handle falls back to the track's on-colour (above). Off, the switch shows no brand colour: a neutral outline and handle. The brand appears only while the state is on, and the handle's position says the state too, so colour is never the only cue (WCAG 1.4.1).

**Not allowed, even though the IKEA board shows it:**
- **A one-sided yellow stripe** on a card's edge. The owner bans one-sided accent borders ([brief](brief.md#design-constraints)). Use a fill, a tint, a full outline, an icon or a badge.
- Yellow text, outlines or focus rings on white.

### How much of each colour

#### What theory says

- **Dominant, subdominant, accent.** "The color with the largest proportional area is the dominant color (the ground). Smaller areas are subdominant colors. Accent colors are those with a small relative area, but offer a contrast because of a variation in hue, intensity, or saturation (the figure)" ([Color Worqx: Proportion & Intensity](https://www.worqx.com/color/color_proportion.htm)).
- **Itten's contrast of extension.** Itten balances colours by area against their brilliance, using Goethe's light values: yellow 9, orange 8, red 6, violet 3, blue 4, green 6. Harmonious areas are the reciprocals: "yellow : orange : red : violet : blue : green = 3 : 4 : 6 : 9 : 8 : 6", so "yellow : blue = 3:8" and "yellow : red : blue = 3:6:8". Harmonious areas "yield static, quiet effects". Letting one colour dominate makes the effect "expressive". And "a little red with a great deal of green makes the red highly active": a minority colour "seem[s] relatively more vivid" (Johannes Itten, *The Elements of Color*, 1970, pp. 59–62, from *The Art of Color*, 1961; [scan](https://archive.org/details/johannes-itten-the-elements-of-color)). Itten adds that the ratios hold only for fully saturated hues.
- **60-30-10.** A rule of thumb from interior decorating: 60% dominant colour, 30% secondary, 10% accent. We found no primary source for it, so it is a starting split for brand surfaces, not evidence. It sits close to Itten (blue 8 : yellow 3 is 73 : 27) and to the owner's boards (60–80% dominant, 15–30% neutral, 5–10% accent).
- **The isolation effect.** An accent works because it is rare ([above](#the-signature-budget)). Spread an accent and it stops being one.
- **Colour fits the brand's position.** In two experiments, "people consider colors congruent with those positions to be more appropriate" (Bottomley and Doyle, 2006, [doi:10.1177/1470593106061263](https://doi.org/10.1177/1470593106061263)). Labrecque and Milne tie hue to brand personality in "Exciting red and competent blue" (2012, online 2011, [doi:10.1007/s11747-010-0245-y](https://doi.org/10.1007/s11747-010-0245-y); abstract not read for this page).
- **Colour as an owned asset.** Tiffany Blue has been a registered colour trademark since 1998 ([Tiffany Blue](https://en.wikipedia.org/wiki/Tiffany_Blue)). IKEA stores "are typically blue buildings with yellow accents – Sweden's national colours" ([IKEA](https://en.wikipedia.org/wiki/IKEA)): blue dominant and yellow minor, the direction Itten's 8 : 3 predicts for that pair.

#### Coca-Cola vs Pepsi

| | Coca-Cola | Pepsi |
| --- | --- | --- |
| History | Frank Mason Robinson's idea: "The red and white colors were also Robinson's idea"; a red logo from 1891 to 1893, then black and white, but "red was always associated with the brand" ([Coca-Cola](https://en.wikipedia.org/wiki/Coca-Cola)) | "Project Blue" in 1996 moved the brand to blue: a blue Concorde and a banner on the Mir space station; by 1998 all branding used the blue first seen on Pepsi Max cans. In 2023, "accompanying branding elements will shift from blue to black as their primary color" ([Pepsi](https://en.wikipedia.org/wiki/Pepsi)) |
| Owner's board | Red about 60–70%, white 20–30%, black for text and contrast 5–10% | Blue about 70–80%, white 15–25%, red accent 5–10% |
| Structure | One dominant colour owns the surface; white is the second voice; black does the reading | One dominant colour and one small opposing accent: Itten's "expressive" extension, with red kept small so it looks vivid |
| In a product UI | Red can carry controls (its seed sits at step 400), but it sits on the danger hue (below). The **Neutral actions** preset keeps red on bands and surfaces and puts actions in Neutral: black, as on the board | Blue carries controls well. The **Signature** preset gives red the Secondary accents, small, on blue or dark grounds |
| What it teaches | A single-colour brand still needs neutrals and a reading colour; "all red" works on a can, not on a form | Maps change over time (blue to black in 2023), so the map belongs in the theme, never in components |

The boards are AI-made mock-ups the owner supplied as references, not official brand guidelines. Their bars are the owner's suggestions, not measurements. They describe **brand surfaces**: a can, a hero, a campaign. At 60–80% brand colour, a product screen would drown its actions, because when everything is red, nothing is the button.

#### Budgets by surface

Starting budgets, by share of the visible area (excluding photos and people's own content). They are working defaults for review, not measured norms. The **lead colour** is the brand colour with the most area: usually the column holding Primary surfaces and, on product screens, the action colour too. The **second colour** is the next largest; **others** are the rest.

| Surface | Examples | Neutral | Lead colour | Second colour | Others |
| --- | --- | --- | --- | --- | --- |
| **Brand surface** | Hero, campaign page, splash, packaging, empty-state art | 20–40% | 50–70% | 5–15% | Under 5% |
| **Content surface** | Marketing pages below the hero, articles, help | 70–85% | 10–20% | Under 5% | Under 2% |
| **Product screen** | App views, forms, settings, dashboards | 80–90% | 5–15% | Under 5% | Under 2% |
| **Dense chrome** | Tables, toolbars, editors, data views | Over 90% | Under 5%: selection, focus and the one primary action | 0 | 0 |

Status colour sits outside the budget. It appears when the content has a status, never to decorate.

#### Brand hue on a status hue

The library's danger seed `#C62828` sits at OKLCH hue 26.7°, and Coca-Cola red (about `#F40009`) at 28.7°: two degrees apart. Pepsi blue (about `#004B93`, 254.4°) sits two degrees from the info seed `#0B62C4` (256.5°). When the action colour lands on a status hue, either a primary button reads as destructive, or an error reads as an ordinary action. Rules:

1. When the action colour's hue is within 30° of danger or warning (a proposed threshold), the control shows the **Near a status hue** note. The way out is the **Neutral actions** preset: the brand colour leads **brand surfaces and identity**, and **actions take neutral**, like Coca-Cola's black or Pepsi's 2023 black. Alternatively, keep the map and write down why: status messages always pair their colour with an icon and words, and a destructive action always asks before it acts.
2. **Status hues never move to make room for a brand**: a red error stays red, a green success stays green. The brand gives way, not the status.
3. **An info hue next to a blue brand is acceptable.** Info carries no judgement, and its messages already carry an icon and words.

### Contexts and accessibility

- **Text**: 4.5:1 on its surface (WCAG 1.4.3). **Parts and states**: 3:1 against adjacent colours for what identifies a component and its state, such as handle against track and track against page (WCAG 1.4.11). **Never colour alone**: position, a check mark or words also say the state (WCAG 1.4.1). A link in Neutral keeps its underline.
- **Dark**: the map doesn't change; each part reads its tone's dark steps, and rules 3–5 run again. IKEA's blue seed fails on dark surfaces (2.5:1), but its dark action step `#4B94E4` passes (5.6:1). The yellow handle on that track fails (2.3:1), so in dark the handle falls back and the button ring isn't drawn. The yellow band indicator still holds 5.3:1 on the blue band, which keeps its seed in both schemes.
- **More contrast**: the same rules with the context's stronger steps. Decoration (the button ring) isn't drawn. Other parts get stronger, never weaker.
- **Forced colours**: everything maps to system colours (`Highlight`, `ButtonText`, `CanvasText`). No ring or signature colour shows, and nothing may depend on one.
- **Checked at generation**: every part in all four contexts. The generator's report lists every shifted and fallen-back part. The control shows the same list on the part rows, so no failure is hidden.

### Config, tokens and core

**Proposal, not implemented.** Numbered colours stay (F7d), and today's resolved values stay the same after migration.

**Config: contract `colour-config/3`.** The map replaces `brand.accent`:

```json
{
  "brand": {
    "colours": {
      "1": { "seed": "#0058A3", "name": "Blue" },
      "2": { "seed": "#FFDB00", "name": "Yellow" }
    },
    "map": {
      "preset": "signature",
      "groups": {
        "primary-elements": 1, "primary-surfaces": 1, "primary-accents": 1,
        "secondary-elements": 1, "secondary-surfaces": 2, "secondary-accents": 2,
        "highlights": 2
      },
      "parts": { "focus-ring": "neutral" }
    }
  }
}
```

- **Columns** are `1`–`4` or `"neutral"`. A group or part may name only a defined colour.
- **`preset`** names the preset the map started from, which Reset returns to. **Without `groups`**, the recipe runs at generation, so the map follows the colours. **With `groups`**, the map is explicit, and the control shows it as Custom unless it matches a preset. The example is Custom: Signature with the focus ring moved to Neutral.
- **`parts` lists only parts that differ from their group.** Normal form: a group's column is the one holding most of its parts (on a tie, the preset's column), so a map has one written form and the control's config text is stable.
- **`base.tint.from: "accent"`** now means the action colour. When Action fill is in Neutral, there is no tint.
- **Migration from v2:** `accent: n` becomes every group in column `n`. Rule 2 then turns the ring, handle and indicator to their plain looks, so every existing part resolves to today's value. The check is to compare the generated CSS before and after.
- **This replaces Q131's proposal** of `brand.roles`, `brand.signature` and `color.secondary*`: the map covers all three.

**Tokens**

- **One semantic role per part:** `color.map.<part>`, plus `-hover`, `-pressed` and `-on` (its label colour) where the part has them. They are written by the generator as light-dark pairs with more-contrast modifiers, and read by components, never by views.
- **Today's roles stay as aliases** for one contract version: `color.accent` (Action fill), `color.accent-hover`, `color.accent-pressed`, `color.accent-subtle` (Brand tint), `color.focus` (Focus ring), `color.text-link` (Links), `color.text-accent` (Brand text and icons), `color.text-on-accent` (Action fill's label) and `state.selected` (Selected tint). They are marked deprecated, and a lint warns on any new read.
- **`color.brand.<n>` and `on-<n>` stay identity only:** logos, illustration, campaign.
- **Brand surfaces** set `data-surface="brand"` or `"feature"`. Inside, the generator declares the surface's text, icon, focus and map roles again, so content reads them unchanged.
- **Checks:** every part's pairs go into `checks.json`. No status role may alias a map role. A planned browser probe, `tools/colour-probe.js`, measures each column's share of a rendered view against its [budget](#budgets-by-surface).

**Core hooks**

| Hook | For | Note |
| --- | --- | --- |
| Board **card groups** | The control | Group cards that hold part rows, either draggable, each with a Move menu. Extends the existing Board compound (columns, drag, Move menu, announcements) |
| Button **inset ring** | Button ring | A decoration part on primary Buttons, drawn only when its role resolves to a colour. Named apart from the existing `ring` part, which is the progress arc |
| **`surface="brand" \| "feature"`** on Section, SiteHeader, Footer and Card | Brand band, Feature panel | Brand-agnostic: the prop names a surface, not a brand, so it isn't a brand variant (BC9) |
| **Band indicator** for Tabs, Navigation and SiteHeader | Band indicator | Read only inside a brand surface |
| Badge **`tone="highlight"`** | Highlight badge | A tone, alongside `accent` and the status tones |
| **Feature tint** role | Feature tint | Read by Callout-like and EmptyState wrappers that opt in |
| **Map resolution** in `@design-library/core/colour` | Everything | A pure function from colours and map to every part's resolved colour, with results and notes per context. The control and `npm run tokens` both call it, so the preview and the build can't disagree |

**Build slices** ([work plan](work-plan.md)), each delivered as screens to review:

- **A:** the board and the resolver for the 17 parts that exist today, with live recolour.
- **B:** the new hooks: ring, band and band indicator, feature panel and tint, highlight badge.
- **C:** config v3 and migration, then the checks and the probe.

**Built in the trial worktree** (Q140, 2026-11-11, `dl-brand-map`, not committed):

- **Band and feature are live map roles.** The generator writes `color.map.band`, `band-on`, `feature` and `feature-on` from the map: Band follows Primary surfaces, Feature follows Secondary surfaces. Moving either group on the board moves every brand surface that reads it. The IKEA template's yellow blocks (offer hero, store panel, rewards block, chat header) read Feature. Its blue blocks (family panel, offer ticket, wordmark box) read Band. So the template shows both brand colours as surfaces, at the share the [budget](#budgets-by-surface) allows.
- **Button `emphasis="strong"`**: a black pill fill for identity calls to action on a brand or feature surface, such as IKEA's footer "Join" buttons. It reads the strongest neutral, not a brand role, so the map can't move it.
- **Footer `tools` slot**: a row under the link columns for a language and a cookie control.

### The procedure

For an agent mapping a brand onto the library:

1. **List the brand colours** from the brand's guidance or the owner, one per number. Drop colours that appear only in photography or packaging.
2. **Order them.** The lowest-numbered colour that can carry controls leads. Its seed must sit at step 300 or darker. When the best-known colour is too light (yellow, lime, a pastel), give it a higher number, or let the presets skip it.
3. **Start from a preset**: Signature for two or more colours, One colour for one.
4. **Check the action colour against status hues.** Within 30° of danger or warning, switch to Neutral actions, or write down why not ([the rule](#brand-hue-on-a-status-hue)).
5. **Move only what the brand needs.** Keep to the groups. Move a single part only with a reason. Clear every note, or write down why it stays.
6. **Read the results** in light, dark and more contrast. Accept fallbacks; never adjust a step by hand to force a pass.
7. **Classify each screen's surface** (brand, content, product, dense chrome) and check its [budget](#budgets-by-surface).
8. **Run the checklist** below.

## Part 2: the checklist

The evaluator who didn't build the theme scores each row with evidence ([the adversarial loop](adversarial-loop.md)). Pass: every row passes.

| # | Check | Pass when | Evidence |
| --- | --- | --- | --- |
| BC1 | Parts, not colours | Every coloured part reads its `color.map.*` role. No component reads a colour number, or `color.brand.<n>` for state or action. There are no new reads of the deprecated aliases | Token reads in the touched CSS; the alias lint |
| BC2 | Consistent actions | Action fill and On fills resolve to one colour. Links and Focus ring are in that colour or Neutral. Any exception has a written reason | The map and its notes |
| BC3 | Signature budget | At most three visible signature marks, none in compact chrome | The map, and a screen per mark |
| BC4 | Contrast where placed | Every part passes its need in every context, or shows its plain look. No pair ships failing | The generator's report per context |
| BC5 | Never colour alone | Every state also shows by position, mark, shape or words. Status always has an icon and words. Links keep an underline | Screens in greyscale |
| BC6 | Status kept apart | Status isn't mappable, and no status role aliases a map role. An action colour within 30° of danger or warning has a written choice | The theme and its note |
| BC7 | Budget per surface | The screen's measured shares sit inside its surface budget | The probe, or a hand estimate with the screenshot |
| BC8 | Off and rest are neutral | Off switches, unchecked boxes, unselected items and quiet buttons carry no brand colour | Screens in each state |
| BC9 | Owner constraints | No one-sided accent stripe. Switch for binary settings. No brand-specific variant: surfaces are brand-agnostic props | The touched parts |
| BC10 | Contexts | Light, dark, more contrast and forced colours each render with every part resolved. Fallbacks show cleanly | Four screenshots |
| BC11 | One column per part | Each of the 23 parts sits in exactly one column. No part is in an undefined colour | The resolved map |
| BC12 | Move parity | Every drag has a Move menu and keyboard equivalent, announced, focus following, undoable | Keyboard-only and screen-reader walkthrough |
| BC13 | No hidden failure | Every shifted or fallen-back part shows on its row, naming the context, and matches the generator's report | The control beside the report |
| BC14 | Round trip | Draft, then config, then `npm run tokens` gives the same resolved colours as the live preview. A v2 config migrates to identical CSS for existing parts | A CSS comparison |

## Sources

- Johannes Itten, *The Elements of Color* (1970; from *The Art of Color*, 1961), "Contrast of Extension", pp. 59–62. [Internet Archive scan](https://archive.org/details/johannes-itten-the-elements-of-color).
- Color Worqx: [Itten's Contrasts](https://www.worqx.com/color/itten.htm), [Proportion & Intensity](https://www.worqx.com/color/color_proportion.htm), [Contrast & Dominance](https://www.worqx.com/color/contrast_dominance.htm).
- Material Design 3: [Material Design 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) (key colours and roles); [Material Web: color](https://github.com/material-components/material-web/blob/main/docs/theming/color.md) (roles and `on-` colours).
- W3C: [Understanding SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).
- [Von Restorff effect](https://en.wikipedia.org/wiki/Von_Restorff_effect) (Hedwig von Restorff, 1933).
- Brand histories: [Coca-Cola](https://en.wikipedia.org/wiki/Coca-Cola), [Pepsi](https://en.wikipedia.org/wiki/Pepsi), [IKEA](https://en.wikipedia.org/wiki/IKEA), [Tiffany Blue](https://en.wikipedia.org/wiki/Tiffany_Blue).
- Bottomley, P. A. and Doyle, J. R. (2006), "The interactive effects of colors and products on perceptions of brand logo appropriateness", *Marketing Theory* 6(1), [doi:10.1177/1470593106061263](https://doi.org/10.1177/1470593106061263).
- Labrecque, L. I. and Milne, G. R. (2012), "Exciting red and competent blue: the importance of color in marketing", *Journal of the Academy of Marketing Science* 40, [doi:10.1007/s11747-010-0245-y](https://doi.org/10.1007/s11747-010-0245-y) (cited by title; abstract not read for this page).
- The owner's reference boards (IKEA, FILA, Slack, Starbucks, Coca-Cola vs Pepsi) are kept git-ignored in `.design-library/brand-ref/owner/`. They are illustrative mock-ups, not brand guidelines, and are never committed or published.
- Contrast ratios and OKLCH hues on this page were calculated with the WCAG 2 relative-luminance formula and the OKLab conversion, from the hex values shown. Ramp steps (`#2670BD`, `#4B94E4`, `#836F00` and the others) come from the library's own generator (`ramp()` in `@design-library/core/colour`) for these seeds.
