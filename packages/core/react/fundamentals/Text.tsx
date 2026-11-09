import type { ReactNode } from 'react';
import type { DataAttributes } from '../types';

export interface TextProps extends DataAttributes {
  /** The words. */
  children: ReactNode;
  /** Composite text style. `lead` (IP11): body-scale prose a step up, for a paragraph that opens or sums up what follows. `statement`: one display-scale sentence that isn't a heading (a mission, facts read as a sentence), at most one per view. */
  variant?: 'body' | 'body-sm' | 'caption' | 'lead' | 'statement';
  /** Colour by meaning. A status tone needs words that carry the status too, never colour alone. */
  tone?: 'default' | 'muted' | 'success' | 'danger' | 'warning' | 'info';
  /** `p` for a paragraph, `span` inside other text or controls. */
  as?: 'p' | 'span';
  /** Lets another element take its name from this text (`aria-labelledby`). */
  id?: string;
}

/**
 * Body and supporting text in one of the composite text styles.
 * Not for headings (use Heading) or text inside a control (the control owns its label).
 * @tier fundamental
 * @family text
 * @a11y Plain text element; inherits language and direction. Tone is never the only carrier of meaning.
 */
export function Text({ children, variant = 'body', tone = 'default', as: Element = 'p', id, ...data }: TextProps) {
  return (
    <Element {...data} id={id} data-dl="text" data-variant={variant} data-tone={tone}>
      {children}
    </Element>
  );
}
