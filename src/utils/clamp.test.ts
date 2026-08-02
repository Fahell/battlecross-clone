import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('limita valores acima do máximo', () => {
    expect(clamp(10, 0, 5)).toBe(5);
  });

  it('limita valores abaixo do mínimo', () => {
    expect(clamp(-10, 0, 5)).toBe(0);
  });

  it('mantém valores dentro do intervalo', () => {
    expect(clamp(3, 0, 5)).toBe(3);
  });
});
