# Component coverage

> **TL;DR:** What "exhaustive" means for each component, benchmarked against the major design systems: sizes, types, states, content options, how size composes with the space and shape options, and accessibility, each marked **must**, **should** or **skip** with a reason. Button is covered in full and is built next (F15.1); every other component gets the same treatment in its own packet (F15.2+). Owner's direction: [DoD row Q28](definition-of-done.md#owner-instructions). Nothing here is approved.

Owner, 2026-11-07 15:49 (verbatim): *"There is so much more needed for each component type. We need to make this exhaustive. I've give the samples of btns - sizes: xs, s, normal, m, l, xl, xxl - Types: Icon btns, dropdown btn, segmented btn - In progress stae for all, variations of in progress state - Variation 1: Spinner inside btn - Variation 2: Spinner on the border off the button. - There is definitely more states and variations that we should cover … Do the same exercise for all other components by benchmarking and researching what's there on the web. Go ahead and implement this for all the componenets one by 1 by preparing DoD and working against DoD."*

## Method

- **Sources**, official documentation only. *Fetched* means the page was read for this packet on 2026-11-07; *cited* means the official page is named from prior knowledge and wasn't re-read here, so treat its details as to be checked when that component's packet runs.

| System | Button page | Read |
| --- | --- | --- |
| Material 3 | [m3.material.io/components/buttons](https://m3.material.io/components/buttons/specs) | Cited (the page renders client-side only) |
| Fluent 2 | [fluent2.microsoft.design, Button](https://fluent2.microsoft.design/components/web/react/core/button/usage) | Cited |
| Carbon | [carbondesignsystem.com, Button](https://carbondesignsystem.com/components/button/usage/) | Fetched (state tokens: hover, focus with inset, active, disabled per kind) |
| Spectrum 2 | [spectrum.adobe.com, Button](https://spectrum.adobe.com/page/button/) | Cited |
| Polaris | [polaris-react.shopify.com, Button](https://polaris-react.shopify.com/components/actions/button) | Cited |
| Atlassian | [atlassian.design, Button](https://atlassian.design/components/button) | Cited |
| Primer | [primer.style, Button](https://primer.style/product/components/button/) | Fetched (sizes small, medium, large; `loading` with `loadingAnnouncement`; `inactive`: looks disabled, stays focusable, keeps contrast, can explain why; `block`; `count`; `labelWrap`; advice to avoid `disabled`) |
| shadcn/ui on Radix | [ui.shadcn.com, Button](https://ui.shadcn.com/docs/components/button) | Cited |
| Ant Design | [ant.design, Button](https://ant.design/components/button) | Fetched (page reached; details cited) |
| GOV.UK | [design-system.service.gov.uk, Button](https://design-system.service.gov.uk/components/button/) | Cited |
| WAI-ARIA APG | [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [Menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) | Cited |
| Open UI | Not consulted for Button (no button research); used for Select and popover in their packets | — |

- **Owner constraints apply to every row:** one variant per need (no redundant variants); Switch for binary settings (toolbar toggle buttons wait for an owner decision); no one-sided borders; notifications auto-dismiss; padding at the right interior layer with unclipped focus; square inner segments in bars.
- **Size framework:** sizes are per instance (`xs`, `s`, `normal`, `m`, `l`, `xl`, `xxl`); the theme's space option changes the space around components, never their size; the shape option changes radii at every size ([Button DoD](definition-of-done.md#button-f151)).

## Button (built in F15.1)

### Sizes

What the systems offer: Material 3 five (XS to XL); Carbon five (sm 32, md 40, lg 48, xl 64, 2xl 80 px); Spectrum four (S to XL); Polaris four (micro, slim, medium, large); Fluent, Primer and Ant three; shadcn three plus an icon size; GOV.UK one. The owner asks for seven, which covers the union.

| Size | Height | Type | Icon | Hit area | Use |
| --- | --- | --- | --- | --- | --- |
| `xs` | 24 px | caption (14) | 16 | 24 px (WCAG 2.5.8 minimum; dense exception) | Inline in dense tables and chips |
| `s` | 36 px | body-sm (14) | 16 | 36 px (the dense target, as the title bar today) | Dense toolbars and title bars |
| `normal` (default) | 44 px | label (16) | 20 | 44 px | Everywhere else |
| `m` | 48 px | label (16) | 20 | 48 px | Forms that want more weight |
| `l` | 56 px | label (20) | 24 | 56 px | Primary page actions |
| `xl` | 64 px | label (20) | 24 | 64 px | Hero and marketing |
| `xxl` | 80 px | heading-4 (24) | 32 | 80 px | Showcase, kiosks |

**Must.** The current `md` (36 px) becomes `s`; today's default stays `normal`, so nothing changes look by side effect.

### Types

| Type | Systems | Decision |
| --- | --- | --- |
| Text, icon + text | All | **Must** (exists) |
| Icon-only | All (Carbon, Fluent, Primer IconButton; shadcn `icon` size) | **Must**: one Button with `iconOnly`, named by `label`, which is also its tooltip; square at every size |
| Dropdown button | Fluent MenuButton, Atlassian, Primer ActionMenu, Ant Dropdown.Button | **Must**: the existing MenuButton, made to take the same seven sizes and emphases (no second dropdown) |
| Split button (action + menu) | Fluent, Atlassian, Carbon, Ant | **Should**: built as a ButtonGroup of a Button and an icon-only MenuButton, not a new component |
| Segmented button | Material 3 segmented buttons, Ant Segmented, Fluent | **Must, reconciled:** SegmentedControl already is the segmented button (one exclusive choice that applies at once); it gains the size scale. No second segmented component. |
| Button group | Carbon ButtonSet, Atlassian ButtonGroup, Ant Space.Compact, Polaris ButtonGroup | **Must** (owner: fundamental): related buttons as one named group (`role=group`), spaced or joined |
| Toggle button (`aria-pressed`) | Material, Fluent ToggleButton, Polaris `pressed` | **Skip until the owner decides:** the owner's rule is Switch for binary settings; a toolbar's bold/italic needs a ruling |
| Link styled as a button | Primer `as="a"`, Carbon `href` | **Should**: an `href` renders an `a` with the same look, for navigation that must look like an action (GOV.UK start button) |
| Floating action button | Material FAB, Ant FloatButton | **Skip for now:** a compound (placement is a layout decision) |
| Counter | Primer `count` | **Should**: a trailing Badge slot, not a new prop family |

### Emphasis

Primary, default, quiet exist. **Must:** a danger emphasis for destructive actions (Carbon, Primer, Ant, Polaris, GOV.UK warning) reading `color.status.danger`. **Skip:** tertiary/ghost/outline/plain as further variants (redundant with default and quiet).

### States

| State | Decision |
| --- | --- |
| Rest, hover (inside `@media (hover: hover)` with an `:active` twin), pressed, focus-visible | **Must** (exist) |
| Disabled (`disabled`) | **Must**, discouraged in copy (Primer, GOV.UK): not focusable, so no reason can be heard |
| Unavailable with a reason (`aria-disabled` + description) | **Must** (Primer `inactive`): focusable, keeps 3:1, says why |
| In progress, **inside**: the spinner replaces the icon (or sits before the label), present-tense label | **Must**, every type and size (exists for text buttons) |
| In progress, **border ring**: an arc travels around the button's own outline, the content stays | **Must** (owner's variation 2), the same arc as the Switch knob (F9); every type and size |
| Both in-progress forms: no width or height change, `aria-busy`, label announced once, ≥3:1 arc, the click locked with `aria-disabled` (never `disabled`), reduced motion holds a still arc | **Must** |
| Confirmed (tick, past tense, held `duration.confirm-min`), failed (back to rest; the error shows at its scope) | **Must** (exist) |
| Selected/pressed | Skip with the toggle button above |
| Full width (`block`) | **Should** (Primer, Ant): a layout prop that never changes height |
| Long label | **Must**: wraps inside the button only when asked (Primer `labelWrap`), otherwise one line |

### Composition with the space and shape options

Size is per instance; the theme's space option changes gaps and insets around buttons, never their height (so a compact theme doesn't shrink touch targets). The shape option changes the radius at every size; a pill (`radius.pill`) stays a pill. Icon-only buttons stay square. In a ButtonGroup the members' inner corners stay square and only the group's outer ends round, as with bar segments.

### Accessibility

Native `button`; Enter and Space; a visible, unclipped focus ring at every size; icon-only named by `label` with the same words as the tooltip; a menu button follows APG (opens with Enter, Space, Arrow down); a group is `role=group` with a name; contrast 4.5:1 for labels and 3:1 for the outline and the progress arc in all four contexts.

## The rest of the inventory (one packet each, F15.2+)

Each row lists the must-haves found missing today; the full matrix is written when its packet starts.

| Component | Sizes | Missing musts | Notes |
| --- | --- | --- | --- |
| TextField, TextArea | Same seven-step scale as Button for height (TextArea: rows) | Prefix and suffix slots, clear action, character count, read-only styling, `aria-invalid` with message on blur. **TextField built in F15.2** ([DoD T.1–T.6](definition-of-done.md#textfield-f152)); **TextArea in F15.3** ([DoD A.1–A.6](definition-of-done.md#textarea-f153)) | Fluent, Carbon, Primer, GOV.UK |
| TextField input types (Q40 P1) | Seven-step scale; attached parts share it | **Built in F15.2b**: country-code menu before the box, attached action (icon-only, icon + label, primary; Enter presses it), shortcut key hint, removable scope chip, `inputMode` keyboards, units, fixed `https://`, one-time code (`type="code"`, `one-time-code` autofill), colour swatch. **Coverage only, not built:** date, time and date-range fields (a picker each; the platform inputs differ by browser), tag/token input with many chips, masked formats (card, IBAN) | Benchmarks: Material 3 text fields (prefix/suffix, leading/trailing icons), Fluent 2 SearchBox and Input (contentBefore/contentAfter), Spectrum SearchField, GitHub search ("/" shortcut, scope qualifiers), Apple and Android one-time-code autofill, intl-tel-input (country code + format), Stripe Elements |
| NumberField (Q40 P2, new fundamental) | Seven-step scale; inspector rows use `s` | **Built in F15.7**: steppers with hold-to-repeat; scrub by dragging the glyph or icon (pointer lock, hidden cursor, Shift ×10, Alt ×0.1, Escape cancels); arrows, Shift ×10, Alt ×0.1, Page Up/Down, Home/End; min/max/step clamping and precision; units parsed (px, %, °); arithmetic and relative entry ("12*2", "+4"); "Mixed"; glyph or icon + input (X/Y/W/H/rotation/radius); linked W/H with Keep proportions; swatch + hex + opacity (platform picker, as ColourField); wheel only while focused. **Not built:** a slider inside the field, angle dial, scrub acceleration curves | Benchmarks: Figma inspector (scrubbing labels, math in fields, Mixed), Adobe Spectrum NumberField and its `useNumberField` (steppers, wheel only when focused), WAI-ARIA APG spinbutton pattern (keys, `aria-valuenow`/`valuetext`), Fluent 2 SpinButton (hold-to-repeat), Blender and Webflow (drag-to-scrub with pointer lock) |
| Select | Seven-step scale | **Built in F15.4** ([DoD S.1–S.6](definition-of-done.md#select-f154)): sizes, leading icon, placeholder, groups, unavailable options, read-only, optional, commit states, loading and empty lists. F15.43 `multiple` (boxes, list stays open, applies once on close); F15.44 `search` is the Combobox (list autocomplete, async through `onSearch`, works with `multiple`) | APG select-only combobox, Open UI customizable select, Fluent Dropdown, Carbon Dropdown, Atlassian Select |
| Checkbox | `s`, `normal`, `l` | **Built in F15.5** ([DoD K.1–K.6](definition-of-done.md#checkbox-and-checkboxgroup-f155)): three sizes, mixed, description, invalid, CheckboxGroup with legend | APG checkbox, Fluent, Carbon, Spectrum, GOV.UK |
| Switch | `s`, `normal`, `l` | **Built in F15.6** ([DoD W.1–W.4](definition-of-done.md#switch-sizes-f156)): three sizes, description line, label first | Owner: the binary-setting control; Fluent, Carbon, Spectrum, Atlassian |
| SegmentedControl | Seven-step scale | Icon + text segments, disabled segment | Doubles as the segmented button |
| MenuButton | Seven-step scale, emphases | Submenus (skip), checkable items (skip: use Select), separators and group headings | APG menu button |
| ListItem | `s` 32 px (dense desktop menus; 44 px on a coarse pointer), `normal` 44, `l` 56 | **Built in F15.8** ([DoD L.1–L.6](definition-of-done.md#listitem-f158)): roles option, menuitem, menuitemcheckbox (check), menuitemradio (dot); multi-select option with a leading box (no row tint: one cue); one, two and three lines (description clamped to two); leading icon, inset (icon column kept), avatar (picture or initials), thumbnail, palette; trailing meta, shortcut (`aria-keyshortcuts`), submenu chevron (`aria-haspopup`), check; danger tone; unavailable with a reason. **Not built:** link items (`href`), trailing actions inside an item (a second focus stop; belongs to a list compound), drag handle, swipe actions, loading item (the list's own message covers it) | Benchmarks (official pages named, not re-read; their SPAs don't render to the fetcher): Material 3 Lists (one/two/three-line, leading icon/avatar/image/checkbox, trailing meta/icon), Fluent 2 MenuItem and MenuItemCheckbox/Radio (secondaryContent shortcut, submenu indicator, hasIcons alignment), Carbon Menu (danger item, shortcut), Apple HIG Menus (checkmarks, key equivalents), WAI-ARIA APG Menu and Listbox (roles, `aria-checked`, `aria-selected`, multiselectable) |
| Badge | `s` 20 px, `normal` 24 px | **Built in F15.9a** ([DoD B.1–B.6](definition-of-done.md#badge-f159a)): label, count, dot, status, presence; six tones, subtle/strong, icon; anchored to a host. **Not built:** category colours (colour-model change), progress, animated count | Catalogue [Badges, tags and chips](component-catalogue.md#badges-tags-and-chips) |
| Chip, ChipGroup (new fundamentals) | Chip `s` 24, `normal` 32, `l` 40 | **Built in F15.9b** ([DoD C.1–C.5](definition-of-done.md#chip-and-chipgroup-f159b)): input (remove, read-only, primary action, invalid), filter (checkbox or radio), avatar/icon; group label, description, error, empty, "+n" overflow, one Tab stop | Catalogue [Badges, tags and chips](component-catalogue.md#badges-tags-and-chips) |
| Avatar (Q52, new fundamental) | 16, 20, 24, 32 (default), 36, 40, 44, 48, 56, 64, 80, 96, 128 px; 24–80 match the control sizes xs–xxl | **Built in F15.25**: picture → initials on a name-hashed category colour → kind icon; circle (person) or rounded square (organisation, team, bot); presence and state badges sized with it; count; activity ring; loading; button, link, decorative. **“What else”, by research:** activity ring for speaking or typing ([Fluent 2 Avatar](https://fluent2.microsoft.design/components/web/react/core/avatar/usage), read); square for groups, teams and companies (Fluent 2, read); state icons approved, declined, locked, warning that take precedence over presence, decorative `label=""`, a distinct agent shape, a default picture on load error ([Atlassian Avatar examples](https://atlassian.design/components/avatar/examples), read); presence glyphs unreadable at 32 px and below, so say the state in words nearby (Fluent 2 accessibility, read); font size following the avatar size (Ant Design Avatar “autoset font size”, catalogue). **Adopted:** all of these, except a hexagon for agents (owner Q52.3: bots are rounded squares) and a `locked` state (no lock icon yet). **AvatarGroup and Persona built in F15.26** (stack or spread, “+n” dialog; Persona after or below, Edit photo). Spread on hover is left out: it moves geometry on hover. **Open:** ListItem and Chip draw their own avatar parts; moving them onto Avatar is a visual change for a separate packet | Catalogue [Data display](component-catalogue.md#data-display-tables-and-trees) Avatar and Avatar group rows |
| Progress | Bar heights `s`, `normal`; inline spinner tied to type size | Label and value text, buffer (skip) | One indicator (owner) |
| Link | Inherits text size | External marker, visited where meaningful, standalone vs inline | |
| Icon | `sm`, `md`, `lg` (+ `xl` for `xxl` buttons) | — | |
| Text, Heading, Code, List | Type scale | Truncation with full text available, numbered list | |
| Stack, Cluster, Grid | Space roles | — | Arrangement |

## Atiya compounds mapped (Q53.3)

[atiya/design](https://prabinpebam.github.io/atiya/design/) lists 43 compounds (read 2026-11-08). Each is mapped to its generic equivalent in the [Component catalogue](component-catalogue.md); **site-specific** ones are atiya's own home views and pages, not library components, so only their generic parts are listed. Built: 4; partial: 9; missing: 19; site-specific: 11. Adapt patterns only; never copy atiya's files, pictures or words.

| Atiya compound | Generic equivalent | Here | Gap or note | Catalogue family |
| --- | --- | --- | --- | --- |
| ActionBar | Actions row: Toolbar or a Cluster of Buttons | Partial | Toolbar and Cluster exist; no wrapping "action bar" with overflow | [actions-and-buttons](component-catalogue.md#actions-and-buttons) |
| AlbumBand | Image grid section with a heading and See all | Site-specific | Generic parts: Image grid (missing), Link | [media](component-catalogue.md#media) |
| AlbumGrid | [ImageGrid](http://127.0.0.1:8766/#/imagegrid) `justified` | Built (F15.37) | Image grid `justified` (no picture cropped past a quarter) | [media](component-catalogue.md#media) |
| ArticleHeader | PageHeader with eyebrow, standfirst, byline, tags, lead image | Partial | PageHeader exists; byline, tags and lead picture missing | [typography-content-and-utilities](component-catalogue.md#typography-content-and-utilities) |
| ArticleMinimap | Scroll position minimap / table of contents | Missing | Catalogue Navigation: table of contents with scroll spy | [navigation](component-catalogue.md#navigation) |
| Bento | Bento grid layout | Site-specific | Generic part: a bento Grid arrangement (layout tier) | [layout-tier](component-catalogue.md#layout-tier) |
| Breadcrumbs | [Breadcrumbs](http://127.0.0.1:8766/#/breadcrumbs) | Built (F15.29) | Must in Navigation | [navigation](component-catalogue.md#navigation) |
| Carousel | Carousel | **Built (F15.27)** | Adapted: peek, dots pill, autoplay fill, thumbnails; not video, blur or wrapping filmstrip | [media](component-catalogue.md#media) |
| ChoiceGroup | RadioGroup, CheckboxGroup | **Built** | F15.5, F15.16 | [selection](component-catalogue.md#selection) |
| Collection | Card collection: list, grid, bento layouts of one item shape | Partial | Card built (F15.33) in Grid; list and bento arrangements are the layout tier | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| ContactForm | A form from Field, TextField, TextArea, Button | Partial | All parts built; no form pattern page (submit, errors summary, sent state) | [inputs](component-catalogue.md#inputs) |
| ContactPanel | Contact details with copy, or an embedded form | Site-specific | Generic parts: Button, copy action (CodeBlock pattern) | — |
| ContentsList | IndexList (numbered index of sections) | Partial | IndexList exists without the large numbered style | [typography-content-and-utilities](component-catalogue.md#typography-content-and-utilities) |
| ContributionHero | Calendar heatmap chart | Site-specific | Generic part: heatmap (Charts, later) | [charts-and-data-visualisation-primitives](component-catalogue.md#charts-and-data-visualisation-primitives) |
| Cover | Cover / hero layout | Site-specific | A home view; generic part is the layout tier Cover | [layout-tier](component-catalogue.md#layout-tier) |
| Dialog | [Dialog](http://127.0.0.1:8766/#/dialog) | Built (F15.32) | Must in Overlays (build order step 4) | [overlays](component-catalogue.md#overlays) |
| Figure | [Image](http://127.0.0.1:8766/#/image) with caption and credit (`figure`) | Built (F15.36) | Image fundamental (Media) with `caption` and `credit` | [media](component-catalogue.md#media) |
| Gallery | [ImageGrid](http://127.0.0.1:8766/#/imagegrid) (justified, mosaic, row) | Built (F15.37) | ImageGrid `justified`, `quilted`, `masonry`, `standard` | [media](component-catalogue.md#media) |
| Hero | [Hero](http://127.0.0.1:8766/#/hero) | Built (F15.53) | Layout section: split, stacked, divided; PageHeader stays the ordinary page head | [layout-tier](component-catalogue.md#layout-tier) |
| HighlightCard | [Card](http://127.0.0.1:8766/#/card) (media card) | Built (F15.33) | Card with a picture, `beside` for a lead | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| HomeLead | Hero with facts and two actions | Site-specific | Generic parts: PageHeader, DescriptionList, Button | — |
| Keywords | Search-led home view | Site-specific | Generic parts: TextField search, Chip filters | — |
| Lightbox | [Lightbox](http://127.0.0.1:8766/#/lightbox) | Built (F15.38) | On Dialog's native modal pattern; opened from ImageGrid | [media](component-catalogue.md#media) |
| NextPrev | [Pagination](http://127.0.0.1:8766/#/pagination) `variant="sequence"` | Built (F15.31) | Navigation: Pagination (previous and next by name) | [navigation](component-catalogue.md#navigation) |
| PageShell | App or page shell layout | Partial | LibraryLayout, PageLayout and (F15.71) [SiteLayout](http://127.0.0.1:8766/#/sitelayout) for websites, with its own skip link | [layout-tier](component-catalogue.md#layout-tier) |
| PlaceBar | Contextual top bar with Back and Close | Partial | TitleBar exists | [navigation](component-catalogue.md#navigation) |
| ProofGrid | DataTable (matrix) | Site-specific | Generic part: DataTable, built | — |
| Questions | [Accordion](http://127.0.0.1:8766/#/accordion) / FAQ list, or list-detail | Built (F15.35) | Accordion; list-detail is the layout tier | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| Recommendations | [Quote](http://127.0.0.1:8766/#/quote) cards | Built (F15.39) | Quote `size="s"` in a Card | [typography-content-and-utilities](component-catalogue.md#typography-content-and-utilities) |
| RelatedStories | [Card](http://127.0.0.1:8766/#/card) list | Partial | Card built (F15.33); a list of them is a Grid or a Stack | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| SideNav | Navigation (side) | **Built** | Navigation compound | [navigation](component-catalogue.md#navigation) |
| SiteFooter | [Footer](http://127.0.0.1:8766/#/footer) | Built (F15.52) | Link sections, small print, identity and legal lines | [layout-tier](component-catalogue.md#layout-tier) |
| SiteHeader | [SiteHeader](http://127.0.0.1:8766/#/siteheader) | Built | F15.71: name and mark, places, actions; a Menu list below 48 rem of its own width | [navigation](component-catalogue.md#navigation) |
| SplitView | [ListDetail](http://127.0.0.1:8766/#/listdetail) | Built (F15.51) | Layout tier; one side at a time with Back below its container's width | [layout-tier](component-catalogue.md#layout-tier) |
| Spotlight | Featured item stage | Site-specific | Generic parts: Carousel, Card | — |
| StatTiles | [Statistic](http://127.0.0.1:8766/#/statistic) tiles | Built (F15.34) | Statistic in a Grid, or in a Card for a tile | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| StoryCard | [Card](http://127.0.0.1:8766/#/card) (article card) | Built (F15.33) | Card `href` (one link), eyebrow, facts; `row` and `plain` | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| Table | DataTable | **Built** | Sorting and selection still missing | [data-display-tables-and-trees](component-catalogue.md#data-display-tables-and-trees) |
| Tabs | [Tabs](http://127.0.0.1:8766/#/tabs) | Built (F15.30) | Navigation: Tabs (APG tabs) | [navigation](component-catalogue.md#navigation) |
| UnlockPanel | Sign-in form | Site-specific | Generic parts: Field, TextField, Checkbox, Button | — |
| VideoEmbed | Media player / video with facade | Built (F15.49 [MediaPlayer](http://127.0.0.1:8766/#/mediaplayer); own control bar next) | Media: Media player | [media](component-catalogue.md#media) |
| ViewChoices | Choice tiles | Site-specific | Generic part: RadioGroup tiles, built | — |
| Voices | [Quote](http://127.0.0.1:8766/#/quote) with author, one at a time | Built (F15.39) | Quote `size="l" align="center"` as Carousel slides | [typography-content-and-utilities](component-catalogue.md#typography-content-and-utilities) |

**Build order for the generic missing ones** (catalogue order, after the Inputs and Selection Musts already queued): Breadcrumbs, Tabs, Pagination (NextPrev) in Navigation; Dialog, then Lightbox on it, in Overlays and Media; Card (StoryCard, HighlightCard, Collection, RelatedStories), Statistic (StatTiles) and Accordion (Questions) in Data display; Image (Figure) and Image grid (Gallery, AlbumGrid), then Media player (VideoEmbed); Quote (Voices, Recommendations); then the layout tier (list-detail SplitView, footer, hero).

## Templates mapped (Q61, Q62, F15.71)

Owner, 2026-11-08 18:24 and 18:29 (DoD Q61, Q62): preset layouts for seven kinds of product, grouped as **templates** (a template is a named collection of layouts). What each template needs, and what it still lacks. *Built* = every part exists; *gap* = a component or prop to build in that template's packet, generic, with props and stories.

| Template | Layouts | Built on | Status | Gaps (packet) |
| --- | --- | --- | --- | --- |
| Corporate site | Home, About, Careers, Contact | SiteLayout, SiteHeader, Hero, Section, Grid, Card, Statistic, Quote, DescriptionList, TextField, Select, TextArea, Footer | Built (F15.71) | A logo strip of customers; a mega menu; job filters; portraits for people (no drawn people) |
| AI chat | Chat | ChatLayout and the chat compounds (F15.64–F15.70) | Built (F15.70, F15.71) | Rail sidebar; search as you type; edit in place; voice mode; Canvas (recorded in the ChatGPT inventory above) |
| Portfolio | Home, Project, About | SiteLayout, SiteHeader, Hero, Card, Quote, Breadcrumbs, DescriptionList, ImageGrid, form controls | Built (F15.72) | Opening a gallery picture large (Lightbox exists, not wired); portraits |
| Blog | Index, Article, Author | SiteLayout (`reading`), Card (row), Pagination, Persona, Breadcrumbs, Heading, Text, Image (caption), Quote, List, CodeBlock | Built (F15.72) | The body is composed from blocks in the view, not rendered Markdown (a prose compound for rendered rich text is still a gap); a contents list; topic filters |
| Conference | Home, Schedule, Speaker, Tickets | SiteLayout, SiteHeader, Hero, Tabs, **Agenda (new, F15.73)**, Badge, Card, Persona, Avatar, Statistic, RadioGroup (tiles), NumberField, DescriptionList, Accordion | Built (F15.73) | Saving sessions to a personal schedule; filtering by track; a time grid with rooms as columns (Agenda lists slots, it isn't a grid); sold-out and waiting-list states on a ticket choice; payment |
| Design tool | Editor (Files planned) | **EditorLayout (new)**, Toolbar, SegmentedControl (icons), MenuButton, AvatarGroup, **TreeView (new)**, **Canvas (new)**, NumberField (glyphs), Select, TextArea; new icons pointer, hand, frame, rectangle, ellipse, text, layers, properties | Built (F15.74) | Drawing, dragging and resizing on the canvas (Canvas selects; it doesn't edit by pointer); multiple selection; resizable panels; drag to reorder layers; a colour picker that reads category roles (Fill is a Select); a Files screen |
| Project management | Board, Backlog, Issue | **AppLayout (new)**, Navigation, Breadcrumbs, Persona, Avatar, TextField (search), **Board (new)** with `moveCard` (tier 0), Badge, MenuButton, Section, DataTable, Link, CheckboxGroup, Checkbox, TextArea, Select, DescriptionList | Built (F15.75) | Filters by person and type; swimlanes; creating and editing cards; dragging rows between sprint and backlog; sorting and selecting DataTable rows; editing a title in place (InlineEdit exists, not wired); reports and settings screens |

### Five times the screens and flows (Q66, F15.T1)

Owner, 2026-11-08 20:43 (DoD Q66): *"Make the templattes a lot more exhaustive than what it is currently. Cover a lot more of the screens and flows, at least 5 times than what you currently have."* **Before:** 20 screens in a flat list, which read as 18 flows (Corporate 4 · 3, Portfolio 3 · 3, Blog 3 · 2, Conference 5 · 5, AI chat 1 · 1, Design tool 1 · 1, Project management 3 · 3). **Target:** at least 100 screens and 90 flows. **Plan (in each manifest's `sections`, unbuilt screens `planned`):** 146 screens, 91 flows and 17 states. **Built (F15.T3):** 144 screens, 90 flows, 15 states; the live counts and every flow are on [All templates](http://127.0.0.1:8766/#/templates).

| Template | Planned screens · flows | Sections and the flows in each (→ screens) |
| --- | --- | --- |
| Corporate site | 26 · 16 | Company (get to know, compare services, customer story, news); Careers (find a job, apply); Contact (send a message, visit an office); Client account (sign in → forgot → reset sent, with Wrong password; create an account → check your email; manage the account); Help and errors (search, with Nothing found; 404 · 500 · maintenance; policies) |
| Portfolio | 14 · 11 | Work (browse, case study → process); About (designer → résumé, talks, writing, tools); Hire (get in touch, with Message sent; book a call → booked; availability); Errors (404) |
| Blog | 19 · 14 | Read (browse → topic, archive, article → author, series, search with Nothing found); Subscribe (newsletter → confirm, with Address not valid; manage email → unsubscribed; feeds); Reader account (sign in → check email, saved with Nothing saved, comments, profile); Errors |
| Conference | 30 · 18 | The event (discover → about, venue → travel, schedule → session, speakers → speaker, questions); Tickets (tickets → attendee details → payment → confirmed, with Card declined; your tickets → transfer; group booking); Partners (sponsors, become a sponsor → sent); Call for papers (call → your talk → submitted, with Missing answers; your submission); Attendee (sign in, your schedule with Nothing kept, live now); Errors (404, sold out) |
| AI chat | 24 · 12 | Converse (chat with New chat and Reply failed, share → shared chat, voice); Find (search with Nothing found, images, projects → project); Account (sign in → sign up, welcome → reply style); Settings (general → personalisation → data controls; plans → checkout → upgraded); Errors (offline, limit reached, not found) |
| Design tool | 22 · 14 | Files (recent → project, drafts with No drafts, search, deleted files, import); Edit (design with the full inspector, prototype → present, dev mode, comments, version history); Share (share → export); Account (sign in, welcome → team set-up, account → team and plan) |
| Project management | 23 · 14 | Plan (board, backlog → plan a sprint, roadmap); Track (issue → edit, new issue with Missing answers, my work with Nothing assigned, search with Nothing found); Insights (dashboard → burndown); Team (members → invite, inbox); Set-up (sign in → create a project, project settings → workflow); Errors (no access, not found) |

New generic core blocks for these flows (F15.T1): `status` (error and confirmation pages), `alert`, `empty`, `search` (a working field that narrows its results), and form `password` and `search` fields with `error` and `links`. Navigation's families nest up to three levels for the hierarchy.

### The Design tool's inspector against Figma's properties panel (Q66.3, F15.T2)

Owner, 2026-11-08 20:43 (DoD Q66): *"The inspector panel for the design tools should be exhaustive and make it cover 100% of what is typically there in Figma inspector panel. We already have color picker and stuff. Just implement those properly in the template."* The panel list comes from Figma's help centre: [the right sidebar](https://help.figma.com/hc/en-us/articles/360039832014) (Design and Prototype tabs with edit access; inspecting, code and export with view access), [stroke properties](https://help.figma.com/hc/en-us/articles/360049283914) (position, weight, individual sides with Custom, end points and joins, dashes) and [auto layout](https://help.figma.com/hc/en-us/articles/360040451373) (direction, wrap, gap, padding, alignment, hug/fill/fixed, min and max). Every control is JSON (`record.inspector` in `design/content/edit/design/editor.json`: tabs → sections → rows of fields with `when` conditions), drawn by `design/Inspector.tsx` through library components; values live on each layer (`props`, over `record.defaults`).

| Figma (properties panel) | Here | Drawn with |
| --- | --- | --- |
| Alignment and distribution | Six align buttons that move the layer in its frame; two distribute (say they need multiple selection) | Button (icon), new icons |
| Position: X, Y, rotation, constraints | X, Y, Rotation; horizontal and vertical constraints | NumberField (glyph, icon), Select |
| Frame size, resizing (fixed, hug, fill), min and max | W, H, horizontal and vertical resizing, min and max W and H | NumberField, Select |
| Auto layout: direction, wrap, gap, padding, alignment, clip content, ignore auto layout | None, Vertical, Horizontal, Wrap; gap; four paddings; the 3 × 3 alignment; Clip content; Ignore auto layout | SegmentedControl (icons), NumberField, **AlignmentPicker (new)**, Switch |
| Appearance: opacity, blend mode, visibility, corner radius, individual corners, corner smoothing | All six; 17 blend modes | Slider, Select, Switch, NumberField |
| Fill (several): solid, linear and radial gradient, image | A list: type, colour and opacity, gradient stops and angle, picture and fit; show and remove each | Select, TextField with the ColourPicker swatch, **GradientEditor**, Switch |
| Stroke: paints, position, weight, individual sides (Custom), dash, end points, join | All, with four side weights under Custom | as above, SegmentedControl |
| Effects: drop shadow, inner shadow, layer blur, background blur | A list: type, X, Y, blur, spread, colour | Select, NumberField, ColourPicker |
| Layout guides | A list: grid, columns or rows; size or count, gutter, margin, colour | Select, NumberField, ColourPicker |
| Text: font, weight, size, line height, letter spacing, alignment, decoration, case, resizing, truncation | All, plus the words | Select, NumberField, SegmentedControl (icons), Switch, TextField |
| Selection colours | Every colour in the frame and its children; changing one recolours them all | TextField with ColourPicker |
| Component properties, variants, instance swap | Swap instance, State, Size, Leading icon, Label | Select, Switch, TextField |
| Export settings | A list: scale, format, suffix; Export | Select, TextField, Button |
| Prototype tab: flow starting point, interactions (trigger, action, destination, animation, easing, duration), scroll behaviour, prototype settings | All | Switch, TextField, Select, NumberField, ColourPicker |
| Dev mode / Inspect: measurements, code, colours, typography, export | Layer readings, CSS generated from the values, colours, typography, export | DescriptionList, CodeBlock |

New generic parts (core, with props and stories): **AlignmentPicker** (fundamental, Selection), **PropertySection** (compound, Panels); Canvas gains `look` (the document's own fill, opacity, radius, rotation, stroke, hidden) so inspector values draw at once; 23 icons (alignment, distribution, text alignment, eye, direction, wrap, corners, sides, link, rotate, code, component). Not built: multiple selection, variables and styles, auto layout re-arranging the canvas, gradients and effects drawn on the canvas.
## Catalogue overview

The full researched list of components, family by family, is the [Component catalogue](component-catalogue.md) (owner, 2026-11-07 23:23: research and catalogue every component rather than rely on a list). It supersedes the gap list below as the source of what to build; each family's rows give tier, priority, dedupes and sources, and this page keeps the per-component matrix when a component's build packet starts.

| Family | Catalogue | Components (tier, priority) |
| --- | --- | --- |
| Sliders and range inputs | [Researched](component-catalogue.md#sliders-and-range-inputs) | Slider (fundamental, must: single, range, multi-thumb, marks, steps, origin, scale, value label, paired input); Allocation slider (compound, must); Gradient stop editor (compound, must); Colour channel slider (compound, should); Histogram range (compound, should); Knob (specialist, later) |
| Lists and list items | [Researched](component-catalogue.md#lists-and-list-items) | List (fundamental, must: static, action, select single and multiple, grid; groups, sticky headings, nested, reorderable, virtual, load more); ListItem (fundamental, must: leading, words, trailing, lines, inset, danger tone, inactive and loading items); Contained list and Bulk-selection list (compounds, should) |
| Badges, tags and chips | [Researched](component-catalogue.md#badges-tags-and-chips) | Badge (fundamental, must: label, count, dot, anchored; should: status dot, presence, state with icon, category colour); Chip (fundamental, must: input, filter; should: primary action, overflow "+n"); ChipGroup (must); filter chip with menu (compound, should). Assist and suggestion chips are Buttons |
| Inputs | [Researched](component-catalogue.md#inputs) | Field wrapper (must); TextField types and options (must: purpose and keyboard, prefix and suffix, icons, clear, count, password reveal, search; should: widths, quiet, formatted entry, copy, expandable search); NumberField (must: steppers, locale formats, out of range; should: scrub); OtpField and Rating (specialist, should); Tag input, Mentions, Inline edit (compounds, should) |
| Selection | [Researched](component-catalogue.md#selection) | RadioGroup (must, not yet built); Checkbox, CheckboxGroup, Switch, Select, SegmentedControl (built or existing; additions: exclusive None, conditional reveal, choice tile, Select `multiple`); Combobox (must: list autocomplete, multiple as chips, async; should: free text, creatable); Select panel and Tree select (compounds, should); Cascader, Transfer (compounds, later). Toggle button group skipped as redundant |
| Pickers | [Researched](component-catalogue.md#pickers) | DateField (must: separate parts, segmented); Calendar (specialist, must); DatePicker (compound, must: single, range; should: presets, relative ranges, month and year, with time); TimeField (must), TimePicker and time slots (should); Swatch, Swatch picker, colour field (must); ColourPicker (compound, must; ColourField is its trigger); FileUpload (must: button, drop zone, file list with progress, validation; should: previews, paste, manual) |
| Navigation | [Researched](component-catalogue.md#navigation) | Navigation (exists; must: side, drawer; should: rail, top; later: bottom bar, mega menu); Tabs (compound, must: panels, links; should: overflow); Skip link (must), Back link, Breadcrumbs, Table of contents, Pagination, Stepper, Footer (should); Menu (exists; should: submenus, checkable items, context menu); Command palette (should); Menubar (later) |
| Overlays | [Researched](component-catalogue.md#overlays) | Tooltip and Popover with anchored positioning (fundamentals, must); Dialog, alert dialog, dialog sizes (compounds, must); Side sheet (must, owner-named side panel); Toggletip, confirmation popover, form dialog, bottom sheet (should); Hover card, non-modal dialog, nested sheets, Tour (later) |
| Feedback and status | [Researched](component-catalogue.md#feedback-and-status) | Notification pill (compound, must: auto-dismiss, hard-dismiss exception, stack of three; should: promise); Alert (compound, must: inline; should: page banner, callout); Error summary (must); live announcer (must); Progress (exists; must: label and value, delay; should: ring, steps); Meter (should); Skeleton (must); Empty state (must); Result (should) |
| Data display, tables and trees | [Researched](component-catalogue.md#data-display-tables-and-trees) | DataTable (exists; must: sort, filter bar, selection, row actions, sticky header, truncation, pagination, responsive, states; should: expand, tree rows, pin, resize, summary, virtual, spreadsheet mode); Tree (specialist, should); Accordion, Disclosure, Property grid (should); Avatar (must), AvatarGroup (should); Card (must), Tile, Statistic, Timeline, Feed (should); Scheduler, Gantt, Board, File explorer (later) |
| Media | [Researched](component-catalogue.md#media) | Image (must: responsive, lazy, ratio, fallback; should: placeholder, caption, thumbnail); Lightbox, Image grid (standard, quilted, masonry), Carousel, Media card, Media player (video and audio), seek bar (should); Waveform, Media timeline, Compare slider, Zoom viewer, Cropper, Embed (later); background video skipped |
| Charts and data-visualisation primitives | [Researched](component-catalogue.md#charts-and-data-visualisation-primitives) | Primitives (specialist fundamentals, must: marks, scales and colour, axes, legend, chart tooltip; should: data labels, reference lines, keyboard highlight); data table view and chart states (must); Bar chart and StackedBar, Line chart (must); Area, Sparkline, Combo, Scatter, Pie and donut, Heatmap (should); Bullet, histogram, box plot, radar, treemap, funnel, Sankey, maps (later); word cloud and 3D skipped |
| Editors | [Researched](component-catalogue.md#editors) | CodeBlock (exists, must); Text toolbar, Rich text editor, Markdown editor (compounds, should; formatting toggles await the owner's toggle-button ruling); Bubble and slash menus, Code editor, Diff viewer, Query builder, Filter syntax field, Comments, Shortcut field, Curve editor, Node editor, Canvas, Emoji picker (later) |
| Layout tier | [Researched](component-catalogue.md#layout-tier) | Arrangement fundamentals: Center and container-responsive regions (must); Sidebar, Switcher, Cover, Frame, Reel, Splitter (should); Masonry (later). Layouts, must: App shell, Page layout (exists), List-detail, and the owner's Article, List of articles, Documentation, Gallery with hero, Bento, Sponsors, Product list, Product page, Cart, Checkout, Onboarding. Should: supporting pane, feed, dashboard, settings, marketing sections, pricing, confirmation, question pages, check answers, task list, auth, error pages, search results. Later: editor workspace, start page, inbox, board and calendar pages |
| Actions and buttons | [Researched](component-catalogue.md#actions-and-buttons) | Button, icon-only, destructive tone, close and clear, prevent double submit, ButtonGroup, MenuButton, SegmentedControl (must); counter, link-styled, split button, action group, bulk action bar, copy button (should); description, share, logic, hold to confirm, floating action (later); toggle button waits for the owner |
| Typography, content and utilities | [Researched](component-catalogue.md#typography-content-and-utilities) | Truncation, Prose, link variants, formatted values, Form, visually hidden, top layer, focus scope, direction and locale, reduced motion (must); balanced wrapping, quotes, key caps, scroll area (should); abbreviation (later) |
| AI and conversation | [Researched](component-catalogue.md#ai-and-conversation) | AI label, Conversation, Message, streaming, Prompt input, Suggestions, Sources and citations, response feedback (compounds, should); reasoning and tool steps, approval request, model and context selectors, artifact panel, voice input (later) |

## ChatGPT web app mapped (Q57.1, F15.64)

Owner, 2026-11-08 10:55 (verbatim): *"We also need components and compound components for - Chat bubbles with text, images, cards and stuff presented inside. Think this through and consider using this library to create the entirity of the Chat GPT web app. We should have enough components to be able to do this."*

**Sources (read 2026-11-08):** [OpenAI Apps SDK UI guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines) (fetched: inline cards in the message flow, up to two actions, no nested scrolling; inline carousels of 3–8 items with image, title, two lines of metadata, a badge and one action; fullscreen views with the composer still overlaid); [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt) (fetched: projects in the sidebar holding chats, files and instructions; temporary chats). Cited, not re-read (the help centre refused further requests): the help-centre articles on chat search, shared links, voice mode and memory, and the [Apps SDK UI component library](https://openai.github.io/apps-sdk-ui/) (a Storybook that renders client-side). The anatomy below is the ChatGPT web app as used in 2026 by the worker, checked against those pages; treat any row marked *cited* as to be checked in its build packet. Patterns are adapted, never copied (no OpenAI assets, copy or icons).

**Status:** *built* = a public component covers it as it is; *partial* = built pieces compose it, with a named gap; *missing* = a new component or prop is needed. *Packet* is where the gap is built.

| Area | Part of ChatGPT | Here | Status | Gap and packet |
| --- | --- | --- | --- | --- |
| Sidebar | Collapsible sidebar (open, closed to a rail of icons; a sheet on narrow screens) | ChatLayout `sidebar` | Partial | ChatLayout opens and closes it, floating in a narrow window (F15.69); no collapse to a rail (recorded) |
| Sidebar | New chat | Button (`icon="edit"`, quiet) | Built | — |
| Sidebar | Search chats: a dialog with a search field and recent chats by date, results as you type | Dialog, TextField `type="search"`, List action groups | Built | Composed in the [Chat app view](http://127.0.0.1:8766/#/chat-app) (F15.70); results update on Enter, not as you type (recorded) |
| Sidebar | Library (images), GPTs/apps, Codex links | Navigation items with icons | Built | — |
| Sidebar | Projects: folders holding chats, new project | ConversationList group | Partial | A project is a group with its own chats in the app view (F15.70); no expand/collapse or New project (recorded) |
| Sidebar | Chat history grouped by date (Today, Yesterday, Previous 7 days), the current chat marked, a "…" menu per row on hover and focus (Share, Rename, Archive, Delete), rename in place | ConversationList | Built | **ConversationList** (F15.69): date groups, current row, More menu as a transient cue, rename in place; rows `space.stack-row` apart (Q60) |
| Sidebar | Account at the foot: avatar, name, plan; menu with Settings, Help, Log out | Persona, MenuButton | Built | — |
| Header | Model switcher: a menu of models, each with a one-line description and a check on the current one | MenuButton with ListItem (description, radio mark) | Built | — |
| Header | Temporary chat (on/off) | Switch in the model menu (owner: binary settings are Switches, never toggle buttons) | Built | Adapted, not copied: ChatGPT's toggle icon button becomes a Switch |
| Header | Share (dialog with a link and Copy) | Button, Dialog, TextField read-only + action | Built | — |
| Header | More menu (Archive, Report, Delete) | MenuButton | Built | — |
| Messages | The conversation: a scrolling column at reading width, newest at the end, the page scrolling edge to edge | ChatLayout | Built | **ChatLayout** (F15.69): 42 rem column, composer that never scrolls away, stays at the newest |
| Messages | Your message: a bubble at the end of the line, attachments above it, Edit and Copy on hover/focus | — | Missing | **ChatMessage** `from="person"` (F15.65) |
| Messages | The reply: no bubble, full width, rich content | — | Missing | **ChatMessage** `from="assistant"` (F15.65) |
| Messages | Markdown: headings, paragraphs, lists, tables, quotes, links, rules | Heading, Text, Link, Quote, DataTable | Partial | Rendered rich text needs one styled container on the named global-escape list; ChatMessage `content` blocks map each block to a component (F15.65) |
| Messages | Code blocks with the language and Copy; inline code | CodeBlock, Code | Built | — |
| Messages | Maths (rendered formulas) | — | Missing, skip | Needs a typesetting dependency; not in this scope (recorded) |
| Messages | Citations: small source chips inline; a Sources panel listing them | Chip, Link, Sheet | Partial | Citation chip as a ChatMessage block (F15.65); panel = Sheet |
| Messages | Images in a reply (generated or found), opening large | Image, Lightbox, ImageGrid | Built | — |
| Messages | Image being generated | — | Built | **ImageGeneration** (Q58, F15.68a): stipple, aurora, reveal and shimmer, used inside ChatMessage |
| Messages | Attached files: a tile with a type icon, name and type; uploading with progress | Chip, FileUpload list | Partial | File block in ChatMessage and the Composer's attachment tray (F15.65, F15.68) |
| Messages | Inline cards (one or two actions) and carousels of cards | Card, Carousel | Built | Shown inside ChatMessage (F15.65) |
| Messages | Message actions: Copy, Good response, Bad response, Read aloud, Try again (with model), Share, Edit, Branch | Toolbar, Button `iconOnly` + Tooltip | Missing | **MessageActions** compound; new icons thumb-up, thumb-down, retry, speaker, branch (F15.66) |
| Messages | Response versions "< 2 / 2 >" after Try again or Edit | Pagination | Partial | Compact previous/next with "2 of 2" inside MessageActions (F15.66) |
| Messages | Streaming text arriving word by word with a cursor | — | Missing | ChatMessage `streaming` (F15.67) |
| Messages | Thinking: "Thinking…" then "Thought for 12 s", expandable to the reasoning | Accordion | Missing | **ChatThinking** (F15.67) |
| Messages | Tool activity: "Searching the web", "Reading 4 sources" | Progress inline + words | Partial | Status line in ChatThinking (F15.67) |
| Messages | A failed reply with Retry | Alert inline + Button | Built | Shown in the app view |
| Messages | Scroll to the newest message (a floating round button when you scroll up) | Button `iconOnly` | Built | Jump to newest, placed by ChatLayout (F15.69) |
| Composer | Growing text box, "Ask anything" | TextArea `grow` | Built | — |
| Composer | AI processing ring while a reply is written | TextArea `processing` (Q56) | Built | — |
| Composer | + menu: Add photos and files, then tools (Create image, Deep research, Web search, Canvas) | MenuButton | Built | — |
| Composer | The chosen tool as a removable chip in the box | Chip `appearance="filled"` | Built | Placed in the Composer (F15.68) |
| Composer | Attachments above the text: thumbnails and file tiles with Remove and upload progress | FileUpload list, Image | Built | Composer attachment tray: thumbnails, file tiles, uploading and failed with Retry (F15.68) |
| Composer | Dictate (mic) and Voice mode | Button `iconOnly` | Partial | Composer `onDictate` with the new mic icon (F15.68); voice mode's live view is out of scope (recorded) |
| Composer | Send, which becomes Stop while replying; Enter sends, Shift+Enter a new line | Button | Built | **Composer** compound (F15.68) |
| Composer | "ChatGPT can make mistakes. Check important info." under the box | Text small, muted | Built | — |
| Empty chat | "What can I help with?" with the composer in the middle and suggestion prompts | EmptyState, ChipGroup/Button | Built | ChatLayout `empty` arrangement (F15.69) |
| Overlays | Settings: a dialog with sections in vertical tabs (General, Notifications, Personalization, Data controls, Security, Account) | Dialog, Tabs vertical, Switch, Select | Built | A Settings dialog with Switches in the app view (F15.70); the vertical-tab sections aren't composed (recorded) |
| Overlays | "Copied", "Link copied" confirmations | Notifications | Built | — |
| Overlays | Tooltips on every icon button | Tooltip | Built | — |
| Overlays | Canvas: a document beside the chat | ListDetail, Pane | Partial | Not in this scope (recorded) |
| Overlays | Drop files anywhere over the chat | FileUpload drop area | Partial | Composer drop and paste built (F15.68); the whole-chat drop area with ChatLayout (F15.69) |
| App | The whole screen: sidebar, header, conversation, composer | ChatLayout + view data | Built | The [Chat app view](http://127.0.0.1:8766/#/chat-app) (F15.70): view data in `apps/library/src/data/chat-app.ts` mapped through a block registry; full screen at `#/app/chat` |

**Build order (Q57.2), one packet each:** F15.65 ChatMessage (person and assistant; text, rich content blocks, image, file, card, carousel, citation, code); F15.66 MessageActions (with versions); F15.67 streaming and ChatThinking; F15.68 Composer (attach menu, tool chip, attachment tray, mic, Send/Stop, Q56 ring); Q58 ImageGeneration slotted here; F15.69 ConversationList and ChatLayout; F15.70 the ChatGPT-like app view, from view data and public components only.

## Inventory gaps (ranked proposal; none built until the owner picks)

1. **Tooltip** (fundamental): icon-only buttons need one tooltip pattern (today the native `title`). **Built in F15.45** (Tooltip + `behaviour/anchor.ts`); Button iconOnly still sets `title` unless wrapped (switching it everywhere is the owner's call).
2. **ButtonGroup** (fundamental, owner-named): in F15.1.
3. **RadioGroup** (fundamental): stacked exclusive choices.
4. **Toast / notification** (compound): auto-dismiss by default (owner rule); the commit states already reference it.
5. **Dialog** (compound): confirmation and forms, on the top layer.
6. **Tabs** (compound).
7. **Skeleton** (fundamental): for the loading framework (F13c).
8. **Card / tile** (compound, owner-named).
9. **Combobox** (fundamental): searchable Select. **Built in F15.44** as Select `search` (no separate component).
10. **Slider**, **Avatar**, **Tag/chip (removable)**, **Breadcrumb**, **Pagination**, **Accordion**, **Popover**, **Date picker**: later, in the owner's order.
