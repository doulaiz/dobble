import { Component, Input } from '@angular/core';
import { CardLayout } from '../../classes/card-layout';
import { ImgLayout } from '../../classes/img-layout';

type Card = string[];

@Component({
  selector: 'app-export-panel',
  standalone: true,
  templateUrl: './export-panel.component.html',
  styleUrls: ['./export-panel.component.css']
})
export class ExportPanelComponent {
  @Input() cards: Card[] = [];
  @Input() cardLayouts: ImgLayout[][] = [];
  @Input() cardLayout: CardLayout = new CardLayout();

  exporting = false;

  async exportImages() {
    if (!this.cards.length) return;
    this.exporting = true;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const MM_TO_PX = 3.7795;
      const mm = (v: number) => Math.round(v * MM_TO_PX);
      const cardW = mm(this.cardLayout.width);
      const cardH = mm(this.cardLayout.height);
      const padH = mm(this.cardLayout.marginLeft);
      const padV = mm(this.cardLayout.marginTop);

      for (let ci = 0; ci < this.cards.length; ci++) {
        const canvas = document.createElement('canvas');
        canvas.width = cardW;
        canvas.height = cardH;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cardW, cardH);

        if (this.cardLayout.backgroundImage) {
          const bg = await loadImage(this.cardLayout.backgroundImage);
          ctx.drawImage(bg, 0, 0, cardW, cardH);
        }

        const layout = this.cardLayouts[ci] ?? [];
        for (let ii = 0; ii < this.cards[ci].length; ii++) {
          const l = layout[ii];
          if (!l) continue;
          const img = await loadImage(this.cards[ci][ii]);
          const cx = padH + l.x + l.size / 2;
          const cy = padV + l.y + l.size / 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(l.rotate * Math.PI / 180);
          ctx.drawImage(img, -l.size / 2, -l.size / 2, l.size, l.size);
          ctx.restore();
        }

        const blob = await canvasToBlob(canvas);
        zip.file(`${ci + 1}.png`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cards.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exporting = false;
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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
}
