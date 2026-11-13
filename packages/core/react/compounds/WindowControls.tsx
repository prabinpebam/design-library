import type { IconName } from '../../icons/icons';
import { Button } from '../fundamentals/Button';
import type { DataAttributes } from '../types';

export type WindowState = 'normal' | 'maximised' | 'minimised' | 'closed';

export interface WindowControlsProps extends DataAttributes {
  /** The window's state, owned by the parent. A minimised or closed window is the parent's to show (one line and a way back). */
  state: WindowState;
  /** A caption button was pressed: Minimise gives `minimised`, Maximise `maximised`, Restore Down `normal`, Close `closed`. */
  onChange: (next: WindowState) => void;
  /** The buttons' names, in the app's language; the defaults are the desktop's own. */
  labels?: Partial<Record<'minimise' | 'maximise' | 'restore' | 'close', string>>;
  /** The group's accessible name. Default "Window". */
  label?: string;
  /** Glyphs for each button, when the app draws its own; the defaults are core's. */
  icons?: Partial<Record<'minimise' | 'maximise' | 'restore' | 'close', IconName>>;
}

const defaultLabels = { minimise: 'Minimise', maximise: 'Maximise', restore: 'Restore Down', close: 'Close' };
const defaultIcons: Record<'minimise' | 'maximise' | 'restore' | 'close', IconName> = { minimise: 'minus', maximise: 'window-maximize', restore: 'window-restore', close: 'close' };

/**
 * A desktop window's caption buttons: Minimise, Maximise (Restore Down while maximised) and Close, at the end of an
 * app's title bar. For a desktop-app replica or a product that draws its own window frame.
 * Not for closing a dialog or pane (their own close button) or for app-wide actions (TitleBar `actions`).
 * @tier compound
 * @family navigation
 * @a11y A `group` named "Window"; each button is named by what it does now, so a maximised window's middle button is
 * "Restore Down" and its glyph changes with it.
 * @key Tab: reaches each button in order
 */
export function WindowControls({ state, onChange, label = 'Window', labels, icons, ...data }: WindowControlsProps) {
  const name = { ...defaultLabels, ...labels };
  const glyph = { ...defaultIcons, ...icons };
  const maximised = state === 'maximised';
  return (
    <div {...data} data-dl="window-controls" role="group" aria-label={label}>
      <span data-dl-part="cell"><Button label={name.minimise} icon={glyph.minimise} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => onChange('minimised')} /></span>
      <span data-dl-part="cell"><Button label={maximised ? name.restore : name.maximise} icon={maximised ? glyph.restore : glyph.maximise} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => onChange(maximised ? 'normal' : 'maximised')} /></span>
      <span data-dl-part="cell"><Button label={name.close} icon={glyph.close} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => onChange('closed')} /></span>
    </div>
  );
}
