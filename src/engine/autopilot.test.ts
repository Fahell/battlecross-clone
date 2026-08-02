import { describe, expect, it } from 'vitest';
import { buildTrack, nearestBoundary } from './track';
import { createWorld, stepWorld } from './world';
import { createActionState } from './input';
import { cityTrackDef } from '../tracks/city';

const TICK = 1 / 60;

describe('autopilot', () => {
  it('completes laps on the city track without leaving the track', () => {
    const track = buildTrack(cityTrackDef);
    const world = createWorld(track, { laps: 99, autopilot: true });
    const input = createActionState();

    for (let i = 0; i < 60 * 40; i++) {
      stepWorld(world, TICK, input);
      const hit = nearestBoundary(world.player.pos, track);
      expect(hit.d).toBeGreaterThanOrEqual(world.player.radius - 1);
    }

    expect(world.time).toBeCloseTo(40, 0);
    expect(world.player.lapsCompleted).toBeGreaterThanOrEqual(1);
  });

  it('marks the race finished after the configured laps', () => {
    const track = buildTrack(cityTrackDef);
    const world = createWorld(track, { laps: 1, autopilot: true });
    const input = createActionState();
    for (let i = 0; i < 60 * 40 && !world.raceOver; i++) {
      stepWorld(world, TICK, input);
    }
    expect(world.raceOver).toBe(true);
    expect(world.player.finishTime).not.toBeNull();
    expect(world.player.lapsCompleted).toBe(1);
  });
});
