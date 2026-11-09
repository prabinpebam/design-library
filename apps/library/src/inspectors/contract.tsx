/**
 * A component page's contract sections, all read from the component's source by the catalogue: its props, its
 * accessibility notes and keys, and what it's built from. Library-app tooling (above core, O21).
 */
import { Code, DataTable, DescriptionList, Heading, Link, List, Stack, Text } from '@design-library/core/react';
import { Fragment, type ReactNode } from 'react';
import { catalogue, entryOf, type PropDoc } from '../data/catalogue';
import { pages } from '../data/pages';
import { tokenPage } from '../data/tokens';
import { rev } from '../revisions/target';

const pageOf = (name: string) => pages.find((p) => p.title === name);
/** A contract row's owning source: the component file the catalogue read it from. */
const owned = (component: string) => [entryOf(component)?.file ?? `packages/core/react/fundamentals/${component}.tsx`];

/** Doc-comment text with its `code` spans set as code. */
function Rich({ text }: { text: string }) {
  return <>{text.split('`').map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : part))}</>;
}

function PropsTable({ props, caption, component, group }: { props: PropDoc[]; caption: string; component: string; group: string }) {
  return (
    <DataTable
      label={caption}
      columns={[
        { key: 'name', header: 'Prop', stacked: true },
        { key: 'type', header: 'Type' },
        { key: 'default', header: 'Default' },
        { key: 'what', header: 'What it does' },
      ]}
      rows={props.map((p) => ({
        id: p.name,
        data: rev({ kind: 'prop', identity: { component, group, prop: p.name }, sources: owned(component) }),
        cells: {
          name: (
            <>
              <Code>{p.name}</Code>
              {!p.optional && (
                <Text as="span" variant="caption" tone="muted">
                  Required
                </Text>
              )}
            </>
          ),
          type: <Code>{p.type}</Code>,
          default: p.default ? <Code>{p.default}</Code> : <Text as="span" tone="muted">None</Text>,
          what: <Rich text={p.description} />,
        },
      }))}
    />
  );
}

export function Props({ component }: { component: string }) {
  const entry = entryOf(component);
  if (!entry?.props.length) return <Text tone="muted">{component} takes no props.</Text>;
  const [own, ...variants] = entry.props;
  return (
    <Stack gap="section">
      <PropsTable props={own.props} caption={`${component} props`} component={component} group={own.name} />
      {variants.map((g) => (
        <Stack key={g.name} gap="group">
          <Heading level={3} size={4}>
            {g.name}
          </Heading>
          <PropsTable props={g.props} caption={`${g.name} props`} component={component} group={g.name} />
        </Stack>
      ))}
      {entry.dataPassThrough && (
        <Text tone="muted">
          Also passes <Code>data-*</Code> attributes through. Sealed: there are no <Code>class</Code> or <Code>style</Code> props.
        </Text>
      )}
    </Stack>
  );
}

/** Splits "Enter / Space" into keys, each a key name. */
function Keys({ keys }: { keys: string }) {
  const parts = keys.split(/\s*\/\s*/);
  return (
    <>
      {parts.map((k, i) => (
        <Fragment key={k}>
          {i > 0 && ' or '}
          <Code kind="key">{k}</Code>
        </Fragment>
      ))}
    </>
  );
}

export function Access({ component }: { component: string }) {
  const entry = entryOf(component);
  if (!entry) return null;
  return (
    <Stack gap="section">
      {entry.a11y.length > 0 && (
        <List
          items={entry.a11y.map((n) => ({
            id: n,
            data: rev({ kind: 'a11y', identity: { component, note: n.length > 80 ? `${n.slice(0, 80)}…` : n }, sources: owned(component) }),
            content: (
              <Text>
                <Rich text={n} />
              </Text>
            ),
          }))}
        />
      )}
      {entry.keys.length > 0 && (
        <DataTable
          label="Keyboard"
          columns={[
            { key: 'keys', header: 'Key' },
            { key: 'what', header: 'What it does' },
          ]}
          rows={entry.keys.map((k) => ({
            id: k.keys,
            data: rev({ kind: 'key', identity: { component, key: k.keys }, sources: owned(component) }),
            cells: { keys: <Keys keys={k.keys} />, what: <Rich text={k.action} /> },
          }))}
        />
      )}
    </Stack>
  );
}

function Names({ names, none }: { names: string[]; none: string }) {
  if (!names.length)
    return (
      <Text as="span" tone="muted">
        {none}
      </Text>
    );
  return (
    <List
      variant="inline"
      items={names.map((n) => {
        const page = pageOf(n);
        return { id: n, content: page ? <Link href={`#/${page.id}`}>{n}</Link> : <Code>{n}</Code> };
      })}
    />
  );
}

export function BuiltFrom({ component }: { component: string }) {
  const entry = entryOf(component);
  if (!entry) return null;
  const item = (term: string, details: ReactNode) => ({ term, details, data: rev({ kind: 'built-from', identity: { component, item: term }, sources: owned(component) }) });
  return (
    <DescriptionList
      items={[
        item('Uses', <Names names={entry.uses} none="Tokens only" />),
        item('Used by', <Names names={entry.usedBy} none={entry.tier === 'layout' ? 'Views' : entry.tier === 'compound' ? 'Layouts and views' : 'Compounds, layouts and views'} />),
        item(
          'Tokens it reads',
          <List
            variant="inline"
            items={entry.tokens.map((tk) => ({
              id: tk,
              content: (
                <Link href={`#/${tokenPage(tk)}`}>
                  <Code>{tk}</Code>
                </Link>
              ),
            }))}
          />,
        ),
      ]}
    />
  );
}

/** How many components the catalogue read, for the overview. */
export const componentCount = catalogue.filter((e) => e.file.startsWith('packages/core/')).length;
