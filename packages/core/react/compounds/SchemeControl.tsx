import { useScheme, type SchemeChoice } from '../behaviour/scheme';
import { Button, type ButtonSize } from '../fundamentals/Button';
import { SegmentedControl } from '../fundamentals/SegmentedControl';
import { Switch, type SwitchSize } from '../fundamentals/Switch';
import type { DataAttributes } from '../types';

export interface SchemeControlWords {
  /** The choice's option for the light scheme. Default "Light". */
  light: string;
  /** The choice's option for the dark scheme. Default "Dark". */
  dark: string;
  /** The choice's option that follows the system setting. Default "System". */
  system: string;
  /** The switch form's label, naming the setting. Default "Dark mode". */
  switch: string;
  /** The button form's name in the light scheme, by what it does. Default "Switch to dark mode". */
  toDark: string;
  /** The button form's name in the dark scheme. Default "Switch to light mode". */
  toLight: string;
}

export interface SchemeControlProps extends DataAttributes {
  /** `choice` (default): light, dark or system side by side. `switch`: one dark-mode Switch, for a settings list. `button`: one icon button named by what it does, the documented option for a tight site header. */
  form?: 'choice' | 'switch' | 'button';
  /** Names the choice: "Colour scheme". The choice form's group name. */
  label?: string;
  /** The words a person reads, from your content; English defaults. */
  words?: Partial<SchemeControlWords>;
  /** The choice form shows only each option's icon; each word becomes its tooltip and accessible name. */
  iconOnly?: boolean;
  /** The choice and button forms' size on the Button scale (default `s`); the switch form maps to its nearest size. */
  size?: ButtonSize;
  /** Where the choice is remembered (localStorage). Default `design-library.scheme`. */
  storageKey?: string;
  /** The element that carries `data-scheme`. Default the document root; pass a subtree for a preview. */
  root?: HTMLElement | null;
  /** Told of each new choice, after it is applied and remembered. */
  onChange?: (next: SchemeChoice) => void;
}

const fallback: SchemeControlWords = { light: 'Light', dark: 'Dark', system: 'System', switch: 'Dark mode', toDark: 'Switch to dark mode', toLight: 'Switch to light mode' };
const switchSize: Record<ButtonSize, SwitchSize> = { xs: 'xs', s: 's', normal: 'normal', m: 'normal', l: 'l', xl: 'l', xxl: 'l' };

/**
 * Lets a person choose the colour scheme, applies it at once without a page flash and remembers it for the next visit.
 * Three forms over one choice (ID3): a three-way choice of light, dark and system (the default, because following the
 * system is a third answer, not "off"); a dark-mode Switch for a settings list, where off means light; and an icon
 * button named by what it does, for a header with no room for either.
 * Not for contrast or density (use SegmentedControl or Switch with your own setting). Composes SegmentedControl, Switch
 * and Button and adds no styles of its own; the choice itself is `useScheme`, which a site can use to drive any control.
 * @tier compound
 * @family selection
 * @a11y The choice is a SegmentedControl (a named radio group, one tab stop, arrow keys); the switch is a Switch named
 * by its setting; the button is named by what it does ("Switch to dark mode"), shown as its tooltip, and its name
 * changes with the scheme. The change applies with motion suspended, so the page switches in one frame.
 * @key Arrow keys: choose the next or previous scheme (choice form)
 * @key Space: toggles dark mode (switch form) or switches the scheme (button form)
 */
export function SchemeControl({ form = 'choice', label = 'Colour scheme', words, iconOnly = false, size = 's', storageKey, root, onChange, ...data }: SchemeControlProps) {
  const w = { ...fallback, ...words };
  const { scheme, resolved, setScheme } = useScheme({ storageKey, root });
  const choose = (next: SchemeChoice) => {
    setScheme(next);
    onChange?.(next);
  };

  if (form === 'switch') return <Switch {...data} label={w.switch} size={switchSize[size]} checked={resolved === 'dark'} onChange={(on) => choose(on ? 'dark' : 'light')} />;

  if (form === 'button') {
    const dark = resolved === 'dark';
    return <Button {...data} label={dark ? w.toLight : w.toDark} icon={dark ? 'scheme-light' : 'scheme-dark'} iconOnly emphasis="quiet" size={size} onClick={() => choose(dark ? 'light' : 'dark')} />;
  }

  return (
    <SegmentedControl
      {...data}
      label={label}
      iconOnly={iconOnly}
      size={size}
      value={scheme}
      onChange={(v) => choose(v as SchemeChoice)}
      options={[
        { value: 'light', label: w.light, icon: 'scheme-light' },
        { value: 'dark', label: w.dark, icon: 'scheme-dark' },
        { value: 'system', label: w.system, icon: 'scheme-system' },
      ]}
    />
  );
}
