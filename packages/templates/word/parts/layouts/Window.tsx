import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Checkbox, DataTable, defineIconPack, Heading, Icon, IconOverrides, MenuButton, notify, NumberField, Pane, Popover, Ribbon, ScrollArea, Select, Slider, Switch, Tabs, Text, TextField, WindowControls, type DataAttributes, type RibbonGroup } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import wordPack from '../../icons/pack.json';
import type { WordAction, WordBackstageTemplate, WordBlock, WordCommand, WordGroup, WordRecord, WordStyleSet } from '../../types';

/** The document editor's own icon names, typed by its pack (LG8). */
const wordIcons = defineIconPack(wordPack);

export interface WindowProps extends DataAttributes {
  /** Validated shared content: the document, its comments and every label. */
  view: WordRecord;
  /** A directly openable review state: `home`, `document`, `backstage`, `insert`, `draw`, `design`, `design-gallery`, `layout`, `references`, `mailings`, `review`, `view`, `help`, `navigation`, `comments` or `dark`. */
  screen?: string;
  /** Resolves an entry in the template's `assets.json`. */
  picture?: (id: string) => { src: string; alt: string };
}

const tags = { title: 'h1', 'heading-1': 'h2', 'heading-2': 'h3', body: 'p', quote: 'blockquote' } as const;
const V_CMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
/** The document commands whose state the selection reports, by the browser's editing command name. */
const queried: Partial<Record<WordAction, string>> = {
  bold: 'bold', italic: 'italic', underline: 'underline', strikethrough: 'strikeThrough', subscript: 'subscript', superscript: 'superscript',
  'align-left': 'justifyLeft', center: 'justifyCenter', 'align-right': 'justifyRight', justify: 'justifyFull', bullets: 'insertUnorderedList', numbering: 'insertOrderedList',
};
const executed: Partial<Record<WordAction, string>> = { ...queried, clear: 'removeFormat', outdent: 'outdent', indent: 'indent', cut: 'cut', copy: 'copy', 'select-all': 'selectAll' };
const BODY_PT = 11;
const SIZES = ['8', '9', '10', '10.5', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];

interface DocState {
  on: Partial<Record<WordAction, boolean>>;
  font?: string;
  size?: string;
  selected: boolean;
}

/**
 * A desktop word processor's window: a title bar with quick actions, a command ribbon, rulers, the page on its canvas
 * with optional Navigation and Comments panes, and a status bar.
 * Not for a web page editor (EditorLayout) or a conversation (ChatLayout).
 * The ribbon, panes, fields, scrolling and focus stay in core; this part only arranges them.
 * @tier layout
 * @family word
 * @a11y One main landmark (the document), a named ribbon and status bar, and native core controls.
 */
export function Window({ view, screen = 'home', picture, ...data }: WindowProps) {
  const c = view.copy;
  const userAvatar = picture?.('userAvatar');
  const rootRef = useRef<HTMLDivElement>(null);
  const styleStripRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(tabFor(screen));
  const [backstageOpen, setBackstageOpen] = useState(screen === 'backstage');
  const [fileFilter, setFileFilter] = useState<'recent' | 'favorites' | 'shared'>('recent');
  const [fileQuery, setFileQuery] = useState('');
  const [bsPromptOpen, setBsPromptOpen] = useState(false);
  const [bsPrompt, setBsPrompt] = useState('');
  const [pane, setPane] = useState<'navigation' | 'comments' | undefined>(paneFor(screen));
  const [copilotOpen, setCopilotOpen] = useState(screen === 'dark');
  const [galleryOpen, setGalleryOpen] = useState(screen === 'design-gallery');
  const [activeStyle, setActiveStyle] = useState('current');
  const [autoSave, setAutoSave] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [showGridlines, setShowGridlines] = useState(false);
  const [zoom, setZoom] = useState(90);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  // Toggles keyed by command label; sets (alignment, lists) keyed by set name, holding the label that's on.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [setOn, setSetOn] = useState<Record<string, string | undefined>>({});
  const [windowState, setWindowState] = useState<'normal' | 'maximised' | 'minimised' | 'closed'>('normal');
  const [saveState, setSaveState] = useState(view.saveState);
  const [bsSection, setBsSection] = useState('home');
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [docView, setDocView] = useState<'read' | 'print' | 'web'>('print');
  const [focusMode, setFocusMode] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [ribbonCollapsed, setRibbonCollapsed] = useState(false);
  const [navTab, setNavTab] = useState('headings');
  const [doc, setDoc] = useState<DocState>({ on: { 'align-left': true }, selected: false });
  const [docEmpty, setDocEmpty] = useState(true);
  const [docFocused, setDocFocused] = useState(false);
  const [edited, setEdited] = useState(false);
  const [marks, setMarks] = useState(false);
  const [painter, setPainter] = useState<DocState['on'] | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<string | undefined>(undefined);
  const [, setDocVersion] = useState(0);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const docHtml = useRef<string | null>(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const notBuilt = (label: string) => notify({ subject: 'word-command', message: say(c.notBuilt, { label: label.replace(/\n/g, ' ') }) });
  const save = () => {
    setSaveState(`- ${c.saved}`);
    notify({ subject: 'word-save', tone: 'success', message: c.saved });
  };
  useEffect(() => { void loadFace('noto-sans'); }, []);

  /* The page is an editing surface: the ribbon's document commands run on its selection, and the selection's own
     formatting sets each command's pressed state and the font fields. */
  const isEmpty = (ed: HTMLElement) => !ed.textContent?.trim() && !ed.querySelector('li');
  const fillDoc = (ed: HTMLElement) => {
    const sample = screenRef.current === 'navigation' || screenRef.current === 'comments';
    const blocks: WordBlock[] = sample ? view.document : [{ style: 'body', text: '' }];
    ed.replaceChildren(...blocks.map((b) => {
      const n = document.createElement(tags[b.style]);
      if (b.text) n.textContent = b.text;
      else n.append(document.createElement('br'));
      return n;
    }));
    rangeRef.current = null;
    setDocEmpty(!sample);
    setEdited(false);
  };
  const bindDoc = useCallback((ed: HTMLDivElement | null) => {
    if (ed) {
      editorRef.current = ed;
      if (docHtml.current != null) ed.innerHTML = docHtml.current;
      else fillDoc(ed);
      setDocEmpty(isEmpty(ed));
    } else if (editorRef.current) {
      docHtml.current = editorRef.current.innerHTML;
      editorRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    docHtml.current = null;
    if (editorRef.current) fillDoc(editorRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  const readDoc = useCallback(() => {
    const ed = editorRef.current;
    const sel = getSelection();
    if (!ed || !sel?.rangeCount || !ed.contains(sel.anchorNode)) return;
    rangeRef.current = sel.getRangeAt(0).cloneRange();
    const at = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement;
    const on: DocState['on'] = {};
    for (const [action, name] of Object.entries(queried)) on[action as WordAction] = document.queryCommandState(name);
    on.multilevel = !!at?.closest('li li');
    if (on.multilevel) on.numbering = on.bullets = false;
    const style = at ? getComputedStyle(at) : undefined;
    // Sizes read in points against the page's body, which Word calls 11 pt.
    const pt = style ? Math.round((parseFloat(style.fontSize) / parseFloat(getComputedStyle(ed).fontSize)) * BODY_PT * 2) / 2 : undefined;
    const family = style?.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    setDoc({ on, selected: !sel.isCollapsed, size: pt ? String(pt) : undefined, font: family });
  }, []);
  useEffect(() => {
    document.addEventListener('selectionchange', readDoc);
    return () => document.removeEventListener('selectionchange', readDoc);
  }, [readDoc]);
  /** Puts focus and the last selection back in the page, so a ribbon command acts where the person was. */
  const toDoc = () => {
    const ed = editorRef.current;
    const sel = getSelection();
    if (!ed || !sel) return false;
    ed.focus({ preventScroll: true });
    sel.removeAllRanges();
    if (rangeRef.current && ed.contains(rangeRef.current.startContainer)) sel.addRange(rangeRef.current);
    else {
      const r = document.createRange();
      r.selectNodeContents(ed.lastElementChild ?? ed);
      r.collapse(false);
      sel.addRange(r);
    }
    return true;
  };
  const changed = () => {
    const ed = editorRef.current;
    if (ed) setDocEmpty(isEmpty(ed));
    setEdited(true);
    setDocVersion((v) => v + 1);
    readDoc();
  };
  const exec = (name: string, value?: string) => {
    if (!toDoc()) return;
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(name, false, value);
    changed();
  };
  /** Sets the selection's size in points: the browser's own sizes are 1–7, so size 7 marks the run, then gets its points. */
  const setSize = (pt: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    exec('fontSize', '7');
    ed.querySelectorAll('font[size="7"]').forEach((f) => {
      f.removeAttribute('size');
      (f as HTMLElement).style.fontSize = `calc(var(--text-l) * ${parseFloat(pt) / BODY_PT})`;
    });
    changed();
  };
  const stepSize = (by: 1 | -1) => {
    const now = parseFloat(doc.size ?? '11');
    const next = by > 0 ? SIZES.find((s) => parseFloat(s) > now) : [...SIZES].reverse().find((s) => parseFloat(s) < now);
    if (next) setSize(next);
  };
  const accent = (n: number) => (rootRef.current ? getComputedStyle(rootRef.current).getPropertyValue(`--c-icon-accent-${n}`).trim() : '') || undefined;
  /** The blocks the selection touches (paragraphs, headings, list items). */
  const selectedBlocks = () => {
    const ed = editorRef.current;
    const r = rangeRef.current;
    if (!ed || !r) return [];
    return [...ed.querySelectorAll<HTMLElement>(':scope > :is(p, h1, h2, h3, blockquote), li')].filter((b) => r.intersectsNode(b));
  };
  const setCase = (mode: string) => {
    if (!toDoc()) return;
    const words = getSelection()?.toString() ?? '';
    if (!words) return;
    const lower = words.toLowerCase();
    const next = mode === 'upper' ? words.toUpperCase() : mode === 'lower' ? lower : mode === 'title' ? lower.replace(/(^|\s)\S/g, (m) => m.toUpperCase()) : lower.replace(/(^\s*|[.!?]\s+)\S/g, (m) => m.toUpperCase());
    document.execCommand('insertText', false, next);
    changed();
  };
  const paste = () => {
    if (!toDoc()) return;
    const kept = rangeRef.current?.cloneRange();
    navigator.clipboard?.readText().then(
      (words) => {
        toDoc();
        if (kept) { const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(kept); }
        document.execCommand('insertText', false, words);
        changed();
      },
      () => notify({ subject: 'word-paste', message: c.pasteBlocked }),
    ) ?? notify({ subject: 'word-paste', message: c.pasteBlocked });
  };
  const find = () => {
    setPane('navigation');
    setNavTab('results');
    setTimeout(() => rootRef.current?.querySelector<HTMLInputElement>('[data-dl-part="nav-pane"] input')?.focus());
  };
  const runAction = (action: string) => {
    const [kind, arg] = action.split(':');
    if (kind === 'style') return exec('formatBlock', tags[arg as WordBlock['style']] ?? 'p');
    if (kind === 'case') return setCase(arg);
    if (kind === 'spacing') {
      if (!toDoc()) return;
      selectedBlocks().forEach((b) => { b.style.lineHeight = arg; });
      return changed();
    }
    const a = kind as WordAction;
    if (a === 'paste') return paste();
    if (a === 'find') return find();
    if (a === 'grow' || a === 'shrink') return stepSize(a === 'grow' ? 1 : -1);
    if (a === 'highlight') return exec('hiliteColor', accent(1));
    if (a === 'font-colour') return exec('foreColor', accent(2));
    if (a === 'marks') return setMarks((m) => !m);
    if (a === 'format-painter') return setPainter((p) => (p ? undefined : { ...doc.on }));
    if (a === 'multilevel') {
      if (!doc.on.numbering && !doc.on.bullets && !doc.on.multilevel) exec('insertOrderedList');
      return exec(doc.on.multilevel ? 'outdent' : 'indent');
    }
    if (a === 'cut' || a === 'copy') {
      exec(a);
      return notify({ subject: 'word-clipboard', tone: 'success', message: a === 'cut' ? c.cutDone : c.copyDone });
    }
    const name = executed[a];
    if (name) return exec(name);
    notBuilt(action);
  };
  /** Format Painter: the next selection takes the formatting the painter picked up. */
  const paint = () => {
    const sel = getSelection();
    if (!painter || !sel || sel.isCollapsed) return;
    readDoc();
    for (const a of ['bold', 'italic', 'underline', 'strikethrough'] as const) {
      if (!!painter[a] !== document.queryCommandState(queried[a]!)) document.execCommand(queried[a]!, false);
    }
    setPainter(undefined);
    changed();
  };
  /* Find: every match in the page is highlighted while the Results tab lists them. */
  const matches = (() => {
    const ed = editorRef.current;
    const q = query.trim().toLowerCase();
    if (!ed || !q) return [];
    return [...ed.querySelectorAll<HTMLElement>(':scope > :is(p, h1, h2, h3, blockquote), li')].filter((b) => b.textContent?.toLowerCase().includes(q));
  })();
  useEffect(() => {
    const ed = editorRef.current;
    const registry = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;
    const q = query.trim().toLowerCase();
    if (!registry || typeof Highlight === 'undefined') return;
    if (!ed || !q || pane !== 'navigation') { registry.delete('word-find'); return; }
    const ranges: Range[] = [];
    const walk = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const text = n.textContent?.toLowerCase() ?? '';
      for (let i = text.indexOf(q); i >= 0; i = text.indexOf(q, i + q.length)) {
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + q.length);
        ranges.push(r);
      }
    }
    registry.set('word-find', new Highlight(...ranges));
    return () => { registry.delete('word-find'); };
  });
  const showMatch = (block: HTMLElement) => {
    block.scrollIntoView({ block: 'center' });
    const r = document.createRange();
    r.selectNodeContents(block);
    rangeRef.current = r;
    toDoc();
  };
  useEffect(() => {
    setPane(paneFor(screen));
    setTab(tabFor(screen));
    setBackstageOpen(screen === 'backstage');
    setBsSection('home');
    setCopilotOpen(screen === 'dark');
    setGalleryOpen(screen === 'design-gallery');
  }, [screen]);
  useEffect(() => {
    const tpl = rootRef.current?.closest('[data-template="word"]');
    const site = rootRef.current?.closest('[data-dl="site-layout"]');
    if (screen === 'dark') {
      tpl?.setAttribute('data-scheme', 'dark');
      site?.setAttribute('data-scheme', 'dark');
      return () => {
        tpl?.removeAttribute('data-scheme');
        site?.removeAttribute('data-scheme');
      };
    }
    tpl?.removeAttribute('data-scheme');
    site?.removeAttribute('data-scheme');
  }, [screen]);

  const showSampleDoc = screen === 'navigation' || screen === 'comments';
  // Read Mode, Web Layout and Focus show the page without rulers; Focus also hides the ribbon.
  const rulerShown = showRuler && docView === 'print' && !focusMode;

  const styleTile = (s: WordStyleSet, active: boolean, onChoose: () => void, large = false) => (
    <div key={s.id} data-dl="word-style-tile" data-large={large ? '' : undefined} data-active={active ? '' : undefined}>
      {/* binary-setting: chooses one document style set in a visual thumbnail strip, as in the reference. */}
      <Button label={s.name} icon="file" iconOnly tooltip={false} size="xs" emphasis="quiet" pressed={active} onClick={onChoose} />
      <span data-dl-part="preview" aria-hidden="true">
        <Icon name={wordIcons.of(`style-set-${s.variant}`)} />
      </span>
    </div>
  );

  const command = (cmd: WordCommand, key: string) => {
    if (cmd.kind === 'separator') return <span key={key} data-dl-part="separator" aria-hidden="true" />;
    if (cmd.kind === 'style-gallery') {
      const sets = view.styleSets ?? [];
      return (
        <div key={key} ref={styleStripRef} data-dl="word-style-strip">
          <div data-dl-part="tiles">
            {sets.slice(0, 11).map((s) => styleTile(s, activeStyle === s.id, () => setActiveStyle(s.id)))}
          </div>
          <span data-dl-part="expand" aria-hidden="true" />
        </div>
      );
    }
    if (cmd.kind === 'checkbox') {
      const isRuler = cmd.label === 'Ruler';
      const isNav = cmd.label === 'Navigation Pane';
      const isChecked = isRuler ? showRuler : isNav ? pane === 'navigation' : showGridlines;
      return (
        <div key={key} data-dl="word-checkbox">
          {/* binary-setting: dense View ribbon Show toolbar checkboxes (Ruler, Gridlines, Navigation Pane), matching the reference. */}
          <Checkbox
            label={cmd.label}
            size="s"
            checked={isChecked}
            onChange={(next) => {
              if (isRuler) setShowRuler(next);
              else if (isNav) setPane(next ? 'navigation' : undefined);
              else setShowGridlines(next);
            }}
          />
        </div>
      );
    }
    if (cmd.kind === 'field') {
      if (cmd.run === 'font' || cmd.run === 'font-size') {
        const opts = cmd.options ?? [cmd.value ?? ''];
        const isSize = cmd.run === 'font-size';
        const now = isSize ? (doc.size ?? cmd.value ?? '') : (opts.find((o) => o.split(' (')[0] === doc.font) ?? cmd.value ?? '');
        const list = opts.includes(now) ? opts : [...opts, now];
        return (
          <div key={key} data-dl="word-field" data-width={cmd.width}>
            <Select label={cmd.label} hideLabel size="xs" value={now} options={list.map((o) => ({ value: o, label: o }))} onChange={(v) => (isSize ? setSize(v) : exec('fontName', v.split(' (')[0]))} />
          </div>
        );
      }
      return (
        <div key={key} data-dl="word-field" data-width={cmd.width}>
          <Select label={cmd.label} hideLabel size="xs" value={cmd.value ?? ''} options={[{ value: cmd.value ?? '', label: cmd.value ?? '' }]} onChange={() => undefined} />
        </div>
      );
    }
    if (cmd.kind === 'labelled-field') {
      return (
        <div key={key} data-dl="word-labelled-field" data-icon={cmd.icon}>
          <span data-dl-part="field-label">
            {cmd.icon && <Icon name={wordIcons.of(cmd.icon)} size="sm" />}
            {!cmd.hideFieldLabel && <span>{cmd.label}</span>}
          </span>
          <div data-dl="word-field" data-width={cmd.width}>
            <Select label={cmd.label} hideLabel size="xs" value={cmd.value ?? ''} options={[{ value: cmd.value ?? '', label: cmd.value ?? '' }]} onChange={() => undefined} />
          </div>
        </div>
      );
    }
    if (cmd.kind === 'record-stepper') {
      return (
        <div key={key} data-dl="word-record-stepper">
          <Button label={c.firstRecord} icon={wordIcons.name('step-first')} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
          <Button label={c.previousRecord} icon={wordIcons.name('step-prev')} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
          <div data-dl-part="record-box">
            <TextField label={c.currentRecord} hideLabel size="xs" value="" onChange={() => undefined} disabled={cmd.disabled} />
          </div>
          <Button label={c.nextRecord} icon={wordIcons.name('step-next')} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
          <Button label={c.lastRecord} icon={wordIcons.name('step-last')} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
        </div>
      );
    }
    const isPen = cmd.kind === 'pen';
    const isTool = cmd.kind === 'tool';
    const isStacked = cmd.kind === 'stacked';
    const shownLabel = isStacked && cmd.lines ? cmd.lines.join('\n') : cmd.label;
    const set = typeof cmd.toggle === 'string' ? cmd.toggle : undefined;
    const fromDoc = cmd.run && (cmd.run in queried || cmd.run === 'multilevel');
    const pressed = fromDoc ? !!doc.on[cmd.run!]
      : cmd.run === 'marks' ? marks
      : cmd.run === 'format-painter' ? !!painter
      : cmd.toggle === true ? (toggled[cmd.label] ?? !!cmd.pressed) : set ? (set in setOn ? setOn[set] === cmd.label : !!cmd.pressed) : cmd.pressed;
    const disabled = cmd.run === 'cut' || cmd.run === 'copy' ? !doc.selected : cmd.disabled;
    const run = () => {
      if (cmd.run) runAction(cmd.run);
      else if (cmd.items) setOpenMenu(key);
      else if (cmd.toggle === true) setToggled((t) => ({ ...t, [cmd.label]: !pressed }));
      else if (set) setSetOn((s) => ({ ...s, [set]: set === 'list' && pressed ? undefined : cmd.label }));
      else notBuilt(cmd.label);
    };
    /* binary-setting: ribbon formatting and drawing commands are toolbar toggles in a dense command set, as in the reference, not settings. */
    const main = (
      <Button
        label={shownLabel}
        icon={wordIcons.of(cmd.icon)}
        iconOnly={!isStacked && cmd.kind !== 'labelled'}
        stacked={isStacked}
        align={cmd.kind === 'labelled' ? 'start' : undefined}
        size="xs"
        emphasis="quiet"
        pressed={cmd.toggle ? pressed : cmd.pressed}
        disabled={disabled}
        onClick={run}
      />
    );
    if (!cmd.menu) {
      return (
        <div key={key} data-dl="word-command" data-icon={cmd.icon} data-stacked={isStacked ? '' : undefined} data-pen={isPen ? '' : undefined} data-tool={isTool ? '' : undefined} data-pressed={pressed ? '' : undefined}>
          {main}
        </div>
      );
    }
    return (
      <div key={key} data-dl="word-split" data-icon={cmd.icon} data-stacked={isStacked || isPen ? '' : undefined} data-pen={isPen ? '' : undefined} data-tool={isTool ? '' : undefined} data-labelled={cmd.kind === 'labelled' ? '' : undefined}>
        {main}
        <span data-dl-part="split-menu">
          {cmd.items ? (
            <MenuButton
              label={`${cmd.label} options`}
              icon={wordIcons.name('qat-chevron')}
              iconOnly
              chevron={false}
              size="xs"
              emphasis="quiet"
              disabled={cmd.disabled}
              open={openMenu === key}
              onOpenChange={(o) => setOpenMenu(o ? key : undefined)}
              items={cmd.items}
              onSelect={(v) => { setOpenMenu(undefined); runAction(v); }}
            />
          ) : (
            <Button label={`${cmd.label} options`} icon={wordIcons.name('qat-chevron')} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} onClick={() => notBuilt(`${cmd.label} options`)} />
          )}
        </span>
      </div>
    );
  };

  const group = (g: WordGroup): RibbonGroup => ({
    id: g.id,
    label: g.label,
    hideLabel: g.hideLabel,
    launcher: g.launcher,
    onLaunch: g.launcher ? () => notBuilt(g.launcher!) : undefined,
    commands: (
      <>
        {g.lead?.map((cmd, i) => command(cmd, `${g.id}-lead-${i}`))}
        {g.trailLead?.map((cmd, i) => command(cmd, `${g.id}-trail-${i}`))}
        {g.spinColumns && (
          <div data-dl="word-spin-columns">
            {g.spinColumns.map((col) => (
              <div key={col.heading} data-dl-part="spin-col">
                <span data-dl-part="spin-head">{col.heading}</span>
                {col.fields.map((f) => (
                  <div key={f.label} data-dl-part="spin-row" data-icon={f.icon}>
                    <span data-dl-part="spin-label">
                      <Icon name={wordIcons.of(f.icon)} size="sm" />
                      <span>{f.label}</span>
                    </span>
                    <div data-dl-part="spin-box">
                      <NumberField label={`${col.heading} ${f.label}`} hideLabel mode="form" size="xs" value={f.value} unit={f.unit} step={f.step ?? 1} steppers="stacked" onCommit={() => undefined} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {g.columns?.map((col, ci) => (
          <Fragment key={`col-${ci}`}>
            {ci > 0 && g.id === 'window' && <span data-dl="word-col-sep" aria-hidden="true" />}
            <div data-dl="word-rows" data-count={col.length}>
              {col.map((row, r) => <div key={r} data-dl-part="row">{row.map((cmd, i) => command(cmd, `${g.id}-${ci}-${r}-${i}`))}</div>)}
            </div>
          </Fragment>
        ))}
        {g.rows && (
          <div data-dl="word-rows" data-count={g.rows.length} data-compact={g.lead ? '' : undefined}>
            {g.rows.map((row, r) => <div key={r} data-dl-part="row">{row.map((cmd, i) => command(cmd, `${g.id}-${r}-${i}`))}</div>)}
          </div>
        )}
        {g.columns && g.endLead && <span data-dl="word-col-sep" aria-hidden="true" />}
        {g.endLead?.map((cmd, i) => command(cmd, `${g.id}-end-${i}`))}
      </>
    ),
  });

  const headings = view.document.filter((b) => b.style === 'heading-1' || b.style === 'heading-2');
  const bs = view.backstage;

  const templateThumb = (t: WordBackstageTemplate) => (
    <span data-dl-part="thumb-svg" data-variant={t.variant} aria-hidden="true">
      <Icon name={wordIcons.of(`bs-tpl-${t.variant}`)} />
    </span>
  );

  if (windowState === 'minimised' || windowState === 'closed') {
    return (
      <div {...data} ref={rootRef} data-dl="word-window-away" data-scheme={screen === 'dark' ? 'dark' : undefined}>
        <Text>{say(windowState === 'closed' ? c.closed : c.minimised, { name: view.documentName })}</Text>
        <Button label={windowState === 'closed' ? c.reopen : c.restore} emphasis="primary" size="s" onClick={() => setWindowState('normal')} />
      </div>
    );
  }

  return (
    <IconOverrides icons={wordPack.glyphs}>
      <div {...data} ref={rootRef} data-dl="word-window" data-window-state={windowState === 'maximised' ? 'maximised' : undefined} data-material="solid" data-backstage={backstageOpen ? '' : undefined} data-scheme={screen === 'dark' ? 'dark' : undefined}>
        <header data-dl-part="titlebar" data-density="compact">
          {backstageOpen && (
            <span data-dl-part="flourish" aria-hidden="true">
              <Icon name={wordIcons.name('backstage-flourish')} />
            </span>
          )}
          <div data-dl-part="quick">
            <span data-dl-part="app-mark">
              <Icon name={wordIcons.name('app-doc-mark')} label={c.appMark} size="sm" />
            </span>
            {!backstageOpen && (
              <>
                <div data-dl-part="autosave">
                  {/* binary-setting: AutoSave is an on/off setting, so it is a Switch, as in the reference. */}
                  <Switch label={c.autoSave} labelPosition="start" size="xs" stateText={{ on: c.on, off: c.off }} checked={autoSave} onChange={setAutoSave} />
                </div>
                <span data-dl-part="qat-save">
                  <Button label={c.save} icon="save" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={save} />
                </span>
                <span data-dl-part="qat-item">
                  <Button label={c.undo} icon="undo" iconOnly size="xs" emphasis="quiet" tone="inherit" disabled={!edited} onClick={() => exec('undo')} />
                </span>
                <span data-dl-part="qat-chevron">
                  <Button label={c.undoOptions} icon={wordIcons.name('qat-chevron')} iconOnly size="xs" emphasis="quiet" tone="inherit" disabled />
                </span>
                <span data-dl-part="qat-item">
                  <Button label={c.redo} icon="redo" iconOnly size="xs" emphasis="quiet" tone="inherit" disabled={!edited} onClick={() => exec('redo')} />
                </span>
                <span data-dl-part="qat-chevron">
                  <Button label={c.customize} icon={wordIcons.name('qat-customize')} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(c.customize)} />
                </span>
              </>
            )}
          </div>
          <div data-dl-part="doc-title">
            <span data-dl-part="doc-name">{view.documentName}</span>
            <span data-dl-part="save-state">{saveState}</span>
          </div>
          {!backstageOpen && (
            <div data-dl-part="search">
              {searchOpen ? (
                <span data-dl-part="field" onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) find(); }}>
                  <TextField label={c.search} hideLabel type="search" icon="search" size="xs" placeholder={c.search} value={query} onChange={setQuery} />
                </span>
              ) : (
                <div data-dl="word-search-box">
                  <span data-dl-part="trigger">
                    <Button label={c.search} icon="search" size="xs" emphasis="quiet" tone="inherit" align="start" onClick={() => setSearchOpen(true)} />
                  </span>
                  <span data-dl-part="mic">
                    <Button label={c.voiceSearch} icon="mic" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(c.voiceSearch)} />
                  </span>
                </div>
              )}
            </div>
          )}
          <div data-dl-part="window-actions">
            {backstageOpen ? (
              <span data-dl-part="bs-head-icon">
                <Button label={c.feedbackTitle} icon={wordIcons.name('feedback-person')} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setBsSection('feedback')} />
              </span>
            ) : (
              <div data-dl-part="upgrade">
                <Button label={c.upgradePlan} icon={wordIcons.name('diamond')} size="xs" onClick={() => notBuilt(c.upgradePlan)} />
                <span data-dl-part="upgrade-dot" aria-hidden="true" />
              </div>
            )}
            <span data-dl-part="avatar">
              <Avatar name={view.user} src={userAvatar?.src} size={24} />
            </span>
            {backstageOpen && (
              <span data-dl-part="bs-head-icon">
                <Button label={c.helpTitle} icon={wordIcons.name('bs-help-q')} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => { setBackstageOpen(false); setTab('help'); }} />
              </span>
            )}
            <div data-dl-part="caption-buttons">
              <WindowControls
                state={windowState}
                onChange={setWindowState}
                labels={{ minimise: c.minimise, maximise: c.maximise, restore: c.restoreDown, close: c.close }}
                icons={{ minimise: wordIcons.name('win-minimize'), maximise: wordIcons.name('win-maximize'), close: wordIcons.name('win-close') }}
              />
            </div>
          </div>
        </header>

        {backstageOpen && bs ? (
          <div data-dl="word-backstage">
            <nav data-dl-part="rail" data-density="compact" aria-label={c.backstageNav ?? c.backstageHome}>
              <div data-dl-part="back">
                <Button
                  label={bs.backLabel}
                  icon={wordIcons.name('bs-back')}
                  iconOnly
                  size="s"
                  emphasis="quiet"
                  onClick={() => {
                    setBackstageOpen(false);
                    setTab((prev) => (prev === 'file' ? 'home' : prev));
                  }}
                />
              </div>
              <div data-dl-part="nav-group">
                {bs.primaryNav.map((item) => (
                  <div key={item.id} data-dl-part="nav-item" data-active={item.active ? '' : undefined}>
                    {/* binary-setting: active Backstage section in the File navigation rail, matching 12-backstage-home.png. */}
                    <Button
                      label={item.label}
                      icon={wordIcons.of(item.icon)}
                      size="s"
                      emphasis="quiet"
                      align="start"
                      pressed={bsSection === item.id}
                      onClick={() => setBsSection(item.id)}
                    />
                  </div>
                ))}
              </div>
              <span data-dl-part="rail-sep" aria-hidden="true" />
              <div data-dl-part="nav-group">
                {bs.docNav.map((item) => (
                  <div key={item.id} data-dl-part="nav-item" data-indented={!item.icon ? '' : undefined}>
                    {/* binary-setting: the current File section in the navigation rail, as in the reference. */}
                    <Button label={item.label} icon={wordIcons.of(item.icon)} size="s" emphasis="quiet" align="start" pressed={bsSection === item.id} onClick={() => (item.id === 'close' ? setBackstageOpen(false) : setBsSection(item.id))} />
                  </div>
                ))}
              </div>
              <div data-dl-part="rail-foot">
                <span data-dl-part="rail-sep" aria-hidden="true" />
                <div data-dl-part="nav-group">
                  {bs.footerNav.map((item) => (
                    <div key={item.id} data-dl-part="nav-item">
                      {/* binary-setting: the current File section in the navigation rail, as in the reference. */}
                      <Button label={item.label} icon={wordIcons.of(item.icon)} size="s" emphasis="quiet" align="start" pressed={bsSection === item.id} onClick={() => setBsSection(item.id)} />
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            <main data-dl-part="main" aria-label={c.backstageHome}>
              <ScrollArea label={c.backstageHome} mode="always" bar="gutter">
                {bsSection !== 'home' && bs.sections?.[bsSection] ? (() => {
                  const sec = bs.sections[bsSection];
                  const item = [...bs.primaryNav, ...bs.docNav, ...bs.footerNav].find((i) => i.id === bsSection);
                  return (
                    <section data-dl="word-backstage-section">
                      <Heading level={1} size={2}>{item?.label.replace(/\n/g, ' ')}</Heading>
                      <Text>{sec.body}</Text>
                      {sec.action && (
                        <span data-dl-part="action">
                          <Button
                            label={sec.action}
                            emphasis="primary"
                            size="s"
                            onClick={() => {
                              if (sec.done) notify({ subject: 'word-backstage', tone: 'success', message: sec.done });
                              if (sec.back) setBackstageOpen(false);
                              else if (sec.home) setBsSection('home');
                            }}
                          />
                        </span>
                      )}
                    </section>
                  );
                })() : (
                <div data-dl="word-backstage-stage">
                  <section data-dl-part="hero">
                    <Heading level={1} size={2}>{bs.heroHeading}</Heading>
                    <div data-dl-part="hero-controls">
                      <div data-dl-part="prompt-box">
                        {bsPromptOpen ? (
                          <div data-dl-part="prompt-field">
                            <TextField label={bs.promptPlaceholder} hideLabel icon="plus" size="s" placeholder={bs.promptPlaceholder} value={bsPrompt} onChange={setBsPrompt} />
                          </div>
                        ) : (
                          <div data-dl="word-bs-prompt">
                            <span data-dl-part="lead">
                              <Button label={bs.promptPlaceholder} icon="plus" size="s" emphasis="quiet" tone="inherit" align="start" onClick={() => setBsPromptOpen(true)} />
                            </span>
                            <span data-dl-part="actions">
                              <Button label={c.draftVoice} icon="mic" iconOnly size="xs" emphasis="quiet" onClick={() => notBuilt(c.draftVoice)} />
                              <span data-dl-part="create-pill">
                                <Button label={bs.createLabel} size="xs" disabled />
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div data-dl-part="suggestions" data-density="compact">
                        {bs.suggestions.map((s) => (
                          <span key={s} data-dl-part="suggestion-chip">
                            <Button label={s} size="s" onClick={() => { setBsPrompt(s); setBsPromptOpen(true); }} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section data-dl-part="new-section">
                    <div data-dl-part="head">
                      <div data-dl-part="sec-head">
                        <span data-dl-part="sec-title">
                          <Icon name={'chevron-down'} size="sm" />
                          <Heading level={2} size={4}>{bs.newHeading}</Heading>
                        </span>
                        <span data-dl-part="more-link">
                          <Button label={bs.moreTemplates} size="xs" emphasis="quiet" tone="inherit" onClick={() => setBsSection('new')} />
                          <Icon name={wordIcons.name('bs-arrow-right')} size="sm" />
                        </span>
                      </div>
                      <p data-dl-part="cloud-note">
                        <span>{bs.cloudNotice} </span>
                        <span data-dl-part="cloud-link">{bs.cloudLink}</span>
                      </p>
                    </div>
                    <div data-dl-part="template-row">
                      {bs.templates.map((t) => (
                        <div key={t.id} data-dl="word-bs-template" data-dl-part="template-card">
                          <div data-dl-part="thumb-box">
                            <Button label={t.title} icon="file" iconOnly size="xs" emphasis="quiet" onClick={() => setBackstageOpen(false)} />
                            {templateThumb(t)}
                          </div>
                          <span data-dl-part="caption" aria-hidden="true">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section data-dl-part="rec-section">
                    <div data-dl-part="head">
                      <div data-dl-part="sec-head">
                        <span data-dl-part="sec-title">
                          <Icon name={'chevron-down'} size="sm" />
                          <Heading level={2} size={4}>{bs.recommendedHeading}</Heading>
                        </span>
                      </div>
                    </div>
                    <div data-dl-part="rec-grid">
                      {bs.recommended.map((rc) => (
                        <article key={rc.id} data-dl="word-rec-card" data-dl-part="rec-card" aria-label={rc.title}>
                          <div data-dl-part="card-top">
                            <div data-dl-part="card-activity">
                              <span data-dl-part="doc-badge">
                                <Icon name={wordIcons.name('app-doc-mark')} size="sm" />
                              </span>
                              <Icon name={wordIcons.of(rc.icon)} size="sm" />
                              <span data-dl-part="activity-words">
                                {rc.author && <strong data-dl-part="actor">{rc.author} </strong>}
                                <span>{rc.activity}</span>
                              </span>
                            </div>
                            <strong data-dl-part="card-title">{rc.title}</strong>
                            <span data-dl-part="card-date">{rc.date}</span>
                          </div>
                          <div data-dl-part="card-well" aria-hidden="true">
                            <span data-dl-part="mini-doc">
                              <Icon name={wordIcons.of(`bs-rec-${rc.preview}`)} />
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section data-dl-part="files-section">
                    <div data-dl-part="filter-bar" data-density="compact">
                      <div data-dl-part="pills">
                        {bs.tabs.map((ft) => (
                          <span key={ft.id} data-dl-part="pill">
                            {/* binary-setting: chooses Recent, Favorites or Shared with Me filter tab, matching 12-backstage-home.png. */}
                            <Button
                              label={ft.label}
                              size="s"
                              emphasis={fileFilter === ft.id ? 'primary' : 'default'}
                              pressed={fileFilter === ft.id}
                              onClick={() => setFileFilter(ft.id)}
                            />
                          </span>
                        ))}
                      </div>
                      <div data-dl-part="filter-end">
                        <div data-dl-part="file-search">
                          <TextField label={bs.searchPlaceholder} hideLabel type="search" icon="search" size="s" placeholder={bs.searchPlaceholder} value={fileQuery} onChange={setFileQuery} />
                        </div>
                        <span data-dl-part="filter-btn">
                          <Button label={bs.filterLabel} icon="filter-lines" iconOnly size="s" emphasis="quiet" onClick={() => notBuilt(bs.filterLabel)} />
                        </span>
                      </div>
                    </div>
                    <div data-dl-part="table-card">
                      <DataTable
                        label={bs.tabs.find((t) => t.id === fileFilter)?.label ?? 'Recent'}
                        columns={[
                          { key: 'name', header: bs.columns.name },
                          { key: 'modified', header: bs.columns.modified },
                          { key: 'owner', header: bs.columns.owner },
                        ]}
                        rows={bs.files
                          .filter((f) => (fileFilter === 'favorites' ? f.favorite : fileFilter === 'shared' ? f.shared : true))
                          .filter((f) => !fileQuery || f.name.toLowerCase().includes(fileQuery.toLowerCase()))
                          .map((f) => ({
                            id: f.id,
                            cells: {
                              name: (
                                <span data-dl="word-file-cell">
                                  <span data-dl-part="doc-badge">
                                    <Icon name={wordIcons.name('app-doc-mark')} size="sm" />
                                  </span>
                                  <span data-dl-part="file-meta">
                                    <span data-dl-part="file-title">{f.name}</span>
                                    <span data-dl-part="file-loc">{f.location}</span>
                                  </span>
                                </span>
                              ),
                              modified: <span data-dl="word-file-mod">{f.modified}</span>,
                              owner: <span data-dl="word-file-owner">{f.owner}</span>,
                            },
                          }))}
                      />
                    </div>
                  </section>
                </div>
                )}
              </ScrollArea>
            </main>
          </div>
        ) : (
          <>
        {!focusMode && (
        <div data-dl-part="ribbon" data-density="compact">
          <Ribbon
            label={c.ribbon}
            selected={tab}
            endPlacement="corner"
            onChange={(next) => { if (next === 'file') { setBsSection('home'); setBackstageOpen(true); } else setTab(next); }}
            extra={
              <div data-dl="word-doc-actions">
                {/* binary-setting: Comments shows or hides its pane, a toolbar toggle beside Editing and Share, as in the reference. */}
                <Button label={c.comments} icon="comment" size="xs" pressed={pane === 'comments'} onClick={() => setPane(pane === 'comments' ? undefined : 'comments')} />
                <MenuButton label={c.editing} icon="edit" size="xs" items={[{ value: 'editing', label: c.editing }]} onSelect={() => notify({ subject: 'word-mode', message: c.editingMode })} />
                <MenuButton label={c.share} icon="share" size="xs" emphasis="primary" items={[{ value: 'share', label: c.share }]} onSelect={() => notify({ subject: 'word-share', tone: 'success', message: c.linkCopied })} />
                <span data-dl-part="people">
                  <Button label={c.catchUp} icon="people" iconOnly size="xs" emphasis="quiet" onClick={() => setPane(pane === 'comments' ? undefined : 'comments')} />
                </span>
              </div>
            }
            end={<span data-dl="word-collapse-btn"><Button label={ribbonCollapsed ? c.pinRibbon : c.collapse} icon={ribbonCollapsed ? 'pin' : wordIcons.name('qat-chevron')} iconOnly size="xs" emphasis="quiet" onClick={() => setRibbonCollapsed((v) => !v)} /></span>}
            collapsed={ribbonCollapsed}
            aside={
              <div data-dl="word-copilot-card" data-open={copilotOpen ? '' : undefined}>
                <Button label={c.copilot} icon={wordIcons.name('assistant-ribbon')} stacked size="xs" emphasis="quiet" onClick={() => setCopilotOpen((o) => !o)} />
              </div>
            }
            tabs={view.tabs.map((t) => ({ id: t.id, label: t.label, groups: (t.id === 'home' ? view.home : t.groups ?? []).map(group) }))}
          />
          {tab === 'design' && view.styleSets && view.styleSets.length > 0 && (() => {
            const sets = view.styleSets;
            const first = sets[0];
            return (
              <span data-dl-part="gallery-host">
                <Popover
                  trigger={{ label: c.moreStyleSets, icon: wordIcons.name('qat-chevron'), iconOnly: true, size: 'xs', emphasis: 'quiet' }}
                  anchorRef={styleStripRef}
                  side="over"
                  open={galleryOpen}
                  onOpenChange={setGalleryOpen}
                >
                  <div data-dl="word-style-gallery">
                    <div data-dl-part="section">
                      <span data-dl-part="section-head">{c.thisDocument}</span>
                      <div data-dl-part="grid">
                        {styleTile(first, activeStyle === first.id, () => { setActiveStyle(first.id); setGalleryOpen(false); }, true)}
                      </div>
                    </div>
                    <div data-dl-part="section" data-grow="">
                      <span data-dl-part="section-head">{c.builtIn}</span>
                      <div data-dl-part="grid">
                        {sets.slice(1).map((s) => styleTile(s, activeStyle === s.id, () => { setActiveStyle(s.id); setGalleryOpen(false); }, true))}
                      </div>
                    </div>
                    <div data-dl-part="menu-foot">
                      <Button label={c.resetStyleSet} size="xs" emphasis="quiet" align="start" onClick={() => { setActiveStyle('current'); setGalleryOpen(false); }} />
                      <Button label={c.saveStyleSet} size="xs" emphasis="quiet" align="start" onClick={() => setGalleryOpen(false)} />
                      <span data-dl-part="grip" aria-hidden="true">••••</span>
                    </div>
                  </div>
                </Popover>
              </span>
            );
          })()}
        </div>
        )}

        <div data-dl-part="workspace">
          <div data-dl-part="editor-col">
            {rulerShown && (
              <div data-dl="word-ruler-h">
                <span data-dl-part="tab-stop" aria-hidden="true">
                  <Icon name={wordIcons.name('ruler-tab-stop')} />
                </span>
                <div data-dl-part="track-center">
                  {(() => {
                    const rW = copilotOpen ? 917 : 1326;
                    const pageW = copilotOpen ? 652 : 677;
                    const pageStart = Math.round((rW - 16 - pageW) / 2);
                    const pageEnd = pageStart + pageW;
                    const pStart = copilotOpen ? 197 : 394;
                    const pWidth = copilotOpen ? 497 : 516;
                    const pEnd = pStart + pWidth;
                    const ticks = Math.floor(rW / 8.1);
                    return (
                      /* inline-svg: horizontal metric ruler computes live cm ticks, numerals and indent markers from canvas and pane width (F5). */
                      <svg viewBox={`0 0 ${rW} 23`} width="100%" height="23" preserveAspectRatio="none" role="img" aria-label={c.horizontalRuler}>
                        <rect x="0" y="0" width={rW} height="23" fill="var(--t-word-window-ruler-bg)" />
                        <rect x={pageStart} y="5" width={pageW} height="12" fill="var(--t-word-window-border)" opacity="0.38" />
                        <rect x={pStart} y="5" width={pWidth} height="12" fill="var(--t-word-window-ruler-inner)" />
                        {Array.from({ length: ticks }, (_, i) => {
                          const x = Math.round((pStart - Math.floor(pStart / 8.1) * 8.1 + i * 8.1) * 10) / 10;
                          if (x <= pageStart + 4 || x >= pageEnd - 4) return null;
                          const cmIdx = Math.round((x - pStart) / 32.4);
                          const isCm = Math.abs(x - (pStart + cmIdx * 32.4)) < 1.2;
                          const isHalf = !isCm && Math.abs(((x - pStart) % 32.4 + 32.4) % 32.4 - 16.2) < 1.5;
                          if (isCm && cmIdx !== 0) {
                            const labelNum = cmIdx > 0 ? cmIdx : Math.abs(cmIdx);
                            return <text key={i} x={x} y="14" textAnchor="middle" fontSize="9" fill="currentColor">{labelNum}</text>;
                          }
                          const h = isHalf ? 4 : 2;
                          return <line key={i} x1={x} y1={11 - h / 2} x2={x} y2={11 + h / 2} stroke="currentColor" strokeWidth="0.9" opacity="0.7" />;
                        })}
                        <g transform={`translate(${pStart}, 0)`}>
                          <polygon points="-4,3 4,3 4,6 0,10 -4,6" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                          <polygon points="-4,18 0,14 4,18 4,20 -4,20" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                          <rect x="-4" y="20" width="8" height="2.5" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                        </g>
                        <g transform={`translate(${pEnd}, 0)`}>
                          <polygon points="-4,18 0,14 4,18 4,21 -4,21" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                        </g>
                      </svg>
                    );
                  })()}
                </div>
              </div>
            )}

            <div data-dl-part="body">
              {rulerShown && (
                <div data-dl="word-ruler-v">
                  {/* inline-svg: vertical metric ruler computes live cm ticks and rotated labels from page top margin (F5). */}
                  <svg viewBox="0 0 23 700" width="23" height="700" role="img" aria-label={c.verticalRuler}>
                    <rect x="0" y="0" width="23" height="700" fill="var(--t-word-window-ruler-bg)" />
                    <rect x="3" y={copilotOpen ? 82 : 136} width="15" height={copilotOpen ? 618 : 564} fill="var(--t-word-window-ruler-inner)" />
                    {V_CMS.map((n) => {
                      const y = (copilotOpen ? 88 : 142) + n * 32.4;
                      return (
                        <g key={n}>
                          <line x1="9" y1={y - 16.2} x2="13" y2={y - 16.2} stroke="currentColor" strokeWidth="0.9" opacity="0.65" />
                          <text x="11" y={y + 3} textAnchor="middle" fontSize="8.5" fill="currentColor" transform={`rotate(-90 11 ${y})`}>{n}</text>
                        </g>
                      );
                    })}
                    <line x1="5" y1={copilotOpen ? 88 : 142} x2="17" y2={copilotOpen ? 88 : 142} stroke="currentColor" strokeWidth="0.9" />
                  </svg>
                </div>
              )}

              {pane === 'navigation' && (
                <div data-dl-part="nav-pane" data-density="compact">
                  <Pane title={c.navigation} closeLabel={c.closePane} onClose={() => setPane(undefined)}>
                    <div data-dl="word-nav-content">
                      <TextField label={c.navigationSearch} hideLabel type="search" icon="search" size="xs" placeholder={c.navigationSearch} value={query} onChange={setQuery} />
                      <Tabs
                        label={c.navigation}
                        size="xs"
                        selected={navTab}
                        onChange={setNavTab}
                        items={[
                          { id: 'headings', label: c.headings, panel: (
                            <div data-dl="word-outline">
                              {headings.map((h, i) => (
                                <div key={i} data-dl-part="outline-item" data-level={h.style === 'heading-2' ? 2 : 1} data-current={i === currentHeading ? '' : undefined}>
                                  <Button label={h.text} size="xs" emphasis="quiet" align="start" onClick={() => { setCurrentHeading(i); editorRef.current?.querySelectorAll(':scope > :is(h2, h3)')[i]?.scrollIntoView({ block: 'start' }); }} />
                                </div>
                              ))}
                            </div>
                          ) },
                          { id: 'pages', label: c.pages, panel: null },
                          { id: 'results', label: c.results, panel: (
                            <div data-dl="word-outline">
                              <Text variant="caption" tone="muted">{query.trim() ? (matches.length === 1 ? c.resultOne : matches.length ? say(c.resultsCount, { count: String(matches.length) }) : c.noResults) : c.findHint}</Text>
                              {matches.map((m, i) => (
                                <div key={i} data-dl-part="outline-item">
                                  <Button label={m.textContent ?? ''} size="xs" emphasis="quiet" align="start" onClick={() => showMatch(m)} />
                                </div>
                              ))}
                            </div>
                          ) },
                        ]}
                      />
                    </div>
                  </Pane>
                </div>
              )}

              <main data-dl-part="canvas" aria-label={c.document}>
                <ScrollArea label={c.document} mode="always" bar="gutter">
                  <div data-dl="word-page-stage">
                    {!showSampleDoc && !copilotOpen && (
                      <div data-dl="word-draft-bar">
                        <span data-dl-part="lead">
                          {draftOpen ? (
                            <TextField label={c.draftPrompt} hideLabel size="xs" placeholder={c.draftPrompt} value={draft} onChange={setDraft} />
                          ) : (
                            <Button label={c.draftPrompt} icon="plus" size="xs" emphasis="quiet" tone="inherit" align="start" onClick={() => setDraftOpen(true)} />
                          )}
                        </span>
                        <span data-dl-part="actions">
                          <Button label={c.draftMore} icon="more" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setCopilotOpen(true)} />
                          <Button label={c.draftVoice} icon="mic" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(c.draftVoice)} />
                        </span>
                      </div>
                    )}
                    <article data-dl-part="page" data-empty={!showSampleDoc ? '' : undefined} data-narrow={copilotOpen ? '' : undefined}>
                      {docEmpty && !docFocused && (
                        <div data-dl-part="caret-row" aria-hidden="true">
                          <span data-dl-part="caret-block" />
                          {copilotOpen && <Icon name={wordIcons.name('comment-new')} size="sm" />}
                        </div>
                      )}
                      <div
                        ref={bindDoc}
                        data-dl="word-doc"
                        data-marks={marks ? '' : undefined}
                        data-painter={painter ? '' : undefined}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-label={view.documentName}
                        spellCheck={false}
                        onInput={changed}
                        onFocus={() => setDocFocused(true)}
                        onBlur={() => setDocFocused(false)}
                        onMouseUp={paint}
                        onKeyUp={paint}
                      />
                    </article>
                  </div>
                </ScrollArea>
              </main>

              {pane === 'comments' && (
                <div data-dl-part="comments-pane" data-density="compact">
                  <Pane title={c.comments} closeLabel={c.closePane} onClose={() => setPane(undefined)}>
                    <div data-dl="word-comment-list">
                      {view.comments.map((m, i) => (
                        <article key={i} data-dl-part="comment" data-current={i === 0 ? '' : undefined}>
                          <div data-dl-part="comment-head">
                            <Avatar name={m.author} size={32} />
                            <div data-dl-part="comment-who">
                              <Heading level={3} size="label">{m.author}</Heading>
                              <Text variant="caption" tone="muted">{m.time}</Text>
                            </div>
                          </div>
                          <Text variant="body-sm">{m.text}</Text>
                          <TextField label={c.reply} hideLabel size="xs" placeholder={c.reply} value="" onChange={() => undefined} />
                        </article>
                      ))}
                    </div>
                  </Pane>
                </div>
              )}
            </div>
          </div>

          {copilotOpen && view.copilotPane && (
            <aside data-dl="word-copilot-pane" data-density="compact" aria-label={c.copilot}>
              <div data-dl-part="head">
                <Button label={view.copilotPane.menuLabel} icon="menu" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(view.copilotPane!.menuLabel)} />
                <div data-dl-part="head-end">
                  <Button label={view.copilotPane.moreLabel} icon="more" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(view.copilotPane!.moreLabel)} />
                  <Button label={c.closePane} icon={wordIcons.name('win-close')} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setCopilotOpen(false)} />
                </div>
              </div>
              <div data-dl-part="content">
                <Heading level={2} size={4}>{view.copilotPane.heading}</Heading>
                <Text variant="body-sm">{view.copilotPane.body}</Text>
                <div data-dl-part="prompts">
                  {view.copilotPane.prompts.map((p, i) => (
                    <div key={i} data-dl-part="prompt-chip">
                      <Button label={`${p.prefix}${p.emphasis}`} size="xs" emphasis="quiet" tone="inherit" align="start" onClick={() => { setDraft(`${p.prefix}${p.emphasis}`); setDraftOpen(true); }} />
                      <span data-dl-part="chip-words" aria-hidden="true">
                        <span data-dl-part="prefix">{p.prefix}</span>
                        <strong data-dl-part="tail">{p.emphasis}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div data-dl-part="foot">
                <div data-dl-part="mode">
                  <Button label={view.copilotPane.allowEditing} size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(view.copilotPane!.allowEditing)} />
                  <Icon name={wordIcons.name('qat-chevron')} size="sm" />
                </div>
                <div data-dl="word-copilot-input">
                  <span data-dl-part="lead">
                    {draftOpen ? (
                      <TextField label={view.copilotPane.placeholder} hideLabel size="xs" placeholder={view.copilotPane.placeholder} value={draft} onChange={setDraft} />
                    ) : (
                      <Button label={view.copilotPane.placeholder} icon="plus" size="xs" emphasis="quiet" tone="inherit" align="start" onClick={() => setDraftOpen(true)} />
                    )}
                  </span>
                  <span data-dl-part="mic">
                    <Button label={c.draftVoice} icon="mic" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(c.draftVoice)} />
                  </span>
                </div>
              </div>
            </aside>
          )}
        </div>

        <footer data-dl-part="statusbar" data-density="compact" aria-label={c.statusBar}>
          <div data-dl-part="status-start">
            <span data-dl-part="item">{view.status.page}</span>
            <span data-dl-part="item">{view.status.words}</span>
            <span data-dl-part="icon-btn"><Button label={c.proofing} icon={wordIcons.name('proofing-ok')} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => (tab === 'review' ? notBuilt(c.proofing) : setTab('review'))} /></span>
            <span data-dl-part="item">{view.status.language}</span>
            <span data-dl-part="item">{view.status.predictions}</span>
            <span data-dl-part="icon-btn"><Button label={c.macros} icon={wordIcons.name('macro-record')} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => notBuilt(c.macros)} /></span>
            <span data-dl-part="text-btn"><Button label={view.status.accessibility} icon={wordIcons.name('accessibility-check')} size="xs" emphasis="quiet" tone="inherit" onClick={() => (tab === 'review' ? notBuilt(view.status.accessibility) : setTab('review'))} /></span>
          </div>
          <div data-dl-part="status-end">
            {/* binary-setting: Focus is a status-bar view toggle beside the view buttons, as in the reference. */}
            <span data-dl-part="text-btn"><Button label={c.focus} icon={wordIcons.name('focus-mode')} size="xs" emphasis="quiet" tone="inherit" pressed={focusMode} onClick={() => setFocusMode((f) => !f)} /></span>
            {/* binary-setting: the page view, one of three view buttons in the status bar (Read Mode, Print Layout, Web Layout), as in the reference. */}
            <span data-dl-part="view-btn"><Button label={c.readMode} icon={wordIcons.name('read-mode')} iconOnly size="xs" emphasis="quiet" tone="inherit" pressed={docView === 'read'} onClick={() => setDocView('read')} /></span>
            <span data-dl-part="view-btn">
              {/* binary-setting: the current page view, one of three view buttons in the status bar, as in the reference. */}
              <Button label={c.printLayout} icon={wordIcons.name('print-layout')} iconOnly size="xs" emphasis="quiet" tone="inherit" pressed={docView === 'print'} onClick={() => setDocView('print')} />
            </span>
            <span data-dl-part="view-btn"><Button label={c.webLayout} icon={wordIcons.name('web-layout')} iconOnly size="xs" emphasis="quiet" tone="inherit" pressed={docView === 'web'} onClick={() => setDocView('web')} /></span>
            <div data-dl-part="zoom">
              <Button label={c.zoomOut} icon="minus" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom((z) => Math.max(10, z - 10))} />
              <Slider label={c.zoom} hideLabel showValue={false} size="s" valueLabel="none" min={0} max={100} value={zoomPosition(zoom)} format={(p) => `${zoomAt(p)}%`} onChange={(v) => setZoom(zoomAt(v as number))} />
              <Button label={c.zoomIn} icon="plus" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom((z) => Math.min(500, z + 10))} />
            </div>
            <span data-dl-part="zoom-pct"><Button label={`${zoom}%`} size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom(100)} /></span>
          </div>
        </footer>
          </>
        )}
      </div>
    </IconOverrides>
  );
}

/** Fills `{name}` placeholders in a content string. */
function say(text: string, values: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}

/** Word's zoom slider is two scales joined at its centre: 10–100% on the first half, 100–500% on the second. */
function zoomAt(position: number) {
  return Math.round(position <= 50 ? 10 + (position / 50) * 90 : 100 + ((position - 50) / 50) * 400);
}

function zoomPosition(zoom: number) {
  return zoom <= 100 ? ((zoom - 10) / 90) * 50 : 50 + ((zoom - 100) / 400) * 50;
}

function paneFor(screen: string) {
  return screen === 'navigation' ? 'navigation' : screen === 'comments' ? 'comments' : undefined;
}

function tabFor(screen: string) {
  const tabs = new Set(['home', 'insert', 'draw', 'design', 'layout', 'references', 'mailings', 'review', 'view', 'help', 'pdf-tools']);
  if (screen === 'design-gallery') return 'design';
  return tabs.has(screen) ? screen : 'home';
}
