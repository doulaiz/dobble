import { Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { CardLayout } from '../../classes/card-layout';
import { ImgLayout } from '../../classes/img-layout';
import { Card, MM_TO_PX } from '../../utils/dobble.utils';

interface DragState {
  ci: number;
  ii: number;
  offsetX: number;
  offsetY: number;
  contentEl: HTMLElement;
  wrapperEl: HTMLElement;
  x: number;
  y: number;
}

@Component({
  selector: 'app-card-preview',
  standalone: true,
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.css'],
  imports: [CommonModule, MatButtonModule, LucideAngularModule]
})
export class CardPreviewComponent implements OnChanges, OnDestroy {
  @Input() cards: Card[] = [];
  @Input() restoredLayouts: ImgLayout[][] = [];
  @Input() cardLayout: CardLayout = new CardLayout();
  @Output() cardLayoutsChange = new EventEmitter<ImgLayout[][]>();

  cardLayouts: ImgLayout[][] = [];
  private drag: DragState | null = null;

  private readonly boundMouseMove = this.onMouseMove.bind(this);
  private readonly boundMouseUp = this.onMouseUp.bind(this);
  private readonly boundTouchMove = this.onTouchMove.bind(this);
  private readonly boundTouchEnd = this.onTouchEnd.bind(this);

  constructor(private ngZone: NgZone) {
    ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
      document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      document.addEventListener('touchend', this.boundTouchEnd);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  reshuffleCard(index: number): void {
    const updated = [...this.cardLayouts];
    updated[index] = this.computeLayout(this.cards[index]);
    this.cardLayouts = updated;
    setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards']) {
      // When cards arrive, use restored layouts if they match exactly (page reload),
      // otherwise compute fresh ones (new generation).
      const restored = this.restoredLayouts;
      if (
        this.cards.length > 0 &&
        restored.length === this.cards.length &&
        restored.every((cl, i) => cl.length === this.cards[i].length)
      ) {
        this.cardLayouts = restored;
      } else {
        this.cardLayouts = this.cards.map(card => this.computeLayout(card));
        if (this.cards.length > 0) setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
      }
    } else if (changes['cardLayout'] && this.cards.length) {
      // Card dimensions changed: recompute positions in the new pixel space.
      this.cardLayouts = this.cards.map(card => this.computeLayout(card));
      setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
    }
  }

  onSymbolMouseDown(event: MouseEvent, ci: number, ii: number): void {
    event.preventDefault();
    this.startDrag(event.clientX, event.clientY, ci, ii, event.currentTarget as HTMLElement);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }

  onSymbolTouchStart(event: TouchEvent, ci: number, ii: number): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.startDrag(touch.clientX, touch.clientY, ci, ii, event.currentTarget as HTMLElement);
  }

  private startDrag(clientX: number, clientY: number, ci: number, ii: number, wrapperEl: HTMLElement): void {
    const layout = this.cardLayouts[ci]?.[ii];
    if (!layout) return;
    const contentEl = wrapperEl.parentElement!;
    const rect = contentEl.getBoundingClientRect();
    this.drag = {
      ci, ii,
      offsetX: clientX - rect.left - layout.x,
      offsetY: clientY - rect.top - layout.y,
      contentEl, wrapperEl,
      x: layout.x, y: layout.y,
    };
    wrapperEl.style.zIndex = '100';
  }

  private moveDrag(clientX: number, clientY: number): void {
    if (!this.drag) return;
    const { ci, ii, offsetX, offsetY, contentEl, wrapperEl } = this.drag;
    const rect = contentEl.getBoundingClientRect();
    const size = this.cardLayouts[ci][ii].size;
    const x = Math.round(Math.max(0, Math.min(this.contentWidthPx - size, clientX - rect.left - offsetX)));
    const y = Math.round(Math.max(0, Math.min(this.contentHeightPx - size, clientY - rect.top - offsetY)));
    this.drag.x = x;
    this.drag.y = y;
    wrapperEl.style.left = x + 'px';
    wrapperEl.style.top = y + 'px';
  }

  private endDrag(): void {
    if (!this.drag) return;
    const { ci, ii, x, y, wrapperEl } = this.drag;
    this.drag = null;
    wrapperEl.style.zIndex = '';
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    this.ngZone.run(() => {
      this.cardLayouts = this.cardLayouts.map((layouts, c) =>
        c === ci ? layouts.map((l, i) => i === ii ? { ...l, x, y } : l) : layouts
      );
      setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
    });
  }

  private onMouseMove(event: MouseEvent): void {
    this.moveDrag(event.clientX, event.clientY);
  }

  private onMouseUp(): void {
    this.endDrag();
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.drag) return;
    event.preventDefault();
    this.moveDrag(event.touches[0].clientX, event.touches[0].clientY);
  }

  private onTouchEnd(): void {
    this.endDrag();
  }

  private mm(v: number): number { return Math.round(v * MM_TO_PX); }

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
    const baseSize = Math.min(W / cols, H / rows) / 1.3 * 1.10;
    const radii = card.map(() => baseSize * (0.7 + Math.random() * 0.6) / 2);

    const pos = card.map((_, i) => ({
      x: radii[i] + Math.random() * (W - 2 * radii[i]),
      y: radii[i] + Math.random() * (H - 2 * radii[i]),
    }));

    const clamp = (i: number) => {
      pos[i].x = Math.max(radii[i], Math.min(W - radii[i], pos[i].x));
      pos[i].y = Math.max(radii[i], Math.min(H - radii[i], pos[i].y));
    };

    const minGap = 1;
    const totalIter = 500;

    for (let iter = 0; iter < totalIter; iter++) {
      const t = 1 - iter / totalIter;   // cooling 1 → 0
      const forces = pos.map(() => ({ x: 0, y: 0 }));
      let hasOverlap = false;

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const minDist = radii[i] + radii[j] + minGap;

          let push = 0;
          if (dist < minDist) {
            push = (minDist - dist) * 0.5;
            hasOverlap = true;
          } else if (t > 0.05) {
            const spreadRange = minDist * (1 + 2 * t);
            if (dist < spreadRange)
              push = ((spreadRange - dist) / spreadRange) * t * minDist * 0.35;
          }

          if (push > 0) {
            const nx = dx / dist, ny = dy / dist;
            forces[i].x += nx * push; forces[i].y += ny * push;
            forces[j].x -= nx * push; forces[j].y -= ny * push;
          }
        }
      }

      if (t > 0.05) {
        for (let i = 0; i < n; i++) {
          const wRange = radii[i] * (1 + 2 * t);
          const strength = t * radii[i] * 0.7;
          if (pos[i].x < wRange) forces[i].x += (1 - pos[i].x / wRange) * strength;
          if (W - pos[i].x < wRange) forces[i].x -= (1 - (W - pos[i].x) / wRange) * strength;
          if (pos[i].y < wRange) forces[i].y += (1 - pos[i].y / wRange) * strength;
          if (H - pos[i].y < wRange) forces[i].y -= (1 - (H - pos[i].y) / wRange) * strength;
        }
      }

      for (let i = 0; i < n; i++) {
        pos[i].x += forces[i].x;
        pos[i].y += forces[i].y;
        clamp(i);
      }

      if (t < 0.02 && !hasOverlap) break;
    }

    return card.map((_, i) => ({
      x: Math.round(pos[i].x - radii[i]),
      y: Math.round(pos[i].y - radii[i]),
      size: Math.round(radii[i] * 2),
      rotate: Math.floor(Math.random() * 360),
    }));
  }
}
