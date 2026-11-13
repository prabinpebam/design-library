import type { DataAttributes } from '../types';

export interface DividerProps extends DataAttributes {
  /**
   * `rule` (default): a hairline across, the quiet line between two parts. `dinkus`: three small dots at the centre in
   * the accent, a magazine's break between two whole stories (two albums one after another).
   */
  variant?: 'rule' | 'dinkus';
}

/**
 * A break between two parts of one flow. The space either side is its parent's gap (a Stack's), never its own. Not
 * between page sections (they part by space, alignment and type) and not inside a list (its items part themselves).
 * @tier fundamental
 * @family layout
 * @a11y An `hr`: the separator role, announced as a break and nothing else; the dots are drawn, not text. In forced
 * colours the rule and the dots take the text colour.
 */
export function Divider({ variant = 'rule', ...data }: DividerProps) {
  return <hr {...data} data-dl="divider" data-variant={variant === 'dinkus' ? 'dinkus' : undefined} />;
}
