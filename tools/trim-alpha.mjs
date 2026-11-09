#!/usr/bin/env node
// Prepares a generated image for the layout (Q84, .github/skills/image-prompting/SKILL.md):
// trims fully transparent margins, resizes to the intended display size, and writes an optimized file.
//
//   node ./tools/trim-alpha.mjs IN.png -o OUT.webp [--width CSS_PX] [--height CSS_PX] [--density 2]
//        [--fit inside|cover|contain] [--format webp|png|avif|jpeg] [--quality 82] [--threshold 8]
//        [--pad CSS_PX] [--no-trim] [--json]
//   node ./tools/trim-alpha.mjs IN.png --report      alpha fractions and the trim box, writes nothing
//
// --width/--height are the CSS pixels the image is shown at; the file is written at that size times --density,
// so every image in a set has the same visual resolution. Opaque images are never trimmed.
import sharp from 'sharp';
import { statSync, mkdirSync } from 'node:fs';
import { dirname, extname } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const valued = new Set(['-o', '--out', '--width', '--height', '--density', '--fit', '--format', '--quality', '--threshold', '--pad']);
const input = args.find((a, i) => !a.startsWith('-') && !valued.has(args[i - 1]));
if (!input || flag('help')) {
  console.log('Usage: node ./tools/trim-alpha.mjs IN.png -o OUT.webp [--width N] [--height N] [--density 2] [--fit inside|cover|contain] [--format webp|png|avif|jpeg] [--quality 82] [--threshold 8] [--pad N] [--no-trim] [--report] [--json]');
  process.exit(input ? 0 : 1);
}

const threshold = Number(opt('threshold', 8));
const density = Number(opt('density', 1));
const cssWidth = opt('width') ? Number(opt('width')) : undefined;
const cssHeight = opt('height') ? Number(opt('height')) : undefined;
const pad = Math.round(Number(opt('pad', 0)) * density);
const fit = opt('fit', 'inside');
const quality = Number(opt('quality', 82));
const out = args.includes('-o') ? args[args.indexOf('-o') + 1] : opt('out');

const source = sharp(input, { failOn: 'error' });
const meta = await source.metadata();
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

let transparent = 0;
let partial = 0;
let left = info.width;
let top = info.height;
let right = -1;
let bottom = -1;
for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const a = data[(y * info.width + x) * 4 + 3];
    if (a <= 4) transparent += 1;
    else if (a < 250) partial += 1;
    if (a > threshold) {
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
}
const total = info.width * info.height;
const hasAlpha = Boolean(meta.hasAlpha) && transparent > 0;
if (right < 0) {
  console.error('trim-alpha: every pixel is transparent; nothing to keep.');
  process.exit(1);
}
const box = { left, top, width: right - left + 1, height: bottom - top + 1 };
const report = {
  input,
  size: `${info.width}x${info.height}`,
  alpha: {
    real: hasAlpha,
    transparent: +(transparent / total).toFixed(3),
    partial: +(partial / total).toFixed(3),
    opaque: +((total - transparent - partial) / total).toFixed(3),
  },
  trim: hasAlpha ? box : null,
};

if (flag('report') || !out) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

let pipeline = sharp(input);
const trimming = hasAlpha && !flag('no-trim');
if (trimming) pipeline = pipeline.extract(box);
const base = trimming ? box : { width: info.width, height: info.height };

if (cssWidth || cssHeight) {
  const width = cssWidth ? Math.round(cssWidth * density) - pad * 2 : undefined;
  const height = cssHeight ? Math.round(cssHeight * density) - pad * 2 : undefined;
  if ((width && width > base.width) || (height && height > base.height)) {
    console.warn(`trim-alpha: upscaling ${base.width}x${base.height} to ${width ?? '?'}x${height ?? '?'}; generate at a larger size instead.`);
  }
  pipeline = pipeline.resize({ width, height, fit, background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' });
}
if (pad > 0) pipeline = pipeline.extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } });

const format = opt('format', extname(out).slice(1).replace('jpg', 'jpeg') || 'webp');
if (format === 'webp') pipeline = pipeline.webp({ quality, alphaQuality: 90, effort: 6, smartSubsample: true });
else if (format === 'avif') pipeline = pipeline.avif({ quality: Math.round(quality * 0.7), effort: 6 });
else if (format === 'jpeg') pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality, mozjpeg: true });
else if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9, palette: false });
else {
  console.error(`trim-alpha: unknown format "${format}".`);
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });
const written = await pipeline.toFile(out);
const result = {
  ...report,
  output: out,
  outputSize: `${written.width}x${written.height}`,
  displaySize: `${Math.round(written.width / density)}x${Math.round(written.height / density)}`,
  density,
  format,
  bytes: statSync(out).size,
  inputBytes: statSync(input).size,
};
if (flag('json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log(
    `trim-alpha: ${input} ${report.size}${trimming ? ` -> trimmed ${box.width}x${box.height}` : hasAlpha ? ' (trim skipped)' : ' (opaque, no trim)'}` +
      ` -> ${out} ${result.outputSize} (${result.displaySize} CSS px at ${density}x), ${format}, ${(result.bytes / 1024).toFixed(1)} KB (from ${(result.inputBytes / 1024).toFixed(1)} KB)`,
  );
}
