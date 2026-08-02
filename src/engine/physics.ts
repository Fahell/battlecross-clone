import { PHYS } from './constants';
import type { Racer } from './racer';
import type { Track } from './track';
import { nearestBoundary } from './track';
import { add, angleToVec, dist, dot, norm, perp, scale, sub } from './math';

export interface SteerInput {
  steer: number; // -1..1
  throttle: boolean;
  brake: boolean;
}

const NEUTRAL: SteerInput = { steer: 0, throttle: false, brake: false };

/**
 * Física escorregadia: velocidade decomposta em longitudinal (ao longo do
 * heading) e lateral. Ações (acelerar/frear) afetam o longitudinal; o grip
 * amortiza lentamente o lateral (<1 = derrapa). Ao girar o heading, a
 * componente lateral antiga vira derrapagem.
 */
export function stepRacerPhysics(r: Racer, input: SteerInput, dt: number): void {
  const cmd = r.stunTimer > 0 ? NEUTRAL : input;
  const speed = Math.hypot(r.vel.x, r.vel.y);
  const speedFactor = Math.min(speed / PHYS.maxSpeed, 1);

  // Steering: giro do heading (mais fraco em baixa velocidade).
  r.heading += cmd.steer * PHYS.turnRate * (0.25 + 0.75 * speedFactor) * dt;

  // Re-decompõe a velocidade nos novos eixos (gera derrapagem).
  const fwd = angleToVec(r.heading);
  const side = perp(fwd);
  let longV = dot(r.vel, fwd);
  let latV = dot(r.vel, side);

  // Acelerar / frear / inércia ao longo do heading.
  if (cmd.throttle) {
    longV = Math.min(longV + PHYS.accel * dt, PHYS.maxSpeed);
  } else if (cmd.brake) {
    if (longV > 0) longV = Math.max(0, longV - PHYS.brake * dt);
    else longV = Math.max(longV - PHYS.brake * dt, -PHYS.maxSpeed * 0.4);
  } else if (longV !== 0) {
    const dec = Math.min(PHYS.coastDecel * dt, Math.abs(longV));
    longV -= Math.sign(longV) * dec;
  }

  // Grip: amortiza apenas o componente lateral (0.96/frame → derrapa).
  latV *= Math.pow(PHYS.grip, dt * 60);
  // Frear também ajuda a controlar o deslize lateral.
  if (cmd.brake) latV *= Math.pow(PHYS.brakeGrip, dt * 60);

  r.vel = add(scale(fwd, longV), scale(side, latV));

  // Cap da magnitude total: durante a derrapagem a soma nunca passa de maxSpeed.
  const total = Math.hypot(r.vel.x, r.vel.y);
  if (total > PHYS.maxSpeed) r.vel = scale(r.vel, PHYS.maxSpeed / total);

  r.pos = add(r.pos, scale(r.vel, dt));

  if (r.stunTimer > 0) r.stunTimer = Math.max(0, r.stunTimer - dt);
}

/** Colisão com as bordas da pista: empurra para dentro e aplica wallBounce. */
export function resolveWalls(r: Racer, track: Track): void {
  const hit = nearestBoundary(r.pos, track);
  if (hit.d >= r.radius) return;
  r.pos = add(hit.point, scale(hit.normal, r.radius));
  const vn = dot(r.vel, hit.normal);
  if (vn < 0) r.vel = sub(r.vel, scale(hit.normal, (1 + PHYS.wallBounce) * vn));
}

/** Colisão círculo-círculo entre racers (separação + impulso + stun curto). */
export function resolveRacerCollisions(racers: Racer[]): void {
  for (let i = 0; i < racers.length; i++) {
    for (let j = i + 1; j < racers.length; j++) {
      const a = racers[i];
      const b = racers[j];
      const d = dist(a.pos, b.pos);
      const minD = a.radius + b.radius;
      if (d >= minD || d < 1e-6) continue;
      const n = norm(sub(b.pos, a.pos));
      const overlap = minD - d;
      a.pos = sub(a.pos, scale(n, overlap / 2));
      b.pos = add(b.pos, scale(n, overlap / 2));
      const rel = sub(a.vel, b.vel);
      const vn = dot(rel, n);
      if (vn > 0) {
        const jImp = ((1 + PHYS.bumpRestitution) * vn) / 2;
        a.vel = sub(a.vel, scale(n, jImp));
        b.vel = add(b.vel, scale(n, jImp));
      }
      a.stunTimer = Math.max(a.stunTimer, PHYS.bumpStun);
      b.stunTimer = Math.max(b.stunTimer, PHYS.bumpStun);
    }
  }
}
