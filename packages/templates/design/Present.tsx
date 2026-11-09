/**
 * The Design tool's Present mode (Q66, F15.T6): the prototype played full size, one frame at a time, on EditorLayout.
 * The start panel lists the flow's frames, the end panel what can be pressed in this frame and where it leads; the
 * stage is the frame on a Canvas. Pressing a hotspot (a layer with a Navigate interaction in the editor's Prototype
 * tab) goes to its frame, and the stage morphs from one frame to the next in place (Morph, as Smart animate). Previous,
 * Next and Restart move through the frames from the bar; arrow keys don't animate (Z8). No styles.
 */
import { useState } from 'react';
import { Button, Canvas, EditorLayout, Link, List, Morph, Text, Toolbar, TreeView, notify, type CanvasShape } from '@design-library/core/react';
import { fill } from '@design-library/core/render';
import type { DesignAppSpec, DesignShape, PropItem } from './types';

interface Hotspot {
  layer: DesignShape;
  to: DesignShape;
}

const all = (shapes: DesignShape[]): DesignShape[] => shapes.flatMap((s) => [s, ...all(s.children ?? [])]);

export function DesignPresent({ view, toCanvas, editorHref, height, wide }: { view: DesignAppSpec; toCanvas: (shapes: DesignShape[]) => CanvasShape[]; editorHref: string; height: 'fill' | 'screen' | 'lg'; wide: () => boolean }) {
  const s = view.present.strings;
  const frames = view.present.frames.map((id) => view.shapes.find((f) => f.id === id)).filter((f): f is DesignShape => !!f);
  const [at, setAt] = useState(0);
  const [startOpen, setStartOpen] = useState(wide);
  const [endOpen, setEndOpen] = useState(wide);
  const frame = frames[at];
  const hotspots: Hotspot[] = all(frame.children ?? []).flatMap((layer) =>
    ((layer.props?.interactions as PropItem[] | undefined) ?? [])
      .filter((i) => i.action === 'navigate')
      .map((i) => frames.find((f) => f.id === i.destination))
      .filter((to): to is DesignShape => !!to)
      .map((to) => ({ layer, to })),
  );
  const go = (i: number) => setAt(Math.max(0, Math.min(frames.length - 1, i)));
  const goTo = (id: string) => go(frames.findIndex((f) => f.id === id));
  const press = (id: string | undefined) => {
    if (!id) return;
    const hit = hotspots.find((h) => h.layer.id === id);
    if (hit) goTo(hit.to.id);
    else notify({ message: s.nothingHere });
  };

  return (
    <EditorLayout
      height={height}
      startLabel={s.frames}
      startOpen={startOpen}
      onStartToggle={() => setStartOpen((x) => !x)}
      endLabel={s.hotspots}
      endOpen={endOpen}
      onEndToggle={() => setEndOpen((x) => !x)}
      bar={
        <Toolbar align="center" start={<Link href={editorHref}>{s.back}</Link>}>
          <Text as="span">{fill(s.position, { frame: frame.label, n: at + 1, count: frames.length })}</Text>
          <Button label={s.previous} icon="chevron-start" iconOnly emphasis="quiet" size="s" disabled={at === 0} onClick={() => go(at - 1)} />
          <Button label={s.next} icon="chevron-end" iconOnly emphasis="quiet" size="s" disabled={at === frames.length - 1} onClick={() => go(at + 1)} />
          <Button label={s.restart} icon="retry" emphasis="quiet" size="s" disabled={at === 0} onClick={() => go(0)} />
        </Toolbar>
      }
      start={<TreeView label={s.frames} items={frames.map((f) => ({ id: f.id, label: f.label, icon: 'frame' }))} expanded={[]} onExpandedChange={() => {}} selected={frame.id} onSelect={goTo} />}
      end={
        hotspots.length ? (
          <List mode="action" label={s.hotspots} actions={hotspots.map((h) => ({ id: h.layer.id, label: h.layer.label, description: fill(s.goesTo, { frame: h.to.label }), icon: 'pointer', onSelect: () => goTo(h.to.id) }))} />
        ) : (
          <Text variant="body-sm" tone="muted">
            {s.noHotspots}
          </Text>
        )
      }
    >
      <Morph state={frame.id} size="hold">
        <Canvas label={fill(s.stage, { frame: frame.label })} shapes={toCanvas([{ ...frame, x: 0, y: 0 }])} width={frame.width} height={frame.height} onSelect={press} />
      </Morph>
    </EditorLayout>
  );
}
