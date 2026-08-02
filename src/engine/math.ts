export interface Vec2 {
  x: number;
  y: number;
}

export const v = (x: number, y: number): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });

export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });

export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });

export const len = (a: Vec2): number => Math.hypot(a.x, a.y);

export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;

export const norm = (a: Vec2): Vec2 => {
  const l = len(a);
  return l > 1e-9 ? { x: a.x / l, y: a.y / l } : { x: 1, y: 0 };
};

export const perp = (a: Vec2): Vec2 => ({ x: -a.y, y: a.x });

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const angleToVec = (a: number): Vec2 => ({ x: Math.cos(a), y: Math.sin(a) });

export const vecToAngle = (a: Vec2): number => Math.atan2(a.y, a.x);

/** Signed, wrapped angle difference `a - b` in [-PI, PI]. */
export const angleDiff = (a: number, b: number): number => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export const rotateVec = (a: Vec2, angle: number): Vec2 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
};

export interface SegIntersectResult {
  hit: boolean;
  t: number;
  u: number;
}

/** 2D segment-segment intersection (inclusive of endpoints). */
export function segIntersect(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): SegIntersectResult {
  const d1 = sub(a2, a1);
  const d2 = sub(b2, b1);
  const denom = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(denom) < 1e-9) return { hit: false, t: 0, u: 0 };
  const d = sub(b1, a1);
  const t = (d.x * d2.y - d.y * d2.x) / denom;
  const u = (d.x * d1.y - d.y * d1.x) / denom;
  return { hit: t >= 0 && t <= 1 && u >= 0 && u <= 1, t, u };
}

export interface PointSegResult {
  d: number;
  t: number;
  closest: Vec2;
}

/** Distance from a point to a segment, with closest-point info. */
export function pointSegDist(p: Vec2, a: Vec2, b: Vec2): PointSegResult {
  const ab = sub(b, a);
  const l2 = ab.x * ab.x + ab.y * ab.y;
  const t = l2 > 0 ? clamp(((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2, 0, 1) : 0;
  const closest = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  return { d: dist(p, closest), t, closest };
}
