/** Parâmetros base da jet-bike (spec do plano de implementação §2.1). */
export const PHYS = {
  maxSpeed: 220, // px/s
  accel: 150, // px/s²
  brake: 240, // px/s²
  coastDecel: 40, // px/s²
  turnRate: 2.4, // rad/s
  grip: 0.96, // fração de velocidade mantida por frame (<1 = derrapa)
  racerRadius: 14, // px
  wallBounce: 0.55, // fração da velocidade normal mantida na parede
  bumpRestitution: 0.35,
  bumpStun: 0.15, // s
} as const;

/** Espaço lógico do mundo (4:3, homenagem ao SNES) e loop. */
export const WORLD = {
  width: 960,
  height: 720,
  tickRate: 60,
  maxFrameDelta: 0.1,
} as const;
