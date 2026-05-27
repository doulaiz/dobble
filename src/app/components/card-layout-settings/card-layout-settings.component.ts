import { Component, ElementRef, EventEmitter, HostListener, inject, Input, NgZone, Output } from '@angular/core';
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
  onEscape() { if (this.showPanel) this.showPanel = false; }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showPanel) this.showPanel = false;
  }

  onToggleClick(event: MouseEvent) {
    event.stopPropagation(); // keep this out of onDocumentClick
    if (!this.showPanel) {
      this.showPanel = true;
      return;
    }
    // When panel is open, only close if the tap is within the button's visual bounds.
    // Material injects spans (mat-focus-indicator, mat-mdc-button-touch-target) that
    // extend beyond the button on mobile; taps on those spans should not close the panel.
    const btn = event.currentTarget as HTMLElement;
    const r = btn.getBoundingClientRect();
    if (event.clientX >= r.left && event.clientX <= r.right &&
        event.clientY >= r.top  && event.clientY <= r.bottom) {
      this.showPanel = false;
    }
  }

  constructor(private ngZone: NgZone, private elementRef: ElementRef) {}

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
    const mt = this.previewMarginTop;
    const ml = this.previewMarginLeft;
    if (this.shape === 'hexagon') return { display: 'none' };
    if (this.shape === 'circle') {
      return { borderRadius: '50%', top: `${mt}px`, left: `${ml}px`, right: `${ml}px`, bottom: `${mt}px` };
    }
    return { top: `${mt}px`, left: `${ml}px`, right: `${ml}px`, bottom: `${mt}px` };
  }

  get hexagonMarginSvgPoints(): string | null {
    if (this.shape !== 'hexagon') return null;
    const mt = this.previewMarginTop;
    const innerW = Math.max(0, this.previewCardWidth - mt * 4 / Math.sqrt(3));
    const innerH = innerW * Math.sqrt(3) / 2;
    const ox = (this.previewCardWidth - innerW) / 2;
    const oy = (this.previewCardHeight - innerH) / 2;
    return [
      [ox + innerW * 0.25, oy],
      [ox + innerW * 0.75, oy],
      [ox + innerW,        oy + innerH * 0.5],
      [ox + innerW * 0.75, oy + innerH],
      [ox + innerW * 0.25, oy + innerH],
      [ox,                 oy + innerH * 0.5],
    ].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  }

  cycleShape() {
    const next = SHAPES[(SHAPES.indexOf(this.shape) + 1) % SHAPES.length];
    const d = Math.round((this.layout.width + this.layout.height) / 2);
    let newLayout: CardLayout = next === 'rectangle'
      ? { ...this.layout, shape: next }
      : { ...this.layout, shape: next, diameter: this.layout.diameter || d };
    newLayout.marginTop = Math.min(newLayout.marginTop, this.computeMaxTopMargin(newLayout));
    this.layout = newLayout;
    this.layoutChange.emit(this.layout);
  }

  update(field: keyof CardLayout, value: number | string) {
    const next: CardLayout = { ...this.layout };
    const clampDim = (v: number) => Math.max(10, Math.min(500, v || 10));
    if (field === 'width' || field === 'height' || field === 'diameter') {
      // All three are number fields — TypeScript knows next[field]: number here.
      next[field] = clampDim(+value);
      next.marginTop = Math.min(next.marginTop, this.computeMaxTopMargin(next));
      next.marginLeft = Math.min(next.marginLeft, this.computeMaxLeftMargin(next));
    } else if (field === 'marginTop') {
      next.marginTop = Math.max(0, Math.min(this.computeMaxTopMargin(next), +value || 0));
    } else if (field === 'marginLeft') {
      next.marginLeft = Math.max(0, Math.min(this.computeMaxLeftMargin(next), +value || 0));
    } else if (field === 'shape') {
      next.shape = value as CardShape;
    } else if (field === 'backgroundImage') {
      next.backgroundImage = value as string;
    }
    this.layout = next;
    this.layoutChange.emit(this.layout);
  }

  private computeMaxTopMargin(layout: CardLayout): number {
    const d = layout.diameter || 88;
    if ((layout.shape || 'rectangle') === 'rectangle') return Math.floor((layout.height - 1) / 2);
    if (layout.shape === 'circle') return Math.floor((d - 1) / 2);
    // hexagon: inradius = d × √3/4; margin must stay below it
    return Math.max(0, Math.floor(d * Math.sqrt(3) / 4 - 0.5));
  }

  private computeMaxLeftMargin(layout: CardLayout): number {
    return Math.floor((layout.width - 1) / 2);
  }

  get maxTopMargin(): number { return this.computeMaxTopMargin(this.layout); }
  get maxLeftMargin(): number { return this.computeMaxLeftMargin(this.layout); }

  async browseBackground() {
    const result = await pickFile('image/png,image/jpeg,image/webp', this.ngZone);
    if (!result) return;
    this.update('backgroundImage', result);
  }

  clearBackground() {
    this.update('backgroundImage', '');
  }
}
