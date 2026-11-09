import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, CodeBlock, DataTable, familyPathOf, Grid, LibraryLayout, Link, List, Navigation, Notifications, PageHeader, PageLayout, ScreenPreview, Section, SegmentedControl, Stack, suspendMotion, Text, TitleBar, type SegmentedControlOption } from '@design-library/core/react';
import { navGroups, pageById, sectionById, type Block, type Page, type PageBlock } from './data/pages';
import { Borders, ColourRoles, ColourSets, ComponentTokens, ContrastPairs, Durations, Easings, Elevation, ElevationLadder, Layers, ChangePoints, Materials, MotionRoles, Palette, Radii, SeparationCues, Sizes, SpaceRoles, SpaceScale, StackedBar, StatusRoles, TokenRows } from './inspectors/inspectors';
import { TypeChooser, TypeFaceList, TypePlay, TypeRamp } from './inspectors/type';
import { IconChooser, IconCoverage, IconSetList } from './inspectors/icons';
import { Note, Overview, StoryExamples } from './inspectors/specimens';
import { BrandEditor } from './inspectors/brand';
import { AppearanceContext, SpaceShapeContext } from './data/contexts';
import { ShapeOptions, SpaceOptions } from './inspectors/options';
import { shapeOptions, spaceOptions, themeSpaceShape } from './data/tokens';
import { setShape, setSpace, useSpaceShape } from './data/space-shape';
import './data/presets';
import { PresetSettings } from './inspectors/presets';
import { Principles } from './inspectors/principles';
import { Access, BuiltFrom, Props } from './inspectors/contract';
import { useRevisions } from './revisions/useRevisions';
import { REVISION_PANE, RevisionPane } from './revisions/RevisionPane';
import { Picker } from './revisions/Picker';
import { capture } from './revisions/capture';
import { resolveTarget } from './revisions/resolve';
import { PAGES, componentSources, rev } from './revisions/target';
import { layoutScreens } from './views/templates';
import { layoutOf } from './data/templates';

/** A page section's owning sources: the page data, plus the component and its stories on component pages. */
function sectionSources(page: Page, block: PageBlock) {
  const extra = block.block.type === 'stories' ? componentSources(page.file, block.block.file.component) : page.file ? [page.file] : [];
  return [PAGES, ...extra];
}

/** Registry: block type in page data → the component that renders it. */
function renderBlock(block: Block): ReactNode {
  switch (block.type) {
    case 'palette':
      return <Palette group={block.group} only={block.only} />;
    case 'colour-roles':
      return <ColourRoles family={block.family} />;
    case 'brand-palette':
      return <BrandEditor />;
    case 'status-roles':
      return <StatusRoles />;
    case 'points':
      return <List items={block.items.map((text, i) => ({ id: String(i), content: <Text>{text}</Text> }))} />;
    case 'colour-sets':
      return <ColourSets />;
    case 'contrast-pairs':
      return <ContrastPairs />;
    case 'type-faces':
      return <TypeFaceList />;
    case 'type-styles':
      return <TypeRamp />;
    case 'type-chooser':
      return <TypeChooser />;
    case 'type-play':
      return <TypePlay />;
    case 'icon-chooser':
      return <IconChooser />;
    case 'icon-sets':
      return <IconSetList />;
    case 'icon-coverage':
      return <IconCoverage />;
    case 'token-rows':
      return <TokenRows group={block.group} match={block.match} />;
    case 'space-scale':
      return <SpaceScale />;
    case 'space-roles':
      return <SpaceRoles />;
    case 'layers':
      return <Layers />;
    case 'change-points':
      return <ChangePoints />;
    case 'space-options':
      return <SpaceOptions />;
    case 'shape-options':
      return <ShapeOptions />;
    case 'sizes':
      return <Sizes />;
    case 'radii':
      return <Radii />;
    case 'borders':
      return <Borders />;
    case 'stacked-bar':
      return <StackedBar />;
    case 'principles':
      // Q78.2: the frameworks behind the page, from principles.json.
      return <Principles ids={block.ids} />;
    case 'elevation':
      return <Elevation />;
    case 'elevation-ladder':
      return <ElevationLadder />;
    case 'separation-cues':
      return <SeparationCues />;
    case 'materials':
      return <Materials />;
    case 'easings':
      return <Easings />;
    case 'durations':
      return <Durations />;
    case 'motion-roles':
      // Q65 M1: the roles, played, with a reduced-motion switch.
      return <MotionRoles />;
    case 'component-tokens':
      return <ComponentTokens />;
    case 'overview':
      return <Overview />;
    case 'stories':
      return <StoryExamples file={block.file} />;
    case 'screen':
      return <ScreenPreview src={block.src} title={block.title} width={block.width} caption={block.caption} />;
    case 'content':
      // Q64: the screen beside the content files it renders from.
      return (
        <Grid max={2}>
          <ScreenPreview src={block.src} title={block.title} width="phone" />
          <Stack gap="group">
            {block.files.map((f) => (
              <CodeBlock key={f.file} label={f.file} code={f.json} />
            ))}
          </Stack>
        </Grid>
      );
    case 'table':
      return <DataTable label={block.label} columns={block.columns} rows={block.rows.map((cells, i) => ({ id: String(i), cells }))} />;
    case 'props':
      return <Props component={block.component} />;
    case 'access':
      return <Access component={block.component} />;
    case 'built-from':
      return <BuiltFrom component={block.component} />;
    case 'note':
      return <Note text={block.text} />;
    case 'code':
      return <CodeBlock label={block.label} code={block.code} wrap />;
    case 'links':
      return (
        <List
          items={block.items.map((l) => ({
            id: l.href,
            content: (
              <Link href={l.href} newTab={l.newTab}>
                {l.label}
              </Link>
            ),
          }))}
        />
      );
  }
}

const schemeOptions = [
  { value: 'light', label: 'Light', icon: 'scheme-light' },
  { value: 'dark', label: 'Dark', icon: 'scheme-dark' },
] satisfies SegmentedControlOption[];

const contrastOptions = [
  { value: 'standard', label: 'Standard contrast', icon: 'contrast-standard' },
  { value: 'more', label: 'More contrast', icon: 'contrast-more' },
] satisfies SegmentedControlOption[];

// An in-page anchor after the route (`#/tableofcontents#toc-venue`, written by the core router in a story) isn't part of it.
const routeFromHash = () => window.location.hash.replace(/^#\/?/, '').split('#')[0] || 'overview';
const wide = '(min-width: 64rem)'; // breakpoint.md

function useWide() {
  const [matches, setMatches] = useState(() => window.matchMedia(wide).matches);
  useEffect(() => {
    const m = window.matchMedia(wide);
    const on = () => setMatches(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return matches;
}

/**
 * A presentation preference: follows the system until the person sets it, then remembers their choice. It sets the
 * whole library's context, previews included.
 */
function usePreference(key: string, query: string) {
  const [stored, setStored] = useState<boolean | null>(() => {
    const v = localStorage.getItem(key);
    return v === null ? null : v === 'on';
  });
  const [system, setSystem] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setSystem(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  const set = (next: boolean) => {
    localStorage.setItem(key, next ? 'on' : 'off');
    setStored(next);
  };
  return [stored ?? system, set] as const;
}

/**
 * The navigation's open families, kept in this browser. The current page's family opens whenever the page changes, so
 * the person always sees where they are; closing it again is theirs to do.
 */
function useExpanded(key: string, currentFamilies: string[]) {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });
  const set = (next: string[]) => {
    localStorage.setItem(key, JSON.stringify(next));
    setValue(next);
  };
  useEffect(() => {
    const missing = currentFamilies.filter((f) => !value.includes(f));
    if (missing.length) set([...value, ...missing]);
    // Only when the page's families change, so a person can close one while on that page.
  }, [currentFamilies.join(' ')]);
  return [value, set] as const;
}

export function App() {
  const [route, setRoute] = useState(routeFromHash);
  const isWide = useWide();
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = usePreference('design-library.dark', '(prefers-color-scheme: dark)');
  const [more, setMore] = usePreference('design-library.contrast', '(prefers-contrast: more)');

  useLayoutEffect(() => {
    // Q65 Z18: the whole page switches in one frame, never element by element.
    suspendMotion(() => (document.documentElement.dataset.scheme = dark ? 'dark' : 'light'));
  }, [dark]);

  // On body, not the root: the system's more-contrast rule sits on :root, and a person's own choice must win over it.
  useLayoutEffect(() => {
    suspendMotion(() => (document.body.dataset.contrast = more ? 'more' : 'standard'));
  }, [more]);

  const { space, shape } = useSpaceShape();
  const spaceShape = useMemo(() => ({ space, shape, setSpace, setShape }), [space, shape]);
  const previewing = [
    space !== themeSpaceShape.space && `${spaceOptions.find((o) => o.id === space)?.label.toLowerCase()} space`,
    shape !== themeSpaceShape.shape && `${shapeOptions.find((o) => o.id === shape)?.label.toLowerCase()} shape`,
  ].filter(Boolean);

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      setNavOpen(false);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const page = pageById(route);
  const appearance = useMemo(() => ({ scheme: dark ? ('dark' as const) : ('light' as const), contrast: more ? ('more' as const) : ('standard' as const) }), [dark, more]);
  useEffect(() => {
    const shown = route.startsWith('app/') ? layoutOf(route.slice(4)) : undefined;
    document.title = shown ? `${shown.template.title}: ${shown.layout.title} · Design Library` : page ? `${page.title} · Design Library` : 'Page not found · Design Library';
  }, [page, route]);

  const r = useRevisions();
  const [article, setArticle] = useState<HTMLElement | null>(null);
  // The page actually on screen: during a page change the old page fades out first, so a jump waits for the new one.
  const [shownRoute, setShownRoute] = useState(route);
  const { selecting, setSelecting, paneOpen, setPaneOpen } = r;

  // Escape leaves block selection first, then closes the pane; anything that handled Escape itself keeps it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (selecting) setSelecting(false);
      else if (paneOpen) setPaneOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selecting, paneOpen, setSelecting, setPaneOpen]);

  useEffect(() => {
    if (!paneOpen) setSelecting(false);
  }, [paneOpen, setSelecting]);

  // A comment link: go to its page, then reveal, scroll to and focus the exact block, marked until the next press.
  const { jump, setJump, setJumpNote } = r;
  useEffect(() => {
    if (!jump) return;
    if (route !== jump.route) {
      window.location.hash = `#/${jump.route}`;
      return;
    }
    if (!article || shownRoute !== jump.route) return;
    const timer = window.setTimeout(() => {
      setJump(null);
      const block = resolveTarget(jump, article);
      if (!block) {
        setJumpNote(jump.element
          ? 'That element isn’t where it was: its selector no longer finds it inside the same catalogue block. Nothing was guessed: compare the saved snapshot with the page.'
          : 'That block isn’t on its page any more. Nothing was guessed: compare the saved snapshot with the page.');
        return;
      }
      for (let d = block.parentElement?.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true;
      article.querySelectorAll('[data-rev-jumped]').forEach((e) => e.removeAttribute('data-rev-jumped'));
      block.setAttribute('data-rev-jumped', '');
      if (!block.hasAttribute('tabindex')) block.setAttribute('tabindex', '-1');
      // Smooth only where the tab paints; reduced motion, or a tab that isn't painting, jumps at once.
      const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.visibilityState !== 'visible';
      block.scrollIntoView({ block: 'center', behavior: instant ? 'auto' : 'smooth' });
      block.focus({ preventScroll: true });
      const clear = () => {
        block.removeAttribute('data-rev-jumped');
        window.removeEventListener('pointerdown', clear, true);
      };
      window.addEventListener('pointerdown', clear, true);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [jump, route, shownRoute, article, setJump, setJumpNote]);

  const [expanded, setExpanded] = useExpanded('design-library.nav-expanded', familyPathOf(navGroups, page?.id));

  // A template's layout opens as its own standalone site (Q63): the old full-screen address goes there.
  const screen = route.startsWith('app/') ? layoutScreens[route.slice(4)] : undefined;
  useEffect(() => {
    if (screen) window.location.replace(`site.html#/${route}`);
  }, [screen, route]);
  if (screen) return null;

  return (
    <AppearanceContext.Provider value={appearance}>
    <SpaceShapeContext.Provider value={spaceShape}>
    <LibraryLayout
      navLabel="Library"
      navWidthKey="design-library.nav-width"
      pageKey={route}
      onPageShown={setShownRoute}
      aside={paneOpen ? <RevisionPane r={r} /> : undefined}
      asideLabel="Revision"
      header={
        <TitleBar
          title="Design Library"
          href="#/overview"
          meta={`0.3.0-beta.1 · Beta, for early trials${previewing.length ? ` · previewing ${previewing.join(' and ')}` : ''}`}
          actions={
            <>
              <SegmentedControl label="Colour scheme" iconOnly options={schemeOptions} value={dark ? 'dark' : 'light'} onChange={(v) => setDark(v === 'dark')} />
              <SegmentedControl label="Contrast" iconOnly options={contrastOptions} value={more ? 'more' : 'standard'} onChange={(v) => setMore(v === 'more')} />
              <PresetSettings />
              {import.meta.env.DEV && <Button label="Revisions" icon="comment" iconOnly emphasis="quiet" size="s" expanded={paneOpen} controls={REVISION_PANE} onClick={() => setPaneOpen(!paneOpen)} />}
            </>
          }
        />
      }
      nav={<Navigation groups={navGroups} current={page?.id} expanded={expanded} onExpandedChange={setExpanded} collapsed={!isWide} open={navOpen} onOpenChange={setNavOpen} />}
      main={
        page ? (
          <PageLayout
            ref={setArticle}
            header={
              <PageHeader
                eyebrow={page.section !== 'start' ? { label: sectionById(page.section).eyebrow, href: '#/overview' } : undefined}
                title={page.title}
                lead={page.summary}
                source={page.source}
                file={page.file}
                titleData={rev({ kind: 'heading', identity: { page: page.id }, sources: [PAGES, ...(page.file ? [page.file] : [])] })}
                leadData={rev({ kind: 'prose', identity: { page: page.id, note: 'summary' }, sources: [PAGES, ...(page.file ? [page.file] : [])] })}
              />
            }
          >
            {page.blocks.map((b, i) => {
              const { heading, intro, minor, block } = b;
              const section = heading ?? block.type;
              const sources = sectionSources(page, b);
              return (
                <Section
                  key={i}
                  heading={heading}
                  size={minor ? 3 : 2}
                  intro={intro}
                  headingData={rev({ kind: 'heading', identity: { page: page.id, section }, sources: [PAGES] })}
                  introData={rev({ kind: 'prose', identity: { page: page.id, section, note: 'intro' }, sources: [PAGES] })}
                  {...rev({ kind: 'section', identity: { page: page.id, section }, sources })}
                >
                  {renderBlock(block)}
                </Section>
              );
            })}
            {selecting && article && (
              <Picker
                key={page.id}
                root={article}
                selected={r.selection.filter((t) => t.route === page.id).map((t) => resolveTarget(t, article)).filter((e): e is HTMLElement => !!e)}
                onPick={(element, add) => capture(element, page.id, page.title, article).then((target) => (add ? r.toggle(target) : r.setSelection([target])))}
                onStop={(selectedOne) => {
                  setSelecting(false);
                  const to = selectedOne ? '[data-rev-composer] textarea' : '[data-rev-picker-switch] [role="switch"]';
                  window.setTimeout(() => document.querySelector<HTMLElement>(to)?.focus());
                }}
              />
            )}
          </PageLayout>
        ) : (
          <PageLayout
            header={
              <PageHeader title="Page not found">
                <Text>
                  There’s no page called “{route}”. Choose a page from the navigation, or go to the <Link href="#/overview">overview</Link>.
                </Text>
              </PageHeader>
            }
          />
        )
      }
    />
    <Notifications />
    </SpaceShapeContext.Provider>
    </AppearanceContext.Provider>
  );
}
