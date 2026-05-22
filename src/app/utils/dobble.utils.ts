import { CardLayout, CardShape } from '../classes/card-layout';

export type Card = string[];
export type Mode = 3 | 4 | 6 | 8;

export const MM_TO_PX = 3.7795;

export function requiredImagesForMode(mode: Mode): number {
  return mode * (mode - 1) + 1;
}

export function cardWidthMm(layout: CardLayout): number {
  return (layout.shape || 'rectangle') === 'rectangle' ? layout.width : (layout.diameter || 88);
}

export function cardHeightMm(layout: CardLayout): number {
  const shape = layout.shape || 'rectangle';
  if (shape === 'rectangle') return layout.height;
  if (shape === 'circle') return layout.diameter || 88;
  return (layout.diameter || 88) * Math.sqrt(3) / 2;
}

/** Traces the card shape path on the context (beginPath + path). */
export function traceCardShape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shape: CardShape
): void {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  } else if (shape === 'hexagon') {
    ctx.moveTo(0.25 * w, 0);
    ctx.lineTo(0.75 * w, 0);
    ctx.lineTo(w, 0.5 * h);
    ctx.lineTo(0.75 * w, h);
    ctx.lineTo(0.25 * w, h);
    ctx.lineTo(0, 0.5 * h);
    ctx.closePath();
  } else {
    ctx.rect(0, 0, w, h);
  }
}

/** Clips the canvas context to the card shape. Call after save(), before drawing. */
export function applyCardShapeClip(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shape: CardShape
): void {
  traceCardShape(ctx, w, h, shape);
  ctx.clip();
}
