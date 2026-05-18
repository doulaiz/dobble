import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardLayout } from '../../classes/card-layout';

type Card = string[];

@Component({
  selector: 'app-card-preview',
  standalone: true,
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.css'],
  imports: [CommonModule]
})
export class CardPreviewComponent {
  private _cards: Card[] = [];
  imageTransforms: { transform: string }[][] = [];

  @Input() set cards(value: Card[]) {
    this._cards = value;
    this.imageTransforms = value.map(card =>
      card.map(() => {
        const rotate = Math.floor(Math.random() * 360);
        const scale = +(0.7 + Math.random() * 0.6).toFixed(3);
        return { transform: `rotate(${rotate}deg) scale(${scale})` };
      })
    );
  }
  get cards(): Card[] { return this._cards; }

  @Input() cardLayout: CardLayout = new CardLayout();

  private readonly MM_TO_PX = 3.7795;
  private mm(v: number): number { return Math.round(v * this.MM_TO_PX); }

  get cardWidthPx(): number { return this.mm(this.cardLayout.width); }
  get cardHeightPx(): number { return this.mm(this.cardLayout.height); }
  get paddingVPx(): number { return this.mm(this.cardLayout.marginTop); }
  get paddingHPx(): number { return this.mm(this.cardLayout.marginLeft); }
  get contentWidthPx(): number { return this.cardWidthPx - 2 * this.paddingHPx; }
  get contentHeightPx(): number { return this.cardHeightPx - 2 * this.paddingVPx; }

  get imagesPerCard(): number { return this._cards[0]?.length || 4; }
  get gridCols(): number { return Math.ceil(Math.sqrt(this.imagesPerCard)); }
  get gridRows(): number { return Math.ceil(this.imagesPerCard / this.gridCols); }

  get imageSizePx(): number {
    const gap = 4;
    const byW = (this.contentWidthPx - (this.gridCols - 1) * gap) / this.gridCols;
    const byH = (this.contentHeightPx - (this.gridRows - 1) * gap) / this.gridRows;
    return Math.floor(Math.min(byW, byH));
  }

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

  get imageGridStyle(): Record<string, string> {
    return {
      'grid-template-columns': `repeat(${this.gridCols}, ${this.imageSizePx}px)`,
      'grid-auto-rows': `${this.imageSizePx}px`,
    };
  }
}
