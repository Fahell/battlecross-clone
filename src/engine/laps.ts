import type { Racer } from './racer';
import type { Track } from './track';
import { dot, segIntersect, sub } from './math';
import type { Vec2 } from './math';

export interface LapUpdate {
  checkpointPassed: boolean;
  lapCompleted: boolean;
}

/**
 * Contagem de voltas: a volta só conta ao cruzar a startLine na ordem certa,
 * depois de passar por todos os checkpoints (volta para trás não conta).
 */
export function updateLapProgress(r: Racer, prevPos: Vec2, track: Track): LapUpdate {
  const result: LapUpdate = { checkpointPassed: false, lapCompleted: false };
  if (r.finished) return result;

  // Processa crossings encadeados (racer pode cruzar 2 checkpoints no mesmo tick).
  let pending = true;
  while (pending) {
    const cp = track.checkpoints[r.nextCheckpoint];
    if (!cp) break;
    const cross = segIntersect(prevPos, r.pos, cp.from, cp.to);
    if (cross.hit && crossesForward(prevPos, r.pos, cp.tangent)) {
      r.nextCheckpoint += 1;
      result.checkpointPassed = true;
    } else {
      pending = false;
    }
  }

  if (r.nextCheckpoint === track.checkpoints.length) {
    const sl = track.startLine;
    const cross = segIntersect(prevPos, r.pos, sl.from, sl.to);
    if (cross.hit && crossesForward(prevPos, r.pos, sl.tangent)) {
      r.lapsCompleted += 1;
      r.nextCheckpoint = 0;
      result.lapCompleted = true;
    }
  }

  return result;
}

function crossesForward(prev: Vec2, curr: Vec2, tangent: Vec2): boolean {
  return dot(sub(curr, prev), tangent) > 0;
}
