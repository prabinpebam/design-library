/**
 * Library-app specimen tooling (above core, O21): one treatment for every example, adapted from the reference
 * library: a head (title and one line), a canvas in the library's own context, and the source behind "Show the code".
 */
import { type ReactNode } from 'react';
import { CodeBlock, ContextMatrix as CoreMatrix, Example as CoreExample, IndexList, Link, Section, Stack, Text, type DataAttributes, type StoryFile } from '@design-library/core/react';
import { contextOf, contexts, useAppearance, type SpecimenContext } from '../data/contexts';
import { pagesIn } from '../data/pages';
import { tokenCount } from '../data/tokens';
import { entryOf } from '../data/catalogue';
import { docsHref } from '../data/site-links';
import { PAGES, SPECIMENS, componentSources, rev, type Identity } from '../revisions/target';

/** What a pattern's revision targets are about: catalogue identity and owning files. */
export interface TargetOf {
  identity: Identity;
  sources: string[];
}

/** One row of a context matrix: what holds in every context is said once; `cell` renders only what varies. */
export interface MatrixRow {
  id: string;
  label: ReactNode;
  cell: (context: SpecimenContext) => ReactNode;
  /** What the row is, for revision targets; defaults to the row id, owned by the specimen patterns. */
  target?: TargetOf;
}

/**
 * Role × context matrix: the core ContextMatrix with this library's four contexts as columns and each row and cell
 * anchored for revisions.
 */
export function ContextMatrix({ label, rowHeader, rows }: { label: string; rowHeader: string; rows: MatrixRow[] }) {
  return (
    <CoreMatrix
      label={label}
      rowHeader={rowHeader}
      columns={contexts.map((c) => ({ id: c.id, label: c.label, scheme: c.scheme, contrast: c.contrast }))}
      rows={rows.map((r) => {
        const t = r.target ?? { identity: { item: r.id }, sources: [SPECIMENS] };
        return {
          id: r.id,
          label: r.label,
          data: rev({ kind: 'matrix-row', ...t }),
          cells: Object.fromEntries(contexts.map((c) => [c.id, r.cell(c)])),
          cellData: Object.fromEntries(contexts.map((c) => [c.id, rev({ kind: 'matrix-cell', identity: { ...t.identity, context: c.id }, sources: t.sources })])),
        };
      })}
    />
  );
}

/** One example in the library's own context (the title bar's scheme and contrast), anchored for revisions. */
export function Example({ title, description, code, arrangement, target, preview, children }: { title: string; description: string; code?: string; arrangement?: 'stack' | 'row'; target?: TargetOf; preview?: DataAttributes; children: (context: SpecimenContext) => ReactNode }) {
  const { scheme, contrast } = useAppearance();
  const c = contextOf(scheme, contrast);
  return (
    <CoreExample
      title={title}
      description={description}
      arrangement={arrangement}
      scheme={scheme}
      contrast={contrast}
      {...(target && rev({ kind: 'example', ...target }))}
      previewData={{ ...preview, ...(target && rev({ kind: 'pane', identity: { ...target.identity, context: c.id }, sources: target.sources })) }}
      source={code ? <CodeBlock code={code} label={`Code: ${title}`} {...(target && rev({ kind: 'code', ...target }))} /> : undefined}
    >
      {children(c)}
    </CoreExample>
  );
}

export function StoryExamples({ file }: { file: StoryFile }) {
  return (
    <Stack gap="section">
      {file.stories.map((story) => (
        <Example
          key={story.title}
          title={story.title}
          description={story.description}
          code={story.code}
          arrangement={story.arrangement}
          target={{ identity: { component: file.component, story: story.title }, sources: componentSources(entryOf(file.component)?.file, file.component) }}
        >
          {() => story.render()}
        </Example>
      ))}
    </Stack>
  );
}

export function Note({ text }: { text: string }) {
  return <Text>{text}</Text>;
}

/** Each tier on the overview: its number, what it holds (counted from the data) and a way into each page. */
const tiers: { section: 'foundations' | 'fundamentals' | 'compounds' | 'layouts'; n: number; title: string; blurb: () => string }[] = [
  { section: 'foundations', n: 0, title: 'Tokens', blurb: () => `${tokenCount} named decisions: colour in four contexts, type, space, shape, motion and layers. Nothing else holds a raw value.` },
  { section: 'fundamentals', n: 1, title: 'Fundamentals', blurb: () => `${pagesIn('fundamentals').length} so far. The universal building blocks every app needs, built from tokens alone: type, icons, every kind of button (button groups included, they’re that common), the controls and the arrangements that space them.` },
  { section: 'compounds', n: 2, title: 'Compounds', blurb: () => `${pagesIn('compounds').length} so far. Arrangements of fundamentals for a particular need, which some apps have and others don’t, such as cards, dialogs, panels, toolbars and navigation. This app’s own navigation, title bar, page heads and sections are built from them; products can add their own.` },
  { section: 'layouts', n: 3, title: 'Layouts', blurb: () => 'Reusable views and sections with named regions, such as an article, a gallery or a checkout. The library offers a standard set; products can make their own.' },
];

export function Overview() {
  return (
    <Stack gap="section">
      <Section heading="How it’s built" size={3} nested>
        <Text>
          Four tiers, each made only from the ones before it. Tokens hold every value. Fundamentals are the universal building blocks, built from tokens alone. Compounds arrange fundamentals for a particular need. Layouts are reusable views and sections. Views are data mapped onto layouts and carry no styles of their own.
        </Text>
        <Text>
          Every example here is the real component, rendered from the same code a product uses, in the colour scheme and contrast chosen at the top of the page. Each example shows its source, and the props, keys and tokens are read from the component itself. When this app breaks, the{' '}
          <Link href="diagnostic.html">diagnostic page</Link> still opens. Intent and decisions live in the <Link href={docsHref('foundation.md')}>foundation plan</Link>.
        </Text>
      </Section>
      {tiers.map((t) => (
        <Section key={t.n} heading={t.title} index={t.n} nested>
          <Text tone="muted">{t.blurb()}</Text>
          <IndexList items={pagesIn(t.section).map((p) => ({ id: p.id, title: p.title, href: `#/${p.id}`, summary: p.summary, data: rev({ kind: 'index-item', identity: { item: p.id }, sources: [PAGES] }) }))} />
        </Section>
      ))}
    </Stack>
  );
}
