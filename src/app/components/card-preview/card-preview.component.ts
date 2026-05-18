import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardLayout } from '../../classes/card-layout';

type Card = string[];

interface ImgLayout {
  x: number;
  y: number;
  size: number;
  rotate: number;
}

@Component({
  selector: 'app-card-preview',
  standalone: true,
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.css'],
  imports: [CommonModule]
})
export class CardPreviewComponent implements OnChanges {
  private _cards: Card[] = [];
  cardLayouts: ImgLayout[][] = [];

  @Input() set cards(value: Card[]) {
    this._cards = value;
    this.rebuildLayouts();
  }
  get cards(): Card[] { return this._cards; }

  @Input() cardLayout: CardLayout = new CardLayout();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardLayout'] && this._cards.length) {
      this.rebuildLayouts();
    }
  }

  private rebuildLayouts(): void {
    this.cardLayouts = this._cards.map(card => this.computeLayout(card));
  }

  private readonly MM_TO_PX = 3.7795;
  private mm(v: number): number { return Math.round(v * this.MM_TO_PX); }

  get cardWidthPx(): number { return this.mm(this.cardLayout.width); }
  get cardHeightPx(): number { return this.mm(this.cardLayout.height); }
  get paddingVPx(): number { return this.mm(this.cardLayout.marginTop); }
  get paddingHPx(): number { return this.mm(this.cardLayout.marginLeft); }
  get contentWidthPx(): number { return this.cardWidthPx - 2 * this.paddingHPx; }
  get contentHeightPx(): number { return this.cardHeightPx - 2 * this.paddingVPx; }

  get cardStyle(): Record<string, string> {
    const base: Record<string, string> = {
      width: `${this.cardWidthPx}px`,
      height: `${this.cardHeightPx}px`,
      padding: `${this.paddingVPx}px ${this.paddingHPx}px`,
    };
    if (this.cardLayout.backgroundImage) {
      base['backgroundImage'] = `url(${this.cardLayout.backgroundImage})`;
      base['backgroundSize'] = 'cover';
      base['backgroundPosition'] = 'center';
    }
    return base;
  }

  private computeLayout(card: Card): ImgLayout[] {
    const n = card.length;
    const W = this.contentWidthPx;
    const H = this.contentHeightPx;

    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);

    // Base diameter: at max scale the circle fits within its grid cell with a small gap
    const maxScale = 1.3;
    const baseSize = Math.min(W / cols, H / rows) / maxScale * 0.90;

    const scales = card.map(() => 0.7 + Math.random() * 0.6);
    const radii  = scales.map(s => (baseSize * s) / 2);

    // Start each circle near its grid-cell centre with a random jitter
    const cellW = W / cols;
    const cellH = H / rows;
    const pos = card.map((_, i) => ({
      x: (i % cols + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.5,
      y: (Math.floor(i / cols) + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.5,
    }));

    const clamp = (i: number) => {
      pos[i].x = Math.max(radii[i], Math.min(W - radii[i], pos[i].x));
      pos[i].y = Math.max(radii[i], Math.min(H - radii[i], pos[i].y));
    };
    for (let i = 0; i < n; i++) clamp(i);

    // Iterative relaxation: push overlapping circles apart
    const minGap = 3;
    for (let iter = 0; iter < 400; iter++) {
      let moved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pos[j].x - pos[i].x;
          const dy = pos[j].y - pos[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const need = radii[i] + radii[j] + minGap;
          if (dist < need) {
            const push = (need - dist) / 2;
            const nx = (dx / dist) * push;
            const ny = (dy / dist) * push;
            pos[i].x -= nx; pos[i].y -= ny;
            pos[j].x += nx; pos[j].y += ny;
            moved = true;
          }
        }
        clamp(i);
      }
      if (!moved) break;
    }

    return card.map((_, i) => ({
      x: Math.round(pos[i].x - radii[i]),
      y: Math.round(pos[i].y - radii[i]),
      size: Math.round(radii[i] * 2),
      rotate: Math.floor(Math.random() * 360),
    }));
  }
}
