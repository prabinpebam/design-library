import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { Badge } from '../fundamentals/Badge';
import { Icon } from '../fundamentals/Icon';
import { ScrollArea } from '../fundamentals/ScrollArea';
import type { IconName } from '../../icons/icons';
import { useSlidingIndicator } from '../behaviour/flip';
import type { DataAttributes } from '../types';

/** One tab: a short name for a panel of related content, or for a page of a section. */
export interface TabItem {
  /** Stable id: what `selected` and `onChange` use. */
  id: string;
  /** One or two words, sentence case. */
  label: string;
  /** Leading icon from the active set; the words still name the tab. */
  icon?: IconName;
  /** A count after the name (unread, results), read with it. */
  count?: number;
  /** Can't be chosen now; arrow keys pass over it. */
  disabled?: boolean;
  /** `panels`: the content shown when this tab is selected. */
  panel?: ReactNode;
  /** `links`: the page this tab goes to. */
  href?: string;
}

export interface TabsProps extends DataAttributes {
  /** The tabs, in a meaningful order. */
  items: TabItem[];
  /** The tab list's accessible name, e.g. "Project sections". */
  label: string;
  /**
   * `panels` (default): switch between panels in place (APG tabs). `links`: each tab is a link to its own page, with
   * the current one marked; the same look, as a `nav` of links rather than a tab list.
   */
  variant?: 'panels' | 'links';
  /** The selected tab's id, when the parent owns it. With `links`, the current page. */
  selected?: string;
  /** The first selected tab when the component owns it; the first available tab otherwise. */
  defaultSelected?: string;
  /** A tab was chosen. */
  onChange?: (id: string) => void;
  /**
   * `automatic` (default): a panel shows as soon as its tab is focused, for panels that are already there.
   * `manual`: arrows only move focus and Enter or Space shows the panel, for panels that load or cost something.
   */
  activation?: 'automatic' | 'manual';
  /** `horizontal` (default) above the panel, or `vertical` beside it for many sections in a wide view. */
  orientation?: 'horizontal' | 'vertical';
  /** Something that acts on the whole set, after the tabs (an Add or a Filter button). */
  extra?: ReactNode;
  /** From the Button size scale: `normal` (default, 44 px); `s` (36 px) and `xs` (24 px, for a dense panel such as an inspector, by the written dense-surface exception) take smaller text and padding, so a narrow panel's tabs fit without scrolling. */
  size?: 'xs' | 's' | 'normal';
  /** The space between the tabs and the panel: `group` (default, `c.tabs.panel-gap`) or `section` (`c.tabs.panel-gap-section`), for panels that hold grouped sections (an inspector's PropertySections), so the space around the groups is never smaller than the space inside them. */
  gap?: 'group' | 'section';
}

/**
 * Switches between panels of related content in place, or between the pages of one section as links. Not for a value
 * that changes what one view shows (use SegmentedControl), for steps in a process (use a stepper) or for an app's main
 * sections (use Navigation).
 * @tier compound
 * @family navigation
 * @a11y The WAI-ARIA APG tabs pattern: `role="tablist"` named by `label`, each tab a `button` with `role="tab"`,
 * `aria-selected` and `aria-controls`, and one `role="tabpanel"` labelled by its tab and focusable so Tab moves into it.
 * One Tab stop for the whole list (roving tabindex). The current tab is marked by colour and its own indicator, never by
 * colour alone; vertical tabs mark it with a selected fill, never a one-sided stripe. Disabled tabs stay in the list
 * with `aria-disabled` and are skipped by the arrows. Counts are read after the name. `links` is a `nav` landmark of
 * plain links with `aria-current="page"`. Tabs that don't fit scroll sideways to the list's edges; the chosen one is
 * scrolled into view and focus rings sit inside each tab so they are never clipped.
 * Motion (Q65 C6, M14): chosen by a pointer, the indicator slides from the previous tab over the move role; chosen with
 * the arrow keys, it moves at once. Hover and text colours interpolate. Vertical tabs' fill doesn't travel.
 * @key Arrow right, Arrow left (Arrow down, Arrow up when vertical): move to the next or previous tab, wrapping; mirrored in right-to-left
 * @key Home, End: move to the first or last tab
 * @key Enter or Space: shows the focused tab's panel (with manual activation)
 * @key Tab: moves from the selected tab into its panel
 */
export function Tabs({
  items,
  label,
  variant = 'panels',
  selected,
  defaultSelected,
  onChange,
  activation = 'automatic',
  orientation = 'horizontal',
  extra,
  size = 'normal',
  gap = 'group',
  ...data
}: TabsProps) {
  const id = useId();
  const firstAvailable = items.find((i) => !i.disabled)?.id;
  const [own, setOwn] = useState(defaultSelected ?? firstAvailable);
  const current = selected ?? own;
  const [focused, setFocused] = useState(current);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const slide = useSlidingIndicator<HTMLElement>(current ?? '', (root) => root.querySelector('[data-dl-part="tab"]:is([aria-selected="true"], [aria-current="page"])'), '::after');

  const list = useRef<HTMLDivElement & HTMLUListElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // A horizontal list scrolls sideways inside ScrollArea (its bar drawn over the tabs, never beside them); a vertical one doesn't scroll.
  const strip = (node: ReactNode) =>
    orientation === 'vertical' ? (
      node
    ) : (
      <ScrollArea axis="inline" viewportRef={scroller} data-dl-part="scroller">
        {node}
      </ScrollArea>
    );

  // Brings the chosen tab into the list's view by scrolling the list only, never the page.
  useEffect(() => {
    const l = orientation === 'vertical' ? list.current : scroller.current;
    const t = current ? refs.current[current] : null;
    if (!l || !t) return;
    const lb = l.getBoundingClientRect();
    const tb = t.getBoundingClientRect();
    if (tb.left < lb.left) l.scrollLeft -= lb.left - tb.left;
    else if (tb.right > lb.right) l.scrollLeft += tb.right - lb.right;
    if (tb.top < lb.top) l.scrollTop -= lb.top - tb.top;
    else if (tb.bottom > lb.bottom) l.scrollTop += tb.bottom - lb.bottom;
  }, [current, orientation]);

  const choose = (tab: TabItem) => {
    if (tab.disabled) return;
    if (tab.id !== current) slide.capture();
    setOwn(tab.id);
    setFocused(tab.id);
    onChange?.(tab.id);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const available = items.filter((i) => !i.disabled);
    const active = Object.keys(refs.current).find((k) => refs.current[k] === document.activeElement);
    const at = available.findIndex((i) => i.id === (active ?? focused ?? current));
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    let to: TabItem | undefined;
    if (e.key === next) to = available[(at + 1) % available.length];
    else if (e.key === prev) to = available[(at - 1 + available.length) % available.length];
    else if (e.key === 'Home') to = available[0];
    else if (e.key === 'End') to = available[available.length - 1];
    if (!to) return;
    e.preventDefault();
    setFocused(to.id);
    refs.current[to.id]?.focus();
    if (activation === 'automatic') choose(to);
  };

  const inner = (tab: TabItem) => (
    <>
      {tab.icon && <Icon name={tab.icon} size="md" />}
      <span data-dl-part="label">{tab.label}</span>
      {tab.count !== undefined && <Badge kind="count" count={tab.count} tone="neutral" emphasis="subtle" />}
    </>
  );

  if (variant === 'links') {
    return (
      <nav {...data} ref={slide.root} {...slide.input} data-dl="tabs" data-orientation={orientation} data-size={size} data-gap={gap === 'section' ? 'section' : undefined} aria-label={label}>
        <div data-dl-part="bar">
          {strip(
          <ul data-dl-part="list" ref={list}>
            {items.map((tab) => (
              <li key={tab.id}>
                {tab.disabled ? (
                  <span data-dl-part="tab" aria-disabled="true">
                    {inner(tab)}
                  </span>
                ) : (
                  <a
                    ref={(n) => {
                      refs.current[tab.id] = n;
                    }}
                    data-dl-part="tab"
                    href={tab.href}
                    aria-current={tab.id === current ? 'page' : undefined}
                    onClick={() => choose(tab)}
                  >
                    {inner(tab)}
                  </a>
                )}
              </li>
            ))}
          </ul>,
          )}
          {extra && <div data-dl-part="extra">{extra}</div>}
        </div>
      </nav>
    );
  }

  const panel = items.find((i) => i.id === current);
  return (
    <div {...data} ref={slide.root as unknown as Ref<HTMLDivElement>} {...slide.input} data-dl="tabs" data-orientation={orientation} data-size={size} data-gap={gap === 'section' ? 'section' : undefined}>
      <div data-dl-part="bar">
        {strip(
        <div data-dl-part="list" ref={list} role="tablist" aria-label={label} aria-orientation={orientation} onKeyDown={onKey}>
          {items.map((tab) => {
            const on = tab.id === current;
            return (
              <button
                key={tab.id}
                ref={(n) => {
                  refs.current[tab.id] = n;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${tab.id}`}
                data-dl-part="tab"
                aria-selected={on}
                aria-controls={on ? `${id}-panel` : undefined}
                aria-disabled={tab.disabled || undefined}
                tabIndex={tab.id === (focused ?? current) ? 0 : -1}
                onClick={() => choose(tab)}
                onFocus={() => setFocused(tab.id)}
                onBlur={() => setFocused(current)}
              >
                {inner(tab)}
              </button>
            );
          })}
        </div>,
        )}
        {extra && <div data-dl-part="extra">{extra}</div>}
      </div>
      {panel && (
        <div id={`${id}-panel`} data-dl-part="panel" role="tabpanel" aria-labelledby={`${id}-tab-${panel.id}`} tabIndex={0}>
          {panel.panel}
        </div>
      )}
    </div>
  );
}
