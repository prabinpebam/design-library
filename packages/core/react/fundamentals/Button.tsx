import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { useCommit } from '../behaviour/commit';
import { useRouter } from '../behaviour/router';
import { Icon } from './Icon';
import { Progress } from './Progress';
import { useHint } from './Tooltip';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

/** The size scale, smallest first (owner, 2026-11-07 15:49). `normal` is the default; size is per instance and never changes with the theme's space option. */
export type ButtonSize = 'xs' | 's' | 'normal' | 'm' | 'l' | 'xl' | 'xxl';

/** Where an operation in progress shows: a spinner inside, in place of the icon; an arc travelling around the button's border; or the button itself filling up with a known percentage. */
export type ButtonProgress = 'inside' | 'ring' | 'fill';

interface ButtonBase extends DataAttributes {
  /** A verb first, 3 words or fewer. Shown, or the accessible name of an icon-only button. */
  label: string;
  /** Leading icon; required when `iconOnly`. */
  icon?: IconName;
  /** Shows only the icon; `label` becomes its accessible name and its tooltip. Square at every size. */
  iconOnly?: boolean;
  /**
   * Shows the label of an icon-only button, or the reason of an unavailable one, as a Tooltip on hover and keyboard
   * focus: one hint, never the browser's own `title`. On by default; `false` only where something next to it already
   * shows the same words. An explicit Tooltip around the button replaces it (for a side or a shortcut).
   */
  tooltip?: boolean;
  /** `primary` for the one main action in a view, `default` otherwise, `quiet` inside toolbars and other enclosed groups, `danger` for an action that destroys or can't be undone. */
  emphasis?: 'primary' | 'default' | 'quiet' | 'danger';
  /** The action can't happen and there's nothing to say about why. Prefer `unavailable` with a reason: a disabled button can't be focused, so its reason can't be heard. */
  disabled?: boolean;
  /** The action can't happen now, and why, e.g. "Add a title first". The button stays focusable, keeps its contrast, does nothing when pressed and says why as its description and tooltip. */
  unavailable?: string;
  /** `submit` only inside a form. */
  type?: 'button' | 'submit';
  /** xs 24, s 36, normal 44, m 48, l 56, xl 64, xxl 80 px high. `xs` and `s` are dense sizes (written exceptions to the 44 px target); `normal` everywhere else. */
  size?: ButtonSize;
  /** Reserves at least the normal target and 44 CSS px in both axes, even under root font scaling. Keeps the selected size's icon and type. Default false preserves dense-surface exceptions. */
  minimumTarget?: boolean;
  /** How an operation in progress shows: `inside` (a spinner in place of the icon), `ring` (an arc around the border, the content kept) or `fill` (the button fills up from its start edge as `value` grows). `fill` needs a known `value` and a `primary` or `danger` button with a label at least `c.button.fill-min-inline` wide; otherwise it shows `inside` (and warns in development). */
  progress?: ButtonProgress;
  /** How far the operation in progress is, 0 to 100, from a real total (bytes, items, steps). Only for `progress="fill"`; leave it out when the total isn't known. */
  value?: number;
  /** For a disclosure: whether the region it opens is shown. Shown as a selected tint while true. */
  expanded?: boolean;
  /** For a disclosure: the id of the region it opens. */
  controls?: string;
  /** A toggle button (Q121): on or off, announced as pressed (`aria-pressed`), shown with `c.button.pressed-fill`. Switch is the default for a binary setting; use this only with a written reason in a `toggle-button:` comment just above it where it's used (a dense toolbar or a list row's eye and lock). Pair it with an icon that shows the state. */
  pressed?: boolean;
  /** With `pressed`: the icon shown while pressed, e.g. `pin-filled` for `pin`, so the state shows in the glyph as well as the fill. */
  pressedIcon?: IconName;
  /** The pointer arrives over it (IP9), e.g. to preview what it opens. Runs beside the button's own hint handling. */
  onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
  /** The pointer leaves it (IP9). */
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
  /** It takes focus (IP9). */
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  /** It loses focus (IP9). */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
}

interface ActionButton extends ButtonBase {
  href?: never;
  /** An action with no saved result to confirm (open, close, cancel, retry, export). */
  onClick?: () => void;
  /** The action it started is still running elsewhere (an export, a sync): shows in progress and ignores presses until false. */
  busy?: boolean;
  /** Present tense while `busy`, e.g. "Exporting…"; the label stays when left out. */
  pendingLabel?: string;
  onCommit?: never;
  doneLabel?: never;
  onError?: never;
}

interface CommitButton extends ButtonBase {
  href?: never;
  onClick?: never;
  busy?: never;
  /** Saves something: the button shows pending, then confirmed, on itself. Reject the promise when it fails. */
  onCommit: () => Promise<unknown>;
  /** Present tense while pending, e.g. "Saving…". */
  pendingLabel: string;
  /** Past tense once stored, e.g. "Saved". */
  doneLabel: string;
  /** The failure, for the scope the button acts on (its section's message bar). The button itself returns to rest. */
  onError?: (error: unknown) => void;
}

interface LinkButton extends ButtonBase {
  /**
   * Goes somewhere (IP8): the button is a link (`a[href]`) that looks like a button, for the few places a destination
   * is the main call to action (a hero's "Get tickets", a header's "Sign up"). Everywhere else a destination is a Link.
   * No progress, commit or disclosure: `type`, `progress`, `value`, `expanded` and `controls` don't apply.
   */
  href: string;
  /** Runs as it's followed, e.g. a router taking over: call `event.preventDefault()` to stop the browser's own navigation. */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  busy?: never;
  pendingLabel?: never;
  onCommit?: never;
  doneLabel?: never;
  onError?: never;
}

export type ButtonProps = ActionButton | CommitButton | LinkButton;

const iconSize: Record<ButtonSize, 'sm' | 'md' | 'lg' | 'xl'> = { xs: 'sm', s: 'sm', normal: 'md', m: 'md', l: 'lg', xl: 'lg', xxl: 'xl' };

const warned = new Set<string>();

/** Why a `fill` request can't fill, or null when it can. */
function fillBlocker(emphasis: string, iconOnly: boolean, value: number | undefined, narrow: boolean) {
  if (iconOnly) return 'icon-only (no room to show a percentage)';
  if (emphasis !== 'primary' && emphasis !== 'danger') return `emphasis "${emphasis}" has no visible background to fill`;
  if (typeof value !== 'number' || Number.isNaN(value)) return 'no value (indeterminate progress)';
  if (narrow) return 'narrower than c.button.fill-min-inline';
  return null;
}

/** Whether the button is narrower than the fill's minimum, read from the token so the theme owns it. */
function useNarrow(ref: RefObject<HTMLElement | null>, watch: boolean) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !watch) return;
    const check = () => {
      const raw = getComputedStyle(el).getPropertyValue('--c-button-fill-min-inline').trim();
      const n = parseFloat(raw);
      const min = raw.endsWith('rem') ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n;
      setNarrow(el.getBoundingClientRect().width < (min || 0) - 0.5);
    };
    check();
    const sizes = new ResizeObserver(check);
    sizes.observe(el);
    return () => sizes.disconnect();
  }, [ref, watch]);
  return narrow;
}

/**
 * Triggers an action. One component for text, icon and text, and icon-only buttons, at seven sizes, with two ways to
 * show an operation in progress (three: inside, ring, fill). Not for navigation (use Link; `href` only for a destination
 * that is the main call to action), on/off settings (use Switch), a menu of actions (use MenuButton) or one exclusive
 * choice (use SegmentedControl).
 * @tier fundamental
 * @family buttons
 * @a11y Native `button`. Targets: 44 px and up from `normal`; `s` (36 px) and `xs` (24 px, the WCAG 2.5.8 minimum) are
 * dense sizes for dense surfaces (O41). In progress keeps the same focused element, locked with `aria-disabled` and
 * `aria-busy`, never `disabled`, and its present-tense label is the accessible name; the ring variant's arc is
 * decorative (`aria-hidden`) and meets 3:1. The fill variant is a hidden `progressbar` with `aria-valuenow`, read as the
 * button's description; its filled copy of the label is `aria-hidden`, and the label reaches 4.5:1 over both parts. Unavailable stays focusable with `aria-disabled` and its reason as the
 * description. Icon-only buttons are named by `label`, which also shows as their hint (a Tooltip, hidden from assistive technology because it repeats the name; an unavailable button's hint is its reason, already its description). No native `title`, so there's one hint. A disclosure sets
 * `aria-expanded` and `aria-controls`, and shows open as a selected tint. Every label, pending and done alike, shares
 * one box, so the width never changes. With `href` it is a native `a[href]` (Enter follows it) with the same look and
 * focus ring; unavailable keeps it focusable with `aria-disabled`, its reason as the description, and stops it going.
 * @key Enter: activates
 * @key Space: activates
 */
export function Button(props: ButtonProps) {
  const { label, icon, iconOnly = false, tooltip = true, emphasis = 'default', disabled = false, unavailable, type = 'button', size = 'normal', minimumTarget = false, progress = 'inside', value, expanded, controls, pressed, pressedIcon, href, onClick, onCommit, busy = false, pendingLabel, doneLabel, onError, onPointerEnter, onPointerLeave, onFocus, onBlur, ...data } = props;
  const router = useRouter();
  const { phase, run } = useCommit('--duration-confirm-read');
  const reasonId = useId();
  const valueId = useId();
  const self = useRef<HTMLElement>(null);
  const pending = phase === 'on' || busy;
  const shown = pending ? 'on' : phase === 'done' ? 'done' : 'rest';
  const mark = (name: IconName) => <Icon name={name} size={iconSize[size]} />;
  const glyph = pressed && pressedIcon ? pressedIcon : icon;
  const narrow = useNarrow(self, progress === 'fill');
  const blocker = progress === 'fill' ? fillBlocker(emphasis, iconOnly, value, narrow) : null;
  // `fill` that can't fill shows the inside spinner: one fallback, never a broken fill.
  const shownProgress: ButtonProgress = progress === 'fill' && blocker ? 'inside' : progress;
  const filling = shownProgress === 'fill' && pending;
  const percent = Math.min(100, Math.max(0, Math.round(value ?? 0)));

  useEffect(() => {
    if (!blocker || !pending) return;
    const key = `${label}|${blocker}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(`Button "${label}": progress="fill" shows the inside spinner instead: ${blocker}.`);
  }, [blocker, pending, label]);

  const layers: [string, ReactNode, string][] = [['rest', glyph && mark(glyph), label]];
  // The ring and the fill keep the content as it was (the icon too); inside, the spinner takes the icon's place.
  const pendingMark = shownProgress === 'inside' ? <Progress /> : glyph && mark(glyph);
  if (onCommit || 'busy' in props) layers.push(['on', pendingMark, pendingLabel ?? label]);
  if (onCommit) layers.push(['done', mark('check'), doneLabel]);
  const name = layers.find(([id]) => id === shown)?.[2] ?? label;
  const hintText = iconOnly && unavailable ? `${name}: ${unavailable}` : unavailable ?? (iconOnly ? name : '');
  const hint = useHint(self, hintText, { enabled: tooltip && !!hintText });

  // The caller's pointer and focus handlers run beside the hint's own (IP9).
  const both = <E,>(own: ((e: E) => void) | undefined, theirs: ((e: E) => void) | undefined) => (own || theirs ? (e: E) => (own?.(e), theirs?.(e)) : undefined);
  const events = {
    onPointerEnter: both(hint.tip ? hint.handlers.onPointerEnter : undefined, onPointerEnter),
    onPointerLeave: both(hint.tip ? hint.handlers.onPointerLeave : undefined, onPointerLeave),
    onPointerDown: hint.tip ? hint.handlers.onPointerDown : undefined,
    onFocus: both(hint.tip ? hint.handlers.onFocus : undefined, onFocus),
    onBlur: both<FocusEvent<HTMLElement>>(hint.tip ? hint.handlers.onBlur : undefined, onBlur),
  };

  if (href !== undefined) {
    const follow = (e: MouseEvent<HTMLAnchorElement>) => {
      if (unavailable) return e.preventDefault();
      (onClick as ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined)?.(e);
    };
    return (
      <a
        {...data}
        ref={self as RefObject<HTMLAnchorElement>}
        href={router ? router.href(href) : href}
        data-dl="button"
        data-emphasis={emphasis}
        data-icon-only={iconOnly ? '' : undefined}
        data-size={size}
        data-minimum-target={minimumTarget ? '' : undefined}
        data-unavailable={unavailable ? '' : undefined}
        aria-disabled={unavailable ? true : undefined}
        aria-label={iconOnly ? label : undefined}
        aria-describedby={unavailable ? reasonId : undefined}
        onClick={follow}
        {...events}
      >
        <span data-dl-part="layer" data-shown="">
          {glyph && mark(glyph)}
          {!iconOnly && <span>{label}</span>}
        </span>
        {unavailable && (
          <span id={reasonId} data-dl-part="reason" hidden>
            {unavailable}
          </span>
        )}
        {hint.tip}
      </a>
    );
  }

  const activate = async () => {
    if (pending || unavailable) return;
    if (!onCommit) return (onClick as (() => void) | undefined)?.();
    const result = await run(onCommit);
    if (!result.ok && 'error' in result) onError?.(result.error);
  };

  return (
    <button
      {...data}
      ref={self as RefObject<HTMLButtonElement>}
      type={type}
      data-dl="button"
      data-emphasis={emphasis}
      data-icon-only={iconOnly ? '' : undefined}
      data-size={size}
      data-minimum-target={minimumTarget ? '' : undefined}
      data-progress={shownProgress}
      data-filling={filling ? '' : undefined}
      data-busy={pending ? 'on' : phase === 'rest' ? undefined : phase}
      data-unavailable={unavailable ? '' : undefined}
      disabled={disabled}
      aria-disabled={pending || !!unavailable || undefined}
      aria-busy={pending || undefined}
      aria-label={iconOnly ? name : undefined}
      aria-describedby={[unavailable && reasonId, filling && valueId].filter(Boolean).join(' ') || undefined}
      aria-expanded={expanded}
      aria-pressed={pressed}
      aria-controls={controls}
      style={filling ? ({ '--button-fill': `${percent}%` } as CSSProperties) : undefined}
      onClick={activate}
      {...events}
    >
      {layers.map(([id, layerMark, text]) => (
        <span key={id} data-dl-part="layer" data-shown={id === shown ? '' : undefined}>
          {layerMark}
          {!iconOnly && <span>{text}</span>}
        </span>
      ))}
      {filling && (
        <>
          {/* The filled part: the same content in the filled colours, clipped to the percentage from the start edge. */}
          <span data-dl-part="fill" aria-hidden="true">
            <span data-dl-part="layer" data-shown="">
              {pendingMark}
              <span>{pendingLabel ?? label}</span>
            </span>
          </span>
          <span id={valueId} data-dl-part="value" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} hidden>
            {percent}%
          </span>
        </>
      )}
      {shownProgress === 'ring' && pending && (
        <svg data-dl-part="ring" aria-hidden="true" focusable="false">
          <rect pathLength="100" />
        </svg>
      )}
      {unavailable && (
        <span id={reasonId} data-dl-part="reason" hidden>
          {unavailable}
        </span>
      )}
      {hint.tip}
    </button>
  );
}