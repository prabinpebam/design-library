import { useEffect, useRef, useState } from 'react';
import { MenuButton, type MenuButtonItem } from '../fundamentals/MenuButton';
import { TextField } from '../fundamentals/TextField';
import type { DataAttributes } from '../types';

/** One conversation in the list. */
export interface Conversation {
  id: string;
  /** Its title, usually written from the first message: "Weekend walk in the Lake District". */
  title: string;
  /** Where it opens, so it can open in a new tab and be copied; leave out to open through `onOpen` only. */
  href?: string;
}

/** Conversations under one heading, newest first: "Today", "Yesterday", "Previous 7 days", a project's name. */
export interface ConversationGroup {
  label: string;
  items: Conversation[];
}

export interface ConversationListProps extends DataAttributes {
  /** The groups, in order. Empty groups aren't shown. */
  groups: ConversationGroup[];
  /** The open conversation's id: marked current (`aria-current="page"`) and its row tinted. */
  current?: string;
  /** A conversation chosen. With `href`, the link opens it too; call `preventDefault` on nothing, the list never does. */
  onOpen?: (id: string) => void;
  /** Each row's "More" menu, in order. Default: Rename, Share, Archive, Delete. `rename` is handled in place. */
  actions?: MenuButtonItem[];
  /** A menu action other than rename, e.g. "delete": confirm destructive ones yourself (Dialog). */
  onAction?: (id: string, action: string) => void;
  /** The new title after an in-place rename (Enter or leaving the field keeps it; Escape cancels). */
  onRename?: (id: string, title: string) => void;
  /** Names the navigation: "Chats" (default). */
  label?: string;
  /** The groups' heading level in the page's outline. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

const defaultActions: MenuButtonItem[] = [
  { value: 'rename', label: 'Rename' },
  { value: 'share', label: 'Share' },
  { value: 'archive', label: 'Archive' },
  { value: 'delete', label: 'Delete' },
];

/** The row's title in place as a text field: Enter or leaving keeps it, Escape cancels. */
function Rename({ title, onDone }: { title: string; onDone: (next?: string) => void }) {
  const box = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const input = box.current?.querySelector('input');
    input?.focus();
    input?.select();
  }, []);
  const finish = (next?: string) => {
    if (done.current) return;
    done.current = true;
    onDone(next);
  };
  return (
    <span
      ref={box}
      data-dl-part="rename"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          finish();
        }
      }}
    >
      <TextField label="Chat title" hideLabel size="s" value={title} onCommit={(next) => finish(next.trim() || undefined)} />
    </span>
  );
}

/**
 * The person's conversations with an assistant, grouped by when (Today, Yesterday, Previous 7 days) or by project, the
 * open one marked. Each row opens its conversation; its More menu (Rename in place, Share, Archive, Delete) shows on
 * hover, on focus and on the open row, so a long list reads as titles.
 * Not for the app's main navigation (Navigation) or a list of things to choose from (List).
 * @tier compound
 * @family chat
 * @a11y A `nav` named by `label`; each group is a heading and a list of links, the open one `aria-current="page"`.
 * Each row's More button is named after the conversation ("More for Weekend walk…") and stays in the Tab order even
 * when it's hidden at rest. Rename turns the title into a text field with focus in it; Escape puts focus back on the row.
 * @key Enter: opens the conversation (on its link); keeps a new title (while renaming)
 * @key Escape: cancels a rename
 */
export function ConversationList({ groups, current, onOpen, actions = defaultActions, onAction, onRename, label = 'Chats', headingLevel = 3, ...data }: ConversationListProps) {
  const [renaming, setRenaming] = useState<string>();
  const rows = useRef(new Map<string, HTMLAnchorElement | null>());
  const Heading = `h${headingLevel}` as const;
  return (
    <nav {...data} data-dl="conversation-list" aria-label={label}>
      {groups
        .filter((g) => g.items.length)
        .map((group) => (
          <section key={group.label} data-dl-part="group">
            <Heading data-dl-part="heading">{group.label}</Heading>
            <ul data-dl-part="items">
              {group.items.map((c) => (
                <li key={c.id} data-dl-part="row" data-current={c.id === current ? '' : undefined}>
                  {renaming === c.id ? (
                    <Rename
                      title={c.title}
                      onDone={(next) => {
                        setRenaming(undefined);
                        if (next && next !== c.title) onRename?.(c.id, next);
                        requestAnimationFrame(() => rows.current.get(c.id)?.focus());
                      }}
                    />
                  ) : (
                    <>
                      <a
                        ref={(el) => {
                          rows.current.set(c.id, el);
                        }}
                        data-dl-part="link"
                        href={c.href ?? '#'}
                        aria-current={c.id === current ? 'page' : undefined}
                        title={c.title}
                        onClick={(event) => {
                          if (!c.href) event.preventDefault();
                          onOpen?.(c.id);
                        }}
                      >
                        {c.title}
                      </a>
                      <span data-dl-part="more">
                        <MenuButton
                          label={`More for ${c.title}`}
                          icon="more"
                          iconOnly
                          size="s"
                          emphasis="quiet"
                          items={actions}
                          onSelect={(value) => (value === 'rename' && onRename ? setRenaming(c.id) : onAction?.(c.id, value))}
                        />
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
    </nav>
  );
}
