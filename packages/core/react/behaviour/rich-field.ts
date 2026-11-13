/** A rich field's portable Markdown subset. Raw HTML is always text; DOM input is reduced to safe paragraphs, lists and marks. */
export type RichOperation = 'bold' | 'italic' | 'strikethrough' | 'code' | 'link' | 'bulleted' | 'numbered' | 'outdent' | 'indent';
export const richGroups: readonly (readonly RichOperation[])[] = [
  ['bold', 'italic', 'strikethrough'], ['code', 'link'], ['bulleted', 'numbered', 'outdent', 'indent'],
];

export function richShortcut(e: { key: string; code: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }): RichOperation | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  if (e.shiftKey) {
    if (e.key.toLowerCase() === 'x') return 'strikethrough';
    if (e.code === 'Digit8' || e.code === 'Numpad8') return 'bulleted';
    if (e.code === 'Digit7' || e.code === 'Numpad7') return 'numbered';
    return null;
  }
  const keys: Partial<Record<string, RichOperation>> = { b: 'bold', i: 'italic', e: 'code', k: 'link', '[': 'outdent', ']': 'indent' };
  return keys[e.key.toLowerCase()] ?? null;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const escapeMarkdown = (s: string) => s.replace(/[\u00a0]/g, ' ').replace(/[\\`*_[\]~<>]/g, '\\$&');
export const safeRichHref = (href: string): boolean => /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href) && !/[\u0000-\u0020\u007f]/.test(href);

function inlineHtml(text: string): string {
  let html = '';
  for (let i = 0; i < text.length;) {
    if (text[i] === '\\' && i + 1 < text.length) { html += escapeHtml(text[i + 1]); i += 2; continue; }
    if (text[i] === '`') {
      const marker = /^`+/.exec(text.slice(i))![0], end = text.indexOf(marker, i + marker.length);
      if (end >= 0) { html += `<code>${escapeHtml(text.slice(i + marker.length, end))}</code>`; i = end + marker.length; continue; }
    }
    const marker = ['**', '__', '~~', '*', '_'].find(m => text.startsWith(m, i));
    if (marker) {
      const end = text.indexOf(marker, i + marker.length);
      if (end > i + marker.length) {
        const tag = marker === '~~' ? 'del' : marker.length === 2 ? 'strong' : 'em';
        html += `<${tag}>${inlineHtml(text.slice(i + marker.length, end))}</${tag}>`;
        i = end + marker.length; continue;
      }
    }
    if (text[i] === '[') {
      const close = text.indexOf('](', i + 1);
      if (close >= 0) {
        let depth = 1, end = close + 2;
        for (; end < text.length && depth; end++) {
          if (text[end] === '\\') { end++; continue; }
          if (text[end] === '(') depth++;
          if (text[end] === ')') depth--;
        }
        if (!depth) {
          const href = text.slice(close + 2, end - 1).replace(/\\([()\\])/g, '$1');
          if (safeRichHref(href)) {
            html += `<a href="${escapeHtml(href)}">${inlineHtml(text.slice(i + 1, close))}</a>`;
            i = end; continue;
          }
        }
      }
    }
    html += text[i] === '\n' ? '<br>' : escapeHtml(text[i]);
    i++;
  }
  return html;
}

/** Markdown to safe editable HTML, with arbitrary nested unordered/ordered lists. */
export function richFieldHtml(markdown: string): string {
  if (!markdown.trim()) return '';
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const item = (line: string) => /^([ \t]*)([-+*]|\d+[.)]) +(.*)$/.exec(line);
  const indent = (s: string) => s.replace(/\t/g, '    ').length;
  let at = 0;
  const list = (depth: number): string => {
    const first = item(lines[at])!, ordered = /^\d/.test(first[2]), tag = ordered ? 'ol' : 'ul';
    let html = `<${tag}>`;
    while (at < lines.length) {
      const row = item(lines[at]);
      if (!row || indent(row[1]) !== depth || /^\d/.test(row[2]) !== ordered) break;
      html += `<li>${inlineHtml(row[3])}`; at++;
      while (at < lines.length) {
        const next = item(lines[at]);
        if (next && indent(next[1]) > depth) html += list(indent(next[1]));
        else if (lines[at].trim() && !next && indent(/^[ \t]*/.exec(lines[at])![0]) > depth) {
          html += `<br>${inlineHtml(lines[at].trimStart())}`; at++;
        } else break;
      }
      html += '</li>';
    }
    return `${html}</${tag}>`;
  };
  let html = '';
  while (at < lines.length) {
    if (!lines[at].trim()) { at++; continue; }
    const row = item(lines[at]);
    if (row) { html += list(indent(row[1])); continue; }
    const paragraph: string[] = [];
    while (at < lines.length && lines[at].trim() && !item(lines[at])) paragraph.push(lines[at++]);
    html += `<p>${inlineHtml(paragraph.join('\n'))}</p>`;
  }
  return html;
}

/** A minimal DOM-shaped node keeps the serializer independent of browser globals. */
export interface RichFieldNode {
  nodeType: number;
  nodeName: string;
  textContent: string | null;
  childNodes: ArrayLike<RichFieldNode>;
  getAttribute?: (name: string) => string | null;
}
const skipped = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'TEMPLATE']);
const children = (n: RichFieldNode) => Array.from(n.childNodes);
const isList = (n: RichFieldNode) => n.nodeName === 'UL' || n.nodeName === 'OL';
function inlineMarkdown(n: RichFieldNode): string {
  if (n.nodeType === 3) return escapeMarkdown(n.textContent ?? '');
  if (skipped.has(n.nodeName)) return '';
  if (n.nodeName === 'BR') return '\n';
  const value = children(n).map(inlineMarkdown).join('');
  if (!value) return '';
  if (n.nodeName === 'CODE') {
    const text = n.textContent ?? '', fence = '`'.repeat(Math.max(0, ...[...text.matchAll(/`+/g)].map(m => m[0].length)) + 1);
    return `${fence}${text}${fence}`;
  }
  const marker = ({ B: '**', STRONG: '**', I: '*', EM: '*', S: '~~', STRIKE: '~~', DEL: '~~' } as Record<string, string>)[n.nodeName];
  if (marker) return value.replace(/^(\s*)([\s\S]*?)(\s*)$/, (_, before: string, middle: string, after: string) => `${before}${marker}${middle}${marker}${after}`);
  if (n.nodeName === 'A') {
    const href = n.getAttribute?.('href') ?? '';
    if (safeRichHref(href)) return `[${value}](${href.replace(/[\\()]/g, '\\$&')})`;
  }
  return value;
}

/** Editable or pasted DOM to canonical Markdown; unsupported containers keep their words, never their attributes. */
export function richFieldMarkdown(root: RichFieldNode): string {
  const list = (node: RichFieldNode, depth: number): string => children(node).filter(n => n.nodeName === 'LI').map((li, index) => {
    const nodes = children(li), value = nodes.filter(n => !isList(n)).map(inlineMarkdown).join('').trim();
    const prefix = `${'  '.repeat(depth)}${node.nodeName === 'OL' ? `${index + 1}.` : '-'} `;
    return prefix + value.replace(/\n/g, `\n${' '.repeat(prefix.length)}`) +
      nodes.filter(isList).map(n => `\n${list(n, depth + 1)}`).join('');
  }).join('\n');
  const blocks = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']);
  const result: string[] = [];
  let inline = '';
  const flush = () => { if (inline.trim()) result.push(inline.trim()); inline = ''; };
  for (const n of children(root)) {
    if (skipped.has(n.nodeName)) continue;
    if (isList(n)) { flush(); result.push(list(n, 0)); }
    else if (blocks.has(n.nodeName)) { flush(); const value = richFieldMarkdown(n); if (value) result.push(value); }
    else inline += inlineMarkdown(n);
  }
  flush();
  return result.join('\n\n');
}
