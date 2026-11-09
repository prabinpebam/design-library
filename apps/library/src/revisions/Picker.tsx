/**
 * The element picker, like a browser's developer tools: point at any element on a library page to see what it is, then
 * select it as a revision comment's anchor. A transparent glass over the main region takes the pointer while picking, so
 * specimens never get hover, press or click (the page's states are frozen as they were); hit testing looks through the
 * glass with react-grab's primitives, confined to the page's article, so the header, navigation and pane are never
 * candidates. Boxes and the label are drawn in their own fixed layer outside the page: no specimen's markup or styles
 * are touched. Click or Enter selects one element and stops; Shift adds or removes one and keeps picking.
 *
 * @a11y The glass is focused on entry and announces the current candidate through a polite status. Escape stops and
 * returns focus to the Select elements switch; selecting moves focus to the comment field.
 * @key ArrowUp: the parent element. @key ArrowDown: the first child element. @key ArrowLeft / ArrowRight: the previous
 * or next sibling. @key Enter: select (Shift+Enter: add or remove). @key Escape: stop selecting.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { getElementAtPoint, isElementGrabbable } from './instrument';
import { candidateLabel, componentOf } from './capture';

type Vars = CSSProperties & Record<`--${string}`, string>;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const viewport = () => ({ width: document.documentElement.clientWidth, height: window.innerHeight });

/** A box in viewport coordinates, with x measured from the inline start so the layer mirrors in right-to-left. */
function boxOf(element: Element, rtl: boolean): Box {
  const r = element.getBoundingClientRect();
  return { x: rtl ? viewport().width - r.right : r.left, y: r.top, width: r.width, height: r.height };
}

const vars = (b: Box) => ({ '--x': `${b.x}px`, '--y': `${b.y}px`, '--w': `${b.width}px`, '--h': `${b.height}px` }) as Vars;

/** The element the page scrolls in: the main region from the wide breakpoint, the document below it. */
function scrollerOf(element: Element): Element {
  for (let p = element.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if ((overflowY === 'auto' || overflowY === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return document.scrollingElement ?? document.documentElement;
}

export function Picker({
  root, selected, onPick, onStop,
}: {
  /** The page's article: the only place candidates come from. */
  root: HTMLElement;
  /** The selected elements on this page, outlined while picking. */
  selected: Element[];
  /** Select one element; `add` keeps picking and adds or removes it instead of replacing the selection. */
  onPick: (element: HTMLElement, add: boolean) => Promise<unknown>;
  /** Stop picking; `selectedOne` says focus should go to the comment field rather than back to the switch. */
  onStop: (selectedOne: boolean) => void;
}) {
  const [candidate, setCandidate] = useState<HTMLElement | null>(null);
  const [reading, setReading] = useState<HTMLElement | null>(null);
  const [frame, setFrame] = useState(0);
  const [announcement, setAnnouncement] = useState('Selecting elements. Point at one, or use the arrow keys. Enter selects, Escape stops.');
  const glass = useRef<HTMLDivElement>(null);
  const region = root.closest<HTMLElement>('[data-dl-region="main"]') ?? root;
  const rtl = getComputedStyle(root).direction === 'rtl';

  const grabbable = useCallback((e: Element | null): boolean => !!e && e instanceof HTMLElement && root.contains(e) && isElementGrabbable(e), [root]);

  const show = useCallback((next: HTMLElement | null, fromKeys: boolean) => {
    setCandidate(next);
    if (!next) return;
    if (fromKeys) {
      next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      setAnnouncement(candidateLabel(next, componentOf(next)));
    }
  }, []);

  // Redraw on scroll, resize and page changes: once per frame, with a timer for tabs that don't paint.
  useLayoutEffect(() => {
    let raf = 0;
    let timer = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      setFrame((f) => f + 1);
    };
    const redraw = () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      raf = requestAnimationFrame(run);
      timer = window.setTimeout(run, 100);
    };
    const mutations = new MutationObserver(redraw);
    mutations.observe(root, { childList: true, subtree: true, attributes: true });
    window.addEventListener('scroll', redraw, true);
    window.addEventListener('resize', redraw);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      mutations.disconnect();
      window.removeEventListener('scroll', redraw, true);
      window.removeEventListener('resize', redraw);
    };
  }, [root]);

  useEffect(() => {
    glass.current?.focus({ preventScroll: true });
  }, []);

  const at = (x: number, y: number) => {
    const hit = getElementAtPoint(x, y, { container: root, filter: (e) => grabbable(e) });
    return grabbable(hit) ? (hit as HTMLElement) : null;
  };

  const step = (direction: 'up' | 'down' | 'prev' | 'next') => {
    const current = candidate && root.contains(candidate) ? candidate : null;
    if (!current) return show(root.querySelector<HTMLElement>('h1') ?? root, true);
    const from: HTMLElement = current;
    let next: Element | null = null;
    if (direction === 'up') {
      for (let p = from.parentElement; p && root.contains(p); p = p.parentElement) if (grabbable(p)) { next = p; break; }
    } else if (direction === 'down') {
      const walker = document.createTreeWalker(from, NodeFilter.SHOW_ELEMENT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) if (grabbable(n as Element)) { next = n as Element; break; }
    } else {
      const move = (e: Element) => (direction === 'prev' ? e.previousElementSibling : e.nextElementSibling);
      for (let s = move(from); s; s = move(s)) if (grabbable(s)) { next = s; break; }
    }
    if (next) show(next as HTMLElement, true);
    else setAnnouncement(`No ${direction === 'up' ? 'parent' : direction === 'down' ? 'child' : 'sibling'} element there.`);
  };

  // The element shows as selected at once while its anchor is read; a failure is said and picking carries on.
  const pick = async (element: HTMLElement | null, add: boolean) => {
    if (!element || reading) return;
    setReading(element);
    const had = selected.includes(element);
    try {
      await onPick(element, add);
      setAnnouncement(`${candidateLabel(element, componentOf(element))} ${!add ? 'selected' : had ? 'removed from the selection' : 'added to the selection'}.`);
      if (!add) onStop(true);
    } catch (error) {
      setAnnouncement(`Couldn’t read that element: ${error instanceof Error ? error.message : String(error)}. Try it again or pick its parent.`);
    } finally {
      setReading(null);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => step('up'),
      ArrowDown: () => step('down'),
      ArrowLeft: () => step(rtl ? 'next' : 'prev'),
      ArrowRight: () => step(rtl ? 'prev' : 'next'),
      Enter: () => void pick(candidate, event.shiftKey),
      Escape: () => onStop(false),
    };
    const run = keys[event.key];
    if (!run) return;
    event.preventDefault();
    event.stopPropagation();
    run();
  };

  // The glass sits over the main region only, so the pane, header and navigation stay usable while picking.
  void frame;
  const area = boxOf(region, rtl);
  const view = viewport();
  const top = Math.max(area.y, 0);
  const glassBox = { x: area.x, y: top, width: area.width, height: Math.max(0, Math.min(area.y + area.height, view.height) - top) };
  const box = candidate && root.contains(candidate) ? boxOf(candidate, rtl) : null;
  const below = !!box && box.y < 32;

  return createPortal(
    <div data-app="pick" data-react-grab-ignore="" data-print="hide">
      <div
        ref={glass}
        data-app="pick-glass"
        style={vars(glassBox)}
        tabIndex={0}
        role="application"
        aria-roledescription="element picker"
        aria-label="Select elements on this page"
        onPointerMove={(e) => show(at(e.clientX, e.clientY), false)}
        onPointerLeave={() => setCandidate(null)}
        onPointerDown={(e) => e.preventDefault()}
        aria-busy={reading ? true : undefined}
        onClick={(e) => void pick(at(e.clientX, e.clientY), e.shiftKey)}
        onKeyDown={onKeyDown}
        onWheel={(e) => scrollerOf(root).scrollBy({ left: e.deltaX, top: e.deltaY })}
      />
      {[...selected, ...(reading ? [reading] : [])].filter((e) => root.contains(e)).map((e, i) => (
        <span key={i} data-app="pick-box" data-selected="" style={vars(boxOf(e, rtl))} aria-hidden="true" />
      ))}
      {box && (
        <>
          <span data-app="pick-box" data-candidate="" style={vars(box)} aria-hidden="true" />
          <span data-app="pick-label" data-below={below ? '' : undefined} style={vars(box)} aria-hidden="true">
            {candidateLabel(candidate!, componentOf(candidate!))} · {Math.round(box.width)}×{Math.round(box.height)}
          </span>
        </>
      )}
      <span data-app="pick-status" role="status">
        {announcement}
      </span>
    </div>,
    document.body,
  );
}
