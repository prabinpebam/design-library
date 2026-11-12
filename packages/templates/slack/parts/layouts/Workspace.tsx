import { useEffect, useRef, useState } from 'react';
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
  Image,
  Link,
  MenuButton,
  Popover,
  ScrollArea,
  Text,
  TextArea,
  TextField,
  type DataAttributes,
} from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { WorkspaceMessage, WorkspaceRecord } from '../../types';

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
  const [channel, setChannel] = useState(
    screen === 'channel-menu' ? view.amaChannel.channel : typeof settings?.channel === 'string' ? settings.channel : view.channel,
  );
  const [thread, setThread] = useState<WorkspaceMessage | undefined>(screen === 'thread' ? view.messages[0] : undefined);
  const [tab, setTab] = useState(screen === 'files' ? 'files' : 'messages');
  const [search, setSearch] = useState(screen === 'search');
  const [vipOpen, setVipOpen] = useState(screen === 'vip-modal');
  const [vipSearch, setVipSearch] = useState('');
  const [channelMenuOpen, setChannelMenuOpen] = useState(screen === 'channel-menu');
  const [query, setQuery] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('');
  const [finding, setFinding] = useState(false);
  const [vipDismissed, setVipDismissed] = useState(screen === 'channel-menu');
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

  const timeline = useRef<HTMLDivElement>(null);
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
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width <= 640));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setThread(screen === 'thread' ? view.messages[0] : undefined);
    setTab(screen === 'files' ? 'files' : 'messages');
    setSearch(screen === 'search');
    setVipOpen(screen === 'vip-modal');
    setChannelMenuOpen(screen === 'channel-menu');
    setVipDismissed(screen === 'channel-menu');
    if (screen === 'channel-menu') setChannel(view.amaChannel.channel);
    else if (typeof settings?.channel === 'string') setChannel(settings.channel);
  }, [screen, settings?.channel, view.amaChannel.channel, view.messages]);

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
    threadOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setThread(msg);
  };

  const closeThread = () => {
    restoreThreadFocus.current = true;
    setThread(undefined);
  };

  useEffect(() => {
    if (search && userTriggeredSearch.current) {
      root.current?.querySelector<HTMLInputElement>("[data-dl-part='titlebar'] input")?.focus({ preventScroll: true });
      userTriggeredSearch.current = false;
    }
  }, [search]);

  const isAma = channel === view.amaChannel.channel;
  const activeMessages = isAma ? view.amaChannel.messages : view.messages;
  const activeTabs = isAma ? view.amaChannel.tabs : view.tabs;
  const activeMemberCount = isAma ? view.amaChannel.memberCountText : view.memberCountText;
  const localSent = sent[channel] ?? [];
  const messages = [...activeMessages, ...localSent];

  useEffect(() => {
    const viewport = timeline.current;
    if (!viewport || search || tab !== 'messages') return;
    if (localSent.length > 0) viewport.scrollTop = viewport.scrollHeight;
    else if (isAma) viewport.scrollTop = 36;
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
    setSent((old) => ({ ...old, [target]: [...(old[target] ?? []), next] }));
    setDrafts((old) => ({ ...old, [target]: '' }));
  };

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
    const baseItems = section.collapsible && isAma && view.amaChannel.channels ? view.amaChannel.channels : section.items;
    const extra = section.collapsible && made.length ? made.map((name) => ({ name, icon: 'hash' as const, unread: true })) : [];
    const filtered = [...baseItems, ...extra].filter(
      (item) => !sidebarFilter.trim() || item.name.toLowerCase().includes(sidebarFilter.trim().toLowerCase()),
    );
    return { ...section, items: filtered };
  });

  const composer = (target: string, reply = false) => {
    const ready = Boolean(drafts[target]?.trim());
    return (
      <div data-dl="slack-composer" data-ready={ready || undefined}>
        <TextArea
          label={reply ? c.reply : c.compose}
          hideLabel
          grow
          width="fill"
          value={drafts[target] ?? ''}
          onChange={(value) => setDrafts((old) => ({ ...old, [target]: value }))}
          placeholder={reply ? `${c.reply}…` : `${c.messagePrefix} #${channel}`}
          rows={1}
          onEnter={() => {
            void send(target);
          }}
          tray={
            formatting && (
              <div data-dl="slack-formatting" role="toolbar" aria-label={c.format}>
                <div data-dl-part="set">
                  {action(c.bold, 'bold')}
                  {action(c.italic, 'italic')}
                  {action(c.underline, 'underline')}
                  {action(c.strike, 'strikethrough')}
                </div>
                <span data-dl-part="divider" aria-hidden="true" />
                <div data-dl-part="set">
                  {action(c.paragraphStyle, 'pilcrow')}
                  <span data-dl-part="mini-caret" aria-hidden="true">
                    <Icon name="chevron-down" size="sm" />
                  </span>
                </div>
                <span data-dl-part="divider" aria-hidden="true" />
                <div data-dl-part="set">
                  {action(c.link, 'link')}
                  {action(c.numbered, 'list-numbered')}
                  {action(c.list, 'list-bulleted')}
                </div>
                <span data-dl-part="divider" aria-hidden="true" />
                <div data-dl-part="set">
                  {action(c.quote, 'quote')}
                  {action(c.code, 'code')}
                  {action(c.codeBlock, 'code-block')}
                  {action(c.checkList, 'list')}
                </div>
              </div>
            )
          }
          toolbar={
            <div data-dl="slack-tools">
              <div data-dl-part="group">
                <span data-dl-part="add-circle">{action(c.add, 'plus')}</span>
                <span data-dl-part="format-toggle" data-active={formatting || undefined}>
                  <Button
                    label={c.format}
                    icon="text-format"
                    iconOnly
                    emphasis="quiet"
                    tone="inherit"
                    size="xs"
                    onClick={() => setFormatting(!formatting)}
                  />
                </span>
                {action(c.emoji, 'emoji')}
                {action(c.mention, 'at')}
                <span data-dl-part="divider" aria-hidden="true" />
                {action(c.video, 'video')}
                {action(c.audio, 'mic')}
                <span data-dl-part="divider" aria-hidden="true" />
                {action(c.shortcuts, 'compose')}
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
                <Button
                  label={c.schedule}
                  icon="chevron-down"
                  iconOnly
                  size="xs"
                  emphasis={ready ? 'primary' : 'quiet'}
                  tone={ready ? undefined : 'inherit'}
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
      <article key={m.id} data-dl="slack-message" data-grouped={m.grouped || undefined} aria-label={`${m.author}, ${m.time}`}>
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
          {(m.text || m.mention || m.edited) && (
            <Text>
              {m.mention && <span data-dl-part="mention">{m.mention} </span>}
              {m.text}
              {m.edited && <span data-dl-part="edited"> ({c.edited ?? 'edited'})</span>}
            </Text>
          )}
          {m.subText && m.subText.split('\n').map((line, i) => <Text key={i}>{line}</Text>)}
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
            {action(c.share, 'forward')}
            {action(c.save, 'bookmark')}
            {action(c.summarize, 'compose')}
            <MenuButton label={c.more} icon="more-vertical" iconOnly emphasis="quiet" tone="inherit" size="xs" items={view.messageMenu} onSelect={() => undefined} />
          </div>
        )}
      </article>
    );
  };

  const botEmblem = pic('botMark');
  const currentUserPic = pic(view.currentUserAvatar);

  return (
    <div {...data} ref={root} data-dl="slack-workspace" data-material="solid">
      <header data-dl-part="titlebar" data-density="compact">
        <div data-dl-part="left-chrome">
          <div data-dl-part="menu-group">
            {action(c.appMenu, 'menu')}
            {action(c.toggleSidebar, 'sidebar')}
          </div>
          <div data-dl-part="history">
            {action(c.back, 'arrow-start', () => setSearch(false))}
            <Button label={c.forward} icon="arrow-end" iconOnly emphasis="quiet" tone="inherit" size="xs" unavailable={c.forward} />
            {action(c.history, 'clock')}
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
                placeholder={c.search}
                value={query}
                onChange={setQuery}
              />
            ) : (
              <Button
                label={c.search}
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
          <span data-dl-part="help-slot">{action(c.help, 'help')}</span>
          <span data-dl-part="win-btn">{action(c.minimize, 'minus')}</span>
          <span data-dl-part="win-btn">{action(c.maximize, 'window-maximize')}</span>
          <span data-dl-part="win-btn">{action(c.closeWindow, 'close')}</span>
        </div>
      </header>

      <nav data-dl-part="rail" data-density="compact" aria-label={view.name}>
        <div data-dl-part="workspaces">
          {view.workspaces.map((ws) => (
            <div key={ws.id} data-dl-part="ws-tile" data-tone={ws.tone} data-current={ws.current || undefined}>
              <span data-dl-part="ws-letters">{ws.initials}</span>
              {ws.mentions && (
                <span data-dl-part="ws-badge">
                  <Badge kind="count" emphasis="strong" tone="accent" count={ws.mentions} label={`${ws.mentions} ${c.mentions}`} size="s" />
                </span>
              )}
            </div>
          ))}
        </div>
        <div data-dl-part="rail-items">
          {view.rail.map((r, i) => {
            const railCount = r.id === 'activity' && isAma ? view.amaChannel.activityMentions : r.mentions;
            return (
              <div data-dl-part="rail-item" data-current={i === 0 || undefined} key={r.id}>
                <span data-dl-part="rail-icon">
                  <Button
                    label={r.label}
                    icon={r.icon}
                    iconOnly
                    emphasis="quiet"
                    tone="inherit"
                    onClick={() => {
                      if (r.id === 'files') setTab('files');
                      else {
                        setTab('messages');
                        setSearch(false);
                      }
                    }}
                  />
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
        </div>
        <div data-dl-part="rail-bottom">
          <span data-dl-part="rail-circle">
            <MenuButton
              label={c.createMenu}
              icon="plus"
              iconOnly
              emphasis="quiet"
              tone="inherit"
              size="xs"
              items={view.createMenu}
              onSelect={(value) => {
                if (value === 'channel') setCreating(true);
              }}
            />
          </span>
          <span data-dl-part="rail-circle">{action(c.themeToggle, 'scheme-dark')}</span>
          <span data-dl-part="rail-avatar">
            <Avatar name={view.currentUser} src={currentUserPic.src || undefined} shape="square" presence="available" size={36} />
          </span>
        </div>
      </nav>

      <div data-dl-part="window">
        <aside data-dl-part="sidebar" data-density="compact" aria-label={view.name}>
          <div data-dl-part="workspace-head">
            <strong data-dl-part="workspace-name">
              <span>{view.name}</span>
              <Icon name="chevron-down" size="sm" />
            </strong>
            <span data-dl-part="head-actions">
              {action(c.sidebarSettings, 'settings')}
              {action(c.compose, 'compose')}
            </span>
          </div>

          <ScrollArea label={view.name}>
            <div data-dl="slack-sidebar-content">
              {!vipDismissed && (
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
                      const overrideBadge = isAma ? view.amaChannel.channelBadges[item.name] : undefined;
                      const rawBadge = overrideBadge ?? (item.mentions ? (item.mentionsLabel ?? String(item.mentions)) : undefined);
                      const badgeLabel = isAma && item.name === channel ? undefined : rawBadge;
                      const isUnread = item.name !== channel && (item.unread || Boolean(overrideBadge));
                      return (
                        <div
                          key={item.name}
                          data-dl-part="row"
                          data-person={item.presence ? true : undefined}
                          data-unread={isUnread || undefined}
                          data-current={item.name === channel || undefined}
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
                              setChannel(item.name);
                              setSearch(false);
                              setTab('messages');
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
          </ScrollArea>

          <div data-dl-part="more-unreads" data-elevation="3">
            <Button label={view.moreUnreadsLabel} size="xs" emphasis="quiet" tone="inherit" />
          </div>
        </aside>

        <main data-dl-part="conversation">
          <header data-dl-part="channel-head" data-density="compact">
            <div data-dl-part="channel-lead">
              {headAction(c.starChannel, 'star')}
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
                {headAction(c.huddle, 'headphones')}
                {action(c.huddleOptions, 'chevron-down')}
              </span>
              {headAction(c.notifications, 'bell')}
              {headAction(c.searchChannel, 'search', () => {
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
                items={view.channelMenu}
                open={channelMenuOpen}
                onOpenChange={setChannelMenuOpen}
                onSelect={() => setChannelMenuOpen(false)}
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
                    setTab(t.id);
                    setSearch(false);
                  }}
                />
              </span>
            ))}
            <span data-dl-part="tab-plus">
              {action(c.addTab, 'plus')}
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
              {headAction(c.popout, 'external')}
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
