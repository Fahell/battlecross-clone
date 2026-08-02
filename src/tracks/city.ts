import type { TrackDef } from '../engine/track';
import { v } from '../engine/math';

/** Circuito urbano em tela única (960x720): reta inferior, lado direito, topo, lado esquerdo. */
export const cityTrackDef: TrackDef = {
  id: 'city',
  nameKey: 'tracks.city',
  width: 70,
  controlPoints: [
    v(250, 605),
    v(690, 605),
    v(860, 585),
    v(895, 460),
    v(880, 300),
    v(790, 205),
    v(610, 175),
    v(420, 180),
    v(245, 245),
    v(172, 370),
    v(185, 525),
  ],
  theme: {
    ground: '#3b3f47',
    curb: '#d9d4c9',
    bg: '#20242c',
    label: '#8fa3b8',
    start: '#f5f2ea',
  },
  decor: [
    { x: 60, y: 60, w: 150, h: 70, color: '#2c3140' },
    { x: 760, y: 60, w: 140, h: 70, color: '#333a4d' },
    { x: 820, y: 620, w: 80, h: 50, color: '#333a4d' },
    { x: 60, y: 645, w: 90, h: 40, color: '#2c3140' },
    { x: 430, y: 330, w: 90, h: 90, color: '#2c3140' },
    { x: 560, y: 400, w: 60, h: 60, color: '#333a4d' },
  ],
  itemSpawnCount: 6,
};
