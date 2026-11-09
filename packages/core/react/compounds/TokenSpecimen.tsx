import type { CSSProperties, ReactNode, Ref } from 'react';
import type { DataAttributes } from '../types';

/** What the token is, which decides how it's drawn. */
export type TokenSpecimenKind = 'colour' | 'ramp' | 'contrast' | 'type' | 'font' | 'length' | 'size' | 'radius' | 'stroke' | 'shadow' | 'easing' | 'duration' | 'travel' | 'fade' | 'material' | 'elevation';

/** One step of a colour ramp. */
export interface TokenSpecimenStep {
  /** The step's name, e.g. "500". */
  name: string;
  /** The step's custom property, e.g. `--spectrum-red-500`. */
  token: string;
  /** The value it holds, as written. */
  value: string;
}

export interface TokenSpecimenProps extends DataAttributes {
  /**
   * What the token is: `colour` (a swatch), `ramp` (a strip of colour steps), `contrast` (text in one colour on
   * another), `type` (a text style), `font` (a font's shapes, or a line in it), `length` (a bar), `size` (a square),
   * `radius`, `stroke`, `shadow` (a tile), `easing` (its curve and a dot that moves along a track), `duration`
   * (a track that fills), `travel` (a motion role that moves: a dot crossing its track by transform) or `fade` (a
   * motion role that changes a value: a tile whose fill fades to the mark colour). `travel` and `fade` play with
   * the role's own duration, so a reduced-motion subtree shows what that context keeps. `material` (Q73) draws a
   * surface of the material (`token`, its fill; `value`, its backdrop-filter token) over stripes, with text on it.
   * `elevation` (Q78) draws one level of the ladder: a surface (`token`, its fill) on what it sits on (`on`, laid
   * over the canvas, so a scrim dims it), with its shadow (`value`) and its outline (`edge`) when it has them.
   */
  kind: TokenSpecimenKind;
  /**
   * The custom property drawn, e.g. `--space-4`. For `type`, the style's prefix (`--type-heading-1`, read as its
   * `-size`, `-leading` and `-weight`); for `font`, the stack; for `contrast`, the text colour.
   */
  token?: string;
  /** `contrast`: the colour the text sits on. `elevation`: the surface under the level, e.g. `--color-bg-overlay`. */
  on?: string;
  /** `elevation`: the outline colour token, when the level has one, e.g. `--color-border`. */
  edge?: string;
  /** `type`: the font stack to set the sample in, when the style doesn't set one, e.g. `--font-code`. */
  family?: string;
  /** `length`: draw to scale as a share of the room (0 to 100) instead of at the token's own length. */
  share?: number;
  /** `easing`: its four control points as written, e.g. `0.2, 0, 0, 1`, to draw its curve. `material`: the backdrop-filter token, e.g. `--material-backdrop`. */
  value?: string;
  /** `easing`, `duration`, `travel` and `fade`: the motion has been played, so the dot or fill sits at its end. */
  played?: boolean;
  /** `ramp`: its steps, lightest first. */
  steps?: TokenSpecimenStep[];
  /** `type`, `font` and `contrast`: the sample text. A `font` without text shows its large Aa. */
  children?: ReactNode;
  /** The drawn element, so a reader can measure what it shows (a `colour` swatch's text colour is its canvas). */
  ref?: Ref<HTMLSpanElement>;
}

type Vars = CSSProperties & Record<`--${string}`, string>;
const v = (token?: string) => (token ? `var(${token})` : undefined);
/** Only the custom properties that have a value. */
const vars = (entries: Record<string, string | undefined>) => Object.fromEntries(Object.entries(entries).filter(([, x]) => x != null)) as Vars;

/**
 * Draws one design token so its value can be seen, the drawing chosen by what the token is: one component for
 * every kind, not a variant per kind. The values come from the tokens themselves, so the specimen is always current.
 * Not for content: a chart's bar is a StackedBar, a status message is text with a tone.
 * @tier compound
 * @family documentation
 * @a11y Decorative: every specimen but `type`, `font` with text and `ramp` is `aria-hidden`, so the token's name and
 * value must be in nearby text. A ramp is an ordered list whose steps read as their name and value. Motion plays only
 * when `played` changes; `easing` and `duration` not at all with reduced motion, `travel` and `fade` as their role
 * does in that context (travel snaps, a fade still fades).
 */
export function TokenSpecimen({ kind, token, on, edge, family, share, value, played, steps = [], children, ref, ...data }: TokenSpecimenProps) {
  const base = { ...data, 'data-dl': 'token-specimen', 'data-kind': kind };
  switch (kind) {
    case 'ramp':
      return (
        <ol {...base}>
          {steps.map((s) => (
            <li key={s.token}>
              <span data-dl-part="chip" style={vars({ '--specimen': v(s.token) })} aria-hidden="true" />
              <code data-dl-part="name">{s.name}</code>
              <code>{s.value}</code>
            </li>
          ))}
        </ol>
      );
    case 'easing':
      return (
        <span {...base} data-played={played ? '' : undefined} style={vars({ '--specimen': v(token) })} aria-hidden="true">
          <svg data-dl-part="curve" viewBox="-4 -4 108 108">
            <path data-dl-part="axis" d="M0 100 H100 M0 100 V0" />
            <path data-dl-part="path" d={curve(value)} />
          </svg>
          <span data-dl-part="track">
            <span data-dl-part="dot" />
          </span>
        </span>
      );
    case 'travel':
      return (
        <span {...base} data-played={played ? '' : undefined} style={vars({ '--specimen': v(token) })} aria-hidden="true">
          <span data-dl-part="dot" />
        </span>
      );
    case 'fade':
      return <span {...base} data-played={played ? '' : undefined} style={vars({ '--specimen': v(token) })} aria-hidden="true" />;
    case 'duration':
      return (
        <span {...base} data-played={played ? '' : undefined} style={vars({ '--specimen': v(token) })} aria-hidden="true">
          <span data-dl-part="fill" />
        </span>
      );
    case 'type':
      return (
        <span {...base} ref={ref} data-family={family ? '' : undefined} style={vars({ '--specimen-size': v(`${token}-size`), '--specimen-leading': v(`${token}-leading`), '--specimen-weight': v(`${token}-weight`), '--specimen-tracking': v(`${token}-tracking`), '--specimen-family': v(family), '--specimen-axes': v(family?.replace('--font-', '--axes-')) })}>
          {children}
        </span>
      );
    case 'font':
      return (
        <span {...base} data-line={children ? '' : undefined} style={vars({ '--specimen': v(token), '--specimen-axes': token?.startsWith('--font-') ? v(token.replace('--font-', '--axes-')) : undefined })} aria-hidden={children ? undefined : 'true'}>
          {children ?? 'Aa'}
        </span>
      );
    case 'contrast':
      return (
        <span {...base} ref={ref} style={vars({ '--specimen': v(token), '--specimen-on': v(on) })} aria-hidden="true">
          {children ?? 'Aa'}
        </span>
      );
    case 'material':
      // Q73: a surface of the material over the hardest backdrop (stripes of text and canvas colour), with text and
      // muted text on it, so its finish and its readability show together.
      return (
        <span {...base} ref={ref} style={vars({ '--specimen': v(token), '--specimen-filter': v(value) })} aria-hidden="true">
          <span data-dl-part="surface">
            <span>{children ?? 'Text'}</span>
            <span data-dl-part="muted">Muted</span>
          </span>
        </span>
      );
    case 'elevation':
      // Q78: one level of the ladder as its cues only (fill, shadow, outline), so the levels compare side by side.
      return (
        <span {...base} ref={ref} style={vars({ '--specimen': v(token), '--specimen-on': v(on), '--specimen-shadow': v(value), '--specimen-edge': v(edge) })} aria-hidden="true">
          <span data-dl-part="surface">{children ?? 'Aa'}</span>
        </span>
      );
    default:
      return <span {...base} ref={ref} style={vars({ '--specimen': share == null ? v(token) : `${share}%` })} aria-hidden="true" />;
  }
}

/** A cubic-bezier in a 100 × 100 box, y up, from its control points. */
function curve(value = '') {
  const n = value.split(',').map(Number);
  return `M0 100 C ${n[0] * 100} ${100 - n[1] * 100}, ${n[2] * 100} ${100 - n[3] * 100}, 100 0`;
}
