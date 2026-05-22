import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { CardLayout } from '../../classes/card-layout';
import { ImgLayout } from '../../classes/img-layout';
import { Card, MM_TO_PX, cardWidthMm, cardHeightMm, applyCardShapeClip, traceCardShape } from '../../utils/dobble.utils';
import { LanguageService } from '../../services/language.service';

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
