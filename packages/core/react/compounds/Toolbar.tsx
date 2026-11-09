import { Children, type ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface ToolbarProps extends DataAttributes {
  /** The actions, at the end of the row; they wrap onto more lines rather than overlap. None: the start part takes the whole row. */
  children?: ReactNode;
  /** A control or a short status the actions belong to, at the start; it takes the room that's left. */
  start?: ReactNode;
  /** `end` lines the actions up with the bottom of a labelled control; `center` with a line of text. */
  align?: 'end' | 'center';
}

/**
 * A row of related actions, or a control or status with its actions: one gap, the start part growing, the actions
 * wrapping without overlap. The row draws no enclosure, so its buttons stay as they are.
 * Not for an app's identity and global actions (use TitleBar) or for a choice between options (use SegmentedControl).
 * @tier compound
 * @family panels
 * @a11y A plain `div`, not `role="toolbar"`: its buttons are reached with Tab like any others. Each action names what
 * it does; an icon-only one has its name as its tooltip.
 */
export function Toolbar({ children, start, align = 'end', ...data }: ToolbarProps) {
  return (
    <div {...data} data-dl="toolbar" data-align={align}>
      {start != null && <div data-dl-part="start">{start}</div>}
      {Children.toArray(children).length > 0 && <div data-dl-part="actions">{children}</div>}
    </div>
  );
}
