# Images: audit and generation plan

> **TL;DR:** Every picture in the templates today is one of a handful of drawn placeholder landscapes (`harbour`, `meadow`, `dusk`, `sand`, `frost` and five chat scenes), reused across 60 places about unrelated things, with alt text that describes the landscape, not the subject ([AF3](visual-representation.md#findings)). This page lists every slot where a proper picture helps (location, purpose, display size, ratio, transparency, style set, alt intent), groups them into **style sets** (one per template, each with one reference image) and plans the generation in packets, one template per packet. Pictures are generated with the global GPT Image 2.5 skill by the project skill [`image-prompting`](#production-rules) and wired in through each template's `assets.json` and content JSON (Q64). Nothing here is approved.

**Owner, 2026-11-09 08:22 (verbatim, [DoD Q84](definition-of-done.md#owner-instructions)):** *"We have GPT 2.5 image generation skill available globally. For all image generation needs on this project, you can use that. I want plenty image generated. Make note of this very carefully. GPT 2.5 can generate image with true alpha transparency. It also works really well if you use a reference image for keeping consistency and that's often a good way to make sure the style stays consistent across multiple image generations. Do a deep search on effective prompting for gpt 2.5 image generatiuon and use the finding as a skill to prompt effectively. You can generate images at various resolution as needed. You can also generate images with transparent bg and trim out the transparent pixels from the images for proper use in the layout. Keeping transparent pixes can cause unnecessary/unwanted padding in the image. It's best to generate images in the resolution intended for its use, else we can have scaling inconsistencies where visual resolution of illustrations and elements within the illustrations will be inconsistent across images. Do an audit and identify all places in the Design library and in the templates where having a proper image would benefit. Generate necessary images an update the Design library properly. I believe proper images would make the templates look far better and complete."*

**Status:** F15.I1 (the skill and the trim tool) and F15.I2 (this audit) for review, strict design. Shaped by `visual-noise`, `ui-copy`, `design-system`, `performance` (proposed budgets only) and the [visual representation](visual-representation.md) framework (IM1–IM10, IL1–IL8). Stable IDs: slot classes **SC**, style sets **SS**, slots **IA** (template pictures), **IB** (library pictures), **IS** (slots that need a new seam), packets **IP**.

## Production rules

The project skill `.github/skills/image-prompting/SKILL.md` holds the researched method with its sources (OpenAI's GPT Image 2.5 prompting and generation guides, the transparent-assets cookbook, W3C WAI, web.dev). In short:

- **Generator:** the global `gpt-image-2-5` skill (`gpt-image-2.5-sunburst`), checked working on 2026-11-09. Draft at `low`, finalize at `high`; look at every result.
- **Prompt:** intended use → subject → details → composition → the set's style block (verbatim) → constraints (no text, logos, watermark or frame).
- **One reference image per style set:** the first finished picture; every later picture in the set is an edit with it as Image 1, "style reference only".
- **Resolution:** file = display size × 2; generated at the smallest allowed size at or above that; one generation size per slot class, so line weights and detail match.
- **Transparency:** `--background transparent` and an isolated-subject prompt; check the alpha; trim the transparent margins with `node ./tools/trim-alpha.mjs` (space comes from layout tokens, never from empty pixels).
- **Files:** WebP (quality 82), in `packages/templates/<template>/assets/`; provenance (prompt, model, size, reference, date, alt) in `assets-src/<set>/`; raw PNGs in the ignored `.design-library/image-raw/`.
- **Alt:** written from the finished picture; empty where the render already treats the picture as decorative (post lists) or the title says it all.
- **Stand-ins:** these are example pictures for example content (IM3): the fictional firms, venues and people are made up, so a generated picture is a placeholder a real site replaces with its own photographs (IM2). Provenance files make that explicit.

## Slot classes

Display sizes come from the layout tokens: the site column is `--c-site-layout-width` 72rem (1152 px); a split hero's picture takes half (about 560 px, ratio 3:2, `Hero`); cards sit in a `Grid` of 2 or 3 at 16:9 (`Card` media, at most about 560 px wide on a phone or in two columns); a stacked hero is full width at 16:9.

| ID | Slot | Display (CSS px, largest) | Ratio | Generate | Ship (2×) |
|---|---|---|---|---|---|
| SC1 | Content picture: split hero, card, post, figure | 560–600 | 3:2 (cards crop to 16:9 from the centre) | 1536×1024 | 1200×800 WebP |
| SC2 | Wide hero (stacked) | 1152 | 16:9 | 2304×1296 | 2304×1296 WebP |
| SC3 | Square picture (chat, card art) | 480 | 1:1 | 1024×1024 | 960×960 WebP |
| SC4 | Spot illustration, transparent | ≤ 240 | trimmed | 1024×1024 | ≤ 480 wide after trim, WebP with alpha |
| SC5 | Portrait (avatar, persona, speaker) | 96 | 1:1 | 1024×1024 | 192×192 WebP |
| SC6 | Example landscape (Carousel, Image stories) | 720 | 16:9 | 1536×864 | 1440×810 WebP |

A picture used in two slot classes (a card and a split hero) is generated for the larger one with its subject in the centre third, so the 16:9 card crop keeps it (IM4).

## Style sets

Each set has one style block, pasted verbatim into every prompt in the set, and one reference image, `assets-src/<set>/reference.webp`, made first.

| ID | Set | Medium and style block | Reference picture |
|---|---|---|---|
| SS1 | Harbour (bookshop example) | Warm editorial illustration, flat shapes with soft painted edges, no outlines; palette deep harbour blue, lamp amber, paper cream, brick red; evening lamplight from the left; calm, uncluttered | IA-H1 the shop on the quay |
| SS2 | Corporate (a freight firm) | Documentary photograph, natural overcast daylight, muted blues and greys with container orange as the one warm accent, eye level, people only small and from behind, no brand names or readable markings | IA-K1 a container ship at the quay at dawn |
| SS3 | Conference (interface conference in Lisbon) | Editorial architectural photograph, warm late-afternoon Lisbon light, terracotta, limestone white and river blue, clean lines, people small and unidentifiable | IA-C1 the hall before the first talk |
| SS4 | Blog (a designer's notes and walks) | Editorial gouache illustration, flat colour fields with soft edges, ink blue, sage, warm sand and one coral accent, gentle daylight from the upper left, lots of quiet space | IA-B4 the reservoir path |
| SS5 | Portfolio (a product designer's case studies) | Studio still life: matte paper, card and clay objects that stand for the project on a seamless pastel backdrop, soft top light, one small shadow, no screens with text | IA-P1 the wayfinding sign model |
| SS6 | Chat (pictures the assistant drew on request) | Soft painterly digital illustration, the assistant's house style: gentle brush texture, luminous sky, simple forms; each picture follows its request | IA-T1 the tarn in the morning |
| SS7 | Library examples | Natural landscape photographs for Carousel and Image stories, one per labelled scene; illustrated head-and-shoulders portraits for the people stories (abstract enough not to be real people, IL5) | IB1 Meadow |
| SS8 | People (fictional people in the templates) | The library portrait style block, verbatim: flat illustrated head-and-shoulders portraits, soft gouache edges, simplified features, one flat pastel background; one face per person, shared by every template that shows them | IB8 Ana Ruiz (the library portrait reference) |

## Template pictures

"Now" is the placeholder in that slot today. Alt intent: **I** informative (alt says what's shown), **D** decorative (`""`), as the render treats it: `posts` already renders its picture with empty alt; `cards`, `hero`, `picture` items and chat images read the asset's alt.

### Harbour (SS1)

| ID | Where | Purpose | Now | Class | Alpha | Alt |
|---|---|---|---|---|---|---|
| IA-H1 | `home` hero, "Books for slow evenings" | The shop: a lit window on the quay with a reading chair | `shelves` (drawn shelves) | SC1 | no | I |
| IA-H2 | `home` "New this week": The Long Shore (novel) | The book, cover art only, lying on a table (no title type) | none | SC1 | no | I |
| IA-H3 | `home` "New this week": Salt and Ink (essays) | As above | none | SC1 | no | I |
| IA-H4 | `home` "New this week": Small Boats (children) | As above | none | SC1 | no | I |

### Corporate (SS2)

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IA-K1 | `home` hero "Freight that arrives when you said it would" | A container ship being loaded at dawn | `harbour` | SC1 | I |
| IA-K2 | `home` and `services` card "Ocean freight"; `service` hero "Containers between 140 ports" | Stacked containers on a ship's deck at sea | `harbour` | SC1 | I |
| IA-K3 | `home` and `services` card "Air freight" | Cargo pallets loaded into a freighter's nose | `frost` | SC1 | I |
| IA-K4 | `home` and `services` card "Road and last mile" | A delivery truck at a depot dock door | `meadow`, `sand` | SC1 | I |
| IA-K5 | `services` card "Customs clearance" | An inspector's clipboard beside opened crates (no readable text) | `meadow` | SC1 | I |
| IA-K6 | `about` stacked hero "A family firm that grew up…" | An old brick warehouse with its loading doors open | `dusk` | SC2 | I |
| IA-K7 | `careers` hero "Keep the world's goods moving" | Warehouse aisle, two colleagues in hi-vis from behind | `sand` | SC1 | I |
| IA-K8 | `offices` card Rotterdam (head office) | A modern office by the water, cranes beyond | `harbour` | SC1 | I |
| IA-K9 | `offices` card Hamburg | A red-brick office beside a canal | `frost` | SC1 | I |
| IA-K10 | `offices` card Singapore | A glass office tower among trees, port in the distance | `dusk` | SC1 | I |
| IA-K11 | `news` post and `news-article` hero "A weekly sailing to Lagos from March" | A ship leaving port at sunrise | `harbour` | SC1 | D in the list, I in the hero |
| IA-K12 | `news` post "Singapore moves to a bigger home" | Moving boxes in a bright new office | `dusk` | SC1 | D |
| IA-K13 | `customers` card and `story` hero "Lumen Home cut stock-outs by half" | Full shelves of lamps and homeware in a warehouse | `sand` | SC1 | I |
| IA-K14 | `customers` card "Fresh flowers to 12 countries overnight" | Boxed fresh flowers in a cold store | `meadow` | SC1 | I |
| IA-K15 | `customers` card "Spare parts within 48 hours" | Labelled-free bins of machine parts | `frost` | SC1 | I |

### Conference (SS3)

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IA-C1 | `home` and `about-event` hero "Two days on the craft of interfaces" | The main hall before the first talk, stage lit, audience from behind | `dusk` | SC1 | I |
| IA-C2 | `venue` hero "Lisbon Congress Centre" | A modern limestone congress building by the river | `harbour` | SC1 | I |
| IA-C3 | `travel` card "Riverside Hotel" | A hotel front on the riverside | `harbour` | SC1 | I |
| IA-C4 | `travel` card "Alfama Rooms" | A guesthouse on a steep tiled lane | `sand` | SC1 | I |
| IA-C5 | `travel` card "Hostel Belém" | A bright hostel courtyard with bunks seen through a door | `meadow` | SC1 | I |

### Blog (SS4)

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IA-B1 | Post "One gap for every list of rows" (`index`, `author`) | Even rows of stones on a path, one equal gap between each | `meadow` | SC1 | D |
| IA-B2 | Post "Focus rings that never overlap" (`index`, `author`) | Ripples on still water that touch but never cross | `frost` | SC1 | D |
| IA-B3 | Post "Review something every hour" (`index`) | A desk by a window with a small clock and a sketchbook | `sand` | SC1 | D |
| IA-B4 | Post "The long way round the reservoir" (`saved`, `topic`) | A path curving round a reservoir under hills | `meadow` | SC1 | D |
| IA-B5 | Post "Reading a sky before it turns" (`saved`, `topic`) | Clouds building over a ridge, light changing | `dusk` | SC1 | D |
| IA-B6 | Post "A pack that weighs less than lunch" (`topic`) | A small day pack with its few things laid out | `sand` | SC1 | D |
| IA-B7 | `article` figure "Two fills, four pixels apart." | Two coloured blocks with a narrow even gap between them (the article's point) | `meadow` | SC1 | I |

### Portfolio (SS5)

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IA-P1 | `home` card and `project` stacked hero "Harbour wayfinding" | A model of a wayfinding sign post with arrow panels by a model quay | `harbour` | SC2 (card crops) | I |
| IA-P2 | `home` card "Paths of the north" | A folded trail map in paper and card | `frost` | SC1 | I |
| IA-P3 | `home` card "Desert light" | Clay dunes lit low from one side | `sand` | SC1 | I |
| IA-P4 | `home` card "Meadow school" | A paper model of a small school among grass | `meadow` | SC1 | I |
| IA-P5 | `work` card "Tidewater banking app" | A phone of card with abstract blue blocks for a balance | `harbour` | SC1 | I |
| IA-P6 | `work` card "Meadow Grocers" | Paper grocery bags with clay vegetables | `meadow` | SC1 | I |
| IA-P7 | `work` card "City parking permits" | A card permit and a small clay car on a street map | `frost` | SC1 | I |
| IA-P8 | `work` card "Type that breathes" | Large wooden letterforms with generous spacing (abstract shapes, no words) | `dusk` | SC1 | I |
| IA-P9 | `work` card "Kiln pottery booking" | Glazed bowls beside a small calendar of card | `sand` | SC1 | I |
| IA-P10 | `speaking` post "Designing for the week before payday" | A purse and coins on a kitchen table, paper style | `harbour` | SC1 | D |
| IA-P11 | `speaking` post "Twenty minutes to two" | A paper clock face at 1:40 | `frost` | SC1 | D |
| IA-P12 | `process` figure "The wall of quotes we sorted by moment." | A wall of sticky notes in columns (scribbles, no readable text) | `sand` | SC1 | I |
| IA-P13–P16 | `project` gallery "Harbour wayfinding pictures" (quilted, after IA-P1): the sign detail, the quay map, the colour swatches, early sketches | Show the case study's parts (found while wiring IP5; the audit's scan missed gallery lists) | `dusk`, `frost`, `meadow`, `sand` | SC1 | I |

### Chat (SS6)

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IA-T1 | `chat` thread "Draw me the view from Easedale Tarn in the morning"; `shared-chat` | A still tarn below fells just after sunrise | `tarnMorning` | SC1 (photo) | I |
| IA-T2 | Same thread, "And one at dusk" (generating) | The same view at dusk: an edit of IA-T1, only the light changed | `tarnDusk` | SC1 | I |
| IA-T3 | Thread "Three days in Lisbon": card "Alfama and the castle" | Alfama's roofs climbing to the castle walls | `lisbon` | SC1 | I |
| IA-T4 | Thread "A quiet design for a birthday card" | Soft hills and a pink sun with open sky for words (the reply describes this) | `card` | SC3 | I |
| IA-T5 | Reply "Here's a picture for you" (generating, stipple) | A sloping garden with three terraces | `garden` | SC3 | I |

### Design (editor example)

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IA-D1 | `editor` canvas shape's image fill and the inspector's fill list | A photograph a designer placed in a frame | `harbour` (resolved from the library's drawn pictures) | SC1 | D (the canvas names the layer) |

Projects has no picture slots: its views are data and lists, where the framework says charts, not pictures (AF5–AF7).

## Library pictures

| ID | Where | Purpose | Now | Class | Alt |
|---|---|---|---|---|---|
| IB1–IB7 | `stories/scenes.ts`: Carousel, Image, ImageGrid, Lightbox, Hero, Card stories | Seven labelled scenes: Meadow, Desert, Night, Lagoon, Lavender, Snow, Harvest, each a real-looking landscape matching its label and alt | Drawn SVG gradients | SC6 | I |
| IB8–IB17 | `stories/people.ts`: Avatar, AvatarGroup, Persona, ChatMessage, ListItem stories | One illustrated portrait per made-up name (ten), so a group shows different people | One silhouette for everyone | SC5 | I (the name) |
| IB18 | `stories/media/drift-poster.jpg`: MediaPlayer | The poster frame of the example video | A small drawn poster | SC6 | D (the player names the video) |
| IB19–IB23 | `apps/library/src/data/pictures.ts`: the chat app's view data | Same pictures as the chat template (IA-T1–IA-T5), shared, not regenerated | Drawn SVG landscapes | SC1/SC3 | I |

## Slots that need a new seam

These would help, but no content field or slot exists yet; each needs a public seam (a content field or a component slot) before a picture can go in, and some are gated by the framework.

| ID | Where | Why it helps | Seam needed | Gate |
|---|---|---|---|---|
| IS1 | Conference `speakers`, `speaker` | Recognising a speaker (IM1) | `picture` on speaker items, rendered as Persona | **Done (F15.I10)** |
| IS2 | Blog `author`, article byline | Recognising the author | `picture` on the author block | **Done (F15.I10)** |
| IS3 | Empty states (saved, search, my schedule) | Showing what will appear (IL1) | `illustration` on EmptyState (SC4, transparent) | AF11: test assumption VS4 on one empty state first. **Test built for review (F15.I11):** [EmptyState, "Under test"](http://127.0.0.1:8766/#/emptystate) |
| IS4 | Not-found and error pages (blog, conference, chat) | Orienting after a wrong turn (IL1) | Same `illustration` seam | As IS3 |
| IS5 | Conference `sponsors` wall | Sponsors are recognised by their marks | Logo pictures on SponsorWall items (fictional marks, SC4) | Logos may carry their own name (IM6) |
| IS7 | Design `editor` image fills (IA-D1) | A picture placed in a frame is the point of an image fill | The canvas draws image fills, and the template gains `assets.json` | Canvas renderer work in the Design template |
| IS6 | Chat `welcome`, `choose-style` | Showing what each style looks like before choosing | A picture per style option | Only if the choice is visual |

## Packets

One style set per packet, each openable in the template's standalone site, smallest first.

| Packet | Scope | Pictures |
|---|---|---|
| IP1 = F15.I3 | Harbour (SS1): the reference, then IA-H1–H4; the `cards` items gain `picture` | 4, **done** (below) |
| IP2 = F15.I4 | Corporate (SS2) | 15, **done** |
| IP3 = F15.I5 | Conference (SS3) | 5, **done** |
| IP4 = F15.I6 | Blog (SS4) | 7, **done** |
| IP5 = F15.I7 | Portfolio (SS5) | 16, **done** |
| IP6 = F15.I8 | Chat (SS6); Design (IA-D1) and the library's chat view data (IB19–IB23) checked and deferred | 5, **done** |
| IP7 = F15.I9 | Library scenes and portraits (SS7); the media poster (IB18) checked and kept | 17, **done** |
| IP8a = F15.I10 | Seams IS1, IS2: the `picture` field on `people` items, `person` and `byline`; one portrait per fictional person (SS8), also on the portfolio about page and the Design and Projects team lists | 11, **done** |
| IP8b = F15.I11 | IS3 gate: the VS4 test on one empty state (A/B/C), a provisional `illustration` prop used only by that story, the first spot illustration (SS9) | 1, **built for review** |
| IP8c | IS3/IS4 rollout if VS4 holds; IS5, IS6 | — |

**IP1 as built (F15.I3):** IA-H1 generated from text at 1536×1024 `high` and kept as the set's reference (`assets-src/harbour/reference.webp`); IA-H2–H4 generated as edits with it as Image 1 ("style reference only"), so the brushwork, lamplight and palette match. Shipped as `shopfront`, `theLongShore`, `saltAndInk`, `smallBoats` (1200×800 WebP, 150–185 KB each at quality 82; the painterly texture is heavy, AVIF would be about half). The drawn `shelves.svg` is gone; the agent guide's example names `shopfront`. Alt written from the finished pictures. Prompts in `assets-src/harbour/*.json`.

**IP2 as built (F15.I4):** IA-K1 (the ship loaded at dawn) is the reference; IA-K2–K15 are edits from it, so every picture shares the overcast-to-dawn light, the muted blue-grey palette and the orange accent. IA-K6 is the wide hero (2304×1296, WebP 72 to stay near 350 KB); the rest 1200×800, 90–175 KB. 21 picture uses across ten content files now name 15 pictures by subject (`shipAtDawn`, `officeHamburg`, …); the five drawn landscapes are gone. Generating five at once hit the deployment's rate limit (HTTP 429), so batches run two at a time.

**IP3 as built (F15.I5):** IA-C1 (the main hall before the first talk) is the reference; the venue and three places to stay are edits from it, in the same warm late-afternoon light. Six uses across four content files; the drawn landscapes are gone. 86–182 KB each (the tiled hotel front at WebP 74).

**IP4 as built (F15.I6):** IA-B4 (the reservoir path) is the reference; the other six are edits from it. The model painted it as soft gouache with visible brushwork rather than strictly flat fields, and the set follows it. IA-B2 was regenerated once: the first ripples crossed, which contradicts the post ("Focus rings that never overlap"). Eleven uses across five content files; the drawn landscapes are gone. 91–187 KB each (the stepping stones at WebP 72).

**IP5 as built (F15.I7):** IA-P1 (the paper model of the quay and its sign post, 2304×1296) is the reference; IA-P2–P16 are edits from it: matte paper and clay on a sage backdrop. The project gallery (IA-P13–P16) was missing from the audit and is now part of it. Thirteen picture fields and the five-item gallery rewired; the drawn landscapes are gone. The flat studio backdrop compresses well: 26–39 KB each, the wide hero 84 KB.

**IP6 as built (F15.I8):** IA-T1 (the tarn in the morning) is the reference; IA-T2 is an *edit of IA-T1* that changes only the light, so the dusk picture is visibly the same view, as the conversation asks ("And one at dusk, please"). IA-T3–T5 are style-referenced edits; the birthday card leaves its upper half as open sky, as the reply says. Asset ids are unchanged, so no content file changed; the five drawn SVGs are gone. Shipped at the chat column's 480 px × 2 (960×640, square 960×960), 108–215 KB (the busy garden is the heaviest). **Deferred:** IA-D1, because the Design editor's canvas doesn't draw image fills yet (its manifest says so) and the template has no assets, so a picture there would never be seen; it needs a canvas seam first (now IS7). IB19–IB23: `apps/library/src/data/pictures.ts` is imported nowhere, so there is nothing to replace.

**IP7 as built (F15.I9):** SS7 has two media, so it has two references, one per medium: IB1 (the morning hills, `assets-src/library/scenes/reference.webp`) for the six other landscape photographs, and IB8 (Ana Ruiz, `assets-src/library/people/reference.webp`) for the nine other illustrated portraits. Scenes are 1536×864 `high`, shipped 1440×810 WebP 78 (84–179 KB) in `packages/core/react/stories/media/scenes/` and imported with `?url` by `stories/scenes.ts`, labels and captions unchanged, alt rewritten from each finished picture; the Image story's credit now says "Generated for this library". Portraits are 1024² `high`, shipped 192×192 (3–5 KB) in `stories/media/people/`; `stories/people.ts` now maps each of the ten names to its own portrait (`portraits`), and the AvatarGroup, Avatar and Persona stories show each person's own face (Yusuf Demir and Mei Lin no longer borrow Ana's), with every fourth group member left on initials so the fallback still shows. They're flat illustrations with simplified features, clearly drawn, not likenesses (IL5); the name is the alt (Avatar and Persona label the person). **Kept:** IB18, because `drift-poster.jpg` is the first frame of the abstract `drift` video it introduces; a generated picture would show something the video doesn't.

**IP8a as built (F15.I10):** the core blocks gained one optional field, `picture` (an asset id), on `people` items, `person` and `byline` (types, `blocks.schema.json`, renderer, agent index, core changelog); Persona and Avatar draw it, initials otherwise. **SS8 People** is one portrait per fictional person, drawn in the library portrait style (Image 1 = `assets-src/library/people/reference.webp`, flat illustration, not likenesses, IL5), because the same people recur across templates: Ama Mensah, Jonas Lind and Keiko Arai appear in Conference, Design and Projects, and Mina Haddad is both the blog's author and a speaker; each keeps one face everywhere. Eleven portraits (1024² `high`, shipped 192×192, 3–5 KB): ten speakers in Conference (home, speakers, speaker, session), Mina Haddad on the blog's author page and byline, Asha Rao on the portfolio about page, and the Design and Projects team lists (both templates gained `assets.json`). Alt is empty on purpose: the name sits beside every portrait. Prompts in `assets-src/people/`.

**IP8b as built (F15.I11):** the gate before IS3/IS4. The conference's empty "My schedule" is shown three ways in the [EmptyState](http://127.0.0.1:8766/#/emptystate) story "Under test: an illustration instead of words (VS4)": A today (silhouette, 25 words: title 4, reason 18, action 3), B an illustration and 12 words (the picture carries "by time, with their rooms"), C the illustration with all 25 words. EmptyState gained a provisional `illustration` prop (decorative, in the silhouette's place, never wider than it) that only this story uses; no template uses it until VS4 is decided, and the prop goes if VS4 fails. The illustration is the first of **SS9 Spot illustrations** (flat gouache, pastel indigo, sage, sand and one coral accent, transparent; generated from text, `assets-src/spot/reference.webp`), 1024² transparent `high`, real alpha, trimmed to 160×177 CSS px (320×353 WebP, 14 KB).

Each packet replaces its placeholder SVGs, writes alt from the finished pictures, keeps `npm run check:content` and the build passing, and records the pictures here as done.

## Sources

- [Visual representation](visual-representation.md): IM1–IM10, IL1–IL8, finding AF3 (placeholder pictures with mismatched alt), AF4, AF11.
- The `image-prompting` skill (`.github/skills/image-prompting/SKILL.md`) and its sources: OpenAI [Image prompting](https://developers.openai.com/api/docs/guides/image-prompting), [Image generation](https://developers.openai.com/api/docs/guides/image-generation), [Transparent image assets](https://developers.openai.com/cookbook/examples/multimodal/transparent-image-assets-for-campaigns-and-presentations); W3C WAI [alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/); web.dev [Serve responsive images](https://web.dev/articles/serve-responsive-images).
