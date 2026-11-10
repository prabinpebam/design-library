/**
 * The core block set (Q64): each core block type → the core components that draw it. Pure mapping from data to
 * props; no styles. `npm run check:content` holds this list equal to blocks.schema.json's block types. A template adds
 * its own (namespaced) types in its registry; it never replaces these.
 */
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Accordion, Agenda, Alert, Avatar, Breadcrumbs, Button, Card, Frame, Cluster, CodeBlock, DescriptionList, EmptyState, Footer, Grid, Heading, Hero, Icon, Image, ImageGrid, Link, List, Morph, NumberField, Pagination, Persona, Quote, RadioGroup, Reveal, Section, Select, SiteHeader, Stack, Statistic, Switch, Tabs, Text, TextArea, TextField, notify } from '../react/components';
import { fill } from './fill';
import { richText } from './rich-text';
import type { Block, BlockRenderer, CoreBlock, RenderContext, SiteAction, SiteEmpty, SiteField, SiteLink } from './types';

type Of<T extends CoreBlock['type']> = Extract<CoreBlock, { type: T }>;

export const actionButtons = (list: SiteAction[] | undefined, size?: 's') =>
  list?.length ? (
    <>
      {list.map((a) => (
        a.href !== undefined ? (
          <Button key={a.label} label={a.label} emphasis={a.primary ? 'primary' : 'default'} size={size} href={a.href} />
        ) : (
          <Button key={a.label} label={a.label} emphasis={a.primary ? 'primary' : 'default'} size={size} onClick={() => notify({ message: a.says })} />
        )
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
  const missingOf = (v: Record<string, string>) => Object.fromEntries(block.fields.filter((f) => !f.optional && !v[f.id]?.trim()).map((f) => [f.id, fill(f.kind === 'choice' ? block.pick : block.enter, { field: f.label.toLowerCase() })]));
  const field = (f: SiteField) => {
    const common = { label: f.label, hint: f.hint, optional: f.optional, error: errors[f.id] };
    if (f.kind === 'long') return <TextArea key={f.id} {...common} value={values[f.id] ?? ''} onChange={set(f.id)} />;
    if (f.kind === 'choice') return <Select key={f.id} {...common} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} value={values[f.id] ?? ''} onChange={set(f.id)} placeholder={block.choose} />;
    return <TextField key={f.id} {...common} type={f.kind} value={values[f.id] ?? ''} onCommit={set(f.id)} />;
  };
  const send = () => {
    const missing = missingOf(values);
    setErrors(missing);
    if (Object.keys(missing).length) return;
    setState('done');
  };
  // The failed screen state: the kept answers are back in their fields and the fields without one are marked at
  // fault, so the error shows on the field as well as above the form (docs/ui-states.md, US4).
  useEffect(() => {
    if (state !== 'failed') return;
    const kept = Object.fromEntries(block.fields.filter((f) => f.answer).map((f) => [f.id, f.answer as string]));
    setValues(kept);
    setErrors({ ...missingOf(kept), ...Object.fromEntries(block.fields.filter((f) => f.answer && f.invalid).map((f) => [f.id, f.invalid as string])) });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const fieldErrors = Object.keys(errors).length > 0;
  if (sent && block.outcome) {
    const o = block.outcome;
    return (
      <Morph state="done">
        <Hero data-morph-focus="" layout="stacked" eyebrow={o.eyebrow} title={o.title} lead={o.text} actions={linkList(o.links)} note={o.note} />
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
                <Alert tone="error" announce="assertive" data-error-scope={fieldErrors ? 'fields' : 'form'}>
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

// Framing by block type and context (Q88–Q91). Framing isolates a piece, which interrupts reading, so only what gains
// from being read alone is framed: a hero or call to action declared `standalone` (a brand opening, a marketing page's
// closing invitation), a quote and a status message. Anything else flows with its content.
const FRAMED = new Set(['hero', 'quote', 'cta', 'status']);
type Placed = { type: string; standalone?: boolean };
const frames = (b: Placed | undefined) => !!b && FRAMED.has(b.type) && (!['hero', 'cta'].includes(b.type) || b.standalone === true);
const isStage = (list: Placed[] | undefined, i: number) =>
  list?.[i]?.type === 'status' || (list?.[i]?.type === 'hero' && list.slice(0, i).every((b) => b.type === 'breadcrumbs'));
/** Whether the block at `i` is framed: framing blocks are, except a feature right after a framed block (FR9: two spotlights in a row are a flow again). */
const framedAt = (list: Placed[] | undefined, i: number): boolean =>
  !!list && frames(list[i]) && (isStage(list, i) || i === 0 || !framedAt(list, i - 1));

const isFramed = (ctx: RenderContext, i: number) => ctx.region === 'main' && framedAt(ctx.neighbours, i);

function frame(ctx: RenderContext, i: number, kind: 'stage' | 'feature', body: ReactNode) {
  // Framing presents a piece on the page itself: only in the page's main region, never in a side column (Q89.2).
  if (!isFramed(ctx, i)) return <Fragment key={i}>{body}</Fragment>;
  // A stage alone in its region is the page's whole point: distraction-free. With more to come, it peeks (Q90).
  const mode = kind === 'stage' && ctx.siblings === 1 ? 'distraction-free' : 'peek';
  return (
    <Frame key={i} kind={kind} mode={mode}>
      {body}
    </Frame>
  );
}
/** Content blocks that sit in a column: what a slot takes (no page chrome, openings, closings or framed messages). */
const CONTENT = ['prose', 'points', 'details', 'quote', 'stats', 'cards', 'gallery', 'people', 'questions', 'agenda', 'schedule', 'posts', 'person', 'byline', 'alert', 'empty', 'form', 'search', 'settings', 'tickets'];

/**
 * Named slots (DP11): where a block holds other blocks, and the core block types each accepts. A template's own
 * (namespaced) block types are accepted in every slot. A block a slot doesn't accept is left out and reported.
 */
export const SLOTS: Record<string, readonly string[]> = {
  'hero.media': ['gallery'],
  // MP9: decoration is art, so only a template's own (namespaced) blocks; no core block draws shapes.
  'hero.decoration': [],
  'image.decoration': [],
  'split.start': CONTENT,
  'split.end': CONTENT,
  'grid.items': CONTENT,
};

/** Renders a slot's blocks: the ones it accepts, through the registry. */
function slot(ctx: RenderContext, name: string, blocks: Block[] | undefined): ReactNode {
  const accepts = SLOTS[name] ?? [];
  const taken = (blocks ?? []).filter((b) => {
    const ok = b.type.includes('.') || accepts.includes(b.type);
    if (!ok) ctx.problem?.(`${name} doesn’t take a “${b.type}” block (it takes ${accepts.length ? `${accepts.join(', ')} or ` : 'only '}a template’s own blocks)`);
    return ok;
  });
  return taken.length ? ctx.blocks(taken) : null;
}

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
  // Q88–Q91: a hero declared standalone (a brand opening) is the page's stage, or a feature further down; any other
  // hero flows with its content. A stage alone in its region is distraction-free; with more to come it peeks. A framed
  // hero's picture sits beside its words (split; its container still stacks them when narrow), so words and picture
  // fit the window together and the next band peeks: stacked, the picture alone can be taller than the window.
  hero: (b, ctx, i) =>
    frame(
      ctx,
      i,
      isStage(ctx.neighbours, i) ? 'stage' : 'feature',
      <Hero
        eyebrow={b.eyebrow}
        title={richText(b.title)}
        lead={richText(b.lead)}
        actions={actionButtons(b.actions)}
        note={b.note}
        picture={b.picture ? { ...ctx.picture(b.picture), decoration: b.decoration?.length ? slot(ctx, 'hero.decoration', b.decoration) : undefined } : undefined}
        media={!b.picture && b.media?.length ? slot(ctx, 'hero.media', b.media) : undefined}
        layout={(b.picture || b.media?.length) && isFramed(ctx, i) ? 'split' : b.layout}
        reserve={b.reserve}
      />,
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
            media={c.picture ? <Image src={ctx.picture(c.picture).src} alt={ctx.picture(c.picture).alt} ratio={ctx.picture(c.picture).ratio ?? 'wide'} focal={ctx.picture(c.picture).focal} dark={ctx.picture(c.picture).dark} contrast={ctx.picture(c.picture).contrast} treatment={ctx.picture(c.picture).treatment} priority={ctx.picture(c.picture).priority} /> : undefined}
          />
        ))}
      </Grid>)}
    </Section>
  ),
  quote: (b, ctx, i) =>
    frame(
      ctx,
      i,
      'feature',
      <Quote size="l" align="center" author={{ name: b.name, role: b.role }}>
        {b.text}
      </Quote>,
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
  status: (b, ctx, i) =>
    frame(ctx, i, 'stage', <Hero layout="stacked" eyebrow={b.eyebrow} title={b.title} lead={b.text} actions={linkList(b.links)} note={b.note} />),
  search: (b, _ctx, i) => <SearchBlock key={i} block={b} />,
  settings: (b, _ctx, i) => <SettingsBlock key={i} block={b} />,
  empty: (b, _ctx, i) => (
    <EmptyState key={i} reason={b.reason} scope="view" title={b.title} silhouette={b.silhouette} actions={linkList(b.links)}>
      {b.text}
    </EmptyState>
  ),
  cta: (b, ctx, i) => frame(ctx, i, 'feature', <Hero level={2} layout="divided" title={richText(b.title)} lead={richText(b.lead)} actions={actionButtons(b.actions)} note={b.note} />),
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
                {richText(item.text)}
              </Heading>
            );
          case 'text':
            return (
              <Text key={n} as="p">
                {richText(item.text)}
              </Text>
            );
          case 'quote':
            return (
              <Quote key={n} author={item.name ? { name: item.name } : undefined}>
                {item.text}
              </Quote>
            );
          case 'picture':
            return <Image key={n} src={ctx.picture(item.picture).src} alt={ctx.picture(item.picture).alt} caption={item.caption} ratio={ctx.picture(item.picture).ratio ?? 'wide'} focal={ctx.picture(item.picture).focal} dark={ctx.picture(item.picture).dark} contrast={ctx.picture(item.picture).contrast} treatment={ctx.picture(item.picture).treatment} priority={ctx.picture(item.picture).priority} decoration={item.decoration?.length ? slot(ctx, 'image.decoration', item.decoration) : undefined} rounded />;
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
            media={c.picture ? <Image src={ctx.picture(c.picture).src} dark={ctx.picture(c.picture).dark} contrast={ctx.picture(c.picture).contrast} alt="" ratio="photo" /> : undefined}
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
  split: (b, ctx, i) => {
    const columns = (
      <Grid ratio={b.ratio} max={b.ratio ? undefined : 2} gap="section">
        <Stack gap="section">{slot(ctx, 'split.start', b.start)}</Stack>
        <Stack gap="section">{slot(ctx, 'split.end', b.end)}</Stack>
      </Grid>
    );
    return b.heading ? (
      <Section key={i} heading={b.heading} intro={b.intro}>
        {columns}
      </Section>
    ) : (
      <Fragment key={i}>{columns}</Fragment>
    );
  },
  grid: (b, ctx, i) => {
    const cells = (
      <Grid max={b.max ?? 2} gap="section">
        {slot(ctx, 'grid.items', b.items)}
      </Grid>
    );
    return b.heading ? (
      <Section key={i} heading={b.heading} intro={b.intro}>
        {cells}
      </Section>
    ) : (
      <Fragment key={i}>{cells}</Fragment>
    );
  },
  questions: (b, _ctx, i) => (
    <Section key={i} heading={b.heading}>
      <Accordion headingLevel={3} items={b.items.map((q) => ({ id: q.title, title: q.title, content: <Text as="p">{q.text}</Text> }))} />
    </Section>
  ),
};
