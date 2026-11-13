import { useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { Icon } from './Icon';
import { useRouter } from '../behaviour/router';
import { Progress } from './Progress';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export type ListItemRole = 'option' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'listitem' | 'button' | 'row';

export interface ListItemProps extends DataAttributes {
  /**
   * The item's role in its list: `option` in a Select's listbox; `menuitem` for an action in a MenuButton's menu;
   * `menuitemcheckbox` for an on/off setting kept in a menu; `menuitemradio` for one choice of a group in a menu;
   * `listitem` for an item of a static list, which isn't itself chosen and may hold a control in `trailing`;
   * `button` for an action in an action list on the page (its own Tab stop; Enter or Space runs it); `row` for a row of a
   * grid list, whose words, meta and trailing controls are its cells.
   */
  role: ListItemRole;
  /** The item's name, in sentence case. */
  label: string;
  /** Supporting words under the name: what choosing it does or gives. Wraps to at most two lines. */
  description?: string;
  /** `block` (default) puts the description under the name; `inline` beside it, for a short qualifier ("main", "@asha"). */
  descriptionPosition?: 'block' | 'inline';
  /** `s` 32 px for dense desktop menus (44 px on a coarse pointer), `normal` 44 px, `l` 56 px for avatars and pictures. Default `normal`. */
  size?: 's' | 'normal' | 'l';
  /**
   * `row` (default) lays the item out in a line. `tile` stacks the icon above the name and the description in a
   * control's surface, for a catalogue of things to add (ActionList `layout="tiles"` sets it). An action only.
   */
  layout?: 'row' | 'tile';
  /** Leading icon from the active set. */
  icon?: IconName;
  /** Keep the icon column empty so this item's words line up with siblings that have icons. */
  inset?: boolean;
  /** A person or team: a round picture, or the initials of `name` when there's no picture. Decorative: the label names it. */
  avatar?: { name: string; src?: string };
  /** A lazy square picture of the item. On failure its fixed slot shows `icon`, or the image icon. Decorative: the label names it. */
  thumbnail?: string;
  /** Up to four #rrggbb colours shown as a strip before the name, for items that are palettes. Decorative. */
  preview?: string[];
  /** Short trailing words or a number: a count, a state, a time. Never a second name. */
  meta?: string;
  /**
   * One line, whatever the width: the name and the meta each end in an ellipsis when there isn't room, the meta
   * giving way first (it shrinks ten times faster) and sitting at the end. For dense result lists where every row
   * must keep one height. The full words stay in the item for assistive technology. Off by default: words wrap.
   */
  truncate?: boolean;
  /** The keys that do the same thing, as the platform writes them (e.g. "Ctrl+C"). Sets `aria-keyshortcuts`. */
  shortcut?: string;
  /** Opens a submenu: shows the chevron and sets `aria-haspopup`. A `menuitem` only. */
  submenu?: boolean;
  /** Opens a deeper level in place (a settings page, a folder): shows the trailing chevron. A `button` only; the label names where it goes. */
  drillIn?: boolean;
  /** `danger` for an action that destroys or can't be undone (Delete, Remove). The word says it; colour adds to it. */
  tone?: 'danger';
  /** For an option: it's chosen (`aria-selected`). For a menu checkbox or radio: it's on (`aria-checked`). */
  selected?: boolean;
  /** For an option in a listbox that allows several: shows a check box at the start instead of the trailing check. */
  multiple?: boolean;
  /** For a single-choice option: how its chosen state shows. `check` (default) the trailing check over the fill; `fill` the fill alone, for a list whose chosen row is where you are (a form's sections), where what shows beside it already says so. */
  mark?: 'check' | 'fill';
  /** The keyboard is on it while focus stays on the control (`aria-activedescendant`); shows the focus ring. */
  active?: boolean;
  /** Proxy focus from aria-activedescendant: the existing ring, or the same mild fill as hover. Native focus keeps its ring. */
  activeAppearance?: 'ring' | 'tint';
  /** Reserve a trailing chevron that shows only on the active item: a non-border cue when a mild tint alone lacks 3:1 contrast. */
  activeIndicator?: boolean;
  /** Shown but can't be chosen now (`aria-disabled`); the keyboard skips it. Use when the reason is obvious. */
  disabled?: boolean;
  /** Looks unavailable, but the keyboard still reaches it so its reason (the description) is read: an outage, a missing permission. */
  inactive?: boolean;
  /** Its action is running: the compact Progress replaces the leading visual and `aria-busy` is set; the label stays. */
  busy?: boolean;
  /** Not read yet: a heavier name and a dot, with "Unread" for assistive technology. */
  unread?: boolean;
  /** For an item that shows or hides child items: the chevron turns and `aria-expanded` is set. The list renders the children. */
  expanded?: boolean;
  /** A trailing element: a Badge; for a `listitem` also an icon-only Button (remove, more). Never a control inside an option or menu item. */
  trailing?: ReactNode;
  /** Needed for `aria-activedescendant`. */
  id?: string;
  /**
   * Goes somewhere: the item renders as a real link (`a[href]`) that keeps its role, so middle-click, Ctrl or Cmd-click,
   * "Open link in new tab" and "Copy link address" work on a menu item, an option or an action. Inside the core
   * `Router` it goes through `router.href()`, as Button with `href` does. Unavailable or busy, the href is left off.
   * With it, `onClick` and `itemRef` receive the anchor; call `event.preventDefault()` to take a plain click over.
   */
  href?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  /** For a `row`: the one row the Tab key reaches (the grid list moves it with the arrows). */
  tabbable?: boolean;
  /** Receives the element, for a list that moves focus between its items. */
  itemRef?: (el: HTMLDivElement | null) => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

function Thumbnail({ src, icon }: { src: string; icon?: IconName }) {
  const [failed, setFailed] = useState(false);
  return (
    <span data-dl-part="item-thumbnail" aria-hidden="true">
      {failed ? <Icon name={icon ?? 'image'} /> : <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />}
    </span>
  );
}

/**
 * One item of a list a person chooses from: a menu's action, a menu's checkbox or radio, or a listbox's option. The one
 * list item every popup list uses, so menus and selects look and behave alike: the same heights, padding, hover, focus,
 * selected and unavailable states, leading slot (icon, avatar, picture, palette or selection mark) and trailing slot
 * (meta, shortcut, submenu chevron or check).
 * Not for navigation (use Navigation) or rows of data (use RowList).
 * Added on the owner's direction (F10, 2026-11-07): "Dropdown list should be custom list using the same list item
 * component." Made exhaustive in F15.8 (Q28, Q42).
 * @tier fundamental
 * @family selection
 * @a11y A `div` with the list's role, never focusable by Tab: a menu moves focus onto it, a listbox points at it with
 * `aria-activedescendant` and `active` draws the focus ring, or the hover tint with `activeAppearance="tint"`.
 * Add `activeIndicator` when that mild fill alone lacks 3:1 contrast: its fixed-slot trailing chevron uses the text
 * token; verify that cue against the actual surface. Native focus still draws its ring. Chosen and on are carried by `aria-selected` or
 * `aria-checked` and a mark (check, box or dot), never colour alone. A shortcut sets `aria-keyshortcuts`; a submenu sets
 * `aria-haspopup="menu"`. Size s is a written target exception (32 px, above the 24 px minimum) that returns to 44 px on
 * a coarse pointer. The fills reach the item's edges and never touch a neighbour's: the list owns a gap between items.
 * A `row` (a grid list) has its words, meta and trailing controls as `gridcell`s; the list moves focus.
 * A `button` (an on-page action list) is its own Tab stop and runs on Enter or Space; `drillIn` adds the chevron.
 * A `listitem` is static: no Tab stop, no hover; a control in its `trailing` slot is its own Tab stop. `inactive` stays
 * reachable so its reason is read; `busy` sets `aria-busy`; unread adds ", unread" to the name for assistive technology.
 * With `href` it is an `a[href]` with the same role, look, focus and keyboard: the browser's link menu and middle-click
 * work, and Enter follows it.
 */
export function ListItem({
  role,
  label,
  description,
  descriptionPosition = 'block',
  size = 'normal',
  layout = 'row',
  icon,
  inset,
  avatar,
  thumbnail,
  preview,
  meta,
  truncate,
  shortcut,
  submenu,
  drillIn,
  tone,
  selected,
  multiple,
  mark = 'check',
  active,
  activeAppearance = 'ring',
  activeIndicator = false,
  disabled,
  inactive,
  busy,
  unread,
  expanded,
  trailing,
  id,
  href,
  onClick,
  tabbable,
  itemRef,
  ...data
}: ListItemProps) {
  const checkable = role === 'menuitemcheckbox' || role === 'menuitemradio';
  const leadingMark = checkable || ((role === 'option' || role === 'row') && multiple);
  const cell = role === 'row' ? 'gridcell' : undefined;
  const unavailable = disabled || inactive;
  const router = useRouter();
  const Tag = href === undefined ? 'div' : 'a';
  const activate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!unavailable && !busy) event.currentTarget.click();
  };
  const visual = busy ? (
    <span data-dl-part="item-busy"><Progress /></span>
  ) : avatar ? (
    <span data-dl-part="item-avatar" aria-hidden="true">
      {avatar.src ? <img src={avatar.src} alt="" /> : initials(avatar.name)}
    </span>
  ) : thumbnail ? (
    <Thumbnail key={thumbnail} src={thumbnail} icon={icon} />
  ) : icon ? (
    <Icon name={icon} />
  ) : (
    inset && <span data-dl-part="item-inset" aria-hidden="true" />
  );
  return (
    <Tag
      {...data}
      ref={itemRef as (el: HTMLElement | null) => void}
      id={id}
      href={href === undefined || unavailable || busy ? undefined : router ? router.href(href) : href}
      role={role}
      tabIndex={role === 'listitem' ? undefined : role === 'row' ? (tabbable ? 0 : -1) : role === 'button' && !(disabled && !inactive) ? 0 : -1}
      data-dl="list-item"
      data-size={size === 'normal' ? undefined : size}
      data-layout={layout === 'tile' ? 'tile' : undefined}
      data-tone={tone}
      data-active={active ? '' : undefined}
      data-active-appearance={activeAppearance === 'tint' ? 'tint' : undefined}
      data-inactive={inactive ? '' : undefined}
      data-unread={unread ? '' : undefined}
      data-truncate={truncate ? '' : undefined}
      data-description={description && descriptionPosition === 'inline' ? 'inline' : undefined}
      aria-selected={role === 'option' ? !!selected : role === 'row' && selected !== undefined ? selected : undefined}
      aria-checked={checkable ? !!selected : undefined}
      aria-disabled={unavailable || busy || undefined}
      aria-busy={busy || undefined}
      aria-expanded={expanded === undefined ? undefined : expanded}
      aria-keyshortcuts={shortcut}
      aria-haspopup={submenu && role === 'menuitem' ? 'menu' : undefined}
      onClick={(unavailable || busy ? undefined : onClick) as ((event: MouseEvent<HTMLElement>) => void) | undefined}
      onKeyDown={(role === 'button' ? activate : undefined) as ((event: KeyboardEvent<HTMLElement>) => void) | undefined}
    >
      {leadingMark && (
        <span
          data-dl-part="item-mark"
          data-kind={role === 'menuitemradio' ? 'radio' : role === 'option' || role === 'row' ? 'box' : 'check'}
          data-on={selected ? '' : undefined}
          aria-hidden="true"
        >
          {selected && role !== 'menuitemradio' && <Icon name="check" />}
        </span>
      )}
      {preview && (
        <span data-dl-part="item-palette" aria-hidden="true">
          {preview.slice(0, 4).map((hex, n) => (
            <span key={n} style={{ '--list-item-preview': hex } as CSSProperties} />
          ))}
        </span>
      )}
      {visual}
      <span data-dl-part="item-words" role={cell}>
        <span data-dl-part="item-name">
          {label}
          {unread && <span data-dl-part="item-announce">, unread</span>}
        </span>
        {description && <span data-dl-part="item-description">{description}</span>}
      </span>
      {activeIndicator && (
        <span data-dl-part="item-active" data-on={active ? '' : undefined} aria-hidden="true">
          <Icon name="chevron-end" />
        </span>
      )}
      {unread && <span data-dl-part="item-unread" aria-hidden="true" />}
      {meta && (
        <span data-dl-part="item-meta" role={cell}>
          {meta}
        </span>
      )}
      {shortcut && (
        <kbd data-dl-part="item-shortcut" aria-hidden="true">
          {shortcut}
        </kbd>
      )}
      {trailing && (
        <span data-dl-part="item-trailing" role={cell}>
          {trailing}
        </span>
      )}
      {expanded !== undefined && (
        <span data-dl-part="item-disclosure" aria-hidden="true">
          <Icon name="chevron-down" />
        </span>
      )}
      {((submenu && role === 'menuitem') || (drillIn && role === 'button')) && (
        <span data-dl-part="item-submenu" aria-hidden="true">
          <Icon name="chevron-end" />
        </span>
      )}
      {role === 'option' && !multiple && mark === 'check' && <span data-dl-part="item-check">{selected && <Icon name="check" />}</span>}
    </Tag>
  );
}
