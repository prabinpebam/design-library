import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { usePopup } from '../behaviour/popup';
import { useOverlayScroll } from '../behaviour/scroll';
import { ListItem } from '../fundamentals/ListItem';
import { Text } from '../fundamentals/Text';
import { TextArea, type TextAreaProps } from '../fundamentals/TextArea';

export interface MentionPerson {
  id: string;
  /** Their name, written into the text after the trigger: "@Mira Okafor". */
  name: string;
  /** One line under the name in the suggestions: a role or a team. */
  secondary?: string;
  src?: string;
}

export interface MentionsProps extends Omit<TextAreaProps, 'combobox'> {
  /** The people who can be mentioned. Suggestions show those whose name contains what follows the trigger. */
  people: MentionPerson[];
  /** The character that starts a mention: `@` (default), or `#` for topics. */
  trigger?: string;
  /** Called with the people the text mentions now, whenever that changes. */
  onMentionsChange?: (people: MentionPerson[]) => void;
  /** How many suggestions show at most. Default 6. */
  limit?: number;
}

/** The trigger and the word typed after it, when the caret ends one: "@mi" at the caret. Pure. */
export function mentionQuery(text: string, caret: number, trigger: string): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf(trigger);
  if (at < 0 || (at > 0 && !/\s/.test(before[at - 1]))) return null;
  const query = before.slice(at + trigger.length);
  if (query.length > 30 || /[\n@#]/.test(query) || /\s\S*\s/.test(query) || /^\s/.test(query)) return null;
  return { start: at, query };
}

/**
 * A text area where typing "@" suggests people to mention: keep typing to narrow the list, choose one, and their name is
 * written into the text after the "@". For comments, messages and notes that notify or credit someone. Not for picking
 * people as a field's value (use a Combobox or TagInput).
 * @tier compound
 * @family inputs
 * @a11y The text area is the WAI-ARIA APG combobox (`aria-autocomplete="list"`) for a listbox of people that opens in the
 * top layer under it; the highlighted person is `aria-activedescendant`, so focus never leaves the text. Each person
 * reads as name and role. When no one matches, the list says so. The text itself stays plain: a mention is "@" and the
 * name, read as written.
 * @key Up and Down: move through the suggestions
 * @key Enter or Tab: mention the highlighted person
 * @key Escape: close the suggestions and keep typing
 */
export function Mentions({ people, trigger = '@', onMentionsChange, limit = 6, value, onChange, ...rest }: MentionsProps) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const area = useRef<HTMLTextAreaElement | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState(0);
  const [dismissed, setDismissed] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const nextCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    area.current = root.current?.querySelector('textarea') ?? null;
  });

  const found = mentionQuery(value, caret, trigger);
  const query = found?.query.toLowerCase() ?? '';
  const matches = found ? people.filter((p) => p.name.toLowerCase().includes(query)).slice(0, limit) : [];
  const open = !!found && found.start !== dismissed && (matches.length > 0 || !found.query.includes(' ')) && !rest.readOnly && !rest.disabled;

  usePopup(open, area, list, root, () => setDismissed(found?.start ?? null));
  const scroll = useOverlayScroll(undefined, open);

  useEffect(() => setActive(0), [query, open]);

  useEffect(() => {
    if (nextCaret.current === null || !area.current) return;
    area.current.setSelectionRange(nextCaret.current, nextCaret.current);
    setCaret(nextCaret.current);
    nextCaret.current = null;
  }, [value]);

  const mentioned = people.filter((p) => value.includes(`${trigger}${p.name}`)).map((p) => p.id).join(' ');
  useEffect(() => {
    onMentionsChange?.(people.filter((p) => mentioned.split(' ').includes(p.id)));
  }, [mentioned]);

  const choose = (person: MentionPerson) => {
    if (!found) return;
    const insert = `${trigger}${person.name} `;
    nextCaret.current = found.start + insert.length;
    onChange(value.slice(0, found.start) + insert + value.slice(caret));
    area.current?.focus();
  };

  const track = () => {
    const el = area.current;
    if (el) setCaret(el.selectionStart);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!matches.length) return;
      event.preventDefault();
      setActive((a) => (a + (event.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length);
    } else if ((event.key === 'Enter' || event.key === 'Tab') && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setDismissed(found?.start ?? null);
    }
  };

  return (
    <span ref={root} data-dl="mentions" onKeyDown={onKeyDown} onKeyUp={track} onClick={track} onSelect={track}>
      <TextArea
        {...rest}
        value={value}
        onChange={(next) => {
          onChange(next);
          const el = area.current;
          if (el) setCaret(el.selectionStart);
          if (dismissed !== null && !next.slice(dismissed).startsWith(trigger)) setDismissed(null);
        }}
        combobox={{ listId: `${id}-list`, expanded: open, activeId: open && matches[active] ? `${id}-${matches[active].id}` : undefined }}
      />
      <div ref={list} data-dl-part="popup" data-presence="popup" data-material="floating" data-elevation="3" popover="manual" hidden={!open}>
        <div ref={scroll.root} data-dl="scroll-area" data-mode="auto" data-axis="block" data-max="fill" data-surface="none" data-contain="">
          <div ref={scroll.setViewport} data-dl-part="viewport">
            {matches.length ? (
              <div id={`${id}-list`} data-dl-part="content" role="listbox" aria-label="People to mention">
                {matches.map((p, i) => (
                  <ListItem
                    key={p.id}
                    id={`${id}-${p.id}`}
                    role="option"
                    label={p.name}
                    description={p.secondary}
                    avatar={{ name: p.name, src: p.src }}
                    active={i === active}
                    onClick={() => choose(p)}
                  />
                ))}
              </div>
            ) : (
              <div id={`${id}-list`} data-dl-part="content">
                <span data-dl-part="list-message" role="status">
                  <Text as="span" variant="body-sm" tone="muted">
                    No one called “{found?.query}”
                  </Text>
                </span>
              </div>
            )}
          </div>
          {scroll.tracks('block')}
        </div>
      </div>
    </span>
  );
}
