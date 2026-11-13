import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Icon } from '../fundamentals/Icon';
import { Reveal } from '../fundamentals/Reveal';
import type { DataAttributes } from '../types';

export interface AccordionItem {
  /** Stable key; also what `defaultOpen` names. */
  id: string;
  /** The section's heading: a question or a short name. */
  title: string;
  /** A line under the heading, read with it: a summary of what's inside. */
  summary?: string;
  /** What the section holds. */
  content: ReactNode;
  /** Can't be opened right now. */
  disabled?: boolean;
}

export interface AccordionProps extends DataAttributes {
  /** The sections, in order. */
  items: AccordionItem[];
  /** The sections open at first, by `id`. */
  defaultOpen?: string[];
  /** One section open at a time: opening one closes the other (a short FAQ). Default: any number open. */
  single?: boolean;
  /** Adds "Show all sections" and "Hide all sections" above the list (any number open only), for long pages people scan. */
  showAll?: boolean;
  /** The headings' level in the page's outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Closed sections far from the window skip rendering their content (Reveal `skipClosed`): for many sections of heavy content, such as past years' logo walls. Off by default. */
  skipClosed?: boolean;
}

/**
 * A stack of headed sections that open and close in place: frequently asked questions, a long form's optional parts,
 * settings grouped by topic. Not for one short "Help with…" passage (use a disclosure), for switching between views
 * of one thing (use Tabs) or for content everyone must read (show it).
 * @tier compound
 * @family data
 * @a11y APG accordion: each heading holds a button with `aria-expanded` and `aria-controls`; each open section is a
 * region named by its heading. A closed section's content is `hidden`, so it is out of the tab order and the
 * accessibility tree. A summary line is part of the button, so it is read with the heading. "Show all sections"
 * says what it will do. The chevron turns with a transform; with reduced motion it turns at once.
 * @key Enter, Space: open or close the section
 * @key Down arrow, Up arrow: the next or previous heading
 * @key Home, End: the first or last heading
 */
export function Accordion({ items, defaultOpen = [], single = false, showAll = false, headingLevel = 3, skipClosed = false, ...data }: AccordionProps) {
  const id = useId();
  const [open, setOpen] = useState<string[]>(single ? defaultOpen.slice(0, 1) : defaultOpen);
  const list = useRef<HTMLDivElement>(null);
  const H = `h${headingLevel}` as 'h3';
  const usable = items.filter((i) => !i.disabled);
  const allOpen = usable.length > 0 && usable.every((i) => open.includes(i.id));

  const toggle = (key: string) =>
    setOpen((now) => (now.includes(key) ? now.filter((k) => k !== key) : single ? [key] : [...now, key]));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>('[data-dl-part="trigger"]:not(:disabled)') ?? [])];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    const to = { ArrowDown: (at + 1) % buttons.length, ArrowUp: (at - 1 + buttons.length) % buttons.length, Home: 0, End: buttons.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    buttons[to].focus();
  };

  return (
    <div {...data} data-dl="accordion">
      {showAll && !single && (
        <div data-dl-part="controls">
          <Button label={allOpen ? 'Hide all sections' : 'Show all sections'} emphasis="quiet" size="s" expanded={allOpen} onClick={() => setOpen(allOpen ? [] : usable.map((i) => i.id))} />
        </div>
      )}
      <div data-dl-part="list" ref={list} onKeyDown={onKeyDown}>
        {items.map((item) => {
          const isOpen = open.includes(item.id) && !item.disabled;
          const base = `${id}-${item.id}`;
          return (
            <div key={item.id} data-dl-part="item" data-open={isOpen ? '' : undefined}>
              <H data-dl-part="heading">
                <button
                  type="button"
                  id={`${base}-trigger`}
                  data-dl-part="trigger"
                  aria-expanded={isOpen}
                  aria-controls={`${base}-panel`}
                  disabled={item.disabled}
                  onClick={() => toggle(item.id)}
                >
                  <span data-dl-part="title">
                    <span data-dl-part="name">{item.title}</span>
                    {item.summary && <span data-dl-part="summary">{item.summary}</span>}
                  </span>
                  <Icon name="chevron-down" size="md" />
                </button>
              </H>
              <Reveal open={isOpen} skipClosed={skipClosed}>
                <div id={`${base}-panel`} role="region" aria-labelledby={`${base}-trigger`} data-dl-part="panel">
                  {item.content}
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
}
