import { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Heading, Icon, IconOverrides, MenuButton, Pane, Ribbon, ScrollArea, Select, Slider, Switch, Tabs, Text, TextField, type DataAttributes, type IconName, type RibbonGroup } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import wordPack from '../../icons/pack.json';
import type { WordCommand, WordGroup, WordRecord } from '../../types';

export interface WindowProps extends DataAttributes {
  /** Validated shared content: the document, its comments and every label. */
  view: WordRecord;
  /** A directly openable review state: `home`, `document`, `navigation`, `comments` or `dark`. */
  screen?: string;
  /** Resolves an entry in the template's `assets.json`. */
  picture?: (id: string) => { src: string; alt: string };
}

const tags = { title: 'h1', 'heading-1': 'h2', 'heading-2': 'h3', body: 'p' } as const;
const H_CMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const V_CMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

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
  const [tab, setTab] = useState(tabFor(screen));
  const [pane, setPane] = useState<'navigation' | 'comments' | undefined>(paneFor(screen));
  const [copilotOpen, setCopilotOpen] = useState(screen === 'dark');
  const [autoSave, setAutoSave] = useState(false);
  const [zoom, setZoom] = useState(90);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { void loadFace('noto-sans'); }, []);
  useEffect(() => {
    setPane(paneFor(screen));
    setTab(tabFor(screen));
    setCopilotOpen(screen === 'dark');
  }, [screen]);
  useEffect(() => {
    const tpl = rootRef.current?.closest('[data-template="word"]');
    if (!tpl) return;
    if (screen === 'dark') {
      tpl.setAttribute('data-scheme', 'dark');
      return () => { tpl.removeAttribute('data-scheme'); };
    }
    tpl.removeAttribute('data-scheme');
  }, [screen]);

  const showSampleDoc = screen === 'navigation' || screen === 'comments';

  const command = (cmd: WordCommand, key: string) => {
    if (cmd.kind === 'separator') return <span key={key} data-dl-part="separator" aria-hidden="true" />;
    if (cmd.kind === 'field') {
      return (
        <div key={key} data-dl="word-field" data-width={cmd.width}>
          <Select label={cmd.label} hideLabel size="xs" value={cmd.value ?? ''} options={[{ value: cmd.value ?? '', label: cmd.value ?? '' }]} onChange={() => undefined} />
        </div>
      );
    }
    const wide = cmd.lines ? (cmd.lines[0].length > 10 || cmd.lines[1]?.length > 12 ? 'lg' : 'md') : undefined;
    /* binary-setting: ribbon formatting commands (alignment, bold) are toolbar toggles in a dense command set, as in the reference, not settings. */
    const main = (
      <Button
        label={cmd.label}
        icon={cmd.icon as IconName}
        iconOnly={cmd.kind !== 'stacked' && cmd.kind !== 'labelled'}
        stacked={cmd.kind === 'stacked'}
        align={cmd.kind === 'labelled' ? 'start' : undefined}
        size="xs"
        emphasis="quiet"
        pressed={cmd.pressed}
        disabled={cmd.disabled}
      />
    );
    if (!cmd.menu) {
      return (
        <div key={key} data-dl="word-command" data-icon={cmd.icon} data-stacked={cmd.kind === 'stacked' ? '' : undefined} data-wide={wide}>
          {main}
        </div>
      );
    }
    return (
      <div key={key} data-dl="word-split" data-icon={cmd.icon} data-stacked={cmd.kind === 'stacked' ? '' : undefined} data-wide={wide}>
        {main}
        <span data-dl-part="split-menu">
          <Button label={`${cmd.label} options`} icon={'qat-chevron' as IconName} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
        </span>
      </div>
    );
  };

  const group = (g: WordGroup): RibbonGroup => ({
    id: g.id,
    label: g.label,
    hideLabel: g.hideLabel,
    launcher: g.launcher,
    commands: (
      <>
        {g.lead?.map((cmd, i) => command(cmd, `lead-${i}`))}
        {g.rows && (
          <div data-dl="word-rows" data-count={g.rows.length} data-compact={g.lead ? '' : undefined}>
            {g.rows.map((row, r) => <div key={r} data-dl-part="row">{row.map((cmd, i) => command(cmd, `${r}-${i}`))}</div>)}
          </div>
        )}
      </>
    ),
  });

  const headings = view.document.filter((b) => b.style === 'heading-1' || b.style === 'heading-2');
  return (
    <IconOverrides icons={wordPack.glyphs}>
      <div {...data} ref={rootRef} data-dl="word-window" data-scheme={screen === 'dark' ? 'dark' : undefined}>
        <svg data-dl-part="backdrop" viewBox="0 0 100 922" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0" y="0" width="100" height="174" fill="var(--color-map-nav-shell)" />
          <rect x="0" y="174" width="100" height="748" fill="var(--color-map-nav)" />
        </svg>
        <svg data-dl-part="frame-ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <header data-dl-part="titlebar" data-density="compact">
          <div data-dl-part="quick">
            <span data-dl-part="app-mark">
              <Icon name={'app-doc-mark' as IconName} label={c.appMark} size="sm" />
            </span>
            <div data-dl-part="autosave">
              {/* binary-setting: AutoSave is an on/off setting, so it is a Switch, as in the reference. */}
              <Switch label={c.autoSave} labelPosition="start" size="xs" tone="inherit" stateText={{ on: c.on, off: c.off }} checked={autoSave} onChange={setAutoSave} />
            </div>
            <span data-dl-part="qat-save">
              <Button label={c.save} icon="save" iconOnly size="xs" emphasis="quiet" tone="inherit" />
            </span>
            <span data-dl-part="qat-item">
              <Button label={c.undo} icon="undo" iconOnly size="xs" emphasis="quiet" tone="inherit" disabled />
            </span>
            <span data-dl-part="qat-chevron">
              <Button label={c.undoOptions} icon={'qat-chevron' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" disabled />
            </span>
            <span data-dl-part="qat-item">
              <Button label={c.redo} icon="redo" iconOnly size="xs" emphasis="quiet" tone="inherit" disabled />
            </span>
            <span data-dl-part="qat-chevron">
              <Button label={c.customize} icon={'qat-customize' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" />
            </span>
          </div>
          <div data-dl-part="doc-title">
            <span data-dl-part="doc-name">{view.documentName}</span>
            <span data-dl-part="save-state">{view.saveState}</span>
          </div>
          <div data-dl-part="search">
            {searchOpen ? (
              <TextField label={c.search} hideLabel type="search" icon="search" size="xs" placeholder={c.search} value={query} onChange={setQuery} />
            ) : (
              <div data-dl="word-search-box">
                <span data-dl-part="trigger">
                  <Button label={c.search} icon="search" size="xs" emphasis="quiet" tone="inherit" align="start" onClick={() => setSearchOpen(true)} />
                </span>
                <span data-dl-part="mic">
                  <Button label={c.voiceSearch} icon="mic" iconOnly size="xs" emphasis="quiet" tone="inherit" />
                </span>
              </div>
            )}
          </div>
          <div data-dl-part="window-actions">
            <div data-dl-part="upgrade">
              <Button label={c.upgradePlan} icon={'diamond' as IconName} size="xs" />
              <span data-dl-part="upgrade-dot" aria-hidden="true" />
            </div>
            <span data-dl-part="avatar">
              <Avatar name={view.user} src={userAvatar?.src} size={24} />
            </span>
            <div data-dl-part="caption-buttons">
              <span data-dl-part="win-btn"><Button label={c.minimise} icon={'win-minimize' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
              <span data-dl-part="win-btn"><Button label={c.maximise} icon={'win-maximize' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
              <span data-dl-part="win-btn"><Button label={c.close} icon={'win-close' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
            </div>
          </div>
        </header>

        <div data-dl-part="ribbon" data-density="compact">
          <Ribbon
            label={c.ribbon}
            selected={tab}
            onChange={(next) => { if (next !== 'file') setTab(next); }}
            extra={
              <div data-dl="word-doc-actions">
                {/* binary-setting: Comments shows or hides its pane, a toolbar toggle beside Editing and Share, as in the reference. */}
                <Button label={c.comments} icon="comment" size="s" pressed={pane === 'comments'} onClick={() => setPane(pane === 'comments' ? undefined : 'comments')} />
                <MenuButton label={c.editing} icon="edit" size="s" items={[{ value: 'editing', label: c.editing }]} onSelect={() => undefined} />
                <MenuButton label={c.share} icon="share" size="s" emphasis="primary" items={[{ value: 'share', label: c.share }]} onSelect={() => undefined} />
                <span data-dl-part="people">
                  <Button label={c.catchUp} icon="people" iconOnly size="s" emphasis="quiet" />
                </span>
              </div>
            }
            end={<Button label={c.collapse} icon={'qat-chevron' as IconName} iconOnly size="xs" emphasis="quiet" />}
            aside={
              <div data-dl="word-copilot-card" data-open={copilotOpen ? '' : undefined}>
                {/* binary-setting: shows or hides the assistant side pane from the ribbon band, as in the reference. */}
                <Button label={c.copilot} icon={'assistant-ribbon' as IconName} stacked size="xs" emphasis="quiet" pressed={copilotOpen} onClick={() => setCopilotOpen((o) => !o)} />
              </div>
            }
            tabs={view.tabs.map((t) => ({ id: t.id, label: t.label, groups: (t.id === 'home' ? view.home : t.groups ?? []).map(group) }))}
          />
        </div>

        <div data-dl-part="workspace">
          <div data-dl-part="editor-col">
            <div data-dl="word-ruler-h">
              <span data-dl-part="tab-stop">
                <svg viewBox="0 0 23 23" width="23" height="23" aria-hidden="true">
                  <path d="M9 7v6.5h6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </span>
              <div data-dl-part="track-center">
                <svg viewBox="0 0 678 23" width="678" height="23" role="img" aria-label={c.horizontalRuler}>
                  <rect x="82" y="5" width="514" height="12" fill="var(--t-word-window-ruler-inner)" />
                  {Array.from({ length: 84 }, (_, i) => {
                    const x = Math.round(i * 8.1 * 10) / 10;
                    if (x <= 2 || x >= 676) return null;
                    const cmIdx = Math.round((x - 82) / 32.4);
                    const isCm = Math.abs(x - (82 + cmIdx * 32.4)) < 1.2;
                    const isHalf = !isCm && Math.abs(((x - 82) % 32.4 + 32.4) % 32.4 - 16.2) < 1.5;
                    if (isCm && cmIdx >= 1 && cmIdx <= 15) {
                      return <text key={i} x={x} y="14" textAnchor="middle" fontSize="9" fill="currentColor">{cmIdx}</text>;
                    }
                    if (isCm && (cmIdx === -1 || cmIdx === -2)) {
                      return <text key={i} x={x} y="14" textAnchor="middle" fontSize="9" fill="currentColor">{Math.abs(cmIdx)}</text>;
                    }
                    const h = isHalf ? 4 : 2;
                    return <line key={i} x1={x} y1={11 - h / 2} x2={x} y2={11 + h / 2} stroke="currentColor" strokeWidth="0.9" opacity="0.7" />;
                  })}
                  <g transform="translate(82, 0)">
                    <polygon points="-4,3 4,3 4,6 0,10 -4,6" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                    <polygon points="-4,18 0,14 4,18 4,20 -4,20" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                    <rect x="-4" y="20" width="8" height="2.5" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                  </g>
                  <g transform="translate(596, 0)">
                    <polygon points="-4,18 0,14 4,18 4,21 -4,21" fill="var(--t-word-window-ruler-inner)" stroke="currentColor" strokeWidth="0.9" />
                  </g>
                </svg>
              </div>
            </div>

            <div data-dl-part="body">
              <div data-dl="word-ruler-v">
                <svg viewBox="0 0 23 700" width="23" height="700" role="img" aria-label={c.verticalRuler}>
                  <rect x="5" y={copilotOpen ? 88 : 142} width="12" height={copilotOpen ? 612 : 558} fill="var(--t-word-window-ruler-inner)" />
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

              {pane === 'navigation' && (
                <div data-dl-part="nav-pane" data-density="compact">
                  <Pane title={c.navigation} closeLabel={c.closePane} onClose={() => setPane(undefined)}>
                    <div data-dl="word-nav-content">
                      <TextField label={c.navigationSearch} hideLabel type="search" icon="search" size="xs" placeholder={c.navigationSearch} value={query} onChange={setQuery} />
                      <Tabs
                        label={c.navigation}
                        size="xs"
                        items={[
                          { id: 'headings', label: c.headings, panel: (
                            <div data-dl="word-outline">
                              {headings.map((h, i) => (
                                <div key={i} data-dl-part="outline-item" data-level={h.style === 'heading-2' ? 2 : 1} data-current={i === 0 ? '' : undefined}>
                                  <Button label={h.text} size="xs" emphasis="quiet" align="start" />
                                </div>
                              ))}
                            </div>
                          ) },
                          { id: 'pages', label: c.pages, panel: null },
                          { id: 'results', label: c.results, panel: null },
                        ]}
                      />
                    </div>
                  </Pane>
                </div>
              )}

              <main data-dl-part="canvas" aria-label={c.document}>
                <ScrollArea label={c.document} mode="always">
                  <div data-dl="word-page-stage">
                    {!showSampleDoc && !copilotOpen && (
                      <div data-dl="word-draft-bar">
                        <span data-dl-part="lead">
                          <Button label={c.draftPrompt} icon="plus" size="xs" emphasis="quiet" tone="inherit" align="start" />
                        </span>
                        <span data-dl-part="actions">
                          <Button label={c.draftMore} icon="more" iconOnly size="xs" emphasis="quiet" tone="inherit" />
                          <Button label={c.draftVoice} icon="mic" iconOnly size="xs" emphasis="quiet" tone="inherit" />
                        </span>
                      </div>
                    )}
                    <article data-dl-part="page" data-empty={!showSampleDoc ? '' : undefined} data-narrow={copilotOpen ? '' : undefined}>
                      {!showSampleDoc && copilotOpen && (
                        <div data-dl-part="caret-row" aria-hidden="true">
                          <span data-dl-part="caret-block" />
                          <Icon name={'comment-new' as IconName} size="sm" />
                        </div>
                      )}
                      {showSampleDoc && view.document.map((b, i) => {
                        const Tag = tags[b.style];
                        return <Tag key={i} data-dl-part="block" data-style={b.style}>{b.text}</Tag>;
                      })}
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
                <Button label={view.copilotPane.menuLabel} icon="menu" iconOnly size="xs" emphasis="quiet" tone="inherit" />
                <div data-dl-part="head-end">
                  <Button label={view.copilotPane.moreLabel} icon="more" iconOnly size="xs" emphasis="quiet" tone="inherit" />
                  <Button label={c.closePane} icon={'win-close' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setCopilotOpen(false)} />
                </div>
              </div>
              <div data-dl-part="content">
                <Heading level={2} size="4">{view.copilotPane.heading}</Heading>
                <Text variant="body-sm">{view.copilotPane.body}</Text>
                <div data-dl-part="prompts">
                  {view.copilotPane.prompts.map((p, i) => (
                    <div key={i} data-dl-part="prompt-chip">
                      <Button label={`${p.prefix}${p.emphasis}`} size="xs" emphasis="quiet" tone="inherit" align="start" />
                    </div>
                  ))}
                </div>
              </div>
              <div data-dl-part="foot">
                <div data-dl-part="mode">
                  <MenuButton label={view.copilotPane.allowEditing} size="xs" tone="inherit" items={[{ value: 'edit', label: view.copilotPane.allowEditing }]} onSelect={() => undefined} />
                </div>
                <div data-dl="word-copilot-input">
                  <span data-dl-part="lead">
                    <Button label={view.copilotPane.placeholder} icon="plus" size="xs" emphasis="quiet" tone="inherit" align="start" />
                  </span>
                  <span data-dl-part="mic">
                    <Button label={c.draftVoice} icon="mic" iconOnly size="xs" emphasis="quiet" tone="inherit" />
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
            <span data-dl-part="icon-btn"><Button label={c.proofing} icon={'proofing-ok' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
            <span data-dl-part="item">{view.status.language}</span>
            <span data-dl-part="item">{view.status.predictions}</span>
            <span data-dl-part="icon-btn"><Button label={c.macros} icon={'macro-record' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
            <span data-dl-part="text-btn"><Button label={view.status.accessibility} icon={'accessibility-check' as IconName} size="xs" emphasis="quiet" tone="inherit" /></span>
          </div>
          <div data-dl-part="status-end">
            <span data-dl-part="text-btn"><Button label={c.focus} icon={'focus-mode' as IconName} size="xs" emphasis="quiet" tone="inherit" /></span>
            <span data-dl-part="view-btn"><Button label={c.readMode} icon={'read-mode' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
            <span data-dl-part="view-btn">
              {/* binary-setting: the current page view, one of three view buttons in the status bar, as in the reference. */}
              <Button label={c.printLayout} icon={'print-layout' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" pressed />
            </span>
            <span data-dl-part="view-btn"><Button label={c.webLayout} icon={'web-layout' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
            <div data-dl-part="zoom">
              <Button label={c.zoomOut} icon="minus" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom((z) => Math.max(10, z - 10))} />
              <Slider label={c.zoom} hideLabel showValue={false} size="s" valueLabel="none" min={0} max={100} value={zoomPosition(zoom)} format={(p) => `${zoomAt(p)}%`} onChange={(v) => setZoom(zoomAt(v as number))} />
              <Button label={c.zoomIn} icon="plus" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom((z) => Math.min(500, z + 10))} />
            </div>
            <span data-dl-part="zoom-pct"><Button label={`${zoom}%`} size="xs" emphasis="quiet" tone="inherit" /></span>
          </div>
        </footer>
      </div>
    </IconOverrides>
  );
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
  const tabs = new Set(['home', 'insert', 'draw', 'design', 'layout', 'references', 'mailings', 'review', 'view', 'help', 'acrobat']);
  if (screen === 'design-gallery') return 'design';
  return tabs.has(screen) ? screen : 'home';
}
