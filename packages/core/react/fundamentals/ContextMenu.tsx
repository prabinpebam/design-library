import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { placePopup } from '../behaviour/popup';
import { ListItem } from './ListItem';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface ContextMenuItem {
  /** What `onSelect` receives. Unused on an item that opens a submenu. */
  value: string;
  /** The command, in sentence case: "Duplicate", "Wrap in". */
  label: string;
  icon?: IconName;
  /** The command's key, shown at the item's end and announced ("Ctrl+D"). Shown only: the consumer binds it. */
  shortcut?: string;
  /** Can't be chosen here; it stays in its place so the menu doesn't change shape. */
  disabled?: boolean;
  /** A destructive command (Delete). */
  tone?: 'danger';
  /** One level of commands under this one (a submenu, e.g. Wrap in: Div block, Link block). No deeper nesting. */
  items?: Omit<ContextMenuItem, 'items'>[];
}

export interface ContextMenuGroup {
  id: string;
  /** Names the group for assistive technology ("Edit", "Arrange"); not shown. */
  label?: string;
  items: ContextMenuItem[];
}

export interface ContextMenuProps extends DataAttributes {
  /** The menu's accessible name: what it acts on, e.g. "Hero section". */
  label: string;
  /** The commands in their groups, in a meaningful order; a hairline separates the groups. */
  groups: ContextMenuGroup[];
  /** Where it opens, in viewport px (a pointer's `clientX`/`clientY`, or `contextMenuPoint(el)` from the keyboard). Open while set. */
  at?: { x: number; y: number } | null;
  /** The chosen command. The menu then closes (`onClose`) and focus returns to where it was. */
  onSelect: (value: string) => void;
  /** Escape, Tab, a choice, a press outside, or the window scrolling or resizing: clear `at`. */
  onClose: () => void;
}

/** Where a menu opened from the keyboard (Shift+F10, the Menu key) goes: the element's start, just under its top edge. */
export function contextMenuPoint(el: Element) {
  const r = el.getBoundingClientRect();
  const rtl = getComputedStyle(el).direction === 'rtl';
  return { x: rtl ? r.right : r.left, y: Math.min(r.bottom, r.top + 24) };
}

type Flat = { item: ContextMenuItem; key: string };

/**
 * A menu of commands opened at a point on something (a right-click, Shift+F10 or the Menu key), as design tools do:
 * its commands in groups, each with its key shown, some unavailable, and at most one level of submenu (Wrap in). Not
 * for a button's own menu (MenuButton) or a value that stays chosen (Select). Opening it never moves anything; it acts
 * only through `onSelect`.
 * @tier fundamental
 * @family buttons
 * @a11y The WAI-ARIA APG menu: `role="menu"` named by `label`, groups as `role="group"`, each command the one popup
 * ListItem (`menuitem`, `aria-keyshortcuts` from its shortcut, `aria-disabled`, `aria-haspopup` on a submenu). It opens
 * in the top layer at the point, inside the window; focus moves to its first available command and returns to where it
 * was on Escape or a choice. Unavailable commands are skipped by the arrow keys but stay readable.
 * @key Arrow down, Arrow up: next or previous available command, wrapping
 * @key Home, End: first or last available command
 * @key A letter: next command whose name starts with it
 * @key Enter or Space: chooses the command; on a submenu, opens it at its first command
 * @key Arrow right on a submenu command: opens it; Arrow left or Escape in the submenu: closes it, back to its command
 * @key Escape: closes the menu and returns focus; Tab closes it and moves on
 */
export function ContextMenu({ label, groups, at, onSelect, onClose, ...data }: ContextMenuProps) {
  const id = useId();
  const open = !!at;
  const menu = useRef<HTMLDivElement>(null);
  const sub = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<string, HTMLDivElement | null>());
  const subRefs = useRef<(HTMLDivElement | null)[]>([]);
  const back = useRef<HTMLElement | null>(null);
  const [subOf, setSubOf] = useState<string>();
  const [subFocus, setSubFocus] = useState(false);

  const flat: Flat[] = groups.flatMap((group) => group.items.map((item) => ({ item, key: `${group.id}:${item.value}` })));
  const usable = flat.filter((one) => !one.item.disabled);
  const subItems = flat.find((one) => one.key === subOf)?.item.items ?? [];

  const finish = (returnFocus: boolean) => {
    setSubOf(undefined);
    onClose();
    if (returnFocus) back.current?.focus?.();
  };

  // Open: remember the focus, show at the point (inside the window), focus the first available command.
  useLayoutEffect(() => {
    const el = menu.current;
    if (!open || !el || !at) return;
    back.current = (document.activeElement as HTMLElement | null) ?? null;
    el.showPopover?.();
    const doc = document.documentElement;
    const p = placePopup({ top: at.y, bottom: at.y, left: at.x, right: at.x }, { width: el.offsetWidth, height: el.offsetHeight }, { width: doc.clientWidth, height: doc.clientHeight });
    el.dataset.placement = p.placement;
    el.style.setProperty('--popup-edge', `${p.edge}px`);
    el.style.setProperty('--popup-start', `${p.start}px`);
    el.style.setProperty('--popup-room', `${p.room}px`);
    refs.current.get(usable[0]?.key ?? '')?.focus();
    return () => {
      if (el.matches(':popover-open')) el.hidePopover?.();
    };
  }, [open, at?.x, at?.y]);

  // A press outside, or the page moving under it, closes it.
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !sub.current?.contains(t)) finish(false);
    };
    const away = () => finish(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', away, { capture: true, passive: true });
    window.addEventListener('resize', away);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', away, { capture: true });
      window.removeEventListener('resize', away);
    };
  }, [open]);

  // The submenu: beside its command (the other side when there's no room), inside the window.
  useLayoutEffect(() => {
    const el = sub.current;
    const parent = subOf ? refs.current.get(subOf) : null;
    if (!el || !parent || !subItems.length) return;
    el.showPopover?.();
    const r = parent.getBoundingClientRect();
    const doc = document.documentElement;
    const rtl = getComputedStyle(parent).direction === 'rtl';
    const fitsAfter = rtl ? r.left - el.offsetWidth >= 0 : r.right + el.offsetWidth <= doc.clientWidth;
    const x = rtl ? (fitsAfter ? doc.clientWidth - r.left : doc.clientWidth - r.right - el.offsetWidth) : fitsAfter ? r.right : Math.max(0, r.left - el.offsetWidth);
    const top = Math.max(0, Math.min(r.top, doc.clientHeight - el.offsetHeight));
    el.dataset.placement = 'below';
    el.style.setProperty('--popup-edge', `${top}px`);
    el.style.setProperty('--popup-start', `${x}px`);
    el.style.setProperty('--popup-room', `${doc.clientHeight - top}px`);
    if (subFocus) subRefs.current.find((one, n) => one && !subItems[n]?.disabled)?.focus();
    return () => {
      if (el.matches(':popover-open')) el.hidePopover?.();
    };
  }, [subOf, subFocus]);

  const openSub = (key: string, focus: boolean) => {
    setSubFocus(focus);
    setSubOf(key);
  };
  const choose = (item: ContextMenuItem, key: string) => {
    if (item.disabled) return;
    if (item.items?.length) return openSub(key, true);
    finish(true);
    onSelect(item.value);
  };

  const move = (list: { key: string; label: string }[], current: number, e: KeyboardEvent, focus: (n: number) => void) => {
    const n = list.length;
    if (!n) return false;
    if (e.key === 'ArrowDown') focus((current + 1 + n) % n);
    else if (e.key === 'ArrowUp') focus((current - 1 + n) % n);
    else if (e.key === 'Home') focus(0);
    else if (e.key === 'End') focus(n - 1);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const next = list.map((_, i) => (current + 1 + i) % n).find((i) => list[i].label.toLowerCase().startsWith(k));
      if (next !== undefined) focus(next);
    } else return false;
    return true;
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = usable.findIndex((one) => refs.current.get(one.key) === document.activeElement);
    const here = usable[current];
    if (move(usable.map((one) => ({ key: one.key, label: one.item.label })), current, e, (n) => refs.current.get(usable[n].key)?.focus())) {
      setSubOf(undefined);
    } else if (e.key === 'ArrowRight' && here?.item.items?.length) openSub(here.key, true);
    else if ((e.key === 'Enter' || e.key === ' ') && here) choose(here.item, here.key);
    else if (e.key === 'Escape') finish(true);
    else if (e.key === 'Tab') return finish(false);
    else return;
    e.preventDefault();
  };

  const onSubKey = (e: KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const avail = subItems.map((item, n) => ({ item, n })).filter((one) => !one.item.disabled);
    const current = avail.findIndex((one) => subRefs.current[one.n] === document.activeElement);
    const parentKey = subOf;
    const backToParent = () => {
      setSubOf(undefined);
      if (parentKey) refs.current.get(parentKey)?.focus();
    };
    if (move(avail.map((one) => ({ key: String(one.n), label: one.item.label })), current, e, (n) => subRefs.current[avail[n].n]?.focus())) {
      // moved
    } else if (e.key === 'ArrowLeft' || e.key === 'Escape') backToParent();
    else if ((e.key === 'Enter' || e.key === ' ') && avail[current]) {
      finish(true);
      onSelect(avail[current].item.value);
    } else if (e.key === 'Tab') return finish(false);
    else return;
    e.preventDefault();
  };

  if (!open) return null;
  return (
    <div {...data} data-dl="context-menu">
      <div ref={menu} data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3" popover="manual" onKeyDown={onMenuKey}>
        <div data-dl-part="content" id={`${id}-menu`} role="menu" aria-label={label} onPointerOver={(e) => {
          // Pointing at a command opens its submenu (without moving focus) or closes another's.
          const el = (e.target as Element).closest("[data-dl='list-item']");
          const key = [...refs.current].find(([, one]) => one === el)?.[0];
          if (!key || key === subOf) return;
          const item = flat.find((one) => one.key === key)?.item;
          if (item?.items?.length && !item.disabled) openSub(key, false);
          else setSubOf(undefined);
        }}>
          {groups.map((group) => (
            <div key={group.id} data-dl-part="group" role="group" aria-label={group.label}>
              {group.items.map((item) => {
                const key = `${group.id}:${item.value}`;
                const hasSub = !!item.items?.length;
                return (
                  <ListItem
                    key={key}
                    role="menuitem"
                    size="s"
                    label={item.label}
                    icon={item.icon}
                    inset={!item.icon}
                    shortcut={item.shortcut}
                    submenu={hasSub}
                    disabled={item.disabled}
                    tone={item.tone}
                    itemRef={(el) => {
                      refs.current.set(key, el);
                    }}
                    onClick={() => choose(item, key)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {subOf && subItems.length > 0 && (
        <div ref={sub} data-dl-part="popup" data-submenu="" data-presence="popup" data-material="floating" data-elevation="3" popover="manual" onKeyDown={onSubKey}>
          <div data-dl-part="content" role="menu" aria-label={flat.find((one) => one.key === subOf)?.item.label}>
            {subItems.map((item, n) => (
              <ListItem
                key={item.value}
                role="menuitem"
                size="s"
                label={item.label}
                icon={item.icon}
                inset={!item.icon}
                shortcut={item.shortcut}
                disabled={item.disabled}
                tone={item.tone}
                itemRef={(el) => {
                  subRefs.current[n] = el;
                }}
                onClick={() => {
                  if (item.disabled) return;
                  finish(true);
                  onSelect(item.value);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
