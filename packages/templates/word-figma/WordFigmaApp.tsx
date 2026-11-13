/**
 * The word-figma template's app (Q161): a word processor's functions in a design tool's chrome, from a copy of the
 * Design tool template's editor. EditorLayout holds the tool bar (Move, Text, the Insert flyout, Comment; Edit and Read
 * modes), the left panel (the main menu, the file's pages and its headings as the outline, Find, Styles) and the right
 * panel (Design: Style, Text, Fill and Paragraph for the selection, Page, Document and Export when nothing is selected;
 * Comments). The document is core's rich-text surface (G6) on the canvas (word-figma.Page). No styles.
 */
import { useEffect, useRef, useState } from 'react';
import { AvatarGroup, Button, Checkbox, Cluster, EditorLayout, Heading, MenuButton, NumberField, Persona, PropertyRow, PropertySection, Reveal, SegmentedControl, Select, Stack, Switch, Tabs, Text, TextArea, TextField, TreeView, notify, useRichText, type RichTextCommand, type TreeItem } from '@design-library/core/components';
import { fill } from '@design-library/core/render';
import { Page } from './parts/compounds/Page';
import type { WfBlock, WfThread, WordFigmaRecord } from './types';

const tags: Record<WfBlock['style'], string> = { title: 'h1', 'heading-1': 'h2', 'heading-2': 'h3', body: 'p', quote: 'blockquote' };
const HEADS = ':scope > :is(h1, h2, h3)';
const BODY_PT = 11;
const inserts: Record<string, string> = {
  table: `<table><tbody>${'<tr>'.concat('<td><br></td>'.repeat(3), '</tr>').repeat(3)}</tbody></table><p><br></p>`,
  'page-break': '<hr data-break=""><p><br></p>',
  line: '<hr><p><br></p>',
};
// tied to EditorLayout's 48rem container change point: panels sit beside the content from the same width
const wide = () => typeof window === 'undefined' || window.matchMedia('(min-width: 48rem)').matches;

export type WordFigmaScreen = 'editor' | 'text' | 'comments' | 'find' | 'read';

export function WordFigmaApp({ view, screen = 'editor', height = 'screen' }: { view: WordFigmaRecord; screen?: WordFigmaScreen; height?: 'fill' | 'screen' | 'lg' }) {
  const c = view.copy;
  const docRef = useRef<HTMLDivElement | null>(null);
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);
  const rich = useRichText(docRef, { initial: { 'align-left': true }, onChange: bump });
  const [tool, setTool] = useState(screen === 'comments' ? 'comment' : 'move');
  const [insertPick, setInsertPick] = useState('table');
  const [mode, setMode] = useState(screen === 'read' ? 'read' : 'edit');
  const [zoom, setZoom] = useState(1);
  const [tab, setTab] = useState(screen === 'comments' ? 'comments' : 'design');
  const [leftTab, setLeftTab] = useState('file');
  const [startOpen, setStartOpen] = useState(wide);
  const [endOpen, setEndOpen] = useState(wide);
  const [pagesOpen, setPagesOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [findOpen, setFindOpen] = useState(screen === 'find');
  const [query, setQuery] = useState(screen === 'find' ? 'section' : '');
  const [marks, setMarks] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [page, setPage] = useState({ margins: 'normal', orientation: 'portrait', columns: '1' });
  const [currentPage, setCurrentPage] = useState('p1');
  const [threads, setThreads] = useState<WfThread[]>(view.threads);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const reading = mode === 'read';

  // The document is filled once from the record; from then on the person owns it.
  useEffect(() => {
    const ed = docRef.current;
    if (!ed) return;
    ed.replaceChildren(...view.document.map((b) => {
      const n = document.createElement(tags[b.style]);
      n.textContent = b.text;
      return n;
    }));
    rich.reset();
    if (screen === 'text') {
      const first = ed.querySelector<HTMLElement>(':scope > h2');
      if (first) selectNode(first);
    }
    bump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ed = docRef.current;
  const heads = ed ? [...ed.querySelectorAll<HTMLElement>(HEADS)] : [];
  const breaks = ed ? [...ed.querySelectorAll<HTMLElement>(':scope > hr[data-break]')] : [];
  const words = ed?.innerText.split(/\s+/).filter(Boolean).length ?? 0;
  const characters = ed?.innerText.replace(/\s/g, '').length ?? 0;
  const range = rich.selection();
  const selectedText = range?.toString() ?? '';
  const has = !!range;
  const s = rich.state;
  const blockOf = (node?: Node | null) => {
    let n: Node | null | undefined = node;
    while (n && n.parentNode !== ed) n = n.parentNode;
    return n as HTMLElement | null | undefined;
  };
  const block = blockOf(range?.startContainer);
  const layerId = block && heads.includes(block) ? `h${heads.indexOf(block)}` : undefined;

  const exec = (command: RichTextCommand, value?: string) => {
    if (reading) return notify({ subject: 'wf-read', message: c.readOn });
    rich.run(command, value);
  };
  function selectNode(n: Node) {
    const r = document.createRange();
    r.selectNodeContents(n);
    rich.select(r);
    (n instanceof HTMLElement ? n : n.parentElement)?.scrollIntoView({ block: 'center' });
  }
  const deselect = () => {
    rich.reset();
    getSelection()?.removeAllRanges();
    (document.activeElement as HTMLElement | null)?.blur?.();
    bump();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented && (e.target as Element | null)?.closest?.('[data-dl-part="doc"]')) return deselect();
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key;
      if (k === 'f') { e.preventDefault(); return openFind(); }
      if (k === 's') { e.preventDefault(); return notify({ subject: 'wf-save', tone: 'success', message: c.saved }); }
      if (k === '=' || k === '+') { e.preventDefault(); return stepZoom(1); }
      if (k === '-') { e.preventDefault(); return stepZoom(-1); }
      if (k === '0') { e.preventDefault(); return setZoom(1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const stepZoom = (by: 1 | -1) => setZoom((z) => (by > 0 ? view.zooms.find((x) => x > z) : [...view.zooms].reverse().find((x) => x < z)) ?? z);
  const openFind = () => {
    setStartOpen(true);
    setLeftTab('file');
    setFindOpen(true);
  };
  const insert = (what: string) => {
    if (what === 'date') return exec('insert-text', new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }));
    if (what === 'symbol') return exec('insert-text', 'Ω');
    exec('insert-html', inserts[what]);
  };
  const setCase = (how: string) => {
    if (!selectedText) return notify({ subject: 'wf-case', message: c.selectFirst });
    const lower = selectedText.toLowerCase();
    exec('insert-text', how === 'upper' ? selectedText.toUpperCase() : how === 'lower' ? lower : how === 'title' ? lower.replace(/(^|\s)\S/g, (m) => m.toUpperCase()) : lower.replace(/(^\s*|[.!?]\s+)\S/g, (m) => m.toUpperCase()));
  };
  const paste = () => {
    if (!rich.focus()) return;
    const kept = rich.selection()?.cloneRange();
    navigator.clipboard?.readText().then(
      (text) => {
        if (kept) rich.select(kept);
        exec('insert-text', text);
      },
      () => notify({ subject: 'wf-paste', message: c.pasteBlocked }),
    ) ?? notify({ subject: 'wf-paste', message: c.pasteBlocked });
  };
  const notIn = (label: string) => notify({ subject: 'wf-not-built', message: fill(c.notInExample, { label }) });
  const labelOf = (value: string) => view.menu.flatMap((m) => [m, ...(m.items ?? [])]).find((m) => m.value === value)?.label ?? value;
  const runMenu = (value: string) => {
    if (value === 'undo' || value === 'redo' || value === 'select-all' || value === 'bold' || value === 'italic' || value === 'underline' || value === 'clear') return exec(value);
    if (value === 'cut' || value === 'copy') {
      exec(value);
      return notify({ subject: 'wf-clipboard', tone: 'success', message: value === 'cut' ? c.cutDone : c.copyDone });
    }
    if (value === 'paste') return paste();
    if (value === 'find') return openFind();
    if (value === 'save') return notify({ subject: 'wf-save', tone: 'success', message: c.saved });
    if (value === 'zoom-in') return stepZoom(1);
    if (value === 'zoom-out') return stepZoom(-1);
    if (value === 'zoom-100') return setZoom(1);
    if (value === 'read') return setMode('read');
    if (value === 'marks') return setMarks((m) => !m);
    if (value === 'word-count') return notify({ subject: 'wf-count', message: fill(c.wordCountDone, { count: words }) });
    if (value in inserts || value === 'date' || value === 'symbol') return insert(value);
    notIn(labelOf(value));
  };

  /* The outline: the title's headings under it, each Heading 2 under its Heading 1, as layers nest in frames. */
  const outline: TreeItem[] = [];
  const parents: string[] = [];
  {
    let top: TreeItem | undefined;
    let mid: TreeItem | undefined;
    heads.forEach((h, i) => {
      const item: TreeItem = { id: `h${i}`, label: h.textContent?.trim() || '…', icon: h.tagName === 'H1' ? 'frame' : 'text' };
      const into = (p: TreeItem | undefined) => {
        if (!p) return outline.push(item);
        (p.children ??= []).push(item);
        if (!parents.includes(p.id)) parents.push(p.id);
      };
      if (h.tagName === 'H1') { outline.push(item); top = item; mid = undefined; }
      else if (h.tagName === 'H2') { into(top); mid = item; }
      else into(mid ?? top);
    });
  }
  const pageItems: TreeItem[] = Array.from({ length: breaks.length + 1 }, (_, i) => ({ id: `p${i + 1}`, label: fill(c.page, { n: i + 1 }) }));
  const showPage = (id: string) => {
    setCurrentPage(id);
    const n = Number(id.slice(1));
    if (n === 1) docRef.current?.firstElementChild?.scrollIntoView({ block: 'start' });
    else breaks[n - 2]?.scrollIntoView({ block: 'start' });
  };

  /* Find: every match is highlighted on the page and listed under the field. */
  const q = query.trim().toLowerCase();
  const found: Range[] = [];
  if (ed && q && findOpen) {
    const walk = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const text = n.textContent?.toLowerCase() ?? '';
      for (let at = text.indexOf(q); at >= 0; at = text.indexOf(q, at + q.length)) {
        const r = document.createRange();
        r.setStart(n, at);
        r.setEnd(n, at + q.length);
        found.push(r);
      }
    }
  }
  useEffect(() => {
    const registry = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;
    if (!registry || typeof Highlight === 'undefined') return;
    if (found.length) registry.set('word-figma-find', new Highlight(...found));
    else registry.delete('word-figma-find');
  });
  const show = (r: Range) => {
    rich.select(r);
    r.startContainer.parentElement?.scrollIntoView({ block: 'center' });
  };
  const anchorRange = (words: string) => {
    if (!ed) return;
    const walk = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const at = n.textContent?.indexOf(words) ?? -1;
      if (at >= 0) {
        const r = document.createRange();
        r.setStart(n, at);
        r.setEnd(n, at + words.length);
        return r;
      }
    }
  };

  /* Comments, Figma's comment mode: threads pinned to words. */
  const change = (id: string, fn: (t: WfThread) => WfThread) => setThreads((all) => all.map((t) => (t.id === id ? fn(t) : t)));
  const reply = (t: WfThread) => {
    const text = drafts[t.id]?.trim();
    if (!text) return;
    change(t.id, (x) => ({ ...x, replies: [...x.replies, { author: view.me, time: c.now, text }] }));
    setDrafts((d) => ({ ...d, [t.id]: '' }));
  };
  const resolve = (t: WfThread) => {
    change(t.id, (x) => ({ ...x, resolved: !x.resolved }));
    if (!t.resolved) notify({ subject: 'wf-resolve', message: fill(c.resolved, { words: t.anchor }) });
  };
  const addComment = () => {
    const text = draft.trim();
    if (!text || !selectedText.trim()) return;
    setThreads((all) => [...all, { id: `t${all.length + 1}-${Date.now()}`, anchor: selectedText.trim(), author: view.me, time: c.now, text, replies: [] }]);
    setDraft('');
    notify({ subject: 'wf-comment', tone: 'success', message: c.added });
  };
  const openThreads = threads.filter((t) => !t.resolved).length;

  const pickTool = (v: string) => {
    const flyout = view.tools.find((t) => t.menu?.some((m) => m.value === v));
    if (flyout) {
      insert(v);
      return setTool('move');
    }
    setTool(v);
    if (v === 'comment') {
      setEndOpen(true);
      setTab('comments');
    } else if (tab === 'comments') setTab('design');
    if (v === 'text') rich.focus();
  };
  const toolOptions = view.tools.map((g) => {
    const shown = g.menu?.find((m) => m.value === insertPick) ?? g;
    return {
      value: g.menu ? shown.value : g.value,
      label: shown.label,
      icon: shown.icon,
      trailing: g.menu && (
        <MenuButton label={fill(c.moreTools, { tool: g.label })} icon="chevron-down" iconOnly size="xs" emphasis="quiet" items={g.menu.map((m) => ({ value: m.value, label: m.label, icon: m.icon }))} onSelect={(v) => {
            setInsertPick(v);
            pickTool(v);
          }} />
      ),
    };
  });

  const zoomMenu = <MenuButton label={fill(c.zoomValue, { percent: Math.round(zoom * 100) })} menuLabel={c.zoom} size="xs" emphasis="quiet" onSelect={(v) => setZoom(Number(v))} items={view.zooms.map((z) => ({ value: String(z), label: fill(c.zoomTo, { percent: z * 100 }), checked: z === zoom }))} />;
  const blockTag = s.block === 'li' || !s.block ? 'p' : s.block;
  const align = (['align-left', 'align-center', 'align-right', 'justify'] as const).find((a) => s.active[a]) ?? 'align-left';
  const list = s.active.numbering ? 'numbering' : s.active.bullets ? 'bullets' : 'none';
  const size = s.sizeRatio ? Math.round(s.sizeRatio * BODY_PT * 2) / 2 : BODY_PT;
  const font = view.fonts.find((f) => s.font?.toLowerCase().includes(f.toLowerCase())) ?? view.fonts[0];
  const toggle = (k: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'subscript' | 'superscript', icon: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'subscript' | 'superscript') => (
    <Button key={k} label={c[k]} icon={icon} iconOnly tooltip size="xs" emphasis="quiet" pressed={!!s.active[k]} onClick={() => exec(k)} />
  );

  const design = has ? (
    <>
      <PropertySection heading={c.style} density="compact">
        <Select label={c.style} hideLabel size="xs" value={blockTag} options={view.styles} onChange={(v) => exec('block', v)} />
      </PropertySection>
      <PropertySection heading={c.text} density="compact" actions={<Button label={c.clear} icon="clear-format" iconOnly tooltip size="xs" emphasis="quiet" onClick={() => exec('clear')} />}>
        <Select label={c.font} hideLabel size="xs" value={font} options={view.fonts.map((f) => ({ value: f, label: f }))} onChange={(v) => exec('font', v)} />
        <PropertyRow columns={2}>
          <NumberField label={c.fontSize} hideLabel icon="text-format" size="xs" unit="pt" min={1} max={400} presets={view.sizes} value={size} onCommit={(pt) => exec('size', `calc(var(--text-l) * ${pt / BODY_PT})`)} />
          <MenuButton label={c.case} size="xs" emphasis="quiet" chevron items={view.cases.filter((x) => x.value !== 'none')} onSelect={setCase} />
        </PropertyRow>
        <Cluster gap="pair" wrap={false}>
          {toggle('bold', 'bold')}
          {toggle('italic', 'italic')}
          {toggle('underline', 'underline')}
          {toggle('strikethrough', 'strikethrough')}
          {toggle('subscript', 'subscript')}
          {toggle('superscript', 'superscript')}
        </Cluster>
      </PropertySection>
      <PropertySection heading={c.fill} density="compact">
        <PropertyRow columns={2}>
          <MenuButton label={c.colour} icon="text-colour" size="xs" emphasis="quiet" chevron items={view.colours} onSelect={(v) => exec('colour', v)} />
          <MenuButton label={c.highlight} icon="highlight" size="xs" emphasis="quiet" chevron items={view.highlights} onSelect={(v) => exec('highlight', v)} />
        </PropertyRow>
      </PropertySection>
      <PropertySection heading={c.paragraph} density="compact">
        <SegmentedControl label={c.alignment} iconOnly size="xs" fill value={align} onChange={(v) => exec(v as RichTextCommand)} options={view.alignments} />
        <PropertyRow columns={2}>
          <NumberField label={c.lineHeight} hideLabel icon="line-spacing" size="xs" step={0.05} min={1} max={4} presets={view.lineHeights} value={lineHeight} onCommit={(v) => { setLineHeight(v); exec('line-height', String(v)); }} />
          <Cluster gap="pair" wrap={false}>
            <Button label={c.outdent} icon="indent-decrease" iconOnly tooltip size="xs" emphasis="quiet" onClick={() => exec('outdent')} />
            <Button label={c.indent} icon="indent-increase" iconOnly tooltip size="xs" emphasis="quiet" onClick={() => exec('indent')} />
          </Cluster>
        </PropertyRow>
        <SegmentedControl label={c.list} iconOnly size="xs" fill value={list} onChange={(v) => (v === 'none' ? list !== 'none' && exec(list as RichTextCommand) : exec(v as RichTextCommand))} options={view.lists} />
        <Checkbox label={c.marks} checked={marks} onChange={setMarks} />
      </PropertySection>
    </>
  ) : (
    <>
      <PropertySection heading={c.pageSection} density="compact">
        <Select label={c.margins} size="xs" value={page.margins} options={view.margins} onChange={(v) => setPage((p) => ({ ...p, margins: v }))} />
        <SegmentedControl label={c.orientation} size="xs" fill value={page.orientation} onChange={(v) => setPage((p) => ({ ...p, orientation: v }))} options={view.orientations} />
        <SegmentedControl label={c.columns} size="xs" fill value={page.columns} onChange={(v) => setPage((p) => ({ ...p, columns: v }))} options={view.columns} />
      </PropertySection>
      <PropertySection heading={c.documentSection} density="compact">
        <Text variant="body-sm" tone="muted">{breaks.length ? fill(c.pagesCount, { count: breaks.length + 1 }) : c.pageCount}</Text>
        <Text variant="body-sm" tone="muted">{fill(c.wordsCount, { count: words })}</Text>
        <Text variant="body-sm" tone="muted">{fill(c.charactersCount, { count: characters })}</Text>
      </PropertySection>
      <PropertySection heading={c.export} density="compact">
        <Button label={c.exportPdf} size="xs" onClick={() => notIn(c.exportPdf)} />
      </PropertySection>
    </>
  );

  const comments = (
    <Stack gap="group">
      <Stack gap="item">
        <TextArea label={c.newComment} rows={2} grow value={draft} onChange={setDraft} hint={selectedText.trim() ? fill(c.onWords, { words: selectedText.trim().slice(0, 40) }) : c.selectFirst} />
        <Cluster gap="item">
          <Button label={c.addComment} emphasis="primary" size="s" unavailable={!selectedText.trim() ? c.selectFirst : draft.trim() ? undefined : c.replyFirst} onClick={addComment} />
        </Cluster>
      </Stack>
      <Switch label={c.showResolved} checked={showResolved} onChange={setShowResolved} size="s" />
      {!openThreads && !showResolved && <Text variant="body-sm" tone="muted">{c.noComments}</Text>}
      {threads.map((t) => (
        <Reveal key={t.id} open={!t.resolved || showResolved}>
          <Stack gap="item">
            <Button label={fill(c.onWords, { words: t.anchor })} icon="comment" emphasis="quiet" size="s" align="start" onClick={() => { const r = anchorRange(t.anchor); if (r) show(r); }} />
            {[t, ...t.replies].map((m, n) => (
              <Stack key={n} gap="pair">
                <Persona name={m.author} secondary={m.time} size={24} />
                <Text variant="body-sm">{m.text}</Text>
              </Stack>
            ))}
            {!t.resolved && <TextArea label={c.replyLabel} rows={2} grow value={drafts[t.id] ?? ''} onChange={(v) => setDrafts((d) => ({ ...d, [t.id]: v }))} />}
            <Cluster gap="item">
              {!t.resolved && <Button label={c.reply} emphasis="primary" size="s" unavailable={drafts[t.id]?.trim() ? undefined : c.replyFirst} onClick={() => reply(t)} />}
              <Button label={t.resolved ? c.reopen : c.resolve} icon={t.resolved ? undefined : 'check'} size="s" onClick={() => resolve(t)} />
            </Cluster>
          </Stack>
        </Reveal>
      ))}
    </Stack>
  );

  const head = has ? (
    <Stack gap="pair">
      <Heading level={2} size="label">{layerId ? heads[Number(layerId.slice(1))]?.textContent : selectedText ? c.selection : c.caret}</Heading>
      <Text variant="body-sm" tone="muted">{layerId ? c.headingKind : c.text}</Text>
    </Stack>
  ) : (
    <Stack gap="pair">
      <Heading level={2} size="label">{fill(c.page, { n: Number(currentPage.slice(1)) })}</Heading>
      <Text variant="body-sm" tone="muted">{c.documentKind}</Text>
    </Stack>
  );

  return (
    <EditorLayout
      data-template="word-figma"
      data-material="solid"
      data-density="compact"
      resizable
      toggles="inner"
      height={height}
      startOpen={startOpen}
      onStartToggle={() => setStartOpen((x) => !x)}
      endOpen={endOpen}
      onEndToggle={() => setEndOpen((x) => !x)}
      toolsLabel={c.tool}
      tools={
        <Cluster gap="group" wrap={false}>
          <SegmentedControl label={c.tool} iconOnly size="s" track={false} value={tool} onChange={pickTool} options={toolOptions} />
          <SegmentedControl label={c.mode} iconOnly size="xs" emphasis="raised" value={mode} onChange={setMode} options={view.modes} />
        </Cluster>
      }
      startHead={
        <Stack gap="pair">
          <Cluster gap="item" wrap={false}>
            <MenuButton label={c.mainMenu} icon="menu" iconOnly size="s" emphasis="quiet" items={view.menu} onSelect={runMenu} />
          </Cluster>
          <Heading level={1} size="label">{view.file}</Heading>
          <Text as="span" variant="body-sm" tone="muted">{view.project}</Text>
        </Stack>
      }
      endHead={
        <Cluster gap="item" justify="between" wrap={false}>
          <AvatarGroup label={c.working} members={view.people} size={24} max={2} />
          <Cluster gap="item" wrap={false}>
            <Button label={c.present} icon="play" iconOnly tooltip emphasis="quiet" size="xs" pressed={reading} onClick={() => setMode(reading ? 'edit' : 'read')} />
            <Button label={c.share} emphasis="primary" size="s" onClick={() => notIn(c.share)} />
          </Cluster>
        </Cluster>
      }
      start={
        <Tabs label={c.layers} size="xs" selected={leftTab} onChange={setLeftTab}
          extra={<Button label={findOpen ? c.findClose : c.find} icon={findOpen ? 'close' : 'search'} iconOnly tooltip emphasis="quiet" size="xs" onClick={() => (findOpen ? (setFindOpen(false), setQuery('')) : openFind())} />}
          items={[
            { id: 'file', label: c.fileTab, panel: (
              <Stack gap="group">
                {findOpen && (
                  <Stack gap="item">
                    <TextField label={c.find} hideLabel placeholder={c.find} type="search" icon="search" size="xs" clearable value={query} onChange={setQuery} />
                    {q && <Text variant="body-sm" tone="muted">{found.length ? fill(c.findCount, { count: found.length }) : c.findNone}</Text>}
                    {found.slice(0, 20).map((r, i) => {
                      const text = r.startContainer.textContent ?? '';
                      const from = Math.max(0, r.startOffset - 18);
                      return <Button key={i} label={`…${text.slice(from, r.endOffset + 24)}…`} size="xs" emphasis="quiet" align="start" onClick={() => show(r)} />;
                    })}
                  </Stack>
                )}
                <Stack gap="item">
                  <Cluster gap="item" justify="between" wrap={false}>
                    <Heading level={2} size="label">{c.pages}</Heading>
                    <Button label={c.pages} icon={pagesOpen ? 'chevron-down' : 'chevron-end'} iconOnly tooltip emphasis="quiet" size="xs" expanded={pagesOpen} onClick={() => setPagesOpen((x) => !x)} />
                  </Cluster>
                  <Reveal open={pagesOpen}>
                    <TreeView label={c.pages} mark="current" items={pageItems} expanded={[]} onExpandedChange={() => {}} selected={currentPage} onSelect={showPage} />
                  </Reveal>
                </Stack>
                <Stack gap="item">
                  <Heading level={2} size="label">{c.layers}</Heading>
                  {outline.length ? (
                    <TreeView label={c.layers} items={outline} expanded={parents.filter((p) => !collapsed.includes(p))} onExpandedChange={(ids) => setCollapsed(parents.filter((p) => !ids.includes(p)))} selected={layerId} onSelect={(id) => { const h = heads[Number(id.slice(1))]; if (h) selectNode(h); }} />
                  ) : (
                    <Text variant="body-sm" tone="muted">{c.noHeadings}</Text>
                  )}
                </Stack>
              </Stack>
            ) },
            { id: 'styles', label: c.stylesTab, panel: (
              <Stack gap="item">
                <Text variant="body-sm" tone="muted">{c.stylesHint}</Text>
                {view.styles.map((st) => (
                  <Button key={st.value} label={st.label} size="xs" emphasis="quiet" align="start" pressed={has && blockTag === st.value} onClick={() => exec('block', st.value)} />
                ))}
              </Stack>
            ) },
          ]}
        />
      }
      endLabel={c.inspector}
      end={
        <Tabs label={c.inspector} size="xs" selected={tab} onChange={(t) => { setTab(t); setTool(t === 'comments' ? 'comment' : 'move'); }} extra={zoomMenu}
          items={[
            { id: 'design', label: c.design, panel: <Stack gap="group">{head}{design}</Stack> },
            { id: 'comments', label: c.comments, count: openThreads, panel: comments },
          ]}
        />
      }
    >
      <Page label={fill(c.canvas, { file: view.file })} documentLabel={view.file} docRef={docRef} surface={rich.surface} readOnly={reading} zoom={zoom} margins={page.margins} orientation={page.orientation} columns={page.columns} marks={marks} onCanvasPress={deselect} />
    </EditorLayout>
  );
}
