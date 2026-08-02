import { autopilotInput } from './autopilot';
import type { ActionState } from './input';
import { updateLapProgress } from './laps';
import { resolveRacerCollisions, resolveWalls, stepRacerPhysics } from './physics';
import { createRacer } from './racer';
import type { Racer } from './racer';
import type { Track } from './track';
import { add, scale, vecToAngle } from './math';

export interface WorldOptions {
  laps: number;
  autopilot: boolean;
}

export interface World {
  track: Track;
  racers: Racer[];
  player: Racer;
  laps: number;
  time: number;
  autopilot: boolean;
  raceOver: boolean;
}

export function createWorld(track: Track, opts: WorldOptions): World {
  const sl = track.startLine;
  const mid = {
    x: (sl.from.x + sl.to.x) / 2,
    y: (sl.from.y + sl.to.y) / 2,
  };
  const spawn = add(mid, scale(sl.tangent, -34));
  const player = createRacer({
    id: 'player',
    kind: 'player',
    name: 'player',
    color: '#ff4fd8',
    pos: spawn,
    heading: vecToAngle(sl.tangent),
  });
  return {
    track,
    racers: [player],
    player,
    laps: opts.laps,
    time: 0,
    autopilot: opts.autopilot,
    raceOver: false,
  };
}

/** Um tick fixo do mundo: input → física → colisões → voltas. */
export function stepWorld(world: World, dt: number, input: ActionState): void {
  if (world.raceOver) return;

  const player = world.player;
  const prevPos = { x: player.pos.x, y: player.pos.y };

  let cmd;
  if (world.autopilot) {
    cmd = autopilotInput(player, world.track);
  } else {
    cmd = {
      steer: (input.right ? 1 : 0) - (input.left ? 1 : 0),
      throttle: input.up,
      brake: input.down,
    };
  }
  stepRacerPhysics(player, cmd, dt);
  resolveWalls(player, world.track);
  resolveRacerCollisions(world.racers);

  const upd = updateLapProgress(player, prevPos, world.track);
  if (upd.lapCompleted && player.lapsCompleted >= world.laps && !player.finished) {
    player.finished = true;
    player.finishTime = world.time;
    world.raceOver = true;
  }

  world.time += dt;
}
