import { WORLD } from '../engine/constants';
import type { Racer } from '../engine/racer';
import type { Track } from '../engine/track';
import type { World } from '../engine/world';
import { add, len, norm, scale, sub, v, vecToAngle } from '../engine/math';
import type { Vec2 } from '../engine/math';

export interface RenderOptions {
  debug: boolean;
}

export function render(ctx: CanvasRenderingContext2D, world: World, opts: RenderOptions): void {
  const { track } = world;

  ctx.fillStyle = track.theme.bg;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  drawDecor(ctx, track);
  drawTrack(ctx, track);
  drawItemSpawns(ctx, track);

  for (const racer of world.racers) drawRacer(ctx, racer);

  if (opts.debug) drawDebug(ctx, track, world);
}

function drawDecor(ctx: CanvasRenderingContext2D, track: Track): void {
  for (const box of track.decor) {
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(box.x, box.y, box.w, 4);
  }
}

function tracePoly(ctx: CanvasRenderingContext2D, pts: Vec2[], closed = true): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  if (closed) ctx.closePath();
}

function drawTrack(ctx: CanvasRenderingContext2D, track: Track): void {
  // Piso: anel entre as bordas esquerda (fora) e direita (dentro), winding oposto.
  ctx.beginPath();
  ctx.moveTo(track.leftEdge[0].x, track.leftEdge[0].y);
  for (let i = 1; i < track.leftEdge.length; i++) {
    ctx.lineTo(track.leftEdge[i].x, track.leftEdge[i].y);
  }
  for (let i = track.rightEdge.length - 1; i >= 0; i--) {
    ctx.lineTo(track.rightEdge[i].x, track.rightEdge[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = track.theme.ground;
  ctx.fill();

  // Sombra interna sutil.
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 6;
  tracePoly(ctx, track.leftEdge);
  ctx.stroke();
  tracePoly(ctx, track.rightEdge);
  ctx.stroke();

  // Meios-fios.
  ctx.strokeStyle = track.theme.curb;
  ctx.lineWidth = 3;
  tracePoly(ctx, track.leftEdge);
  ctx.stroke();
  tracePoly(ctx, track.rightEdge);
  ctx.stroke();

  // Linha central tracejada.
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 18]);
  tracePoly(ctx, track.centerline);
  ctx.stroke();
  ctx.setLineDash([]);

  drawCheckered(ctx, track.startLine);
}

function drawCheckered(ctx: CanvasRenderingContext2D, sl: Track['startLine']): void {
  const mid = v((sl.from.x + sl.to.x) / 2, (sl.from.y + sl.to.y) / 2);
  const dir = sub(sl.to, sl.from);
  const w = len(dir);
  ctx.save();
  ctx.translate(mid.x, mid.y);
  ctx.rotate(vecToAngle(dir));
  const bands = 10;
  const bandW = w / bands;
  const bandH = 8;
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#f5f2ea' : '#15171c';
    ctx.fillRect(-w / 2 + i * bandW, -bandH, bandW + 0.5, bandH * 2);
  }
  ctx.restore();
}

function drawItemSpawns(ctx: CanvasRenderingContext2D, track: Track): void {
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (const p of track.itemSpawns) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRacer(ctx: CanvasRenderingContext2D, r: Racer): void {
  // Rastro de jet.
  const sp = len(r.vel);
  if (sp > 30) {
    const dir = norm(r.vel);
    const trail = Math.min(10 + sp * 0.06, 28);
    const tip = add(r.pos, scale(dir, -trail));
    ctx.strokeStyle = 'rgba(255,170,60,0.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r.pos.x, r.pos.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
  }

  // Sombra.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(r.pos.x + 3, r.pos.y + 4, 13, 9, r.heading, 0, Math.PI * 2);
  ctx.fill();

  // Corpo (placeholder geométrico).
  ctx.save();
  ctx.translate(r.pos.x, r.pos.y);
  ctx.rotate(r.heading);
  roundedRect(ctx, -13, -7, 26, 14, 5);
  ctx.fillStyle = r.color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  roundedRect(ctx, -2, -4, 9, 8, 2.5);
  ctx.fillStyle = '#10141c';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, -5);
  ctx.lineTo(21, 0);
  ctx.lineTo(13, 5);
  ctx.closePath();
  ctx.fillStyle = r.color;
  ctx.fill();
  ctx.restore();

  // Anel amarelo quando atordoado.
  if (r.stunTimer > 0) {
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.pos.x, r.pos.y, r.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawDebug(ctx: CanvasRenderingContext2D, track: Track, world: World): void {
  ctx.strokeStyle = 'rgba(255,60,90,0.7)';
  ctx.lineWidth = 1;
  tracePoly(ctx, track.centerline);
  ctx.stroke();

  ctx.strokeStyle = '#4dff88';
  ctx.lineWidth = 2;
  for (const cp of track.checkpoints) {
    ctx.beginPath();
    ctx.moveTo(cp.from.x, cp.from.y);
    ctx.lineTo(cp.to.x, cp.to.y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#4dc9ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(track.startLine.from.x, track.startLine.from.y);
  ctx.lineTo(track.startLine.to.x, track.startLine.to.y);
  ctx.stroke();

  for (const r of world.racers) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.fillText(`lap ${r.lapsCompleted} cp ${r.nextCheckpoint}`, r.pos.x + 18, r.pos.y - 14);
  }
}

/**
 * Número de winding (regra nonzero) do caminho de preenchimento do anel da
 * pista — o mesmo caminho desenhado em drawTrack (leftEdge adiante + rightEdge
 * invertida). 0 = não preenchido (fora da pista OU no buraco interno).
 */
export function trackWindingAt(track: Track, p: Vec2): number {
  let w = 0;
  const n = track.leftEdge.length;
  // leftEdge adiante
  for (let i = 0; i < n; i++) {
    const a = track.leftEdge[i];
    const b = track.leftEdge[(i + 1) % n];
    if ((a.y <= p.y && b.y > p.y) || (b.y <= p.y && a.y > p.y)) {
      const x = a.x + ((p.y - a.y) / (b.y - a.y)) * (b.x - a.x);
      if (x > p.x) w += a.y <= p.y ? 1 : -1;
    }
  }
  // rightEdge invertida
  const m = track.rightEdge.length;
  for (let i = m - 1; i >= 0; i--) {
    const a = track.rightEdge[i];
    const b = track.rightEdge[(i - 1 + m) % m];
    if ((a.y <= p.y && b.y > p.y) || (b.y <= p.y && a.y > p.y)) {
      const x = a.x + ((p.y - a.y) / (b.y - a.y)) * (b.x - a.x);
      if (x > p.x) w += a.y <= p.y ? 1 : -1;
    }
  }
  return w;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
