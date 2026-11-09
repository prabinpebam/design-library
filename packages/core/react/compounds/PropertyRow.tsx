import { Children, type ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface PropertyRowProps extends DataAttributes {
  /** The row's fields, in reading order: one, or a pair that sits side by side (X and Y, W and H, rotation and radius). */
  children: ReactNode;
  /** `2` (default) puts the fields in two equal columns, wrapping a third onto the next line; `1` gives one field the whole row (a colour, a Select); `3` fits three short ones (an export's scale, suffix and format). */
  columns?: 1 | 2 | 3;
  /** With two fields, the first takes two thirds of the row: a colour (swatch and hex) beside its opacity, as Figma draws a fill. */
  lead?: boolean;
  /** Compact controls at the row's end that act on the row: remove it, show or hide it (an xs Switch). The column is held at one button's width on every row, so the fields line up whether a row has one or not; a second control widens only its own row. */
  action?: ReactNode;
}

/**
 * One row of a design tool's inspector: compact fields in a two-column grid with an action column at the end, as
 * Figma's properties panel lays out X | Y, W | H and rotation | radius. Rows stack inside a PropertySection.
 * Use small (xs) fields with inline glyphs or icons and hidden labels; the section's heading names the group.
 * Not for a form's fields (use a Stack of fields with visible labels) or for facts (DescriptionList).
 * @tier compound
 * @family panels
 * @a11y Adds no role: each field keeps its own accessible name (with `hideLabel`, the visible glyph or icon is a cue,
 * the name is still read). The action is a Button with its own name.
 */
export function PropertyRow({ children, columns = 2, lead = false, action, ...data }: PropertyRowProps) {
  return (
    <div {...data} data-dl="property-row" data-columns={columns} data-lead={lead && columns === 2 ? '' : undefined}>
      <div data-dl-part="fields">
        {Children.toArray(children).map((child, i) => (
          <div key={i} data-dl-part="cell">
            {child}
          </div>
        ))}
      </div>
      <div data-dl-part="action">{action}</div>
    </div>
  );
}
