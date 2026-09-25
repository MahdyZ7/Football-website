// Generates public/textures/crumpled-paper-{light,dark}.webp: seamless crumpled-paper tiles.
//
// Crumpled paper is flat facets separated by straight creases. Facets come from a
// Voronoi mosaic where every cell is a plane with its own random tilt (cell borders
// are the creases); a few broad folds add the overall sheet shape. Everything is
// measured on a torus so the tile wraps seamlessly, then lit by one raking light. Two exports from the same shading:
//  - light: pale grey for `multiply` over the light theme colour
//  - dark:  low-contrast mid grey for `soft-light` over the dark theme colour
// The site blends them over the theme colour (see .paper in styles/globals.css).
//
// Usage: node scripts/generate-paper-texture.mjs [--seed 42] [--size 1024]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : dflt;
};
const SIZE = arg('size', 1024);
let seed = arg('seed', 42) >>> 0;
// mulberry32: small, well-distributed PRNG (a plain LCG gave visibly biased fold angles).
const rand = () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const W = SIZE;
const H = SIZE;
const height = new Float32Array(W * H);
const wrap = (d, L) => d - L * Math.round(d / L);

function addFold({ cx, cy, angle, length, radius, amp }) {
  // Wrapped distances jump at half a tile; keep every fold inside that or it leaves a seam.
  const reach = W / 2 - 8;
  // Diagonally a fold reaches length/2 + 2*radius from its centre.
  if (length / 2 + 2 * radius > reach) length = Math.max(0, 2 * (reach - 2 * radius));
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const half = length / 2;
  for (let y = 0; y < H; y++) {
    const dy0 = wrap(y - cy, H);
    for (let x = 0; x < W; x++) {
      const dx0 = wrap(x - cx, W);
      // Position along and across the fold.
      const t = dx0 * ux + dy0 * uy;
      const n = -dx0 * uy + dy0 * ux;
      if (Math.abs(t) > half + radius) continue;
      const along = Math.max(0, Math.abs(t) - half);
      const d = Math.hypot(n, along);
      if (d >= radius) continue;
      // Taper toward the segment ends so creases fade out rather than stop dead.
      const taper = 1 - Math.min(1, Math.abs(t) / (half + radius)) ** 2;
      height[y * W + x] += amp * taper * (d - radius);
    }
  }
}

// A few long, gentle folds give the sheet its overall shape.
for (let i = 0; i < 6; i++) {
  addFold({ cx: rand() * W, cy: rand() * H, angle: rand() * Math.PI, length: W * 0.3,
    radius: 130 + rand() * 50, amp: (rand() < 0.5 ? -1 : 1) * (0.12 + rand() * 0.1) });
}

// Facets: a Voronoi mosaic on the torus, each cell a flat plane with its own tilt.
// Cell borders become the creases. Points are jittered on a grid so cells stay even.
const GRID = 14;
const pts = [];
for (let gy = 0; gy < GRID; gy++) {
  for (let gx = 0; gx < GRID; gx++) {
    pts.push({
      x: ((gx + 0.15 + rand() * 0.7) * W) / GRID,
      y: ((gy + 0.15 + rand() * 0.7) * H) / GRID,
      tx: (rand() - 0.5) * 0.8, // facet tilt (surface gradient)
      ty: (rand() - 0.5) * 0.8,
    });
  }
}

// Light: normals from the fold height field plus the facet tilt, one raking light.
const L = [-0.5, -0.6, 0.62];
const Ln = Math.hypot(...L);
const shade = new Float32Array(W * H);
let sum = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let d1 = Infinity, d2 = Infinity, best = null;
    for (const p of pts) {
      const dx = wrap(x - p.x, W), dy = wrap(y - p.y, H);
      const d = dx * dx + dy * dy;
      if (d < d1) { d2 = d1; d1 = d; best = p; } else if (d < d2) d2 = d;
    }
    const hx = height[y * W + ((x + 1) % W)] - height[y * W + ((x - 1 + W) % W)];
    const hy = height[((y + 1) % H) * W + x] - height[((y - 1 + H) % H) * W + x];
    const nx = -(hx + best.tx), ny = -(hy + best.ty), nz = 2;
    const nl = Math.hypot(nx, ny, nz);
    let s = (nx * L[0] + ny * L[1] + nz * L[2]) / (nl * Ln);
    // Darken a hair along the crease itself (where the two nearest cells meet).
    const edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 1.6) s -= 0.035 * (1 - edge / 1.6);
    shade[y * W + x] = s;
    sum += s;
  }
}
const mean = sum / (W * H);
let varSum = 0;
for (let i = 0; i < W * H; i++) varSum += (shade[i] - mean) ** 2;
const sd = Math.sqrt(varSum / (W * H));

const grain = new Float32Array(W * H).map(() => rand() - 0.5);
const variants = {
  light: { centre: 238, spread: 9, grain: 4 }, // multiply: 255 = no change, lower = shadow
  dark: { centre: 128, spread: 14, grain: 5 }, // soft-light: 128 = no change
};

mkdirSync(new URL('../public/textures/', import.meta.url), { recursive: true });
for (const [name, v] of Object.entries(variants)) {
  const out = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const z = (shade[i] - mean) / sd;
    out[i] = Math.max(0, Math.min(255, Math.round(v.centre + z * v.spread + grain[i] * v.grain)));
  }
  const file = new URL(`../public/textures/crumpled-paper-${name}.webp`, import.meta.url).pathname;
  await sharp(out, { raw: { width: W, height: H, channels: 1 } }).webp({ quality: 80 }).toFile(file);
  console.log(`wrote ${file}`);
}
