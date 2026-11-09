import type { ReactNode } from 'react';
import { Button } from '../fundamentals/Button';
import { Heading } from '../fundamentals/Heading';
import type { DataAttributes } from '../types';

export interface PaneProps extends DataAttributes {
  /** What the pane is for, as its heading, e.g. "Revision". */
  title: string;
  /** The close action's accessible name and tooltip, naming what it closes, e.g. "Close revision pane". */
  closeLabel: string;
  onClose: () => void;
  /** The pane's sections, top to bottom. */
  children: ReactNode;
  /** One quiet status line at the foot: where things are saved, or a failure with its way out. Announced politely. */
  status?: ReactNode;
  /** Lets the control that opens the pane name it (`aria-controls`). */
  id?: string;
}

/**
 * A working side pane beside the page: a heading, a close action, its sections and one status line at its foot. The
 * layout places it (LibraryLayout's aside); it is never a modal and never takes focus on its own.
 * Not for a dialog that needs an answer before going on (a Dialog compound, later) or for page content (use Section).
 * @tier compound
 * @family panels
 * @a11y A plain region placed by the layout; its heading is level 2 and the close button names what it closes. The
 * status foot is `role="status"`, so changes are announced politely, once.
 */
export function Pane({ title, closeLabel, onClose, children, status, id, ...data }: PaneProps) {
  return (
    <div {...data} id={id} data-dl="pane">
      <div data-dl-part="head">
        <Heading level={2} size={3}>
          {title}
        </Heading>
        <Button label={closeLabel} icon="close" iconOnly emphasis="quiet" onClick={onClose} />
      </div>
      {children}
      {status && (
        <div data-dl-part="status" role="status">
          {status}
        </div>
      )}
    </div>
  );
}
