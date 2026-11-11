import { useEffect, useState } from 'react';
import { Avatar, Button, Heading, MenuButton, Pane, Ribbon, ScrollArea, Select, Slider, Switch, Tabs, Text, TextField, type DataAttributes, type IconName, type RibbonGroup } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { WordCommand, WordGroup, WordRecord } from '../../types';

export interface WindowProps extends DataAttributes {
  /** Validated shared content: the document, its comments and every label. */
  view: WordRecord;
  /** A directly openable review state: `document`, `navigation`, `comments` or `dark`. */
  screen?: string;
}

const tags = { title: 'h1', 'heading-1': 'h2', 'heading-2': 'h3', body: 'p' } as const;

/**
 * A desktop word processor's window: a title bar with quick actions, a command ribbon, the page on its canvas with
 * optional Navigation and Comments panes, and a status bar.
 * Not for a web page editor (EditorLayout) or a conversation (ChatLayout).
 * The ribbon, panes, fields, scrolling and focus stay in core; this part only arranges them.
 * @tier layout
 * @family word
 * @a11y One main landmark (the document), a named ribbon and status bar, and native core controls.
 */
export function Window({ view, screen = 'document', ...data }: WindowProps) {
  const c = view.copy;
  const [tab, setTab] = useState('home');
  const [pane, setPane] = useState<'navigation' | 'comments' | undefined>(paneFor(screen));
  const [autoSave, setAutoSave] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState('');
  useEffect(() => { void loadFace('noto-sans'); }, []);
  useEffect(() => { setPane(paneFor(screen)); }, [screen]);

  const command = (cmd: WordCommand, key: string) => {
    if (cmd.kind === 'field') {
      return (
        <div key={key} data-dl="word-field" data-width={cmd.width}>
          <Select label={cmd.label} hideLabel size="xs" value={cmd.value ?? ''} options={[{ value: cmd.value ?? '', label: cmd.value ?? '' }]} onChange={() => undefined} />
        </div>
      );
    }
    /* binary-setting: ribbon formatting commands (alignment, bold) are toolbar toggles in a dense command set, as in the reference, not settings. */
    const main = <Button label={cmd.label} icon={cmd.icon as IconName} iconOnly={cmd.kind !== 'stacked'} stacked={cmd.kind === 'stacked'} size="xs" emphasis="quiet" pressed={cmd.pressed} />;
    if (!cmd.menu) return <div key={key} data-dl="word-command">{main}</div>;
    return (
      <div key={key} data-dl="word-split" data-stacked={cmd.kind === 'stacked' ? '' : undefined}>
        {main}
        <Button label={`${cmd.label} options`} icon="chevron-down" iconOnly size="xs" emphasis="quiet" />
      </div>
    );
  };
  const group = (g: WordGroup): RibbonGroup => ({
    id: g.id,
    label: g.label,
    launcher: g.launcher,
    commands: (
      <>
        {g.lead?.map((cmd, i) => command(cmd, `lead-${i}`))}
        {g.rows && (
          <div data-dl="word-rows" data-count={g.rows.length}>
            {g.rows.map((row, r) => <div key={r} data-dl-part="row">{row.map((cmd, i) => command(cmd, `${r}-${i}`))}</div>)}
          </div>
        )}
      </>
    ),
  });

  const headings = view.document.filter((b) => b.style === 'heading-1' || b.style === 'heading-2');
  return (
    <div {...data} data-dl="word-window" data-scheme={screen === 'dark' ? 'dark' : undefined}>
      <header data-dl-part="titlebar">
        <div data-dl-part="quick">
          <span data-dl-part="app-mark" role="img" aria-label={c.appMark} />
          <Button label={c.undo} icon="undo" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.undoOptions} icon="chevron-down" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.redo} icon="redo" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.save} icon="save" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <div data-dl-part="autosave">
            {/* binary-setting: AutoSave is an on/off setting, so it is a Switch, as in the reference. */}
            <Switch label={c.autoSave} labelPosition="start" size="xs" checked={autoSave} onChange={setAutoSave} />
          </div>
          <Button label={c.customize} icon="chevron-down" iconOnly size="xs" emphasis="quiet" tone="inherit" />
        </div>
        <div data-dl-part="doc-title">
          <span data-dl-part="doc-name">{view.documentName}</span>
          <span data-dl-part="save-state">{view.saveState}</span>
        </div>
        <div data-dl-part="search">
          <TextField label={c.search} hideLabel type="search" icon="search" size="xs" placeholder={c.search} value={query} onChange={setQuery} />
        </div>
        <div data-dl-part="window-actions">
          <Avatar name={view.user} size={24} />
          <Button label={c.minimise} icon="minus" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.maximise} icon="rectangle" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.close} icon="close" iconOnly size="xs" emphasis="quiet" tone="inherit" />
        </div>
      </header>
      <div data-dl-part="ribbon">
        <Ribbon
          label={c.ribbon}
          selected={tab}
          onChange={setTab}
          extra={
            <div data-dl="word-doc-actions">
              {/* binary-setting: Comments shows or hides its pane, a toolbar toggle beside Editing and Share, as in the reference. */}
              <Button label={c.comments} icon="comment" size="s" pressed={pane === 'comments'} onClick={() => setPane(pane === 'comments' ? undefined : 'comments')} />
              <MenuButton label={c.editing} icon="edit" size="s" items={[{ value: 'editing', label: c.editing }]} onSelect={() => undefined} />
              <MenuButton label={c.share} icon="share" size="s" emphasis="primary" items={[{ value: 'share', label: c.share }]} onSelect={() => undefined} />
            </div>
          }
          end={<Button label={c.collapse} icon="chevron-down" iconOnly size="xs" emphasis="quiet" />}
          tabs={view.tabs.map((t) => ({ id: t.id, label: t.label, groups: t.id === 'home' ? view.home.map(group) : [] }))}
        />
      </div>
      <div data-dl-part="body">
        {pane === 'navigation' && (
          <div data-dl-part="nav-pane">
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
          <ScrollArea label={c.document}>
            <div data-dl="word-page-stage">
              <article data-dl-part="page">
                {view.document.map((b, i) => {
                  const Tag = tags[b.style];
                  return <Tag key={i} data-dl-part="block" data-style={b.style}>{b.text}</Tag>;
                })}
              </article>
            </div>
          </ScrollArea>
        </main>
        {pane === 'comments' && (
          <div data-dl-part="comments-pane">
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
      <footer data-dl-part="statusbar" aria-label={c.statusBar}>
        <div data-dl-part="status-start">
          <span>{view.status.page}</span>
          <span>{view.status.words}</span>
          <Button label={view.status.language} icon="book" size="xs" emphasis="quiet" tone="inherit" />
          <span>{view.status.predictions}</span>
          <Button label={view.status.accessibility} icon="person" size="xs" emphasis="quiet" tone="inherit" />
        </div>
        <div data-dl-part="status-end">
          <Button label={c.displaySettings} icon="settings" size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.focus} icon="frame" size="xs" emphasis="quiet" tone="inherit" />
          <Button label={c.readMode} icon="book" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          {/* binary-setting: the current page view, one of three view buttons in the status bar, as in the reference. */}
          <Button label={c.printLayout} icon="file" iconOnly size="xs" emphasis="quiet" tone="inherit" pressed />
          <Button label={c.webLayout} icon="globe" iconOnly size="xs" emphasis="quiet" tone="inherit" />
          <div data-dl-part="zoom">
            <Button label={c.zoomOut} icon="minus" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom((z) => Math.max(10, z - 10))} />
            <Slider label={c.zoom} hideLabel size="s" valueLabel="none" min={10} max={500} value={zoom} onChange={(v) => setZoom(v as number)} />
            <Button label={c.zoomIn} icon="plus" iconOnly size="xs" emphasis="quiet" tone="inherit" onClick={() => setZoom((z) => Math.min(500, z + 10))} />
          </div>
          <Button label={`${zoom}%`} size="xs" emphasis="quiet" tone="inherit" />
        </div>
      </footer>
    </div>
  );
}

function paneFor(screen: string) {
  return screen === 'navigation' ? 'navigation' : screen === 'comments' ? 'comments' : undefined;
}
