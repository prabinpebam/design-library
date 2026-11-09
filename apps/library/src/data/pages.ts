/** Pages as data: navigation, the overview index and the router all read this; blocks render through the registry. */
import { entryOf } from './catalogue';
import { colourTheme } from './tokens';
import clipping from '../../../../tools/clipping-allow.json';
import zeroLatency from '../../../../packages/core/motion/zero-latency.json';
import elevation from '../../../../packages/core/principles/elevation.json';
import principles from '../../../../packages/core/principles/principles.json';
import { countsOf, placeOf, statesOf, templates, type Template, type TemplateLayout } from './templates';
import { templateOf } from '@design-library/templates';
import { docsHref, docsSource } from './site-links';
import corePackage from '../../../../packages/core/package.json';
import { alignmentPickerStories, propertySectionStories, propertyRowStories, agendaStories, floatingBarStories, boardStories, appLayoutStories, treeViewStories, canvasStories, editorLayoutStories, screenPreviewStories, siteHeaderStories, siteLayoutStories,  conversationListStories, chatLayoutStories, imageGenerationStories, composerStories, chatMessageStories, messageActionsStories, chatThinkingStories, alertStories, errorSummaryStories, emptyStateStories, fileUploadStories, timeFieldStories, dateFieldStories, notificationsStories, heroStories, footerStories, listDetailStories, mediaPlayerStories, sheetStories, popoverStories, tooltipStories, mentionsStories, inlineEditStories, quoteStories, lightboxStories, imageGridStories, imageStories, accordionStories, statisticStories, cardStories, dialogStories, paginationStories, tabsStories, breadcrumbsStories, avatarStories, avatarGroupStories, personaStories, carouselStories, datePickerStories, dateRangePickerStories, calendarStories, colourPickerStories, allocationSliderStories, revealStories, morphStories, radioGroupStories, tagInputStories, fieldStories, ratingStories, gradientEditorStories, buttonGroupStories, colourFieldStories, menuButtonStories, listItemStories, scrollAreaStories, sliderStories, progressStories, skeletonStories, loadingStories, badgeStories, chipStories, chipGroupStories, exampleStories, indexListStories, contextMatrixStories, stackStories, stackedBarStories, rowListStories, tokenSpecimenStories, clusterStories, gridStories, paneStories, toolbarStories, codeStories, listStories, motionStories, codeBlockStories, dataTableStories, descriptionListStories, pageHeaderStories, sectionStories, titleBarStories, buttonStories, checkboxStories, checkboxGroupStories, headingStories, iconStories, linkStories, navigationStories, segmentedControlStories, selectStories, switchStories, textAreaStories, textFieldStories, numberFieldStories, textStories, type StoryFile, type NavigationFamily, type NavigationGroup, type NavigationItem } from '@design-library/core/react';

export type Block =
  /** Literal colour ramps shown once: primitives narrowed by `only`, the spectrum, or the custom sets. */
  | { type: 'palette'; group: 'p' | 'spectrum' | 'set'; only?: string[] }
  | { type: 'brand-palette' }
  | { type: 'colour-roles'; family: 'brand' | 'base' }
  /** Short points read one after another, as a bulleted list. */
  | { type: 'points'; items: string[] }
  | { type: 'status-roles' }
  | { type: 'colour-sets' }
  | { type: 'contrast-pairs' }
  | { type: 'type-faces' }
  | { type: 'type-styles' }
  | { type: 'type-chooser' }
  | { type: 'type-play' }
  | { type: 'icon-chooser' }
  | { type: 'icon-sets' }
  | { type: 'icon-coverage' }
  /** A token group as rows: name, value, use. `match` narrows the group by a pattern on the dotted path. */
  | { type: 'token-rows'; group: string; match?: string }
  | { type: 'space-scale' }
  | { type: 'space-roles' }
  | { type: 'space-options' }
  | { type: 'layers' }
  | { type: 'shape-options' }
  | { type: 'sizes' }
  | { type: 'radii' }
  | { type: 'borders' }
  | { type: 'stacked-bar' }
  | { type: 'elevation' }
  /** Q78.2/Q79: the frameworks behind a page, in short plain points, from packages/core/principles/principles.json. */
  | { type: 'principles'; ids: string[] }
  | { type: 'elevation-ladder' }
  | { type: 'separation-cues' }
  | { type: 'materials' }
  | { type: 'easings' }
  | { type: 'durations' }
  | { type: 'motion-roles' }
  | { type: 'component-tokens' }
  /** Generated from the component's source: its props, its accessibility notes and keys, what it's built from. */
  | { type: 'props'; component: string }
  | { type: 'access'; component: string }
  | { type: 'built-from'; component: string }
  | { type: 'overview' }
  | { type: 'stories'; file: StoryFile }
  /** A layout's full screen, live in a window of a chosen width. */
  | { type: 'screen'; src: string; title: string; width: 'phone' | 'tablet' | 'fill'; caption?: string }
  /** Rows of short facts under named columns. */
  | { type: 'table'; label: string; columns: { key: string; header: string }[]; rows: Record<string, string>[] }
  | { type: 'note'; text: string }
  /** Code or a command to copy (Q83 Get started). */
  | { type: 'code'; label: string; code: string }
  /** Links in a list; `newTab` opens each in a new browser tab (a standalone template, Q63). */
  | { type: 'links'; items: { label: string; href: string; newTab?: boolean }[] }
  /** A JSON template's layout (Q64): the screen in a phone-sized window beside the content file it renders from. */
  | { type: 'content'; src: string; title: string; files: { file: string; json: string }[] };

export type SectionId = 'start' | 'foundations' | 'fundamentals' | 'compounds' | 'layouts' | 'templates';

export interface Section {
  id: SectionId;
  /** Navigation group and overview heading. */
  title: string;
  /** Eyebrow on the section's pages. */
  eyebrow: string;
  /** One line on the overview. */
  summary: string;
}

export interface Page {
  id: string;
  section: SectionId;
  title: string;
  /** One line under the title, also listed on the overview. */
  summary: string;
  /** Where the page's values and decisions come from, linked under the summary. */
  source?: { label: string; href: string; newTab?: boolean };
  /** The component's source file, shown under the summary. */
  file?: string;
  /** The family it's listed under in the navigation, read from the component's `@family` tag. */
  family?: string;
  blocks: PageBlock[];
}

/**
 * Families of related pages inside a tier, in navigation order: each component names its own with `@family` in its doc
 * comment; this list only gives each family its title and place. Pages without a family list directly under the tier.
 */
export interface Family {
  id: string;
  section: SectionId;
  title: string;
}

export const families: Family[] = [
  { id: 'text', section: 'fundamentals', title: 'Text and icons' },
  { id: 'buttons', section: 'fundamentals', title: 'Buttons' },
  { id: 'inputs', section: 'fundamentals', title: 'Text inputs' },
  { id: 'selection', section: 'fundamentals', title: 'Selection' },
  { id: 'feedback', section: 'fundamentals', title: 'Feedback' },
  { id: 'people', section: 'fundamentals', title: 'People' },
  { id: 'media', section: 'fundamentals', title: 'Media' },
  { id: 'floating', section: 'fundamentals', title: 'Tooltips and popovers' },
  { id: 'arrangement', section: 'fundamentals', title: 'Arrangement' },
  { id: 'navigation', section: 'compounds', title: 'Navigation and headers' },
  { id: 'overlays', section: 'compounds', title: 'Overlays' },
  { id: 'content', section: 'compounds', title: 'Content' },
  { id: 'data', section: 'compounds', title: 'Data display' },
  { id: 'panels', section: 'compounds', title: 'Panels and toolbars' },
  { id: 'pickers', section: 'compounds', title: 'Pickers' },
  { id: 'documentation', section: 'compounds', title: 'Documentation' },
  { id: 'chat', section: 'compounds', title: 'Chat and AI' },
];

/** One section of a page: a heading, a short intro that says what holds for everything in it, then the content. */
export interface PageBlock {
  heading?: string;
  intro?: string;
  /** A short reference list under a main section: a smaller heading, the same structure. */
  minor?: boolean;
  block: Block;
}

/** Q83: how to use the library in your own app, short and plain; the full technical version is its Slate page. */
function getStarted(): Page {
  const v = corePackage.version;
  const release = `https://github.com/prabinpebam/design-library/releases/download/v${v}`;
  return {
    id: 'get-started',
    section: 'start',
    title: 'Get started',
    summary: 'Use the library in your own React app: install two packages, import the styles once, build screens from components or JSON, then make it yours.',
    source: docsSource('get-started', 'Every step and command, with troubleshooting: Get started (technical)'),
    blocks: [
      {
        heading: 'What you need',
        block: {
          type: 'points',
          items: [
            'A React 19 app built with Vite 8. Other bundlers, server rendering and other frameworks aren’t supported yet.',
            'Node 20.19 or later, with npm 10 or later.',
            'Nothing else: no account and no package registry. Each version is two files on GitHub, free to use under the MIT licence.',
          ],
        },
      },
      {
        heading: 'Install',
        intro: `Version ${v}: the library and its templates, always together, then React and the build tools.`,
        block: {
          type: 'code',
          label: 'Terminal',
          code: `npm install ${release}/design-library-core-${v}.tgz ${release}/design-library-templates-${v}.tgz react@^19 react-dom@^19\nnpm install -D vite@^8 @vitejs/plugin-react@^6 typescript@~6.0 @types/react@^19 @types/react-dom@^19`,
        },
      },
      {
        heading: 'Import the styles once',
        intro: 'At your entry, before anything renders. Every token, context and component style comes with it.',
        block: { type: 'code', label: 'src/main.tsx', code: "import '@design-library/core/css/index.css';" },
      },
      {
        heading: 'Build a screen',
        intro: 'From layouts and components, with no styles of your own. Words go in props.',
        block: {
          type: 'code',
          label: 'src/App.tsx',
          code: "import { Heading, SiteHeader, SiteLayout, Stack, Text } from '@design-library/core/react';\n\nexport function App() {\n  return (\n    <SiteLayout header={<SiteHeader name=\"Harbour Books\" href=\"/\" />}>\n      <Stack gap=\"section\">\n        <Heading level={1}>Books for slow evenings</Heading>\n        <Text>Open a book to read its first chapter.</Text>\n      </Stack>\n    </SiteLayout>\n  );\n}",
        },
      },
      {
        heading: 'Make it yours',
        intro: 'Your brand colour, your fonts, your spacing and shape, set once at start-up. Every component follows, in light, dark and more contrast.',
        block: {
          type: 'code',
          label: 'src/look.ts',
          code: "import { applyBrand, applyFonts } from '@design-library/core/theme';\n\napplyBrand({ colours: { 1: { seed: '#0f766e' } } });\nvoid applyFonts({ preset: 'editorial' });\ndocument.body.dataset.space = 'loose';\ndocument.body.dataset.shape = 'soft';",
        },
      },
      {
        heading: 'Or start from a template',
        intro: 'A whole site or app drawn from JSON content. Copy the nearest template into your project and change its words.',
        block: {
          type: 'points',
          items: [
            'Eight to start from: company site, portfolio, blog, conference, chat, design tool, project management, bookshop.',
            'Render one with TemplateView from @design-library/core/render.',
            'Check your content with npx design-library-check-content --templates src/templates.',
          ],
        },
      },
      {
        heading: 'Working with an AI agent',
        intro: 'The package carries its own guide for agents. Add these lines to your project’s AGENTS.md so every agent finds it.',
        block: {
          type: 'code',
          label: 'AGENTS.md',
          code: "## UI: Design Library\nThis project's UI uses @design-library/core. Before any UI work, read node_modules/@design-library/core/AGENTS.md\nand follow it: its Never rules, the seam ladder, and the task steps in its guide/ folder. No screen is done until it\npasses the adversarial loop in guide/8-review.md, scored by an evaluator who did not build it.",
        },
      },
      {
        heading: 'Check every screen',
        intro: 'Someone who didn’t build a screen judges it against each framework’s checklist, before it’s called done.',
        block: {
          type: 'points',
          items: [
            'Build it with the frameworks: spacing, layout, visual noise, materials, motion, clipping, UI states and the rest.',
            'A second agent or person, who didn’t build it, scores every checklist row with the probes the package ships.',
            'Fix each fail where it starts, then score again until every checklist passes.',
          ],
        },
      },
      {
        heading: 'Next',
        block: {
          type: 'links',
          items: [
            { label: 'Get started, the technical version: every step, command and fix', href: docsHref('get-started.md') },
            { label: `Release ${v} on GitHub`, href: `https://github.com/prabinpebam/design-library/releases/tag/v${v}`, newTab: true },
            { label: 'How the library works', href: docsHref('how-it-works.md') },
          ],
        },
      },
    ],
  };
}

const foundationSource = { label: 'Why these values: the foundation plan', href: docsHref('foundation.md') };

const base = colourTheme.base;
const tint = base.tint ? `, tinted ${base.tint.from ? `from brand colour ${base.tint.from}` : `with ${base.tint.colour}`}` : '';
/** The theme's base colour choice in one sentence. */
const baseSentence = `This theme’s base is ${base.temperature ?? 'neutral'}${tint}.`;

export const sections: Section[] = [
  { id: 'start', title: 'Start', eyebrow: 'Start', summary: '' },
  { id: 'foundations', title: 'Tokens', eyebrow: 'Tokens', summary: 'Every value the library uses, by role, in every context.' },
  { id: 'fundamentals', title: 'Fundamentals', eyebrow: 'Fundamental', summary: 'The universal building blocks every app needs, built from tokens only: type, icons, every kind of button, the controls and the arrangements that space them.' },
  { id: 'compounds', title: 'Compounds', eyebrow: 'Compound', summary: 'Arrangements of fundamentals for a particular need, which some apps have and others don’t. Products can add their own beside them.' },
  { id: 'layouts', title: 'Layouts', eyebrow: 'Layout', summary: 'Reusable views and sections with named regions. The library offers a standard set; products can make their own.' },
  { id: 'templates', title: 'Templates', eyebrow: 'Template', summary: 'Named collections of layouts for common kinds of product. Each layout is a full screen made only from layouts, compounds and view data; each opens full screen and shows what happens in a narrow window.' },
];


/** The templates before Q66 (F15.T1 baseline): 20 screens in a flat list, read as 18 flows; [screens, flows] per template. */
const BEFORE = { screens: 20, flows: 18, by: { corporate: [4, 3], portfolio: [3, 3], blog: [3, 2], conference: [5, 5], chat: [1, 1], design: [1, 1], projects: [3, 3] } as Record<string, [number, number]> };
/** The navigation's groups at 21:55 on 2026-11-08, before Q67 (items per group; Home was two levels down in every template). */
const GROUPING_BEFORE: Record<string, string> = {
  blog: '4 · Read 5, Subscribe 3, Reader 4, Help 1 · three flow groups of 2 · 4 groups outside 3–5',
  chat: '5 · Converse 3, Find 3, Account 2, Settings 2, Help 1 · five flow groups of 2, two of 3 · 8 outside',
  conference: '7 · Event 5, Tickets 3, Partners 2, Speak 2, Attendee 3, Help 1 · six flow groups of 2, one of 3 · 10 outside',
  corporate: '5 · Site 4, Careers 2, Contact 2, Account 3, Help 3 · seven flow groups of 2, one of 3 · 9 outside',
  design: '4 · Files 5, Edit 5, Share 1, Account 3 · five flow groups of 2 · 6 outside',
  portfolio: '4 · Work 2, About 4, Hire 3, Help 1 · three flow groups of 2 · 5 outside',
  projects: '6 · Plan 3, Track 4, Insights 1, Team 2, Admin 2, Help 1 · seven flow groups of 2 · 12 outside',
};

/** A table of one column per key: the rows as the cells. */
const table = (label: string, columns: [string, string][], rows: Record<string, string>[]): Block => ({ type: 'table', label, columns: columns.map(([key, header]) => ({ key, header })), rows });

/**
 * Q78.2/Q79: every page ends with the frameworks behind it, chosen by principles.json (`appliesTo`: the page, its
 * component family or its section). One source, so the words are never copied into a page by hand (Q79: plain, short).
 */
function withPrinciples(list: Page[]): Page[] {
  return list.map((p) => {
    const ids = principles.frameworks
      .filter(({ appliesTo: a }) => ('pages' in a && a.pages?.includes(p.id)) || (p.family && 'families' in a && a.families?.includes(p.family)) || ('sections' in a && a.sections?.includes(p.section)))
      .map((f) => f.id);
    return ids.length ? { ...p, blocks: [...p.blocks, { heading: 'Principles', intro: 'What drives this page, in short. Each links to its full framework.', block: { type: 'principles', ids } }] } : p;
  });
}

/** Q80: a page paired with a Slate doc in tools/site-links.json links to it from its header, locally and when hosted. */
function withDocs(list: Page[]): Page[] {
  return list.map((p) => {
    const source = docsSource(p.id);
    return source && p.source?.href !== source.href ? { ...p, source } : p;
  });
}

/** A template layout as a standalone site (Q63): its own document, no library chrome. */
export const siteHref = (template: string, layout: string) => `site.html#/app/${template}/${layout}`;

/** The Templates overview: every template, its layouts, and which are built. */
const templatesOverview: Page = {
  id: 'templates',
  section: 'templates',
  title: 'All templates',
  summary: 'Seven templates, each a grouped hierarchy: sections, the flows in each, the screens of each flow and their states. Built screens are listed in the navigation under their template, section and flow, and open in a new tab as a standalone site.',
  blocks: [
    {
      heading: 'The plan: five times the screens and flows',
      intro: `Owner, 2026-11-08 (Q66): at least five times the screens and flows. Before F15.T1 the templates had ${BEFORE.screens} screens in a flat list, which read as ${BEFORE.flows} flows; the target is at least ${BEFORE.screens * 5} screens and ${BEFORE.flows * 5} flows. Planned screens are in each template’s manifest now and are built flow by flow; states (wrong password, nothing found) are counted apart.`,
      block: table(
        'Screens and flows per template',
        [['template', 'Template'], ['before', 'Before (screens · flows)'], ['planned', 'Planned (screens · flows)'], ['built', 'Built now (screens · flows)'], ['states', 'States built of planned']],
        [
          ...templates.map((t) => {
            const c = countsOf(t);
            const b = BEFORE.by[t.id] ?? [0, 0];
            return { template: t.title, before: `${b[0]} · ${b[1]}`, planned: `${c.screens} · ${c.flows}`, built: `${c.screensBuilt} · ${c.flowsBuilt}`, states: `${c.statesBuilt} of ${c.states}` };
          }),
          (() => {
            const all = templates.map(countsOf);
            const sum = (k: keyof ReturnType<typeof countsOf>) => all.reduce((n, c) => n + c[k], 0);
            return { template: 'All seven', before: `${BEFORE.screens} · ${BEFORE.flows}`, planned: `${sum('screens')} · ${sum('flows')}`, built: `${sum('screensBuilt')} · ${sum('flowsBuilt')}`, states: `${sum('statesBuilt')} of ${sum('states')}` };
          })(),
        ],
      ),
    },
    {
      heading: 'Every flow',
      intro: 'Template → section → flow → screens, in the order a person meets them. A screen not built yet is marked “to come”; the content folders follow the navigation’s groups (Q67): content/{home}.json, content/{section}/{screen}.json, and content/{section}/{flow}/{screen}.json for a flow of three or more screens.',
      block: table(
        'Flows of every template',
        [['template', 'Template'], ['section', 'Section'], ['flow', 'Flow'], ['screens', 'Screens']],
        templates.flatMap((t) =>
          t.sections.flatMap((sec) =>
            sec.flows.map((f) => ({
              template: t.title,
              section: sec.title,
              flow: f.title,
              screens: f.screens
                .map((id) => {
                  const l = t.layouts.find((x) => x.id === id);
                  const states = statesOf(t, id).map((st) => `${st.title}${st.planned ? ', to come' : ''}`);
                  return `${l?.title ?? id}${l?.planned ? ' (to come)' : ''}${states.length ? ` [states: ${states.join('; ')}]` : ''}`;
                })
                .join(' → '),
            })),
          ),
        ),
      ),
    },
    {
      heading: 'Grouping: 3 to 5 items in every group',
      intro: 'Owner, 2026-11-08 21:55 (Q67): Home sits at each template’s top level, and every group holds 3–5 items; fewer is needless nesting, more is too flat. A flow of three or more screens is a group of its own; a shorter flow’s screens sit in its section. The content folders follow the same groups (content/{home}.json, content/{section}/, content/{section}/{flow}/), and npm run check:content fails on a group outside 3–5. Exception: a screen’s states sit beside it in its folder and on its page, not as items of their own. Before is the navigation as it was at 21:55 (a flow of two screens was a group of two).',
      block: table(
        'Items per group, before and after',
        [['template', 'Template'], ['before', 'Before (top · each section · flow groups)'], ['after', 'After (top · each section · flow groups)']],
        templates.map((t) => {
          const parts = templateOf(t.id)?.stories?.length ? 1 : 0;
          const sections = t.sections.map((s) => {
            const groups = s.flows.map((f) => f.screens.filter((id) => id !== t.home).length);
            return { title: s.title, items: groups.reduce((n, g) => n + (g >= 3 ? 1 : g), 0), groups: s.flows.filter((_, i) => groups[i] >= 3).map((f) => `${f.title} ${f.screens.filter((id) => id !== t.home).length}`) };
          });
          const flowGroups = sections.flatMap((s) => s.groups);
          return {
            template: t.title,
            before: GROUPING_BEFORE[t.id] ?? '',
            after: `${sections.length + parts + (t.home ? 1 : 0)} (Home, ${sections.map((s) => s.title).join(', ')}${parts ? ', Own parts' : ''}) · ${sections.map((s) => `${s.title} ${s.items}`).join(', ')} · ${flowGroups.length ? flowGroups.join(', ') : 'none'}`,
          };
        }),
      ),
    },
    {
      heading: 'Templates and their sections',
      intro: 'A template is a set of layouts that belong to one kind of product, sharing their header, navigation and footer.',
      block: table(
        'Templates',
        [['template', 'Template'], ['what', 'For'], ['sections', 'Sections']],
        templates.map((t) => ({
          template: t.title,
          what: t.summary,
          sections: t.sections.map((x) => x.title).join(', '),
        })),
      ),
    },
    {
      heading: 'Open a template',
      intro: 'Each opens in a new tab as a standalone site: its own address, no library around it, its own light and dark. Move between its layouts as on a real site.',
      block: {
        type: 'links',
        items: templates
          .filter((t) => t.layouts.some((l) => !l.planned))
          .map((t) => ({ label: `Open ${t.title} in new tab`, href: siteHref(t.id, t.home ?? t.layouts.find((l) => !l.planned)!.id), newTab: true })),
      },
    },
  ],
};

/** A template layout's page: the screen at the column's width, then in a phone-sized window, its regions, and what's left. */
const layoutPage = (t: Template, l: TemplateLayout): Page => {
  const place = placeOf(t, l.id);
  const flow = place?.flow;
  const steps = flow ? flow.screens.map((id) => t.layouts.find((x) => x.id === id)!).filter(Boolean) : [];
  const states = statesOf(t, l.id);
  return {
  id: `${t.id}-${l.id}`,
  section: 'templates',
  family: t.id,
  title: `${t.title}: ${l.title}`,
  summary: l.summary ?? '',
  source: { label: 'Open in new tab', href: siteHref(t.id, l.id), newTab: true },
  blocks: [
    ...(place && flow
      ? [
          {
            heading: 'Where it sits',
            intro: `${place.section.title} → ${flow.title}: ${flow.summary ?? ''} Screen ${place.index + 1} of ${steps.length}${states.length ? `, with ${states.length} state${states.length === 1 ? '' : 's'} below` : ''}.`,
            block: {
              type: 'table' as const,
              label: `The screens of ${flow.title}`,
              columns: [{ key: 'step', header: 'Step' }, { key: 'screen', header: 'Screen' }, { key: 'status', header: 'Built' }],
              rows: steps.map((x, i) => ({ step: String(i + 1), screen: x.id === l.id ? `${x.title} (this page)` : x.title, status: x.planned ? 'To come' : 'Built' })),
            },
          },
        ]
      : []),
    { heading: 'The screen', intro: `Built on ${l.layout}, from ${l.content ? 'its content JSON' : 'view data'}. Use it here, or open it in a new tab as a standalone site with its own light and dark.`, block: { type: 'screen', src: siteHref(t.id, l.id), title: `${t.title}, ${l.title}`, width: 'fill' } },
    l.content
      ? { heading: 'Content beside the screen', intro: `The screen renders only from ${l.content.map((c) => c.file).join(' and ')}: words, pictures by id and links to other layouts, as pure JSON checked by npm run check:content. In a narrow window: ${l.narrow ?? ''}`, block: { type: 'content', src: siteHref(t.id, l.id), title: `${t.title}, ${l.title}, in a phone-sized window`, files: l.content } }
      : { heading: 'In a narrow window', intro: l.narrow, block: { type: 'screen', src: siteHref(t.id, l.id), title: `${t.title}, ${l.title}, in a phone-sized window`, width: 'phone' } },
    { heading: 'Regions', intro: 'Each region, what it holds and the components it’s made from.', block: table('Regions', [['region', 'Region'], ['holds', 'What it holds'], ['uses', 'Made from']], (l.regions ?? []).map((r) => ({ ...r }))) },
    ...(l.try ? [{ heading: 'Try', minor: true, block: { type: 'points' as const, items: l.try } }] : []),
    ...states.flatMap((st): PageBlock[] =>
      st.planned
        ? [{ heading: `State: ${st.title}`, intro: 'To come: planned in the manifest, not built yet.', block: { type: 'note', text: `${st.title} is planned for ${l.title}.` } }]
        : [
            { heading: `State: ${st.title}`, intro: st.summary ?? `The same screen in another state, from its own content file.`, block: { type: 'screen', src: siteHref(t.id, st.id), title: `${t.title}, ${l.title}, ${st.title}`, width: 'fill' } },
            ...(st.content ? [{ heading: `${st.title}: content`, minor: true, block: { type: 'content' as const, src: siteHref(t.id, st.id), title: `${t.title}, ${l.title}, ${st.title}, in a phone-sized window`, files: st.content.slice(0, 1) } }] : []),
          ],
    ),
    ...(l.notBuilt ? [{ heading: 'Not built', minor: true, block: { type: 'points' as const, items: l.notBuilt } }] : []),
  ],
  };
};

/** A template's own parts (Q64): its custom fundamentals, compounds and layouts, each with its stories, props and accessibility, read from the template's folder like a core component's. */
const partsPage = (t: Template): Page[] => {
  const stories = templateOf(t.id)?.stories ?? [];
  if (!stories.length) return [];
  const order = { fundamental: 0, compound: 1, layout: 2 };
  return [
    {
      id: `${t.id}-parts`,
      section: 'templates',
      family: t.id,
      title: `${t.title}: Own parts`,
      summary: `What ${t.title} adds in its own scope (packages/templates/${t.id}/parts): never in the core, named under “${t.id}.”, reading core semantic tokens through its own t.${t.id}.* tokens, documented like a core component.`,
      blocks: [...stories]
        .sort((a, b) => order[a.tier] - order[b.tier])
        .flatMap((file): PageBlock[] => [
          { heading: `${file.component} (${file.tier})`, intro: file.summary, block: { type: 'stories', file } },
          { heading: 'Props', minor: true, block: { type: 'props', component: file.component } },
          { heading: 'Accessibility', minor: true, block: { type: 'access', component: file.component } },
        ]),
    },
  ];
};

const templatePages = [templatesOverview, ...templates.flatMap((t) => [...t.layouts.filter((l) => !l.planned && !l.stateOf).map((l) => layoutPage(t, l)), ...partsPage(t)])];
/** The sections every component page has after its examples, all read from the component's source. */
const contract = (component: string): PageBlock[] => [
  { heading: 'Props', minor: true, block: { type: 'props', component } },
  { heading: 'Accessibility', minor: true, block: { type: 'access', component } },
  { heading: 'Built from', minor: true, block: { type: 'built-from', component } },
];

const componentPage = (file: StoryFile): Page => {
  const entry = entryOf(file.component);
  return {
    id: file.component.toLowerCase(),
    section: file.tier === 'compound' ? 'compounds' : file.tier === 'layout' ? 'layouts' : 'fundamentals',
    title: file.component,
    summary: entry?.summary || file.summary,
    file: entry?.file,
    family: entry?.family,
    blocks: [{ heading: 'Examples', minor: true, block: { type: 'stories', file } }, ...contract(file.component)],
  };
};
export const pages: Page[] = withDocs(withPrinciples([
  {
    id: 'overview',
    section: 'start',
    title: 'Design Library',
    summary: 'A design library for React apps and sites: every token, component, layout and template shown live from the code your product uses, in light, dark and more contrast. A Beta for early trials: try it in your own project.',
    blocks: [{ block: { type: 'overview' } }],
  },
  getStarted(),
  {
    id: 'colour',
    section: 'foundations',
    title: 'Colour',
    summary: 'Pick a brand colour and you’re done: base, functional, spectrum and custom colours are defined around it, each with who may use it, all from one theme config.',
    source: { label: 'How colour is defined: the colour model', href: docsHref('foundation.md#colour-model') },
    blocks: [
      {
        heading: 'Why colour works this way',
        intro: 'Least effort to define, robust when a product needs more. One line per kind of colour:',
        block: {
          type: 'points',
          items: [
            'Brand colours: pick one and you’re done. Add up to three more, numbered 1 to 4, and mark which one is the accent.',
            'Base colours: black, white and the greys between, always needed, so already defined. Neutral by default; make them warm, cool or tinted to match the brand’s mood.',
            'Functional colours: every product needs info, success, warning and danger, so they’re already defined. Adjust them as a palette.',
            'Spectrum: a defined colour for every perceptible hue, for charts and distinctions when more colours are needed. Never for status.',
            'Custom sets: add your own palettes as the product grows. Each declares its purpose, so people and agents use it correctly and nothing breaks when tokens change.',
          ],
        },
      },
      {
        heading: 'Brand colours',
        intro: 'Up to four brand colours, numbered 1 to 4. One is the accent, colour 1 unless you mark another: actions, links, focus and selection read it. The others are identity marks only (logos, illustration, a brand band). Choose a swatch to try a colour, or start from a preset; the whole library recolours at once, in this browser only.',
        block: { type: 'brand-palette' },
      },
      {
        heading: 'Accent and brand roles',
        minor: true,
        intro: 'What components read for actions, links, focus and selection, and the brand roles for identity marks. Each cell shows the ink a role reads in that context and, where it needs one, its contrast on the page canvas.',
        block: { type: 'colour-roles', family: 'brand' },
      },
      {
        heading: 'Base colours',
        intro: `The non-colours: black, white and the greys between. Neutral by default; warm, cool or tinted for the brand’s mood. ${baseSentence} Text, surfaces, lines and the hover and pressed layers read it. The ramp is private and the same in every context, so shown once.`,
        block: { type: 'palette', group: 'p', only: ['base'] },
      },
      {
        heading: 'Base colour roles',
        minor: true,
        intro: 'Each cell shows the ink a role reads in that context and, for text and outlines, its contrast on the page canvas: text needs 4.5:1, outlines and the focus ring 3:1.',
        block: { type: 'colour-roles', family: 'base' },
      },
      {
        heading: 'Functional colours',
        intro: 'Already defined and adjustable as a palette (a seed and optional steps per status in the theme config). For status only, one meaning each. Synonyms share one token: good and positive are success; bad, negative and error are danger; alert is warning. Never for decoration or charts. Each cell shows a message on its tint with its contrast, then the solid fill with its text; the token check holds every status pair in light and dark, at standard and more contrast.',
        block: { type: 'status-roles' },
      },
      {
        heading: 'Spectrum',
        intro: `${colourTheme.spectrum.hues} hues evenly spaced around the wheel, each step equally light across hues. For charts, categories and decoration; never for status or a component’s own colours, even where a hue matches a status. The same in every context, so shown once.`,
        block: { type: 'palette', group: 'spectrum' },
      },
      {
        heading: 'Custom sets',
        intro: 'Your own palettes. Each must declare its purpose, shown under its name and written into every token, so people and agents use it only for that. Optional and never functional, like the spectrum.',
        block: { type: 'colour-sets' },
      },
      {
        heading: 'Contrast on other surfaces',
        intro: 'The remaining pairs the token check holds: raised and sunken surfaces and accent fills. Measured where they render.',
        block: { type: 'contrast-pairs' },
      },
    ],
  },
  {
    id: 'type',
    section: 'foundations',
    title: 'Typography',
    summary: 'One to four font roles, each with its job, from a list of free, open-licence faces; presets; live axes where a face has them; and one ramp from xs to jumbo.',
    source: foundationSource,
    blocks: [
      {
        heading: 'Choose the fonts',
        intro: 'Start from a preset, or pick a face for each role. A role left unset takes the face of the role above it, so one font is enough; code without a face stays on the system monospace.',
        block: { type: 'type-chooser' },
      },
      {
        heading: 'Four roles, four jobs',
        intro: 'Each role has one job, and every face is free and openly licensed, served from this library (no font request leaves it). The system’s own fonts stand in until a face arrives.',
        block: { type: 'type-faces' },
      },
      {
        heading: 'Play with a face',
        intro: 'The axes the chosen face really has, live: a slider for a range, a switch for an on-or-off axis. A face without axes shows none.',
        block: { type: 'type-play' },
      },
      {
        heading: 'The ramp',
        intro: 'Each text style at its real size, top step first, in its role’s face: its step on the size scale, line height, weight and tracking. Components read these styles, never the raw sizes below.',
        block: { type: 'type-styles' },
      },
      { heading: 'Sizes', minor: true, intro: 'Open-ended names: xs to xxxxl, then jumbo at the top.', block: { type: 'token-rows', group: 'text' } },
      { heading: 'Line height', minor: true, block: { type: 'token-rows', group: 'leading' } },
      { heading: 'Weight', minor: true, block: { type: 'token-rows', group: 'weight' } },
      { heading: 'Tracking', minor: true, block: { type: 'token-rows', group: 'tracking' } },
      { heading: 'Roles and axes', minor: true, block: { type: 'token-rows', group: 'font' } },
    ],
  },
  {
    id: 'space',
    section: 'foundations',
    title: 'Space and size',
    summary: 'One 4 px base unit, roles named by relationship, the sizes of targets, controls, icons and columns, and the widths layouts change at.',
    source: foundationSource,
    blocks: [
      { heading: 'The spacing scale', intro: 'Multiples of a 4 px unit. Components never read a step directly; they read a role below.', block: { type: 'space-scale' } },
      {
        heading: 'Roles, by relationship',
        intro: 'Each role names a relationship and a level: a pair, items, groups, sections. Space within a group is always smaller than the space around it.',
        block: { type: 'space-roles' },
      },
      {
        heading: 'Space options',
        intro: 'Four ways to space a whole product, chosen once in the theme: compact, normal, loose and extra loose. Each re-maps the roles above; the 4 px unit, sizes, 44 px targets and text never change, and space within a group stays smaller than the space around it in every option.',
        block: { type: 'space-options' },
      },
      { heading: 'Sizes', intro: 'Small sizes drawn at their size; widths drawn to scale against the widest.', block: { type: 'sizes' } },
      { heading: 'Breakpoints', intro: 'The widths layouts change at. CSS can’t read a custom property in a media query, so width queries use these values as written.', block: { type: 'token-rows', group: 'breakpoint' } },
    ],
  },
  {
    id: 'shape',
    section: 'foundations',
    title: 'Shape',
    summary: 'Corner radii by what they round, two stroke widths and the square-segment rule for bars.',
    source: foundationSource,
    blocks: [
      { heading: 'Radii', block: { type: 'radii' } },
      {
        heading: 'Shape options',
        intro: 'Four ways to round a whole product, chosen once in the theme: sharp, rounded, soft and super soft. Each re-maps the radius roles; shapes round by nature (a switch, a dot) stay round, inner bar segments stay square, and focus rings follow each corner.',
        block: { type: 'shape-options' },
      },
      { heading: 'Borders', intro: 'A full outline where an enclosure earns its place; never a stripe on one side.', block: { type: 'borders' } },
      { heading: 'Bars', intro: 'Inner segments stay square, so a small segment still reads; only the whole bar’s outer ends are rounded.', block: { type: 'stacked-bar' } },
    ],
  },
  {
    id: 'materials',
    section: 'foundations',
    title: 'Materials',
    summary: 'What each surface is made of: the page, wells, raised surfaces, control fills, chrome and floating surfaces that may be frosted, modals, the scrim and the media veil.',
    source: foundationSource,
    blocks: [
      {
        heading: 'Material roles',
        intro: 'Components read a material, never their own mix. Each is drawn over the hardest backdrop, stripes of text and canvas colour, with text and muted text on it. Chrome and floating are frosted when the global setting is on, and solid in more contrast, with reduced transparency and where the browser can’t blur.',
        block: { type: 'materials' },
      },
    ],
  },
  {
    id: 'motion',
    section: 'foundations',
    title: 'Motion and timing',
    summary: 'The roles components read for every change, the easings, and the state timings that hold even with reduced motion.',
    source: foundationSource,
    blocks: [
      {
        heading: 'Roles',
        intro: 'Components read a role, never a step of the scale. Change is the 200 ms default for every colour, fill, border, shadow and opacity; quick is the short side (a press arriving, content leaving); move, move far and shared are for things that travel or resize. Turn on Reduced motion and play again: travel snaps, fades stay.',
        block: { type: 'motion-roles' },
      },
      { heading: 'Easings', intro: 'Standard for movement within the screen, enter for what arrives, exit for what leaves, linear for progress fills and loops. Nothing moves until you press Play; with reduced motion, nothing moves at all.', block: { type: 'easings' } },
      { heading: 'Scale', intro: 'The steps the roles are built from. Components never read these directly; with reduced motion, the first four are still 0 ms until every component reads a role.', block: { type: 'durations' } },
      { heading: 'Movement', minor: true, block: { type: 'token-rows', group: 'motion' } },
      {
        heading: 'State timing',
        intro: 'How long pending, confirmed, loading and notification states hold. These keep their values with reduced motion: the beats stay, only movement goes.',
        block: { type: 'token-rows', group: 'duration', match: '^duration\\.(?!instant$|fast$|medium$|slow$|xslow$|quick$|change$|move$|move-far$|shared$)' },
      },
      { heading: 'Counts', minor: true, block: { type: 'token-rows', group: 'count' } },
      {
        heading: 'Zero latency',
        intro: 'Where the value a person drives is drawn in the next frame, with no transition, no tween and no delay; only the decoration around it may ease. The same list feeds npm run check:motion, which fails when a transition or animation touches one of these values, uses a literal duration or curve, transitions all, reads the private scale, or animates a layout property outside its named allow-list.',
        block: table(
          'Zero-latency places',
          [['id', '#'], ['place', 'Place'], ['instant', 'Instant'], ['mayEase', 'May ease'], ['checked', 'Checked']],
          zeroLatency.places.map((z) => ({ id: z.id, place: z.place, instant: z.instant, mayEase: z.mayEase, checked: z.rules.length ? 'check:motion' : 'Browser probe (later)' })),
        ),
      },
      {
        heading: 'Shared element',
        intro: 'When the same thing is on both sides of a change of view (a card and its detail), it travels instead of disappearing and reappearing; everything else cross-fades. viewTransition() names only those elements, only for the change.',
        block: { type: 'stories', file: motionStories },
      },
    ],
  },
  {
    id: 'elevation',
    section: 'foundations',
    title: 'Elevation and layering',
    summary: 'How far above the page each surface sits, how that shows, and what goes on top of what.',
    source: docsSource('elevation'),
    blocks: [
      {
        heading: 'The ladder',
        intro: 'Six levels, lowest at the bottom. Most of a screen is the canvas and things raised on it; only what opens over the page floats, and only what blocks it sits over a dimmed page.',
        block: { type: 'elevation-ladder' },
      },
      {
        heading: 'Tone, hairline, shadow or tint',
        intro: 'Each says something different, so use the cheapest one that says what you mean, and only one. Tone first; a hairline where tone is too close; a shadow only for what floats; a tint for a state, never a height.',
        block: { type: 'separation-cues' },
      },
      {
        heading: 'Shadows',
        intro: 'Two shadows, both only for what floats: raised for what opens from a trigger, overlay for what floats free or blocks the page. In dark mode the tone step does most of the work, so the shadow carries less.',
        block: { type: 'elevation' },
      },
      {
        heading: 'Layers',
        intro: 'The only stacking orders, top first, with the components that sit on each, read from their CSS. Every z-index reads one of these tokens, directly or through a component token; a number anywhere fails npm run check:layers.',
        block: { type: 'layers' },
      },
      {
        heading: 'Choosing a layer',
        minor: true,
        intro: 'Ask in this order; the first yes decides.',
        block: { type: 'points', items: elevation.zIndex },
      },
      {
        heading: 'How stacking works',
        minor: true,
        intro: 'A z-index only orders things inside the same stacking context, so the rules are about contexts, not bigger numbers.',
        block: {
          type: 'points',
          items: [
            'A new stacking context starts at any element with position and a z-index, opacity below 1, a transform, filter or backdrop-filter, isolation: isolate, contain: paint or layout, will-change on one of those, or a container query. Inside it, children can never rise above anything outside it, whatever their number.',
            'Popups (menus, listboxes) open in the browser’s top layer with the popover attribute, and dialogs as modal dialog elements, so no ancestor’s context or clipping can trap them.',
            'The order between layers is fixed: content, sticky, popups, review tooling, sheets and scrims, dialogs, notifications, tooltips. A notification is above a dialog so a result is never hidden by what caused it.',
          ],
        },
      },
    ],
  },
  {
    id: 'component-tokens',
    section: 'foundations',
    title: 'Component tokens',
    summary: 'Every component’s own decisions, named after it and built from the semantic roles.',
    source: foundationSource,
    blocks: [
      { heading: 'By component', intro: 'Change one here and every instance follows.', block: { type: 'component-tokens' } },
    ],
  },
  {
    id: 'clipping',
    section: 'foundations',
    title: 'Clipping',
    summary: 'What may be cut off and what never is: focus rings, borders and shadows are never clipped by accident; every clip and every scroll region is on one list with its reason.',
    source: { label: 'The rules: the foundation plan', href: docsHref('foundation.md') },
    blocks: [
      {
        heading: 'The rules',
        intro: 'Clipping is a decision, never a side effect.',
        block: {
          type: 'points',
          items: [
            'Nothing clips by default. A rule may hide overflow, crop with a clip path, contain paint or truncate text only if it is on the list below, with its reason; npm run check:clipping fails on anything else.',
            'Focus rings, borders and shadows of anything inside a clipping box stay inside that box’s padding: padding sits one or two levels below the box, so the ring of an edge item has room.',
            'Scroll regions clip by nature, so they are listed too. They bleed to their surface’s edge and pad their content, never the scroll box itself.',
            'A shape crop (a bar’s rounded ends, a specimen’s track) holds nothing focusable or shadowed.',
            'Text is truncated only where the full text is one step away: the open list, the accessible name or a pane.',
          ],
        },
      },
      {
        heading: 'Allowed clips',
        intro: 'Each with its kind and reason, read from tools/clipping-allow.json, the list the check uses.',
        block: { type: 'points', items: clipping.clips.map((c) => `${c.kind}: ${c.selector}. ${c.reason}.`) },
      },
      {
        heading: 'Scroll regions',
        minor: true,
        block: { type: 'points', items: clipping.scrollRegions.map((s) => `${s.selector}: ${s.reason}.`) },
      },
    ],
  },
  {
    id: 'scrolling',
    section: 'foundations',
    title: 'Scrolling',
    summary: 'One custom, minimal scrollbar drawn over the content: shown always or only while scrolling and on hover, and never a column that moves the layout.',
    source: { label: 'The rules: the foundation plan', href: docsHref('foundation.md') },
    blocks: [
      {
        heading: 'The rules',
        intro: 'A scrollbar is an overlay, not an extra column.',
        block: {
          type: 'points',
          items: [
            'Every scroll region is a ScrollArea. The browser’s bar is hidden and its scrolling kept: wheel, touch, keys, find in page and anchors all work as usual.',
            'The bar is drawn over the region’s end edge, so the content has the same width and alignment whether it overflows or not. No gutter is reserved and nothing moves when content grows.',
            'Two modes, chosen per region: shown on scroll or hover (the default, for navigation, panes and lists), or always shown (for the main reading region, where length and position matter).',
            'The thumb is 4 px at rest and 8 px while hovered or dragged, in the strong border colour (3:1 on every surface in every context). It can be dragged; pressing the track pages towards the pointer.',
            'A region’s content inset is at least the 12 px strip the bar sits in, so the thumb never covers text or a focus ring.',
            'The drawn bar is hidden from assistive technology. A region with nothing focusable inside takes a name and focus, so the keys still scroll it.',
            'Reduced motion: the bar appears and leaves without fading. Forced colours and touch screens get the system’s own bar back.',
            'Scrollbar styling exists only in ScrollArea; npm run check:clipping fails on scrollbar styles anywhere else.',
          ],
        },
      },
      { heading: 'Both modes, live', intro: 'Scroll, hover and drag each region.', block: { type: 'stories', file: scrollAreaStories } },
      {
        heading: 'Where each mode is used',
        minor: true,
        block: {
          type: 'points',
          items: [
            'Main region: always shown.',
            'Navigation and the revision pane: shown on scroll or hover.',
            'App, chat and editor layouts (Q96): the sidebar, the view or conversation, and each panel: shown on scroll or hover, at the region’s edge.',
            'Dialog and Sheet bodies, Canvas (both ways), Board columns and a Carousel’s thumbnails (sideways): shown on scroll or hover.',
            'Code blocks, tables, context matrices and example previews: sideways, shown on scroll or hover.',
            'Select, MenuButton and AvatarGroup lists: shown on scroll or hover, through the same overlay scroll behaviour.',
            ...clipping.scrollRegions.filter((s) => 'bar' in s && s.bar !== 'ScrollArea').map((s) => `${s.selector}: ${s.bar}.`),
          ],
        },
      },
    ],
  },
  {
    id: 'loading',
    section: 'foundations',
    title: 'Loading',
    summary: 'One loading framework at five scopes, app, view, section, component and inline: the smallest scope that waits, one timing model, one indicator per need.',
    source: { label: 'The rules: the foundation plan', href: docsHref('foundation.md') },
    blocks: [
      {
        heading: 'The rules',
        intro: 'Show the wait where it happens, at the smallest scope that waits, and nothing more.',
        block: {
          type: 'points',
          items: [
            'Choose the scope by asking what the wait affects. Start at the smallest; widen only when another edit could corrupt the work.',
            'Three indicators, one per need: a Skeleton for a view or section whose shape is known; Progress as a small arc in a control, a field or beside a short line; Progress as a bar with words for long work. No other spinner, no second skeleton.',
            'Loads wait 300 ms before showing anything, so content that beats it is drawn directly; once shown, an indicator stays at least 500 ms, so nothing flickers. useLoadIndicator times both from the duration tokens.',
            'A changed control shows pending at once and holds it at least 200 ms, then confirmed for at least 200 ms, even when the save is instant. That is the commit track, built into Button, Switch and the fields.',
            'Keep the old content until the new is complete. A refresh never blanks a region; past 300 ms it says it’s updating, then the new content swaps in whole.',
            'A skeleton shimmers three passes, then holds still; with reduced motion it never moves. Past ten seconds, say it’s taking longer and offer a way to stop.',
            'Name the work in words, with a count or a percentage only from a real total. Never “Loading…” alone, never a made-up percentage.',
            'The waiting region sets aria-busy; one status line says the start and the end once. Step text is subtle and not announced.',
            'Empty, failed and slow fill the same area as the content: an empty state says why and what to do; a failure says what happened, what was kept and offers Try again.',
          ],
        },
      },
      {
        heading: 'Scopes',
        intro: 'What waits at each scope, and what shows it.',
        block: {
          type: 'points',
          items: [
            'App: the ground under everything changes (switching workspace or account, restoring a backup). Everything waits, only with a written reason; a full state with steps, a bar with a real percentage and Cancel.',
            'View: a view’s content is replaced (opening, switching item). The header and navigation stay usable; the content area shows a skeleton of its real layout, then swaps in complete.',
            'Section: one part of a view loads or refreshes on its own. Its own skeleton on first load; on refresh the old content stays and a small arc with “Updating…” appears past 300 ms.',
            'Component: one control’s own work (a save, a copy, an export). The control shows it in its own box: a spinner in place of its icon, or an arc around its border; long work adds a bar and a step line under it.',
            'Inline: a field’s save or a short check beside the thing it checks. The field’s own trailing spinner and tick; a small arc and words in the line, replaced by the answer.',
          ],
        },
      },
      { heading: 'Every scope, live', intro: 'Each example runs on pretend data. Press its action to replay it.', block: { type: 'stories', file: loadingStories } },
      { heading: 'Timing', minor: true, intro: 'The tokens behind both tracks; components read them, never literals.', block: { type: 'token-rows', group: 'duration', match: 'indicator|shimmer|confirm|commit' } },
    ],
  },
  componentPage(textStories),
  componentPage(headingStories),
  componentPage(linkStories),
  ((p: Page): Page => ({
    ...p,
    summary: 'One icon fundamental with semantic names, drawn by the library’s own outline set or by a curated MIT or Apache-2.0 library, chosen per theme.',
    blocks: [
      { heading: 'Choose the icon library', intro: 'Pick a library and its style: every icon on every page follows, kept in this browser only. Each name below is drawn live, with the library’s own name for it; where a style lacks one, the library’s first style draws it, then the library’s own.', block: { type: 'icon-chooser' } },
      { heading: 'Libraries', intro: 'Free libraries under MIT or Apache-2.0 only, each licence read from its official source, each subset to the names the library uses.', block: { type: 'icon-sets' } },
      { heading: 'Names by library', minor: true, intro: 'How each semantic name maps, and where a library has a gap.', block: { type: 'icon-coverage' } },
      ...p.blocks,
    ],
  }))(componentPage(iconStories)),
  componentPage(buttonStories),
  componentPage(buttonGroupStories),
  componentPage(menuButtonStories),
  componentPage(segmentedControlStories),
  componentPage(alignmentPickerStories),
  componentPage(switchStories),
  componentPage(fieldStories),
  componentPage(textFieldStories),
  componentPage(numberFieldStories),
  componentPage(textAreaStories),
  componentPage(selectStories),
  componentPage(sliderStories),
  componentPage(ratingStories),
  componentPage(checkboxStories),
  componentPage(checkboxGroupStories),
  componentPage(radioGroupStories),
  componentPage(revealStories),
  componentPage(morphStories),
  componentPage(colourPickerStories),
  componentPage(dateFieldStories),
  componentPage(calendarStories),
  componentPage(datePickerStories),
  componentPage(dateRangePickerStories),
  componentPage(timeFieldStories),
  componentPage(fileUploadStories),
  componentPage(listItemStories),
  componentPage(avatarStories),
  componentPage(avatarGroupStories),
  componentPage(personaStories),
  componentPage(imageStories),
  componentPage(tooltipStories),
  componentPage(popoverStories),
  componentPage(badgeStories),
  componentPage(chipStories),
  componentPage(chipGroupStories),
  componentPage(progressStories),
  componentPage(skeletonStories),
  componentPage(codeStories),
  componentPage(listStories),
  componentPage(stackStories),
  componentPage(clusterStories),
  componentPage(gridStories),
  componentPage(scrollAreaStories),
  componentPage(navigationStories),
  componentPage(treeViewStories),
  componentPage(titleBarStories),
  componentPage(breadcrumbsStories),
  componentPage(tabsStories),
  componentPage(paginationStories),
  componentPage(footerStories),
  componentPage(dialogStories),
  componentPage(sheetStories),
  componentPage(notificationsStories),
  componentPage(alertStories),
  componentPage(errorSummaryStories),
  componentPage(emptyStateStories),
  componentPage(pageHeaderStories),
  componentPage(sectionStories),
  componentPage(codeBlockStories),
  componentPage(dataTableStories),
  componentPage(cardStories),
  componentPage(statisticStories),
  componentPage(accordionStories),
  componentPage(descriptionListStories),
  componentPage(agendaStories),
  componentPage(boardStories),
  componentPage(carouselStories),
  componentPage(imageGridStories),
  componentPage(lightboxStories),
  componentPage(canvasStories),
  componentPage(mediaPlayerStories),
  componentPage(quoteStories),
  componentPage(exampleStories),
  componentPage(indexListStories),
  componentPage(contextMatrixStories),
  componentPage(rowListStories),
  componentPage(tokenSpecimenStories),
  componentPage(paneStories),
  componentPage(floatingBarStories),
  componentPage(toolbarStories),
  componentPage(propertySectionStories),
  componentPage(propertyRowStories),
  componentPage(stackedBarStories),
  componentPage(colourFieldStories),
  componentPage(tagInputStories),
  componentPage(inlineEditStories),
  componentPage(mentionsStories),
  componentPage(allocationSliderStories),
  componentPage(gradientEditorStories),
  componentPage(chatMessageStories),
  componentPage(messageActionsStories),
  componentPage(chatThinkingStories),
  componentPage(composerStories),
  componentPage(imageGenerationStories),
  componentPage(conversationListStories),
  componentPage(siteHeaderStories),
  componentPage(screenPreviewStories),
  {
    id: 'library-layout',
    section: 'layouts',
    title: 'LibraryLayout',
    summary: entryOf('LibraryLayout')?.summary ?? '',
    file: entryOf('LibraryLayout')?.file,
    blocks: [
      { heading: 'Preview', minor: true, block: { type: 'note', text: 'This app is its live specimen: widen the window past the medium breakpoint and the navigation moves from a disclosure to a side region.' } },
      ...contract('LibraryLayout'),
    ],
  },
  {
    id: 'page-layout',
    section: 'layouts',
    title: 'PageLayout',
    summary: entryOf('PageLayout')?.summary ?? '',
    file: entryOf('PageLayout')?.file,
    blocks: [
      { heading: 'Preview', minor: true, block: { type: 'note', text: 'Every page in this app is its live specimen: a PageHeader, then sections spaced as their own groups.' } },
      ...contract('PageLayout'),
    ],
  },
  componentPage(listDetailStories),
  componentPage(chatLayoutStories),
  componentPage(editorLayoutStories),
  componentPage(appLayoutStories),
  componentPage(siteLayoutStories),
  componentPage(heroStories),
  {
    id: 'proposed-layouts',
    section: 'layouts',
    title: 'Proposed layouts',
    summary: 'Standard layouts the library could offer. None is built yet: each waits for the owner to pick it.',
    source: { label: 'The tier definitions and this list: the foundation plan', href: docsHref('foundation.md') },
    blocks: [
      {
        heading: 'Named by the owner',
        intro: 'Each is a view or a section with named regions, made from compounds and fundamentals and defined once.',
        block: {
          type: 'points',
          items: [
            'Article: a title block, the reading column and an aside for contents or related links.',
            'List of articles: a heading, filters and a list or grid of article summaries with paging.',
            'List of sponsors: a heading and logo tiles grouped by level.',
            'Image gallery with a hero image: one large image, then a grid of the rest that opens in a viewer.',
            'Bento: tiles of different sizes on one grid, each a region of its own.',
            'Documentation: navigation, the reading column and an on-this-page aside, like this app.',
            'E-commerce: a product list with filters, and a product page with gallery, details and purchase.',
            'Checkout: the steps, the form for the current step and an order summary that stays in view.',
            'First-run onboarding: one step at a time with progress, a skip and a way back.',
          ],
        },
      },
      {
        heading: 'Also worth considering',
        minor: true,
        intro: 'Common screens in many products; listed so the owner can include or drop them.',
        block: {
          type: 'points',
          items: [
            'Dashboard: a header and a grid of summary sections.',
            'Settings: grouped settings with a section list beside them.',
            'Sign-in: one centred form with the product’s identity.',
            'Search results: a query field, filters and the results list.',
            'Error and empty page: what happened and the way forward.',
          ],
        },
      },
    ],
  },
  ...templatePages,
]));

/** Routes that moved keep working: Radius and border is part of Shape; Layers and breakpoints is now Elevation and layering (Q78). */
const moved: Record<string, string> = { radius: 'shape', layers: 'elevation', 'chat-app': 'chat-chat' };

export const pageById = (id: string) => pages.find((p) => p.id === (moved[id] ?? id));
export const sectionById = (id: SectionId) => sections.find((s) => s.id === id)!;
export const pagesIn = (id: SectionId) => pages.filter((p) => p.section === id);

const navLabel = (p: Page) => (p.id === 'overview' ? 'Overview' : p.section === 'templates' && p.family ? p.title.replace(/^[^:]+: /, '') : p.title);
const navItem = (p: Page) => ({ id: p.id, label: navLabel(p), href: `#/${p.id}` });

/**
 * The navigation as data: one group per tier, headed by its title; in each, its families in the order above (a family
 * id no family defines is listed under that id, so nothing goes missing), then the pages that have no family.
 */
/**
 * The Templates navigation (Q66, Q67): template → Home, then each section → its screens, where a flow of 3 or more
 * screens is a group of its own and a shorter flow's screens sit in the section; groups hold 3–5 items
 * (`check:content`). Only what's built is listed.
 */
const templateNav = (t: Template): NavigationFamily => {
  const page = (id: string) => pageById(`${t.id}-${id}`);
  const homePage = t.home ? page(t.home) : undefined;
  const sectionsBuilt = t.sections
    .map((sec) => ({
      id: `templates.${t.id}.${sec.id}`,
      title: sec.title,
      items: sec.flows.flatMap((f): (NavigationItem | NavigationFamily)[] => {
        const screens = f.screens.filter((id) => id !== t.home);
        const built = screens.map(page).filter((p): p is Page => !!p);
        if (!built.length) return [];
        if (screens.length < 3) return built.map(navItem);
        return [{ id: `templates.${t.id}.${sec.id}.${f.id}`, title: f.title, items: built.map(navItem) }];
      }),
    }))
    .filter((sec) => sec.items.length);
  const parts = pageById(`${t.id}-parts`);
  return { id: `templates.${t.id}`, title: t.title, items: [...(homePage ? [{ ...navItem(homePage), label: 'Home' }] : []), ...sectionsBuilt, ...(parts ? [navItem(parts)] : [])] };
};

export const navGroups: NavigationGroup[] = sections.map((s) => {
  if (s.id === 'templates') {
    const overview = pageById('templates');
    return { id: s.id, title: s.title, items: [...(overview ? [navItem(overview)] : []), ...templates.filter((t) => t.layouts.some((l) => !l.planned)).map(templateNav)] };
  }
  const inSection = pagesIn(s.id);
  const ids = [...new Set(inSection.map((p) => p.family).filter((f): f is string => !!f))];
  const all = families;
  const ordered = [...all.filter((f) => f.section === s.id && ids.includes(f.id)), ...ids.filter((id) => !all.some((f) => f.section === s.id && f.id === id)).map((id) => ({ id, section: s.id, title: id }))];
  return {
    id: s.id,
    title: s.title,
    items: [
      ...ordered.map((f) => ({ id: `${s.id}.${f.id}`, title: f.title, items: inSection.filter((p) => p.family === f.id).map(navItem) })),
      ...inSection.filter((p) => !p.family).map(navItem),
    ],
  };
});
