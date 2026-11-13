import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { FloatingBar } from '../compounds/FloatingBar';
import type { DataAttributes } from '../types';

export interface EditorLayoutProps extends DataAttributes {
  /** The bar across the top, between the two panel toggles: the file's name, who's here, zoom, Share. Leave it out for a design tool's frame with no header (Figma UI3): put those in `startHead` and `endHead`, and the panel toggles float at the working area's top corners. */
  bar?: ReactNode;
  /** The start panel's own header, above its scrolling content and never scrolled away: the file's name and menu. */
  startHead?: ReactNode;
  /** The end panel's own header: who's here, zoom, Share. */
  endHead?: ReactNode;
  /** The panel at the start: layers, pages, assets. */
  start: ReactNode;
  /** Names the start panel and its toggle: "Layers" (default). */
  startLabel?: string;
  startOpen: boolean;
  onStartToggle: () => void;
  /** The panel at the end: the selection's properties. */
  end: ReactNode;
  /** Names the end panel and its toggle: "Properties" (default). */
  endLabel?: string;
  endOpen: boolean;
  onEndToggle: () => void;
  /** The tools (move, frame, shapes, text, comment): a bar that floats over the working area, centred at its bottom (Figma UI3), never in the header. */
  tools?: ReactNode;
  /** Names the floating tools bar's region: "Tools" (default). */
  toolsLabel?: string;
  /** The working area between the panels, usually a Canvas. It fills the room left and scrolls on its own. */
  children: ReactNode;
  /** `fill` takes the height its parent gives it; `screen` the whole window (an app on its own); `lg` holds 36 rem (a demonstration). */
  height?: 'fill' | 'screen' | 'lg';
  /** Each docked panel gets a handle on its inner edge to drag it wider or narrower, between `c.editor-layout.panel-min` and `panel-max` (a design tool's panels). Not while the panels float in a narrow window. */
  resizable?: boolean;
  /** With panel heads (no bar), where an open panel's toggle sits in its head: `outer` (default) at the window's edge; `inner` at the edge beside the working area, level with the head's first row (Figma UI3's layers toggle); `none`: no panel toggles at all, for a studio whose panels are always docked (pass `startOpen` and `endOpen` true); a floating panel's Escape doesn't close it, since nothing would open it again. */
  toggles?: 'outer' | 'inner' | 'none';
  /** The start panel's opening width, a CSS length such as "16rem" (default the theme's `c.editor-layout.panel-start`). */
  startSize?: string;
  /** The end panel's opening width, a CSS length such as "41rem" for a two-column inspector (default the theme's `c.editor-layout.panel-end`). */
  endSize?: string;
  /** The widest the end panel can be, opened or dragged (default the theme's `c.editor-layout.panel-max`, 30 rem). Set it with an `endSize` above 30 rem. */
  endMax?: string;
  /** The narrowest the working area gets while both panels are docked, such as "24rem". The end panel gives way first, down to `c.editor-layout.panel-min`, so it is never wider than the room minus the start panel and this. Default: no floor. */
  workMin?: string;
}

type Side = 'start' | 'end';
const STEP = 8;

/**
 * An editor: a bar across the top, a panel at each side that can be hidden, and the working area between them that
 * takes the rest of the room. For a design tool, a diagram or map editor, a page builder. In a narrow window an open
 * panel floats over the working area from its own edge. Not for a list beside a document (ListDetail) or a
 * conversation (ChatLayout).
 * @tier 3
 * @a11y Each panel is a labelled `aside` its toggle controls (`aria-expanded`), in the bar or, without a bar, at the working area's top corners; the bar is the `header`; the
 * working area (the `main` landmark) follows the start panel in the source, and the floating tools bar (a labelled region) follows the working area. Each panel scrolls on its own, with the library's overlay scrollbar (ScrollArea), never sideways. In a narrow window a floating panel
 * closes with Escape and returns focus to its toggle. With `resizable`, each docked panel's handle is a focusable
 * `separator` with the panel's width as its value, controlling the panel.
 * @key Escape: closes a floating panel
 * @key ArrowLeft / ArrowRight (on a resize handle): narrower or wider by 8 px, 32 px with Shift
 * @key Home / End (on a resize handle): the narrowest or the widest
 * @key Enter (on a resize handle): back to the default width
 */
export function EditorLayout({ bar, startHead, endHead, start, startLabel = 'Layers', startOpen, onStartToggle, end, endLabel = 'Properties', endOpen, onEndToggle, tools, toolsLabel = 'Tools', children, height = 'fill', resizable = false, toggles = 'outer', startSize, endSize, endMax, workMin, ...data }: EditorLayoutProps) {
  const [widths, setWidths] = useState<Partial<Record<Side, number>>>({});
  const toggled = toggles !== 'none';
  const [dragging, setDragging] = useState<Side | null>(null);
  const startId = useId();
  const endId = useId();
  const root = useRef<HTMLDivElement>(null);
  const startToggle = useRef<HTMLSpanElement>(null);
  const endToggle = useRef<HTMLSpanElement>(null);
  // Without a bar a toggle moves (into its open panel's head, back to the corner when closed): focus follows it after the render.
  const follow = useRef<'start' | 'end' | null>(null);
  const floating = bar === undefined;
  const toggleStart = () => {
    if (floating) follow.current = 'start';
    onStartToggle();
  };
  const toggleEnd = () => {
    if (floating) follow.current = 'end';
    onEndToggle();
  };

  useEffect(() => {
    const side = follow.current;
    follow.current = null;
    if (side) (side === 'start' ? startToggle : endToggle).current?.querySelector('button')?.focus();
  }, [startOpen, endOpen]);

  // Below 48 rem of its own width (the stylesheet's container query) open panels float; Escape closes the one holding focus, else the end one.
  useEffect(() => {
    if (!toggled || (!startOpen && !endOpen)) return;
    const close = (event: KeyboardEvent) => {
      const el = root.current;
      if (event.key !== 'Escape' || !el || el.clientWidth >= parseFloat(getComputedStyle(document.documentElement).fontSize) * 48) return;
      const inStart = document.getElementById(startId)?.contains(document.activeElement);
      follow.current = startOpen && (inStart || !endOpen) ? 'start' : 'end';
      if (follow.current === 'start') onStartToggle();
      else onEndToggle();
      if (!floating) (follow.current === 'start' ? startToggle : endToggle).current?.querySelector('button')?.focus();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [startOpen, endOpen, onStartToggle, onEndToggle, startId, floating, toggled]);

  // Resizing: the panel's own computed min and max (the tokens) bound the width; the reading direction decides which way grows.
  const panelOf = (side: Side) => document.getElementById(side === 'start' ? startId : endId);
  const bounds = (side: Side) => {
    const el = panelOf(side);
    const cs = el ? getComputedStyle(el) : null;
    return { now: el?.getBoundingClientRect().width ?? 0, min: parseFloat(cs?.minWidth ?? '0') || 0, max: parseFloat(cs?.maxWidth ?? '') || Infinity, rtl: cs?.direction === 'rtl' };
  };
  const setWidth = (side: Side, w: number) => {
    const { min, max } = bounds(side);
    setWidths((o) => ({ ...o, [side]: Math.round(Math.min(max, Math.max(min, w))) }));
  };
  const onResizeKey = (side: Side) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const { now, min, max, rtl } = bounds(side);
    const grow = (side === 'start') !== rtl ? 'ArrowRight' : 'ArrowLeft';
    const by = event.shiftKey ? STEP * 4 : STEP;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => setWidth(side, now + (event.key === grow ? by : -by)),
      ArrowRight: () => setWidth(side, now + (event.key === grow ? by : -by)),
      Home: () => setWidth(side, min),
      End: () => setWidth(side, max),
      Enter: () => setWidths((o) => ({ ...o, [side]: undefined })),
    };
    const run = keys[event.key];
    if (!run) return;
    event.preventDefault();
    run();
  };
  const onResizeDown = (side: Side) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const { now, rtl } = bounds(side);
    const from = event.clientX;
    const sign = (side === 'start') !== rtl ? 1 : -1;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setDragging(side);
    const move = (e: PointerEvent) => setWidth(side, now + sign * (e.clientX - from));
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      setDragging(null);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };
  const resizeHandle = (side: Side, label: string, id: string) => {
    if (!resizable) return null;
    const { now, min, max } = typeof document === 'undefined' ? { now: 0, min: 0, max: 0 } : bounds(side);
    return (
      <div
        data-dl-part="resize"
        data-side={side}
        data-dragging={dragging === side ? '' : undefined}
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label.toLowerCase()}`}
        aria-controls={id}
        aria-valuenow={Math.round(widths[side] ?? now)}
        aria-valuemin={Math.round(min)}
        aria-valuemax={Number.isFinite(max) ? Math.round(max) : undefined}
        tabIndex={0}
        onKeyDown={onResizeKey(side)}
        onPointerDown={onResizeDown(side)}
        onDoubleClick={() => setWidths((o) => ({ ...o, [side]: undefined }))}
      />
    );
  };
  const sized = (side: Side) => (widths[side] ? ({ '--dl-panel-size': `${widths[side]}px` } as CSSProperties) : undefined);

  // With a bar the toggles sit at its ends, quiet. Without one (Figma UI3), an open panel's toggle sits in its own head and a
  // closed panel's floats at the working area's top corner, on a surface of its own.
  const startButton = <Button label={startOpen ? `Hide ${startLabel.toLowerCase()}` : `Show ${startLabel.toLowerCase()}`} icon="layers" iconOnly tooltip={floating} size="s" emphasis={floating && !startOpen ? 'default' : 'quiet'} expanded={startOpen} controls={startId} onClick={toggleStart} />;
  const endButton = <Button label={endOpen ? `Hide ${endLabel.toLowerCase()}` : `Show ${endLabel.toLowerCase()}`} icon="properties" iconOnly tooltip={floating} size="s" emphasis={floating && !endOpen ? 'default' : 'quiet'} expanded={endOpen} controls={endId} onClick={toggleEnd} />;
  const startTogglePart = (part: 'toggle' | 'corner') => (
    <span ref={startToggle} data-dl-part={part} data-side="start">
      {startButton}
    </span>
  );
  const endTogglePart = (part: 'toggle' | 'corner') => (
    <span ref={endToggle} data-dl-part={part} data-side="end">
      {endButton}
    </span>
  );

  // Opening widths and the working area's floor, per instance; unset keeps the theme's tokens.
  const sizes = { '--dl-start-size': startSize, '--dl-end-size': endSize, '--dl-end-max': endMax, '--dl-work-min': workMin } as CSSProperties;

  return (
    <div ref={root} {...data} data-dl="editor-layout" data-toggles={toggles === 'outer' ? undefined : toggles} data-height={height} data-bar={floating ? 'none' : undefined} data-work-min={workMin ? '' : undefined} style={startSize || endSize || endMax || workMin ? sizes : undefined}>
      {!floating && (
        <header data-dl-part="bar">
          {toggled && startTogglePart('toggle')}
          <div data-dl-part="bar-content">{bar}</div>
          {toggled && endTogglePart('toggle')}
        </header>
      )}
      <div data-dl-part="body">
        <aside id={startId} data-dl-part="panel" data-side="start" aria-label={startLabel} hidden={!startOpen} style={sized('start')}>
          {(startHead || (floating && toggled)) && (
            <div data-dl-part="panel-head">
              {floating && toggled && startOpen && startTogglePart('toggle')}
              <div data-dl-part="head-content">{startHead}</div>
            </div>
          )}
          <ScrollArea>
            <div data-dl-part="panel-content">{start}</div>
          </ScrollArea>
          {resizeHandle('start', startLabel, startId)}
        </aside>
        <main data-dl-part="work">
          {children}
          {floating && toggled && !startOpen && startTogglePart('corner')}
          {floating && toggled && !endOpen && endTogglePart('corner')}
          {tools && (
            <div data-dl-part="tools">
              <FloatingBar label={toolsLabel} placement="inline">
                {/* In a window too narrow for every tool, the tools scroll sideways inside the bar (the library's bar), never clipped. */}
                <ScrollArea axis="inline">{tools}</ScrollArea>
              </FloatingBar>
            </div>
          )}
        </main>
        <aside id={endId} data-dl-part="panel" data-side="end" aria-label={endLabel} hidden={!endOpen} style={sized('end')}>
          {(endHead || (floating && toggled)) && (
            <div data-dl-part="panel-head">
              <div data-dl-part="head-content">{endHead}</div>
              {floating && toggled && endOpen && endTogglePart('toggle')}
            </div>
          )}
          <ScrollArea>
            <div data-dl-part="panel-content">{end}</div>
          </ScrollArea>
          {resizeHandle('end', endLabel, endId)}
        </aside>
      </div>
    </div>
  );
}
