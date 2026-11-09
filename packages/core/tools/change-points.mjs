// @ts-check
/**
 * Change points (IP26, F31, F58): every width or height at which core CSS changes a layout, read from the CSS itself.
 * One scanner for the check (`node tools/check-breakpoints.mjs`) and the library's Space page, so the table and the
 * rule can't disagree. Pure: give it file texts and the breakpoint set; it reads nothing on its own.
 *
 * The rule: a window width query (`@media (max-width: …)`, `min-width`, or a `matchMedia` string) uses a value from
 * `breakpoint.*`, or says why not in a comment right above it that starts with "tied to" (a sheet that goes solid when
 * it covers half the window is tied to its own width, not to a breakpoint). Container queries respond to the space a
 * component is given, so they are always allowed. Window height queries are allowed and listed.
 */

/** @typedef {{ path: string, text: string }} SourceFile */
/**
 * @typedef {object} ChangePoint
 * @property {string} file
 * @property {number} line
 * @property {'window' | 'container'} scope
 * @property {'width' | 'height'} axis
 * @property {'min' | 'max'} edge
 * @property {number} rem
 * @property {string | undefined} token the breakpoint it uses, such as `breakpoint.sm`
 * @property {string | undefined} reason the "tied to …" comment above an off-set value
 * @property {boolean} ok
 */

const QUERY = /@(media|container)\b([^{]*)\{/g;
const MATCH_MEDIA = /matchMedia\(\s*['"`]([^'"`]*)['"`]/g;
const FEATURE = /\((min|max)-(width|height)\s*:\s*([\d.]+)(rem|px|em)\s*\)/g;
/** Range syntax: `(width < 40rem)`, `(width >= 40rem)`. */
const RANGE = /\((width|height)\s*(<=?|>=?)\s*([\d.]+)(rem|px|em)\s*\)/g;

/**
 * @param {SourceFile[]} files CSS, TS or TSX sources
 * @param {Record<string, number>} breakpoints token path → value in rem, such as `{ 'breakpoint.sm': 40 }`
 * @returns {ChangePoint[]}
 */
export function changePoints(files, breakpoints) {
  const byValue = new Map(Object.entries(breakpoints).map(([path, rem]) => [rem, path]));
  /** @type {ChangePoint[]} */
  const out = [];
  for (const { path, text } of files) {
    const css = /\.css$/.test(path);
    const lines = text.split('\n');
    const found = css ? [...text.matchAll(QUERY)].map((m) => ({ at: m.index ?? 0, scope: m[1] === 'media' ? 'window' : 'container', condition: m[2] })) : [...text.matchAll(MATCH_MEDIA)].map((m) => ({ at: m.index ?? 0, scope: 'window', condition: m[1] }));
    for (const q of found) {
      const line = text.slice(0, q.at).split('\n').length;
      // The comment right above the query (a block comment may span lines; the last one before the query counts).
      const above = lines.slice(Math.max(0, line - 4), line - 1).join('\n');
      const reason = /\/\*\s*(tied to[^*]*)\*\//i.exec(above)?.[1].trim() ?? /\/\/\s*(tied to.*)$/im.exec(above)?.[1].trim();
      const features = [...q.condition.matchAll(FEATURE)].map((f) => ({ edge: f[1], axis: f[2], n: f[3], unit: f[4] }));
      for (const r of q.condition.matchAll(RANGE)) features.push({ edge: r[2].startsWith('<') ? 'max' : 'min', axis: r[1], n: r[3], unit: r[4] });
      for (const f of features) {
        const rem = f.unit === 'px' ? Number(f.n) / 16 : Number(f.n);
        const axis = /** @type {'width' | 'height'} */ (f.axis);
        const scope = /** @type {'window' | 'container'} */ (q.scope);
        const token = axis === 'width' && scope === 'window' ? byValue.get(rem) : undefined;
        const ok = scope === 'container' || axis === 'height' || !!token || !!reason;
        out.push({ file: path, line, scope, axis, edge: /** @type {'min' | 'max'} */ (f.edge), rem, token, reason, ok });
      }
    }
  }
  return out;
}
