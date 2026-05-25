import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { CardLayout } from '../../classes/card-layout';
import { ImgLayout } from '../../classes/img-layout';
import { Card, MM_TO_PX, cardWidthMm, cardHeightMm, applyCardShapeClip, traceCardShape } from '../../utils/dobble.utils';
import { AppTranslations, GameTranslation, LanguageService } from '../../services/language.service';

const EXPORT_PX_PER_MM = 400 / 25.4;

@Component({
  selector: 'app-export-panel',
  standalone: true,
  imports: [MatButtonModule, LucideAngularModule],
  templateUrl: './export-panel.component.html',
  styleUrls: ['./export-panel.component.css']
})
export class ExportPanelComponent {
  @Input() cards: Card[] = [];
  @Input() cardLayouts: ImgLayout[][] = [];
  @Input() cardLayout: CardLayout = new CardLayout();

  exportingPng = false;
  exportingPdf = false;
  exportingInstructions = false;

  readonly t = inject(LanguageService).t;

  private async renderCard(ci: number): Promise<string> {
    const scale = EXPORT_PX_PER_MM / MM_TO_PX;
    const px = (mm: number) => Math.round(mm * EXPORT_PX_PER_MM);

    const shape = this.cardLayout.shape || 'rectangle';
    const cardW = px(cardWidthMm(this.cardLayout));
    const cardH = px(cardHeightMm(this.cardLayout));
    const padH = shape === 'rectangle' ? px(this.cardLayout.marginLeft) : 0;
    const padV = shape === 'rectangle' ? px(this.cardLayout.marginTop) : 0;

    const canvas = document.createElement('canvas');
    canvas.width = cardW;
    canvas.height = cardH;
    const ctx = canvas.getContext('2d')!;

    // Fill the whole canvas white before clipping — keeps the PNG fully opaque,
    // which avoids jsPDF's extremely slow transparent-pixel processing.
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cardW, cardH);

    ctx.save();
    applyCardShapeClip(ctx, cardW, cardH, shape);

    if (this.cardLayout.backgroundImage) {
      const bg = await loadImage(this.cardLayout.backgroundImage);
      const s = Math.max(cardW / bg.naturalWidth, cardH / bg.naturalHeight);
      ctx.drawImage(bg,
        (cardW - bg.naturalWidth * s) / 2,
        (cardH - bg.naturalHeight * s) / 2,
        bg.naturalWidth * s,
        bg.naturalHeight * s
      );
    }

    const layout = this.cardLayouts[ci] ?? [];
    for (let ii = 0; ii < this.cards[ci].length; ii++) {
      const l = layout[ii];
      if (!l) continue;
      const img = await loadImage(this.cards[ci][ii]);
      const size = l.size * scale;
      const cx = padH + l.x * scale + size / 2;
      const cy = padV + l.y * scale + size / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(l.rotate * Math.PI / 180);
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    ctx.restore(); // remove card shape clip

    traceCardShape(ctx, cardW, cardH, shape);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = Math.max(1, Math.round(EXPORT_PX_PER_MM * 0.3));
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }

  async exportImages() {
    if (!this.cards.length) return;
    this.exportingPng = true;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let ci = 0; ci < this.cards.length; ci++) {
        const dataUrl = await this.renderCard(ci);
        const blob = await dataUrlToBlob(dataUrl);
        zip.file(`${ci + 1}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      triggerDownload(URL.createObjectURL(content), 'dobble_cards.zip');
    } catch (err) {
      console.error('[Dobble] PNG export failed:', err);
    } finally {
      this.exportingPng = false;
    }
  }

  async exportPdf() {
    if (!this.cards.length) return;
    this.exportingPdf = true;
    try {
      const { jsPDF } = await import('jspdf');

      // A4 dimensions and layout constants (mm)
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN = 10;
      const GAP = 5;

      const cardW = cardWidthMm(this.cardLayout);
      const cardH = cardHeightMm(this.cardLayout);

      const availW = PAGE_W - 2 * MARGIN;
      const availH = PAGE_H - 2 * MARGIN;

      const cols = Math.max(1, Math.floor((availW + GAP) / (cardW + GAP)));
      const rows = Math.max(1, Math.floor((availH + GAP) / (cardH + GAP)));
      const perPage = cols * rows;

      // Center the card grid on the page
      const gridW = cols * cardW + (cols - 1) * GAP;
      const gridH = rows * cardH + (rows - 1) * GAP;
      const offsetX = MARGIN + (availW - gridW) / 2;
      const offsetY = MARGIN + (availH - gridH) / 2;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      for (let ci = 0; ci < this.cards.length; ci++) {
        const posInPage = ci % perPage;

        if (posInPage === 0 && ci > 0) {
          doc.addPage();
        }

        const col = posInPage % cols;
        const row = Math.floor(posInPage / cols);
        const x = offsetX + col * (cardW + GAP);
        const y = offsetY + row * (cardH + GAP);

        const dataUrl = await this.renderCard(ci);
        doc.addImage(dataUrl, 'PNG', x, y, cardW, cardH);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        const shape = this.cardLayout.shape || 'rectangle';
        if (shape === 'circle') {
          doc.circle(x + cardW / 2, y + cardH / 2, cardW / 2, 'S');
        } else if (shape === 'hexagon') {
          doc.lines([
            [cardW * 0.5,   0],
            [cardW * 0.25,  cardH * 0.5],
            [-cardW * 0.25, cardH * 0.5],
            [-cardW * 0.5,  0],
            [-cardW * 0.25, -cardH * 0.5],
          ], x + cardW * 0.25, y, [1, 1], 'S', true);
        } else {
          doc.rect(x, y, cardW, cardH, 'S');
        }
      }

      doc.save('dobble_cards.pdf');
    } catch (err) {
      console.error('[Dobble] PDF export failed:', err);
    } finally {
      this.exportingPdf = false;
    }
  }

  async exportInstructionCards() {
    const t = this.t();
    this.exportingInstructions = true;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < t.games.length; i++) {
        const game = t.games[i];
        const dataUrl = this.renderInstructionCard(game, t, i + 1);
        const blob = await dataUrlToBlob(dataUrl);
        const safeTitle = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        zip.file(`instruction_${safeTitle}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      triggerDownload(URL.createObjectURL(content), 'dobble_instruction_cards.zip');
    } catch (err) {
      console.error('[Dobble] Instruction cards export failed:', err);
    } finally {
      this.exportingInstructions = false;
    }
  }

  private renderInstructionCard(game: GameTranslation, t: AppTranslations, gameIndex: number): string {
    const px = (mm: number) => Math.round(mm * EXPORT_PX_PER_MM);
    const shape = this.cardLayout.shape || 'rectangle';
    const cardW = px(cardWidthMm(this.cardLayout));
    const cardH = px(cardHeightMm(this.cardLayout));

    const canvas = document.createElement('canvas');
    canvas.width = cardW;
    canvas.height = cardH;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cardW, cardH);
    ctx.save();
    applyCardShapeClip(ctx, cardW, cardH, shape);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cardW, cardH);

    // Compute text bounding box (kept safely inside the card shape)
    const marg = px(Math.max(this.cardLayout.marginTop, this.cardLayout.marginLeft));
    let tx: number, ty: number, tw: number, th: number;

    if (shape === 'circle') {
      const r = cardW / 2;
      const innerR = r - marg;
      const halfSide = Math.round(innerR / Math.SQRT2);
      tx = r - halfSide;
      ty = r - halfSide;
      tw = halfSide * 2;
      th = halfSide * 2;
    } else if (shape === 'hexagon') {
      // Left boundary of the hex at y=marg: x = 0.25W*(1 - 2*marg/H)
      const hEdge = Math.round(cardW * 0.25 * (1 - 2 * marg / cardH));
      const extraPad = Math.round(marg * 0.3);
      tx = hEdge + extraPad;
      ty = marg;
      tw = cardW - 2 * tx;
      th = cardH - 2 * marg;
    } else {
      tx = marg;
      ty = marg;
      tw = cardW - 2 * marg;
      th = cardH - 2 * marg;
    }

    // Find the largest base font size where all content fits vertically
    let baseFz = Math.max(13, Math.round(tw / 11));
    while (baseFz > 13) {
      if (instructionCardHeight(ctx, game, t, baseFz, tw, gameIndex) <= th) break;
      baseFz--;
    }

    const titleFz = Math.round(baseFz * 1.45);
    const titleLineH = Math.round(titleFz * 1.3);
    const bodyLineH = Math.round(baseFz * 1.4);
    const gapH = Math.round(baseFz * 0.8);

    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';
    let y = ty;

    // Title — bold, centered, prefixed with game number
    ctx.font = `bold ${titleFz}px sans-serif`;
    ctx.textAlign = 'center';
    for (const line of wrapText(ctx, `${gameIndex}. ${game.title}`, tw)) {
      ctx.fillText(line, tx + tw / 2, y);
      y += titleLineH;
    }
    ctx.textAlign = 'left';

    // Divider
    y += Math.round(gapH * 0.3);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = Math.max(1, Math.round(baseFz * 0.06));
    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx + tw, y);
    ctx.stroke();
    y += Math.round(gapH * 0.5);

    // "Goal: " label (bold) + goal text (normal) on the same line
    ctx.font = `bold ${baseFz}px sans-serif`;
    const goalLabel = t.goalLabel + ': ';
    const goalLabelW = ctx.measureText(goalLabel).width;
    ctx.fillText(goalLabel, tx, y);
    ctx.font = `${baseFz}px sans-serif`;
    const goalLines = wrapText(ctx, game.goal, tw - goalLabelW);
    ctx.fillText(goalLines[0] ?? '', tx + goalLabelW, y);
    for (let li = 1; li < goalLines.length; li++) {
      y += bodyLineH;
      ctx.fillText(goalLines[li], tx, y);
    }
    y += bodyLineH + gapH;

    // Numbered steps — step number bold, text normal, continuation lines hang-indented
    const allSteps = [...game.steps, ...(game.extra_steps ?? [])];
    for (let i = 0; i < allSteps.length; i++) {
      if (i === game.steps.length && game.extra_steps?.length) {
        // Small visual break before extra steps
        y += Math.round(gapH * 0.4);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = Math.max(1, Math.round(baseFz * 0.04));
        ctx.setLineDash([Math.round(baseFz * 0.3), Math.round(baseFz * 0.3)]);
        ctx.beginPath();
        ctx.moveTo(tx, y);
        ctx.lineTo(tx + tw, y);
        ctx.stroke();
        ctx.setLineDash([]);
        y += Math.round(gapH * 0.4);
      }
      const isExtra = i >= game.steps.length;
      const pfx = isExtra ? '• ' : `${i + 1}. `;
      ctx.font = isExtra ? `${baseFz}px sans-serif` : `bold ${baseFz}px sans-serif`;
      const pfxW = ctx.measureText(pfx).width;
      ctx.font = `${baseFz}px sans-serif`;
      const stepLines = wrapText(ctx, allSteps[i], tw - pfxW);
      for (let li = 0; li < stepLines.length; li++) {
        if (li === 0) {
          ctx.font = isExtra ? `${baseFz}px sans-serif` : `bold ${baseFz}px sans-serif`;
          ctx.fillText(pfx, tx, y);
          ctx.font = `${baseFz}px sans-serif`;
        }
        ctx.fillText(stepLines[li], tx + pfxW, y);
        y += bodyLineH;
      }
    }

    ctx.restore();

    traceCardShape(ctx, cardW, cardH, shape);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = Math.max(1, Math.round(EXPORT_PX_PER_MM * 0.3));
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text || maxWidth <= 0) return [text ?? ''];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function instructionCardHeight(
  ctx: CanvasRenderingContext2D,
  game: GameTranslation,
  t: AppTranslations,
  baseFz: number,
  tw: number,
  gameIndex: number
): number {
  const titleFz = Math.round(baseFz * 1.45);
  const titleLineH = Math.round(titleFz * 1.3);
  const bodyLineH = Math.round(baseFz * 1.4);
  const gapH = Math.round(baseFz * 0.8);

  ctx.font = `bold ${titleFz}px sans-serif`;
  const titleH = wrapText(ctx, `${gameIndex}. ${game.title}`, tw).length * titleLineH;

  ctx.font = `bold ${baseFz}px sans-serif`;
  const goalLabelW = ctx.measureText(t.goalLabel + ': ').width;
  ctx.font = `${baseFz}px sans-serif`;
  const goalH = wrapText(ctx, game.goal, tw - goalLabelW).length * bodyLineH;

  const allSteps = [...game.steps, ...(game.extra_steps ?? [])];
  let stepsH = 0;
  for (let i = 0; i < allSteps.length; i++) {
    const isExtra = i >= game.steps.length;
    const pfx = isExtra ? '• ' : `${i + 1}. `;
    ctx.font = isExtra ? `${baseFz}px sans-serif` : `bold ${baseFz}px sans-serif`;
    const pfxW = ctx.measureText(pfx).width;
    ctx.font = `${baseFz}px sans-serif`;
    stepsH += wrapText(ctx, allSteps[i], tw - pfxW).length * bodyLineH;
  }
  const extraBreakH = game.extra_steps?.length ? gapH * 0.4 + gapH * 0.4 : 0;

  return (
    titleH +
    gapH * 0.3 + // space before divider
    gapH * 0.5 + // space after divider
    goalH +
    bodyLineH + gapH + // goal bottom spacing
    stepsH +
    extraBreakH
  );
}
