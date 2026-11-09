import type { ReactNode } from 'react';
import { Avatar, type AvatarKind, type AvatarSize, type AvatarStatus } from './Avatar';
import type { Presence } from './Badge';
import { MenuButton } from './MenuButton';
import { Skeleton } from './Skeleton';
import type { DataAttributes } from '../types';

const presenceWords: Record<Presence, string> = { available: 'Available', busy: 'Busy', 'do-not-disturb': 'Do not disturb', away: 'Away', offline: 'Offline' };

export interface PersonaProps extends DataAttributes {
  /** The person's or entity's name, written beside the avatar. */
  name: ReactNode;
  /** The name as plain words, when `name` isn't a string (for the initials, colour and accessible name). */
  nameText?: string;
  /** One line under the name: a role, a team, an email or a status message. Shown from 32 px. */
  secondary?: ReactNode;
  /** A third line (a location, a local time, last seen). Shown from 56 px. */
  tertiary?: ReactNode;
  src?: string;
  kind?: AvatarKind;
  presence?: Presence;
  status?: AvatarStatus;
  activity?: string;
  /** The avatar's size; the type grows with it. 24 for a single line in tables and chips, 32 or 40 in lists, 56+ in cards and profile headers. Default 40. */
  size?: AvatarSize;
  /** `after` (default) beside the avatar; `below` centred under it, for people grids and profile cards. */
  textPosition?: 'after' | 'below';
  /** The person may change their own picture: an "Edit photo" menu with Upload a photo and, when there is one, Remove photo. */
  onPhotoChange?: () => void;
  onPhotoRemove?: () => void;
  /** Still loading: the avatar placeholder and text lines of the same shape. */
  loading?: boolean;
}

/**
 * An avatar with the name beside or under it, and up to two more lines (role, status, location). The avatar is hidden
 * from assistive technology because the name is written next to it; its presence, state and activity are read after
 * the name instead. Used in list rows, people pickers, comments and profile cards; a person's own profile can offer an
 * Edit photo menu.
 * @tier fundamental
 * @family people
 * @a11y The name and lines are plain text in reading order; presence, state and activity follow the name as hidden
 * words ("Ana Ruiz, Busy"). The Edit photo menu is a MenuButton (APG menu button). Never a link or button as a whole:
 * put it in a ListItem or a Link for that.
 */
export function Persona({
  name,
  nameText,
  secondary,
  tertiary,
  src,
  kind,
  presence,
  status,
  activity,
  size = 40,
  textPosition = 'after',
  onPhotoChange,
  onPhotoRemove,
  loading,
  ...data
}: PersonaProps) {
  const plain = nameText ?? (typeof name === 'string' ? name : '');
  const extra = [activity, status ? { verified: 'Verified', approved: 'Approved', declined: 'Declined', warning: 'Needs attention' }[status] : presence ? presenceWords[presence] : undefined].filter(Boolean).join(', ');
  const lines = size >= 56 ? 3 : size >= 32 ? 2 : 1;
  const editable = onPhotoChange || onPhotoRemove;
  return (
    <span {...data} data-dl="persona" data-size={String(size)} data-text={textPosition} aria-busy={loading || undefined}>
      <Avatar name={plain} src={src} kind={kind} presence={presence} status={status} activity={activity} size={size} loading={loading} decorative />
      <span data-dl-part="text">
        {loading ? (
          <span data-dl-part="placeholder">
            <Skeleton lines={lines > 1 ? 2 : 1} />
          </span>
        ) : (
          <>
            <span data-dl-part="name">
              {name}
              {extra && <span data-dl-part="announce">, {extra}</span>}
            </span>
            {lines > 1 && secondary && <span data-dl-part="secondary">{secondary}</span>}
            {lines > 2 && tertiary && <span data-dl-part="tertiary">{tertiary}</span>}
          </>
        )}
        {editable && !loading && (
          <span data-dl-part="edit">
            <MenuButton
              label="Edit photo"
              menuLabel={`Photo for ${plain}`}
              size="s"
              items={[
                ...(onPhotoChange ? [{ value: 'change', label: src ? 'Upload a new photo' : 'Upload a photo' }] : []),
                ...(onPhotoRemove && src ? [{ value: 'remove', label: 'Remove photo', description: 'Your initials show instead' }] : []),
              ]}
              onSelect={(v) => (v === 'change' ? onPhotoChange?.() : onPhotoRemove?.())}
            />
          </span>
        )}
      </span>
    </span>
  );
}
