import type { ButtonSize } from './Button';
import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { usePopup, type ListWidth } from '../behaviour/popup';
import { useOverlayScroll } from '../behaviour/scroll';
import { Flag, flagSrc, type FlagCode } from './Flag';
import { Icon } from './Icon';
import { Progress } from './Progress';
import { ListItem } from './ListItem';
import { useHint } from './Tooltip';
import type { IconName } from '../../icons/icons';
import type { DataAttributes } from '../types';

export interface MenuButtonItem {
  /** What `onSelect` receives. */
  value: string;
  /** The item's name, in sentence case. */
  label: string;
  /** One short line under the name: what choosing it does or gives. */
  description?: string;
  /** Up to four #rrggbb colours shown as a strip before the name, for items that are palettes. Decorative: the words carry the item. */
  /** A country's flag before the name. Decorative. */
  flag?: FlagCode;
  preview?: string[];
  /** A leading icon from the active set, for menus whose items are kinds of thing to make or do. */
  icon?: IconName;
  /** Sets `icon` on a round plate, neutral or tinted by a category 1-8 (ListItem `plate`). Decorative. */
  plate?: 'neutral' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** `danger` for an item that destroys something (Delete). Its words carry the meaning; the colour repeats it. */
  tone?: 'danger';
  /** Starts a new group: a hairline across the menu sits above it. */
  startsGroup?: boolean;
  /** A submenu: the item shows a chevron and opens these choices beside it instead of being chosen. One level only. */
  items?: Omit<MenuButtonItem, 'items'>[];
}

export interface MenuButtonProps extends DataAttributes {
  /** The button's words: what the menu offers, e.g. "Presets". */
  label: string;
  /** Leading icon from the active set. */
  icon?: IconName;
  /** A country's flag before the words, e.g. the chosen dialling code's. Decorative. */
  flag?: FlagCode;
  /** The actions or choices, in a meaningful order. */
  items: MenuButtonItem[];
  /** The chosen item. The menu closes and focus returns to the button. */
  onSelect: (value: string) => void;
  /** The menu's accessible name when it differs from `label`, e.g. "Brand colour presets". */
  menuLabel?: string;
  /** The Button size scale: `normal` (44 px) by default; `s` (36 px) on dense surfaces (O41); xs 24 to xxl 80 px. */
  size?: ButtonSize;
  /** The menu can't open here. Prefer saying why nearby. */
  disabled?: boolean;
  /** As Button: `default` outlined, `primary` for the one main action in a view (a split button's menu half matches its action), `quiet` in toolbars. */
  emphasis?: 'primary' | 'default' | 'quiet';
  /** Shows only the icon (`chevron-down` when none is given); `label` becomes its accessible name and tooltip. Square at every size; the menu half of a split button. */
  iconOnly?: boolean;
  /** `inherit`: a quiet trigger takes its surroundings' text colour, as Button's `tone`, on a coloured rail or toolbar. */
  tone?: 'inherit';
  /** Something the menu started is still running (applying a preset, exporting): a spinner takes the icon's place, the menu won't open and presses are ignored until false. */
  busy?: boolean;
  /** Present tense while `busy`, e.g. "Applying…"; the label stays when left out. */
  pendingLabel?: string;
  /** Pins the menu to one width step (Q130, docs/widths.md). Leave out to fit the items, snapped up to `xs`, `sm` or
   * `md`. Pin only so menus that sit together (one toolbar) match, or when the items change while it's open. */
  listWidth?: ListWidth;
}

/**
 * A button that opens a short menu of actions or starting points, such as presets. One trigger, one list, nested once.
 * Not for a value that stays chosen and shows in the control (use Select or SegmentedControl), for navigation (use
 * Navigation or Link), or for one action (use Button). Added for the Colour page's brand presets (owner, F7d, 2026-11-07).
 * @tier fundamental
 * @family buttons
 * @a11y The WAI-ARIA APG menu button: a native `button` with `aria-haspopup="menu"` and `aria-expanded`, controlling a
 * `role="menu"` of `menuitem` ListItems named by `menuLabel`. Opening moves focus into the menu; choosing, Escape or a
 * click outside closes it and returns focus to the button; Tab closes it and moves on. The menu opens in the top layer
 * (the shared popup rule: under the button, flipping above near the window's end, never clipped) and its items are the one
 * ListItem every popup list uses. A 44 px target from `normal` (36 px at `s`, 24 px at `xs`, dense exceptions). Busy keeps the same focused
 * trigger, locked with `aria-disabled` and `aria-busy`, its present-tense label as the name, and the width of its widest label. Icon-only
 * is named by `label`, also its tooltip;
 * each item is at least 44 px tall. Previews are decorative and hidden from assistive technology.
 * @key Enter, Space or Arrow down on the button: opens the menu at its first item
 * @key Arrow up on the button: opens the menu at its last item
 * @key Arrow down, Arrow up: move through the items, wrapping at the ends
 * @key Home, End: move to the first or last item
 * @key A letter: moves to the next item whose name starts with it
 * @key Enter or Space on an item: chooses it
 * @key Arrow right (left in right-to-left), Enter or Space on an item with a submenu: opens it at its first item; the pointer opens it on hover
 * @key Arrow left (right in right-to-left) or Escape in a submenu: closes it and returns to its item
 * @key Escape: closes the menu and returns to the button
 */
export function MenuButton({ label, icon, flag, items, onSelect, menuLabel, size = 'normal', disabled = false, emphasis = 'default', iconOnly = false, tone, busy = false, pendingLabel, listWidth, ...data }: MenuButtonProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusOnOpen, setFocusOnOpen] = useState<'first' | 'last'>('first');
  const [sub, setSub] = useState<number | null>(null);
  const subMenu = useRef<HTMLDivElement>(null);
  const subAnchor = useRef<HTMLElement | null>(null);
  const subRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subItems = sub === null ? [] : (items[sub]?.items ?? []);

  const focusItem = (i: number) => itemRefs.current[(i + items.length) % items.length]?.focus();
  const focusSub = (i: number) => subRefs.current[(i + subItems.length) % subItems.length]?.focus();
  const close = (returnFocus: boolean) => {
    setSub(null);
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };
  const openSub = (i: number, focus: boolean) => {
    subAnchor.current = itemRefs.current[i];
    setSub(i);
    if (focus) setSubFocus((n) => n + 1);
  };
  const [subFocus, setSubFocus] = useState(0);
  const closeSub = () => {
    if (sub === null) return;
    const at = sub;
    setSub(null);
    focusItem(at);
  };
  const show = (at: 'first' | 'last') => {
    if (busy) return;
    setFocusOnOpen(at);
    setOpen(true);
  };

  usePopup(open, trigger, menu, root, () => close(false));
  usePopup(sub !== null, subAnchor, subMenu, root, () => setSub(null), 'inline');
  const scroll = useOverlayScroll(undefined, open);
  const subScroll = useOverlayScroll(undefined, sub !== null);
  useEffect(() => {
    if (busy) setOpen(false);
  }, [busy]);
  useEffect(() => {
    if (subFocus) focusSub(0);
  }, [subFocus]);
  const name = busy ? (pendingLabel ?? label) : label;
  const iconSize = ({ xs: 'sm', s: 'sm', normal: 'md', m: 'md', l: 'lg', xl: 'lg', xxl: 'xl' } as const)[size];
  const lead = iconOnly ? (icon ?? 'chevron-down') : icon;
  useEffect(() => {
    if (open) focusItem(focusOnOpen === 'first' ? 0 : items.length - 1);
  }, [open]);

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      show(e.key === 'ArrowDown' ? 'first' : 'last');
    }
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.indexOf(document.activeElement as HTMLDivElement);
    const inward = root.current && getComputedStyle(root.current).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    if (e.key === 'ArrowDown') focusItem(current + 1);
    else if (e.key === 'ArrowUp') focusItem(current - 1);
    else if (e.key === inward && current >= 0 && items[current].items?.length) openSub(current, true);
    else if (e.key === 'Home') focusItem(0);
    else if (e.key === 'End') focusItem(items.length - 1);
    else if (e.key === 'Escape') close(true);
    else if (e.key === 'Tab') return setOpen(false);
    else if ((e.key === 'Enter' || e.key === ' ') && current >= 0) itemRefs.current[current]?.click();
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const order = items.map((_, i) => (current + 1 + i) % items.length);
      const next = order.find((i) => items[i].label.toLowerCase().startsWith(k));
      if (next !== undefined) focusItem(next);
    } else return;
    e.preventDefault();
  };

  const onSubKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = subRefs.current.indexOf(document.activeElement as HTMLDivElement);
    const outward = root.current && getComputedStyle(root.current).direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === 'ArrowDown') focusSub(current + 1);
    else if (e.key === 'ArrowUp') focusSub(current - 1);
    else if (e.key === 'Home') focusSub(0);
    else if (e.key === 'End') focusSub(subItems.length - 1);
    else if (e.key === 'Escape' || e.key === outward) closeSub();
    else if (e.key === 'Tab') return close(false);
    else if ((e.key === 'Enter' || e.key === ' ') && current >= 0) subRefs.current[current]?.click();
    else return;
    e.preventDefault();
  };

  // An icon-only trigger shows its name as a hint, never while its menu is open.
  const hint = useHint(trigger, name, { enabled: iconOnly && !open });

  return (
    <div {...data} data-dl="menu-button" ref={root}>
      <button
        ref={trigger}
        type="button"
        data-dl-part="trigger"
        data-size={size}
        data-emphasis={emphasis}
        data-tone={tone}
        data-icon-only={iconOnly ? '' : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        aria-label={iconOnly ? name : undefined}
        disabled={disabled}
        onClick={() => (open ? close(false) : show('first'))}
        onKeyDown={onTriggerKey}
        {...(hint.tip ? hint.handlers : {})}
      >
        {(['rest', 'on'] as const).map((layer) => (
          <span key={layer} data-dl-part="layer" data-shown={(layer === 'on') === busy ? '' : undefined}>
            {layer === 'on' ? <Progress /> : lead ? <Icon name={lead} size={iconSize} /> : flag && <Flag code={flag} />}
            {!iconOnly && <span>{layer === 'on' ? (pendingLabel ?? label) : label}</span>}
            {!iconOnly && <Icon name="chevron-down" size="sm" />}
          </span>
        ))}
        {hint.tip}
      </button>
      <div ref={menu} data-dl-part="popup" data-width={listWidth} data-presence="popup" data-material="floating" data-elevation="3" popover="manual" hidden={!open} inert={!open} onKeyDown={onMenuKey}>
        <div ref={scroll.root} data-dl="scroll-area" data-mode="auto" data-axis="block" data-max="fill" data-surface="none" data-contain="">
          <div ref={scroll.setViewport} data-dl-part="viewport">
            <div id={`${id}-menu`} data-dl-part="content" role="menu" aria-label={menuLabel ?? label} onPointerOver={(e) => {
              const i = itemRefs.current.findIndex((el) => el?.contains(e.target as Node));
              if (i < 0 || i === sub) return;
              if (items[i].items?.length) openSub(i, false);
              else setSub(null);
            }}>
              {items.map((item, i) => (
                <Fragment key={item.value}>
                  {item.startsGroup && i > 0 && <div role="separator" data-dl-part="separator" />}
                  <ListItem
                    role="menuitem"
                    label={item.label}
                    description={item.description}
                    preview={item.preview}
                    icon={item.icon}
                    plate={item.plate}
                    tone={item.tone}
                    submenu={!!item.items?.length}
                    thumbnail={item.flag && flagSrc(item.flag)}
                    itemRef={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    onClick={() => {
                      if (item.items?.length) return openSub(i, true);
                      close(true);
                      onSelect(item.value);
                    }}
                  />
                </Fragment>
              ))}
            </div>
          </div>
          {scroll.tracks('block')}
        </div>
      </div>
      {items.some((item) => item.items?.length) && (
        <div ref={subMenu} data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3" popover="manual" hidden={sub === null} inert={sub === null} onKeyDown={onSubKey}>
          <div ref={subScroll.root} data-dl="scroll-area" data-mode="auto" data-axis="block" data-max="fill" data-surface="none" data-contain="">
            <div ref={subScroll.setViewport} data-dl-part="viewport">
              <div data-dl-part="content" role="menu" aria-label={sub === null ? undefined : items[sub].label}>
                {subItems.map((item, i) => (
                  <Fragment key={item.value}>
                    {item.startsGroup && i > 0 && <div role="separator" data-dl-part="separator" />}
                    <ListItem
                      role="menuitem"
                      label={item.label}
                      description={item.description}
                      icon={item.icon}
                      plate={item.plate}
                      tone={item.tone}
                      itemRef={(el) => {
                        subRefs.current[i] = el;
                      }}
                      onClick={() => {
                        close(true);
                        onSelect(item.value);
                      }}
                    />
                  </Fragment>
                ))}
              </div>
            </div>
            {subScroll.tracks('block')}
          </div>
        </div>
      )}
    </div>
  );
}
