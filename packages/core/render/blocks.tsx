/**
 * The core block set (Q64): each core block type → the core components that draw it. Pure mapping from data to
 * props; no styles. `npm run check:content` holds this list equal to blocks.schema.json's block types. A template adds
 * its own (namespaced) types in its registry; it never replaces these.
 */
import { Fragment, useState, type ReactNode } from 'react';
import { Accordion, Agenda, Alert, Avatar, Breadcrumbs, Button, Card, Frame, Cluster, CodeBlock, DescriptionList, EmptyState, Footer, Grid, Heading, Hero, Icon, Image, ImageGrid, Link, List, Morph, NumberField, Pagination, Persona, Quote, RadioGroup, Reveal, Section, Select, SiteHeader, Stack, Statistic, Switch, Tabs, Text, TextArea, TextField, notify } from '../react';
import { fill } from './fill';
import type { BlockRenderer, CoreBlock, SiteAction, SiteEmpty, SiteField, SiteLink } from './types';

type Of<T extends CoreBlock['type']> = Extract<CoreBlock, { type: T }>;

export const actionButtons = (list: SiteAction[] | undefined, size?: 's') =>
  list?.length ? (
    <>
      {list.map((a) => (
        <Button key={a.label} label={a.label} emphasis={a.primary ? 'primary' : 'default'} size={size} onClick={() => notify({ message: a.says })} />
      ))}
    </>
  ) : undefined;

/**
 * Follows the screen state the content names (a state layout), and keeps the reader's own changes until it names
 * another. `known` filters it to the states this block can draw.
 */
function useScreenState<S extends string>(named: string | undefined, known: readonly S[], rest: S) {
  const pick = (s: string | undefined) => (known.includes(s as S) ? (s as S) : rest);
  const [state, setState] = useState<S>(() => pick(named));
  const [from, setFrom] = useState(named);
  if (from !== named) {
    setFrom(named);
    setState(pick(named));
  }
  return [state, setState] as const;
}

/**
 * A form block (Q65 TP2): one box that is the form, the form with its error, or what happens next. A refused send
 * (the screen state `failed`, which a real service decides) keeps every value and reveals the error above the
 * fields; a send that's accepted becomes its outcome in the same box (Morph), with focus on it. Without an outcome,
 * a confirmation takes the button's place.
 */
function FormBlock({ block, named }: { block: Of<'form'>; named?: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useScreenState(named, ['failed', 'done'] as const, 'form' as 'form' | 'failed' | 'done');
  const sent = state === 'done';
  const set = (id: string) => (v: string) => setValues((x) => ({ ...x, [id]: v }));
  const field = (f: SiteField) => {
    const common = { label: f.label, hint: f.hint, optional: f.optional, error: errors[f.id] };
    if (f.kind === 'long') return <TextArea key={f.id} {...common} value={values[f.id] ?? ''} onChange={set(f.id)} />;
    if (f.kind === 'choice') return <Select key={f.id} {...common} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} value={values[f.id] ?? ''} onChange={set(f.id)} placeholder={block.choose} />;
    return <TextField key={f.id} {...common} type={f.kind} value={values[f.id] ?? ''} onCommit={set(f.id)} />;
  };
  const send = () => {
    const missing = Object.fromEntries(block.fields.filter((f) => !f.optional && !values[f.id]?.trim()).map((f) => [f.id, fill(f.kind === 'choice' ? block.pick : block.enter, { field: f.label.toLowerCase() })]));
    setErrors(missing);
    if (Object.keys(missing).length) return;
    setState('done');
  };
  if (sent && block.outcome) {
    const o = block.outcome;
    return (
      <Morph state="done">
        <div data-morph-focus="" tabIndex={-1}>
          <Hero layout="stacked" eyebrow={o.eyebrow} title={o.title} lead={o.text} actions={linkList(o.links)} note={o.note} />
        </div>
      </Morph>
    );
  }
  return (
    <Morph state="form">
      <Section heading={block.heading} intro={block.intro}>
        <Stack gap="group">
          {block.error && (
            <Reveal open={state === 'failed'}>
              {state === 'failed' && (
                <Alert tone="error" announce="assertive">
                  {block.error}
                </Alert>
              )}
            </Reveal>
          )}
          {block.fields.map(field)}
          {sent ? (
            <Alert tone="success" announce="polite">
              {block.sent}
            </Alert>
          ) : (
            <Cluster gap="item">
              <Button label={block.submit} emphasis="primary" onClick={send} />
            </Cluster>
          )}
          {linkList(block.links)}
        </Stack>
      </Section>
    </Morph>
  );
}

/**
 * A list block's items, or its empty state in the same box (Q65 TP3): the screen's `empty` state shows why it's
 * empty and what to do where the list was, and a change between the two morphs in place. Blocks without `empty`
 * draw the list as before.
 */
const listOrEmpty = (state: string | undefined, empty: SiteEmpty | undefined, list: ReactNode) =>
  empty ? (
    <Morph state={state === 'empty' ? 'empty' : 'list'}>
      {state === 'empty' ? (
        <EmptyState reason={empty.reason} scope="section" headingLevel={3} title={empty.title} silhouette={empty.silhouette} actions={linkList(empty.links)}>
          {empty.text}
        </EmptyState>
      ) : (
        list
      )}
    </Morph>
  ) : (
    list
  );

/** Links in content, one after another: the ways on from a form, a message or a status page. */
export const linkList = (links: SiteLink[] | undefined) =>
  links?.length ? (
    <Cluster gap="item">
      {links.map((l) => (
        <Link key={l.label} href={l.href} external={l.external}>
          {l.label}
        </Link>
      ))}
    </Cluster>
  ) : undefined;

/** A tickets block: one kind of ticket and how many, the total in the reader's currency format, then a hold in place of the button. */
function TicketsBlock({ block }: { block: Of<'tickets'> }) {
  const [choice, setChoice] = useState<string>(block.options[0].value);
  const [count, setCount] = useState(1);
  const [held, setHeld] = useState(false);
  const money = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: block.currency, maximumFractionDigits: 0 }).format(n);
  const chosen = block.options.find((o) => o.value === choice) ?? block.options[0];
  return (
    <Section heading={block.heading} intro={block.intro}>
      <Stack gap="group">
        <RadioGroup
          label={block.labels.ticket}
          appearance="tile"
          options={block.options.map((o) => ({ value: o.value, label: o.label, description: o.description, meta: o.meta ? `${money(o.price)} · ${o.meta}` : money(o.price) }))}
          value={choice}
          onChange={(v) => {
            setChoice(v);
            setHeld(false);
          }}
        />
        <NumberField label={block.labels.count} value={count} min={1} max={10} onCommit={(n) => (setCount(n), setHeld(false))} />
        <DescriptionList
          items={[
            { term: block.labels.tickets, details: fill(block.labels.line, { count, ticket: chosen.label }) },
            { term: block.labels.total, details: money(chosen.price * count) },
          ]}
        />
        {held ? (
          <Alert tone="success" announce="polite">
            {block.sent}
          </Alert>
        ) : (
          <Cluster gap="item">
            <Button label={block.submit} emphasis="primary" onClick={() => setHeld(true)} />
          </Cluster>
        )}
      </Stack>
    </Section>
  );
}

/** A search block: the query in a field; pressing the button narrows the results to those that match every word. */
function SearchBlock({ block }: { block: Of<'search'> }) {
  const [draft, setDraft] = useState(block.query);
  const [query, setQuery] = useState(block.query);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = block.results.filter((r) => words.every((w) => `${r.title} ${r.description} ${r.eyebrow ?? ''}`.toLowerCase().includes(w)));
  return (
    <Section heading={block.heading}>
      <Stack gap="group">
        <TextField label={block.label} type="search" icon="search" value={draft} onCommit={setDraft} action={{ label: block.button, onAction: (v) => (setDraft(v), setQuery(v)) }} />
        <Morph state={shown.length ? 'results' : 'none'}>
        {shown.length ? (
          <Stack gap="item">
            <Text as="p" tone="muted">
              {fill(block.summary, { count: shown.length, query })}
            </Text>
            {shown.map((r) => (
              <Card key={r.title} layout="row" headingLevel={3} href={r.href} eyebrow={r.eyebrow} title={r.title} description={r.description} />
            ))}
          </Stack>
        ) : (
          <EmptyState reason="no-results" scope="section" headingLevel={3} title={fill(block.none.title, { query })} actions={linkList(block.none.links)} announce>
            {fill(block.none.text, { query })}
          </EmptyState>
        )}
        </Morph>
      </Stack>
    </Section>
  );
}

/** A settings block: each switch or choice keeps its own value and confirms each change once. */
function SettingsBlock({ block }: { block: Of<'settings'> }) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(block.groups.flatMap((g) => g.items.map((it) => [it.id, it.kind === 'switch' ? !!it.on : (it.value ?? '')]))),
  );
  const set = (id: string, label: string) => (v: string | boolean) => {
    setValues((x) => ({ ...x, [id]: v }));
    notify({ message: fill(block.saved, { setting: label }) });
  };
  return (
    <Section heading={block.heading} intro={block.intro}>
      <>
        {block.groups.map((g) => (
          <Section key={g.heading} heading={g.heading} level={3} size={4} nested>
            <Stack gap="item">
              {g.items.map((it) =>
                it.kind === 'switch' ? (
                  <Switch key={it.id} label={it.label} description={it.description} checked={!!values[it.id]} onChange={set(it.id, it.label)} />
                ) : (
                  <Select key={it.id} label={it.label} hint={it.description} options={(it.options ?? []).map((o) => ({ value: o, label: o }))} value={String(values[it.id])} onChange={set(it.id, it.label)} />
                ),
              )}
            </Stack>
          </Section>
        ))}
        {linkList(block.links)}
      </>
    </Section>
  );
}

const inSection = (key: number, heading: string | undefined, body: ReactNode) =>
  heading ? (
    <Section key={key} heading={heading}>
      {body}
    </Section>
  ) : (
    <Fragment key={key}>{body}</Fragment>
  );

/** The registry: one entry per core block type. */
export const BLOCKS: { [T in CoreBlock['type']]: BlockRenderer<Of<T>> } = {
  'site-header': (b, ctx, i) => {
    const current = String(ctx.settings.current ?? '');
    return (
      <SiteHeader
        key={i}
        name={b.name}
        href={b.places[0].href}
        mark={b.mark ? <Icon name={b.mark} /> : undefined}
        links={b.places.map((p) => ({ label: p.label, href: p.href, current: p.href.endsWith(`/${current}`) }))}
        actions={b.actions ? <Cluster gap="item">{actionButtons(b.actions, 's')}</Cluster> : undefined}
      />
    );
  },
  'site-footer': (b, _ctx, i) => <Footer key={i} sectionsLabel={b.sectionsLabel} sections={b.sections} links={b.links} identity={b.identity} legal={b.legal} />,
  // Q88: a page's opening is its stage; a hero further down is a feature.
  hero: (b, ctx, i) => (
    <Frame key={i} kind={i === 0 ? 'stage' : 'feature'}>
      <Hero eyebrow={b.eyebrow} title={b.title} lead={b.lead} actions={actionButtons(b.actions)} note={b.note} picture={b.picture ? ctx.picture(b.picture) : undefined} layout={b.layout} />
    </Frame>
  ),
  stats: (b, _ctx, i) => (
    <Section key={i} heading={b.heading} intro={b.intro}>
      <Grid max={4}>
        {b.items.map((s) => (
          <Statistic key={s.label} label={s.label} value={s.value} unit={s.unit} description={s.description} />
        ))}
      </Grid>
    </Section>
  ),
  cards: (b, ctx, i) => (
    <Section key={i} heading={b.heading} intro={b.intro}>
      {listOrEmpty(ctx.state, b.empty, <Grid max={b.max ?? 3}>
        {b.items.map((c) => (
          <Card
            key={c.title}
            headingLevel={3}
            eyebrow={c.eyebrow}
            title={c.title}
            description={c.description}
            meta={c.meta ? <Text as="span" variant="body-sm" tone="muted">{c.meta}</Text> : undefined}
            href={c.href}
            media={c.picture ? <Image src={ctx.picture(c.picture).src} alt={ctx.picture(c.picture).alt} ratio="wide" /> : undefined}
          />
        ))}
      </Grid>)}
    </Section>
  ),
  quote: (b, _ctx, i) => (
    <Frame key={i} kind="feature">
      <Quote size="l" align="center" author={{ name: b.name, role: b.role }}>
        {b.text}
      </Quote>
    </Frame>
  ),
  points: (b, _ctx, i) => (
    <Section key={i} heading={b.heading} intro={b.intro}>
      <List variant="bulleted" items={b.items.map((t, n) => ({ id: String(n), content: t }))} />
    </Section>
  ),
  details: (b, _ctx, i) => (
    <Section key={i} heading={b.heading} intro={b.intro}>
      <DescriptionList items={b.items} />
    </Section>
  ),
  form: (b, ctx, i) => <FormBlock key={i} block={b} named={ctx.state} />,
  alert: (b, _ctx, i) => (
    <Alert key={i} tone={b.tone} placement="section" title={b.title} actions={linkList(b.links)}>
      {b.text}
    </Alert>
  ),
  status: (b, _ctx, i) => (
    <Frame key={i} kind="stage">
      <Hero layout="stacked" eyebrow={b.eyebrow} title={b.title} lead={b.text} actions={linkList(b.links)} note={b.note} />
    </Frame>
  ),
  search: (b, _ctx, i) => <SearchBlock key={i} block={b} />,
  settings: (b, _ctx, i) => <SettingsBlock key={i} block={b} />,
  empty: (b, _ctx, i) => (
    <EmptyState key={i} reason={b.reason} scope="view" title={b.title} silhouette={b.silhouette} actions={linkList(b.links)}>
      {b.text}
    </EmptyState>
  ),
  cta: (b, _ctx, i) => (
    <Frame key={i} kind="feature">
      <Hero level={2} layout="divided" title={b.title} lead={b.lead} actions={actionButtons(b.actions)} note={b.note} />
    </Frame>
  ),
  gallery: (b, ctx, i) => inSection(i, b.heading, <ImageGrid label={b.label} layout={b.layout} items={b.items.map((name, n) => ({ id: String(n), ...ctx.picture(name), span: b.layout === 'quilted' && n === 0 ? 'large' : undefined }))} />),
  breadcrumbs: (b, _ctx, i) => <Breadcrumbs key={i} items={b.items} />,
  byline: (b, ctx, i) => <Persona key={i} name={<Link href={b.href}>{b.name}</Link>} nameText={b.name} secondary={`${b.date} · ${b.read}`} size={40} src={b.picture ? ctx.picture(b.picture).src : undefined} />,
  person: (b, ctx, i) => (
    <Stack key={i} gap="section">
      {(b.portrait || b.picture) && <Avatar name={b.name} size={96} src={b.picture ? ctx.picture(b.picture).src : undefined} />}
      <Hero eyebrow={b.role} title={b.name} lead={b.bio[0]} layout="stacked" />
      {b.bio.length > 1 && (
        <Stack gap="group">
          {b.bio.slice(1).map((t) => (
            <Text key={t} as="p">
              {t}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  ),
  prose: (b, ctx, i) => {
    // Q85: a heading starts a run that reads as one group (its parts a group apart); runs sit a section apart, so each
    // heading is twice as far from what's above it as from its own text.
    const runs: (typeof b.items)[] = [];
    for (const item of b.items) {
      // A quote stands as its own run, a section's space from the text around it.
      const last = runs[runs.length - 1];
      if (item.kind === 'heading' || item.kind === 'quote' || !last || last[0]?.kind === 'quote') runs.push([]);
      runs[runs.length - 1].push(item);
    }
    const draw = (item: (typeof b.items)[number], n: number) => {
        switch (item.kind) {
          case 'heading':
            return (
              <Heading key={n} level={2} size={3}>
                {item.text}
              </Heading>
            );
          case 'text':
            return (
              <Text key={n} as="p">
                {item.text}
              </Text>
            );
          case 'quote':
            return (
              <Quote key={n} author={item.name ? { name: item.name } : undefined}>
                {item.text}
              </Quote>
            );
          case 'picture':
            return <Image key={n} src={ctx.picture(item.picture).src} alt={ctx.picture(item.picture).alt} caption={item.caption} ratio="wide" rounded />;
          case 'list':
            return <List key={n} variant="bulleted" items={item.items.map((t, m) => ({ id: String(m), content: t }))} />;
          case 'code':
            return <CodeBlock key={n} label={item.label} code={item.code} />;
        }
    };
    if (runs.length < 2) return <Stack key={i} gap="group">{b.items.map(draw)}</Stack>;
    return (
      <Stack key={i} gap="section">
        {runs.map((run, r) => (
          <Stack key={r} gap="group">
            {run.map((item, n) => draw(item, n))}
          </Stack>
        ))}
      </Stack>
    );
  },
  posts: (b, ctx, i) => (
    <Section key={i} heading={b.heading}>
      {listOrEmpty(ctx.state, b.empty, <Stack gap="group">
        {b.items.map((c) => (
          <Card
            key={c.title}
            layout="row"
            headingLevel={3}
            href={c.href}
            eyebrow={c.eyebrow}
            title={c.title}
            description={c.description}
            meta={<Text as="span" variant="body-sm" tone="muted">{c.meta}</Text>}
            media={c.picture ? <Image src={ctx.picture(c.picture).src} alt="" ratio="photo" /> : undefined}
          />
        ))}
        {b.pages && b.pages > 1 && <Pagination page={b.page ?? 1} pages={b.pages} hrefFor={() => b.items[0].href.replace(/\/[^/]+$/, '/index')} label={b.pagingLabel ?? ''} />}
      </Stack>)}
    </Section>
  ),
  people: (b, ctx, i) => (
    <Section key={i} heading={b.heading} intro={b.intro}>
      <Grid max={4}>
        {b.items.map((p) => (
          <Persona key={p.name} name={p.href ? <Link href={p.href}>{p.name}</Link> : p.name} nameText={p.name} secondary={p.role} size={56} src={p.picture ? ctx.picture(p.picture).src : undefined} />
        ))}
      </Grid>
    </Section>
  ),
  schedule: (b, _ctx, i) => inSection(i, b.heading, <Tabs label={b.daysLabel} items={b.days.map((d) => ({ id: d.id, label: d.label, panel: <Agenda label={d.title} slots={d.slots} headingLevel={b.heading ? 3 : 2} /> }))} />),
  agenda: (b, ctx, i) => (
    <Section key={i} heading={b.heading}>
      {listOrEmpty(ctx.state, b.empty, <Agenda label={b.label} slots={b.slots} />)}
    </Section>
  ),
  tickets: (b, _ctx, i) => <TicketsBlock key={i} block={b} />,
  questions: (b, _ctx, i) => (
    <Section key={i} heading={b.heading}>
      <Accordion headingLevel={3} items={b.items.map((q) => ({ id: q.title, title: q.title, content: <Text as="p">{q.text}</Text> }))} />
    </Section>
  ),
};
