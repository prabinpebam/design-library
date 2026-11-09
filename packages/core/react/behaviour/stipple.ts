/**
 * Tier 0 behaviour: the image-generation stipple field (Q58), rebuilt from the owner's watai "generating image" state:
 * dots laid out by Poisson-disk sampling, each sized by two layers of Perlin noise drifting in opposite directions, so
 * the field moves like slow smoke. Pure geometry and one paint function; the component owns the canvas and the clock.
 */

/** The settings the owner's watai project uses (its noise-animation defaults, without displacement or ripples). */
export const stippleSettings = {
  /** Noise time per frame at the reference rate. */
  speed: 0.005,
  referenceFps: 60,
  /** The noise grid's scale against the drawn size. */
  resolution: 0.9,
  layers: [
    { scale: 0.004, contrast: 3 },
    { scale: 0.009, contrast: 5 },
  ],
  /** Least distance between dots, in CSS pixels of the noise grid. */
  spacing: 5,
  minDot: 0.1,
  maxDot: 2,
} as const;

export interface StipplePoint {
  x: number;
  y: number;
  /** Noise coordinates for each layer (time is added per frame). */
  n: [number, number, number, number];
}

// Ken Perlin's improved noise, 2D, on a fixed permutation (a seeded shuffle), so every field looks the same.
const perm = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 1337;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return Uint8Array.from([...p, ...p]);
})();
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);
const grad = (h: number, x: number, y: number) => ((h & 1) === 0 ? x : -x) + ((h & 2) === 0 ? y : -y);

/** Perlin noise at (x, y), about -1 to 1. */
export function perlin2(x: number, y: number) {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const X = fx & 255;
  const Y = fy & 255;
  const dx = x - fx;
  const dy = y - fy;
  const u = fade(dx);
  const v = fade(dy);
  const a = perm[X] + Y;
  const b = perm[X + 1] + Y;
  return lerp(v, lerp(u, grad(perm[a], dx, dy), grad(perm[b], dx - 1, dy)), lerp(u, grad(perm[a + 1], dx, dy - 1), grad(perm[b + 1], dx - 1, dy - 1)));
}

/** Bridson's Poisson-disk sampling: points no closer than `spacing`, filling the area evenly (30 tries per point). */
export function poissonPoints(width: number, height: number, spacing: number, random: () => number = Math.random) {
  if (width <= 0 || height <= 0) return [];
  const cell = spacing / Math.SQRT2;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const grid: ({ x: number; y: number } | null)[] = new Array(cols * rows).fill(null);
  const points: { x: number; y: number }[] = [];
  const active: { x: number; y: number }[] = [];
  const add = (pt: { x: number; y: number }) => {
    points.push(pt);
    active.push(pt);
    grid[Math.floor(pt.x / cell) + Math.floor(pt.y / cell) * cols] = pt;
  };
  add({ x: random() * width, y: random() * height });
  const min = spacing * spacing;
  while (active.length) {
    const index = Math.floor(random() * active.length);
    const from = active[index];
    let found = false;
    for (let k = 0; k < 30 && !found; k++) {
      const angle = random() * 2 * Math.PI;
      const r = spacing * (1 + random());
      const x = from.x + Math.cos(angle) * r;
      const y = from.y + Math.sin(angle) * r;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const gx = Math.floor(x / cell);
      const gy = Math.floor(y / cell);
      let free = true;
      for (let ix = Math.max(0, gx - 2); free && ix <= Math.min(gx + 2, cols - 1); ix++) {
        for (let iy = Math.max(0, gy - 2); iy <= Math.min(gy + 2, rows - 1); iy++) {
          const n = grid[ix + iy * cols];
          if (n && (n.x - x) ** 2 + (n.y - y) ** 2 < min) {
            free = false;
            break;
          }
        }
      }
      if (free) {
        add({ x, y });
        found = true;
      }
    }
    if (!found) active.splice(index, 1);
  }
  return points;
}

/** Dots for a field `width` × `height` CSS pixels: sampled on a slightly smaller noise grid centred on it, drawn scaled up. */
export function layoutStipple(width: number, height: number, random: () => number = Math.random): StipplePoint[] {
  const { resolution, spacing, layers } = stippleSettings;
  const w = Math.trunc(width * resolution);
  const h = Math.trunc(height * resolution);
  if (w <= 0 || h <= 0) return [];
  return poissonPoints(w, h, spacing, random).map((pt) => {
    const px = Math.floor(Math.min(pt.x, w - 1)) - w / 2;
    const py = Math.floor(Math.min(pt.y, h - 1)) - (height * resolution) / 2;
    return { x: (pt.x * width) / w, y: (pt.y * height) / (height * resolution), n: [px * layers[0].scale, py * layers[0].scale, px * layers[1].scale, py * layers[1].scale] };
  });
}

/** Noise time after `elapsedMs`, independent of the screen's refresh rate. */
export function stippleTime(elapsedMs: number) {
  return stippleSettings.speed * (1 + (elapsedMs / 1000) * stippleSettings.referenceFps);
}

/** Dot radius at a point: the two layers (contrast-stretched, inverted) averaged; darker noise draws larger dots. */
export function stippleRadius(point: StipplePoint, time: number) {
  const [a, b] = stippleSettings.layers;
  const v1 = 255 - (((perlin2(point.n[0] + time, point.n[1] + time) + 1) * 127.5 - 128) * a.contrast + 128);
  const v2 = 255 - (((perlin2(point.n[2] - time, point.n[3] - time) + 1) * 127.5 - 128) * b.contrast + 128);
  const brightness = Math.max(0, Math.min(255, Math.floor((v1 + v2) / 2)));
  return stippleSettings.minDot + (1 - brightness / 255) * (stippleSettings.maxDot - stippleSettings.minDot);
}

/** Paints one frame: the field's colour, then every dot in one fill. */
export function paintStipple(ctx: CanvasRenderingContext2D, points: readonly StipplePoint[], width: number, height: number, time: number, colours: { field: string; dot: string }) {
  ctx.fillStyle = colours.field;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colours.dot;
  ctx.beginPath();
  for (const point of points) {
    const r = stippleRadius(point, time);
    ctx.moveTo(point.x + r, point.y);
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  }
  ctx.fill();
}
