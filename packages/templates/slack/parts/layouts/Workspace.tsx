import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  Heading,
  Icon,
  IconOverrides,
  Image,
  Link,
  ListItem,
  MenuButton,
  Popover,
  ScrollArea,
  Switch,
  Text,
  TextArea,
  TextField,
  applyScheme,
  notify,
  regionSchemeOf,
  type DataAttributes,
} from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { WorkspaceChannelItem, WorkspaceMenuItem, WorkspaceMessage, WorkspaceRecord } from '../../types';

export interface WorkspaceProps extends DataAttributes {
  /** Validated shared content, including every label and conversation. */
  view: WorkspaceRecord;
  /** A directly openable review state. */
  screen?: string;
  /** Per-screen settings from content JSON. */
  settings?: Record<string, unknown>;
  /** Resolves an asset id from assets.json to `{ src, alt }`. */
  picture?: (id: string) => { src: string; alt: string };
}

/**
 * The current workspace composition: labelled rail outside an inset navigation-and-conversation window.
 * Not for assistant chat (ChatLayout/Composer) or a general application shell (AppLayout).
 * Its messages use Text, Avatar, Image and Button; scrolling, focus, fields and commit feedback stay in core.
 * @tier layout
 * @family slack
 * @a11y Named navigation and conversation regions, one main landmark, and native core controls.
 */
export function Workspace({ view, screen = 'channel', settings, picture, ...data }: WorkspaceProps) {
  const c = view.copy;
  const pic = (id?: string) => (id && picture ? picture(id) : { src: '', alt: '' });
  type BrowsePage =
    | 'channel' | 'slackbot' | 'directories' | 'huddles' | 'unreads' | 'welcome-back'
    | 'dms' | 'dm' | 'threads' | 'saved' | 'todos' | 'agents' | 'compose';
  type Place = { page: BrowsePage; channel: string; tab: string; dm: string };
  const pageFromScreen = (s: string): BrowsePage =>
    s === 'slackbot' || s === 'directories' || s === 'huddles' || s === 'unreads' || s === 'welcome-back' ? s : 'channel';
  const isDualScreen = (s: string) =>
    s === 'directories' || s === 'huddles' || s === 'unreads' || s === 'welcome-back' || s === 'filter-menu' || s === 'create-menu' || s === 'activity';
  const isAmaScreen = (s: string) =>
    s === 'channel-menu' || s === 'filter-menu' || s === 'create-menu' || s === 'activity';
  const hasNoPromo = (s: string) =>
    s === 'channel-menu' || s === 'filter-menu' || s === 'create-menu';

  const [activePage, setActivePage] = useState<BrowsePage>(pageFromScreen(screen));
  const [dualRail, setDualRail] = useState(isDualScreen(screen));
  const [welcomeDismissed, setWelcomeDismissed] = useState(hasNoPromo(screen));
  const [huddlesHeroDismissed, setHuddlesHeroDismissed] = useState(false);
  const [slackbotBannerDismissed, setSlackbotBannerDismissed] = useState(false);
  const [slackbotNav, setSlackbotNav] = useState('new');
  const [slackbotDraft, setSlackbotDraft] = useState('');
  const [dirTab, setDirTab] = useState('people');
  const [dirQuery, setDirQuery] = useState('');
  const [unreadsCollapsed, setUnreadsCollapsed] = useState(false);

  const [channel, setChannel] = useState(
    isAmaScreen(screen) ? view.amaChannel.channel : typeof settings?.channel === 'string' ? settings.channel : view.channel,
  );
  const [thread, setThread] = useState<WorkspaceMessage | undefined>(screen === 'thread' ? view.messages[0] : undefined);
  const [tab, setTab] = useState(screen === 'files' ? 'files' : 'messages');
  const [search, setSearch] = useState(screen === 'search');
  const [vipOpen, setVipOpen] = useState(screen === 'vip-modal');
  const [vipSearch, setVipSearch] = useState('');
  const [channelMenuOpen, setChannelMenuOpen] = useState(screen === 'channel-menu');
  const [filterMenuOpen, setFilterMenuOpen] = useState(screen === 'filter-menu');
  const [createMenuOpen, setCreateMenuOpen] = useState(screen === 'create-menu');
  const [activityOpen, setActivityOpen] = useState(screen === 'activity');
  const [activityUnreadsOnly, setActivityUnreadsOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('');
  const [finding, setFinding] = useState(false);
  const [vipDismissed, setVipDismissed] = useState(hasNoPromo(screen));
  const [newBannerDismissed, setNewBannerDismissed] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<Record<string, WorkspaceMessage[]>>({});
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, string[]>>({});
  const [picker, setPicker] = useState<string>();
  const [emojiQuery, setEmojiQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [made, setMade] = useState<string[]>([]);
  const [formatting, setFormatting] = useState(true);
  const [alsoSend, setAlsoSend] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [short, setShort] = useState(false);
  const [dmWith, setDmWith] = useState('');
  const [toField, setToField] = useState('');
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const firstChecked = (items: WorkspaceMenuItem[], prefix: string) =>
    items.flatMap((i) => [i, ...(i.items ?? [])]).find((i) => i.checked && i.value.startsWith(prefix))?.value;
  const [notifyLevel, setNotifyLevel] = useState(firstChecked(view.notificationMenu, '') ?? 'all');
  const [sidebarShow, setSidebarShow] = useState(firstChecked(view.filterMenu, 'filter-') ?? 'filter-all');
  const initialSort = firstChecked(view.filterMenu, 'sort-') ?? 'sort-recency';
  const [sidebarSort, setSidebarSort] = useState(initialSort);
  const [fresh, setFresh] = useState(0);
  const [past, setPast] = useState<Place[]>([]);
  const [future, setFuture] = useState<Place[]>([]);
  const lastPlace = useRef<Place | null>(null);
  const travelling = useRef(false);

  const timeline = useRef<HTMLDivElement>(null);
  const dirSearchWrap = useRef<HTMLDivElement>(null);
  const dirSearchBox = useRef<HTMLInputElement>(null);
  const searchBox = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const threadPanel = useRef<HTMLElement>(null);
  const threadOpener = useRef<HTMLElement | null>(null);
  const restoreThreadFocus = useRef(false);
  const userTriggeredSearch = useRef(false);

  useEffect(() => {
    void loadFace('lato');
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width <= 640);
      setShort(entry.contentRect.height <= 880);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActivePage(pageFromScreen(screen));
    setDualRail(isDualScreen(screen));
    setThread(screen === 'thread' ? view.messages[0] : undefined);
    setTab(screen === 'files' ? 'files' : 'messages');
    setSearch(screen === 'search');
    setVipOpen(screen === 'vip-modal');
    setChannelMenuOpen(screen === 'channel-menu');
    setFilterMenuOpen(screen === 'filter-menu');
    setCreateMenuOpen(screen === 'create-menu');
    setActivityOpen(screen === 'activity');
    setVipDismissed(hasNoPromo(screen));
    setWelcomeDismissed(hasNoPromo(screen));
    if (isAmaScreen(screen)) setChannel(view.amaChannel.channel);
    else if (typeof settings?.channel === 'string') setChannel(settings.channel);
    else setChannel(view.channel);
  }, [screen, settings?.channel, view.amaChannel.channel, view.channel, view.messages]);

  useEffect(() => {
    if (activePage === 'directories') {
      dirSearchBox.current?.focus({ preventScroll: true });
    }
  }, [activePage]);

  useEffect(() => {
    if (thread && threadOpener.current && !threadOpener.current.getClientRects().length) {
      threadPanel.current?.querySelector<HTMLButtonElement>('button[aria-label]')?.focus({ preventScroll: true });
    } else if (!thread && restoreThreadFocus.current) {
      const opener = threadOpener.current;
      const target =
        opener?.isConnected && opener.getClientRects().length
          ? opener
          : root.current?.querySelector<HTMLTextAreaElement>('main textarea');
      target?.focus({ preventScroll: true });
      restoreThreadFocus.current = false;
    }
  }, [thread]);

  const openThread = (msg: WorkspaceMessage) => {
    if (thread?.id === msg.id) {
      composerBoxes.current[`thread-${msg.id}`]?.focus({ preventScroll: true });
      return;
    }
    threadOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setThread(msg);
  };

  const closeThread = () => {
    restoreThreadFocus.current = true;
    setThread(undefined);
  };

  useEffect(() => {
    if (search && userTriggeredSearch.current) {
      searchBox.current?.focus({ preventScroll: true });
      userTriggeredSearch.current = false;
    }
  }, [search]);

  const isAma = channel === view.amaChannel.channel;
  const activeMessages = isAma ? view.amaChannel.messages : view.messages;
  const activeTabs = isAma ? view.amaChannel.tabs : view.tabs;
  const activeMemberCount = isAma ? view.amaChannel.memberCountText : view.memberCountText;
  const localSent = sent[channel] ?? [];
  const messages = [...activeMessages, ...localSent].filter((m) => !deleted.includes(m.id));

  useEffect(() => {
    const viewport = timeline.current;
    if (!viewport || search || tab !== 'messages') return;
    if (localSent.length > 0) viewport.scrollTop = viewport.scrollHeight;
    else if (isAma) viewport.scrollTop = 53;
    else viewport.scrollTop = 152;
  }, [localSent.length, channel, isAma, search, tab]);

  const send = async (target: string) => {
    const text = drafts[target]?.trim();
    if (!text) return;
    const next: WorkspaceMessage = {
      id: `local-${Date.now()}`,
      author: view.currentUser,
      avatar: view.currentUserAvatar,
      time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()),
      text,
    };
    let dest = target;
    if (target === 'compose') {
      const to = toField.trim();
      if (!to) {
        notify({ subject: 'slack-compose', tone: 'error', message: c.needRecipient });
        return;
      }
      const name = to.replace(/^[@#]/, '');
      dest = to.startsWith('#') ? name : `dm-${name}`;
      setToField('');
      if (to.startsWith('#')) visit({ page: 'channel', channel: name });
      else openDm(name);
    }
    setSent((old) => ({ ...old, [dest]: [...(old[dest] ?? []), next] }));
    setDrafts((old) => ({ ...old, [target]: '' }));
  };

  const notBuilt = (label: string) => notify({ subject: 'slack-replica', message: `${label} ${c.notInReplica}` });
  const labelOf = (items: WorkspaceMenuItem[], value: string) =>
    items.flatMap((i) => [i, ...(i.items ?? [])]).find((i) => i.value === value)?.label ?? value;
  const copyText = (text: string, message: string) => {
    void navigator.clipboard?.writeText(text).catch(() => undefined);
    notify({ subject: 'slack-copy', tone: 'success', message });
  };

  const composerBoxes = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const focusComposer = (target: string) => requestAnimationFrame(() => composerBoxes.current[target]?.focus({ preventScroll: true }));
  const insert = (target: string, text: string) => {
    setDrafts((old) => ({ ...old, [target]: `${old[target] ?? ''}${old[target] && !old[target].endsWith(' ') ? ' ' : ''}${text}` }));
    focusComposer(target);
  };

  const here: Place = { page: activePage, channel, tab, dm: dmWith };
  const samePlace = (a: Place, b: Place) => a.page === b.page && a.channel === b.channel && a.tab === b.tab && a.dm === b.dm;
  useEffect(() => {
    const prev = lastPlace.current;
    lastPlace.current = here;
    if (!prev || samePlace(prev, here)) return;
    if (travelling.current) {
      travelling.current = false;
      return;
    }
    setPast((p) => [...p, prev].slice(-20));
    setFuture([]);
  }, [activePage, channel, tab, dmWith]);
  const visit = (to: Partial<Place>) => {
    const target: Place = { page: to.page ?? 'channel', channel: to.channel ?? channel, tab: to.tab ?? 'messages', dm: to.dm ?? '' };
    // Choosing the place you're on opens it fresh, as following a link to the current page does.
    if (samePlace(target, here) && !search && !activityOpen) setFresh((f) => f + 1);
    setActivePage(to.page ?? 'channel');
    if (to.channel) setChannel(to.channel);
    setTab(to.tab ?? 'messages');
    setDmWith(to.dm ?? '');
    setSearch(false);
    setActivityOpen(false);
  };
  const travel = (to: Place) => {
    travelling.current = true;
    visit(to);
  };
  const goBack = () => {
    const prev = past[past.length - 1];
    if (!prev) {
      setSearch(false);
      setActivePage('channel');
      return;
    }
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [here, ...f]);
    travel(prev);
  };
  const goForward = () => {
    const next = future[0];
    if (!next) return;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, here]);
    travel(next);
  };
  const pageTitle: Record<BrowsePage, string> = {
    channel: '',
    dm: '',
    slackbot: view.slackbotView.railLabel,
    directories: view.directoriesView.title,
    huddles: view.huddlesView.title,
    unreads: view.unreadsView.title,
    'welcome-back': view.welcomeBackView.title,
    dms: c.dmsTitle,
    threads: c.threadsTitle,
    saved: c.savedTitle,
    todos: c.todosTitle,
    agents: c.agentsTitle,
    compose: c.newMessage,
  };
  const placeLabel = (p: Place) => (p.page === 'channel' ? `# ${p.channel}` : p.page === 'dm' ? p.dm : pageTitle[p.page]);
  const recentPlaces = (() => {
    const fallback = (view.sections.find((s) => s.collapsible)?.items ?? []).slice(0, 5).map((i): Place => ({ page: 'channel', channel: i.name, tab: 'messages', dm: '' }));
    const seen = new Set<string>([placeLabel(here)]);
    return [...past].reverse().concat(fallback).filter((p) => !seen.has(placeLabel(p)) && Boolean(seen.add(placeLabel(p)))).slice(0, 8);
  })();

  const goHome = () => {
    if (activePage === 'channel' && tab === 'messages' && !search && !activityOpen) focusComposer(channel);
    else visit({ page: 'channel', channel: activePage === 'channel' || activePage === 'dm' || activePage === 'compose' ? channel : view.channel });
  };
  const openDm = (name: string) => visit({ page: 'dm', dm: name });

  const toggleTheme = () => {
    const el = root.current;
    if (!el) return;
    applyScheme(regionSchemeOf(el).scheme === 'dark' ? 'light' : 'dark', el);
  };

  const toggleSaved = (m: WorkspaceMessage) => {
    const on = !saved[m.id];
    setSaved((old) => ({ ...old, [m.id]: on }));
    notify({ subject: 'slack-saved', tone: on ? 'success' : 'info', message: on ? c.savedNotice : c.unsavedNotice });
  };

  const onMessageMenu = (m: WorkspaceMessage, value: string) => {
    if (value === 'copy-link') copyText(`${location.href.split('#')[0]}#/app/slack/thread`, c.linkCopied);
    else if (value === 'unread') notify({ subject: 'slack-message', message: c.markedUnread });
    else if (value === 'unfollow') notify({ subject: 'slack-message', message: c.unfollowed });
    else if (value === 'pin') notify({ subject: 'slack-message', tone: 'success', message: c.pinned });
    else if (value.startsWith('remind-') && value !== 'remind-custom') notify({ subject: 'slack-message', tone: 'success', message: c.reminderSet });
    else if (value === 'edit') {
      setDrafts((old) => ({ ...old, [channel]: m.text }));
      focusComposer(channel);
    } else if (value === 'delete') {
      setDeleted((d) => [...d, m.id]);
      notify({ subject: 'slack-message', message: c.deleted, action: { label: c.undo, onAction: () => setDeleted((d) => d.filter((id) => id !== m.id)) } });
    } else notBuilt(labelOf(view.messageMenu, value));
  };

  const onChannelMenu = (value: string) => {
    setChannelMenuOpen(false);
    if (value === 'star') setStarred((s) => ({ ...s, [channel]: !s[channel] }));
    else if (value === 'copy-name') copyText(`#${channel}`, c.nameCopied);
    else if (value === 'copy-link') copyText(`${location.href.split('#')[0]}#/app/slack/channel`, c.linkCopied);
    else if (value === 'leave') notify({ subject: 'slack-channel', message: c.left });
    else notBuilt(labelOf(view.channelMenu, value));
  };

  const onFilterMenu = (value: string) => {
    setFilterMenuOpen(false);
    if (value.startsWith('filter-') && value !== 'filter-custom') setSidebarShow(value);
    else if (value.startsWith('sort-')) setSidebarSort(value);
    else notBuilt(labelOf(view.filterMenu, value));
  };
  const filterItems = view.filterMenu.map((i) => ({
    ...i,
    items: i.items?.map((s) => (s.value.startsWith('filter-') || s.value.startsWith('sort-') ? { ...s, checked: s.value === sidebarShow || s.value === sidebarSort } : s)),
  }));

  const onCreate = (value: string) => {
    setCreateMenuOpen(false);
    if (value === 'channel') setCreating(true);
    else if (value === 'message') visit({ page: 'compose' });
    else notBuilt(labelOf(view.createMenu, value));
  };

  const onAppMenu = (value: string) => {
    if (value === 'new-message') visit({ page: 'compose' });
    else if (value === 'search') {
      userTriggeredSearch.current = true;
      setSearch(true);
    } else if (value === 'sidebar') setDualRail((d) => !d);
    else if (value === 'theme') toggleTheme();
    else notBuilt(labelOf(view.appMenu, value));
  };

  const windowOnly = () => notify({ subject: 'slack-window', message: c.windowOnly });
  const historyMenu = (
    <MenuButton
      label={c.history}
      icon="clock"
      iconOnly
      chevron={false}
      emphasis="quiet"
      tone="inherit"
      size="xs"
      items={recentPlaces.map((p, i) => ({ value: String(i), label: placeLabel(p) }))}
      onSelect={(value) => {
        const p = recentPlaces[Number(value)];
        if (p) visit(p);
      }}
    />
  );
  const attachMenu = (
    <MenuButton
      label={c.add}
      icon="plus"
      iconOnly
      chevron={false}
      emphasis="quiet"
      tone="inherit"
      size="xs"
      items={view.attachMenu}
      onSelect={(value) => notBuilt(labelOf(view.attachMenu, value))}
    />
  );

  const headAction = (label: string, icon: Parameters<typeof Button>[0]['icon'], onClick?: () => void) => (
    <Button label={label} icon={icon} iconOnly emphasis="quiet" tone="inherit" size="xs" onClick={onClick} />
  );
  const action = (label: string, icon: Parameters<typeof Button>[0]['icon'], onClick?: () => void) => (
    <Button label={label} icon={icon} iconOnly emphasis="quiet" tone="inherit" size="xs" onClick={onClick} />
  );

  const react = (id: string, char: string) => {
    setAdded((old) => ({ ...old, [id]: old[id]?.includes(char) ? old[id] : [...(old[id] ?? []), char] }));
    setPicker(undefined);
    setEmojiQuery('');
  };

  const emojiPicker = (m: WorkspaceMessage) => {
    const p = view.emojiPicker;
    const q = emojiQuery.trim().toLowerCase();
    const groups = p.groups
      .map((g) => ({ ...g, items: g.items.filter((e) => !q || e.label.includes(q)) }))
      .filter((g) => g.items.length);
    const pick = (e: { char: string; label: string }, key: string) => (
      <Button key={key} label={e.char} emphasis="quiet" size="xs" onClick={() => react(m.id, e.char)} />
    );
    return (
      <Popover
        trigger={{ label: c.react, icon: 'emoji-add', iconOnly: true, emphasis: 'quiet', size: 'xs', tone: 'inherit' }}
        open={picker === m.id}
        onOpenChange={(open) => {
          setPicker(open ? m.id : undefined);
          if (!open) setEmojiQuery('');
        }}
      >
        <div data-dl="slack-emoji-picker">
          <div data-dl-part="categories" role="toolbar" aria-label={c.react}>
            {p.categories.map((cat) => (
              <span key={cat.label} data-dl-part="category" data-current={cat === p.categories[0] || undefined}>
                {action(cat.label, cat.icon)}
              </span>
            ))}
          </div>
          <div data-dl-part="search">
            <TextField
              label={c.emojiSearch}
              hideLabel
              type="search"
              icon="search"
              size="xs"
              placeholder={c.emojiSearch}
              value={emojiQuery}
              onChange={setEmojiQuery}
            />
          </div>
          <div data-dl-part="list">
            <ScrollArea label={c.react}>
              <div data-dl="slack-emoji-groups">
                {groups.map((g) => (
                  <section key={g.title} data-dl-part="group" aria-label={g.title}>
                    <div data-dl-part="group-title">{g.title}</div>
                    <div data-dl-part="grid">{g.items.map((e, i) => pick(e, `${g.title}-${i}`))}</div>
                  </section>
                ))}
                {!groups.length && <Text>{c.noEmoji}</Text>}
              </div>
            </ScrollArea>
          </div>
          <div data-dl-part="handy">
            <span data-dl-part="group-title">{c.handy}</span>
            <div data-dl-part="handy-row">{p.handy.map((e, i) => pick(e, `handy-${i}`))}</div>
          </div>
        </div>
      </Popover>
    );
  };

  const createChannel = () => {
    const name = channelName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name) return;
    setMade((old) => (old.includes(name) ? old : [...old, name]));
    setChannel(name);
    setSearch(false);
    setTab('messages');
    setCreating(false);
    setChannelName('');
  };

  const sections: WorkspaceRecord['sections'] = view.sections.map((section) => {
    const baseItems = section.collapsible
      ? dualRail
        ? view.dualRailChannels
        : isAma && view.amaChannel.channels
          ? view.amaChannel.channels
          : section.items
      : section.items;
    const extra = section.collapsible && made.length ? made.map((name): WorkspaceChannelItem => ({ name, icon: 'hash', unread: true })) : [];
    const filtered = [...baseItems, ...extra].filter(
      (item) =>
        (!sidebarFilter.trim() || item.name.toLowerCase().includes(sidebarFilter.trim().toLowerCase())) &&
        (!section.collapsible ||
          (sidebarShow === 'filter-unreads' ? item.unread || Boolean(item.mentions) : sidebarShow === 'filter-mentions' ? Boolean(item.mentions) : true)),
    );
    // The content's order is already the reference's own sort; re-sort only once the person picks another.
    if (section.collapsible && sidebarSort === 'sort-az' && sidebarSort !== initialSort) filtered.sort((a, b) => a.name.localeCompare(b.name));
    return { ...section, items: filtered };
  });

  const composer = (target: string, reply = false, placeholder?: string) => {
    const ready = Boolean(drafts[target]?.trim());
    // binary-setting: each formatting mark is on or off for the text being written, as in the reference's format bar.
    const mark = (label: string, icon: Parameters<typeof Button>[0]['icon']) => (
      <Button
        label={label}
        icon={icon}
        iconOnly
        emphasis="quiet"
        tone="inherit"
        size="xs"
        pressed={Boolean(marks[label])}
        onClick={() => {
          setMarks((old) => ({ ...old, [label]: !old[label] }));
          focusComposer(target);
        }}
      />
    );
    return (
      <div data-dl="slack-composer" data-ready={ready || undefined}>
        <TextArea
          label={reply ? c.reply : c.compose}
          hideLabel
          grow
          width="fill"
          inputRef={(el) => {
            composerBoxes.current[target] = el;
          }}
          value={drafts[target] ?? ''}
          onChange={(value) => setDrafts((old) => ({ ...old, [target]: value }))}
          placeholder={placeholder ?? (reply ? `${c.reply}…` : `${c.messagePrefix} #${channel}`)}
          rows={1}
          onEnter={() => {
            void send(target);
          }}
          tray={
            formatting && (
              <div data-dl="slack-formatting" role="toolbar" aria-label={c.format}>
                <div data-dl-part="set">
                  {mark(c.bold, 'bold')}
                  {mark(c.italic, 'italic')}
                  {mark(c.underline, 'underline')}
                  {mark(c.strike, 'strikethrough')}
                </div>
                <span data-dl-part="divider" aria-hidden="true" />
                <div data-dl-part="set">
                  {mark(c.paragraphStyle, 'pilcrow')}
                  <span data-dl-part="mini-caret" aria-hidden="true">
                    <Icon name="chevron-down" size="sm" />
                  </span>
                </div>
                <span data-dl-part="divider" aria-hidden="true" />
                <div data-dl-part="set">
                  {mark(c.link, 'link')}
                  {mark(c.numbered, 'list-numbered')}
                  {mark(c.list, 'list-bulleted')}
                </div>
                <span data-dl-part="divider" aria-hidden="true" />
                <div data-dl-part="set">
                  {mark(c.quote, 'quote')}
                  {mark(c.code, 'code')}
                  {mark(c.codeBlock, 'code-block')}
                  {mark(c.checkList, 'list')}
                </div>
              </div>
            )
          }
          toolbar={
            <div data-dl="slack-tools">
              <div data-dl-part="group">
                <span data-dl-part="add-circle">{attachMenu}</span>
                <span data-dl-part="format-toggle" data-active={formatting || undefined}>
                  <IconOverrides
                    icons={
                      formatting
                        ? {
                            'text-format': {
                              v: '0 0 24 24',
                              g: { fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round' },
                              c: [['path', { d: 'M2.5 17.5L8 4.5l5.5 13M4.5 13h7M21 11.5v6M21 15a2.75 2.75 0 1 1-5.5 0 2.75 2.75 0 0 1 5.5 0zM2 21.5h20' }]],
                            },
                          }
                        : {}
                    }
                  >
                    <Button
                      label={c.format}
                      icon="text-format"
                      iconOnly
                      emphasis="quiet"
                      tone="inherit"
                      size="xs"
                      onClick={() => setFormatting(!formatting)}
                    />
                  </IconOverrides>
                </span>
                {action(c.emoji, 'emoji', () => insert(target, ':'))}
                {action(c.mention, 'at', () => insert(target, '@'))}
                <span data-dl-part="divider" aria-hidden="true" />
                {action(c.video, 'video', () => notBuilt(c.video))}
                {action(c.audio, 'mic', () => notBuilt(c.audio))}
                <span data-dl-part="divider" aria-hidden="true" />
                {action(c.shortcuts, 'compose', () => insert(target, '/'))}
              </div>
              <div data-dl-part="send" data-ready={ready || undefined}>
                <Button
                  label={c.send}
                  icon="send"
                  iconOnly
                  size="xs"
                  emphasis={ready ? 'primary' : 'quiet'}
                  tone={ready ? undefined : 'inherit'}
                  unavailable={!ready ? c.compose : undefined}
                  onCommit={() => send(target)}
                  pendingLabel={c.sending}
                  doneLabel={c.sent}
                />
                <span data-dl-part="send-sep" aria-hidden="true" />
                <MenuButton
                  label={c.schedule}
                  icon="chevron-down"
                  iconOnly
                  chevron={false}
                  size="xs"
                  emphasis={ready ? 'primary' : 'quiet'}
                  tone={ready ? undefined : 'inherit'}
                  items={view.scheduleMenu}
                  onSelect={(value) => {
                    if (value === 'custom') notBuilt(labelOf(view.scheduleMenu, value));
                    else if (!ready) notify({ subject: 'slack-schedule', message: c.writeFirst });
                    else {
                      setDrafts((old) => ({ ...old, [target]: '' }));
                      notify({ subject: 'slack-schedule', tone: 'success', message: `${c.scheduled} ${labelOf(view.scheduleMenu, value)}.` });
                    }
                  }}
                />
              </div>
            </div>
          }
        />
        {reply && (
          <div data-dl-part="also-send">
            {/* binary-setting: a one-off choice for the reply being written, not a lasting setting; the reference shows a checkbox. */}
            <Checkbox label={`${c.alsoSend} #${channel}`} size="s" checked={alsoSend} onChange={setAlsoSend} />
          </div>
        )}
      </div>
    );
  };

  const renderMessage = (m: WorkspaceMessage, inThread = false) => {
    const avatarPic = pic(m.avatar);
    const thumbPic = pic(m.unfurl?.thumb);
    const bannerPic = pic(m.unfurl?.banner);
    const replyWord = m.replies === 1 ? c.replySingle : c.replies;
    return (
      <article
        key={m.id}
        data-dl="slack-message"
        data-grouped={m.grouped || undefined}
        data-hovered={m.hovered || undefined}
        aria-label={`${m.author}, ${m.time}`}
      >
        <div data-dl-part="avatar">
          {!m.grouped && <Avatar name={m.author} src={avatarPic.src || undefined} size={36} shape="square" decorative />}
        </div>
        <div data-dl-part="body">
          {!m.grouped && (
            <div data-dl-part="byline">
              <strong data-dl-part="author">{m.author}</strong>
              {m.statusEmoji && <span data-dl-part="status-emoji">{m.statusEmoji}</span>}
              <time data-dl-part="time">{m.time}</time>
            </div>
          )}
          {(m.text || m.mention) && (
            <div data-dl-part="msg-text">
              {m.mention && <span data-dl-part="mention">{m.mention}</span>}
              {m.mention && m.text ? ' ' : ''}
              {m.italic ? <em>{m.text}</em> : <span>{m.text}</span>}
              {m.edited && !m.subText && <span data-dl-part="edited"> ({c.edited ?? 'edited'})</span>}
            </div>
          )}
          {m.subText &&
            m.subText.split('\n').map((line, i, arr) => (
              <div key={i} data-dl-part="msg-text">
                <span>{line}</span>
                {m.edited && i === arr.length - 1 && <span data-dl-part="edited"> ({c.edited ?? 'edited'})</span>}
              </div>
            ))}
          {m.linkText && (
            <div data-dl-part="link-row">
              <span data-dl-part="link-chip">
                <Icon name="link" size="sm" />
                <Link href="#/app/slack/channel">{m.linkText}</Link>
              </span>
            </div>
          )}
          {m.afterLinkText && <Text>{m.afterLinkText}</Text>}
          {bannerPic.src && (
            <div data-dl-part="banner-media">
              <Image src={bannerPic.src} alt={bannerPic.alt} ratio="photo" width={308} height={205} rounded />
            </div>
          )}
          {m.file && (
            <div data-dl-part="file">
              <Icon name="file" size="lg" />
              <div data-dl-part="file-words">
                <strong>{m.file.name}</strong>
                <span>{m.file.detail}</span>
              </div>
            </div>
          )}
          {m.unfurl && (
            <div data-dl="slack-unfurl" data-has-thumb={thumbPic.src ? true : undefined}>
              <div data-dl-part="words">
                <strong data-dl-part="title">{m.unfurl.title}</strong>
                <div data-dl-part="excerpt">
                  <Text variant="body-sm" tone="muted">
                    {m.unfurl.text}
                  </Text>
                </div>
                <div data-dl-part="source">
                  <Icon name="globe" size="sm" />
                  <span>{m.unfurl.site}</span>
                </div>
              </div>
              {thumbPic.src && (
                <div data-dl-part="thumb">
                  <Image src={thumbPic.src} alt={thumbPic.alt} ratio="square" width={106} height={106} rounded={false} />
                </div>
              )}
            </div>
          )}
          {(m.reactions || added[m.id]?.length) && (
            <div data-dl-part="reactions">
              {m.reactions?.map((r, i) => (
                <span
                  key={r.label}
                  data-dl-part="reaction"
                  data-chosen={reactions[`${m.id}-${i}`] || undefined}
                  role="group"
                  aria-label={r.label}
                >
                  {/* binary-setting: a reaction is a reversible message annotation in a dense action row, not a setting. */}
                  <Button
                    label={`${r.emoji} ${r.count + (reactions[`${m.id}-${i}`] ? 1 : 0)}`}
                    emphasis="quiet"
                    tone="inherit"
                    size="xs"
                    data-reaction-label={r.label}
                    pressed={Boolean(reactions[`${m.id}-${i}`])}
                    onClick={() => setReactions((old) => ({ ...old, [`${m.id}-${i}`]: !old[`${m.id}-${i}`] }))}
                  />
                </span>
              ))}
              {added[m.id]?.map((ch) => (
                <span key={ch} data-dl-part="reaction" data-chosen role="group" aria-label={ch}>
                  {/* binary-setting: as the reactions above; pressing your own reaction again takes it back. */}
                  <Button
                    label={`${ch} 1`}
                    emphasis="quiet"
                    tone="inherit"
                    size="xs"
                    pressed
                    onClick={() => setAdded((old) => ({ ...old, [m.id]: old[m.id].filter((x) => x !== ch) }))}
                  />
                </span>
              ))}
              <span data-dl-part="reaction" data-add-reaction>{action(c.react, 'emoji-add', () => setPicker(m.id))}</span>
            </div>
          )}
          {Boolean(m.replies) && !inThread && (
            <div data-dl-part="reply-line">
              {(m.replyAvatars?.length ? m.replyAvatars : ['avatar02', 'avatar06']).map((avId, idx) => (
                <Avatar
                  key={`${m.id}-rep-${idx}`}
                  name={`${m.author} ${idx + 1}`}
                  src={pic(avId).src || undefined}
                  shape="square"
                  size={24}
                  decorative
                />
              ))}
              <Button label={`${m.replies} ${replyWord}`} size="xs" emphasis="quiet" tone="inherit" onClick={() => openThread(m)} />
            </div>
          )}
        </div>
        {!narrow && (
          <div data-dl-part="hover-actions" data-elevation="3" role="toolbar" aria-label={c.more}>
            {view.quickReactions.map((qr) => (
              <Button key={qr.label} label={qr.emoji} emphasis="quiet" size="xs" onClick={() => react(m.id, qr.emoji)} />
            ))}
            {emojiPicker(m)}
            {action(c.replyAction, 'comment', () => openThread(m))}
            {action(c.share, 'forward', () => notBuilt(c.share))}
            {/* binary-setting: saved for later is a reversible mark on one message in a dense action row, not a setting. */}
            <Button
              label={saved[m.id] ? c.unsave : c.save}
              icon="bookmark"
              iconOnly
              emphasis="quiet"
              tone="inherit"
              size="xs"
              pressed={Boolean(saved[m.id])}
              onClick={() => toggleSaved(m)}
            />
            {action(c.summarize, 'compose', () => notBuilt(c.summarize))}
            <MenuButton label={c.more} icon="more-vertical" iconOnly emphasis="quiet" tone="inherit" size="xs" items={view.messageMenu} onSelect={(value) => onMessageMenu(m, value)} />
          </div>
        )}
      </article>
    );
  };

  const botEmblem = pic('botMark');
  const currentUserPic = pic(view.currentUserAvatar);
  const huddlesHeroPic = pic('huddlesHero');
  const welcomeBubblePic = pic('welcomeBubble');

  const rowPages: Record<string, BrowsePage> = { Unreads: 'unreads', Threads: 'threads', Huddles: 'huddles', Saved: 'saved', Directories: 'directories' };
  const isRowSelected = (itemName: string, collapsible?: boolean) => {
    if (!collapsible && rowPages[itemName] && rowPages[itemName] === activePage) return true;
    if (activePage !== 'channel') return false;
    return collapsible ? itemName === channel : false;
  };

  const renderDirectories = () => {
    const dv = view.directoriesView;
    const filteredPeople = dv.people.filter(
      (p) => !dirQuery.trim() || p.name.toLowerCase().includes(dirQuery.trim().toLowerCase()) || p.role?.toLowerCase().includes(dirQuery.trim().toLowerCase()),
    );
    return (
      <div data-dl="slack-directories">
        <header data-dl-part="dir-head" data-density="compact">
          <Heading level={1} size={4}>
            {dv.title}
          </Heading>
          <IconOverrides
            icons={{
              ...(dirTab === 'people'
                ? {
                    person: {
                      v: '0 0 24 24',
                      g: { fill: 'currentColor', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' },
                      c: [['path', { d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5z' }]],
                    },
                  }
                : {}),
              inbox: {
                v: '0 0 24 24',
                g: { fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round' },
                c: [['path', { d: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.5 7l8.5 6 8.5-6' }]],
              },
            }}
          >
            <div data-dl-part="dir-tabs" role="navigation" aria-label={dv.title}>
              {dv.tabs.map((t) => (
                <span key={t.id} data-dl-part="dir-tab" data-current={dirTab === t.id || undefined}>
                  <Button label={t.label} icon={t.icon} size="xs" emphasis="quiet" tone="inherit" onClick={() => setDirTab(t.id)} />
                </span>
              ))}
            </div>
          </IconOverrides>
        </header>
        <ScrollArea label={dv.title}>
          <div data-dl="slack-directories-body">
            <div data-dl-part="dir-controls">
              <div data-dl-part="dir-toolbar">
                <div ref={dirSearchWrap} data-dl-part="dir-search">
                  <TextField
                    label={dv.searchPlaceholder}
                    hideLabel
                    type="search"
                    icon="search"
                    size="s"
                    placeholder={dv.searchPlaceholder}
                    inputRef={dirSearchBox}
                    value={dirQuery}
                    onChange={setDirQuery}
                  />
                </div>
                <Button label={dv.inviteLabel} size="s" onClick={() => notBuilt(dv.inviteLabel)} />
              </div>
              <div data-dl-part="dir-filters" data-density="compact">
                <div data-dl-part="filter-pills">
                  {dv.filters.map((f) => (
                    <span key={f.label} data-dl-part="filter-pill">
                      {f.icon && <Icon name={f.icon} size="sm" />}
                      <span>{f.label}</span>
                      <Icon name="chevron-down" size="sm" />
                    </span>
                  ))}
                </div>
                <span data-dl-part="sort-trigger">
                  <span>{dv.sortLabel}</span>
                  <Icon name="chevron-down" size="sm" />
                </span>
              </div>
            </div>
            <div data-dl="slack-people-grid">
              {filteredPeople.map((p) => {
                const pPic = pic(p.avatar);
                return (
                  <article key={p.name} data-dl="slack-person-card">
                    <div data-dl-part="portrait">
                      {pPic.src && <Image src={pPic.src} alt={pPic.alt} ratio="square" width={166} height={166} />}
                    </div>
                    <div data-dl-part="info">
                      <div data-dl-part="name-row">
                        <strong>{p.name.trim()}</strong>
                        <span data-dl-part="presence-dot" data-state={p.presence} aria-hidden="true" />
                      </div>
                      {p.role && <p data-dl-part="role">{p.role}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderHuddles = () => {
    const hv = view.huddlesView;
    return (
      <div data-dl="slack-huddles">
        <header data-dl-part="huddles-head" data-density="compact">
          <Heading level={1} size={4}>
            {hv.title}
          </Heading>
          <Button label={hv.newHuddle} icon="plus" size="xs" onClick={() => notBuilt(hv.newHuddle)} />
        </header>
        <ScrollArea label={hv.title}>
          <div data-dl="slack-huddles-body">
            {!huddlesHeroDismissed && (
              <section data-dl="slack-huddles-hero" aria-label={hv.heroTitle}>
                <div data-dl-part="hero-words">
                  <div data-dl-part="hero-text">
                    <Heading level={2} size={3}>
                      {hv.heroTitle}
                    </Heading>
                    <p data-dl-part="hero-copy">{hv.heroBody}</p>
                  </div>
                  <div data-dl-part="hero-cta">
                    <Button label={hv.heroAction} icon="headphones" emphasis="primary" size="s" onClick={() => notBuilt(hv.heroAction)} />
                  </div>
                </div>
                {huddlesHeroPic.src && (
                  <div data-dl-part="hero-art">
                    <Image src={huddlesHeroPic.src} alt={huddlesHeroPic.alt} ratio="natural" width={279} height={204} rounded={false} />
                  </div>
                )}
                <span data-dl-part="hero-close" data-density="compact">
                  {action(c.dismissBanner, 'close', () => setHuddlesHeroDismissed(true))}
                </span>
              </section>
            )}
            <div data-dl="slack-huddles-sections">
              <section data-dl="slack-huddles-group" aria-label={hv.dmTitle}>
                <div data-dl-part="group-head">
                  <strong>{hv.dmTitle}</strong>
                  <span> {hv.dmSubtitle}</span>
                </div>
                <div data-dl-part="dm-grid">
                  {hv.dms.map((dm) => {
                    const bPic = pic(dm.banner);
                    const lPic = pic(dm.leftAvatar);
                    const rPic = pic(dm.rightAvatar);
                    return (
                      <article key={dm.name} data-dl="slack-huddle-dm-card">
                        <div data-dl-part="dm-stage">
                          {bPic.src && <Image src={bPic.src} alt={bPic.alt} ratio="natural" width={288} height={108} />}
                          <div data-dl-part="dm-pair">
                            <span data-dl-part="pair-face" data-elevation="3">
                              <Avatar name={view.currentUser} src={lPic.src || undefined} shape="square" size={48} decorative />
                            </span>
                            <span data-dl-part="pair-face" data-elevation="3">
                              <Avatar name={dm.name} src={rPic.src || undefined} shape="square" size={48} decorative />
                            </span>
                          </div>
                        </div>
                        <div data-dl-part="dm-meta">
                          <div data-dl-part="dm-name">
                            <strong>{dm.name}</strong>
                            {dm.statusEmoji ? (
                              <span> {dm.statusEmoji}</span>
                            ) : (
                              <span data-dl-part="presence-dot" data-state={dm.presence ?? 'away'} aria-hidden="true" />
                            )}
                          </div>
                          <p data-dl-part="dm-status">{dm.status}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
              <section data-dl="slack-huddles-group" aria-label={hv.channelsTitle}>
                <div data-dl-part="group-head">
                  <strong>{hv.channelsTitle}</strong>
                  <span> {hv.channelsSubtitle}</span>
                </div>
                <div data-dl="slack-huddle-channel-list">
                  {hv.channels.map((ch, idx) => (
                    <div key={ch} data-dl-part="ch-row" data-divided={idx > 0 || undefined}>
                      <span data-dl-part="ch-tile" aria-hidden="true">
                        <Icon name="hash" size="sm" />
                      </span>
                      <strong># {ch}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderUnreads = () => {
    const uv = view.unreadsView;
    return (
      <div data-dl="slack-unreads">
        <header data-dl-part="unreads-head" data-density="compact">
          <div data-dl-part="unreads-title">
            <Heading level={1} size={4}>
              {uv.title}
            </Heading>
            <span data-dl-part="mini-ws">{view.workspaceBadge}</span>
          </div>
          <div data-dl-part="unreads-filters">
            <span data-dl-part="filter-drop">
              <span>{uv.filterLabel}</span>
              <Icon name="chevron-down" size="sm" />
            </span>
            <span data-dl-part="filter-drop">
              <span>{uv.sortLabel}</span>
              <Icon name="chevron-down" size="sm" />
            </span>
          </div>
        </header>
        <div data-dl-part="channel-band" data-density="compact">
          <span data-dl-part="band-title">
            <Button
              label={`# ${uv.channel}`}
              icon="caret-down"
              size="xs"
              emphasis="quiet"
              tone="inherit"
              onClick={() => setUnreadsCollapsed(!unreadsCollapsed)}
            />
          </span>
          <div data-dl-part="band-actions">
            <span data-dl-part="band-hint">{uv.countLabel}</span>
            <span data-dl-part="band-hint">
              {uv.pressLabel} <kbd data-dl-part="keycap">{uv.keycap}</kbd> {uv.toLabel}
            </span>
            <Button label={uv.markRead} size="xs" unavailable={unreadsCollapsed ? c.allRead : undefined} onClick={() => setUnreadsCollapsed(true)} />
          </div>
        </div>
        <ScrollArea label={uv.title} mode="always">
          {!unreadsCollapsed && (
            <div data-dl="slack-unreads-stream">
              <div data-dl-part="date-line">
                <span data-dl-part="date-pill">{uv.date}</span>
              </div>
              {uv.messages.map((m) => renderMessage(m))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderWelcomeBack = () => {
    const wv = view.welcomeBackView;
    const outerScrolls = narrow || short;
    const unreadsList = (
      <div data-dl="slack-welcome-unreads-list">
        {wv.unreadGroups.map((g) => (
          <div key={g.date} data-dl="slack-welcome-date-group">
            <div data-dl-part="date-band">{g.date}</div>
            {g.items.map((it) => {
              const itPic = pic(it.avatar);
              return (
                <div key={`${g.date}-${it.channel}`} data-dl="slack-welcome-msg-row">
                  <div data-dl-part="msg-main">
                    <div data-dl-part="msg-channel">
                      <strong data-dl-part="unread-tag">Unread</strong>
                      <span> in #{it.channel}</span>
                    </div>
                    <div data-dl-part="msg-content">
                      <Avatar name={it.author} src={itPic.src || undefined} shape="square" size={32} decorative />
                      <div data-dl-part="msg-words">
                        <div data-dl-part="msg-byline">
                          <strong>{it.author}</strong>
                          <time>{it.time}</time>
                        </div>
                        <p>{it.text}</p>
                      </div>
                    </div>
                  </div>
                  <div data-dl-part="msg-action" data-density="compact">
                    <Button
                      label={wv.viewMessage}
                      size="xs"
                      onClick={() => {
                        setActivePage('channel');
                        setChannel(it.channel);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

    const welcomeBody = (
      <div data-dl="slack-welcome-body">
        <div data-dl-part="top-label">
          <Heading level={1} size={4}>
            {wv.title}
          </Heading>
        </div>
        <div data-dl-part="hero">
          {welcomeBubblePic.src && (
            <div data-dl-part="hero-bubble">
              <Image src={welcomeBubblePic.src} alt={welcomeBubblePic.alt} ratio="natural" width={99} height={69} rounded={false} />
            </div>
          )}
          <strong data-dl-part="hero-title">{wv.heroTitle}</strong>
        </div>

        <section data-dl="slack-welcome-section" aria-label={wv.unreadHeading}>
          <div data-dl-part="sec-head">
            <strong>{wv.unreadHeading}</strong>
            <p>{wv.unreadSubtitle}</p>
          </div>
          <div data-dl="slack-welcome-unreads-card">
            {outerScrolls ? unreadsList : <ScrollArea label={wv.unreadHeading} mode="always">{unreadsList}</ScrollArea>}
          </div>
        </section>

        <section data-dl="slack-welcome-section" aria-label={wv.teammatesHeading}>
          <div data-dl-part="sec-head">
            <strong>{wv.teammatesHeading}</strong>
            <p>{wv.teammatesSubtitle}</p>
          </div>
          <div data-dl="slack-welcome-teammates">
            {wv.teammates.map((tm) => {
              const tmPic = pic(tm.avatar);
              return (
                <article key={tm.name} data-dl="slack-teammate-card">
                  <div data-dl-part="tm-banner">
                    {tmPic.src && <Image src={tmPic.src} alt={tmPic.alt} ratio="natural" width={383} height={175} />}
                  </div>
                  <div data-dl-part="tm-body">
                    <div data-dl-part="tm-name">
                      <strong>{tm.name}</strong>
                      <span data-dl-part="presence-dot" data-state={tm.snooze ? 'snooze' : 'away'} aria-hidden="true" />
                    </div>
                    <div data-dl-part="tm-cta" data-density="compact">
                      <Button label={wv.sayHi} size="xs" onClick={() => openDm(tm.name)} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );

    return (
      <div data-dl="slack-welcome">
        {outerScrolls ? <ScrollArea label={wv.title}>{welcomeBody}</ScrollArea> : welcomeBody}
      </div>
    );
  };

  const renderSlackbot = () => {
    const sb = view.slackbotView;
    const sbReady = Boolean(slackbotDraft.trim());
    return (
      <div data-dl="slack-slackbot">
        <div data-dl-part="sb-top" data-density="compact">
          {historyMenu}
        </div>
        <ScrollArea label={sb.sidebarTitle}>
          <div data-dl="slack-slackbot-stage">
            <div data-dl="slack-slackbot-center">
              <div data-dl-part="sb-hero">
                {botEmblem.src && (
                  <span data-dl-part="sb-mark">
                    <Image src={botEmblem.src} alt={botEmblem.alt} ratio="square" width={30} height={30} rounded={false} />
                  </span>
                )}
                <Heading level={1} size={3}>
                  {sb.heroTitle}
                </Heading>
              </div>

              <div data-dl-part="sb-prompt-wrap">
                <div data-dl="slack-slackbot-prompt">
                  <TextArea
                    label={sb.promptPlaceholder}
                    hideLabel
                    grow
                    width="fill"
                    rows={1}
                    placeholder={sb.promptPlaceholder}
                    inputRef={(el) => {
                      composerBoxes.current.slackbot = el;
                    }}
                    value={slackbotDraft}
                    onChange={setSlackbotDraft}
                    onEnter={() => setSlackbotDraft('')}
                    toolbar={
                      <div data-dl="slack-tools">
                        <div data-dl-part="group">
                          <span data-dl-part="add-circle">{attachMenu}</span>
                          {action(c.mention, 'at', () => {
                            setSlackbotDraft((d) => `${d}${d && !d.endsWith(' ') ? ' ' : ''}@`);
                            focusComposer('slackbot');
                          })}
                        </div>
                        <div data-dl-part="group">
                          {action(c.audio, 'mic', () => notBuilt(c.audio))}
                          <Button
                            label={c.send}
                            icon="send"
                            iconOnly
                            size="xs"
                            emphasis={sbReady ? 'primary' : 'quiet'}
                            tone={sbReady ? undefined : 'inherit'}
                            unavailable={!sbReady ? sb.promptPlaceholder : undefined}
                            onClick={() => setSlackbotDraft('')}
                          />
                        </div>
                      </div>
                    }
                  />
                </div>
                <p data-dl-part="sb-disclaimer">{sb.disclaimer}</p>
              </div>

              <section data-dl="slack-slackbot-recommended" aria-label={sb.recommendedTitle}>
                <div data-dl-part="rec-head">
                  <strong>{sb.recommendedTitle}</strong>
                  <Icon name="chevron-down" size="sm" />
                </div>
                <div data-dl-part="rec-grid">
                  {sb.prompts.map((pr) => (
                    <div key={pr.id} data-dl="slack-prompt-card" data-tone={pr.tone}>
                      <span data-dl-part="prompt-chip" aria-hidden="true">
                        <Icon name={pr.icon} size="sm" />
                      </span>
                      <Button
                        label={pr.text}
                        size="s"
                        emphasis="quiet"
                        tone="inherit"
                        align="start"
                        onClick={() => setSlackbotDraft(pr.text)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const isSlackbot = activePage === 'slackbot';
  const everyMessage = (() => {
    const seen = new Set<string>();
    return [...view.messages, ...view.amaChannel.messages, ...view.unreadsView.messages, ...Object.values(sent).flat()].filter(
      (m) => !deleted.includes(m.id) && !seen.has(m.id) && Boolean(seen.add(m.id)),
    );
  })();

  const pageShell = (title: string, body: ReactNode, foot?: ReactNode, lead?: ReactNode) => (
    <div data-dl="slack-page">
      <header data-dl-part="page-head" data-density="compact">
        {lead}
        <Heading level={1} size={4}>
          {title}
        </Heading>
      </header>
      <ScrollArea label={title}>{body}</ScrollArea>
      {foot}
    </div>
  );

  const renderPage = (): ReactNode => {
    if (activePage === 'dms') {
      const known = new Set(view.dms.map((d) => d.name));
      const started = Object.keys(sent)
        .filter((k) => k.startsWith('dm-') && !known.has(k.slice(3)))
        .map((k) => ({ name: k.slice(3), avatar: '', presence: undefined, preview: sent[k][sent[k].length - 1]?.text ?? '' }));
      return pageShell(
        c.dmsTitle,
        <div data-dl="slack-dm-list">
          {[...started, ...view.dms].map((d) => {
            const last = sent[`dm-${d.name}`]?.at(-1);
            return (
              <ListItem
                key={d.name}
                role="button"
                size="l"
                label={d.name}
                thumbnail={pic(d.avatar).src || undefined}
                avatar={pic(d.avatar).src ? undefined : { name: d.name }}
                description={last ? `${c.you}: ${last.text}` : d.preview}
                onClick={() => openDm(d.name)}
              />
            );
          })}
        </div>,
      );
    }
    if (activePage === 'dm') {
      const person = view.dms.find((d) => d.name === dmWith);
      return pageShell(
        dmWith,
        <div data-dl="slack-search-results">
          <div data-dl-part="results-head">
            <Text tone="muted">{`${c.dmStart} ${dmWith}${dmWith.endsWith('.') ? '' : '.'}`}</Text>
          </div>
          {(sent[`dm-${dmWith}`] ?? []).map((m) => renderMessage(m))}
        </div>,
        <div data-dl="slack-composer-wrap">{composer(`dm-${dmWith}`, false, `${c.messagePrefix} ${dmWith}`)}</div>,
        <Avatar name={dmWith} src={pic(person?.avatar).src || undefined} shape="square" size={24} presence={person?.presence} decorative />,
      );
    }
    if (activePage === 'compose') {
      return pageShell(
        c.newMessage,
        <div data-dl="slack-compose-to">
          <TextField label={c.to} hideLabel prefix={`${c.to}:`} placeholder={c.toHint} value={toField} onChange={setToField} />
        </div>,
        <div data-dl="slack-composer-wrap">{composer('compose', false, c.startMessage)}</div>,
      );
    }
    if (activePage === 'threads') {
      return pageShell(
        c.threadsTitle,
        <div data-dl="slack-search-results">{everyMessage.filter((m) => m.replies).map((m) => renderMessage(m))}</div>,
      );
    }
    if (activePage === 'saved') {
      const list = everyMessage.filter((m) => saved[m.id]);
      return pageShell(
        c.savedTitle,
        list.length ? (
          <div data-dl="slack-search-results">{list.map((m) => renderMessage(m))}</div>
        ) : (
          <div data-dl="slack-file-results">
            <EmptyState title={c.savedEmpty} reason="first-use">
              {c.savedHint}
            </EmptyState>
          </div>
        ),
      );
    }
    const title = activePage === 'todos' ? c.todosTitle : c.agentsTitle;
    return pageShell(
      title,
      <div data-dl="slack-file-results">
        <EmptyState title={title} reason="first-use">
          {`${title} ${c.notInReplica}`}
        </EmptyState>
      </div>,
    );
  };
  const activityItems = view.activityView.items.filter((it) => !activityUnreadsOnly || it.unread || it.badge);

  const renderActivityPopover = () => (
    <div data-dl="slack-activity-panel">
      <div data-dl-part="act-head">
        <div data-dl-part="act-title">
          <strong>{view.activityView.title}</strong>
          <span data-dl-part="act-count">
            <Icon name="at" size="sm" />
            <span>{view.activityView.countLabel}</span>
          </span>
        </div>
        <div data-dl-part="act-toggle">
          <span>{view.activityView.unreadsLabel}</span>
          <Switch
            label={view.activityView.unreadsLabel}
            hideLabel
            size="s"
            checked={activityUnreadsOnly}
            onChange={setActivityUnreadsOnly}
          />
        </div>
      </div>
      <div data-dl-part="act-body">
        <ScrollArea label={view.activityView.title} mode="always">
          <div data-dl="slack-activity-list">
            {activityItems.map((it) => {
              const avPic = pic(it.avatar);
              return (
                <article key={it.id} data-dl="slack-activity-row" data-unread={it.unread || undefined}>
                  <div data-dl-part="act-context">
                    <Icon name="at" size="sm" />
                    <span>{it.context}</span>
                  </div>
                  <div data-dl-part="act-main">
                    <Avatar name={it.author} src={avPic.src || undefined} shape="square" size={36} decorative />
                    <div data-dl-part="act-words">
                      <div data-dl-part="act-byline">
                        <strong>{it.author}</strong>
                        <time>{it.date}</time>
                      </div>
                      <p data-dl-part="act-text">
                        {it.mention && <span data-dl-part="act-mention">{it.mention}</span>}
                        {it.mention ? ' ' : ''}
                        <span>{it.text}</span>
                      </p>
                    </div>
                    {it.badge && <span data-dl-part="act-badge">{it.badge}</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div
      {...data}
      ref={root}
      data-dl="slack-workspace"
      data-dual-rail={dualRail || undefined}
      data-slackbot={isSlackbot || undefined}
      data-narrow={narrow || undefined}
      data-short={short || undefined}
      data-material="solid"
    >
      <header data-dl-part="titlebar" data-density="compact">
        <div data-dl-part="left-chrome">
          <div data-dl-part="menu-group">
            <MenuButton
              label={c.appMenu}
              icon="menu"
              iconOnly
              chevron={false}
              emphasis="quiet"
              tone="inherit"
              size="xs"
              items={view.appMenu}
              onSelect={onAppMenu}
            />
            {!isSlackbot && action(c.toggleSidebar, 'sidebar', () => setDualRail(!dualRail))}
          </div>
          <div data-dl-part="history">
            <Button
              label={c.back}
              icon="arrow-start"
              iconOnly
              emphasis="quiet"
              tone="inherit"
              size="xs"
              unavailable={!past.length && activePage === 'channel' && !search ? c.noHistory : undefined}
              onClick={goBack}
            />
            <Button
              label={c.forward}
              icon="arrow-end"
              iconOnly
              emphasis="quiet"
              tone="inherit"
              size="xs"
              unavailable={future.length ? undefined : c.noForward}
              onClick={goForward}
            />
            {historyMenu}
          </div>
        </div>
        <div data-dl-part="center-chrome">
          <div data-dl-part="search-pill" data-open={search || undefined}>
            {search ? (
              <TextField
                label={c.searchHint}
                hideLabel
                type="search"
                icon="search"
                size="xs"
                placeholder={isSlackbot ? view.slackbotView.searchPlaceholder : c.search}
                inputRef={searchBox}
                value={query}
                onChange={setQuery}
              />
            ) : (
              <Button
                label={isSlackbot ? view.slackbotView.searchPlaceholder : c.search}
                icon="search"
                size="xs"
                tone="inherit"
                align="start"
                emphasis="quiet"
                onClick={() => {
                  userTriggeredSearch.current = true;
                  setSearch(true);
                }}
              />
            )}
          </div>
          {botEmblem.src && (
            <span data-dl-part="bot-trigger">
              <Image src={botEmblem.src} alt={botEmblem.alt} ratio="square" width={20} height={20} rounded={false} />
            </span>
          )}
        </div>
        <div data-dl-part="window-controls">
          <span data-dl-part="help-slot">{action(c.help, 'help', () => notBuilt(c.help))}</span>
          <span data-dl-part="win-btn">{action(c.minimize, 'minus', windowOnly)}</span>
          <span data-dl-part="win-btn">{action(c.maximize, 'window-maximize', windowOnly)}</span>
          <span data-dl-part="win-btn">{action(c.closeWindow, 'close', windowOnly)}</span>
        </div>
      </header>

      {dualRail && (
        <nav data-dl-part="ws-switcher" data-density="compact" aria-label={c.addWorkspace}>
          {view.dualRailWorkspaces.map((ws) => (
            <div key={ws.id} data-dl-part="ws-tile" data-tone={ws.tone} data-current={ws.current || undefined}>
              <span data-dl-part="ws-letters">{ws.initials}</span>
              {ws.mentions && (
                <span data-dl-part="ws-badge">
                  <Badge kind="count" emphasis="strong" tone="accent" count={ws.mentions} label={`${ws.mentions} ${c.mentions}`} size="s" />
                </span>
              )}
            </div>
          ))}
          <span data-dl-part="ws-add">
            <MenuButton
              label={c.addWorkspace}
              icon="plus"
              iconOnly
              chevron={false}
              emphasis="quiet"
              tone="inherit"
              size="xs"
              side="inline"
              items={view.workspaceMenu}
              onSelect={(value) => notBuilt(labelOf(view.workspaceMenu, value))}
            />
          </span>
        </nav>
      )}

      <nav data-dl-part="rail" data-density="compact" aria-label={view.name}>
        {!dualRail && (
          <div data-dl-part="workspaces">
            {isSlackbot ? (
              <div data-dl-part="ws-tile" data-tone="neutral">
                <span data-dl-part="ws-letters">{view.slackbotView.workspaceInitials}</span>
              </div>
            ) : (
              view.workspaces.map((ws) => (
                <div key={ws.id} data-dl-part="ws-tile" data-tone={ws.tone} data-current={ws.current || undefined}>
                  <span data-dl-part="ws-letters">{ws.initials}</span>
                  {ws.mentions && (
                    <span data-dl-part="ws-badge">
                      <Badge kind="count" emphasis="strong" tone="accent" count={ws.mentions} label={`${ws.mentions} ${c.mentions}`} size="s" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        <div data-dl-part="rail-items">
          {isSlackbot && (
            <div data-dl-part="rail-item" data-current data-slackbot-slot>
              <span data-dl-part="rail-icon">
                {botEmblem.src && (
                  <span data-dl-part="rail-emblem">
                    <Image src={botEmblem.src} alt={botEmblem.alt} ratio="square" width={24} height={24} rounded={false} />
                  </span>
                )}
              </span>
              <span data-dl-part="rail-label">{view.slackbotView.railLabel}</span>
            </div>
          )}
          {view.rail.map((r, i) => {
            const railCount = isSlackbot
              ? undefined
              : r.id === 'activity' && (isAma || dualRail)
                ? view.amaChannel.activityMentions
                : r.mentions;
            const railHere = activityOpen
              ? 'activity'
              : activePage === 'dms' || activePage === 'dm'
                ? 'dms'
                : activePage === 'todos' || activePage === 'agents'
                  ? activePage
                  : view.rail[0]?.id;
            const currentSlot = !isSlackbot && r.id === railHere;
            return (
              <div data-dl-part="rail-item" data-current={currentSlot || undefined} key={r.id}>
                <span data-dl-part="rail-icon" data-activity-anchor={r.id === 'activity' || undefined}>
                  {r.id === 'activity' ? (
                    <Popover
                      side="end"
                      open={activityOpen}
                      onOpenChange={setActivityOpen}
                      trigger={{
                        label: r.label,
                        icon: r.icon,
                        iconOnly: true,
                        emphasis: 'quiet',
                        tone: 'inherit',
                      }}
                    >
                      {renderActivityPopover()}
                    </Popover>
                  ) : (
                    <Button
                      label={r.label}
                      icon={r.icon}
                      iconOnly
                      emphasis="quiet"
                      tone="inherit"
                      onClick={() => {
                        if (r.id === 'files') visit({ page: 'channel', channel, tab: 'files' });
                        else if (r.id === 'dms') visit({ page: 'dms' });
                        else if (r.id === 'todos' || r.id === 'agents') visit({ page: r.id });
                        else goHome();
                      }}
                    />
                  )}
                  {i === 0 && !dualRail && !isSlackbot && <span data-dl-part="home-dot" aria-hidden="true" />}
                  {railCount && (
                    <span data-dl-part="rail-badge">
                      <Badge kind="count" emphasis="strong" tone="accent" count={railCount} label={`${railCount} ${c.mentions}`} size="s" />
                    </span>
                  )}
                </span>
                <span data-dl-part="rail-label">{r.label}</span>
              </div>
            );
          })}
          {isSlackbot && (
            <div data-dl-part="rail-item">
              <span data-dl-part="rail-icon">
                <Button
                  label={view.slackbotView.adminLabel}
                  icon="settings"
                  iconOnly
                  emphasis="quiet"
                  tone="inherit"
                  onClick={() => notBuilt(view.slackbotView.adminLabel)}
                />
              </span>
              <span data-dl-part="rail-label">{view.slackbotView.adminLabel}</span>
            </div>
          )}
        </div>
        <div data-dl-part="rail-bottom">
          <span data-dl-part="rail-circle" data-open={createMenuOpen || undefined}>
            <MenuButton
              label={c.createMenu}
              icon={createMenuOpen ? 'close' : 'plus'}
              iconOnly
              emphasis="quiet"
              tone="inherit"
              size="s"
              side="inline"
              heading={view.createHeading}
              open={createMenuOpen}
              onOpenChange={setCreateMenuOpen}
              items={view.createMenu}
              onSelect={onCreate}
            />
          </span>
          <span data-dl-part="rail-circle">
            <Button label={c.themeToggle} icon="scheme-dark" iconOnly emphasis="quiet" tone="inherit" size="s" onClick={toggleTheme} />
          </span>
          <span data-dl-part="rail-avatar">
            <Avatar name={view.currentUser} src={currentUserPic.src || undefined} shape="square" presence="available" size={36} />
          </span>
        </div>
      </nav>

      <div data-dl-part="window" data-has-banner={(isSlackbot && !slackbotBannerDismissed) || undefined}>
        <aside data-dl-part="sidebar" data-density="compact" aria-label={isSlackbot ? view.slackbotView.sidebarTitle : view.name}>
          <div data-dl-part="workspace-head">
            <strong data-dl-part="workspace-name">
              <span>{isSlackbot ? view.slackbotView.sidebarTitle : view.name}</span>
              {!isSlackbot && <Icon name="chevron-down" size="sm" />}
            </strong>
            <span data-dl-part="head-actions">
              {!isSlackbot && (
                <MenuButton
                  label={c.sidebarSettings}
                  icon="settings"
                  iconOnly
                  emphasis="quiet"
                  tone="inherit"
                  size="xs"
                  items={filterItems}
                  open={filterMenuOpen}
                  onOpenChange={setFilterMenuOpen}
                  openSubmenu={filterMenuOpen ? 'filter-sort' : undefined}
                  onSelect={onFilterMenu}
                />
              )}
              {action(c.compose, 'compose', () => visit({ page: 'compose' }))}
            </span>
          </div>

          <ScrollArea label={isSlackbot ? view.slackbotView.sidebarTitle : view.name}>
            {isSlackbot ? (
              <div data-dl="slack-sidebar-content">
                <section data-dl="slack-nav-section" aria-label={view.slackbotView.sidebarTitle}>
                  <div data-dl-part="rows">
                    {view.slackbotView.navItems.map((navIt) => (
                      <div
                        key={navIt.id}
                        data-dl-part="row"
                        data-current={slackbotNav === navIt.id || undefined}
                        data-was-unread={slackbotNav === navIt.id || undefined}
                      >
                        <Button
                          label={navIt.label}
                          icon={navIt.icon}
                          size="xs"
                          emphasis="quiet"
                          align="start"
                          tone="inherit"
                          onClick={() => setSlackbotNav(navIt.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
                <section data-dl="slack-nav-section" data-divider aria-label={view.slackbotView.starredTitle}>
                  <div data-dl-part="section-title">
                    <Icon name="caret-down" size="sm" />
                    <span>{view.slackbotView.starredTitle}</span>
                  </div>
                  <p data-dl-part="section-hint">
                    <span>{view.slackbotView.starredHintBefore}</span>
                    <span>{view.slackbotView.starredHintEmoji}</span>
                    <span>{view.slackbotView.starredHintAfter}</span>
                  </p>
                </section>
                <section data-dl="slack-nav-section" aria-label={view.slackbotView.recentsTitle}>
                  <div data-dl-part="section-title">
                    <Icon name="caret-down" size="sm" />
                    <span>{view.slackbotView.recentsTitle}</span>
                  </div>
                  <div data-dl-part="rows">
                    <div data-dl-part="row">
                      <Button
                        label={view.slackbotView.allConversations}
                        icon="clock"
                        size="xs"
                        emphasis="quiet"
                        align="start"
                        tone="inherit"
                        onClick={() => visit({ page: 'channel', channel: view.channel })}
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <>
            {dualRail && !welcomeDismissed && (
              <div data-dl="slack-welcome-card" data-active={activePage === 'welcome-back' || undefined}>
                <div data-dl-part="welcome-top">
                  <span data-dl-part="welcome-title">
                    <Icon name="emoji" size="sm" />
                    <strong>{view.welcomePrompt.title}</strong>
                  </span>
                  {action(c.dismissBanner, 'close', () => setWelcomeDismissed(true))}
                </div>
                <div data-dl-part="welcome-cta">
                  <Button
                    label={view.welcomePrompt.cta}
                    size="s"
                    align="start"
                    emphasis="quiet"
                    tone="inherit"
                    onClick={() => setActivePage('welcome-back')}
                  />
                  <span data-dl-part="welcome-chevron" aria-hidden="true">
                    <Icon name="chevron-end" size="sm" />
                  </span>
                </div>
              </div>
            )}
            <div data-dl="slack-sidebar-content">

              {!dualRail && !vipDismissed && (
                <div data-dl="slack-vip-card">
                  <div data-dl-part="vip-top">
                    <p data-dl-part="vip-copy">
                      <Icon name="comment" size="sm" />
                      <span> {view.vipPrompt.before}</span>
                      <strong>{view.vipPrompt.bold}</strong>
                      <span>{view.vipPrompt.after}</span>
                    </p>
                    <span data-dl-part="vip-close">{action(c.dismissBanner, 'close', () => setVipDismissed(true))}</span>
                  </div>
                  <div data-dl-part="vip-actions">
                    <span data-dl-part="vip-later">
                      <Button label={view.vipPrompt.later} size="xs" emphasis="quiet" tone="inherit" onClick={() => setVipDismissed(true)} />
                    </span>
                    <span data-dl-part="vip-start">
                      <Button label={view.vipPrompt.start} size="xs" emphasis="quiet" tone="inherit" onClick={() => setVipOpen(true)} />
                    </span>
                  </div>
                </div>
              )}

              <div data-dl-part="find-box">
                {finding ? (
                  <TextField
                    label={c.findConversation}
                    hideLabel
                    type="search"
                    icon="list-search"
                    size="xs"
                    placeholder={c.findConversation}
                    value={sidebarFilter}
                    onChange={setSidebarFilter}
                  />
                ) : (
                  <div data-dl="slack-find-pill">
                    <Button
                      label={c.findConversation}
                      icon="list-search"
                      size="xs"
                      emphasis="quiet"
                      tone="inherit"
                      align="start"
                      onClick={() => setFinding(true)}
                    />
                  </div>
                )}
              </div>

              {sections.map((section, sIdx) => (
                <section
                  data-dl="slack-nav-section"
                  data-divider={section.dividerBefore || undefined}
                  data-channels={section.collapsible || undefined}
                  key={section.title ?? `sec-${sIdx}`}
                >
                  {section.title && (
                    <div data-dl-part="section-title">
                      <Icon name={section.collapsible ? 'hash-box' : 'caret-down'} size="sm" />
                      <span>{section.title}</span>
                    </div>
                  )}
                  <div data-dl-part="rows">
                    {section.items.map((item) => {
                      const itemPic = pic(item.avatar);
                      const overrideBadge = !dualRail && isAma ? view.amaChannel.channelBadges[item.name] : undefined;
                      const rawBadge = overrideBadge ?? (item.mentions ? (item.mentionsLabel ?? String(item.mentions)) : undefined);
                      const selected = isRowSelected(item.name, section.collapsible);
                      const badgeLabel = !dualRail && isAma && selected ? undefined : rawBadge;
                      const isUnread = !selected && (item.unread || Boolean(overrideBadge));
                      return (
                        <div
                          key={item.name}
                          data-dl-part="row"
                          data-person={item.presence ? true : undefined}
                          data-unread={isUnread || undefined}
                          data-was-unread={item.unread || undefined}
                          data-current={selected || undefined}
                        >
                          {item.presence && (
                            <span data-dl-part="row-avatar">
                              <Avatar
                                name={item.name}
                                src={itemPic.src || undefined}
                                shape="square"
                                size={20}
                                presence={item.presence}
                                decorative
                              />
                            </span>
                          )}
                          <Button
                            label={item.name}
                            icon={item.icon}
                            size="xs"
                            emphasis="quiet"
                            align="start"
                            tone="inherit"
                            onClick={() => {
                              const page = section.collapsible ? undefined : rowPages[item.name];
                              if (page) visit({ page, channel });
                              else if (section.collapsible) visit({ page: 'channel', channel: item.name });
                              else notBuilt(item.name);
                            }}
                          />
                          {badgeLabel && <span data-dl-part="count-pill">{badgeLabel}</span>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
              </>
            )}
          </ScrollArea>

          {!isSlackbot && (
            <div data-dl-part="more-unreads" data-elevation="3">
              <Button label={view.moreUnreadsLabel} size="xs" emphasis="quiet" tone="inherit" onClick={() => visit({ page: 'unreads', channel })} />
            </div>
          )}
        </aside>

        <main key={fresh} data-dl-part="conversation" data-page={activePage !== 'channel' ? activePage : undefined}>
          {activePage === 'slackbot' ? (
            renderSlackbot()
          ) : activePage === 'directories' ? (
            renderDirectories()
          ) : activePage === 'huddles' ? (
            renderHuddles()
          ) : activePage === 'unreads' ? (
            renderUnreads()
          ) : activePage === 'welcome-back' ? (
            renderWelcomeBack()
          ) : activePage !== 'channel' ? (
            renderPage()
          ) : (
            <>
              <header data-dl-part="channel-head" data-density="compact">
            <div data-dl-part="channel-lead">
              {/* binary-setting: starring is a reversible mark on this channel, shown in place as the reference does. */}
              <Button
                label={starred[channel] ? c.unstarChannel : c.starChannel}
                icon="star"
                iconOnly
                emphasis="quiet"
                tone="inherit"
                size="xs"
                pressed={Boolean(starred[channel])}
                onClick={() => setStarred((s) => ({ ...s, [channel]: !s[channel] }))}
              />
              <div data-dl-part="channel-title">
                <Icon name="hash" size="sm" />
                <Heading level={1} size={4}>
                  {channel}
                </Heading>
              </div>
              <div data-dl-part="channel-topic">
                {isAma ? (
                  <span>{view.amaChannel.topicText}</span>
                ) : (
                  <>
                    <span>{view.topicPrefix}</span>
                    <span data-dl-part="mini-ws">{view.workspaceBadge}</span>
                    <span>{view.topicMiddle}</span>
                    <Link href="#/app/slack/channel">{view.topicLink}</Link>
                  </>
                )}
              </div>
            </div>
            <div data-dl-part="channel-actions">
              <span data-dl-part="facepile">
                <AvatarGroup
                  members={view.members.map((m) => ({ name: m.name, src: pic(m.avatar).src || undefined }))}
                  label={c.members}
                  size={24}
                  shape="square"
                  max={3}
                />
                <span data-dl-part="member-count">{activeMemberCount}</span>
              </span>
              <span data-dl-part="huddle">
                {headAction(c.huddle, 'headphones', () => notBuilt(c.huddle))}
                <MenuButton
                  label={c.huddleOptions}
                  icon="chevron-down"
                  iconOnly
                  chevron={false}
                  emphasis="quiet"
                  tone="inherit"
                  size="xs"
                  items={view.huddleMenu}
                  onSelect={(value) =>
                    value === 'copy-link'
                      ? copyText(`${location.href.split('#')[0]}#/app/slack/huddles`, c.linkCopied)
                      : notBuilt(labelOf(view.huddleMenu, value))
                  }
                />
              </span>
              <MenuButton
                label={c.notifications}
                icon="bell"
                iconOnly
                chevron={false}
                emphasis="quiet"
                tone="inherit"
                size="xs"
                items={view.notificationMenu.map((i) => (i.value === 'more' ? i : { ...i, checked: i.value === notifyLevel }))}
                onSelect={(value) => {
                  if (value === 'more') notBuilt(labelOf(view.notificationMenu, value));
                  else {
                    setNotifyLevel(value);
                    notify({ subject: 'slack-notify', tone: 'success', message: `${c.notifyLevel} ${labelOf(view.notificationMenu, value)}.` });
                  }
                }}
              />
              {headAction(c.searchChannel, 'search', () => {
                if (search) searchBox.current?.focus({ preventScroll: true });
                userTriggeredSearch.current = true;
                setSearch(true);
              })}
              <MenuButton
                label={c.channelMenu}
                icon="more-vertical"
                iconOnly
                emphasis="quiet"
                tone="inherit"
                size="xs"
                items={view.channelMenu.map((i) => (i.value === 'star' && starred[channel] ? { ...i, label: c.unstarChannel } : i))}
                open={channelMenuOpen}
                onOpenChange={setChannelMenuOpen}
                onSelect={onChannelMenu}
              />
            </div>
          </header>

          <div data-dl-part="tabs" data-density="compact" role="navigation" aria-label={channel}>
            {activeTabs.map((t) => (
              <span key={t.id} data-dl-part="tab" data-current={tab === t.id || undefined}>
                <Button
                  label={t.label}
                  icon={t.icon}
                  emphasis="quiet"
                  size="xs"
                  tone="inherit"
                  onClick={() => {
                    if (tab === t.id && !search && t.id === 'messages') focusComposer(channel);
                    else if (tab === t.id && !search) setFresh((f) => f + 1);
                    setTab(t.id);
                    setSearch(false);
                  }}
                />
              </span>
            ))}
            <span data-dl-part="tab-plus">
              {action(c.addTab, 'plus', () => notBuilt(c.addTab))}
              <span data-dl-part="tab-dot" aria-hidden="true" />
            </span>
          </div>

          <div data-dl-part="timeline-stage">
            {!newBannerDismissed && !isAma && view.newMessagesBanner && !search && tab === 'messages' && (
              <div data-dl="slack-new-pill" data-elevation="3">
                <span>{view.newMessagesBanner}</span>
                {action(c.dismissBanner, 'close', () => setNewBannerDismissed(true))}
              </div>
            )}
            {isAma && !search && tab === 'messages' && messages[0]?.dateAbove && (
              <div data-dl="slack-sticky-date" data-elevation="3">
                <span>{messages[0].dateAbove}</span>
                <Icon name="chevron-down" size="sm" />
              </div>
            )}
            <ScrollArea label={search ? c.results : c.messages} mode="always" viewportRef={timeline}>
              {search ? (
                <div data-dl="slack-search-results">
                  <div data-dl-part="results-head">
                    <Heading level={2} size={4}>
                      {c.results}
                    </Heading>
                  </div>
                  {messages.filter((m) => !query || m.text.toLowerCase().includes(query.toLowerCase())).map((m) => renderMessage(m))}
                  {query && !messages.some((m) => m.text.toLowerCase().includes(query.toLowerCase())) && <Text>{c.emptySearch}</Text>}
                </div>
              ) : tab === 'files' ? (
                <div data-dl="slack-file-results">
                  <div data-dl-part="results-head">
                    <Heading level={2} size={4}>
                      {c.allFiles}
                    </Heading>
                  </div>
                  {messages.filter((m) => m.file || m.unfurl).map((m) => renderMessage(m))}
                </div>
              ) : tab !== 'messages' ? (
                <div data-dl="slack-file-results">
                  <EmptyState title={c.canvas} reason="first-use">
                    {view.topicMiddle}
                  </EmptyState>
                </div>
              ) : (
                <div data-dl="slack-timeline">
                  {messages.map((m, idx) => (
                    <div key={m.id} data-dl="slack-message-group">
                      {m.dateAbove && !(isAma && idx === 0) && (
                        <div data-dl-part="date">
                          <span data-dl-part="date-pill">
                            <span>{m.dateAbove}</span>
                            <Icon name="chevron-down" size="sm" />
                          </span>
                        </div>
                      )}
                      {m.isNew && (
                        <div data-dl-part="new-line">
                          <span>{c.newMessages}</span>
                        </div>
                      )}
                      {renderMessage(m)}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div data-dl="slack-composer-wrap">{composer(channel)}</div>
            </>
          )}
        </main>

        {thread && (
          <aside
            ref={threadPanel}
            data-dl-part="thread"
            data-density="compact"
            role={narrow ? 'main' : undefined}
            aria-label={c.thread}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !event.defaultPrevented) {
                event.stopPropagation();
                closeThread();
              }
            }}
          >
            <div data-dl-part="thread-head">
              <strong>{c.thread}</strong>
              <span data-dl-part="thread-channel">#{channel}</span>
              {headAction(c.popout, 'external', () => notBuilt(c.popout))}
              {headAction(c.closeThread, 'close', closeThread)}
            </div>
            <ScrollArea label={c.thread}>
              <div data-dl="slack-thread-content">
                {renderMessage(thread, true)}
                <div data-dl-part="reply-count">
                  {view.replies.length} {c.replies}
                </div>
                {[...view.replies, ...(sent[`thread-${thread.id}`] ?? [])].map((m) => renderMessage(m, true))}
              </div>
            </ScrollArea>
            <div data-dl="slack-composer-wrap">{composer(`thread-${thread.id}`, true)}</div>
          </aside>
        )}
        {isSlackbot && !slackbotBannerDismissed && (
          <div data-dl-part="org-banner" data-density="compact">
            <p data-dl-part="banner-copy">
              <span>{view.slackbotView.bannerText} </span>
              <Button label={view.slackbotView.bannerLink} tone="link" onClick={() => notBuilt(view.slackbotView.bannerLink)} />
            </p>
            <span data-dl-part="banner-close">
              {action(c.dismissBanner, 'close', () => setSlackbotBannerDismissed(true))}
            </span>
          </div>
        )}
      </div>

      <Dialog
        open={creating}
        onClose={() => {
          setCreating(false);
          setChannelName('');
        }}
        title={c.createChannel}
        actions={
          <>
            <span data-dl="slack-step">{c.step}</span>
            <Button
              label={c.next}
              emphasis="primary"
              unavailable={!channelName.trim() ? c.channelNameHint : undefined}
              onClick={createChannel}
            />
          </>
        }
      >
        <form
          data-dl="slack-create-channel"
          onSubmit={(event) => {
            event.preventDefault();
            createChannel();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              createChannel();
            }
          }}
        >
          <TextField label={c.channelName} prefix="#" placeholder={c.channelNameHint} value={channelName} onChange={setChannelName} />
        </form>
      </Dialog>

      <Dialog
        open={vipOpen}
        onClose={() => setVipOpen(false)}
        size="l"
        initialFocus="heading"
        title={view.vipModal.title}
        description={view.vipModal.description}
        aside={
          pic('vipPreview').src && (
            <div data-dl="slack-vip-aside">
              <Image src={pic('vipPreview').src} alt={pic('vipPreview').alt} ratio="natural" width={168} height={234} rounded={false} />
            </div>
          )
        }
        actions={
          <>
            <Button label={view.vipModal.remindLater} onClick={() => setVipOpen(false)} />
            <Button
              label={view.vipModal.save}
              emphasis="primary"
              unavailable={!vipSearch.trim() ? view.vipModal.emptyText : undefined}
              onClick={() => setVipOpen(false)}
            />
          </>
        }
      >
        <div data-dl="slack-vip-modal">
          <TextField
            label={view.vipModal.searchPlaceholder}
            hideLabel
            type="search"
            icon="search"
            size="s"
            placeholder={view.vipModal.searchPlaceholder}
            value={vipSearch}
            onChange={setVipSearch}
          />
          <div data-dl-part="vip-list-head">{view.vipModal.listHeading}</div>
          <div data-dl-part="vip-empty">
            <Text tone="muted">{view.vipModal.emptyText}</Text>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
