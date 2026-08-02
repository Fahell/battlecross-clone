import { describe, expect, it } from 'vitest';
import { trackWindingAt } from './renderer';
import { buildTrack } from '../engine/track';
import { cityTrackDef } from '../tracks/city';
import { v } from '../engine/math';

const track = buildTrack(cityTrackDef);

describe('renderer.trackWindingAt (preenchimento do anel)', () => {
  it('preenche a pista (winding != 0) em pontos sobre o asfalto', () => {
    // reta inferior: centerline ≈ (350, 605) e ponto central do circuito na parte sul
    expect(trackWindingAt(track, v(350, 605))).not.toBe(0);
    expect(trackWindingAt(track, v(500, 605))).not.toBe(0);
    expect(trackWindingAt(track, v(600, 605))).not.toBe(0);
  });

  it('deixa o buraco interno vazio (winding == 0)', () => {
    // centro do circuito, longe de decor: deve ser fundo, não asfalto
    expect(trackWindingAt(track, v(700, 450))).toBe(0);
    expect(trackWindingAt(track, v(480, 300))).toBe(0);
  });

  it('deixa o exterior vazio (winding == 0)', () => {
    expect(trackWindingAt(track, v(50, 50))).toBe(0);
    expect(trackWindingAt(track, v(920, 700))).toBe(0);
  });
});
