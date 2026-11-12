import { Fragment, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Checkbox, DataTable, Heading, Icon, IconOverrides, MenuButton, NumberField, Pane, Popover, Ribbon, ScrollArea, Select, Slider, Switch, Tabs, Text, TextField, type DataAttributes, type IconName, type RibbonGroup } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import wordPack from '../../icons/pack.json';
import type { WordBackstageTemplate, WordCommand, WordGroup, WordRecord, WordStyleSet } from '../../types';

export interface WindowProps extends DataAttributes {
  /** Validated shared content: the document, its comments and every label. */
  view: WordRecord;
  /** A directly openable review state: `home`, `document`, `backstage`, `insert`, `draw`, `design`, `design-gallery`, `layout`, `references`, `mailings`, `review`, `view`, `help`, `navigation`, `comments` or `dark`. */
  screen?: string;
  /** Resolves an entry in the template's `assets.json`. */
  picture?: (id: string) => { src: string; alt: string };
}

const tags = { title: 'h1', 'heading-1': 'h2', 'heading-2': 'h3', body: 'p' } as const;
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
  useEffect(() => { void loadFace('noto-sans'); }, []);
  useEffect(() => {
    setPane(paneFor(screen));
    setTab(tabFor(screen));
    setBackstageOpen(screen === 'backstage');
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

  const styleTile = (s: WordStyleSet, active: boolean, onChoose: () => void, large = false) => (
    <div key={s.id} data-dl="word-style-tile" data-large={large ? '' : undefined} data-active={active ? '' : undefined}>
      {/* binary-setting: chooses one document style set in a visual thumbnail strip, as in the reference. */}
      <Button label={s.name} icon="file" iconOnly tooltip={false} size="xs" emphasis="quiet" pressed={active} onClick={onChoose} />
      <span data-dl-part="preview" aria-hidden="true">
        <Icon name={`style-set-${s.variant}` as IconName} />
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
            {cmd.icon && <Icon name={cmd.icon as IconName} size="sm" />}
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
          <Button label={c.firstRecord} icon={'step-first' as IconName} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
          <Button label={c.previousRecord} icon={'step-prev' as IconName} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
          <div data-dl-part="record-box">
            <TextField label={c.currentRecord} hideLabel size="xs" value="" onChange={() => undefined} disabled={cmd.disabled} />
          </div>
          <Button label={c.nextRecord} icon={'step-next' as IconName} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
          <Button label={c.lastRecord} icon={'step-last' as IconName} iconOnly size="xs" emphasis="quiet" disabled={cmd.disabled} />
        </div>
      );
    }
    const isPen = cmd.kind === 'pen';
    const isTool = cmd.kind === 'tool';
    const isStacked = cmd.kind === 'stacked';
    const shownLabel = isStacked && cmd.lines ? cmd.lines.join('\n') : cmd.label;
    /* binary-setting: ribbon formatting and drawing commands are toolbar toggles in a dense command set, as in the reference, not settings. */
    const main = (
      <Button
        label={shownLabel}
        icon={cmd.icon as IconName}
        iconOnly={!isStacked && cmd.kind !== 'labelled'}
        stacked={isStacked}
        align={cmd.kind === 'labelled' ? 'start' : undefined}
        size="xs"
        emphasis="quiet"
        pressed={cmd.pressed}
        disabled={cmd.disabled}
      />
    );
    if (!cmd.menu) {
      return (
        <div key={key} data-dl="word-command" data-icon={cmd.icon} data-stacked={isStacked ? '' : undefined} data-pen={isPen ? '' : undefined} data-tool={isTool ? '' : undefined} data-pressed={cmd.pressed ? '' : undefined}>
          {main}
        </div>
      );
    }
    return (
      <div key={key} data-dl="word-split" data-icon={cmd.icon} data-stacked={isStacked || isPen ? '' : undefined} data-pen={isPen ? '' : undefined} data-tool={isTool ? '' : undefined} data-labelled={cmd.kind === 'labelled' ? '' : undefined}>
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
        {g.trailLead?.map((cmd, i) => command(cmd, `trail-${i}`))}
        {g.spinColumns && (
          <div data-dl="word-spin-columns">
            {g.spinColumns.map((col) => (
              <div key={col.heading} data-dl-part="spin-col">
                <span data-dl-part="spin-head">{col.heading}</span>
                {col.fields.map((f) => (
                  <div key={f.label} data-dl-part="spin-row" data-icon={f.icon}>
                    <span data-dl-part="spin-label">
                      <Icon name={f.icon as IconName} size="sm" />
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
              {col.map((row, r) => <div key={r} data-dl-part="row">{row.map((cmd, i) => command(cmd, `${ci}-${r}-${i}`))}</div>)}
            </div>
          </Fragment>
        ))}
        {g.rows && (
          <div data-dl="word-rows" data-count={g.rows.length} data-compact={g.lead ? '' : undefined}>
            {g.rows.map((row, r) => <div key={r} data-dl-part="row">{row.map((cmd, i) => command(cmd, `${r}-${i}`))}</div>)}
          </div>
        )}
        {g.columns && g.endLead && <span data-dl="word-col-sep" aria-hidden="true" />}
        {g.endLead?.map((cmd, i) => command(cmd, `end-${i}`))}
      </>
    ),
  });

  const headings = view.document.filter((b) => b.style === 'heading-1' || b.style === 'heading-2');
  const bs = view.backstage;

  const templateThumb = (t: WordBackstageTemplate) => (
    <span data-dl-part="thumb-svg" data-variant={t.variant} aria-hidden="true">
      <Icon name={`bs-tpl-${t.variant}` as IconName} />
    </span>
  );

  return (
    <IconOverrides icons={wordPack.glyphs}>
      <div {...data} ref={rootRef} data-dl="word-window" data-material="solid" data-backstage={backstageOpen ? '' : undefined} data-scheme={screen === 'dark' ? 'dark' : undefined}>
        <header data-dl-part="titlebar" data-density="compact">
          {backstageOpen && (
            <span data-dl-part="flourish" aria-hidden="true">
              <Icon name={'backstage-flourish' as IconName} />
            </span>
          )}
          <div data-dl-part="quick">
            <span data-dl-part="app-mark">
              <Icon name={'app-doc-mark' as IconName} label={c.appMark} size="sm" />
            </span>
            {!backstageOpen && (
              <>
                <div data-dl-part="autosave">
                  {/* binary-setting: AutoSave is an on/off setting, so it is a Switch, as in the reference. */}
                  <Switch label={c.autoSave} labelPosition="start" size="xs" stateText={{ on: c.on, off: c.off }} checked={autoSave} onChange={setAutoSave} />
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
              </>
            )}
          </div>
          <div data-dl-part="doc-title">
            <span data-dl-part="doc-name">{view.documentName}</span>
            <span data-dl-part="save-state">{view.saveState}</span>
          </div>
          {!backstageOpen && (
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
          )}
          <div data-dl-part="window-actions">
            {backstageOpen ? (
              <span data-dl-part="bs-head-icon">
                <Button label={c.feedbackTitle} icon={'feedback-person' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" />
              </span>
            ) : (
              <div data-dl-part="upgrade">
                <Button label={c.upgradePlan} icon={'diamond' as IconName} size="xs" />
                <span data-dl-part="upgrade-dot" aria-hidden="true" />
              </div>
            )}
            <span data-dl-part="avatar">
              <Avatar name={view.user} src={userAvatar?.src} size={24} />
            </span>
            {backstageOpen && (
              <span data-dl-part="bs-head-icon">
                <Button label={c.helpTitle} icon={'bs-help-q' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" />
              </span>
            )}
            <div data-dl-part="caption-buttons">
              <span data-dl-part="win-btn"><Button label={c.minimise} icon={'win-minimize' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
              <span data-dl-part="win-btn"><Button label={c.maximise} icon={'win-maximize' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
              <span data-dl-part="win-btn"><Button label={c.close} icon={'win-close' as IconName} iconOnly size="xs" emphasis="quiet" tone="inherit" /></span>
            </div>
          </div>
        </header>

        {backstageOpen && bs ? (
          <div data-dl="word-backstage">
            <nav data-dl-part="rail" data-density="compact" aria-label={c.backstageNav ?? c.backstageHome}>
              <div data-dl-part="back">
                <Button
                  label={bs.backLabel}
                  icon={'bs-back' as IconName}
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
                      icon={item.icon as IconName}
                      size="s"
                      emphasis="quiet"
                      align="start"
                      pressed={item.active}
                      onClick={() => {
                        if (item.id !== 'home') setBackstageOpen(false);
                      }}
                    />
                  </div>
                ))}
              </div>
              <span data-dl-part="rail-sep" aria-hidden="true" />
              <div data-dl-part="nav-group">
                {bs.docNav.map((item) => (
                  <div key={item.id} data-dl-part="nav-item" data-indented={!item.icon ? '' : undefined}>
                    <Button label={item.label} icon={item.icon as IconName | undefined} size="s" emphasis="quiet" align="start" onClick={() => { if (item.id === 'close') setBackstageOpen(false); }} />
                  </div>
                ))}
              </div>
              <div data-dl-part="rail-foot">
                <span data-dl-part="rail-sep" aria-hidden="true" />
                <div data-dl-part="nav-group">
                  {bs.footerNav.map((item) => (
                    <div key={item.id} data-dl-part="nav-item">
                      <Button label={item.label} icon={item.icon as IconName} size="s" emphasis="quiet" align="start" />
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            <main data-dl-part="main" aria-label={c.backstageHome}>
              <ScrollArea label={c.backstageHome} mode="always" bar="gutter">
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
                              <Button label={c.draftVoice} icon="mic" iconOnly size="xs" emphasis="quiet" />
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
                          <Icon name={'chevron-down' as IconName} size="sm" />
                          <Heading level={2} size={4}>{bs.newHeading}</Heading>
                        </span>
                        <span data-dl-part="more-link">
                          <Button label={bs.moreTemplates} size="xs" emphasis="quiet" tone="inherit" />
                          <Icon name={'bs-arrow-right' as IconName} size="sm" />
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
                          <Icon name={'chevron-down' as IconName} size="sm" />
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
                                <Icon name={'app-doc-mark' as IconName} size="sm" />
                              </span>
                              <Icon name={rc.icon as IconName} size="sm" />
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
                              <Icon name={`bs-rec-${rc.preview}` as IconName} />
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
                          <Button label={bs.filterLabel} icon="filter-lines" iconOnly size="s" emphasis="quiet" />
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
                                    <Icon name={'app-doc-mark' as IconName} size="sm" />
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
              </ScrollArea>
            </main>
          </div>
        ) : (
          <>
        <div data-dl-part="ribbon" data-density="compact">
          <Ribbon
            label={c.ribbon}
            selected={tab}
            endPlacement="corner"
            onChange={(next) => { if (next === 'file') setBackstageOpen(true); else setTab(next); }}
            extra={
              <div data-dl="word-doc-actions">
                {/* binary-setting: Comments shows or hides its pane, a toolbar toggle beside Editing and Share, as in the reference. */}
                <Button label={c.comments} icon="comment" size="xs" pressed={pane === 'comments'} onClick={() => setPane(pane === 'comments' ? undefined : 'comments')} />
                <MenuButton label={c.editing} icon="edit" size="xs" items={[{ value: 'editing', label: c.editing }]} onSelect={() => undefined} />
                <MenuButton label={c.share} icon="share" size="xs" emphasis="primary" items={[{ value: 'share', label: c.share }]} onSelect={() => undefined} />
                <span data-dl-part="people">
                  <Button label={c.catchUp} icon="people" iconOnly size="xs" emphasis="quiet" />
                </span>
              </div>
            }
            end={<span data-dl="word-collapse-btn"><Button label={c.collapse} icon={'qat-chevron' as IconName} iconOnly size="xs" emphasis="quiet" /></span>}
            aside={
              <div data-dl="word-copilot-card" data-open={copilotOpen ? '' : undefined}>
                <Button label={c.copilot} icon={'assistant-ribbon' as IconName} stacked size="xs" emphasis="quiet" onClick={() => setCopilotOpen((o) => !o)} />
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
                  trigger={{ label: c.moreStyleSets, icon: 'qat-chevron' as IconName, iconOnly: true, size: 'xs', emphasis: 'quiet' }}
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

        <div data-dl-part="workspace">
          <div data-dl-part="editor-col">
            {showRuler && (
              <div data-dl="word-ruler-h">
                <span data-dl-part="tab-stop" aria-hidden="true">
                  <Icon name={'ruler-tab-stop' as IconName} />
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
              {showRuler && (
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
                <ScrollArea label={c.document} mode="always" bar="gutter">
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
                      {!showSampleDoc && (
                        <div data-dl-part="caret-row" aria-hidden="true">
                          <span data-dl-part="caret-block" />
                          {copilotOpen && <Icon name={'comment-new' as IconName} size="sm" />}
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
                <Heading level={2} size={4}>{view.copilotPane.heading}</Heading>
                <Text variant="body-sm">{view.copilotPane.body}</Text>
                <div data-dl-part="prompts">
                  {view.copilotPane.prompts.map((p, i) => (
                    <div key={i} data-dl-part="prompt-chip">
                      <Button label={`${p.prefix}${p.emphasis}`} size="xs" emphasis="quiet" tone="inherit" align="start" />
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
                  <Button label={view.copilotPane.allowEditing} size="xs" emphasis="quiet" tone="inherit" />
                  <Icon name={'qat-chevron' as IconName} size="sm" />
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
          </>
        )}
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
  const tabs = new Set(['home', 'insert', 'draw', 'design', 'layout', 'references', 'mailings', 'review', 'view', 'help', 'pdf-tools']);
  if (screen === 'design-gallery') return 'design';
  return tabs.has(screen) ? screen : 'home';
}
