/**
 * The Design tool's inspector (Q66.3): the right panel of a design tool, as typically found in Figma's properties
 * panel (Design, Prototype and Dev), drawn entirely from the template's JSON (`record.inspector`: tabs → sections →
 * rows of fields) through the library's own controls: NumberField, Select, SegmentedControl, Switch, Slider,
 * TextField with the ColourPicker swatch, AlignmentPicker, GradientEditor, Button, PropertySection, Tabs,
 * DescriptionList and CodeBlock. Every value lives on the layer (`props`), so the canvas and Dev mode follow each change
 * at once (zero latency: no transition on a value a person is setting). Fields may stack in one cell (`column`) or sit in a row's action column (`at: 'action'`); a `wide` first field takes two thirds of its row; a list may show each item as a summary row that opens a Popover (`summary`). No styles.
 */
import { Button, Cluster, CodeBlock, DescriptionList, GradientEditor, MenuButton, NumberField, Popover, PropertyRow, PropertySection, SegmentedControl, Select, Slider, Stack, Switch, Tabs, Text, TextField, AlignmentPicker, notify, type AlignmentPoint, type GradientStop } from '@design-library/core/components';
import type { ReactNode } from 'react';
import { fill } from '@design-library/core/render';
import type { DesignShape, InspectorField, InspectorSection, InspectorTab, PropItem, PropValue, ShapeProps } from './types';

const OWN = ['x', 'y', 'width', 'height', 'text'] as const;
type Own = (typeof OWN)[number];
const isOwn = (key: string): key is Own => (OWN as readonly string[]).includes(key);

export interface InspectorProps {
  tabs: InspectorTab[];
  /** Beside the tabs, at their end: the zoom (UI3 keeps it on the tab row). */
  extra?: ReactNode;
  /** The tab open at first (`design`, `prototype`, `dev`); the first when absent. */
  tab?: string;
  /** The selected layer, its props merged over the defaults. */
  shape: DesignShape & { props: ShapeProps };
  /** Its frame, for aligning inside it. */
  parent?: DesignShape;
  label: string;
  notInExample: string;
  noColours: string;
  /** Every colour in the layer and its children, for Selection colours and Dev mode. */
  colours: string[];
  onChange: (change: Partial<DesignShape>, props?: ShapeProps) => void;
  onReplaceColour: (from: string, to: string) => void;
  /** Property labels (the panel's view option): every field shows its label above it; off, glyphs and icons say what a field is, as Figma does by default. */
  labels?: boolean;
}

/** A layer's CSS, as Dev mode shows it: generated from its values. */
export function cssOf(shape: DesignShape & { props: ShapeProps }): string {
  const p = shape.props;
  const lines: string[] = [`width: ${shape.width}px;`, `height: ${shape.height}px;`];
  const items = (k: string) => ((p[k] as PropItem[] | undefined) ?? []).filter((i) => i.visible !== false);
  if (p.layout && p.layout !== 'none') {
    lines.push('display: flex;', `flex-direction: ${p.layout === 'horizontal' || p.layout === 'wrap' ? 'row' : 'column'};`);
    if (p.layout === 'wrap') lines.push('flex-wrap: wrap;');
    lines.push(`gap: ${p.gap}px;`, `padding: ${p.padTop}px ${p.padRight}px ${p.padBottom}px ${p.padLeft}px;`);
  }
  if (Number(p.rotation)) lines.push(`transform: rotate(${p.rotation}deg);`);
  if (p.radius !== undefined && shape.kind !== 'ellipse' && shape.kind !== 'text')
    lines.push(p.corners ? `border-radius: ${p.radiusTL}px ${p.radiusTR}px ${p.radiusBR}px ${p.radiusBL}px;` : `border-radius: ${p.radius}px;`);
  if (p.clip) lines.push('overflow: hidden;');
  if (p.opacity !== undefined && Number(p.opacity) < 100) lines.push(`opacity: ${Number(p.opacity) / 100};`);
  if (p.blend && p.blend !== 'pass-through' && p.blend !== 'normal') lines.push(`mix-blend-mode: ${p.blend};`);
  const fills = items('fills');
  if (fills.length) {
    const paint = (f: PropItem) =>
      f.type === 'linear' || f.type === 'radial'
        ? `${f.type}-gradient(${f.type === 'linear' ? `${f.angle ?? 180}deg, ` : ''}${((f.stops as PropItem[]) ?? []).map((st) => `${st.colour} ${st.position}%`).join(', ')})`
        : f.type === 'image'
          ? `url(${f.image}) center / ${f.fit === 'fit' ? 'contain' : f.fit === 'tile' ? 'auto repeat' : 'cover no-repeat'}`
          : `${f.colour}`;
    lines.push(shape.kind === 'text' ? `color: ${paint(fills[0])};` : `background: ${fills.map(paint).reverse().join(', ')};`);
  }
  const strokes = items('strokes');
  if (strokes.length && Number(p.strokeWeight) > 0) lines.push(`border: ${p.strokeWeight}px ${p.strokeStyle === 'dash' ? 'dashed' : 'solid'} ${strokes[0].colour};`);
  const effects = items('effects');
  const shadows = effects.filter((e) => e.type === 'drop' || e.type === 'inner').map((e) => `${e.type === 'inner' ? 'inset ' : ''}${e.x}px ${e.y}px ${e.blur}px ${e.spread}px ${e.colour}`);
  if (shadows.length) lines.push(`box-shadow: ${shadows.join(', ')};`);
  const layer = effects.find((e) => e.type === 'layer-blur');
  if (layer) lines.push(`filter: blur(${layer.blur}px);`);
  const backdrop = effects.find((e) => e.type === 'background-blur');
  if (backdrop) lines.push(`backdrop-filter: blur(${backdrop.blur}px);`);
  if (shape.kind === 'text') {
    lines.push(`font-family: "${p.font}";`, `font-weight: ${p.weight};`, `font-size: ${p.fontSize}px;`, `line-height: ${p.lineHeight}%;`);
    if (Number(p.letterSpacing)) lines.push(`letter-spacing: ${p.letterSpacing}%;`);
    if (p.textAlign && p.textAlign !== 'left') lines.push(`text-align: ${p.textAlign};`);
    if (p.decoration && p.decoration !== 'none') lines.push(`text-decoration: ${p.decoration};`);
    if (p.case && p.case !== 'none') lines.push(`text-transform: ${p.case};`);
    if (p.truncate) lines.push('overflow: hidden;', 'text-overflow: ellipsis;', `-webkit-line-clamp: ${p.maxLines};`);
  }
  return lines.join('\n');
}

export function Inspector({ tabs, tab, shape, parent, label, notInExample, noColours, colours, onChange, onReplaceColour, labels = false, extra }: InspectorProps) {
  const p = shape.props;
  const own = (key: string): PropValue | PropItem[] | undefined => (isOwn(key) ? shape[key] : p[key]);
  const setOwn = (key: string, v: PropValue | PropItem[]) => (isOwn(key) ? onChange({ [key]: v }) : onChange({}, { [key]: v }));
  const shows = (when: InspectorField['when'], get: (k: string) => unknown) => !when || (Array.isArray(when) ? when : [when]).every((w) => w.is.includes(get(w.key) as PropValue));

  const alignIn = (how: string) => {
    if (!parent) return;
    const at: Partial<Record<string, Partial<DesignShape>>> = {
      left: { x: 0 },
      'h-center': { x: Math.round((parent.width - shape.width) / 2) },
      right: { x: parent.width - shape.width },
      top: { y: 0 },
      'v-center': { y: Math.round((parent.height - shape.height) / 2) },
      bottom: { y: parent.height - shape.height },
    };
    const change = at[how];
    if (change) onChange(change);
  };

  /** One control; `get` and `set` read and write the layer, or one item of a list. `name` prefixes an item's labels; an item's Selects and text fields, and any Select with an icon, hide the visible label (their value or icon says what they are, as in Figma), the full name still read. */
  const field = (f: InspectorField, get: (k: string) => unknown, set: (k: string, v: PropValue | PropItem[]) => void, name = '', show = labels) => {
    if (!shows(f.when, get)) return null;
    const labelled = name ? `${name}, ${f.label.toLowerCase()}` : f.label;
    const v = get(f.key);
    const key = `${name}${f.key}`;
    switch (f.kind) {
      case 'number': {
        const keys = [f.key, ...(f.also ?? [])];
        const same = keys.every((k) => Number(get(k) ?? 0) === Number(v ?? 0));
        return <NumberField key={key} label={labelled} hideLabel={!show} glyph={f.glyph} icon={f.icon} unit={f.unit} min={f.min} max={f.max} step={f.step} size="xs" value={same ? Number(v ?? 0) : 'mixed'} onCommit={(n) => keys.forEach((k) => set(k, n))} />;
      }
      case 'menu': {
        const chosen = f.options?.find((o) => o.value === String(v ?? ''))?.label ?? '';
        return <MenuButton key={key} label={`${labelled}: ${chosen}`} menuLabel={labelled} icon={f.icon} iconOnly size="xs" emphasis="quiet" items={(f.options ?? []).map((o) => ({ value: o.value, label: o.label, icon: o.icon }))} onSelect={(x) => set(f.key, x)} />;
      }
      case 'column':
        return (
          <Stack key={key} gap="item">
            {(f.fields ?? []).map((g) => field(g, get, set, name, show))}
          </Stack>
        );
      case 'select':
        return <Select key={key} label={labelled} hideLabel={!show && (!!name || !!f.icon)} icon={f.icon} size="xs" options={f.options ?? []} value={String(v ?? '')} onChange={(x) => set(f.key, x)} />;
      case 'segmented':
        return <SegmentedControl key={key} label={labelled} iconOnly={f.iconOnly} size="xs" options={(f.options ?? []).map((o) => ({ value: o.value, label: o.label, icon: o.icon }))} value={String(v ?? '')} onChange={(x) => set(f.key, x)} />;
      case 'switch':
        return f.at === 'action' ? (
          <Switch key={key} label={f.label} hideLabel={!show} size="xs" checked={!!v} onChange={(x) => set(f.key, x)} />
        ) : (
          <Switch key={key} label={f.label} size="s" checked={!!v} onChange={(x) => set(f.key, x)} />
        );
      case 'colour':
        return <TextField key={key} label={labelled} hideLabel={!show} size="xs" value={String(v ?? '')} onCommit={(x) => set(f.key, x)} swatch={{ value: String(v ?? ''), onChange: (x) => set(f.key, x) }} />;
      case 'slider':
        return <Slider key={key} label={labelled} size="s" min={f.min ?? 0} max={f.max ?? 100} step={f.step} unit={f.unit} input value={Number(v ?? 0)} onChange={(x) => set(f.key, x as number)} />;
      case 'text':
        return <TextField key={key} label={labelled} hideLabel={!show && !!name} placeholder={f.placeholder} size="xs" value={String(v ?? '')} onCommit={(x) => set(f.key, x)} />;
      case 'alignment': {
        const [x, y] = String(v ?? 'start:start').split(':') as AlignmentPoint[];
        return <AlignmentPicker key={key} label={labelled} value={{ x, y }} onChange={(a) => set(f.key, `${a.x}:${a.y}`)} names={f.options?.map((o) => o.label)} disabled={get('layout') === 'none'} />;
      }
      case 'gradient':
        return <GradientEditor key={key} label={labelled} stops={((v as PropItem[]) ?? []) as unknown as GradientStop[]} onChange={(stops) => set(f.key, stops as unknown as PropItem[])} />;
      case 'align':
        return (
          <Cluster key={key} gap="none" justify="between" wrap={false}>
            {(f.options ?? []).map((o) => (
              <Button
                key={o.value}
                label={o.label}
                icon={o.icon}
                iconOnly
                tooltip
                emphasis="quiet"
                size="xs"
                onClick={() => (o.value.startsWith('distribute') || !parent ? notify({ message: fill(notInExample, { label: o.label }) }) : alignIn(o.value))}
              />
            ))}
          </Cluster>
        );
    }
  };
  /** The rows of a section or of one list item; `action` (an item's Remove) sits at the end of its first drawn row. */
  const rows = (list: InspectorField[][] | undefined, get: (k: string) => unknown, set: (k: string, v: PropValue | PropItem[]) => void, name = '', action?: ReactNode, show = labels) => {
    let first = true;
    return (list ?? []).map((row, i) => {
      const inRow = row.filter((f) => f.at !== 'action');
      const drawn = inRow.map((f) => field(f, get, set, name, show)).filter(Boolean);
      const extra = row.filter((f) => f.at === 'action').map((f) => field(f, get, set, name, show)).filter(Boolean);
      if (!drawn.length && !extra.length) return null;
      const end = first || extra.length ? (
        <>
          {extra}
          {first && action}
        </>
      ) : undefined;
      first = false;
      const columns = drawn.length === 1 || inRow.some((f) => f.kind === 'switch') ? 1 : drawn.length >= 3 ? 3 : 2;
      // One column holding several fields is several rows: each field is its own row of the section (Q93).
      if (columns === 1 && drawn.length > 1)
        return drawn.map((d, n) => (
          <PropertyRow key={`${i}-${n}`} columns={1} action={n === 0 ? end : undefined}>
            {d}
          </PropertyRow>
        ));
      return (
        <PropertyRow key={i} columns={columns} lead={drawn.length === 2 && (inRow[0].kind === 'colour' || !!inRow[0].wide)} action={end}>
          {drawn}
        </PropertyRow>
      );
    });
  };

  const section = (s: InspectorSection) => {
    if (s.kinds && !s.kinds.includes(shape.kind)) return null;
    if (!shows(s.when, own)) return null;
    const l = s.list;
    const items = l ? ((p[l.key] as PropItem[] | undefined) ?? []) : [];
    const setItems = (next: PropItem[]) => l && onChange({}, { [l.key]: next });
    return (
      <PropertySection
        key={s.id}
        heading={s.heading}
        density="compact"
        actions={l && <Button label={l.add} icon="plus" iconOnly tooltip emphasis="quiet" size="xs" onClick={() => setItems([...items, { ...l.template }])} />}
      >
        {!s.listFirst && rows(s.rows, own, setOwn)}
        {l &&
          items.map((item, n) => {
            const name = fill(l.item, { n: n + 1 });
            const set = (k: string, v: PropValue | PropItem[]) => setItems(items.map((x, j) => (j === n ? { ...x, [k]: v } : x)));
            const itemActions = (
              <>
                {l.visible && <Switch label={`${l.show ?? ''} ${name.toLowerCase()}`.trim()} hideLabel size="xs" checked={item[l.visible] !== false} onChange={(x) => set(l.visible!, x)} />}
                <Button label={`${l.remove} ${name.toLowerCase()}`} icon="minus" iconOnly tooltip emphasis="quiet" size="xs" onClick={() => setItems(items.filter((_, j) => j !== n))} />
              </>
            );
            // A summarised item (an interaction): one row naming it, whose button opens its fields, labelled, in a Popover.
            if (l.summary) {
              const words = Object.fromEntries(l.rows.flat().map((f) => [f.key, f.options?.find((o) => o.value === String(item[f.key] ?? ''))?.label ?? String(item[f.key] ?? '')]));
              return (
                <PropertyRow key={n} columns={1} action={itemActions}>
                  <Popover trigger={{ label: fill(l.summary, words), size: 'xs' }} title={name}>
                    <Stack gap="item">{rows(l.rows, (k) => item[k], set, '', undefined, true)}</Stack>
                  </Popover>
                </PropertyRow>
              );
            }
            return (
              <Stack key={n} gap="item">
                {rows(l.rows, (k) => item[k], set, name, itemActions)}
              </Stack>
            );
          })}
        {s.listFirst && rows(s.rows, own, setOwn)}
        {s.facts && <DescriptionList items={s.facts.map((f) => ({ term: f.label, details: `${String(own(f.key) ?? '—')}${f.unit ?? ''}` }))} />}
        {s.code && <CodeBlock label={s.code} code={cssOf(shape)} wrap />}
        {s.colours &&
          (colours.length ? (
            <Stack gap="item">
              {colours.map((c, i) => (
                <PropertyRow key={c + i} columns={1}>
                  <TextField label={`${s.heading}, ${i + 1}`} hideLabel={!labels} size="xs" value={c} onCommit={(x) => onReplaceColour(c, x)} swatch={{ value: c, onChange: (x) => onReplaceColour(c, x) }} />
                </PropertyRow>
              ))}
            </Stack>
          ) : (
            <Text variant="body-sm" tone="muted">
              {noColours}
            </Text>
          ))}
        {s.action && (
          <Cluster gap="item">
            <Button label={fill(s.action.label, { name: shape.label })} size="xs" onClick={() => notify({ message: s.action!.says })} />
          </Cluster>
        )}
      </PropertySection>
    );
  };

  return <Tabs label={label} items={tabs.map((t) => ({ id: t.id, label: t.label, panel: <Stack gap="group">{t.sections.map(section)}</Stack> }))} defaultSelected={tab ?? tabs[0]?.id} size="xs" extra={extra} />;
}
