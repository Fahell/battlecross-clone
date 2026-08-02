import { describe, expect, it } from 'vitest';
import { angleDiff, dist, pointSegDist, segIntersect, v } from './math';

describe('math.segIntersect', () => {
  it('detects crossing segments', () => {
    const r = segIntersect(v(0, 0), v(10, 10), v(0, 10), v(10, 0));
    expect(r.hit).toBe(true);
  });

  it('returns no hit for parallel segments', () => {
    const r = segIntersect(v(0, 0), v(10, 0), v(0, 5), v(10, 5));
    expect(r.hit).toBe(false);
  });

  it('returns no hit when segments do not overlap', () => {
    const r = segIntersect(v(0, 0), v(5, 5), v(10, 10), v(15, 15));
    expect(r.hit).toBe(false);
  });
});

describe('math.pointSegDist', () => {
  it('measures perpendicular distance to the middle of a segment', () => {
    const r = pointSegDist(v(0, 5), v(-10, 0), v(10, 0));
    expect(r.d).toBeCloseTo(5);
    expect(r.closest.x).toBeCloseTo(0);
  });

  it('clamps to segment endpoints', () => {
    const r = pointSegDist(v(20, 2), v(0, 0), v(10, 0));
    expect(r.closest.x).toBeCloseTo(10);
    expect(r.d).toBeCloseTo(dist(v(20, 2), v(10, 0)));
  });
});

describe('math.angleDiff', () => {
  it('wraps differences into [-PI, PI]', () => {
    expect(Math.abs(angleDiff(0, Math.PI))).toBeCloseTo(Math.PI);
    expect(angleDiff(0.1, 0.2)).toBeCloseTo(-0.1);
    expect(angleDiff(-3, 3)).toBeCloseTo(-6 + Math.PI * 2);
  });
});
