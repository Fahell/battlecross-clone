import { useCallback, useEffect, useRef, useState } from 'react';
import { PHYS, WORLD } from '../engine/constants';
import { KeyboardInput } from '../engine/input';
import { GameLoop } from '../engine/loop';
import { buildTrack } from '../engine/track';
import { createWorld, stepWorld } from '../engine/world';
import { render } from '../render/renderer';
import { cityTrackDef } from '../tracks/city';

const DEFAULT_LAPS = 3;

interface HudState {
  lap: number;
  laps: number;
  speed: number;
  finished: boolean;
  time: number;
  paused: boolean;
}

interface RaceScreenProps {
  onExit: () => void;
  onRestart: () => void;
}

export function RaceScreen({ onExit, onRestart }: RaceScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<GameLoop | null>(null);
  const pausedRef = useRef(false);
  const [hud, setHud] = useState<HudState>({
    lap: 1,
    laps: DEFAULT_LAPS,
    speed: 0,
    finished: false,
    time: 0,
    paused: false,
  });

  const togglePause = useCallback((): void => {
    const loop = loopRef.current;
    if (!loop) return;
    pausedRef.current = !pausedRef.current;
    loop.setPaused(pausedRef.current);
    setHud((h) => ({ ...h, paused: pausedRef.current }));
  }, []);

  const exitRef = useRef(onExit);
  exitRef.current = onExit;
  const restartRef = useRef(onRestart);
  restartRef.current = onRestart;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = WORLD.width;
    canvas.height = WORLD.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const params = new URLSearchParams(window.location.search);
    const autopilot = params.has('autopilot');
    const debug = params.has('debug');

    const track = buildTrack(cityTrackDef);
    const world = createWorld(track, { laps: DEFAULT_LAPS, autopilot });
    const input = new KeyboardInput();
    input.attach();

    let hudTimer = 0;
    const loop = new GameLoop((dt) => {
      const actions = input.poll();
      stepWorld(world, dt, actions);
      render(ctx, world, { debug });

      for (const action of input.consumePressed()) {
        if (action === 'back') exitRef.current();
      }

      hudTimer += dt;
      if (hudTimer >= 0.1) {
        hudTimer = 0;
        const player = world.player;
        setHud({
          lap: Math.min(player.lapsCompleted + 1, world.laps),
          laps: world.laps,
          speed: Math.hypot(player.vel.x, player.vel.y),
          finished: world.raceOver,
          time: world.time,
          paused: pausedRef.current,
        });
      }
    });
    loop.start();
    loopRef.current = loop;

    return () => {
      loop.stop();
      input.detach();
      loopRef.current = null;
    };
  }, []);

  // Pausa também fora do loop (funciona mesmo com o jogo pausado).
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  const speedPct = Math.min((hud.speed / PHYS.maxSpeed) * 100, 100);

  return (
    <div className="screen race-screen">
      <div className="game-frame">
        <canvas ref={canvasRef} className="game-canvas" data-testid="game-canvas" />
        <div className="hud">
          <div className="hud-top">
            <span className="hud-lap" data-testid="hud-lap">
              LAP {hud.lap}/{hud.laps}
            </span>
            <span className="hud-track">CIDADE</span>
            <span className="hud-pos">POS 1/1</span>
          </div>
          <div className="hud-bottom">
            <span className="hud-speed-label">VEL</span>
            <div className="speed-bar">
              <div className="speed-bar-fill" style={{ width: `${speedPct}%` }} />
            </div>
          </div>
        </div>

        {hud.paused && !hud.finished && (
          <div className="overlay">
            <div className="overlay-card">
              <h2>PAUSADO</h2>
              <div className="overlay-actions">
                <button type="button" className="btn" onClick={togglePause}>
                  Continuar
                </button>
                <button type="button" className="btn" onClick={restartRef.current}>
                  Reiniciar
                </button>
                <button type="button" className="btn" onClick={exitRef.current}>
                  Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {hud.finished && (
          <div className="overlay">
            <div className="overlay-card">
              <h2>CORRIDA COMPLETA!</h2>
              <p className="result-time">Tempo: {hud.time.toFixed(2)}s</p>
              <div className="overlay-actions">
                <button type="button" className="btn btn-primary" onClick={restartRef.current}>
                  Correr de novo
                </button>
                <button type="button" className="btn" onClick={exitRef.current}>
                  Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
