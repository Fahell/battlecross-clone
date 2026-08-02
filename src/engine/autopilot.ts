import { PHYS } from './constants';
import type { Racer } from './racer';
import type { Track } from './track';
import { arcAt, pointAtArc } from './track';
import { angleDiff, clamp, len, sub, vecToAngle } from './math';
import type { SteerInput } from './physics';

/**
 * Piloto automático de desenvolvimento (dev-only, ativado por `?autopilot`).
 * Segue a centerline mirando um ponto à frente; útil para E2E estável.
 */
export function autopilotInput(r: Racer, track: Track): SteerInput {
  const speed = len(r.vel);
  const arc = arcAt(r.pos, track);
  const lookahead = clamp(speed * 0.6, 40, 170);
  const target = pointAtArc(track, arc + lookahead);
  const want = vecToAngle(sub(target, r.pos));
  const err = angleDiff(want, r.heading);
  const steer = clamp(err * 2.4, -1, 1);
  const sharp = Math.abs(err) > 0.55;
  return { steer, throttle: !sharp, brake: sharp && speed > PHYS.maxSpeed * 0.5 };
}
