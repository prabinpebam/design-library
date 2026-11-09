import { useId, type ReactNode } from 'react';
import { Text } from './Text';
import type { DataAttributes } from '../types';

export interface CheckboxGroupProps extends DataAttributes {
  /** Names the set, as a question or a noun phrase, with no colon: "Notify me about". */
  label: string;
  /** The Checkboxes, one per row. */
  children: ReactNode;
  /** One short sentence about the set, such as how many to pick. */
  hint?: string;
  /** What's wrong with the set and how to fix it: "Choose at least one channel." */
  error?: string;
  /** Marks the legend "(optional)". Sets are required by default, so only optional ones are marked. */
  optional?: boolean;
}

/**
 * Several related Checkboxes named together by a legend, with an optional hint and one error for the set.
 * Not for one box (use Checkbox alone) or exclusive options (use a radio group). A "select all" parent is a mixed
 * Checkbox at the top of the group whose state the consumer derives from the children.
 * @tier fundamental
 * @family selection
 * @a11y A native `fieldset` named by its `legend`, so each box is read with the set's name; the hint and error are linked
 * to the fieldset with `aria-describedby`. The boxes stay in one column in reading order; each row is its own target.
 */
export function CheckboxGroup({ label, children, hint, error, optional = false, ...data }: CheckboxGroupProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset {...data} data-dl="checkbox-group" data-invalid={error ? '' : undefined} aria-describedby={describedBy}>
      <legend data-dl-part="legend">
        {label}
        {optional && <span data-dl-part="optional"> (optional)</span>}
      </legend>
      {hint && (
        <span data-dl-part="hint" id={`${id}-hint`}>
          <Text as="span" variant="body-sm" tone="muted">
            {hint}
          </Text>
        </span>
      )}
      <span data-dl-part="items">{children}</span>
      {error && (
        <span data-dl-part="error" id={`${id}-error`}>
          <Text as="span" variant="body-sm" tone="danger">
            {error}
          </Text>
        </span>
      )}
    </fieldset>
  );
}