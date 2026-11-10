# Visual representation

**In the library:** [Icon](https://prabinpebam.github.io/design-library/#/icon), the one Icon fundamental and its libraries.

> **TL;DR:** Show, don't tell, when the reader's job is to see a pattern, compare, find, recognise or act. A picture's gist lands in a fraction of a second and is remembered better than words, and a well-chosen chart turns a reading task into a seeing task. But visuals aren't free: an icon without a word is a guess, a chart is slower than a number when the reader needs the exact value, and some things (a quote, a price, a legal term, code, someone's message) must be shown exactly as they are. So every piece of information goes through **one reasoning chain** ([RC1–RC8](#the-reasoning-chain)): what the reader must do with it, whether it must stay verbatim, which representation makes that task fastest, the least copy that still leaves nothing to guess, and its text twin. This page is that chain plus the rules for each medium: [icons](#icons), [images](#images-photographs-and-screenshots), [illustrations](#illustrations), [media](#media-video-audio-and-animation) and [charts and visualizations](#charts-and-visualizations). It is the framework (F15.V1), with the [audit of the library](#audit-and-build-plan) against it and a build plan (F15.V2). Nothing here is approved or built.

**Owner, 2026-11-09 06:56 (verbatim, [DoD Q77](definition-of-done.md#owner-instructions)):** *"- We need an entire philosophy and framework/guideline around the use if images, media, illustrations, icons, visulaizationa dn charts. - Visuals are far easier and faster to read and comprehend as compared to reading a paragraph of text. - By default, we go through a reasoning chain to decide how an information is best represented. - Can this be better represented with a visualization with the goal being easier and faster comprehension? - What would be the optimal UI so that the user has to read minimal to no UI copy to understand the information and act on it? - When it is not right o represent an info visually? - when accuracy and verbatims are to be represented as is. - When it's content and it's supposed to be represented as is. Do deep research and extend and complete this framework to make it more comprehensive and coherent."*

**Status:** framework draft for review (strict design, docs only). Shaped by `ground`, `assumptions`, `visual-noise`, `ui-copy`, `ui-states`, `design-system` and `perceived-performance`; consistent with the owner's standing rules ([Q34](definition-of-done.md#owner-instructions): square inner stacked-bar segments, no one-sided accent borders, no redundant variants), the [colour model](foundation.md#colour-model) (spectrum and `color.category.*` are for data, never status), the [icon sources](brief.md#icon-sources-and-semantic-adapters), [materials](materials.md) and [motion](motion.md). Stable IDs: promises **VP**, jobs **VJ**, user-can **VU**, principles **V**, reasoning chain **RC**, show-as-is rules **VX**, representation chooser **VC**, medium rules **IC** (icons), **IM** (images), **IL** (illustrations), **MD** (media), **CH** (charts), misleading pitfalls **ML**, accessibility **VA**, colour **VK**, density **VD**, copy **VW**, assumptions **VS**, decisions **VE**, audit findings **AF**, build plan **BP**, done rows **VV**.

## Grounding: what representation promises

| # | Promise | What breaks it |
| --- | --- | --- |
| VP1 | You understand the state of things at a glance, before reading a word. | A paragraph that describes a trend; five numbers in a sentence; a status only in words buried in a row. |
| VP2 | You can act without decoding anything. | An unlabelled icon that could mean three things; a chart whose takeaway is left for you to find; a legend you have to match by colour. |
| VP3 | What you see is true. | A bar chart that doesn't start at zero; a stock photo of "our team"; an AI picture presented as a real place; a smooth line through two data points. |
| VP4 | What must be exact, stays exact. | A price shown only as a bar; a quote paraphrased into an infographic; code as a screenshot; your own message "summarised" into icons. |
| VP5 | Nothing is lost if you can't see it. | A chart with no text alternative; colour as the only difference; a video with no captions; an icon button with no name. |

| # | Job (when…, I want…, so I can…) |
| --- | --- |
| VJ1 | When I open a screen, I want to see what changed or needs me first, so I can act without reading everything. |
| VJ2 | When I compare things (plans, periods, options), I want them side by side on one scale, so the difference is obvious. |
| VJ3 | When I need a value (a balance, a dose, a date, an ID), I want the exact value, readable and copyable, so I can rely on it. |
| VJ4 | When I scan a dense list or toolbar, I want familiar shapes to find things, and words to be sure, so I'm fast without guessing. |
| VJ5 | When I can't see the screen, or can't tell colours apart, I want the same meaning in words, so I'm not left out. |
| VJ6 | As an agent composing a view, I want one decision procedure that tells me how to show each piece of information, so I don't guess or decorate. |

**A person can:** VU1 tell the main state of a view (status, trend, progress, what needs action) within a few seconds without reading body text; VU2 compare any two shown quantities on a common scale; VU3 read and copy every exact value, quote, identifier and piece of user content verbatim; VU4 identify every icon's meaning from its word, tooltip or accessible name; VU5 get the same information from a text alternative or data table; VU6 tell real photographs from illustrations and generated images where it matters.

## Why visuals: what the research says

The owner's premise holds, with conditions that the rest of this page turns into rules.

| Claim | Evidence | So, for this library |
| --- | --- | --- |
| **The gist of a picture arrives almost instantly.** | People detect the meaning of a picture shown for 13 ms in a rapid sequence ([Potter et al. 2014](#sources)). Basic features (colour, size, orientation, motion, enclosure) "pop out" pre-attentively, in under about 250 ms, regardless of how many other items there are ([Treisman & Gelade 1980](#sources), [Healey & Enns 2012](#sources)). | Encode the one thing to notice with a single pre-attentive feature (V3). Conjunctions (red *and* square) don't pop out: never rely on them. |
| **Pictures are remembered better than words.** | The picture superiority effect: people recognise thousands of pictures after one viewing, far better than words or sentences ([Shepard 1967](#sources), [Standing 1973](#sources)); dual coding: information stored both as an image and as words is easier to recall ([Paivio 1971](#sources)). | Pair a visual with a few words (a label, a takeaway title): both channels, not either (V2). |
| **A diagram can replace search with seeing.** | A diagram groups related information by location, so the reader finds and infers by perception instead of searching text ([Larkin & Simon 1987](#sources), "Why a diagram is (sometimes) worth ten thousand words"). | Use structure visuals (flows, hierarchies, timelines, maps) where relationships are the point (VC). |
| **The right encoding decides accuracy.** | People judge position on a common scale most accurately, then length, then angle and slope, then area, then volume and colour intensity ([Cleveland & McGill 1984](#sources); replicated by [Heer & Bostock 2010](#sources)). | Bars and dots on one axis by default; pies only for a few parts of a whole; never 3D or area for precise comparison (CH, ML). |
| **…but only when the representation fits the task.** | Cognitive fit: graphs are faster for spatial tasks (trends, comparisons, patterns); tables are faster and more accurate for symbolic tasks (look up an exact value) ([Vessey 1991](#sources); [Few 2012](#sources)). | The task decides, not the data (RC2). A value someone must read exactly stays a number (VX2). |
| **Words plus pictures beat words alone, but decoration hurts.** | Multimedia principle: people learn better from words and pictures than from words alone; coherence principle: they learn better when extraneous pictures are left out; "seductive details" lower understanding ([Mayer 2009](#sources), [Harp & Mayer 1998](#sources)). Eye tracking: people scrutinise information-carrying images and ignore decorative ones ([NN/g, Nielsen 2010](#sources)). | Every visual must carry information (V4, the [visual-noise](#consistency-with-visual-noise-and-the-owner-rules) ink budget). |
| **Icons are fast only when they're known.** | Few icons are universal (home, print, search); most are ambiguous, so "text labels are necessary to communicate the meaning and reduce ambiguity" ([NN/g icon usability](#sources)). | An icon always has a text twin; icon-only only for the universal few and frequent compact tools, with a tooltip and accessible name (IC). |
| **Embellishment helps memory, not reading.** | Embellished charts were remembered better later without hurting interpretation ([Bateman et al. 2010](#sources); [Borkin et al. 2013](#sources)), but these are editorial and recall effects, not task speed. | Product UI aims for task speed: no chart junk. Editorial surfaces (a hero, a story) may use an illustration that carries the message (IL). |

**A myth we don't use:** "people process visuals 60,000 times faster than text" has no traceable research source. The real numbers above are strong enough.

## Part 1: the framework

Like every UX framework here, this page comes in two parts ([the two-part frameworks](spacing.md#the-two-part-frameworks)): Part 1, from here to [Consistency with visual noise](#consistency-with-visual-noise-and-the-owner-rules), is what an agent or a person applies while designing; [Part 2](#part-2-the-checklist) is the checklist an evaluator who didn't build the screen scores it with. **Where it starts:** the same hierarchy tree as spacing and framing ([the method](spacing.md#the-method-hierarchy-first-then-space-and-frames-owner-q93)). For each group's information, run [the reasoning chain](#the-reasoning-chain) (RC1–RC8) at that node: the reader's task there decides the representation, the group's frame decides its size and density, and its text twin sits in the same group.

## Principles

| # | Principle |
| --- | --- |
| V1 | **Represent for the task, not the data.** First name what the reader must do (notice, compare, find, recognise, follow, read exactly, act); the representation is whatever makes that task fastest and least error-prone. The same numbers are a chart for "is it going up?" and a table for "what was March?" ([Vessey 1991](#sources), [Munzner 2014](#sources)). |
| V2 | **Visual first, words always.** Lead with the visual; every visual has a text twin: a label, a takeaway title, a caption, an accessible name or a data table. Never a visual alone (WCAG 1.1.1), never a paragraph where a visual would do. |
| V3 | **One meaning, one pre-attentive cue.** The thing to notice gets the single strongest feature (position, then colour or size); everything else stays quiet (grey, thin, small). |
| V4 | **Every mark carries information.** Data-ink over decoration ([Tufte 1983](#sources)); the visual-noise ink budget applies inside charts as much as on screens. |
| V5 | **Truth over drama.** The visual's proportions match the data's ([Tufte's lie factor](#sources)); scales, baselines, ranges and sources are honest and shown ([Cairo 2019](#sources)). |
| V6 | **Exact stays verbatim.** Values that must be exact, words that must be quoted, code, identifiers, legal and safety text, and other people's content are shown as text, as is. A visual may accompany them, never replace them (VX). |
| V7 | **Familiar before novel.** Prefer common forms (bar, line, dot, table, the known icon); a novel form needs a reason and a way to learn it ([Apple HIG](#sources)). |
| V8 | **Consistency carries meaning.** One icon set and style, one chart style, one colour per category across a view and its drill-downs; a change of form or colour must mean a change of meaning ([Apple HIG](#sources), [Fluent](#sources)). |
| V9 | **Overview first, details on demand.** Show the summary; reveal detail on hover, focus, selection or drill-in ([Shneiderman 1996](#sources)); never pack everything into one picture. |
| V10 | **Nothing depends on one sense.** Colour pairs with a second cue; motion has a still state; sound has captions; a chart has a table (VA). |
| V11 | **Real means real.** Photographs show real things; illustrations and generated images are recognisably not photographs where the difference matters (people, places, products, evidence). |
| V12 | **The library's tokens and components only.** Visuals read semantic tokens (`color.category.*`, `spectrum.*` for data, status roles only for status) and library components; never ad hoc colours, strokes or one-off chart styling in a view. |

## The reasoning chain

Run this for every piece of information a view shows, before choosing a component. Stop at the first step that settles it. It is written as a procedure an agent can execute; the [agent form](#the-chain-as-an-agent-procedure) follows.

<ol class="slate-steps">
  <li class="slate-step">
    <p class="slate-step__title">RC1 · Name the reader's task</p>
    <p>What must the person do with this: notice a state, compare, see a trend or distribution, find an item, recognise a thing, follow a sequence or structure, read an exact value, read content, or act? One verb. If there's no task, the information doesn't belong on the screen.</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC2 · Must it stay verbatim?</p>
    <p>Run the <a href="#when-to-show-it-as-is">show-as-is test</a> (VX1–VX10). If any rule holds, show it as text, exactly; you may add a visual beside it (a sparkline by a balance, a thumbnail by a file name), never instead of it. Continue only for the accompanying visual.</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC3 · Would a visual make the task faster or less error-prone?</p>
    <p>Yes when the task is spatial (compare, trend, distribution, part-to-whole, relationship, sequence, location, state at a glance) or recognition (a known object, person, place, file type, action). No when the task is symbolic (look up one exact value), when there is only one or two numbers, or when the reader's words are clearer than any picture. If no, use text, well set (RC6).</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC4 · Choose the representation by the shape of the information</p>
    <p>Use the <a href="#representation-chooser">chooser</a> (VC1–VC16): a state badge or progress bar, a number with its change, a chart from the <a href="#choosing-a-chart-by-task">chart table</a>, a diagram, an icon, a photograph, an illustration, a video. Prefer the simplest, most familiar form that does the job.</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC5 · Design the least copy that leaves nothing to guess</p>
    <p>Aim for zero sentences: the visual plus a takeaway title, direct labels and units carry it. Keep the words people need to be sure (a label on an ambiguous icon, the unit, the time range, the source). Make the next action visible on the visual itself (select a bar to filter, a button beside the alert), so people act without reading instructions.</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC6 · Check the truth</p>
    <p>Run the <a href="#misleading-visuals">misleading-visual checks</a> (ML1–ML14): baseline, scale, range, aspect, colour order, uncertainty, provenance. A visual that could mislead is fixed or replaced by text.</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC7 · Write the text twin</p>
    <p>Decorative: hidden from assistive technology. Informative: an alternative that gives the same meaning (the takeaway, not "chart"). Functional: the action's name. Complex: a short alternative plus the full data or description nearby (<a href="#accessibility-and-text-alternatives">VA1–VA12</a>).</p>
  </li>
  <li class="slate-step">
    <p class="slate-step__title">RC8 · Check the noise and the system</p>
    <p>Every mark carries information; one cue per meaning; tokens and library components only; the owner's rules hold (<a href="#consistency-with-visual-noise-and-the-owner-rules">below</a>); every state (loading, empty, error, partial) is designed.</p>
  </li>
</ol>

### The chain as an agent procedure

```text
for each piece of information I on the view:
  task  = RC1(I)                      # notice | compare | trend | distribution | part-to-whole |
                                      # relate | sequence | locate | find | recognise | read-exact |
                                      # read-content | act ; none -> drop I
  if any VX rule holds for I:         # RC2
      primary = verbatim text (Text, Code, Quote, DataTable cell, ChatMessage …)
      accompany = optional visual from RC4 for the spatial part of the task
  elif task is symbolic or I has <= 2 values or words are clearer:   # RC3
      primary = text (a Statistic for a key number, a DescriptionList, a sentence)
  else:
      primary = chooser(task, shape(I))                               # RC4, VC table, CH table
  copy   = takeaway title + direct labels + units + range + source; no sentence the visual says  # RC5
  assert no ML rule fails, else fix or fall back to text             # RC6
  alt    = text twin by kind: decorative | informative | functional | complex  # RC7
  assert visual-noise checks pass and owner rules hold; states designed     # RC8
  record (I, task, primary, accompany, alt) in the view's notes
```

## When to show it as is

The owner's two cases, accuracy and verbatim, and content that is meant to be shown as is, extended. If any of these holds, the text itself is the primary representation.

<div class="slate-compare">
  <div class="slate-compare__col">
    <p class="slate-compare__head">Visualize (the task is seeing)</p>
    <ul>
      <li>Is it going up or down? How fast?</li>
      <li>Which is bigger? By roughly how much?</li>
      <li>How is it spread? Where are the outliers?</li>
      <li>What share is each part?</li>
      <li>How do these connect, in what order?</li>
      <li>Where is it? What does it look like?</li>
      <li>What state is it in, what needs me?</li>
    </ul>
  </div>
  <div class="slate-compare__col">
    <p class="slate-compare__head">Show as is (the task is reading)</p>
    <ul>
      <li>What exactly is the balance, price, dose, date?</li>
      <li>What exactly did they say or write?</li>
      <li>What is the ID, code, key, address?</li>
      <li>What do the terms, the warning, the error say?</li>
      <li>What is in this article, message, document?</li>
      <li>What is the name of this person, file, place?</li>
      <li>Will I copy, search, translate or cite it?</li>
    </ul>
  </div>
</div>

| # | Show as is when… | Why | What a visual may still do |
| --- | --- | --- | --- |
| VX1 | **The value must be exact** (money, balances, prices, doses, measurements used for a decision, scores, dates and times, counts that are compared to a limit). | Charts give magnitude, not precision; reading values off a chart is the slowest and least accurate way ([Vessey 1991](#sources), [Cleveland & McGill 1984](#sources)). | A sparkline or delta beside the number; a bar *with* a direct value label. |
| VX2 | **People look up individual values** (the March figure, row 312, a rate on a date). | Lookup is a symbolic task: tables beat graphs ([Few 2012](#sources)). | Conditional emphasis inside the table (a bar in a cell, a status badge), never the table removed. |
| VX3 | **The words are verbatim** (quotes, testimony, reviews, a person's message, a prompt, a transcript, a citation). | Paraphrasing into an icon or diagram changes the meaning and its attribution. | An avatar or source mark beside it; a highlight on the quoted part. |
| VX4 | **The words carry legal, safety, consent, financial or medical weight** (terms, warnings, consent text, dosage instructions, error messages with recovery). | Exact wording is the obligation; an icon may soften or distort it. | One status icon as a second cue; never instead of the words. |
| VX5 | **It's machine text** (code, commands, identifiers, keys, file paths, URLs, hashes, email addresses, configuration). | It must be copied, searched and typed exactly; a picture of code can't be. | Syntax colour (a second cue), a copy button. |
| VX6 | **It's content meant to be read as published** (articles, documents, messages, posts, product descriptions, user-generated text, generated answers). | The author owns the form; the product presents it, it doesn't reinterpret it. | Media the author attached; a reading-time or type badge. |
| VX7 | **It's a name** (people, places, products, files, accounts). | Names are identity and must be searchable and translatable without loss. | An avatar, flag, file-type icon or thumbnail beside the name. |
| VX8 | **There are one or two numbers.** | A single value in a chart is ink without information ([Few 2012](#sources)); the number with its change is faster. | A Statistic with a delta and, if the trend matters, a sparkline. |
| VX9 | **The data is too thin or too uncertain to draw** (two points, a small sample, an estimate with wide error). | A line or a smooth curve implies a trend that isn't there ([Cairo 2019](#sources)). | Show the values and the uncertainty in words; draw only with an explicit range. |
| VX10 | **The reader will act on the text directly** (copy, select, translate, search, edit, cite, read aloud). | Text in images can't be selected, resized, translated or reflowed (WCAG 1.4.5 images of text). | Nothing replaces it; a visual only accompanies. |

**Reading this with RC3:** VX makes text the primary carrier; it never forbids a visual next to the text. A balance stays a number and may gain a sparkline; a quote stays a quote and may gain a face.

## Representation chooser

Information shape → the representation that makes its task fastest. Library components are named where they exist today; the [audit](#audit-and-build-plan) checks them and lists the gaps.

| # | The information is… | The task | Represent it as | Library today |
| --- | --- | --- | --- | --- |
| VC1 | A state of one thing (online, failed, draft) | notice | A status badge or dot **with its word**; status roles only | Badge, Avatar status |
| VC2 | Progress toward a known end | notice, predict | A determinate progress bar or ring with the value; indeterminate only when the end is unknown | Progress, Button `progress="fill"` |
| VC3 | One key number | read, notice change | The number, its unit, its change with a direction icon and a word; a sparkline if the trend matters | Statistic |
| VC4 | A value against a target or range | compare to goal | A bullet graph or a bar against a marked target ([Few, bullet graph](#sources)) | gap |
| VC5 | Parts of one whole | part-to-whole | A stacked bar (square inner segments, Q34), direct labels; a pie or donut only for 2–5 parts | StackedBar, AllocationSlider |
| VC6 | Several quantities to compare | compare, rank | Sorted bars on a zero baseline; dots when the baseline isn't zero | gap |
| VC7 | Values over time | trend | A line (many points), columns (few periods or sums); a sparkline inline | gap |
| VC8 | A spread of values | distribution | Histogram, box or dot plot | gap |
| VC9 | Two measures per item | relate | Scatter plot; a connected scatter for change | gap |
| VC10 | Values on a grid (two categories, time × day) | find hot spots | Heatmap with a sequential scale and a legend; table with values on demand | gap |
| VC11 | Steps, a process or a flow | follow | Numbered steps, a flow diagram; a Sankey only for quantities moving between stages | Agenda (time), gap (flow) |
| VC12 | A hierarchy or a network | navigate, relate | A tree or outline for navigation; a node-link diagram only when the links are the point | TreeView, Canvas |
| VC13 | Things in places | locate | A map; a list with the map | gap |
| VC14 | A recognisable object, person, place or file | recognise | A photograph, avatar, flag, thumbnail or file-type icon, **beside its name** | Image, Avatar, Flag, ImageGrid, Card media |
| VC15 | An action or command | act | A button with a verb; icon + word, or icon-only with tooltip and name for the universal few and frequent compact tools | Button, Toolbar, Icon |
| VC16 | A concept, an empty state, a story, a mood | understand, feel oriented | An illustration that carries the message, or none; a short demo video for a motion or procedure | EmptyState (illustration slot: gap), MediaPlayer |

## Icons

**Purpose:** fast recognition of familiar actions, objects and states, and compact targets where space is tight ([NN/g](#sources), [Fluent](#sources), [Material 3](#sources)). An icon is a word's shortcut, not a replacement for it.

| # | Rule |
| --- | --- |
| IC1 | **Icon plus word by default.** Icon-only only for (a) the universally known few (search, close, home, print, menu, more, back, play/pause, add, delete with confirmation) and (b) frequent tools in a dense, learned surface (an editor toolbar, an inspector), always with a tooltip and an accessible name equal to the action ([NN/g](#sources): "icons need a text label"). |
| IC2 | **One icon, one meaning, across the product.** The same glyph never means two actions; one action never has two glyphs. Icons map through semantic names (`action.add`, `status.error`) to one set per theme ([icon sources](brief.md#icon-sources-and-semantic-adapters)); unreviewed mixing is forbidden. |
| IC3 | **Name icons for what they show, use them for what they do.** Pick the most literal, widely recognised metaphor; avoid culture-bound ones (a mailbox, hand gestures, a specific currency, a piggy bank) where a neutral one exists (an envelope) ([NN/g](#sources), [Fluent](#sources): "Shield, not security"). |
| IC4 | **Filled vs outline means state.** Outline at rest; filled for on or selected ([Fluent](#sources) regular/filled). Never mixed for taste (visual-noise rule 7). |
| IC5 | **One size per context; the size matches the tool.** Size tokens only; 12 px icons inform but are too small to press; targets meet the library's target size even when the glyph is small ([Fluent](#sources)). |
| IC6 | **Icons earn their place.** No icon beside every label in a list "for balance", none repeating the heading's word, none as the only cue for something rare (visual-noise rule 7). |
| IC7 | **Status icons pair with status colour and a word.** The icon's shape is the non-colour cue (WCAG 1.4.1); the word is the meaning. |
| IC8 | **Accessibility:** decorative icons (beside a visible word) are hidden from assistive technology; meaningful icon-only controls get the name on the control, not on the SVG as well; a status icon without a nearby word gets a label. Non-text contrast 3:1 for icons that identify a control or state (WCAG 1.4.11). |
| IC9 | **Direction and mirroring.** Directional icons (back, forward, undo, send) use right-to-left variants or approved mirroring; clocks, checkmarks, media controls and brands never mirror. |
| IC10 | **No emoji or text symbols as icons** in UI (ui-copy). Flags use the Flag fundamental, never emoji (Q43). |

## Images: photographs and screenshots

**Purpose:** show the real thing: a product, a person, a place, a document, a result, a screen. People scrutinise information-carrying photos and ignore decorative ones ([NN/g, Nielsen 2010](#sources)).

| # | Rule |
| --- | --- |
| IM1 | **Use a photograph when seeing the real thing helps the task:** choosing a product (several views, detail, scale), recognising a person, previewing a file or result, proving a state (a delivery photo). Not to "jazz up" a page: decorative hero photos are ignored or slow people down. |
| IM2 | **Real people, not stock models,** where the page claims they are real (a team, a reviewer, an author). Generic stock photos carry no information and lower trust ([NN/g](#sources)). |
| IM3 | **Generated images are labelled where it matters.** An AI-generated or composited image never stands in for a real product, place, person or evidence without saying so; it is fine for illustration, placeholders and generation features (ImageGeneration). |
| IM4 | **The crop serves the subject.** Set focal point and aspect ratio from tokens; never crop out the information (a face, a label, a defect). Thumbnails show enough to recognise; the full image is one action away (Lightbox). |
| IM5 | **Text alternative by role** ([W3C decision tree](#sources)): informative → the meaning in context ("Blue linen sofa, three seats, oak legs"), not "image of"; functional (inside a link or button) → the destination or action; decorative or repeated by nearby text → empty alt; complex (a diagram, a scanned chart) → short alt plus the full content nearby. |
| IM6 | **No text baked into images** except logos and where the exact presentation is essential (WCAG 1.4.5). Captions, labels and overlays are real text. Text over an image uses a scrim or material from [materials](materials.md) so it holds 4.5:1 on the worst backdrop. |
| IM7 | **Images are content; corners and frames follow the slot.** The container owns the corners (a Card's media slot squares the seam, Q69); no decorative frames, borders or shadows on photos; one enclosure per boundary. |
| IM8 | **Every image has its states:** a sized placeholder (no layout shift), a loading shimmer in the image's own box, a failure fallback with the alternative visible (initials for an Avatar, a type icon for a file), an empty slot that says what goes there. |
| IM9 | **Screenshots are for showing an interface,** cropped to the part that matters, current, with the important control highlighted by position or a callout, never a coloured stripe. |
| IM10 | **Weight and privacy.** Responsive sizes and modern formats; lazy below the fold; faces and personal data in images follow consent and privacy rules like any other personal data. |

## Illustrations

**Purpose:** explain what a photograph can't (a concept, an abstraction, a process, an empty or future state), set orientation and tone on editorial and first-run surfaces. An illustration that doesn't carry the message is decoration (Mayer's coherence principle).

| # | Rule |
| --- | --- |
| IL1 | **Use an illustration to explain or orient:** an empty state that shows what will appear, onboarding that shows how something works, an error that shows what happened, a concept diagram. Not as filler beside text that says the same. |
| IL2 | **Explanatory before decorative.** A diagram with labelled parts beats a mood picture; in product surfaces, an illustration earns its space by reducing copy (RC5). |
| IL3 | **One illustration style per product,** from tokens: the library's line weights, corner language, brand colours (identity) and spectrum or a declared set (never status colours for mood); no gradients or textures (visual-noise rule 6). |
| IL4 | **Small and quiet in tools, larger on editorial surfaces.** In an app view an empty-state illustration is secondary to the one action; on a landing page it may lead. |
| IL5 | **People in illustrations are diverse and non-stereotyped,** and abstract enough not to be mistaken for real people (V11). |
| IL6 | **Accessible:** decorative illustrations are hidden from assistive technology; explanatory ones have an alternative that says what they explain; diagrams get a text description or the steps as a list. |
| IL7 | **Theme-safe:** illustrations read semantic colour tokens so they work in light, dark and more contrast, and fall back to forced colours as outlines. |
| IL8 | **Motion is optional and finite:** an animated illustration plays once, has a meaningful still state and respects reduced motion ([motion](motion.md)). |

## Media: video, audio and animation

**Purpose:** show change over time that a still can't: how to do something, what something looks or sounds like in use, a story. Media costs attention and time, so it must be chosen and controlled by the person.

| # | Rule |
| --- | --- |
| MD1 | **Use video for motion, procedure and demonstration** (a gesture, a physical process, a product in use), audio for sound itself (a recording, a voice note, a pronunciation). Not for information that reads faster as text or a still. |
| MD2 | **The person starts it.** No autoplay with sound; autoplaying motion longer than 5 seconds has pause, stop or hide (WCAG 2.2.2); audio longer than 3 seconds that plays automatically can be paused or muted (WCAG 1.4.2). |
| MD3 | **Captions for speech and sound** (WCAG 1.2.2), **audio description or a text alternative** for important visual-only content (WCAG 1.2.3, 1.2.5), a **transcript** for audio-only content (WCAG 1.2.1). |
| MD4 | **A poster frame that carries information** (the subject, not a black frame), the duration and a clear play control. |
| MD5 | **No flashing** more than three times per second (WCAG 2.3.1); motion respects reduced motion with a still or a static alternative. |
| MD6 | **Controls are the library's** (MediaPlayer): keyboard operable, labelled, the same in every context. |
| MD7 | **Animation in UI is functional**, owned by [motion](motion.md): it shows how state and content move, never decorates. |

## Charts and visualizations

**Purpose:** let people see patterns, comparisons, distributions, relationships and change that would take paragraphs or tables to work out ([Apple HIG](#sources): charts "communicate complex information without requiring people to read and interpret a lot of text"). Not every collection of data needs a chart: if people only need the data, a list or table they can sort and search is better ([Apple HIG](#sources)).

### Choosing a chart by task

Task families follow the [FT Visual Vocabulary](#sources); the encodings follow [Cleveland & McGill](#sources).

| Task | Default | Also | Avoid |
| --- | --- | --- | --- |
| **Magnitude / compare** | Bars on a zero baseline, sorted by value unless the order means something | Dot plot (non-zero baseline), grouped bars (≤ 3 series) | 3D bars, radial bars, pictograms for precise values |
| **Ranking** | Sorted horizontal bars with direct labels | Ordered dot plot, slope chart for rank change | Unsorted bars; a pie |
| **Change over time** | Line for continuous series; columns for few periods or sums | Sparkline inline; area only for a cumulative total; slope for two points in time | Dual axes; a line through unordered categories |
| **Part-to-whole** | One stacked bar or a 100 % bar, **square inner segments**, direct labels | Pie or donut for 2–5 parts; treemap for hierarchy | Pies with many slices; stacked bars to compare inner segments over time |
| **Distribution** | Histogram | Box plot, dot (strip) plot, beeswarm | Averages alone hiding the spread |
| **Correlation** | Scatter plot | Connected scatter, bubble (size as a third, rough measure) | Dual-axis lines implying correlation |
| **Deviation** | Diverging bars around a meaningful zero or target | Bullet graph against a target | A sequential colour for a diverging measure |
| **Flow** | Sankey for quantities between stages | Funnel only for strict narrowing steps | Chord diagrams for general audiences |
| **Spatial** | Choropleth with normalised values (rates, not totals) | Symbol map for totals | Unnormalised totals on area maps |
| **Single value / status** | The number (Statistic), progress bar, bullet graph | Gauge only when the range and its zones are the point | Gauges for plain numbers; 3D |

### Chart rules

| # | Rule |
| --- | --- |
| CH1 | **A title that says the takeaway** ("Sign-ups doubled after the redesign"), a subtitle with the measure, unit and range; then the chart ([Carbon](#sources), [Apple HIG](#sources)). The takeaway is the chart's text alternative's first line. |
| CH2 | **Direct labels over legends.** Label series at their ends and parts on the parts; a legend only when direct labels don't fit, ordered as the marks are ([Carbon](#sources)). |
| CH3 | **Quiet frame:** light gridlines only where reading values matters, no chart border, no background fill, no 3D, no shadows or gradients; axes and ticks in neutral roles; data in category or accent colour; highlight one thing, grey the rest. |
| CH4 | **Honest axes:** bars and areas start at zero; lines may start elsewhere when the range is meaningful and the axis says so; fixed ranges where bounds mean something (0–100 %), dynamic where values vary widely ([Apple HIG](#sources)). Familiar tick steps (1, 2, 5, 10). |
| CH5 | **Inner segments of stacked and segmented bars are square;** rounding, if any, applies only to the outer ends of the whole bar (owner Q34). Segments are separated by a hairline gap of the surface colour, not by borders. |
| CH6 | **Colour by role:** categories read `color.category.1–8` in a fixed order (at most 8; group the rest as "Other"); sequential measures use one hue's lightness ramp from `spectrum.*`; diverging measures use two hues around a neutral midpoint; status roles only when the data is a status. Never the rainbow for ordered data. |
| CH7 | **Not colour alone:** direct labels, position, pattern or shape distinguish series as well; every category colour holds 3:1 against its surface (the category set is generated to this) (WCAG 1.4.1, 1.4.11). |
| CH8 | **Details on demand:** tooltips repeat the point's values on both axes with units and context ([Carbon](#sources)); they appear on hover and keyboard focus, never hold information found nowhere else, and are reachable without a pointer. |
| CH9 | **Size to the job:** small charts for glanceable state (sparkline, mini bar) with one label; large ones for exploration; keep a chart's style the same when it grows from small to large ([Apple HIG](#sources)). |
| CH10 | **Consistency across charts:** the same measure has the same colour, scale and style everywhere in a view; small multiples share axes ([Tufte 1983](#sources)); a different style must mean different data. |
| CH11 | **Every chart has states:** loading as a skeleton of the chart's shape, empty that says why and what to do, error with recovery, partial or stale data marked with when ([ui-states](#sources)). Lines don't connect across missing data. |
| CH12 | **Numbers in charts are formatted for reading:** locale grouping, rounding appropriate to the decision, units with a space, the same precision across a series; exact values live in the tooltip and the table (VX1). |

## Misleading visuals

Run these at RC6. Each is a known way a visual says something the data doesn't ([Tufte 1983](#sources), [Cairo 2019](#sources), [Pandey et al. 2015](#sources)).

| # | Pitfall | Fix |
| --- | --- | --- |
| ML1 | Bar or area with a truncated baseline: small differences look huge (people overestimate the difference; [Pandey et al. 2015](#sources)). | Start bars at zero; use dots or a line with a labelled range when zero is meaningless. |
| ML2 | Lie factor ≠ 1: the size of the effect in the graphic doesn't match the data (area or icons scaled in two dimensions for a one-dimensional value). | Encode by length or position; scale pictograms by count, not area. |
| ML3 | 3D, perspective and tilted pies distort lengths and angles. | Flat, 2D only. |
| ML4 | Dual axes invent correlations and crossings by choice of scale. | Two charts with aligned time axes, or index both to 100. |
| ML5 | Cherry-picked or inconsistent ranges: a time window chosen to tell a story; small multiples with different scales. | Show the natural range and say why; share scales or label each clearly. |
| ML6 | Inverted or unusual axes (down means more). | Conventional direction; if inverted, say so on the axis. |
| ML7 | Aspect ratio exaggerating or flattening slopes. | Choose the aspect so typical slopes sit near 45° ("banking"), and keep it across comparable charts. |
| ML8 | Totals on maps or per-group charts that are really population. | Normalise (rates, per person) and say so. |
| ML9 | A smooth curve or trend line through too few points, or interpolation hiding gaps. | Show the points; mark missing data; no smoothing without saying so (VX9). |
| ML10 | Missing uncertainty: estimates, forecasts and samples drawn as facts. | Show ranges, intervals or a lighter forecast segment, labelled. |
| ML11 | Rainbow or arbitrary colour for an ordered measure; red/green as the only difference. | Sequential or diverging ramps; colour-blind-safe sets; a second cue. |
| ML12 | Pie with many slices, or several pies to compare. | Sorted bars; one stacked bar per group. |
| ML13 | A picture that isn't what it claims: stock "team" photos, generated "real" places, staged screenshots. | Real images, or labelled illustrations (V11, IM3). |
| ML14 | Cumulative charts presented as growth (always going up). | Show the per-period values, or label "cumulative" in the title. |

## Accessibility and text alternatives

| # | Rule | Source |
| --- | --- | --- |
| VA1 | Every non-text element has a text alternative that serves the same purpose, or is hidden when purely decorative. | WCAG 1.1.1 |
| VA2 | Classify each visual first: decorative, informative, functional, image of text, complex; write the alternative by kind. | [W3C images tutorial](#sources) |
| VA3 | Alternatives give the meaning, not the medium: "Sign-ups doubled in March, from 1,200 to 2,450", not "line chart". | [W3C](#sources), [Apple HIG](#sources) |
| VA4 | Complex visuals (charts, diagrams, maps) have a short alternative plus the full information nearby: a data table, a structured description or the steps as a list. | [W3C complex images](#sources) |
| VA5 | Charts expose their elements: a label per important mark or group, chosen by the chart's purpose (each bar for exact counts, ranges for a profile); keyboard reach for interactive marks. | [Apple HIG](#sources), [Chartability](#sources) |
| VA6 | Colour is never the only cue; a second cue (label, shape, pattern, position) carries the same meaning. | WCAG 1.4.1 |
| VA7 | Graphics needed to understand content, and icons that identify controls or states, have 3:1 contrast against what's next to them. | WCAG 1.4.11 |
| VA8 | Text over images holds 4.5:1 (3:1 for large text) on the worst backdrop; text is real text, not an image of text. | WCAG 1.4.3, 1.4.5 |
| VA9 | Media: captions, audio description or text alternative, transcripts; pause for anything moving over 5 s; no flashing over 3 per second. | WCAG 1.2.x, 2.2.2, 2.3.1 |
| VA10 | Forced colours and print: charts and icons stay readable as outlines and system colours; categories alternate system colours with labels. | [Colour model](foundation.md#colour-model) |
| VA11 | Reduced motion: animated visuals show their final, meaningful state. | WCAG 2.3.3, [motion](motion.md) |
| VA12 | Zoom and reflow: visuals scale to 400 % without losing labels; small charts have a larger view or a table. | WCAG 1.4.10 |

## Colour in visuals

| # | Rule |
| --- | --- |
| VK1 | **Purpose decides the palette** ([colour model](foundation.md#colour-model)): categories → `color.category.*` (8, fixed order); ordered measures → one `spectrum.<hue>` ramp; diverging → two hues around a neutral; status → status roles only when the data *is* a status; brand → identity marks and illustration only. |
| VK2 | **Highlight with contrast, not with more colours:** one accent or category colour for the thing to notice, neutral for the rest. |
| VK3 | **Colour-blind safe by construction:** the category set is checked at 3:1 on every surface; avoid red–green as the only pair: red–green colour blindness is common, especially in men ([NEI](#sources)); prefer palettes designed for it ([Okabe & Ito 2008](#sources), [ColorBrewer](#sources)). |
| VK4 | **The same thing keeps its colour** across charts, legends, badges and drill-downs in a view (V8). |
| VK5 | **No meaning from saturation alone** for categories; saturation and lightness encode order, hue encodes identity. |

## Density

| # | Rule |
| --- | --- |
| VD1 | **Match density to the task and the surface:** operational dashboards show few, glanceable visuals for time-critical decisions; analytical views can be dense with details on demand ([NN/g dashboards](#sources)). |
| VD2 | **Small multiples before overloaded charts:** many series → one small chart per series on a shared scale ([Tufte 1983](#sources)). |
| VD3 | **Sparklines and inline marks** put data where the words are (a trend beside a number, a bar inside a table cell) ([Tufte 2006](#sources)). |
| VD4 | **At most about 5–7 series or 8 categories** in one chart; group the rest; let people choose the subset ([Apple HIG](#sources): reveal detail gradually). |
| VD5 | **Space groups visuals** (proximity) before cards and borders do; a chart in a card has no extra frame of its own ([spacing](#sources), visual-noise rule 4). |

## Copy with visuals

| # | Rule |
| --- | --- |
| VW1 | The title states the takeaway or names the content in sentence case; the subtitle states the measure, unit, range and filter. |
| VW2 | Labels are short nouns; units with a space; numbers as numerals; dates the reader's way (ui-copy). |
| VW3 | No sentence that describes what the visual already shows; a caption adds what it can't (source, method, a caveat). |
| VW4 | Source and date of data are shown wherever a reader could act on the numbers. |
| VW5 | Accessible names repeat visible labels; an icon-only control names its action. |

## Consistency with visual noise and the owner rules

| Rule | How it applies to visuals |
| --- | --- |
| Ink budget (visual-noise 1) | Gridlines, borders, legends, icons and captions each carry information or go. |
| One cue per meaning (2) | A series is told apart by colour plus a direct label, not colour, dash, marker and legend. |
| Cheapest cue (3) | Space and position before colour; colour before a border; no shadows on data. |
| One enclosure (4) | A chart, image or illustration inside a card gets no frame, border or fill of its own. |
| Transient cues (5) | Hover lines, crosshairs, focus outlines on marks and drag targets appear only while active. |
| No decoration (6) | No gradients, textures, 3D, shadows on marks; **no one-sided accent borders** on cards, callouts, legends or images (owner Q34). |
| Icons earn their place (7) | IC1–IC10. |
| Square inner segments | Stacked and segmented bars keep square inner segments; outer ends only may round (owner Q34, CH5). |
| No redundant variants | One chart component per task family, one loading indicator, one image component with slots, never a second pattern for the same job (owner Q34). |
| Notifications | A visual alert (a badge, a status chip) follows the library's notification and status rules; nothing flashes. |

## Part 2: the checklist

Each row passes or fails on a measurement. **DOM** rows are measured by [`tools/visual-probe.js`](https://github.com/prabinpebam/design-library/blob/main/tools/visual-probe.js) (`window.visualProbe().rows`); **look** rows by an evaluator who didn't build the screen, who writes down the chain's choice (task, representation, text twin) for each group. Severity follows the `spacing` skill: S1 broken, S2 misgrouped or inconsistent, S3 fragile. A screen passes when no S1–S3 row fails.

| ID | Passes when | How | Severity |
| --- | --- | --- | --- |
| VR1 | Every picture (`img`) has `alt` (empty when decorative), every `role="img"` has a name, and every other drawn graphic (`svg`) is named or hidden (VA1, VA2) | DOM | S1 |
| VR2 | No alternative names the medium or a file ("Image of…", "photo.webp"): it says what the picture shows or means (VA3) | DOM | S3 |
| VR3 | Every control that shows only an icon has a name, said and shown as its tooltip (IC1) | DOM | S1 |
| VR4 | Every part-to-whole bar names its parts in words beside their colours (a legend or the numbers written beside it): colour is never the only cue (CH2, CH7, VA6) | DOM | S1 |
| VR5 | Inner segments of a stacked or segmented bar are square; only the whole bar's outer ends round (CH5, owner Q34) | DOM | S2 |
| VR6 | Every picture holds its box before it loads: its width and height, a ratio, a CSS height or ratio, or out of flow (IM8) | DOM | S3 |
| VR7 | Nothing plays with sound by itself; a moving picture that starts by itself can be paused (MD2, VA9) | DOM | S1 |
| VR8 | For every group, the evaluator can name the reader's task and the chain's choice; nothing that must stay exact, verbatim or read as content became a visual (RC1–RC8, VX1–VX10) | look | S2 |
| VR9 | Every chart: a takeaway title, direct labels, honest axes, colours by purpose, a table or description, every state (CH1–CH12); no ML pitfall | look | S1 |
| VR10 | Icons come from one set and one style, filled only for state; every picture is real when it claims to be, cropped to its subject (IC2–IC6, IM1–IM4) | look | S2 |

```js
// Playwright: await page.addScriptTag({ path: 'tools/visual-probe.js' })
window.visualProbe().rows; // { VR1: { pass, findings, count }, … }
```

**F15.VR1 (2026-11-09 about 16:00, Q85.2):** a control case (a picture with no `alt`, an alternative that names the medium, an unnamed icon button, a bar told apart by colour with a rounded inner segment, a video that plays sound by itself) fails VR1–VR5 and VR7 as it should. Probed where this packet changed things and on the templates with pictures (Q101: only what a packet touches; the full sweep is in the Q99 audit): the 70 template layouts with pictures, avatars, media or data at 1000 CSS px pass VR1–VR7. **Fixed at the owner:** StackedBar's parts were told apart by colour alone (AF1, G1): it now draws a legend under the bar (each part's name and share beside its colour, hidden from assistive technology since the bar's name already says it; `legend={false}` only when the numbers are written beside it) and a hairline of the surface between segments; inner segments stay square. AF2 (category colours) stays in the build plan.

### Agent checklist (the look rows, in short)

- [ ] RC1–RC8 run for every piece of information; each choice recorded (task, primary, accompanying visual, alternative)
- [ ] Nothing that must be exact, verbatim or read as content was replaced by a visual (VX1–VX10)
- [ ] The view's main state is visible without reading body text (VU1)
- [ ] Every icon has a word, tooltip or accessible name; one set, one style, filled only for state
- [ ] Every image is real when it claims to be, cropped to its subject, with an alternative by role and its loading and failure states
- [ ] Every chart: takeaway title, direct labels, honest axes, category or spectrum colours by purpose, square inner segments, a table or description, all states
- [ ] No ML pitfall present
- [ ] No colour-only meaning; 3:1 for graphics, 4.5:1 for text; reduced motion and forced colours hold
- [ ] Visual-noise checks pass; tokens and library components only

## Assumptions

| # | Assumption | Risk | Cheapest check |
| --- | --- | --- | --- |
| VS1 | Agents can classify a reader's task (RC1) reliably from a view's purpose. | Wrong task → wrong chart or a chart where a number would do. | Run RC on 3 templates' views; compare choices with a human pass. |
| VS2 | One chart component per task family (not one per chart type) is enough for the templates. | Too few → views fork styles; too many → redundant variants. | Map every chart need in the templates to the CH table before building. |
| VS3 | The 8-colour category set covers real products' category counts. | More than 8 → colour reuse confuses. | Count categories in template data; enforce "Other" grouping. |
| VS4 | An empty-state illustration lowers the copy needed. | Illustrations add noise without reducing words. | A/B one empty state with and without, count words needed. **Built for review (F15.I11):** the conference's empty "My schedule" as A (silhouette, 25 words), B (illustration, 12 words) and C (illustration, 25 words) in the [EmptyState](https://prabinpebam.github.io/design-library/#/emptystate) story "Under test"; undecided |

## Decisions (working, revisable on review)

| # | Decision |
| --- | --- |
| VE1 | This page is the single source for representation choices; the agent guide links here for "how should I show this?". |
| VE2 | Charts are built as library components over the category and spectrum tokens, not by importing a styled chart library into views; a rendering engine, if any, sits behind a sealed component (choice in the build plan). |
| VE3 | Illustrations use one library style from tokens; a third-party illustration set needs the same licence review as icons. |
| VE4 | Data tables are the universal text alternative for charts; every chart component offers one. |

## Audit and build plan

**F15.V2 (2026-11-09, static audit, design mode):** the library's visual components (their source, props and `@a11y` contracts), the templates' view data (`packages/templates/*/content`, `assets.json`), the render block set (`packages/core/render/types.ts`) and the docs, checked against the rules above. Read from source; nothing was run or changed. **Severity:** **G1** a rule is broken (misleading, inaccessible or an owner rule); **G2** a needed capability is missing, so views fall back to text where the chain says to show; **G3** polish or documentation.

### What already holds

| Component | Rules it meets | Evidence |
| --- | --- | --- |
| Icon | IC8 decorative by default (`aria-hidden`), `label` makes it `role="img"`; IC9 directional icons mirror in right-to-left; IC2 semantic names over one active set | `react/fundamentals/Icon.tsx` |
| Button `iconOnly` | IC1: `label` becomes the accessible name *and* the tooltip, so an icon-only control always has its word | `react/fundamentals/Button.tsx` |
| Image | IM5 `alt` required, `""` for decorative; IM8 reserved ratio, soft fill while loading, failure shows the icon *and* the alternative as words; IM6 caption and credit as real text (`figure`); IM7 a Card's media slot owns the corners (Q69) | `react/fundamentals/Image.tsx` |
| Statistic | VC3 and VX8: the number in the reader's locale with its unit; the change in words plus a direction icon, never colour alone (CH7); colour only when `good` says which way is good news; the trend line is `aria-hidden` because the change already says it | `react/compounds/Statistic.tsx` |
| StackedBar | CH5 and owner Q34: inner segments square, only the whole bar's ends rounded; VA3: named by every part with its share, in order | `react/compounds/StackedBar.tsx`, `css/compounds/stacked-bar.css` |
| AllocationSlider | CH5 square inner segments; VK1 parts read `color.category.*`; CH7 the legend writes every share as text | `react/compounds/AllocationSlider.tsx` |
| Avatar, Flag | VC14 and VX7: a picture beside or standing for a name, initials and kind icon as fallbacks; Avatar's colour only tells people apart and keeps 4.5:1 for initials; Flag is decorative and never the only name (Q43) | `Avatar.tsx`, `Flag.tsx` |
| Badge, Rating | VC1 and VA6: tone or fill is never the only cue; words, icon or shape say it | `Badge.tsx`, `Rating.tsx` |
| MediaPlayer | MD2 nothing plays by itself; MD3 WebVTT tracks and a transcript; MD4 a poster with title and length; embeds load the remote player only on Play | `react/compounds/MediaPlayer.tsx` |
| Carousel, Lightbox, ImageGrid | MD2 autoplay has a visible Pause and stops for reduced motion; each picture keeps its alternative; IM4 the full picture is one action away | `Carousel.tsx`, `Lightbox.tsx`, `ImageGrid.tsx` |
| Progress, Skeleton, ImageGeneration | VC2 one operation indicator; IM8 and CH11 loading in the content's own shape; VA11 still under reduced motion with the words kept | `Progress.tsx`, `Skeleton.tsx`, `ImageGeneration.tsx` |
| DataTable | VX2 and VE4: the exact-value view, a native table with row and column headers | `react/compounds/DataTable.tsx` |
| EmptyState | IL1 in its quietest form: a still, decorative silhouette of the content to come (hidden from assistive technology), the reason and one action | `react/compounds/EmptyState.tsx` |
| Templates' editor toolbar | IC1 (frequent tools in a dense surface): every tool has an icon *and* a label for its name and tooltip | `templates/design/content/edit/design/editor.json` |

### Findings

| # | Sev | Where | Finding | Rule | Fix (owner of the change) |
| --- | --- | --- | --- | --- | --- |
| AF1 | **G1, fixed F15.VR1** | StackedBar | The parts are told apart on screen only by colour: no visible labels or legend in the component, and adjacent segments touch with no separation. The accessible name carries the shares, but a sighted reader with a colour-vision deficiency has only colour. | CH2, CH7, VA6, CH5 (hairline gap) | Add direct labels or a legend (`labels="legend" \| "inline" \| "none"`, legend by default) and a hairline gap in the surface colour between segments; the component, not the view (BP3). |
| AF2 | **G1** | StackedBar | Status colours only (`status: success…neutral`), so any part-to-whole that isn't a status (a budget by team, storage by file type) either can't use it or would misuse status colours for categories. | CH6, VK1, colour model | Add `category` per segment (reads `color.category.n`), keep `status` for status data; one of the two per bar (BP3). |
| AF3 | **G1** | Template assets (blog, conference, corporate, portfolio) | Five generic landscape pictures (`harbour`, `meadow`, `dusk`, `sand`, `frost`) illustrate cards, posts and heroes about unrelated topics, each with an informative alternative ("Blue hills by the sea…"). A screen reader hears a landscape on a card about a service; sighted people get decoration the framework says to drop. | IM1, IM5, V4, ML13 | Short term: mark placeholder pictures decorative where they're used. Root cause is AF4. Long term: templates show topic pictures or none. |
| AF4 | **G2** | `assets.schema.json`, render `picture` fields | Alternative text is fixed per *asset*, but its role is per *use* (the same picture is informative in a gallery and decorative beside a card title that says it all; [W3C decision tree](#sources)). Content can't say "decorative here". | IM5, VA2 | Allow a picture reference to carry its role: `"picture": { "id": "harbour", "decorative": true }` or an `alt` override per use; schema, render and `check:content` together (BP2). |
| AF5 | **G2** | Projects template, Burndown | "Points left by day" is a description list of four days: a trend shown as text. The title already states the takeaway ("13 points left, 4 days to go"). This is the canonical RC3 case for a line chart with an ideal line. | VC7, RC3, CH1 | A LineChart (with a reference line for the ideal) and its data table, then use it in the template's view data (BP4, BP5). |
| AF6 | **G2** | Projects template, Dashboard | "Points done 4, of 17" is progress toward a known end shown as two numbers; "Issues open 9" and "Bugs found 2" have no change or period, so the reader can't tell if they're good or bad. | VC2, VC3 | The `stats` block gains `change`, `direction`, `good`, `period` and `trend` (Statistic already has them) and a progress form for "x of y" (BP1). |
| AF7 | **G2** | Render block set | No block can show data visually: `stats` is numbers only, and there is no chart, progress, media or diagram block. Content-driven views (the agent's main path) can't follow RC4 at all. | V12, VC2–VC13, MD1 | Add blocks as their components arrive: `stats` fields first, then `chart` (one block, `kind` by task), `media` (MediaPlayer) (BP1, BP5). |
| AF8 | **G2** | Components | No chart components beyond StackedBar and Statistic's trend line: no bar, line, sparkline, dot, histogram, scatter, heatmap, bullet or meter. Planned in the [catalogue](component-catalogue.md#charts-and-data-visualisation-primitives) (bar, line, legend, axis, tooltip, data table view, chart states: must). | VC4–VC13, CH | Build plan BP4–BP8, in the catalogue's order, using this page's chart table. |
| AF9 | **G2** | Colour model | Sequential and diverging ramps have no component-readable role: components may read `color.category.*` but not `spectrum.*` (lint), and the [catalogue](component-catalogue.md#charts-and-data-visualisation-primitives) still says chart scales come from `set.*`, written before Q44. A heatmap or a diverging bar can't be built within the rules. | VK1, CH6 | Decide (VE5): generate `color.sequential.1–n` and `color.diverging.-n…n` roles from the spectrum the way Q44 generates category roles, with contrast checks; correct the catalogue line (BP6). |
| AF10 | **G2** | Image | No provenance for generated or composited pictures (IM3), and no focal point for cropping (`cover` crops the centre only, IM4). | IM3, IM4, V11 | `origin?: 'generated' \| 'illustration'` adding a small visible marker and a phrase in the accessible name; `focus?: 'top' \| 'centre' \| …` or `x y` mapped to `object-position` (BP2). |
| AF11 | **G3** | EmptyState | No illustration slot. The silhouette meets IL1 quietly; whether an illustration lowers copy is an assumption (VS4), so don't add one before it's checked. | VC16, IL1, VS4 | Test VS4 on one empty state first; only then an `illustration` slot reading one library style (BP9). |
| AF12 | **G3** | DataTable | No inline marks (a bar or sparkline in a cell), which is how a table keeps exact values and still shows shape. | VD3, VX2 | A `Sparkline` usable in a cell and a `bar` cell type after BP4 (BP7). |
| AF13 | **G3** | Agent guide, guide/2-content.md | Nothing tells an agent how to decide whether to show information as a visual or as text, or that a picture's alternative depends on its use. | VE1, VA2 | Link this page from the agent guide's task map (done in this packet); a line in guide/2-content after AF4 lands. |
| AF14 | **G3** | Slate docs host (outside the library) | The Slate TL;DR band draws a one-sided accent stripe. Slate is the docs runtime, not this library, so Q34 binds it only by the owner's taste; reported, not changed (Slate owns its runtime). | Q34 | Slate's owner decides; no library change. |

**No G1 in Icon, Image, Statistic, MediaPlayer, Carousel or the owner's segment rule.** The three G1 findings were StackedBar's colour-only parts (AF1, fixed in F15.VR1: a legend and a hairline between parts), its status-only colours (AF2) and the templates' placeholder pictures (AF3).

### Build plan

Ordered by what unblocks the most views and fixes G1 first. **Nothing here is built until the owner says so** (Q77 scope: framework, audit and plan). Each item is one reviewable packet of about 15–20 minutes in design mode (screens to open, no tests).

| # | Packet | Contents | Fixes | Depends on |
| --- | --- | --- | --- | --- |
| BP1 | Statistic in view data | `stats` block fields `change`, `direction`, `good`, `period`, `trend`; a progress form ("4 of 17 points") using Progress's bar; Dashboard updated | AF6, part of AF7 | — |
| BP2 | Picture roles and provenance | Picture references with `decorative` or a per-use `alt`; placeholder pictures in the four site templates marked decorative where they only decorate; Image `origin` and `focus` | AF3, AF4, AF10 | — |
| BP3 | StackedBar labels and categories | Legend by default (or inline labels), hairline gap between segments, `category` per segment; library page variants: status, category, many small parts, forced colours | AF1, AF2 | — |
| BP4 | Chart primitives and BarChart, LineChart | Shared frame (title as takeaway, subtitle, states, data table view), Axis, Legend, chart Tooltip (Popover), marks; BarChart (sorted, zero baseline, grouped and stacked as one component, square inner segments) and LineChart (reference line, gaps for missing data); library page shows each against the chart table | AF8, AF5 (component) | BP3 (legend shared) |
| BP5 | `chart` block and Burndown | One render block `chart` with `kind: bar \| line \| …` and data, its schema and check; Burndown uses a LineChart with the ideal line and keeps its table | AF5, AF7 | BP4 |
| BP6 | Sequential and diverging colour roles | Generated `color.sequential.*` and `color.diverging.*` roles with contrast checks; the catalogue's `set.*` line corrected | AF9 | owner decision VE5 |
| BP7 | Sparkline and table cells | Sparkline (shared with Statistic's trend); DataTable bar and sparkline cells | AF12 | BP4 |
| BP8 | Meter and bullet | Meter (value in a known range with zones) and a bullet form against a target | VC4 | BP4 |
| BP9 | Illustration check | VS4 tested on one empty state; an `illustration` slot only if it lowers copy | AF11 | — |
| BP10 | Later charts | Histogram and box plot, scatter, heatmap (after BP6), Sankey, maps: when a template needs them | AF8 | BP4, BP6 |

**Decision to make (VE5):** sequential and diverging colours as generated roles (proposed, like Q44's category roles) or as a purpose-declared set a chart compound may read. Proposed: generated roles, because the contrast check then holds for every theme.

## Done when

| # | Done when (observable) | Evidence |
| --- | --- | --- |
| VV1 | The framework states the philosophy with cited evidence and its limits (Q77.1). | [Why visuals](#why-visuals-what-the-research-says), [Sources](#sources) |
| VV2 | An agent can run the reasoning chain as a procedure and record its choice (Q77.2). | [RC1–RC8](#the-reasoning-chain), [agent form](#the-chain-as-an-agent-procedure) |
| VV3 | When not to visualize is explicit and extended beyond accuracy and content (Q77.3). | [VX1–VX10](#when-to-show-it-as-is) |
| VV4 | Each medium has purpose, use, accessibility, pitfalls, density and noise rules. | IC, IM, IL, MD, CH, ML, VA, VK, VD |
| VV5 | The library is audited against it with a build plan, and the agent guide links here. | [Audit and build plan](#audit-and-build-plan) (AF1–AF14, BP1–BP10); `packages/core/AGENTS.md` task map |

## Sources

- Bateman, S. et al. (2010). [Useful junk? The effects of visual embellishment on comprehension and memorability of charts](https://doi.org/10.1145/1753326.1753716). CHI.
- Borkin, M. et al. (2013). [What makes a visualization memorable?](https://doi.org/10.1109/TVCG.2013.234) IEEE TVCG 19(12).
- Cairo, A. (2019). *How Charts Lie: Getting Smarter about Visual Information.* W. W. Norton. And (2016) *The Truthful Art.* New Riders.
- Cleveland, W. S. & McGill, R. (1984). [Graphical perception: theory, experimentation, and application to the development of graphical methods](https://doi.org/10.1080/01621459.1984.10478080). JASA 79(387).
- Few, S. (2012). *Show Me the Numbers*, 2nd ed. Analytics Press; [Bullet graph design specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf) (2013).
- Financial Times. [Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary).
- Harp, S. F. & Mayer, R. E. (1998). [How seductive details do their damage](https://doi.org/10.1037/0022-0663.90.3.414). Journal of Educational Psychology 90(3).
- Healey, C. G. & Enns, J. T. (2012). [Attention and visual memory in visualization and computer graphics](https://doi.org/10.1109/TVCG.2011.127). IEEE TVCG 18(7).
- Heer, J. & Bostock, M. (2010). [Crowdsourcing graphical perception](https://doi.org/10.1145/1753326.1753357). CHI.
- Larkin, J. H. & Simon, H. A. (1987). [Why a diagram is (sometimes) worth ten thousand words](https://doi.org/10.1111/j.1551-6708.1987.tb00863.x). Cognitive Science 11(1).
- Mayer, R. E. (2009). *Multimedia Learning*, 2nd ed. Cambridge University Press (multimedia, coherence, redundancy, signalling and contiguity principles).
- Munzner, T. (2014). *Visualization Analysis and Design.* CRC Press (task abstraction; expressiveness and effectiveness).
- Okabe, M. & Ito, K. (2008). [Color Universal Design](https://jfly.uni-koeln.de/color/).
- Paivio, A. (1971). *Imagery and Verbal Processes.* Holt, Rinehart and Winston (dual coding).
- Pandey, A. V. et al. (2015). [How deceptive are deceptive visualizations?](https://doi.org/10.1145/2702123.2702608) CHI.
- Potter, M. C. et al. (2014). [Detecting meaning in RSVP at 13 ms per picture](https://doi.org/10.3758/s13414-013-0605-z). Attention, Perception, & Psychophysics 76.
- Shepard, R. N. (1967). [Recognition memory for words, sentences, and pictures](https://doi.org/10.1016/S0022-5371(67)80067-7). JVLVB 6(1).
- Shneiderman, B. (1996). [The eyes have it: a task by data type taxonomy for information visualizations](https://doi.org/10.1109/VL.1996.545307). IEEE VL.
- Standing, L. (1973). [Learning 10,000 pictures](https://doi.org/10.1080/14640747308400340). QJEP 25(2).
- Treisman, A. & Gelade, G. (1980). [A feature-integration theory of attention](https://doi.org/10.1016/0010-0285(80)90005-5). Cognitive Psychology 12(1).
- Tufte, E. R. (1983). *The Visual Display of Quantitative Information* (data-ink, lie factor, chartjunk, small multiples); (2006) *Beautiful Evidence* (sparklines). Graphics Press.
- Vessey, I. (1991). [Cognitive fit: a theory-based analysis of the graphs versus tables literature](https://doi.org/10.1111/j.1540-5915.1991.tb00344.x). Decision Sciences 22(2).
- Apple. [Human Interface Guidelines: Charting data](https://developer.apple.com/design/human-interface-guidelines/charting-data) and [Charts](https://developer.apple.com/design/human-interface-guidelines/charts) (marks, axes, accessibility, Audio Graphs).
- IBM. [Carbon data visualization](https://carbondesignsystem.com/data-visualization/getting-started/) and [chart anatomy](https://carbondesignsystem.com/data-visualization/chart-anatomy/).
- Google. [Material Design data visualization](https://m2.material.io/design/communication/data-visualization.html); [Material 3 icons](https://m3.material.io/styles/icons/overview).
- Microsoft. [Fluent 2 iconography](https://fluent2.microsoft.design/iconography) and [accessibility](https://fluent2.microsoft.design/accessibility).
- Nielsen Norman Group: [Icon usability](https://www.nngroup.com/articles/icon-usability/); [Photos as web content](https://www.nngroup.com/articles/photos-as-web-content/); [Image-focused design](https://www.nngroup.com/articles/image-focused-design/); [Choosing chart types](https://www.nngroup.com/articles/choosing-chart-types/); [Dashboards: making charts and graphs easier to understand](https://www.nngroup.com/articles/dashboards-preattentive/).
- W3C WAI. [Understanding SC 1.1.1 Non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html); [Images tutorial: an alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/) and [complex images](https://www.w3.org/WAI/tutorials/images/complex/); [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (1.2.x, 1.4.1, 1.4.2, 1.4.3, 1.4.5, 1.4.10, 1.4.11, 2.2.2, 2.3.1, 2.3.3).
- Elavsky, F. et al. [Chartability](https://github.com/Chartability/POUR-CAF): heuristics for accessible data visualization.
- National Eye Institute. [Color blindness](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness).
- Brewer, C. [ColorBrewer](https://colorbrewer2.org/): colour schemes for maps and charts.
- Project skills: `visual-noise`, `ui-copy`, `ui-states`, `spacing`, `design-system` (agentic-craft).
