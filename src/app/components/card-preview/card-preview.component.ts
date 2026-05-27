import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { CardLayout } from '../../classes/card-layout';
import { ImgLayout } from '../../classes/img-layout';
import { Card, MM_TO_PX, cardWidthMm, cardHeightMm } from '../../utils/dobble.utils';

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

interface PinchState {
  ci: number;
  ii: number;
  initialDist: number;
  initialSize: number;
  currentSize: number;
  currentX: number;
  currentY: number;
  centerX: number;
  centerY: number;
  wrapperEl: HTMLElement;
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
  reshufflingCards = new Set<number>();
  marginVisible: boolean[] = [];
  private marginTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private destroyed = false;
  private drag: DragState | null = null;
  private pinch: PinchState | null = null;
  // Incremented each time a new batch layout is started; used to cancel stale runs.
  private layoutGen = 0;
  // True while the passive:false touchmove listener is attached
  private touchMoveActive = false;

  private readonly boundMouseMove = this.onMouseMove.bind(this);
  private readonly boundMouseUp = this.onMouseUp.bind(this);
  private readonly boundTouchMove = this.onTouchMove.bind(this);
  private readonly boundTouchEnd = this.onTouchEnd.bind(this);

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
      document.addEventListener('touchend', this.boundTouchEnd);
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.layoutGen++; // cancel any in-progress layout computation
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.touchMoveActive) document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
    this.marginTimers.forEach(t => clearTimeout(t));
  }

  reshuffleCard(index: number): void {
    this.reshufflingCards.add(index);
    const updated = [...this.cardLayouts];
    updated[index] = this.computeLayout(this.cards[index]);
    this.cardLayouts = updated;
    setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
    this.flashMargin(index);
  }

  onReshuffleAnimEnd(index: number): void {
    this.reshufflingCards.delete(index);
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
        // Pre-fill with empty slot arrays so card containers render immediately
        // while the async layout computation fills them in one card per frame
        this.cardLayouts = this.cards.map(() => []);
        this.scheduleLayoutComputation(this.cards);
      }
      this.marginVisible = new Array(this.cards.length).fill(false);
      if (this.cards.length > 0) setTimeout(() => this.flashAllMargins());
    } else if (changes['cardLayout'] && this.cards.length) {
      // Card dimensions changed: recompute positions in the new pixel space.
      this.cardLayouts = this.cards.map(() => []);
      this.scheduleLayoutComputation(this.cards);
    }
  }

  // Computes layouts one card per animation frame so the main thread is never
  // blocked for more than a single card's simulation (~few ms) at a time
  // Runs outside Angular zone to avoid triggering change detection on every frame;
  // re-enters the zone once with the completed result.
  private scheduleLayoutComputation(cards: Card[]): void {
    const gen = ++this.layoutGen;
    this.ngZone.runOutsideAngular(async () => {
      const layouts: ImgLayout[][] = [];
      for (const card of cards) {
        if (gen !== this.layoutGen) return; // cancelled by a newer call or destroy
        layouts.push(this.computeLayout(card));
        await new Promise<void>(r => requestAnimationFrame(() => r()));
      }
      if (gen !== this.layoutGen) return;
      this.ngZone.run(() => {
        this.cardLayouts = layouts;
        this.cdr.detectChanges();
        setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
      });
    });
  }

  onSymbolMouseDown(event: MouseEvent, ci: number, ii: number): void {
    event.preventDefault();
    if (event.ctrlKey || event.shiftKey) {
      this.resizeImage(ci, ii, event.ctrlKey ? 1.1 : 0.9);
      return;
    }
    this.startDrag(event.clientX, event.clientY, ci, ii, event.currentTarget as HTMLElement);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }

  private resizeImage(ci: number, ii: number, factor: number): void {
    const layout = this.cardLayouts[ci]?.[ii];
    if (!layout) return;
    const minSize = 16;
    const PR = this.placementRadiusPx;
    const maxSize = PR !== null ? PR * 2 : Math.min(this.contentWidthPx, this.contentHeightPx);
    const newSize = Math.round(Math.max(minSize, Math.min(maxSize, layout.size * factor)));
    const imgCx = layout.x + layout.size / 2;
    const imgCy = layout.y + layout.size / 2;
    let newX = Math.round(imgCx - newSize / 2);
    let newY = Math.round(imgCy - newSize / 2);
    const W = this.contentWidthPx, H = this.contentHeightPx;
    if (PR !== null) {
      const r = newSize / 2;
      const maxR = Math.max(0, PR - r);
      const dx = imgCx - W / 2, dy = imgCy - H / 2;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist > maxR) { newX = Math.round(W / 2 + dx / dist * maxR - r); newY = Math.round(H / 2 + dy / dist * maxR - r); }
      newX = Math.max(0, Math.min(W - newSize, newX));
      newY = Math.max(0, Math.min(H - newSize, newY));
    } else {
      newX = Math.max(0, Math.min(W - newSize, newX));
      newY = Math.max(0, Math.min(H - newSize, newY));
    }
    this.cardLayouts = this.cardLayouts.map((layouts, c) =>
      c === ci ? layouts.map((l, i) => i === ii ? { ...l, size: newSize, x: newX, y: newY } : l) : layouts
    );
    setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
  }

  onSymbolTouchStart(event: TouchEvent, ci: number, ii: number): void {
    event.preventDefault();
    if (event.touches.length >= 2) {
      if (this.drag) {
        this.drag.wrapperEl.style.zIndex = '';
        this.drag = null;
      }
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const layout = this.cardLayouts[ci]?.[ii];
      const size = layout?.size ?? 0;
      const centerX = (layout?.x ?? 0) + size / 2;
      const centerY = (layout?.y ?? 0) + size / 2;
      this.pinch = { ci, ii, initialDist: dist, initialSize: size, currentSize: size, currentX: layout?.x ?? 0, currentY: layout?.y ?? 0, centerX, centerY, wrapperEl: event.currentTarget as HTMLElement };
      if (!this.touchMoveActive) {
        this.ngZone.runOutsideAngular(() =>
          document.addEventListener('touchmove', this.boundTouchMove, { passive: false })
        );
        this.touchMoveActive = true;
      }
      return;
    }
    this.startDrag(event.touches[0].clientX, event.touches[0].clientY, ci, ii, event.currentTarget as HTMLElement);
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
    if (!this.touchMoveActive) {
      this.ngZone.runOutsideAngular(() =>
        document.addEventListener('touchmove', this.boundTouchMove, { passive: false })
      );
      this.touchMoveActive = true;
    }
  }

  private moveDrag(clientX: number, clientY: number): void {
    if (!this.drag) return;
    const { ci, ii, offsetX, offsetY, contentEl, wrapperEl } = this.drag;
    const rect = contentEl.getBoundingClientRect();
    const size = this.cardLayouts[ci][ii].size;
    const W = this.contentWidthPx, H = this.contentHeightPx;
    let x = clientX - rect.left - offsetX;
    let y = clientY - rect.top - offsetY;

    const PR = this.placementRadiusPx;
    if (PR !== null) {
      const r = size / 2;
      const maxR = Math.max(0, PR - r);
      const dx = x + r - W / 2, dy = y + r - H / 2;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist > maxR) { x = W / 2 + dx / dist * maxR - r; y = H / 2 + dy / dist * maxR - r; }
      x = Math.max(0, Math.min(W - size, x));
      y = Math.max(0, Math.min(H - size, y));
    } else {
      x = Math.max(0, Math.min(W - size, x));
      y = Math.max(0, Math.min(H - size, y));
    }
    x = Math.round(x); y = Math.round(y);
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
    if (!this.pinch && this.touchMoveActive) {
      document.removeEventListener('touchmove', this.boundTouchMove);
      this.touchMoveActive = false;
    }
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
    if (this.pinch) {
      if (event.touches.length >= 2) {
        event.preventDefault();
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const factor = dist / this.pinch.initialDist;
        const minSize = 16;
        const maxSize = Math.min(this.contentWidthPx, this.contentHeightPx);
        const newSize = Math.round(Math.max(minSize, Math.min(maxSize, this.pinch.initialSize * factor)));
        const newX = Math.max(0, Math.min(this.contentWidthPx - newSize, Math.round(this.pinch.centerX - newSize / 2)));
        const newY = Math.max(0, Math.min(this.contentHeightPx - newSize, Math.round(this.pinch.centerY - newSize / 2)));
        this.pinch.currentSize = newSize;
        this.pinch.currentX = newX;
        this.pinch.currentY = newY;
        this.pinch.wrapperEl.style.width = newSize + 'px';
        this.pinch.wrapperEl.style.height = newSize + 'px';
        this.pinch.wrapperEl.style.left = newX + 'px';
        this.pinch.wrapperEl.style.top = newY + 'px';
      }
      return;
    }
    if (!this.drag) return;
    event.preventDefault();
    this.moveDrag(event.touches[0].clientX, event.touches[0].clientY);
  }

  private onTouchEnd(event: TouchEvent): void {
    if (this.pinch) {
      if (event.touches.length < 2) {
        const { ci, ii, currentSize, currentX, currentY, wrapperEl } = this.pinch;
        wrapperEl.style.width = '';
        wrapperEl.style.height = '';
        wrapperEl.style.left = '';
        wrapperEl.style.top = '';
        this.pinch = null;
        if (!this.drag && this.touchMoveActive) {
          document.removeEventListener('touchmove', this.boundTouchMove);
          this.touchMoveActive = false;
        }
        this.ngZone.run(() => {
          this.cardLayouts = this.cardLayouts.map((layouts, c) =>
            c === ci ? layouts.map((l, i) => i === ii ? { ...l, size: currentSize, x: currentX, y: currentY } : l) : layouts
          );
          setTimeout(() => this.cardLayoutsChange.emit(this.cardLayouts));
        });
      }
      return;
    }
    this.endDrag();
  }

  private mm(v: number): number { return Math.round(v * MM_TO_PX); }

  private get shape() { return this.cardLayout.shape || 'rectangle'; }

  get cardWidthPx(): number { return this.mm(cardWidthMm(this.cardLayout)); }
  get cardHeightPx(): number { return this.mm(cardHeightMm(this.cardLayout)); }

  // For rectangle: CSS padding creates the margin. For circle/hexagon: no CSS padding;
  // the layout algorithm enforces the margin via the placement circle.
  get paddingVPx(): number { return this.shape === 'rectangle' ? this.mm(this.cardLayout.marginTop) : 0; }
  get paddingHPx(): number { return this.shape === 'rectangle' ? this.mm(this.cardLayout.marginLeft) : 0; }
  get contentWidthPx(): number { return this.cardWidthPx - 2 * this.paddingHPx; }
  get contentHeightPx(): number { return this.cardHeightPx - 2 * this.paddingVPx; }

  /** Radius of the circle within which image centres must stay (null = rectangle). */
  get placementRadiusPx(): number | null {
    const margin = this.mm(this.cardLayout.marginTop);
    if (this.shape === 'circle') return this.cardWidthPx / 2 - margin;
    if (this.shape === 'hexagon') return this.cardWidthPx * Math.sqrt(3) / 4 - margin;
    return null;
  }

  get hexOutlinePoints(): string {
    const W = this.cardWidthPx, H = this.cardHeightPx;
    return `${W*0.25},0 ${W*0.75},0 ${W},${H*0.5} ${W*0.75},${H} ${W*0.25},${H} 0,${H*0.5}`;
  }

  get cardStyle(): Record<string, string> {
    const hasBg = !!this.cardLayout.backgroundImage;
    const base: Record<string, string> = {
      width: `${this.cardWidthPx}px`,
      height: `${this.cardHeightPx}px`,
      padding: `${this.paddingVPx}px ${this.paddingHPx}px`,
    };
    if (this.shape === 'circle') base['borderRadius'] = '50%';
    if (this.shape === 'hexagon') base['clipPath'] = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    if (hasBg) {
      base['backgroundImage'] = `url(${this.cardLayout.backgroundImage})`;
      base['backgroundSize'] = 'cover';
      base['backgroundPosition'] = 'center';
    }
    return base;
  }

  get contentStyle(): Record<string, string> {
    if (!this.cardLayout.backgroundImage && this.shape === 'rectangle') {
      return { background: 'white' };
    }
    return {};
  }

  get marginDiscStyle(): Record<string, string> | null {
    if (this.shape === 'rectangle' || !!this.cardLayout.backgroundImage) return null;
    if (this.shape === 'hexagon') {
      const margin = this.mm(this.cardLayout.marginTop);
      const innerW = Math.max(0, this.cardWidthPx - margin * 4 / Math.sqrt(3));
      const innerH = innerW * Math.sqrt(3) / 2;
      return {
        position: 'absolute',
        width: `${innerW}px`,
        height: `${innerH}px`,
        left: `${(this.cardWidthPx - innerW) / 2}px`,
        top: `${(this.cardHeightPx - innerH) / 2}px`,
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        background: 'white',
        pointerEvents: 'none',
      };
    }
    // circle
    const r = this.placementRadiusPx!;
    const size = r * 2;
    return {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      left: `${(this.cardWidthPx - size) / 2}px`,
      top: `${(this.cardHeightPx - size) / 2}px`,
      borderRadius: '50%',
      background: 'white',
      pointerEvents: 'none',
    };
  }

  private flashMargin(ci: number, duration = 1600): void {
    const existing = this.marginTimers.get(ci);
    if (existing) clearTimeout(existing);
    this.marginVisible[ci] = true;
    this.marginTimers.set(ci, setTimeout(() => {
      if (this.destroyed) return;
      this.marginVisible[ci] = false;
      this.marginTimers.delete(ci);
      this.cdr.detectChanges();
    }, duration));
  }

  private flashAllMargins(): void {
    for (let i = 0; i < this.cards.length; i++) this.flashMargin(i);
  }

  onCardMouseEnter(ci: number): void {
    this.flashMargin(ci);
  }

  onCardMouseLeave(ci: number): void {
    if (this.marginVisible[ci]) this.flashMargin(ci, 400);
  }

  private computeLayout(card: Card): ImgLayout[] {
    const n = card.length;
    const W = this.contentWidthPx;
    const H = this.contentHeightPx;
    const PR = this.placementRadiusPx;
    const isRound = PR !== null;
    const cx = W / 2, cy = H / 2;

    // Start at ~65% area coverage — feasible for random placement, grow-to-fill will push higher.
    const area = isRound ? Math.PI * PR! * PR! : W * H;
    const baseRadius = Math.sqrt(0.65 * area / (n * Math.PI));
    let radii = card.map(() => baseRadius * (0.8 + Math.random() * 0.4));

    const pos: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      if (isRound) {
        const maxR = Math.max(0, PR! - radii[i]);
        const r = maxR * Math.sqrt(Math.random());
        const a = Math.random() * 2 * Math.PI;
        pos.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      } else {
        pos.push({
          x: radii[i] + Math.random() * Math.max(0, W - 2 * radii[i]),
          y: radii[i] + Math.random() * Math.max(0, H - 2 * radii[i]),
        });
      }
    }

    const gap = 4; // minimum pixels of space between image edges

    const clamp = (i: number) => {
      if (isRound) {
        const dx = pos[i].x - cx, dy = pos[i].y - cy;
        const dist = Math.hypot(dx, dy) || 0.001;
        const maxR = Math.max(0, PR! - radii[i]);
        if (dist > maxR) { pos[i].x = cx + dx / dist * maxR; pos[i].y = cy + dy / dist * maxR; }
      } else {
        pos[i].x = Math.max(radii[i], Math.min(W - radii[i], pos[i].x));
        pos[i].y = Math.max(radii[i], Math.min(H - radii[i], pos[i].y));
      }
    };

    // Pure repulsion settle — no spreading force so circles stay as dense as possible.
    // Returns true when all overlaps resolved before maxIter.
    const settle = (maxIter: number): boolean => {
      for (let iter = 0; iter < maxIter; iter++) {
        const fx = new Array(n).fill(0);
        const fy = new Array(n).fill(0);
        let hasOverlap = false;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const dx = pos[i].x - pos[j].x;
            const dy = pos[i].y - pos[j].y;
            const dist = Math.hypot(dx, dy) || 0.001;
            const need = radii[i] + radii[j] + gap;
            if (dist < need) {
              const push = (need - dist) * 0.5;
              const nx = dx / dist, ny = dy / dist;
              fx[i] += nx * push; fy[i] += ny * push;
              fx[j] -= nx * push; fy[j] -= ny * push;
              hasOverlap = true;
            }
          }
        }
        for (let i = 0; i < n; i++) { pos[i].x += fx[i]; pos[i].y += fy[i]; clamp(i); }
        if (!hasOverlap) return true;
      }
      // Check if residual overlaps exceed tolerance
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
          if (Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) < radii[i] + radii[j] + gap - 0.5)
            return false;
      return true;
    };

    settle(600);

    // Grow-to-fill: enlarge all circles 5% per round, re-settle, stop when it no longer fits.
    for (let round = 0; round < 30; round++) {
      const prevRadii = radii.slice();
      const prevPos = pos.map(p => ({ ...p }));
      radii = radii.map(r => r * 1.05);
      for (let i = 0; i < n; i++) clamp(i);
      if (!settle(200)) {
        radii = prevRadii;
        for (let i = 0; i < n; i++) { pos[i].x = prevPos[i].x; pos[i].y = prevPos[i].y; }
        break;
      }
    }

    return card.map((_, i) => ({
      x: pos[i].x - radii[i],
      y: pos[i].y - radii[i],
      size: radii[i] * 2,
      rotate: Math.floor(Math.random() * 360),
    }));
  }
}
