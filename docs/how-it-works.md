# How the library works

**In the library:** the [Design Library](https://prabinpebam.github.io/design-library/#/overview) itself, every token, component and template rendered live.

> **TL;DR:** Every decision about how things look is a **token**. Components are built in four tiers on those tokens, and they're **sealed**: you change them through props, slots and tokens, never with your own styles. Whole screens come from **content written as JSON**, checked against a schema, then drawn by one renderer through a template’s layouts. Presets let a person switch the look at run time; materials and motion follow the same token rules. Agents follow the step-by-step guide shipped in the package (`packages/core/AGENTS.md`); this page explains the ideas behind it.

<figure class="slate-figure">
  <svg viewBox="0 0 960 430" role="img" aria-labelledby="hiw-title hiw-desc" data-slate-svg-motion="viewport" data-slate-safe-margin="24">
    <title id="hiw-title">Content becomes a screen through one renderer and four tiers on tokens</title>
    <desc id="hiw-desc">On the left, a content file written as JSON. An arrow leads to the renderer, which checks the content and picks the template's layout. A second arrow leads into a stack of five tiers: templates at the top, then layouts, compounds, fundamentals, and tokens at the bottom. Every tier above tokens reads only tokens for its look.</desc>
    <g id="hiw-content" data-slate-svg-step="0" data-slate-svg-effect="fade-rise">
      <rect x="24" y="130" width="212" height="170" rx="14" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="44" y="166" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Content</text>
      <text x="44" y="192" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16">Plain JSON data</text>
      <rect x="44" y="212" width="150" height="10" rx="5" fill="var(--color-neutral-stroke-2)"/>
      <rect x="44" y="234" width="120" height="10" rx="5" fill="var(--color-neutral-stroke-2)"/>
      <rect x="44" y="256" width="164" height="10" rx="5" fill="var(--color-neutral-stroke-2)"/>
    </g>
    <g id="hiw-arrow-1" data-slate-svg-step="1" data-slate-svg-effect="draw" fill="none" stroke="var(--color-brand-fg-1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M244 215 H282"/>
      <path d="M272 205 L284 215 L272 225"/>
    </g>
    <g id="hiw-renderer" data-slate-svg-step="1" data-slate-svg-effect="scale-in">
      <rect x="294" y="160" width="196" height="110" rx="14" fill="var(--color-neutral-bg-1)" stroke="var(--color-brand-stroke)" stroke-width="3"/>
      <text x="392" y="200" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700" text-anchor="middle">Renderer</text>
      <text x="392" y="226" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" text-anchor="middle">checks the schema,</text>
      <text x="392" y="248" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" text-anchor="middle">places each block</text>
    </g>
    <g id="hiw-arrow-2" data-slate-svg-step="2" data-slate-svg-effect="draw" fill="none" stroke="var(--color-brand-fg-1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M498 215 H536"/>
      <path d="M526 205 L538 215 L526 225"/>
    </g>
    <g id="hiw-tiers" data-slate-svg-step="2" data-slate-svg-effect="fade-rise">
      <rect x="548" y="24" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="62" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Templates</text>
      <text x="916" y="62" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">a product’s screens</text>
      <rect x="548" y="100" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="138" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Layouts</text>
      <text x="916" y="138" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">named regions</text>
      <rect x="548" y="176" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="214" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Compounds</text>
      <text x="916" y="214" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">arrangements for a need</text>
      <rect x="548" y="252" width="388" height="62" rx="12" fill="var(--color-neutral-bg-2)" stroke="var(--color-neutral-stroke-2)" stroke-width="2"/>
      <text x="568" y="290" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Fundamentals</text>
      <text x="916" y="290" fill="var(--color-neutral-fg-2)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">building blocks</text>
    </g>
    <g id="hiw-tokens" data-slate-svg-step="3" data-slate-svg-effect="fade-rise">
      <rect x="548" y="340" width="388" height="66" rx="12" fill="var(--color-neutral-bg-1)" stroke="var(--color-brand-stroke)" stroke-width="3"/>
      <text x="568" y="380" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="20" font-weight="700">Tokens</text>
      <text x="916" y="380" fill="var(--color-neutral-fg-1)" font-family="var(--font-family-base)" font-size="16" text-anchor="end">every look decision</text>
      <path d="M742 316 V336" fill="none" stroke="var(--color-brand-fg-1)" stroke-width="4" stroke-linecap="round"/>
    </g>
  </svg>
  <figcaption>Content is data; the renderer turns it into a template’s layout; every tier above tokens reads its look only from tokens.</figcaption>
</figure>

## The tiers

Each part of the library sits in exactly one tier, by a test anyone can apply. A part is made only from the tiers below it.

| Tier | Belongs here when… | Examples | You change it by |
| --- | --- | --- | --- |
| **Tokens** | It's a decision: a colour, a size, a duration, a radius | `color.text`, `space.stack-item`, `radius.md`, `duration.fast` | Editing a config file or choosing a preset |
| **Fundamentals** | Almost every product needs it | Text, Heading, Button and its kinds, fields, Switch, Stack, Cluster, Grid | Props and context attributes |
| **Compounds** | Some products need this arrangement of fundamentals | Card, Dialog, Toolbar, Navigation, Notifications | Props and slots |
| **Layouts** | It's a screen or a section with named regions | SiteLayout, AppLayout, ChatLayout, EditorLayout, ListDetail | Filling its regions |
| **Templates** | It's a collection of layouts for one kind of product | Corporate site, Blog, Conference, AI chat, Design tool, Project management | Writing its content, or adapting it as your own |

About 47 fundamentals, 55 compounds, 8 layouts and 7 templates exist today. Browse them in the [library](https://prabinpebam.github.io/design-library/).

## Components are sealed

A component has no `className` or `style` prop, and its CSS reads only tokens. That's what lets one theme change reach every screen, and lets a component work in light, dark and more contrast without anyone checking each screen by hand. When something needs to look or behave differently, there's an order of seams to try, from the cheapest:

<ol class="slate-steps">
  <li class="slate-step"><p class="slate-step__title">A prop or variant</p><p>Most needs already are one: a button's emphasis or size, a card's layout.</p></li>
  <li class="slate-step"><p class="slate-step__title">A slot</p><p>Pass another part in: a badge into a card's meta, buttons into its actions.</p></li>
  <li class="slate-step"><p class="slate-step__title">A context attribute</p><p>Change a whole region by token: compact density, a dark subtree, solid materials.</p></li>
  <li class="slate-step"><p class="slate-step__title">The theme</p><p>Change a token's default for every screen, through its config file.</p></li>
  <li class="slate-step"><p class="slate-step__title">A part inside a template</p><p>A new fundamental, compound, layout or block type, named in the template's namespace and documented like a core part.</p></li>
  <li class="slate-step"><p class="slate-step__title">A core change</p><p>A new variant or slot two products need, reviewed on its own.</p></li>
</ol>

What's never on the list: copying a component, wrapping it to replace its markup, or writing CSS that targets it.

## Screens come from data

A product's screens are content files: plain JSON that says what each screen shows (words, facts, links, picture ids), never how it looks. A template declares its layouts, the regions of each, and which kinds of block each region accepts.

| Kind of screen | Content is | Example |
| --- | --- | --- |
| A document: a site page, an article, a form | **Regions of blocks**: `{ "type": "hero", "title": "…" }`, `{ "type": "cards", … }` | Corporate site's home |
| An application: a chat, a board, an editor | **One record** typed for that screen | AI chat's conversation |

Before anything renders, `npm run check:content` checks every file against its schema and names each mistake with its file, its place in the file and how to fix it. A typo never reaches a screen half-drawn. The library shows each screen's JSON beside the screen it draws.

## Tokens, contexts and presets

| Idea | What it is | Where to see it |
| --- | --- | --- |
| **Semantic roles** | Tokens named for their job (`color.text`, `space.gutter`); the only tokens components read | [Colour](https://prabinpebam.github.io/design-library/#/colour), [Space](https://prabinpebam.github.io/design-library/#/space) |
| **Theme** | The default of each category, kept in config files and generated into CSS; a colour theme that fails contrast is refused | [Colour model](foundation.md#colour-model) |
| **Contexts** | Settings a whole subtree follows: light or dark, standard or more contrast, reduced motion, density | The title bar's appearance controls |
| **Presets** | Named choices per category (colour, type, icons, space, shape, material) and global presets that combine them; built-in ones are read-only, a person's own are saved in their browser | [Token presets](foundation.md#token-presets-q70); the gear button in the title bar |

## Materials and motion

**Materials** are the surfaces parts sit on: the page, raised cards, floating popovers and bars, modal dialogs. Floating surfaces can be **frosted** (a blur of what's behind them) or solid, by one global setting, and always solid when the person asks for less transparency or more contrast. See [Materials and backgrounds](materials.md).

**Motion** explains change: content that changes in place morphs in its own box, things that open grow from where they are, nothing blinks out and back. Durations and easings are tokens, and reduced motion removes movement but keeps every confirmation. See [Motion and transitions](motion.md).

## Templates and customization

Customizing a product always starts with a template. Use one as it is by writing its content; adapt one as your own by copying it into a new namespace. Anything the core lacks is added **inside that template**: its own parts, tokens, block types and stories, never in the core and never shared with another template. A part two templates need becomes a candidate for the core, through its own review. See [Templates, content and customization](foundation.md#templates-content-and-customization).

## Checks that keep it true

| Check | Keeps true |
| --- | --- |
| `npm run tokens:check` | Generated tokens match their sources; every text, focus and control pair passes contrast in all four contexts |
| `npm run check:content` | Every template's manifest and content is valid and every reference resolves |
| `npm run check:views`, `check:parts` | Views hold no styles; parts are reached by their own structure |
| `npm run check:materials`, `check:motion`, `check:layers` | Blur, motion and stacking only through tokens |
| `npm run agent:index:check` | The agents' index of components, blocks, tokens and templates matches the source |

## For agents

Agents building with the library read `packages/core/AGENTS.md` first: the rules it must never break, the seams, and seven step-by-step guides (install, content, tokens, components, layouts, templates, principles), each ending with the commands that prove the step. The principles guide is generated from `packages/core/principles/principles.json`, the same file that gives every library page its short Principles section: people read the plain summary there, agents the rules and decision procedures here. Exact names come from `packages/core/agent/index.json`, generated from the source so it can't drift. How this was planned: [Consumer guide audit](consumer-audit.md).
