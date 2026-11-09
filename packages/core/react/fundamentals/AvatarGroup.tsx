import { useEffect, useRef, useState } from 'react';
import { usePopup } from '../behaviour/popup';
import { Avatar, type AvatarKind, type AvatarSize } from './Avatar';
import type { Presence } from './Badge';
import { Persona } from './Persona';
import type { DataAttributes } from '../types';

export interface AvatarGroupMember {
  name: string;
  src?: string;
  kind?: AvatarKind;
  presence?: Presence;
  /** A line under the name in the "+n" list: a role or a team. */
  secondary?: string;
}

export interface AvatarGroupProps extends DataAttributes {
  /** Who is in the group (assignees, collaborators, attendees), in a meaningful order: the first ones show. */
  members: AvatarGroupMember[];
  /** What the group is, for assistive technology and the "+n" list's title: "Assignees", "In this document". */
  label: string;
  /** How many avatars show before "+n". The "+n" counts as one of them, so the group never grows past `max`. Default 4. */
  max?: number;
  /** `stack` (default): overlapping with a surface-coloured cut, for tight rows. `spread`: side by side, when each face should be easy to pick out. */
  layout?: 'stack' | 'spread';
  /** 16 to 64 px; default 32. */
  size?: Extract<AvatarSize, 16 | 20 | 24 | 32 | 36 | 40 | 44 | 48 | 56 | 64>;
  /** Show each member's presence on their avatar (from 24 px). */
  showPresence?: boolean;
}

/**
 * Several people or teams in one row: overlapping (stack) or side by side (spread), at most `max` faces, the rest
 * behind a "+n" button that lists everyone hidden with their name and role. Built from Avatar and Persona.
 * @tier fundamental
 * @family people
 * @a11y A `group` named by `label`; each avatar is an image named by the person; "+n" is a button named "Show 3 more"
 * that opens a dialog listing them (Escape or a press outside closes it and focus returns to the button).
 * @key Enter or Space on "+n": opens the list
 * @key Escape in the list: closes it
 */
export function AvatarGroup({ members, label, max = 4, layout = 'stack', size = 32, showPresence, ...data }: AvatarGroupProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const close = (focus: boolean) => {
    setOpen(false);
    if (focus) more.current?.focus();
  };
  usePopup(open, more, popup, root, () => close(false));
  useEffect(() => {
    if (open) popup.current?.focus();
  }, [open]);
  const limit = Math.max(1, max);
  const shown = members.length > limit ? members.slice(0, limit - 1) : members;
  const hidden = members.slice(shown.length);
  return (
    <span {...data} ref={root} data-dl="avatar-group" data-layout={layout} data-size={String(size)} role="group" aria-label={label}>
      {shown.map((m, i) => (
        <span key={`${m.name}-${i}`} data-dl-part="item" data-shape={!m.kind || m.kind === 'person' ? 'circle' : 'square'}>
          <Avatar name={m.name} src={m.src} kind={m.kind} size={size} presence={showPresence && size >= 24 ? m.presence : undefined} />
        </span>
      ))}
      {hidden.length > 0 && (
        <span data-dl-part="item" data-shape="circle">
          <button
            ref={more}
            type="button"
            data-dl-part="more"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={`Show ${hidden.length} more`}
            onClick={() => (open ? close(false) : setOpen(true))}
          >
            +{hidden.length}
          </button>
        </span>
      )}
      {hidden.length > 0 && (
        <div
          ref={popup}
          data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3"
          popover="manual"
          hidden={!open}
          role="dialog"
          tabIndex={-1}
          aria-label={`${label}: ${hidden.length} more`}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            close(true);
          }}
        >
          {open && (
            <ul data-dl-part="list">
              {hidden.map((m, i) => (
                <li key={`${m.name}-${i}`}>
                  <Persona name={m.name} src={m.src} kind={m.kind} presence={m.presence} secondary={m.secondary} size={32} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </span>
  );
}
