/**
 * The AI chat template's binding (Q57.3, Q64): the record in content/chat.json mapped to ChatLayout, ConversationList, ChatMessage,
 * MessageActions, ChatThinking, ImageGeneration and Composer through a block registry. It holds the conversation's
 * state (chats, the reply arriving, dialogs) and adds no styles: every pixel comes from the public components.
 */
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Card,
  ChatLayout,
  ChatMessage,
  ChatThinking,
  Cluster,
  Code,
  CodeBlock,
  Composer,
  ConversationList,
  DataTable,
  Dialog,
  Heading,
  Image,
  ImageGeneration,
  Link,
  List,
  ListItem,
  MenuButton,
  MessageActions,
  Persona,
  Stack,
  Switch,
  Text,
  TextField,
  notify,
  type ComposerAttachment,
  type ConversationGroup,
} from '@design-library/core/react';
import { fill, type TemplateAsset } from '@design-library/core/render';
import type { ChatAppView, ChatBlock, ChatStrings, ChatTurn } from './types';

type Status = 'thinking' | 'streaming' | 'done' | 'stopped';

/** A message as the view holds it: every version of it, which one shows, and how much of a reply has arrived. */
interface Turn extends Pick<ChatTurn, 'id' | 'from' | 'attachments' | 'thinking'> {
  versions: ChatBlock[][];
  version: number;
  status: Status;
  /** Words shown while streaming or after Stop; everything once done. */
  words: number;
  /** The working phrase while thinking. */
  step?: string;
}

interface Thread {
  id: string;
  title: string;
  turns: Turn[];
}

const toTurn = (t: ChatTurn): Turn => ({
  id: t.id,
  from: t.from,
  attachments: t.attachments,
  thinking: t.thinking,
  versions: [...(t.earlier ?? []), t.blocks],
  version: t.earlier?.length ?? 0,
  status: 'done',
  words: Infinity,
});

const count = (s: string) => s.split(/\s+/).filter(Boolean).length;
const wordsIn = (b: ChatBlock) => (b.type === 'text' || b.type === 'heading' ? count(b.text) : b.type === 'list' ? count(b.items.join(' ')) : 4);
const total = (blocks: ChatBlock[]) => blocks.reduce((s, b) => s + wordsIn(b), 0);

/** The blocks as far as `words` reach: a paragraph or list cut mid-way, later blocks not yet arrived. */
function cut(blocks: ChatBlock[], words: number): ChatBlock[] {
  const out: ChatBlock[] = [];
  let left = words;
  for (const b of blocks) {
    if (left <= 0) break;
    const n = wordsIn(b);
    if (n <= left) {
      out.push(b);
      left -= n;
      continue;
    }
    if (b.type === 'text' || b.type === 'heading') out.push({ ...b, text: b.text.split(/\s+/).slice(0, left).join(' ') });
    else if (b.type === 'list') {
      const items: string[] = [];
      for (const item of b.items) {
        const w = item.split(/\s+/);
        items.push(w.slice(0, left).join(' '));
        left -= w.length;
        if (left <= 0) break;
      }
      out.push({ ...b, items });
    }
    left = 0;
  }
  return out;
}

/** A reply as plain text, for Copy. */
const plain = (blocks: ChatBlock[]) =>
  blocks
    .map((b) => (b.type === 'text' || b.type === 'heading' ? b.text : b.type === 'list' ? b.items.map((i) => `- ${i}`).join('\n') : b.type === 'code' ? b.code : b.type === 'card' ? `${b.title}: ${b.description}` : ''))
    .filter(Boolean)
    .join('\n\n');

/** Words with `inline code` between backticks. */
const inline = (text: string) => text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : <Fragment key={i}>{part}</Fragment>));

const thinkStep = 700;
const wordStep = 70;

interface BlockContext {
  /** Whether the generating picture at this place has been drawn. */
  drawn: (index: number) => boolean;
  onRetry: (blocks: ChatBlock[]) => void;
  /** A picture by its asset id. */
  picture: (id: string) => TemplateAsset;
  /** The template's interface words (content/chat.json, record.strings). */
  strings: ChatStrings;
}

/** Registry: a block type in the view data → the component that renders it. */
function renderBlock(b: ChatBlock, i: number, ctx: BlockContext): ReactNode {
  switch (b.type) {
    case 'text':
      return <Text key={i} as="p">{inline(b.text)}</Text>;
    case 'heading':
      return (
        <Heading key={i} level={4} size={4}>
          {b.text}
        </Heading>
      );
    case 'list':
      return <List key={i} variant={b.numbered ? 'numbered' : 'bulleted'} items={b.items.map((item, n) => ({ id: String(n), content: inline(item) }))} />;
    case 'code':
      return <CodeBlock key={i} label={b.label} code={b.code} />;
    case 'table':
      return <DataTable key={i} label={b.label} columns={b.columns} rows={b.rows.map((cells, n) => ({ id: String(n), cells }))} />;
    case 'image':
      return <Image key={i} src={ctx.picture(b.picture).src} alt={ctx.picture(b.picture).alt} ratio={b.ratio ?? 'photo'} rounded />;
    case 'generating': {
      const done = ctx.drawn(i);
      return <ImageGeneration key={i} state={done ? 'done' : 'generating'} variant={b.variant} ratio={b.ratio} label={b.label} src={done ? ctx.picture(b.picture).src : undefined} alt={ctx.picture(b.picture).alt} />;
    }
    case 'card':
      return (
        <Card
          key={i}
          headingLevel={4}
          eyebrow={b.eyebrow}
          title={b.title}
          description={b.description}
          media={b.picture ? <Image src={ctx.picture(b.picture).src} alt={ctx.picture(b.picture).alt} ratio="wide" /> : undefined}
          actions={b.action ? <Button label={b.action} size="s" onClick={() => notify({ message: fill(ctx.strings.notInExample, { label: b.action ?? '' }) })} /> : undefined}
        />
      );
    case 'sources':
      return (
        <Text key={i} as="p" variant="body-sm" tone="muted">
          {ctx.strings.sources}{' '}
          {b.items.map((s, n) => (
            <Fragment key={n}>
              {n > 0 && ', '}
              <Link href={s.href}>{s.label}</Link>
            </Fragment>
          ))}
        </Text>
      );
    case 'error':
      return (
        <Alert key={i} tone="error" title={ctx.strings.replyFailed} headingLevel={4} actions={<Button label={ctx.strings.tryAgain} icon="retry" size="s" onClick={() => ctx.onRetry(b.retry)} />}>
          {b.text}
        </Alert>
      );
  }
}

export interface ChatAppProps {
  view: ChatAppView;
  /** `screen` fills the window (the app on its own); `lg` is the preview on the library page. */
  height: 'screen' | 'lg';
  /** The template's pictures by asset id. */
  picture: (id: string) => TemplateAsset;
  /** The chat to open on, from the screen's settings (`open`): a thread id, or "" for a new chat. The record's `current` otherwise. */
  open?: string;
}

export function ChatApp({ view, height, picture, open: opening }: ChatAppProps) {
  const s = view.strings;
  const [threads, setThreads] = useState<Thread[]>(() => view.threads.map((t) => ({ id: t.id, title: t.title, turns: t.turns.map(toTurn) })));
  const [groups, setGroups] = useState<ConversationGroup[]>(view.sidebar.groups);
  const [current, setCurrent] = useState(opening ?? view.current);
  // A screen state names the chat it opens on (New chat: none; Reply failed: the chat whose reply didn't finish).
  const [openedOn, setOpenedOn] = useState(opening);
  if (openedOn !== opening) {
    setOpenedOn(opening);
    setCurrent(opening ?? view.current);
  }
  const [sidebarOpen, setSidebarOpen] = useState(height === 'screen' && window.matchMedia('(min-width: 48rem)').matches);
  const [model, setModel] = useState(view.model);
  const [temporary, setTemporary] = useState(false);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [tool, setTool] = useState<string | undefined>();
  const [live, setLive] = useState<{ thread: string; turn: string; total: number } | null>(null);
  const [drawn, setDrawn] = useState<Set<string>>(() => new Set());
  const [dialog, setDialog] = useState<null | { kind: 'share' | 'search' | 'settings' } | { kind: 'delete'; id: string }>(null);
  const [query, setQuery] = useState('');
  const [prefs, setPrefs] = useState({ suggestions: true, memory: false });
  const seq = useRef(0);
  const uid = () => `n${++seq.current}`;

  const thread = threads.find((t) => t.id === current);
  const patch = (threadId: string, turnId: string, fn: (t: Turn) => Turn) =>
    setThreads((ts) => ts.map((th) => (th.id === threadId ? { ...th, turns: th.turns.map((t) => (t.id === turnId ? fn(t) : t)) } : th)));

  // The reply arriving: a few working phrases, then the words, timed from the start so a slow tab catches up.
  useEffect(() => {
    if (!live) return;
    const start = performance.now();
    const steps = view.replies.thinking;
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      if (elapsed < steps.length * thinkStep) {
        patch(live.thread, live.turn, (t) => ({ ...t, status: 'thinking', step: steps[Math.floor(elapsed / thinkStep)] }));
        return;
      }
      const words = Math.floor((elapsed - steps.length * thinkStep) / wordStep) * 2;
      if (words >= live.total) {
        patch(live.thread, live.turn, (t) => ({ ...t, status: 'done', words: Infinity }));
        setLive(null);
      } else patch(live.thread, live.turn, (t) => ({ ...t, status: 'streaming', words }));
    }, wordStep);
    return () => window.clearInterval(timer);
  }, [live]);

  // Pictures being drawn in the open chat finish after their time; each is scheduled once.
  const scheduled = useRef(new Map<string, number>());
  useEffect(() => {
    thread?.turns.forEach((t) => {
      if (t.status !== 'done') return;
      t.versions[t.version].forEach((b, i) => {
        const key = `${t.id}:${t.version}:${i}`;
        if (b.type !== 'generating' || scheduled.current.has(key)) return;
        scheduled.current.set(key, window.setTimeout(() => setDrawn((d) => new Set(d).add(key)), (b.seconds ?? 6) * 1000));
      });
    });
  }, [thread]);
  useEffect(() => () => scheduled.current.forEach((id) => window.clearTimeout(id)), []);

  const narrow = () => !window.matchMedia('(min-width: 48rem)').matches;
  const open = (id: string) => {
    setCurrent(id);
    setTemporary(false);
    if (narrow()) setSidebarOpen(false);
  };
  const newChat = () => {
    setCurrent('');
    if (narrow()) setSidebarOpen(false);
  };

  const reply = (threadId: string, blocks: ChatBlock[]): Turn => {
    const turn: Turn = { id: uid(), from: 'assistant', versions: [blocks], version: 0, status: 'thinking', words: 0, step: view.replies.thinking[0], thinking: { summary: fill(s.thoughtFor, { seconds: Math.round((view.replies.thinking.length * thinkStep) / 1000) }), steps: view.replies.thinking } };
    setLive({ thread: threadId, turn: turn.id, total: total(blocks) });
    return turn;
  };

  const send = () => {
    const words = text.trim();
    if ((!words && !attachments.length) || attachments.some((a) => a.state === 'uploading') || live) return;
    const person = toTurn({ id: uid(), from: 'person', blocks: words ? [{ type: 'text', text: words }] : [], attachments: attachments.map((a) => ({ kind: a.kind, name: a.name, src: a.src, type: a.type })) });
    const id = thread ? thread.id : uid();
    const answer = reply(id, tool === 'image' ? view.replies.image : view.replies.text);
    if (thread) setThreads((ts) => ts.map((th) => (th.id === id ? { ...th, turns: [...th.turns, person, answer] } : th)));
    else {
      const title = words ? (words.length > 40 ? `${words.slice(0, 40).trimEnd()}…` : words) : attachments[0].name;
      setThreads((ts) => [{ id, title, turns: [person, answer] }, ...ts]);
      if (!temporary) setGroups((gs) => gs.map((g) => (g.label === s.todayGroup ? { ...g, items: [{ id, title }, ...g.items] } : g)));
      setCurrent(id);
    }
    setText('');
    setAttachments([]);
    setTool(undefined);
  };

  const stop = () => {
    if (!live) return;
    patch(live.thread, live.turn, (t) => ({ ...t, status: 'stopped' }));
    setLive(null);
  };

  /** Try again: a new version of the reply, the old one kept. */
  const regenerate = (threadId: string, turn: Turn, blocks = turn.versions[turn.version]) => {
    if (live) return;
    const next = turn.versions.length;
    patch(threadId, turn.id, (t) => ({ ...t, versions: [...t.versions, blocks], version: next, status: 'thinking', words: 0, step: view.replies.thinking[0] }));
    setLive({ thread: threadId, turn: turn.id, total: total(blocks) });
  };

  /** Branch: a new chat holding the conversation up to this message. */
  const branch = (from: Thread, turn: Turn) => {
    const id = uid();
    const title = fill(s.branchTitle, { title: from.title });
    setThreads((ts) => [{ id, title, turns: from.turns.slice(0, from.turns.indexOf(turn) + 1) }, ...ts]);
    setGroups((gs) => gs.map((g) => (g.label === s.todayGroup ? { ...g, items: [{ id, title }, ...g.items] } : g)));
    setCurrent(id);
    notify({ message: s.branched, tone: 'success' });
  };

  const rename = (id: string, title: string) => {
    setGroups((gs) => gs.map((g) => ({ ...g, items: g.items.map((c) => (c.id === id ? { ...c, title } : c)) })));
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, title } : t)));
  };
  const remove = (id: string) => {
    const before = groups;
    setGroups((gs) => gs.map((g) => ({ ...g, items: g.items.filter((c) => c.id !== id) })));
    if (current === id) setCurrent('');
    return before;
  };
  const onAction = (id: string, action: string) => {
    if (action === 'delete') setDialog({ kind: 'delete', id });
    else if (action === 'share') {
      setCurrent(id);
      setDialog({ kind: 'share' });
    } else if (action === 'archive') {
      const before = remove(id);
      notify({ subject: `archive-${id}`, message: s.archived, action: { label: s.undo, onAction: () => setGroups(before) } });
    }
  };

  const attach = (files: File[]) => {
    const added = files.map((f) => ({ id: uid(), kind: f.type.startsWith('image/') ? ('image' as const) : ('file' as const), name: f.name, src: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined, type: f.type.split('/').pop()?.toUpperCase(), state: 'uploading' as const }));
    setAttachments((a) => [...a, ...added]);
    window.setTimeout(() => setAttachments((a) => a.map((x) => (added.some((n) => n.id === x.id) ? { ...x, state: 'ready' } : x))), 1200);
  };

  const message = (th: Thread, t: Turn) => {
    const blocks = t.status === 'done' ? t.versions[t.version] : cut(t.versions[t.version], t.words);
    const ctx: BlockContext = { drawn: (i) => drawn.has(`${t.id}:${t.version}:${i}`), onRetry: (retry) => regenerate(th.id, t, retry), picture, strings: s };
    if (t.from === 'person') {
      const words = plain(t.versions[t.version]);
      return (
        <ChatMessage key={t.id} from="person" author={s.you} attachments={t.attachments} actions={words ? <MessageActions copyText={words} onEdit={() => setText(words)} /> : undefined}>
          {blocks.map((b, i) => renderBlock(b, i, ctx))}
        </ChatMessage>
      );
    }
    const settled = t.status === 'done' || t.status === 'stopped';
    return (
      <ChatMessage
        key={t.id}
        from="assistant"
        author={view.assistant}
        streaming={t.status === 'streaming'}
        thinking={
          t.status === 'thinking' ? (
            <ChatThinking state="working" label={t.step ?? view.replies.thinking[0]} />
          ) : t.thinking ? (
            <ChatThinking state="done" label={t.thinking.summary}>
              <List variant="bulleted" items={t.thinking.steps.map((s, i) => ({ id: String(i), content: s }))} />
            </ChatThinking>
          ) : undefined
        }
        actions={
          settled && blocks.every((b, i) => b.type !== 'error' && (b.type !== 'generating' || ctx.drawn(i))) ? (
            <MessageActions
              copyText={plain(blocks)}
              onFeedback={() => undefined}
              onShare={() => setDialog({ kind: 'share' })}
              onRetry={() => regenerate(th.id, t)}
              onBranch={() => branch(th, t)}
              versions={t.versions.length > 1 ? { current: t.version + 1, total: t.versions.length, onChange: (n) => patch(th.id, t.id, (x) => ({ ...x, version: n - 1, status: 'done', words: Infinity })) } : undefined}
            />
          ) : undefined
        }
      >
        {blocks.map((b, i) => renderBlock(b, i, ctx))}
        {t.status === 'stopped' && (
          <Text as="p" variant="body-sm" tone="muted">
            {s.stopped}
          </Text>
        )}
      </ChatMessage>
    );
  };

  const composer = (
    <Composer
      value={text}
      onChange={setText}
      onSend={send}
      replying={!!live}
      replyingLabel={tool === 'image' ? s.creatingImage : undefined}
      onStop={stop}
      attachments={attachments}
      onAttach={attach}
      onRemoveAttachment={(id) => setAttachments((a) => a.filter((x) => x.id !== id))}
      tools={view.tools}
      tool={tool}
      onToolChange={setTool}
      onDictate={() => notify({ message: fill(s.notInExample, { label: s.dictation }) })}
      disclaimer={view.disclaimer}
    />
  );

  const welcome = temporary ? view.welcome.temporary : null;
  const matches = (title: string) => title.toLowerCase().includes(query.trim().toLowerCase());
  const found = groups
    .map((g) => ({ id: g.label, heading: g.label, actions: g.items.filter((c) => matches(c.title)).map((c) => ({ id: c.id, label: c.title, icon: 'comment' as const, onSelect: () => (open(c.id), setDialog(null)) })) }))
    .filter((g) => g.actions.length);
  const deleting = dialog?.kind === 'delete' ? groups.flatMap((g) => g.items).find((c) => c.id === dialog.id) : undefined;

  return (
    <>
      <ChatLayout
        height={height}
        label={thread?.title ?? s.newChat}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((o) => !o)}
        sidebar={
          <Stack gap="group">
            <Stack gap="pair">
              <ListItem role="button" icon="edit" label={s.newChat} size="s" onClick={newChat} />
              <ListItem role="button" icon="search" label={s.searchChats} size="s" onClick={() => setDialog({ kind: 'search' })} />
            </Stack>
            <ConversationList groups={groups} current={current} onOpen={open} onRename={rename} onAction={onAction} />
            <Cluster gap="item" align="center">
              <Persona name={view.sidebar.account.name} secondary={view.sidebar.account.plan} />
              <MenuButton
                label={s.account}
                icon="more"
                iconOnly
                emphasis="quiet"
                size="s"
                items={view.sidebar.account.menu}
                onSelect={(v) => (v === 'settings' ? setDialog({ kind: 'settings' }) : notify({ message: fill(s.notInExample, { label: String(view.sidebar.account.menu.find((m) => m.value === v)?.label ?? '') }) }))}
              />
            </Cluster>
          </Stack>
        }
        header={<MenuButton label={fill(s.model, { model: String(view.models.find((m) => m.value === model)?.label ?? '') })} emphasis="quiet" size="s" items={view.models} onSelect={setModel} />}
        headerEnd={
          <Cluster gap="item" align="center">
            {!thread && <Switch label={s.temporaryChat} checked={temporary} onChange={setTemporary} />}
            {thread && <Button label={s.share} icon="upload" emphasis="quiet" size="s" onClick={() => setDialog({ kind: 'share' })} />}
          </Cluster>
        }
        empty={
          thread ? undefined : (
            <Stack gap="item">
              <Heading level={2} size={2}>
                {welcome?.greeting ?? view.welcome.greeting}
              </Heading>
              {welcome && <Text tone="muted">{welcome.note}</Text>}
            </Stack>
          )
        }
        composer={
          thread || temporary ? (
            composer
          ) : (
            <Stack gap="item">
              {composer}
              <Cluster gap="item">
                {view.welcome.suggestions.map((s) => (
                  <Button key={s} label={s} size="s" onClick={() => setText(s)} />
                ))}
              </Cluster>
            </Stack>
          )
        }
      >
        {thread?.turns.map((t) => message(thread, t))}
      </ChatLayout>

      <Dialog
        open={dialog?.kind === 'share'}
        onClose={() => setDialog(null)}
        title={s.shareTitle}
        description={s.shareDescription}
        actions={<Button label={s.done} emphasis="primary" onClick={() => setDialog(null)} />}
      >
        <TextField
          label={s.link}
          value={`${view.shareBase}${current}`}
          onCommit={() => undefined}
          readOnly
          action={{ label: s.copyLink, icon: 'copy', onAction: (link) => (void navigator.clipboard?.writeText(link), notify({ message: s.linkCopied, tone: 'success' })) }}
        />
      </Dialog>

      <Dialog open={dialog?.kind === 'search'} onClose={() => setDialog(null)} title={s.searchChats}>
        <Stack gap="group">
          <TextField label={s.search} hideLabel type="search" placeholder={s.searchChats} value={query} onCommit={setQuery} clearable />
          {found.length ? <List mode="action" label={s.chats} groups={found} size="s" /> : <Text tone="muted">{fill(s.noMatch, { query })}</Text>}
        </Stack>
      </Dialog>

      <Dialog
        open={dialog?.kind === 'delete'}
        alert
        size="s"
        onClose={() => setDialog(null)}
        title={s.deleteTitle}
        description={fill(s.deleteDescription, { title: deleting?.title ?? '' })}
        actions={
          <>
            <Button label={s.cancel} onClick={() => setDialog(null)} />
            <Button
              label={s.delete}
              emphasis="danger"
              onClick={() => {
                if (dialog?.kind === 'delete') remove(dialog.id);
                setDialog(null);
                notify({ message: s.deleted });
              }}
            />
          </>
        }
      />

      <Dialog open={dialog?.kind === 'settings'} onClose={() => setDialog(null)} title={s.settings} actions={<Button label={s.done} emphasis="primary" onClick={() => setDialog(null)} />}>
        <Stack gap="group">
          <Switch label={s.suggestions} description={s.suggestionsDescription} checked={prefs.suggestions} onChange={(v) => setPrefs((p) => ({ ...p, suggestions: v }))} />
          <Switch label={s.memory} description={s.memoryDescription} checked={prefs.memory} onChange={(v) => setPrefs((p) => ({ ...p, memory: v }))} />
        </Stack>
      </Dialog>
    </>
  );
}
