/**
 * Captures a picked element as a revision target at the moment it's selected, so selection survives navigation. One
 * target carries everything an agent needs to know which thing a comment is about:
 * - the element: tag, role and accessible name, visible text, bounded sanitized HTML, a unique selector (@medv/finder),
 *   its ancestor path, its box and the viewport;
 * - its source: the React component stack with repository paths, lines and columns (react-grab; dev server only);
 * - its library identity: the nearest catalogue block (`data-rev`) and that block's owning files;
 * - its styling: the context it renders in and the design tokens its matched rules read, with resolved values;
 * - its page: route, headings above it, neighbours and any live state it's in.
 */
import { finder } from '@medv/finder';
import sourceFiles from 'virtual:library-source-files';
import {
  normalizeText, safeSourcePath, sha256,
  type ElementAnchor, type IdentityKey, type RevisionHeading, type TargetKind,
} from '../../revisions/contract.js';
import { getElementContext } from './instrument';
import { PAGES } from './target';

export interface Captured {
  /** route#anchor: one selection per element. */
  key: string;
  route: string;
  page: string;
  kind: TargetKind;
  anchor: string;
  identity: Partial<Record<IdentityKey, string>>;
  sourcePaths: string[];
  text: string;
  html: string;
  sha256: string;
  occurrence: number;
  matches: number;
  headings: RevisionHeading[];
  before: string;
  after: string;
  element?: ElementAnchor;
}

const MAX_HTML = 20000;
const MAX_TEXT = 4000;
const MAX_SOURCES = 16;
const clip = (value: string, max: number) => (value.length > max ? value.slice(0, max) : value);

/** A copy of the markup without scripts, handlers or revision chrome. Untrusted: never rendered back as HTML. */
function sanitized(element: Element) {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('script, style, iframe, object, embed, [data-app^="rev-"], [data-app^="pick"]').forEach((n) => n.remove());
  for (const node of [copy, ...copy.querySelectorAll('*')]) {
    for (const attribute of [...node.attributes]) if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
  }
  return copy.outerHTML;
}

/** The headings an element sits under: the page title, its section, and any heading inside an enclosing example. */
function headingsOf(element: Element, root: Element): RevisionHeading[] {
  const stack: RevisionHeading[] = [];
  for (const h of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    if (h === element || element.contains(h)) break;
    if (!(h.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)) break;
    const level = Number(h.tagName[1]);
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    stack.push({ level, text: clip(normalizeText(h.textContent ?? ''), 10000), id: h.id });
  }
  return stack.slice(-6);
}

const neighbour = (element: Element | null) => clip(normalizeText(element?.textContent ?? ''), 200);

/**
 * The component that rendered an element, read from React's own fiber (no symbolication, so it's instant): its owner
 * on the dev server, else the nearest component above it.
 */
export function componentOf(element: Element): string {
  const key = Object.keys(element).find((k) => k.startsWith('__reactFiber$'));
  type Fiber = { type?: unknown; return?: Fiber | null; _debugOwner?: Fiber | null };
  const fiber = key ? ((element as unknown as Record<string, Fiber>)[key] ?? null) : null;
  const owner = fiber?._debugOwner as { name?: string; type?: unknown } | null | undefined;
  if (owner?.name) return owner.name;
  for (let f = owner?.type ? (owner as Fiber) : fiber; f; f = f.return ?? null) {
    const t = f.type as { displayName?: string; name?: string } | string | undefined;
    if (typeof t === 'function' || (t && typeof t === 'object')) {
      const name = (t as { displayName?: string; name?: string }).displayName ?? (t as { name?: string }).name;
      if (name) return name;
    }
  }
  return '';
}

/** What the picker's label and announcement say about a candidate: its tag and the component that rendered it. */
export function candidateLabel(element: Element, component: string) {
  const tag = element.tagName.toLowerCase();
  return component ? `${tag} · ${component}` : tag;
}

const IMPLICIT_ROLES: Record<string, string> = {
  a: 'link', button: 'button', h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
  ul: 'list', ol: 'list', li: 'listitem', table: 'table', tr: 'row', td: 'cell', th: 'columnheader', nav: 'navigation',
  main: 'main', article: 'article', section: 'region', textarea: 'textbox', select: 'combobox', img: 'img', pre: 'code',
  details: 'group', summary: 'button', p: 'paragraph', code: 'code', label: 'label', header: 'banner',
};

function roleOf(element: Element) {
  const explicit = element.getAttribute('role');
  if (explicit) return explicit;
  if (element instanceof HTMLInputElement) return element.type === 'checkbox' ? 'checkbox' : element.type === 'radio' ? 'radio' : 'textbox';
  return IMPLICIT_ROLES[element.tagName.toLowerCase()] ?? '';
}

function nameOf(element: Element) {
  const byId = (ids: string) => ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
  const labelledBy = element.getAttribute('aria-labelledby');
  const label = element.getAttribute('aria-label')
    || (labelledBy && byId(labelledBy))
    || (element as HTMLInputElement).labels?.[0]?.textContent
    || element.getAttribute('alt')
    || element.getAttribute('title');
  if (label) return clip(normalizeText(label), 500);
  return /^(link|button|heading|tab|menuitem|option|switch|checkbox|cell|columnheader)$/.test(roleOf(element))
    ? clip(normalizeText(element.textContent ?? ''), 500)
    : '';
}

/** Attributes worth naming in a path or a selector: the library's own stable markers, never generated ids. */
const STABLE_ATTRIBUTES = new Set(['data-dl', 'data-dl-part', 'data-app', 'data-rev']);

function selectorOf(element: Element, root: Element) {
  try {
    const selector = finder(element, {
      root,
      attr: (name) => STABLE_ATTRIBUTES.has(name),
      idName: () => false,
      className: () => false,
      timeoutMs: 500,
    });
    if (root.querySelector(selector) === element) return selector;
  } catch {
    // finder gives up on very deep or repetitive markup; the ancestor path below still identifies the element.
  }
  return '';
}

function step(element: Element) {
  const tag = element.tagName.toLowerCase();
  const marker = ['data-dl', 'data-dl-part', 'data-app'].find((a) => element.hasAttribute(a));
  return marker ? `${tag}[${marker}="${element.getAttribute(marker)}"]` : tag;
}

function pathOf(element: Element, root: Element) {
  const path: string[] = [];
  for (let e: Element | null = element; e && e !== root; e = e.parentElement) path.unshift(step(e));
  return [step(root), ...path].slice(-16);
}

/** Live state the element is in, read from the library's own markers and ARIA, on the element and its ancestors. */
function statesOf(element: Element, root: Element) {
  const states = new Set<string>();
  for (let e: Element | null = element; e && root.contains(e); e = e.parentElement) {
    const busy = e.getAttribute('data-busy');
    if (busy) states.add(busy === 'on' || busy === 'ack' ? 'pending' : busy === 'done' ? 'confirmed' : busy);
    if (e.getAttribute('aria-busy') === 'true') states.add('busy');
    if (e.getAttribute('aria-invalid') === 'true') states.add('invalid');
    if (e.getAttribute('aria-disabled') === 'true' || e.hasAttribute('disabled')) states.add('disabled');
    if (e === element) {
      for (const a of ['aria-checked', 'aria-pressed', 'aria-expanded', 'aria-selected', 'aria-current']) {
        const v = e.getAttribute(a);
        if (v && v !== 'false') states.add(`${a.slice(5)}${v === 'true' ? '' : `=${v}`}`);
      }
      if (e instanceof HTMLDetailsElement) states.add(e.open ? 'open' : 'closed');
    }
  }
  return [...states].slice(0, 16);
}

const INHERITED = new Set(['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color-scheme']);

function* styleRules(rules: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) yield rule;
    if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) {
      if (rule instanceof CSSMediaRule && !window.matchMedia(rule.conditionText).matches) continue;
      yield* styleRules((rule as CSSGroupingRule).cssRules);
    }
  }
}

/**
 * The design tokens behind an element's look: every custom property its matched rules read, with the property it sets
 * and the value it resolves to here. Inherited properties (colour, type) come from the nearest ancestor that sets them.
 * Cascade order and specificity aren't modelled, so a property can list more than one token.
 */
function tokensOf(element: Element) {
  const found = new Map<string, ElementAnchor['tokens'][number]>();
  const needInherited = new Set(INHERITED);
  const sheets = [...document.styleSheets];
  for (let e: Element | null = element; e && found.size < 48; e = e.parentElement) {
    const own = e === element;
    if (!own && !needInherited.size) break;
    const setHere = new Set<string>();
    for (const sheet of sheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of styleRules(rules)) {
        let matches = false;
        try {
          matches = e.matches(rule.selectorText);
        } catch {
          continue;
        }
        if (!matches) continue;
        for (const property of rule.style) {
          if (property.startsWith('--') || (!own && !needInherited.has(property))) continue;
          const raw = rule.style.getPropertyValue(property);
          const tokens = raw.match(/--[a-z0-9-]+/gi);
          if (!tokens) continue;
          setHere.add(property);
          const value = clip(getComputedStyle(element).getPropertyValue(property).trim(), 200);
          for (const token of tokens) {
            const key = `${property}|${token}`;
            if (!found.has(key) && found.size < 48) found.set(key, { property, token, value, from: own ? 'element' : step(e) });
          }
        }
      }
    }
    for (const p of setHere) needInherited.delete(p);
  }
  return [...found.values()];
}

/** Maps react-grab's base file names to repository paths through the build-time list; an ambiguous name stays as it is. */
function repoPath(file: string) {
  const base = file.split(/[\\/]/).pop() ?? file;
  const matches = (sourceFiles as string[]).filter((f) => f.endsWith(`/${base}`));
  return matches.length === 1 ? matches[0] : base;
}

async function sourceOf(element: Element): Promise<Pick<ElementAnchor, 'component' | 'frames' | 'sourceNote'>> {
  if (!import.meta.env.DEV) return { component: componentOf(element), frames: [], sourceNote: 'This build has no source locations; use the selector and catalogue identity.' };
  try {
    const context = await getElementContext(element);
    const frames = context.stack
      .filter((f) => f.fileName && f.lineNumber)
      .slice(0, 12)
      .map((f) => ({
        component: clip(f.functionName ?? '', 200),
        file: repoPath(f.fileName!),
        line: f.lineNumber!,
        // react-grab's columns are 0-based; editors and agents count from 1.
        column: (f.columnNumber ?? 0) + 1,
      }));
    return { component: frames[0]?.component || componentOf(element), frames, sourceNote: frames.length ? '' : 'React reported no component stack for this element.' };
  } catch (error) {
    return { component: componentOf(element), frames: [], sourceNote: clip(`Source locations unavailable: ${error instanceof Error ? error.message : String(error)}`, 500) };
  }
}

export async function capture(element: HTMLElement, route: string, page: string, root: Element): Promise<Captured> {
  const block = element.closest<HTMLElement>('[data-rev]');
  const inPage = block && root.contains(block) ? block : null;
  const selector = selectorOf(element, root);
  const html = sanitized(element);
  const source = await sourceOf(element);
  const blockSources = inPage ? (inPage.dataset.revSources ?? '').split(' ').filter(Boolean) : [PAGES];
  const sourcePaths = [...new Set([...blockSources, ...source.frames.map((f) => f.file).filter(safeSourcePath)])].slice(0, MAX_SOURCES);
  const rect = element.getBoundingClientRect();
  const schemeAt = element.closest<HTMLElement>('[data-scheme]');
  const contrastAt = element.closest<HTMLElement>('[data-contrast]');
  const anchor = `element:${selector || pathOf(element, root).join(' > ')}`.slice(0, 1000);
  const truncated = html.length > MAX_HTML;
  const kept = clip(html, MAX_HTML);
  return {
    key: `${route}#${anchor}`,
    route,
    page,
    kind: 'element',
    anchor,
    identity: inPage ? JSON.parse(inPage.dataset.revIdentity ?? '{}') : { page: route },
    sourcePaths,
    text: clip(normalizeText(element.innerText ?? element.textContent ?? ''), MAX_TEXT),
    html: kept,
    sha256: await sha256(kept),
    occurrence: 1,
    matches: 1,
    headings: headingsOf(element, root),
    before: neighbour(element.previousElementSibling),
    after: neighbour(element.nextElementSibling),
    element: {
      tag: element.tagName.toLowerCase(),
      role: roleOf(element),
      name: nameOf(element),
      selector,
      path: pathOf(element, root),
      box: { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
      viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
      htmlTruncated: truncated,
      block: inPage?.dataset.rev ?? '',
      ...source,
      context: {
        scheme: schemeAt?.dataset.scheme ?? getComputedStyle(element).colorScheme,
        contrast: contrastAt?.dataset.contrast ?? 'standard',
        specimen: !!schemeAt && schemeAt !== document.documentElement,
      },
      tokens: tokensOf(element),
      states: statesOf(element, root),
    },
  };
}

/** A short human name for a target: its kind and identity, as the pane and the jump links show it. */
export function describe(t: { kind: TargetKind; identity: Partial<Record<IdentityKey, string>>; element?: Pick<ElementAnchor, 'tag' | 'component' | 'name'> }) {
  const kinds: Record<TargetKind, string> = {
    section: 'Section', heading: 'Heading', prose: 'Text', token: 'Token', 'matrix-row': 'Row', 'matrix-cell': 'Cell',
    example: 'Example', pane: 'Example pane', code: 'Code', prop: 'Prop', a11y: 'Accessibility note', key: 'Key',
    'built-from': 'Built from', 'index-item': 'Index entry', element: 'Element',
  };
  const { page, ...rest } = t.identity;
  const parts = Object.values(rest).filter(Boolean);
  const where = parts.length ? parts.join(' · ') : page;
  if (t.kind === 'element' && t.element) {
    const what = [`<${t.element.tag}>`, t.element.component, t.element.name && `“${clip(t.element.name, 40)}”`].filter(Boolean).join(' ');
    return `${what} in ${where}`;
  }
  return `${kinds[t.kind]}: ${where}`;
}
