/**
 * Shape-only scoring for free-hand Hanzi (no stroke order or direction).
 *
 * Both the learner's ink and the reference character (hanzi-writer stroke medians)
 * are normalised to their own bounding box and rasterised onto a small grid, so
 * size and position on the pad don't matter. The score is the F1 of:
 *   precision — how much of the learner's ink lies near the reference shape
 *   recall    — how much of the reference shape is covered by the learner's ink
 */

export type Pt = [number, number];

const N = 48; // grid resolution
const PAD = 3; // empty cells around the glyph
const INK_RADIUS = 1; // stroke thickness in cells
const TOLERANCE = 1; // dilation radius in cells (calibrated: wrong chars ≤ ~55, messy-but-right ≥ ~70)

function bbox(strokes: Pt[][]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes)
    for (const [x, y] of s) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  return { minX, minY, w: maxX - minX, h: maxY - minY };
}

function stamp(mask: Uint8Array, cx: number, cy: number, r: number) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || y < 0 || x >= N || y >= N) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.25) mask[y * N + x] = 1;
    }
}

function rasterize(strokes: Pt[][]) {
  const mask = new Uint8Array(N * N);
  const { minX, minY, w, h } = bbox(strokes);
  const scale = (N - 2 * PAD) / Math.max(w, h, 1e-6);
  const ox = (N - w * scale) / 2;
  const oy = (N - h * scale) / 2;
  const map = ([x, y]: Pt): Pt => [(x - minX) * scale + ox, (y - minY) * scale + oy];

  for (const stroke of strokes) {
    const pts = stroke.map(map);
    if (pts.length === 1) stamp(mask, pts[0][0], pts[0][1], INK_RADIUS);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.5));
      for (let k = 0; k <= steps; k++) stamp(mask, x0 + ((x1 - x0) * k) / steps, y0 + ((y1 - y0) * k) / steps, INK_RADIUS);
    }
  }
  return mask;
}

function dilate(mask: Uint8Array, r: number) {
  const out = new Uint8Array(N * N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) if (mask[y * N + x]) stamp(out, x, y, r);
  return out;
}

function overlap(a: Uint8Array, b: Uint8Array) {
  let hit = 0, total = 0;
  for (let i = 0; i < a.length; i++)
    if (a[i]) {
      total++;
      if (b[i]) hit++;
    }
  return total ? hit / total : 0;
}

/** hanzi-writer medians use a 1024 box with y pointing up (baseline at 900). */
export function mediansToPoints(medians: number[][][]): Pt[][] {
  return medians.map((s) => s.map(([x, y]) => [x, 900 - y] as Pt));
}

export function scoreShape(user: Pt[][], reference: Pt[][]): number {
  // Point count doesn't matter: a quick flick can be just two points (start + end).
  const ink = user.filter((s) => s.length > 0);
  if (ink.length === 0 || reference.length === 0) return 0;

  const u = rasterize(ink);
  const t = rasterize(reference);
  const precision = overlap(u, dilate(t, TOLERANCE));
  const recall = overlap(t, dilate(u, TOLERANCE));
  if (precision + recall === 0) return 0;
  return Math.round((200 * precision * recall) / (precision + recall));
}
