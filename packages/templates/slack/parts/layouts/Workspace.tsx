import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarGroup, Badge, Button, Checkbox, EmptyState, Heading, Icon, ScrollArea, Text, TextArea, TextField, type DataAttributes } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { WorkspaceRecord, WorkspaceMessage } from '../../types';

export interface WorkspaceProps extends DataAttributes {
  /** Validated shared content, including every label and conversation. */
  view: WorkspaceRecord;
  /** A directly openable review state. */
  screen?: string;
}

/**
 * The current workspace composition: labelled rail outside an inset navigation-and-conversation window.
 * Not for assistant chat (ChatLayout/Composer) or a general application shell (AppLayout).
 * Its messages use Text, Avatar and Button; scrolling, focus, fields and commit feedback stay in core.
 * @tier layout
 * @family slack
 * @a11y Named navigation and conversation regions, one main landmark, and native core controls.
 */
export function Workspace({ view, screen = 'channel', ...data }: WorkspaceProps) {
  const c = view.copy;
  const [channel, setChannel] = useState(view.channel);
  const [thread, setThread] = useState<WorkspaceMessage | undefined>(screen === 'thread' ? view.messages[0] : undefined);
  const [tab, setTab] = useState(screen === 'files' ? 'files' : 'messages');
  const [search, setSearch] = useState(screen === 'search');
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<Record<string, WorkspaceMessage[]>>({});
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [formatting, setFormatting] = useState(false);
  const [alsoSend, setAlsoSend] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const timeline = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const threadPanel = useRef<HTMLElement>(null);
  const threadOpener = useRef<HTMLElement | null>(null);
  const restoreThreadFocus = useRef(false);
  useEffect(() => { void loadFace('lato'); }, []);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // The thread replaces the channel in a narrow window, so it becomes the one visible main region there.
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width <= 640));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setThread(screen === 'thread' ? view.messages[0] : undefined);
    setTab(screen === 'files' ? 'files' : 'messages');
    setSearch(screen === 'search');
  }, [screen, view.messages]);
  useEffect(() => {
    if (thread && threadOpener.current && !threadOpener.current.getClientRects().length) {
      threadPanel.current?.querySelector<HTMLButtonElement>('button[aria-label]')?.focus();
    } else if (!thread && restoreThreadFocus.current) {
      const opener = threadOpener.current;
      const target = opener?.isConnected && opener.getClientRects().length
        ? opener
        : root.current?.querySelector<HTMLTextAreaElement>('main textarea');
      target?.focus();
      restoreThreadFocus.current = false;
    }
  }, [thread]);
  const openThread = (message: WorkspaceMessage) => {
    threadOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setThread(message);
  };
  const closeThread = () => {
    restoreThreadFocus.current = true;
    setThread(undefined);
  };
  const messages = [...view.messages, ...(sent[channel] ?? [])];
  useEffect(() => {
    const viewport = timeline.current;
    if (viewport && !search && tab === 'messages') viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length, channel, search, tab]);
  const send = async (target: string) => {
    const text = drafts[target]?.trim();
    if (!text) return;
    const next: WorkspaceMessage = { id: `local-${Date.now()}`, author: view.currentUser, time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()), text };
    setSent(old => ({ ...old, [target]: [...(old[target] ?? []), next] }));
    setDrafts(old => ({ ...old, [target]: '' }));
  };
  const action = (label: string, icon: Parameters<typeof Button>[0]['icon'], onClick?: () => void) =>
    <Button label={label} icon={icon} iconOnly emphasis="quiet" tone="inherit" size="xs" onClick={onClick} />;

  const composer = (target: string, reply = false) => (
    <div data-dl="slack-composer">
      <TextArea label={reply ? c.reply : c.compose} hideLabel grow width="fill" value={drafts[target] ?? ''}
        onChange={value => setDrafts(old => ({ ...old, [target]: value }))}
        placeholder={reply ? `${c.reply}…` : `${c.messagePrefix} #${channel}`} rows={2}
        onEnter={() => { void send(target); }}
        tray={formatting && <div data-dl="slack-formatting" role="toolbar" aria-label={c.format}>
          {action(c.bold, 'text')}{action(c.italic, 'pen')}{action(c.strike, 'minus')}
          <span data-dl="slack-separator" />
          {action(c.link, 'link')}{action(c.list, 'list')}{action(c.numbered, 'list')}
          <span data-dl="slack-separator" />
          {action(c.quote, 'comment')}{action(c.code, 'code')}
        </div>}
        toolbar={<div data-dl="slack-tools">
          <div data-dl-part="group">
            {action(c.add, 'plus')}{action(c.format, 'text', () => setFormatting(!formatting))}
            {action(c.emoji, 'emoji')}{action(c.mention, 'at')}
            <span data-dl="slack-separator" />
            {action(c.video, 'image')}{action(c.audio, 'mic')}
          </div>
          <div data-dl-part="send" data-ready={drafts[target]?.trim() ? true : undefined}>
            <Button label={c.send} icon="send" iconOnly size="xs" emphasis={drafts[target]?.trim() ? 'primary' : 'quiet'}
              unavailable={!drafts[target]?.trim() ? c.compose : undefined}
              onCommit={() => send(target)} pendingLabel={c.sending} doneLabel={c.sent} />
            <Button label={c.schedule} icon="chevron-down" iconOnly size="xs" emphasis={drafts[target]?.trim() ? 'primary' : 'quiet'} />
          </div>
        </div>}
      />
      {reply && <div data-dl-part="also-send">
        {/* binary-setting: a one-off choice for the reply being written, not a lasting setting; the reference shows a checkbox (r22). */}
        <Checkbox label={`${c.alsoSend} #${channel}`} size="s" checked={alsoSend} onChange={setAlsoSend} />
      </div>}
    </div>
  );
  const message = (m: WorkspaceMessage, inThread = false) => (
    <article key={m.id} data-dl="slack-message" data-grouped={m.grouped || undefined} aria-label={`${m.author}, ${m.time}`}>
      <div data-dl-part="avatar">{!m.grouped && <Avatar name={m.author} size={36} shape="square" decorative />}</div>
      <div data-dl-part="body">
        {!m.grouped && <div data-dl-part="byline"><strong data-dl-part="author">{m.author}</strong><time data-dl-part="time">{m.time}</time></div>}
        <Text>{m.text}</Text>
        {m.file && <div data-dl-part="file"><Icon name="file" size="lg" /><div data-dl-part="file-words"><strong>{m.file.name}</strong><span>{m.file.detail}</span></div></div>}
        {m.unfurl && <div data-dl-part="unfurl"><span data-dl-part="site">{m.unfurl.site}</span><strong data-dl-part="link">{m.unfurl.title}</strong><Text>{m.unfurl.text}</Text></div>}
        {m.reactions && <div data-dl-part="reactions">
          {m.reactions.map((r, i) => <span key={r.label} data-dl-part="reaction" data-chosen={reactions[`${m.id}-${i}`] || undefined} role="group" aria-label={r.label}>
            {/* binary-setting: a reaction is a reversible message annotation in a dense action row, not a setting. */}
            <Button label={`${r.emoji} ${r.count + (reactions[`${m.id}-${i}`] ? 1 : 0)}`} emphasis="quiet" tone="inherit" size="xs"
              data-reaction-label={r.label} pressed={!!reactions[`${m.id}-${i}`]}
              onClick={() => setReactions(old => ({ ...old, [`${m.id}-${i}`]: !old[`${m.id}-${i}`] }))} />
          </span>)}
        </div>}
        {!!m.replies && !inThread && <div data-dl-part="reply-line">
          <Avatar name={view.replies[0].author} shape="square" size={24} decorative />
          <Avatar name={view.replies[1].author} shape="square" size={24} decorative />
          <Button label={`${m.replies} ${c.replies}`} size="xs" emphasis="quiet" tone="inherit" onClick={() => openThread(m)} />
          <span data-dl-part="last-reply">{c.lastReply}</span>
        </div>}
      </div>
      <div data-dl-part="hover-actions" aria-label={c.more}>
        {action(c.react, 'thumb-up', () => setReactions(old => ({...old, [`${m.id}-0`]: !old[`${m.id}-0`]})))}
        {action(c.replyAction, 'comment', () => openThread(m))}
        {action(c.share, 'arrow-end')}{action(c.save, 'file')}{action(c.more, 'more-vertical')}
      </div>
    </article>
  );
  return (
    <div {...data} ref={root} data-dl="slack-workspace">
      <header data-dl-part="titlebar" data-density="compact">
        <div data-dl-part="history">{action(c.back, 'chevron-start', () => setSearch(false))}{action(c.back, 'chevron-end')}</div>
        <div data-dl-part="search-pill" data-open={search || undefined}>{search
          ? <TextField label={c.searchHint} hideLabel type="search" icon="search" size="xs" placeholder={c.search} value={query} onChange={setQuery} />
          : <Button label={c.search} icon="search" size="xs" tone="inherit" align="start" emphasis="quiet" onClick={() => setSearch(true)} />}</div>
        <div data-dl-part="help">{action(c.preferences, 'info')}</div>
      </header>
      <nav data-dl-part="rail" data-density="compact" aria-label={view.name}>
        <Avatar name={view.name} kind="organisation" initials="f" size={36} />
        <div data-dl-part="rail-items">{view.rail.map((r, i) => <div data-dl-part="rail-item" data-current={i === 0 || undefined} key={r.label}>
          <span data-dl-part="rail-icon"><Button label={r.label} icon={r.icon} iconOnly emphasis="quiet" tone="inherit" onClick={() => { if (r.icon === 'file') setTab('files'); else { setTab('messages'); setSearch(false); } }} /></span>
          <span data-dl-part="rail-label">{r.label}</span>
        </div>)}</div>
        <div data-dl-part="rail-bottom">{action(c.add, 'plus')}<Avatar name={view.currentUser} shape="square" presence="available" size={36} /></div>
      </nav>
      <div data-dl-part="window">
        <aside data-dl-part="sidebar" data-density="compact" aria-label={view.name}>
          <div data-dl-part="workspace-head"><strong data-dl-part="workspace-name">{view.name}<Icon name="chevron-down" size="sm" /></strong>{action(c.compose, 'edit')}</div>
          <ScrollArea label={view.name}><div data-dl="slack-sidebar-content">
            {view.sections.map(section => <section data-dl="slack-nav-section" key={section.title ?? section.items[0].name}>
              {section.title && <div data-dl-part="section-title"><Icon name="caret-down" size="sm" /><span>{section.title}</span></div>}
              <div data-dl-part="rows">{section.items.map(item => <div key={item.name} data-dl-part="row" data-person={item.presence ? true : undefined} data-unread={item.unread || undefined} data-current={item.name === channel || undefined}>
                {item.presence && <span data-dl-part="row-avatar"><Avatar name={item.name} shape="square" size={20} presence={item.presence} decorative /></span>}
                <Button label={item.name} icon={item.icon} size="xs" emphasis="quiet" align="start" tone="inherit"
                  onClick={() => { setChannel(item.name); setSearch(false); setTab('messages'); }} />
                {item.mentions && <Badge kind="count" emphasis="strong" tone="accent" count={item.mentions} label={`${item.mentions} ${c.mentions}`} size="s" />}
              </div>)}</div>
            </section>)}
          </div></ScrollArea>
        </aside>
        <main data-dl-part="conversation">
          <header data-dl-part="channel-head" data-density="compact">
            <div data-dl-part="channel-title"><Icon name="frame" /><Heading level={1} size={4}>{channel}</Heading><Icon name="chevron-down" size="sm" /></div>
            <div data-dl-part="channel-actions">
              <span data-dl-part="facepile"><AvatarGroup members={view.members.map(name => ({ name }))} label={c.members} size={20} shape="square" max={3} /><span data-dl-part="member-count">{view.memberCount}</span></span>
              <span data-dl-part="huddle">{action(c.huddle, 'headphones')}{action(c.huddleOptions, 'chevron-down')}</span>
              {action(c.channelMenu, 'more-vertical')}
            </div>
          </header>
          <div data-dl-part="tabs" data-density="compact" role="navigation" aria-label={channel}>
            {[['messages', c.messages, 'comment'], ['canvas', c.canvas, 'file'], ['files', c.files, 'file']].map(([key, label, icon]) =>
              <span key={key} data-dl-part="tab" data-current={(!search && tab === key) || undefined}><Button label={label} icon={icon as 'comment' | 'file'} emphasis="quiet" size="s" onClick={() => { setTab(key); setSearch(false); }} /></span>)}
            {action(c.addTab, 'plus')}
          </div>
          <ScrollArea label={search ? c.results : c.messages} viewportRef={timeline}>
            {search ? <div data-dl="slack-search-results">
              <Heading level={2} size={4}>{c.results}</Heading>
              {messages.filter(m => !query || m.text.toLowerCase().includes(query.toLowerCase())).map(m => message(m))}
              {query && !messages.some(m => m.text.toLowerCase().includes(query.toLowerCase())) && <Text>{c.emptySearch}</Text>}
            </div> : tab === 'files' ? <div data-dl="slack-file-results"><Heading level={2} size={4}>{c.allFiles}</Heading>{messages.filter(m => m.file).map(m => message(m))}</div>
              : tab === 'canvas' ? <div data-dl="slack-file-results"><EmptyState title={c.canvas} reason="first-use">{view.topic}</EmptyState></div>
              : <div data-dl="slack-timeline"><div data-dl-part="date"><span>{view.date}<Icon name="chevron-down" size="sm" /></span></div>
                {messages.map(m => <div key={m.id} data-dl="slack-message-group">{m.isNew && <div data-dl-part="new-line"><span>{c.newMessages}</span></div>}{message(m)}</div>)}
              </div>}
          </ScrollArea>
          <div data-dl="slack-composer-wrap">{composer(channel)}</div>
        </main>
        {thread && <aside ref={threadPanel} data-dl-part="thread" role={narrow ? 'main' : undefined} aria-label={c.thread} onKeyDown={event => {
          if (event.key === 'Escape' && !event.defaultPrevented) {
            event.stopPropagation();
            closeThread();
          }
        }}>
          <header data-dl-part="thread-head"><strong>{c.thread}</strong><span data-dl-part="thread-channel">#{channel}</span>{action(c.popout, 'external')}{action(c.closeThread, 'close', closeThread)}</header>
          <ScrollArea label={c.thread}><div data-dl="slack-thread-content">{message(thread, true)}<div data-dl-part="reply-count">{view.replies.length} {c.replies}</div>{[...view.replies, ...(sent[`thread-${thread.id}`] ?? [])].map(m => message(m, true))}</div></ScrollArea>
          <div data-dl="slack-composer-wrap">{composer(`thread-${thread.id}`, true)}</div>
        </aside>}
      </div>
    </div>
  );
}
