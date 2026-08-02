import { PHYS } from './constants';
import type { Vec2 } from './math';
import { v } from './math';

export type RacerKind = 'player' | 'cpu';

export interface Racer {
  id: string;
  kind: RacerKind;
  name: string;
  color: string;
  pos: Vec2;
  vel: Vec2;
  heading: number; // rad
  radius: number;
  lapsCompleted: number;
  nextCheckpoint: number;
  finished: boolean;
  finishTime: number | null;
  stunTimer: number;
}

export interface RacerOptions {
  id: string;
  kind: RacerKind;
  name: string;
  color: string;
  pos?: Vec2;
  heading?: number;
}

export function createRacer(opts: RacerOptions): Racer {
  return {
    id: opts.id,
    kind: opts.kind,
    name: opts.name,
    color: opts.color,
    pos: opts.pos ?? v(0, 0),
    vel: v(0, 0),
    heading: opts.heading ?? 0,
    radius: PHYS.racerRadius,
    lapsCompleted: 0,
    nextCheckpoint: 0,
    finished: false,
    finishTime: null,
    stunTimer: 0,
  };
}
