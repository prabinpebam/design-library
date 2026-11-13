import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { List } from '../fundamentals/List';
import { PropertySection } from './PropertySection';
import type { DataAttributes } from '../types';

export interface SectionedFormSection {
  id: string;
  /** The section's name: its heading, and its row in the list. */
  title: string;
  /** The list heading it sits under ("Questions"); sections without one sit under the form's `label`. */
  group?: string;
  /** One short line about the section. Not drawn unless `details` is set. */
  detail?: string;
  /** The section's fields. */
  content: ReactNode;
}

export interface SectionedFormProps extends DataAttributes {
  /** Names the form's list of sections, and heads the sections that have no `group`. */
  label: string;
  sections: SectionedFormSection[];
  /** The chosen section (controlled). Leave it out to let the form keep its own, starting at `defaultSelected` or the first. */
  selected?: string;
  defaultSelected?: string;
  /** A section was chosen in the list. */
  onSelect?: (id: string) => void;
  /** From this much of its own width, a CSS length in px, rem or em (default "40rem"), the list of sections sits beside the chosen one; narrower, every section shows in turn. */
  twoColumnFrom?: string;
  /** The list's width in two columns, a CSS length (default the theme's `c.sectioned-form.list`, 13 rem). */
  listWidth?: string;
  /** Shows each section's `detail` as a second line in the list (default false: titles only). */
  details?: boolean;
  /** Passed to each PropertySection: `compact` for a design tool's inspector. */
  density?: 'normal' | 'compact';
  /** How the list shows the chosen section: `check` (default) a check over the fill; `fill` the fill alone (the section beside it already says which). */
  mark?: 'check' | 'fill';
}

const toPx = (length: string, el: HTMLElement) => {
  const n = parseFloat(length);
  if (length.endsWith('rem')) return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
  if (length.endsWith('em')) return n * parseFloat(getComputedStyle(el).fontSize);
  return n;
};

/**
 * A form in sections, as an inspector's or a settings page's: from `twoColumnFrom` of its own width, a list of the
 * sections (titles, under their group headings) beside the chosen section's fields; narrower, every section in turn,
 * one below the other. Each section is a PropertySection. Not for sections a person opens and closes (Accordion), for
 * switching between unrelated panels (Tabs) or for a list beside a document (ListDetail).
 * @tier compound
 * @family panels
 * @a11y In two columns the list is a named `nav` holding a single-select listbox (List): the chosen row is selected and
 * its section is the only one shown. In one column the list is hidden and every section shows, each a `section` named
 * by its heading. The column mode follows the form's own width, never the window's.
 */
export function SectionedForm({ label, sections, selected, defaultSelected, onSelect, twoColumnFrom = '40rem', listWidth, details = false, density = 'normal', mark, ...data }: SectionedFormProps) {
  const [own, setOwn] = useState(defaultSelected ?? sections[0]?.id);
  const [two, setTwo] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const chosen = selected ?? own;
  const current = sections.some((s) => s.id === chosen) ? chosen : sections[0]?.id;

  // The breakpoint is a prop, so the form measures its own width rather than using a stylesheet container query.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setTwo(entry.contentRect.width + 0.5 >= toPx(twoColumnFrom, el)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [twoColumnFrom]);

  const choose = (id: string) => {
    if (selected === undefined) setOwn(id);
    onSelect?.(id);
  };
  const groups = [...new Set(sections.map((s) => s.group ?? ''))];
  return (
    <div {...data} ref={root} data-dl="sectioned-form" data-columns={two ? 'two' : 'one'} style={listWidth ? ({ '--dl-sectioned-form-list': listWidth } as CSSProperties) : undefined}>
      <nav data-dl-part="list" aria-label={label} hidden={!two}>
        <List
          mode="select"
          selection="single"
          mark={mark}
          label={label}
          value={current ? [current] : []}
          onChange={(ids) => ids[0] && choose(ids[0])}
          groups={groups.map((group) => ({
            id: group || 'sectioned-form-own',
            heading: group || label,
            options: sections.filter((s) => (s.group ?? '') === group).map((s) => ({ id: s.id, label: s.title, description: details ? s.detail : undefined })),
          }))}
        />
      </nav>
      <div data-dl-part="sections">
        {sections.map((s) => (
          <div key={s.id} data-dl-part="section" hidden={two && s.id !== current}>
            <PropertySection heading={s.title} density={density}>
              {s.content}
            </PropertySection>
          </div>
        ))}
      </div>
    </div>
  );
}
