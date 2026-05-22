import { Component, EventEmitter, HostListener, inject, Input, NgZone, Output } from '@angular/core';
import { NgStyle } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { CardLayout, CardShape } from '../../classes/card-layout';
import { cardWidthMm, cardHeightMm } from '../../utils/dobble.utils';
import { pickFile } from '../../utils/pick-file';
import { LanguageService } from '../../services/language.service';

const SHAPES: CardShape[] = ['rectangle', 'circle', 'hexagon'];
const SHAPE_LABELS: Record<CardShape, string> = {
  rectangle: '▭',
  circle: '○',
  hexagon: '⬡',
};

@Component({
  selector: 'app-card-layout-settings',
  standalone: true,
  imports: [NgStyle, MatButtonModule, LucideAngularModule],
  templateUrl: './card-layout-settings.component.html',
  styleUrls: ['./card-layout-settings.component.css']
})
export class CardLayoutSettingsComponent {
  @Input() layout: CardLayout = new CardLayout();
  @Output() layoutChange = new EventEmitter<CardLayout>();

  showPanel = false;

  readonly t = inject(LanguageService).t;

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showPanel) this.showPanel = false;
  }

  readonly previewPlaceholders = [0, 1, 2, 3, 4, 5];

  constructor(private ngZone: NgZone) {}

  get shape(): CardShape { return this.layout.shape || 'rectangle'; }
  get shapeLabel(): string { return SHAPE_LABELS[this.shape]; }
  get isRound(): boolean { return this.shape !== 'rectangle'; }

  get scale(): number {
    const w = cardWidthMm(this.layout);
    const h = cardHeightMm(this.layout);
    return 180 / Math.max(w, h);
  }

  get previewCardWidth(): number { return cardWidthMm(this.layout) * this.scale; }
  get previewCardHeight(): number { return cardHeightMm(this.layout) * this.scale; }
  get previewMarginTop(): number { return (this.layout.marginTop || 0) * this.scale; }
  get previewMarginLeft(): number {
    return (this.isRound ? this.layout.marginTop : this.layout.marginLeft || 0) * this.scale;
  }
  get previewBgStyle(): string {
    return this.layout.backgroundImage ? `url(${this.layout.backgroundImage})` : '';
  }
  get previewCardStyle(): Record<string, string> {
    const s: Record<string, string> = {};
    if (this.shape === 'circle') s['borderRadius'] = '50%';
    if (this.shape === 'hexagon') s['clipPath'] = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    return s;
  }
  get previewMarginStyle(): Record<string, string> {
    if (this.isRound) return { borderRadius: '50%' };
    return {};
  }

  cycleShape() {
    const next = SHAPES[(SHAPES.indexOf(this.shape) + 1) % SHAPES.length];
    const d = Math.round((this.layout.width + this.layout.height) / 2);
    const margin = this.layout.marginTop;
    if (next === 'rectangle') {
      this.layout = { ...this.layout, shape: next };
    } else {
      this.layout = { ...this.layout, shape: next, diameter: this.layout.diameter || d, marginTop: margin };
    }
    this.layoutChange.emit(this.layout);
  }

  update(field: keyof CardLayout, value: number | string) {
    if (field === 'width' || field === 'height' || field === 'diameter') {
      value = Math.max(10, Math.min(500, +value || 10));
    } else if (field === 'marginTop' || field === 'marginLeft') {
      value = Math.max(0, Math.min(100, +value || 0));
    }
    this.layout = { ...this.layout, [field]: value };
    this.layoutChange.emit(this.layout);
  }

  async browseBackground() {
    const result = await pickFile('image/png,image/jpeg,image/webp', this.ngZone);
    if (!result) return;
    this.update('backgroundImage', result);
  }

  clearBackground() {
    this.update('backgroundImage', '');
  }
}
