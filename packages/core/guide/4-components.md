# Step 4: customize fundamentals and compounds through public seams

Goal: a component that fits your product, reached through a seam the library offers, so it keeps working in every theme, context and library update. **Never a fork.**
> **Paths:** `agent/…`, `schemas/…` and `guide/…` are inside the installed package (`node_modules/@design-library/core/`); your templates live in your project, here `src/templates/{id}/`. Commands marked *library repository* run only there.


## Why no forks

Every component is **sealed**: no `className` or `style` props, and its CSS reads only tokens. Copying one, wrapping it to replace its markup, or targeting its `[data-dl='…']` selector in your CSS breaks the moment the library changes, skips its accessibility, and looks wrong in dark or more contrast. The seams below don't.

## The seam ladder

Take the first step that works. Each step lists how to find out whether it's enough.

### 1. A prop or variant

Read `agent/components/{Name}.json`: `props` (every prop, its type, default and comment) and `types` (what each union means, such as `ButtonSize`). Most needs are already a prop: `emphasis`, `size`, `tone`, `variant`, `layout`, `density`, `hideLabel`, `headingLevel`.

```tsx
<Button label="Delete page" emphasis="danger" size="l" />
<Card title="The Long Shore" variant="plain" layout="beside" media={<Image … />} />
```

### 2. A slot

A `ReactNode` prop or `children` takes another part. The receiving component places and spaces it; you don't.

```tsx
<Card title="The Long Shore" meta={<Badge tone="success">In stock</Badge>} actions={<Button label="Reserve" />} />
```

Slots take **parts**, not styled markup: pass a `Badge`, a `Button`, a `Stack`, never a `<div style=…>`.

### 3. A context attribute

Components pass `data-*` attributes through (`dataAttributes: true` in their file). Context attributes change a whole subtree by token, not by restyling: `data-density="compact"`, `data-scheme`, `data-contrast`, `data-space`, `data-shape`, `data-material`. See [Step 3](3-tokens.md).

### 4. The theme

When the change should hold everywhere (every button rounder, a different accent), it's a token change: [Step 3](3-tokens.md).

### 5. Compose in your app, without styles

A small app component that only fixes props and arranges core parts is fine:

```tsx
/** A book in the shop's lists. */
export function BookCard({ book }: { book: Book }) {
  return <Card title={book.title} description={book.summary} href={`/books/${book.id}`} meta={<Text tone="muted" variant="caption">{book.author}</Text>} />;
}
```

The moment it needs its own markup with its own look, it's a **custom part** (step 6).

### 6. A custom part inside a template

When nothing in the core fits (look the need up first in [the brand-led site recipe](recipe-brand-led-site.md#1-find-the-core-part-first)), add the smallest part in the lowest tier that can hold it, inside one template's folder. Inside it, compose core `Link`, `Heading`, `Image`, `Button` and `Text`; never draw a raw `<a>`, `<h*>`, `<img>` or `<button>`:

| Tier | Make one when | Made from |
| --- | --- | --- |
| Fundamental | A universal building block the core lacks (a countdown, a rating of a new kind) | Tokens only |
| Compound | An arrangement for one product's need (a sponsor wall, an opening-hours table) | Core fundamentals and tokens; never another compound (take one as a slot) |
| Layout | A screen or section with named regions | Compounds, fundamentals, tokens; never another layout |

Steps (worked example: `node_modules/@design-library/templates/conference/parts/`):

1. **Source** `parts/{fundamentals|compounds|layouts}/{Name}.tsx`:
   - Props interface `{Name}Props extends DataAttributes`, every prop typed and commented; words a person reads come in as props.
   - A doc comment on the exported function: what it's for, "Not for …" with the alternative, then `@tier`, `@family`, `@a11y` lines and a `@key` line per key it handles.
   - Root element `data-dl="{template}-{part}"` (kebab case); inner pieces `data-dl-part="…"`; spread `...data` on the root.
   - Native elements first (a `button` is a `button`), 44 px targets, a visible focus ring from the core focus tokens, reduced motion honoured.
   - Import only from `@design-library/core/react` (and `/render` for a layout binding) and from parts of a lower tier in the same template.
2. **CSS** `parts/{tier}/{name}.css`: everything inside `@layer templates { … }`, selectors start with your own `[data-dl='{template}-{part}']` and reach inner pieces by child paths (`> [data-dl-part='…']`), values only from semantic roles and your `--t-{template}-{part}-*` tokens.
3. **Tokens** in the template's `tokens/tokens.css`, as `--t-{template}-{part}-*` custom properties inside `@layer templates { :root { … } }`, each `var(--a-semantic-role)` ([Step 3](3-tokens.md)); import it from the template's `registry.tsx` with the parts' CSS. (In the library repository they're written as `tokens.json` under `t.{template}.{part}` and `npm run tokens` generates the CSS.)
4. **Stories** `parts/{tier}/{Name}.stories.tsx`: a `StoryFile` with `component: '{template}.{Name}'`, `tier`, `summary` and one story per variant and state, in real words.
5. **Register** it in the manifest's `parts` (`{ "name": "{template}.{Name}", "source": "parts/…/{Name}.tsx" }`), import its CSS in the template's `registry.tsx`, and, if content uses it, add a block type ([Step 2](2-content.md)).
6. **Run the checks** below; the library then lists it on the template's "Own parts" page.

### 7. A core change

A variant or slot two or more products need. It's a change to the library itself, reviewed on its own, following the repository root's `AGENTS.md`; then the templates switch to it.

## Do and don't

| Do | Don't |
| --- | --- |
| Look up the prop in `agent/components/{Name}.json` first | Guess a prop, or reach for CSS because you didn't look |
| Pass parts into slots | Pass styled markup into a slot |
| Name custom parts `{template}.{Name}`, markup `{template}-{part}`, tokens `t.{template}.{part}.*` | Put a custom part in the core package, or use another template's parts |
| Style only your own part's markup, in `@layer templates` | Select `[data-dl='button']` or any core markup; use `!important`; set global styles |
| Keep 44 px targets, focus rings, keyboard patterns and WCAG 2.2 AA in light, dark and more contrast | Ship a part that only looks right in light |
| Use `Morph` (content changing in one box) and `Reveal` (opening in place) for motion | Animate with your own transitions or literal durations |

## Check it

| Check | Proves |
| --- | --- |
| `npx tsc --noEmit` | Props and imports are right |
| `npx design-library-check-content --templates src/templates` | Every part is namespaced, exists, has stories; block types, schema and registry agree; a part file under `parts/` the manifest doesn't list is a warning |
| Read the template's `tokens/tokens.css` (*library repository:* `npm run tokens`, `npm run tokens:check`) | The part's tokens read semantic roles only |
| `npx design-library-check` in your project (*library repository:* `npm run check:parts`, `npm run check:views`) | Parts reached by child paths; no styled markup in views and bindings |
| *Library repository:* `npm run check:materials`, `npm run check:motion`, `npm run check:layers` | No blur, literal motion or z-index outside tokens |
| *Library repository:* `npm run agent:index` | The part appears in `agent/index.json` with its own `agent/components/{template}.{Name}.json` |
| Open the template's "Own parts" page in the library | Each story, in light, dark and more contrast |
