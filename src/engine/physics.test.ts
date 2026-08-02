import { describe, expect, it } from 'vitest';
import { PHYS } from './constants';
import { createRacer } from './racer';
import { resolveRacerCollisions, resolveWalls, stepRacerPhysics } from './physics';
import { buildTrack } from './track';
import { cityTrackDef } from '../tracks/city';
import { v } from './math';

const track = buildTrack(cityTrackDef);
const TICK = 1 / 60;

function drive(
  racer: ReturnType<typeof createRacer>,
  steer: number,
  throttle: boolean,
  brake: boolean,
  seconds: number,
): void {
  const steps = Math.round(seconds * 60);
  for (let i = 0; i < steps; i++) {
    stepRacerPhysics(racer, { steer, throttle, brake }, TICK);
  }
}

function makeRacer(pos = v(280, 605), heading = 0): ReturnType<typeof createRacer> {
  return createRacer({ id: 'p', kind: 'player', name: 'p', color: '#fff', pos, heading });
}

describe('physics.acceleration', () => {
  it('accelerates up to and caps at maxSpeed', () => {
    const r = makeRacer();
    drive(r, 0, true, false, 4);
    const speed = Math.hypot(r.vel.x, r.vel.y);
    expect(speed).toBeLessThanOrEqual(PHYS.maxSpeed + 1);
    expect(speed).toBeGreaterThan(PHYS.maxSpeed * 0.95);
  });

  it('braking slows the racer down', () => {
    const r = makeRacer();
    drive(r, 0, true, false, 2);
    const before = Math.hypot(r.vel.x, r.vel.y);
    drive(r, 0, false, true, 1);
    expect(Math.hypot(r.vel.x, r.vel.y)).toBeLessThan(before);
  });

  it('coasts with natural deceleration', () => {
    const r = makeRacer();
    drive(r, 0, true, false, 2);
    const before = Math.hypot(r.vel.x, r.vel.y);
    drive(r, 0, false, false, 1);
    const after = Math.hypot(r.vel.x, r.vel.y);
    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThan(before - PHYS.coastDecel - 1);
  });
});

describe('physics.grip (derrapagem)', () => {
  it('keeps most lateral velocity after a single frame (drift)', () => {
    const r = makeRacer();
    r.vel = v(0, 100); // deslizando para baixo com heading para a direita
    stepRacerPhysics(r, { steer: 0, throttle: false, brake: false }, TICK);
    expect(r.vel.y).toBeGreaterThan(90); // 96% da lateral mantida
    expect(Math.abs(r.vel.x)).toBeLessThan(10);
  });

  it('lateral slide persists and is slowly damped (keeps sliding)', () => {
    const r = makeRacer();
    r.vel = v(0, 100);
    for (let i = 0; i < 30; i++) {
      stepRacerPhysics(r, { steer: 0, throttle: false, brake: false }, TICK);
    }
    // após 30 frames (0.5 s) o deslize lateral ainda persiste, mas reduzido
    expect(r.vel.y).toBeGreaterThan(20);
    expect(r.vel.y).toBeLessThan(45);
  });

  it('throttling with lateral drift keeps accelerating forward', () => {
    const r = makeRacer();
    r.vel = v(0, 100); // derrapando
    drive(r, 0, true, false, 1);
    expect(r.vel.x).toBeGreaterThan(80); // ganhou velocidade longitudinal
  });

  it('steering rotates the heading', () => {
    const r = makeRacer();
    r.vel = v(220, 0);
    stepRacerPhysics(r, { steer: 1, throttle: false, brake: false }, TICK);
    expect(r.heading).toBeGreaterThan(0);
  });
});

describe('physics.walls', () => {
  it('pushes the racer back inside and bounces the normal velocity', () => {
    // Borda inferior da reta do início fica em y ≈ 640.
    const r = makeRacer(v(280, 638), 0);
    r.vel = v(100, 30);
    resolveWalls(r, track);
    expect(r.pos.y).toBeLessThan(640);
    expect(r.vel.y).toBeLessThan(0);
  });
});

describe('physics.racer collisions', () => {
  it('separates overlapping racers and applies impulse', () => {
    const a = makeRacer(v(100, 100));
    const b = makeRacer(v(100, 120));
    a.vel = v(0, 40);
    b.vel = v(0, 0);
    resolveRacerCollisions([a, b]);
    expect(Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y)).toBeGreaterThanOrEqual(
      a.radius + b.radius - 0.01,
    );
    expect(a.vel.y).toBeLessThan(40);
    expect(b.vel.y).toBeGreaterThan(0);
  });
});
