import { readFileSync } from 'node:fs';

/** A picture file's pixel size (PNG, JPEG, WebP, GIF) or an SVG's viewBox size; `null` when it can't be read (AVIF). */
export function pictureSize(file) {
  const b = readFileSync(file);
  if (file.endsWith('.svg')) {
    const v = b.toString('utf8').match(/<svg\b[^>]*\sviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    return v ? { w: Number(v[1]), h: Number(v[2]) } : null;
  }
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.length > 10 && b.toString('ascii', 0, 3) === 'GIF') return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8L') return { w: 1 + (b.readUInt16LE(21) & 0x3fff), h: 1 + ((b.readUInt32LE(21) >> 14) & 0x3fff) };
    if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}
