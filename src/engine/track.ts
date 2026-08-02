import type { Vec2 } from './math';
import { add, clamp, dist, norm, perp, pointSegDist, scale, sub, v } from './math';

export interface TrackTheme {
  ground: string;
  curb: string;
  bg: string;
  label: string;
  start: string;
}

export interface DecorBox {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface TrackDef {
  id: string;
  nameKey: string;
  controlPoints: Vec2[];
  width: number;
  theme: TrackTheme;
  decor?: DecorBox[];
  itemSpawnCount?: number;
  samplesPerSegment?: number;
}

export interface StartLine {
  index: number;
  from: Vec2;
  to: Vec2;
  tangent: Vec2;
}

export interface Checkpoint {
  index: number;
  from: Vec2;
  to: Vec2;
  tangent: Vec2;
  arc: number;
}

export interface Track {
  id: string;
  nameKey: string;
  width: number;
  halfWidth: number;
  centerline: Vec2[];
  leftEdge: Vec2[];
  rightEdge: Vec2[];
  startLine: StartLine;
  checkpoints: Checkpoint[];
  itemSpawns: Vec2[];
  arcs: number[];
  segmentLengths: number[];
  totalLength: number;
  theme: TrackTheme;
  decor: DecorBox[];
}

export interface ClosestCenterline {
  index: number; // segment start point index
  t: number; // 0..1 along the segment
  d: number; // distance to the segment
  point: Vec2;
  arc: number; // arc length at the closest point
}

export interface BoundaryHit {
  d: number;
  point: Vec2;
  normal: Vec2;
}

function catmullRomPoint(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/** Closed Catmull-Rom loop over control points. */
function catmullRomClosed(pts: Vec2[], samplesPerSegment: number): Vec2[] {
  const out: Vec2[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let j = 0; j < samplesPerSegment; j++) {
      out.push(catmullRomPoint(p0, p1, p2, p3, j / samplesPerSegment));
    }
  }
  return out;
}

function pointAtArcInternal(
  centerline: Vec2[],
  arcs: number[],
  segmentLengths: number[],
  arc: number,
): { index: number; point: Vec2 } {
  const n = centerline.length;
  const total = arcs[n - 1] + segmentLengths[n - 1];
  const a = ((arc % total) + total) % total;
  let i = 0;
  for (i = 0; i < n - 1; i++) {
    if (a <= arcs[i + 1]) break;
  }
  const segLen = segmentLengths[i];
  const t = segLen > 0 ? clamp((a - arcs[i]) / segLen, 0, 1) : 0;
  const p0 = centerline[i];
  const p1 = centerline[(i + 1) % n];
  return { index: i, point: { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t } };
}

export function buildTrack(def: TrackDef): Track {
  const samplesPerSegment = def.samplesPerSegment ?? 24;
  const centerline = catmullRomClosed(def.controlPoints, samplesPerSegment);
  const n = centerline.length;
  const halfWidth = def.width / 2;

  // Cumulative arc lengths.
  const segmentLengths: number[] = [];
  const arcs: number[] = [0];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = centerline[i];
    const b = centerline[(i + 1) % n];
    const seg = dist(a, b);
    segmentLengths.push(seg);
    total += seg;
    if (i < n - 1) arcs.push(total);
  }

  // Offset edges and tangents.
  const leftEdge: Vec2[] = [];
  const rightEdge: Vec2[] = [];
  const tangents: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = centerline[i];
    const b = centerline[(i + 1) % n];
    const t = norm(sub(b, a));
    tangents.push(t);
    const nrm = perp(t);
    leftEdge.push(add(a, scale(nrm, halfWidth)));
    rightEdge.push(sub(a, scale(nrm, halfWidth)));
  }

  const startLine: StartLine = {
    index: 0,
    from: add(centerline[0], scale(perp(tangents[0]), halfWidth - 8)),
    to: sub(centerline[0], scale(perp(tangents[0]), halfWidth - 8)),
    tangent: tangents[0],
  };

  const checkpointFractions = [0.25, 0.5, 0.75];
  const checkpoints: Checkpoint[] = checkpointFractions.map((frac, i) => {
    const arc = frac * total;
    const { index, point } = pointAtArcInternal(centerline, arcs, segmentLengths, arc);
    const t = tangents[index];
    return {
      index: i,
      from: add(point, scale(perp(t), halfWidth - 8)),
      to: sub(point, scale(perp(t), halfWidth - 8)),
      tangent: t,
      arc,
    };
  });

  const spawnCount = def.itemSpawnCount ?? 6;
  const itemSpawns: Vec2[] = [];
  for (let i = 0; i < spawnCount; i++) {
    const frac = (i + 0.5) / spawnCount;
    const { point } = pointAtArcInternal(centerline, arcs, segmentLengths, frac * total);
    itemSpawns.push(point);
  }

  return {
    id: def.id,
    nameKey: def.nameKey,
    width: def.width,
    halfWidth,
    centerline,
    leftEdge,
    rightEdge,
    startLine,
    checkpoints,
    itemSpawns,
    arcs,
    segmentLengths,
    totalLength: total,
    theme: def.theme,
    decor: def.decor ?? [],
  };
}

/** Point on the centerline at a given arc length (wraps around the loop). */
export function pointAtArc(track: Track, arc: number): Vec2 {
  return pointAtArcInternal(track.centerline, track.arcs, track.segmentLengths, arc).point;
}

/** Closest point/progress info of a position relative to the centerline. */
export function closestCenterline(pos: Vec2, track: Track): ClosestCenterline {
  let best: ClosestCenterline | null = null;
  const n = track.centerline.length;
  for (let i = 0; i < n; i++) {
    const a = track.centerline[i];
    const b = track.centerline[(i + 1) % n];
    const res = pointSegDist(pos, a, b);
    if (!best || res.d < best.d) {
      best = {
        index: i,
        t: res.t,
        d: res.d,
        point: res.closest,
        arc: track.arcs[i] + res.t * track.segmentLengths[i],
      };
    }
  }
  return best as ClosestCenterline;
}

/** Arc length at the closest centerline point (0..totalLength). */
export function arcAt(pos: Vec2, track: Track): number {
  return closestCenterline(pos, track).arc;
}

/** Nearest track boundary (left/right edge) segment hit. */
export function nearestBoundary(pos: Vec2, track: Track): BoundaryHit {
  let bestD = Infinity;
  let bestPoint: Vec2 = pos;
  let bestNormal: Vec2 = v(0, 0);
  for (const edge of [track.leftEdge, track.rightEdge]) {
    for (let i = 0; i < edge.length; i++) {
      const a = edge[i];
      const b = edge[(i + 1) % edge.length];
      const res = pointSegDist(pos, a, b);
      if (res.d < bestD) {
        bestD = res.d;
        bestPoint = res.closest;
        const seg = sub(b, a);
        const nrm = norm(perp(seg));
        const d = dist(pos, res.closest);
        bestNormal = d > 1e-6 ? norm(sub(pos, res.closest)) : nrm;
      }
    }
  }
  return { d: bestD, point: bestPoint, normal: bestNormal };
}
