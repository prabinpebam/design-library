import { useId, type CSSProperties } from 'react';
import { Badge } from '../fundamentals/Badge';
import { Button } from '../fundamentals/Button';
import { ColourPicker } from '../fundamentals/ColourPicker';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

export interface ColourFieldProps extends DataAttributes {
  /** The short visible mark that names the field, e.g. "1". Shown above the swatch. */
  mark: string;
  /** The field's accessible name, e.g. "Brand colour 1". */
  label: string;
  /** The colour as #rrggbb, or undefined when it isn't defined. */
  value?: string;
  /** What the colour is called, e.g. "Indigo"; shown under the swatch with its hex value. */
  name?: string;
  /** The new colour, as the person moves through the picker. It applies at once; the owner of the value decides how it's kept. */
  onChange: (hex: string) => void;
  /** Makes the colour not defined. Leave out when it can't be cleared, and say why nearby. */
  onClear?: () => void;
  /** One or two words beside the mark for a role this colour plays, e.g. "Accent". */
  tag?: string;
  /** What the picker starts at when the colour isn't defined. */
  suggestion?: string;
  /** Under an undefined swatch: why it's empty and what to do. Default: "Not defined. Choose a colour to add it." */
  emptyText?: string;
}

/**
 * One colour a person can choose, clear or leave undefined: a labelled swatch that opens the ColourPicker in a popover.
 * Not for choosing among a fixed set of colours (use SegmentedControl or Select), or for showing a token's colour
 * (use TokenSpecimen). Added for the Colour page's numbered brand colours (owner, F7d, 2026-11-07).
 * @tier compound
 * @family pickers
 * @a11y The ColourPicker's swatch button, named by `label` and the hex, fills the whole swatch, so a click, a tap, Enter or
 * Space opens the picker as a dialog (Escape closes it and returns focus); the focus ring draws around the swatch. An undefined colour is a dashed, empty swatch with words that
 * say so, never colour alone.  Clear is a separate quiet icon-only Button named "Clear" plus the label, present only
  * while the colour can be cleared. The swatch is a 64 px square target.
 * @key Enter or Space on the swatch: opens the colour picker
 * @key Tab: moves from the swatch to Clear
 */
export function ColourField({ mark, label, value, name, onChange, onClear, tag, suggestion = '#808080', emptyText = 'Not defined. Choose a colour to add it.', ...data }: ColourFieldProps) {
  const id = useId();
  const defined = value !== undefined;
  return (
    <div {...data} data-dl="colour-field" data-empty={defined ? undefined : ''}>
      <div data-dl-part="head">
        <span data-dl-part="mark" aria-hidden="true">
          {mark}
        </span>
        {tag && <Badge>{tag}</Badge>}
      </div>
      <div data-dl-part="swatch" style={defined ? ({ '--colour-field-value': value } as CSSProperties) : undefined}>
        <ColourPicker label={label} value={value ?? suggestion} onChange={(hex) => onChange(hex)} trigger={{ empty: !defined }} />
      </div>
      <div data-dl-part="meta" id={`${id}-meta`}>
        {defined ? (
          <>
            <Text as="span" variant="body-sm">
              {name ?? label}
            </Text>
            <Text as="span" variant="caption" tone="muted">
              {value}
            </Text>
          </>
        ) : (
          <Text as="span" variant="caption" tone="muted">
            {emptyText}
          </Text>
        )}
      </div>
      {defined && onClear && (
        <div data-dl-part="actions">
          <Button label={`Clear ${label.charAt(0).toLowerCase()}${label.slice(1)}`} icon="close" iconOnly emphasis="quiet" size="s" onClick={onClear} />
        </div>
      )}
    </div>
  );
}
