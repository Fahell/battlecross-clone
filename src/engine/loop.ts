import { WORLD } from './constants';

/** Loop com fixed timestep (1/60 s) via accumulator + requestAnimationFrame. */
export class GameLoop {
  private rafId = 0;
  private last = 0;
  private acc = 0;
  private running = false;
  paused = false;

  constructor(private readonly step: (dt: number) => void) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number): void => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(tick);
      let delta = (now - this.last) / 1000;
      this.last = now;
      if (this.paused) return;
      if (delta > WORLD.maxFrameDelta) delta = WORLD.maxFrameDelta;
      this.acc += delta;
      const stepDt = 1 / WORLD.tickRate;
      while (this.acc >= stepDt) {
        this.step(stepDt);
        this.acc -= stepDt;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  setPaused(value: boolean): void {
    this.paused = value;
  }
}
