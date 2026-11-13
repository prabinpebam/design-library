import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import type { DataAttributes } from '../types';
import { Button } from '../fundamentals/Button';
import { ScrollArea } from '../fundamentals/ScrollArea';
import { Tabs } from './Tabs';

export interface RibbonGroup {
  /** Stable id. */
  id: string;
  /** The group's name, shown under its commands and read as the group's accessible name: "Font", "Paragraph". */
  label: string;
  /** Hides the visible caption for a collapsed single-command group while keeping `label` as the group's accessible name. */
  hideLabel?: boolean;
  /** The group's commands: buttons, fields and menus, in one to three rows. */
  commands: ReactNode;
  /** Names a dialog with the group's full settings; given, a small button at the label's end opens it. */
  launcher?: string;
  /** The launcher was pressed. */
  onLaunch?: () => void;
}

export interface RibbonTab {
  /** Stable id: what `selected` and `onChange` use. */
  id: string;
  /** One word, as the app names the set: "Home", "Insert". */
  label: string;
  /** The tab's command groups, in reading order. */
  groups: RibbonGroup[];
}

export interface RibbonProps extends DataAttributes {
  /** The tabs, each a set of command groups. */
  tabs: RibbonTab[];
  /** The tab list's accessible name, e.g. "Ribbon". */
  label: string;
  /** The selected tab's id, when the parent owns it. */
  selected?: string;
  /** The first selected tab when the ribbon owns it; the first tab otherwise. */
  defaultSelected?: string;
  /** A tab was chosen. */
  onChange?: (id: string) => void;
  /** Actions on the whole document at the end of the tab row (comments, the editing mode, share). */
  extra?: ReactNode;
  /** Something at the far end of the command card, after the groups, such as a control that hides the ribbon. */
  end?: ReactNode;
  /** Places `end` in flow beside the groups (`'flow'`, default) or pinned at the card's bottom-end corner (`'corner'`). */
  endPlacement?: 'flow' | 'corner';
  /** An optional companion card beside the command card on the same band (an assistant or add-in launcher). */
  aside?: ReactNode;
  /** From the Button size scale, for the tab row: `normal` (default), `s` or `xs`. */
  size?: 'xs' | 's' | 'normal';
  /**
   * Shows only the tab row, to give the content more room. Choosing a tab opens its card over the content until a
   * command is used, Escape is pressed or the pointer goes down outside; `end` stays in the card, so the control that
   * pins the ribbon again is reachable. Default `false`.
   */
  collapsed?: boolean;
}

/**
 * An app's command ribbon: a row of tabs over a card of labelled command groups, each with an optional launcher for
 * its full settings. For a document, spreadsheet or drawing editor with many commands.
 * Not for a few actions (use Toolbar), panels of content (use Tabs) or an app's identity (use TitleBar).
 * @tier compound
 * @family panels
 * @a11y The tabs are the APG tabs pattern (Tabs); each group is `role="group"` named by its visible label, so a screen
 * reader hears "Font, group" before its commands. The launcher is a named button ("Font settings"). The card scrolls
 * sideways to its own edges when the groups don't fit, so no command is clipped or hidden.
 */
export function Ribbon({ tabs, label, selected, defaultSelected, onChange, extra, end, endPlacement = 'flow', aside, size = 'normal', collapsed = false, ...data }: RibbonProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState(false);
  const open = !collapsed || peek;
  useEffect(() => {
    if (!collapsed) setPeek(false);
  }, [collapsed]);
  useEffect(() => {
    if (!peek) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setPeek(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPeek(false);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [peek]);
  const onClickCapture = collapsed
    ? (e: MouseEvent<HTMLDivElement>) => {
        const at = e.target as HTMLElement;
        if (at.closest('[role="tab"]')) setPeek(true);
        // A command used in the open card closes it after its own click runs.
        else if (at.closest('[data-dl="ribbon-groups"] :is(button, [role="menuitem"])')) setTimeout(() => setPeek(false));
      }
    : undefined;
  const renderCard = (tab: RibbonTab) => (
    <div data-dl="ribbon-card" data-end-placement={endPlacement === 'corner' ? 'corner' : undefined}>
      <ScrollArea axis="inline" data-dl-part="groups">
        <div data-dl="ribbon-groups">
          {tab.groups.map((group) => (
            <div
              key={group.id}
              data-dl-part="group"
              role="group"
              aria-label={group.hideLabel ? group.label : undefined}
              aria-labelledby={group.hideLabel ? undefined : `${id}-${tab.id}-${group.id}`}
            >
              <div data-dl-part="commands">{group.commands}</div>
              <div data-dl-part="foot">
                {!group.hideLabel && <span data-dl-part="group-label" id={`${id}-${tab.id}-${group.id}`}>{group.label}</span>}
                {group.launcher && <Button label={group.launcher} icon="open-dialog" iconOnly size="xs" emphasis="quiet" onClick={group.onLaunch} />}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {end != null && <div data-dl-part="end">{end}</div>}
    </div>
  );
  return (
    <div {...data} ref={root} data-dl="ribbon" data-collapsed={collapsed ? '' : undefined} data-open={collapsed && peek ? '' : undefined} onClickCapture={onClickCapture}>
      <Tabs
        label={label}
        size={size}
        selected={selected}
        defaultSelected={defaultSelected}
        onChange={onChange}
        extra={extra}
        items={tabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          panel: !open ? null : aside != null ? (
            <div data-dl="ribbon-band">
              {renderCard(tab)}
              <div data-dl-part="aside">{aside}</div>
            </div>
          ) : renderCard(tab),
        }))}
      />
    </div>
  );
}
