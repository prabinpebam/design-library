/**
 * The Design tool template's binding (Q61, Q62, Q64): the record in content/editor.json mapped to EditorLayout (bar, layers, canvas, properties),
 * Toolbar, SegmentedControl and the zoom MenuButton (floating over the canvas; the properties head keeps who's here, the view options (Property labels) and Share), Select, AvatarGroup, TreeView, Canvas, NumberField, TextArea and Button. One selection is
 * shared by the layers and the canvas; the property fields change the shape on the canvas. `mode` (a screen's
 * settings) opens it presenting the prototype (Present.tsx) or with the comment threads in the properties panel
 * (Comments.tsx). No styles.
 */
import { useState } from 'react';
import { AvatarGroup, Button, Canvas, Cluster, EditorLayout, Heading, MenuButton, Popover, Reveal, SegmentedControl, Switch, Stack, Text, Toolbar, TreeView, notify, type CanvasLook, type CanvasShape, type TreeItem } from '@design-library/core/react';
import { fill } from '@design-library/core/render';
import { DesignComments } from './Comments';
import { Inspector } from './Inspector';
import { DesignPresent } from './Present';
import type { DesignAppSpec, DesignShape, PropItem, ShapeProps } from './types';

/** A layer's values: the defaults for all layers, then its kind's, then its own. */
const propsOf = (view: DesignAppSpec, s: DesignShape): ShapeProps => ({ ...view.defaults.all, ...view.defaults[s.kind], ...s.props });
const visible = (list: unknown) => ((list as PropItem[] | undefined) ?? []).filter((i) => i.visible !== false);
/** What the canvas draws from the inspector's values: the top solid fill, the top fill's picture when it's an image fill, opacity, corners, rotation, the top stroke. */
const fits = { fill: 'cover', crop: 'cover', fit: 'contain', tile: 'tile' } as const;
const lookOf = (p: ShapeProps, picture?: (id: string) => string | undefined): CanvasLook => {
  const fillPaint = visible(p.fills).filter((f) => !f.type || f.type === 'solid').at(-1);
  const top = visible(p.fills).at(-1);
  const image = top?.type === 'image' && top.image ? picture?.(String(top.image)) : undefined;
  const stroke = visible(p.strokes)[0];
  return {
    fill: fillPaint ? String(fillPaint.colour) : undefined,
    ...(image && { image, imageFit: fits[String(top?.fit) as keyof typeof fits] ?? 'cover' }),
    opacity: p.opacity !== undefined ? Number(p.opacity) / 100 : undefined,
    radius: p.radius !== undefined ? Number(p.radius) : undefined,
    rotation: Number(p.rotation) || undefined,
    stroke: stroke ? String(stroke.colour) : undefined,
    strokeWeight: stroke ? Number(p.strokeWeight) : undefined,
    hidden: p.visible === false || undefined,
  };
};
const coloursIn = (view: DesignAppSpec, s: DesignShape): string[] => [
  ...new Set([...visible(propsOf(view, s).fills).filter((f) => f.colour).map((f) => String(f.colour)), ...(s.children ?? []).flatMap((c) => coloursIn(view, c))]),
];
const recolour = (shapes: DesignShape[], from: string, to: string): DesignShape[] =>
  shapes.map((s) => ({
    ...s,
    ...(s.props?.fills && { props: { ...s.props, fills: (s.props.fills as PropItem[]).map((f) => (f.colour === from ? { ...f, colour: to } : f)) } }),
    ...(s.children && { children: recolour(s.children, from, to) }),
  }));


/** The layers tree: a hidden layer is drawn faded; a hidden or locked one keeps its row's Switches showing. */
const toLayers = (view: DesignAppSpec, shapes: DesignShape[]): TreeItem[] =>
  shapes.map((s) => {
    const p = propsOf(view, s);
    return { id: s.id, label: s.label, icon: s.kind, muted: p.visible === false, pinActions: p.visible === false || !!p.locked, children: s.children && toLayers(view, s.children) };
  });
const find = (shapes: DesignShape[], id?: string): DesignShape | undefined => {
  for (const s of shapes) {
    if (s.id === id) return s;
    const inner = s.children && find(s.children, id);
    if (inner) return inner;
  }
};
const parentOf = (shapes: DesignShape[], id?: string): string | undefined => {
  for (const s of shapes) {
    if (s.children?.some((c) => c.id === id)) return s.id;
    const inner = s.children && parentOf(s.children, id);
    if (inner) return inner;
  }
};
const update = (shapes: DesignShape[], id: string, change: Partial<DesignShape>, props?: ShapeProps): DesignShape[] =>
  shapes.map((s) => (s.id === id ? { ...s, ...change, ...(props && { props: { ...s.props, ...props } }) } : s.children ? { ...s, children: update(s.children, id, change, props) } : s));

const wide = () => typeof window === 'undefined' || window.matchMedia('(min-width: 48rem)').matches;

export function DesignApp({ view, tab, mode, editorHref = '', height = 'fill', picture }: { view: DesignAppSpec; tab?: string; mode?: 'present' | 'comments'; editorHref?: string; height?: 'fill' | 'screen' | 'lg'; /** A picture's address by its asset id, for image fills. */ picture?: (id: string) => string | undefined }) {
  if (mode === 'present') return <DesignPresent view={view} toCanvas={(list) => toCanvasOf(view, list, picture)} editorHref={editorHref} height={height} wide={wide} />;
  return <DesignEditor view={view} tab={tab} comments={mode === 'comments'} height={height} picture={picture} />;
}

const toCanvasOf = (view: DesignAppSpec, list: DesignShape[], picture?: (id: string) => string | undefined): CanvasShape[] =>
  list.map(({ props: _props, children, ...rest }) => ({ ...rest, look: lookOf(propsOf(view, { ...rest, props: _props }), picture), children: children && toCanvasOf(view, children, picture) }));

function DesignEditor({ view, tab, comments, height, picture }: { view: DesignAppSpec; tab?: string; comments: boolean; height: 'fill' | 'screen' | 'lg'; picture?: (id: string) => string | undefined }) {
  const s = view.strings;
  const kinds = { frame: s.kindFrame, rectangle: s.kindRectangle, ellipse: s.kindEllipse, text: s.kindText };
  const toCanvas = (list: DesignShape[]) => toCanvasOf(view, list, picture);
  const [shapes, setShapes] = useState(view.shapes);
  const [selected, setSelected] = useState<string | undefined>(view.selected);
  const [expanded, setExpanded] = useState(() => [parentOf(view.shapes, view.selected) ?? view.shapes[0].id]);
  const [page, setPage] = useState(view.page);
  const [tool, setTool] = useState(comments ? (view.tools.find((t) => t.value === 'comment')?.value ?? view.tools[0].value) : view.tools[0].value);
  const [zoom, setZoom] = useState('1');
  const [labels, setLabels] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);
  const [startOpen, setStartOpen] = useState(wide);
  const [endOpen, setEndOpen] = useState(wide);
  const shape = find(shapes, selected);
  const change = (c: Partial<DesignShape>, props?: ShapeProps) => shape && setShapes((all) => update(all, shape.id, c, props));
  const select = (id: string | undefined) => {
    setSelected(id);
    const parent = parentOf(shapes, id);
    if (parent && !expanded.includes(parent)) setExpanded((x) => [...x, parent]);
  };

  /** A locked layer can't be picked on the canvas (it still can in the layers), as in Figma's lock. */
  const locked = (id?: string) => {
    const layer = find(shapes, id);
    return !!layer && !!propsOf(view, layer).locked;
  };

  return (
    <EditorLayout
      data-density="compact"
      resizable
      height={height}
      startOpen={startOpen}
      onStartToggle={() => setStartOpen((x) => !x)}
      endOpen={endOpen}
      onEndToggle={() => setEndOpen((x) => !x)}
      toolsLabel={s.tool}
      tools={
        <Cluster gap="item" wrap={false}>
          <SegmentedControl label={s.tool} iconOnly size="s" value={tool} onChange={setTool} options={view.tools} />
          <MenuButton label={fill(s.zoomValue, { percent: Number(zoom) * 100 })} menuLabel={s.zoom} size="s" emphasis="quiet" onSelect={setZoom} items={view.zooms.map((z) => ({ value: String(z), label: fill(s.zoomTo, { percent: z * 100 }) }))} />
        </Cluster>
      }
      startHead={
        <Text as="span" variant="body-sm">
          {view.file}
        </Text>
      }
      endHead={
        <Toolbar align="end" start={<AvatarGroup label={s.working} members={view.people} size={24} showPresence />}>
          <Popover trigger={{ label: s.viewOptions, icon: 'more', iconOnly: true, emphasis: 'quiet', size: 'xs' }} title={s.viewOptions}>
            <Switch label={s.propertyLabels} checked={labels} onChange={setLabels} />
          </Popover>
          <Button label={s.share} emphasis="primary" size="xs" onClick={() => notify({ message: fill(s.notInExample, { label: s.sharing }) })} />
        </Toolbar>
      }
      start={
        <>
          <Stack gap="item">
            <Cluster gap="item" justify="between" wrap={false}>
              <Heading level={2} size="label">
                {s.pages}
              </Heading>
              <Button label={s.pages} icon={pagesOpen ? 'chevron-down' : 'chevron-end'} iconOnly tooltip emphasis="quiet" size="xs" expanded={pagesOpen} onClick={() => setPagesOpen((x) => !x)} />
            </Cluster>
            <Reveal open={pagesOpen}>
              <TreeView label={s.pages} items={view.pages.map((p) => ({ id: p.id, label: p.label }))} expanded={[]} onExpandedChange={() => {}} selected={page} onSelect={setPage} />
            </Reveal>
          </Stack>
          <Stack gap="item">
            <Heading level={2} size="label">
              {s.layers}
            </Heading>
            <TreeView label={s.layers} items={toLayers(view, shapes)}
              expanded={expanded}
              onExpandedChange={setExpanded}
              selected={selected}
              onSelect={select}
              actions={(item) => {
                const layer = find(shapes, item.id);
                if (!layer) return null;
                const p = propsOf(view, layer);
                const set = (props: ShapeProps) => setShapes((all) => update(all, layer.id, {}, props));
                return (
                  <>
                    <Switch label={fill(s.showLayer, { name: layer.label })} hideLabel size="xs" checked={p.visible !== false} onChange={(x) => set({ visible: x })} />
                    <Switch label={fill(s.lockLayer, { name: layer.label })} hideLabel size="xs" checked={!!p.locked} onChange={(x) => set({ locked: x })} />
                  </>
                );
              }}
            />
          </Stack>
        </>
      }
      endLabel={comments ? view.comments.strings.heading : undefined}
      end={
        comments ? (
          <DesignComments spec={view.comments} layerOf={(id) => find(shapes, id)} selected={selected} onShow={select} />
        ) : shape ? (
          <>
            <Stack gap="pair">
              <Heading level={2} size="label">
                {shape.label}
              </Heading>
              <Text variant="body-sm" tone="muted">
                {kinds[shape.kind]}
              </Text>
            </Stack>
            <Inspector
              tabs={view.inspector}
              tab={tab}
              shape={{ ...shape, props: propsOf(view, shape) }}
              parent={find(shapes, parentOf(shapes, shape.id))}
              label={s.inspector}
              notInExample={s.notInExample}
              noColours={s.noColours}
              colours={coloursIn(view, shape)}
              onChange={change}
              onReplaceColour={(from, to) => setShapes((all) => recolour(all, from, to))}
              labels={labels}
            />
          </>
        ) : (
          <Text variant="body-sm" tone="muted">
            {s.empty}
          </Text>
        )
      }
    >
      <Canvas label={fill(s.canvas, { file: view.file, page: view.pages.find((p) => p.id === page)?.label ?? '' })} shapes={toCanvas(shapes)} width={view.width} height={view.height} zoom={Number(zoom)} selected={selected} onSelect={(id) => (locked(id) ? undefined : select(id))} />
    </EditorLayout>
  );
}
