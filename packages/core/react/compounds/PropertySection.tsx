import type { ReactNode } from 'react';
import { useId } from 'react';
import { Heading } from '../fundamentals/Heading';
import type { DataAttributes } from '../types';

export interface PropertySectionProps extends DataAttributes {
  /** The group's name: "Fill", "Auto layout", "Export". */
  heading: string;
  /** The heading's level in the panel's outline. */
  level?: 2 | 3 | 4;
  /** Icon buttons at the end of the heading row that act on the whole group: add one, show the sides apart, remove. */
  actions?: ReactNode;
  /** `compact`: the heading at the rows' own text size on a 24 px row, for xs controls in a design tool's inspector (Q68); `normal` (default) for a settings panel. */
  density?: 'normal' | 'compact';
  /** The group's rows. Leave it out while the group holds nothing yet: only the heading and its add action show. */
  children?: ReactNode;
}

/**
 * One group of an inspector or a settings panel: its heading and the actions on the whole group on one row, then its
 * rows. Groups sit apart by the panel's gap; nothing draws a box or a rule between them.
 * Not for a page's sections (use Section) or for a group a person opens and closes (use Accordion).
 * @tier compound
 * @family panels
 * @a11y Renders `section`, named by its heading through `aria-labelledby`. Each action is a Button with its own name
 * ("Add fill"); an icon-only action shows its name as a tooltip.
 */
export function PropertySection({ heading, level = 3, actions, density = 'normal', children, ...data }: PropertySectionProps) {
  const id = useId();
  return (
    <section {...data} data-dl="property-section" data-density={density} aria-labelledby={id}>
      <div data-dl-part="head">
        <Heading level={level} size={density === 'compact' ? 'label' : 4} id={id}>
          {heading}
        </Heading>
        {actions && <div data-dl-part="actions">{actions}</div>}
      </div>
      {children != null && children !== false && <div data-dl-part="rows">{children}</div>}
    </section>
  );
}
