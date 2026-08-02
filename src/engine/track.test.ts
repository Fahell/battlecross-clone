import { describe, expect, it } from 'vitest';
import { arcAt, buildTrack, closestCenterline, nearestBoundary, pointAtArc } from './track';
import { cityTrackDef } from '../tracks/city';
import { dist, v } from './math';

const track = buildTrack(cityTrackDef);

describe('track.buildTrack', () => {
  it('produces a closed centerline and edges of equal length', () => {
    expect(track.centerline.length).toBeGreaterThan(50);
    expect(track.leftEdge.length).toBe(track.centerline.length);
    expect(track.rightEdge.length).toBe(track.centerline.length);
  });

  it('has a positive total length', () => {
    expect(track.totalLength).toBeGreaterThan(1500);
  });

  it('places the start line on the first segment', () => {
    expect(dist(track.startLine.from, track.centerline[0])).toBeLessThan(60);
  });

  it('creates at least 3 checkpoints and 6 item spawns', () => {
    expect(track.checkpoints.length).toBeGreaterThanOrEqual(3);
    expect(track.itemSpawns.length).toBeGreaterThanOrEqual(6);
  });
});

describe('track.geometry', () => {
  it('pointAtArc wraps around the loop', () => {
    expect(dist(pointAtArc(track, 0), track.centerline[0])).toBeLessThan(30);
    const p1 = pointAtArc(track, track.totalLength + 50);
    const p2 = pointAtArc(track, 50);
    expect(dist(p1, p2)).toBeLessThan(1);
  });

  it('arcAt returns the arc length of a point on the centerline', () => {
    const arc = arcAt(track.centerline[100], track);
    expect(Math.abs(arc - track.arcs[100])).toBeLessThan(5);
  });

  it('closestCenterline finds the segment containing the point', () => {
    const c = closestCenterline(track.centerline[50], track);
    expect(c.d).toBeLessThan(1);
  });

  it('keeps edge probes inside the track (no self-intersection)', () => {
    const n = track.centerline.length;
    for (let i = 0; i < n; i += 7) {
      const a = track.centerline[i];
      const b = track.centerline[(i + 1) % n];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy);
      const nx = -dy / l;
      const ny = dx / l;
      const offset = track.halfWidth - 6;
      for (const s of [1, -1]) {
        const probe = v(a.x + nx * offset * s, a.y + ny * offset * s);
        const hit = nearestBoundary(probe, track);
        expect(hit.d).toBeGreaterThan(4);
      }
    }
  });
});
