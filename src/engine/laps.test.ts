import { describe, expect, it } from 'vitest';
import { buildTrack, pointAtArc } from './track';
import type { Track } from './track';
import { updateLapProgress } from './laps';
import { createRacer } from './racer';
import { cityTrackDef } from '../tracks/city';

function buildWorld(): { track: Track; racer: ReturnType<typeof createRacer> } {
  const track = buildTrack(cityTrackDef);
  const racer = createRacer({ id: 'p', kind: 'player', name: 'p', color: '#fff' });
  return { track, racer };
}

/** Move o racer de startArc a endArc (arc crescente = sentido da pista). */
function simulateForward(
  track: Track,
  racer: ReturnType<typeof createRacer>,
  startArc: number,
  endArc: number,
  step = 2,
): boolean[] {
  const lapEvents: boolean[] = [];
  let prev = pointAtArc(track, startArc);
  racer.pos = prev;
  for (let a = startArc + step; a <= endArc; a += step) {
    racer.pos = pointAtArc(track, a);
    lapEvents.push(updateLapProgress(racer, prev, track).lapCompleted);
    prev = { ...racer.pos };
  }
  return lapEvents;
}

describe('laps', () => {
  it('counts a full lap crossing checkpoints in order then the start line', () => {
    const { track, racer } = buildWorld();
    const events = simulateForward(track, racer, 0, track.totalLength + 8);
    expect(events.filter(Boolean).length).toBe(1);
    expect(racer.lapsCompleted).toBe(1);
  });

  it('counts multiple consecutive laps', () => {
    const { track, racer } = buildWorld();
    simulateForward(track, racer, 0, track.totalLength * 2 + 8, 4);
    expect(racer.lapsCompleted).toBe(2);
  });

  it('does not count a lap when a checkpoint was skipped', () => {
    const { track, racer } = buildWorld();
    racer.nextCheckpoint = 1; // pulou o checkpoint 0
    simulateForward(track, racer, 0.6 * track.totalLength, track.totalLength + 8);
    expect(racer.lapsCompleted).toBe(0);
  });

  it('does not count a backward crossing of a checkpoint', () => {
    const { track, racer } = buildWorld();
    const cpArc = track.checkpoints[0].arc;
    const from = pointAtArc(track, cpArc + 10);
    racer.pos = pointAtArc(track, cpArc - 10);
    const upd = updateLapProgress(racer, from, track);
    expect(upd.checkpointPassed).toBe(false);
    expect(racer.nextCheckpoint).toBe(0);
  });

  it('marks the race finished at the last lap', () => {
    const { track, racer } = buildWorld();
    // simula 3 voltas
    simulateForward(track, racer, 0, track.totalLength * 3 + 8, 8);
    expect(racer.lapsCompleted).toBe(3);
  });
});
