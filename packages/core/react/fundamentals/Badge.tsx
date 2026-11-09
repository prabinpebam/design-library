import { useRef, type ReactNode } from 'react';
import { usePresence } from '../behaviour/presence';
import { Icon } from './Icon';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export type BadgeTone = 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type Presence = 'available' | 'busy' | 'do-not-disturb' | 'away' | 'offline';

export interface BadgeProps extends DataAttributes {
  /** `label`: one or two words. `count`: a number. `dot`: "something new", no number. `status`: a dot then words, no fill, for dense tables. `presence`: a person's availability, a shape per state. `icon`: one glyph in a filled circle for a state shown on an avatar (verified, approved, declined, warning), with `icon`, `tone` and `label`. Default `label`. */
  kind?: 'label' | 'count' | 'dot' | 'status' | 'presence' | 'icon';
  /** The words, for `label` and `status`: a state or a category, in sentence case, never truncated. */
  children?: ReactNode;
  /** Meaning through the status roles only; `accent` (default) for a category with no status. The words or the icon always say it too. */
  tone?: BadgeTone;
  /** A category colour, 1-8 (`color.category.*`, Q44), for a badge that names a category (a project, a topic, a series), never a status. Replaces `tone`. Subtle: a quiet fill with a dot in the colour; strong: the colour as the fill. Keep one number per category everywhere it appears. */
  category?: number;
  /** `subtle` (default): a tint with coloured text. `strong`: a solid fill, for the one thing on the screen that needs attention. */
  emphasis?: 'subtle' | 'strong';
  /** A leading icon for a `label` badge, such as a state's (open, closed), or the glyph of an `icon` badge. Decorative: the words or `label` carry the meaning. */
  icon?: IconName;
  /** `count`: the number. */
  count?: number;
  /** `count`: the most shown before "max+". Default 99. */
  max?: number;
  /** `count`: show 0 instead of hiding the badge. */
  showZero?: boolean;
  /** `presence`: the state; each has its own shape, so colour is never the only cue. */
  presence?: Presence;
  /** What the badge means in words, for assistive technology: needed for `count`, `dot`, `presence` and `icon` ("3 unread", "New", "Busy", "Verified"). */
  label?: string;
  /** `s` (20 px) or `normal` (24 px). One size per context. Default `normal`. Dot, presence and icon badges follow their host: `s` 10 px with no glyph (shape only) on avatars of 40 px and less, `normal` 16 px, `l` 24 px on avatars of 96 px and more (an Avatar picks it). */
  size?: 's' | 'normal' | 'l';
  /** Pins the badge to the top-end corner of this host (an Icon, an icon-only Button, an avatar). */
  anchor?: ReactNode;
  /** With `anchor`: `round` hosts pull the badge in to their curve, `square` hosts sit it on the corner. Default `square`. */
  overlap?: 'round' | 'square';
  /** Announce changes politely (`role=status`), for a live count or status that matters to the reader. */
  live?: boolean;
}

const presenceMark: Partial<Record<Presence, IconName>> = { available: 'check', 'do-not-disturb': 'minus', offline: 'close' };
const presenceTone: Record<Presence, BadgeTone> = { available: 'success', busy: 'danger', 'do-not-disturb': 'danger', away: 'warning', offline: 'neutral' };

/**
 * Information the system set and the reader can't change: a state or category in words, a count, a "new" dot, a status
 * dot with words, or a person's presence; on its own or pinned to the corner of an icon, button or avatar.
 * Not for a value someone picked or can remove (a Chip), an action (Button) or navigation (Link). Never takes focus.
 * One component for what other systems call badge, lozenge, label, state label, counter, status light and indicator.
 * @tier fundamental
 * @family text
 * @a11y A `span` whose words are read as text. A count, dot or presence carries `label` as hidden text; when pinned to a
 * host, also put it in the host's accessible name ("Inbox, 3 unread"). `live` makes it a polite `status`. Tone is never
 * the only cue: words, an icon or the presence shape say it, in every context and in forced colours.
 */
export function Badge({
  kind = 'label',
  children,
  tone,
  category,
  emphasis,
  icon,
  count = 0,
  max = 99,
  showZero = false,
  presence = 'available',
  label,
  size = 'normal',
  anchor,
  overlap = 'square',
  live,
  ...data
}: BadgeProps) {
  // C24 (Q65): a count arrives and leaves; it isn't swapped in or out in one frame. The first render never animates (Z19).
  const shown = kind !== 'count' || count > 0 || showZero;
  const kept = usePresence(shown);
  const wasHidden = useRef(!shown);
  const lastCount = useRef(count);
  if (!shown) wasHidden.current = true;
  else lastCount.current = count;
  if (!kept) return anchor ? <>{anchor}</> : null;
  const leaving = !shown;
  const value = leaving ? lastCount.current : count;
  const resolvedTone = tone ?? (kind === 'presence' ? presenceTone[presence] : kind === 'count' || kind === 'dot' ? 'danger' : 'accent');
  const resolvedEmphasis = emphasis ?? (kind === 'label' || kind === 'status' ? 'subtle' : 'strong');
  const mark = kind === 'presence' ? presenceMark[presence] : kind === 'icon' ? icon : undefined;
  const cat = category && category >= 1 && category <= 8 && kind !== 'presence' && kind !== 'count' && kind !== 'icon' ? String(Math.round(category)) : undefined;
  const badge = (
    <span
      {...(anchor ? {} : data)}
      data-dl="badge"
      data-kind={kind}
      data-tone={cat ? 'category' : resolvedTone}
      data-category={cat}
      data-emphasis={resolvedEmphasis}
      data-size={size === 'normal' ? undefined : size}
      data-presence={kind === 'presence' ? presence : undefined}
      data-appear={kind === 'count' && wasHidden.current ? '' : undefined}
      data-leaving={leaving ? '' : undefined}
      inert={leaving}
      aria-hidden={leaving || undefined}
      role={live && !leaving ? 'status' : undefined}
    >
      {kind === 'label' && icon && <Icon name={icon} size="sm" />}
      {(kind === 'status' || (kind === 'label' && cat && resolvedEmphasis === 'subtle' && !icon)) && <span data-dl-part="dot" aria-hidden="true" />}
      {mark && size !== 's' && <Icon name={mark} size="sm" />}
      {kind === 'count' && <span aria-hidden={label ? true : undefined}>{value > max ? `${max}+` : value}</span>}
      {(kind === 'label' || kind === 'status') && children}
      {label && <span data-dl-part="announce">{label}</span>}
    </span>
  );
  if (!anchor) return badge;
  return (
    <span {...data} data-dl="badge-anchor" data-overlap={overlap}>
      {anchor}
      {badge}
    </span>
  );
}