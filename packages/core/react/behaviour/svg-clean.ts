/**
 * SVG text cleaned for drawing inline (MP20, ID40): an allowlist of shape elements and attributes, so a file can't run
 * a script, load anything from elsewhere or move on its own. Ids are prefixed, so one file drawn twice on a page keeps
 * its gradients and clips apart. `design-library-check-svg` refuses the same things before a file ships; this is the
 * guard when the page draws it.
 */
const ELEMENTS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'defs', 'lineargradient', 'radialgradient', 'stop',
  'clippath', 'mask', 'pattern', 'symbol', 'use', 'title', 'desc', 'text', 'tspan', 'style',
]);
const EXTERNAL = /url\(\s*["']?(?!#)/i;

/** The cleaned `<svg>` element, or null when the text isn't SVG. */
export function cleanSvg(text: string, idPrefix: string): SVGSVGElement | null {
  if (typeof DOMParser === 'undefined') return null;
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) return null;
  const ids = new Map<string, string>();
  const all = [root, ...Array.from(root.querySelectorAll('*'))];
  for (const el of all) {
    const name = el.nodeName.toLowerCase();
    if (!ELEMENTS.has(name)) {
      el.remove();
      continue;
    }
    // A file's own styles may give shapes classes, never motion, imports or outside addresses.
    if (name === 'style' && /@import|@keyframes|animation|transition/i.test(el.textContent ?? '')) el.remove();
    if (name === 'style' && EXTERNAL.test(el.textContent ?? '')) el.remove();
    for (const attr of Array.from(el.attributes)) {
      const n = attr.name.toLowerCase();
      const v = attr.value;
      const href = n === 'href' || n === 'xlink:href';
      if (n.startsWith('on') || (href && !v.startsWith('#')) || EXTERNAL.test(v) || /javascript:/i.test(v)) el.removeAttribute(attr.name);
      else if (n === 'id') ids.set(v, `${idPrefix}-${v}`);
    }
  }
  if (ids.size) {
    const swap = (v: string) => v.replace(/url\(\s*["']?#([^"')]+)["']?\s*\)/g, (m, id) => (ids.has(id) ? `url(#${ids.get(id)})` : m));
    for (const el of [root, ...Array.from(root.querySelectorAll('*'))]) {
      for (const attr of Array.from(el.attributes)) {
        const n = attr.name.toLowerCase();
        if (n === 'id' && ids.has(attr.value)) el.setAttribute('id', ids.get(attr.value)!);
        else if ((n === 'href' || n === 'xlink:href') && ids.has(attr.value.slice(1))) el.setAttribute(attr.name, `#${ids.get(attr.value.slice(1))}`);
        else if (attr.value.includes('url(')) el.setAttribute(attr.name, swap(attr.value));
      }
      if (el.nodeName.toLowerCase() === 'style' && el.textContent) el.textContent = swap(el.textContent);
    }
  }
  return root as unknown as SVGSVGElement;
}
