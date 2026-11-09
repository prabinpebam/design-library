import { useState, type MouseEventHandler } from 'react';
import { Badge, type BadgeTone, type Presence } from './Badge';
import { Icon } from './Icon';
import { Skeleton } from './Skeleton';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export type AvatarSize = 16 | 20 | 24 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 80 | 96 | 128;
export type AvatarKind = 'person' | 'organisation' | 'team' | 'bot';
export type AvatarStatus = 'verified' | 'approved' | 'declined' | 'warning';

export interface AvatarProps extends DataAttributes {
  /** Who or what it is, in full ("Ana Ruiz", "Contoso"). Gives the initials, the colour and the accessible name. */
  name: string;
  /** A picture. While it loads the initials show; if it fails they stay, so the avatar is never empty. */
  src?: string;
  /** `person` (default) is a circle; `organisation`, `team` and `bot` (any automated agent) are rounded squares, so people and the things they belong to never read the same. */
  kind?: AvatarKind;
  /** Pixels, from 16 (inline in text) to 128 (a profile editor). 24, 36, 44, 48, 56, 64 and 80 match the control sizes xs to xxl, so an avatar sits level with a control beside it. Default 32. */
  size?: AvatarSize;
  /** Override the initials, e.g. for a name whose initials aren't its first letters. */
  initials?: string;
  /** Override the colour, 1-8 (`color.category.*`). By default the name picks one, the same everywhere it appears. */
  category?: number;
  /** A person's availability, shown with Badge's presence shapes at the bottom-end corner. */
  presence?: Presence;
  /** A state on the avatar (verified, approved, declined, warning) at the same corner; it replaces presence. */
  status?: AvatarStatus;
  /** A count of new things for this person (unread messages), pinned to the top-end corner. */
  count?: number;
  /** Words for `count` ("3 unread messages"). Default "{count} new". */
  countLabel?: string;
  /** Something they're doing now ("Speaking", "Typing", "New story"): draws the activity ring and adds the words to the name. */
  activity?: string;
  /** The person is still loading: a placeholder of the same size and shape. */
  loading?: boolean;
  /** Hide it from assistive technology because the name is written right beside it (Persona, a list row). */
  decorative?: boolean;
  /** Makes it a button (open a profile card, change the photo); the name says what it opens. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Makes it a link to the person's or entity's page. */
  href?: string;
}

const presenceWords: Record<Presence, string> = { available: 'Available', busy: 'Busy', 'do-not-disturb': 'Do not disturb', away: 'Away', offline: 'Offline' };
const statusBadge: Record<AvatarStatus, { icon: IconName; tone: BadgeTone; words: string }> = {
  verified: { icon: 'check', tone: 'accent', words: 'Verified' },
  approved: { icon: 'check', tone: 'success', words: 'Approved' },
  declined: { icon: 'close', tone: 'danger', words: 'Declined' },
  warning: { icon: 'warning', tone: 'warning', words: 'Needs attention' },
};
const kindIcon: Record<AvatarKind, IconName> = { person: 'person', organisation: 'organisation', team: 'people', bot: 'bot' };

/** The same name always gets the same of the 8 category colours (a 32-bit FNV-1a hash of the trimmed, lower-cased name). */
export function avatarCategory(name: string): number {
  let h = 0x811c9dc5;
  for (const ch of name.trim().toLowerCase()) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 8) + 1;
}

/** Up to two initials from the first and last words; one at 16-20 px. Ignores bracketed parts and email domains; a name in a script without capitals (Chinese, Japanese, Korean) gives its first character. */
export function avatarInitials(name: string, max = 2): string {
  const clean = name.replace(/[([{].*?[)\]}]/g, ' ').replace(/@.*$/, '').trim();
  const words = clean.split(/[\s._-]+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (!words.length) return '';
  const first = (w: string) => [...w.replace(/^[^\p{L}\p{N}]+/u, '')][0] ?? '';
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(words[0])) return first(words[0]);
  const letters = words.length > 1 && max > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0]);
  return letters.toLocaleUpperCase();
}

/**
 * A person, organisation, team or bot as a picture, their initials or an icon, in one of 13 sizes. The picture falls
 * back to initials on a colour the name picks from the category set (the same colour wherever that name appears), then
 * to an icon for the kind. People are circles; organisations, teams and bots are rounded squares. Presence, a state
 * (verified, approved, declined, warning) and a count come through Badge, sized with the avatar; an activity ring
 * shows someone speaking or typing now. Many people: AvatarGroup; with their name beside it: Persona.
 * @tier fundamental
 * @family people
 * @a11y `role="img"` named by the name plus its presence, state, count and activity in words ("Ana Ruiz, Busy, 3 new");
 * the badges inside are not read again. `decorative` hides it when the name is written beside it. With `onClick` or
 * `href` it is a button or link with the same name and a focus ring outside the activity ring. The colour never
 * carries meaning: it only tells people apart, and the initials keep 4.5:1 on it in every context.
 */
export function Avatar({
  name,
  src,
  kind = 'person',
  size = 32,
  initials,
  category,
  presence,
  status,
  count,
  countLabel,
  activity,
  loading,
  decorative,
  onClick,
  href,
  ...data
}: AvatarProps) {
  // Keyed by the source, so a new picture starts over without an effect racing a cached image's load event.
  const [loaded, setLoaded] = useState<string>();
  const [failed, setFailed] = useState<string>();
  const shape = kind === 'person' ? 'circle' : 'square';
  const letters = initials ?? avatarInitials(name, size <= 20 ? 1 : 2);
  const cat = category && category >= 1 && category <= 8 ? Math.round(category) : avatarCategory(name);
  const badgeSize = size <= 40 ? 's' : size >= 96 ? 'l' : 'normal';
  const st = status ? statusBadge[status] : undefined;
  const words = [
    name,
    activity,
    st?.words ?? (presence ? presenceWords[presence] : undefined),
    count && count > 0 ? countLabel ?? `${count} new` : undefined,
  ].filter(Boolean).join(', ');

  let shown = (
    <span data-dl-part="face" data-category={loading ? undefined : String(cat)} data-activity={activity ? '' : undefined}>
      {loading ? (
        <Skeleton shape="block" />
      ) : (
        <>
          {letters ? <span data-dl-part="initials">{letters}</span> : <Icon name={kindIcon[kind]} />}
          {src && failed !== src && (
            <img
              src={src}
              alt=""
              data-loaded={loaded === src ? '' : undefined}
              onLoad={() => setLoaded(src)}
              onError={() => setFailed(src)}
            />
          )}
        </>
      )}
    </span>
  );
  const overlap = shape === 'circle' ? 'round' : 'square';
  if (!loading && st) shown = <Badge kind="icon" icon={st.icon} tone={st.tone} size={badgeSize} label={st.words} overlap={overlap} anchor={shown} />;
  else if (!loading && presence) shown = <Badge kind="presence" presence={presence} size={badgeSize} label={presenceWords[presence]} overlap={overlap} anchor={shown} />;
  if (!loading && count && count > 0) shown = <Badge kind="count" count={count} size="s" label={countLabel ?? `${count} new`} overlap={overlap} anchor={shown} />;

  const common = { ...data, 'data-dl': 'avatar', 'data-size': String(size), 'data-shape': shape, 'data-kind': kind, 'aria-busy': loading || undefined };
  if (href) return <a {...common} href={href} aria-label={words}>{shown}</a>;
  if (onClick) return <button {...common} type="button" onClick={onClick} aria-label={words}>{shown}</button>;
  return (
    <span {...common} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': words })}>
      {shown}
    </span>
  );
}
