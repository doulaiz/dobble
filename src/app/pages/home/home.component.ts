import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CardPreviewComponent } from '../../components/card-preview/card-preview.component';
import { ExportPanelComponent } from '../../components/export-panel/export-panel.component';
import { ModeSelectorComponent } from '../../components/mode-selector/mode-selector.component';
import { ImagesWrapperComponent } from '../../components/images-wrapper/images-wrapper.component';
import { CardLayoutSettingsComponent } from '../../components/card-layout-settings/card-layout-settings.component';
import { PersistenceService, PersistedState } from '../../services/persistence.service';
import { LanguageService } from '../../services/language.service';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';
import { ImageState } from '../../classes/image-state';
import { CardLayout } from '../../classes/card-layout';
import { ImgLayout } from '../../classes/img-layout';
import { Card, Mode, requiredImagesForMode } from '../../utils/dobble.utils';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    ModeSelectorComponent,
    CardPreviewComponent,
    ExportPanelComponent,
    ImagesWrapperComponent,
    CardLayoutSettingsComponent,
    LanguageSwitcherComponent,
  ],
})
export class HomeComponent implements OnInit {
  readonly appVersion = version;

  mode: Mode = 6;
  requiredImages = requiredImagesForMode(6);
  imagesReady = false;
  images: string[] = [];
  cards: Card[] = [];
  cardIndices: number[][] = [];
  savedCardLayouts: ImgLayout[][] = [];
  savedImageStates: ImageState[] = [];
  showResetConfirm = false;
  saveError = false;
  generateError = false;
  cardLayout: CardLayout = new CardLayout();
  private imageChangedByUser = false;

  private readonly persistence = inject(PersistenceService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly langService = inject(LanguageService);

  readonly t = this.langService.t;

  private saveState(state: PersistedState): void {
    this.persistence.save(state).catch(err => {
      console.error('[Dobble] Failed to save state:', err);
      this.saveError = true;
    });
  }

  async ngOnInit(): Promise<void> {
    const saved = await this.persistence.load();
    if (saved) {
      this.mode = saved.mode;
      this.requiredImages = requiredImagesForMode(saved.mode);
      this.savedImageStates = saved.imageStates ?? [];
      this.savedCardLayouts = saved.cardLayouts ?? [];
      this.cardLayout = saved.cardLayout ?? new CardLayout();

      const allImages = this.savedImageStates.map(s => s.croppedImage);
      if (
        this.savedImageStates.length === this.requiredImages &&
        allImages.every(img => img)
      ) {
        this.images = allImages;
        this.imagesReady = true;
      }

      if (saved.cardIndices?.length) {
        this.cardIndices = saved.cardIndices;
        if (this.imagesReady) {
          this.cards = saved.cardIndices.map(indices => indices.map(i => this.images[i]));
        }
      } else if (saved.cards?.length) {
        this.cards = saved.cards;
      }

      this.cdr.detectChanges();
    }
  }

  get allImagesFilled(): boolean {
    return this.savedImageStates.length === this.requiredImages &&
      this.savedImageStates.every(s => s.image || s.croppedImage);
  }

  fillWithDefaults() {
    const current = Array.from({ length: this.requiredImages }, (_, i) =>
      this.savedImageStates[i] ?? new ImageState()
    );
    const filled = current.map((state, i) => {
      if (state.image || state.croppedImage) return state;
      const img = this.generateDefaultImage(i + 1);
      return { ...state, image: img, croppedImage: img, zoomLevel: 1, angleLevel: 0 };
    });
    this.savedImageStates = filled;
    this.saveState({ mode: this.mode, imageStates: filled, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: this.savedCardLayouts });
  }

  resetAll() {
    this.savedImageStates = [];
    this.imagesReady = false;
    this.images = [];
    this.cards = [];
    this.cardIndices = [];
    this.savedCardLayouts = [];
    this.imageChangedByUser = false;
    this.showResetConfirm = false;
    this.saveState({ mode: this.mode, imageStates: [], cardIndices: [], cardLayout: this.cardLayout, cardLayouts: [] });
  }

  onModeChange(mode: Mode) {
    this.mode = mode;
    this.requiredImages = requiredImagesForMode(mode);
    this.imagesReady = false;
    this.images = [];
    this.cards = [];
    this.cardIndices = [];
    this.savedCardLayouts = [];
    this.imageChangedByUser = false;
    this.saveState({ mode, imageStates: this.savedImageStates, cardIndices: [], cardLayout: this.cardLayout, cardLayouts: [] });
  }

  onImagesReady(images: string[]) {
    this.images = images;
    this.imagesReady = images.length === this.requiredImages;
    if (this.imageChangedByUser) {
      this.imageChangedByUser = false;
      this.cards = [];
      this.cardIndices = [];
      this.savedCardLayouts = [];
      this.saveState({ mode: this.mode, imageStates: this.savedImageStates, cardIndices: [], cardLayout: this.cardLayout, cardLayouts: [] });
    }
  }

  onImageStatesChange(imageStates: ImageState[]) {
    this.savedImageStates = imageStates;
    this.imageChangedByUser = true;
    this.saveState({ mode: this.mode, imageStates, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: this.savedCardLayouts });
  }

  onImagesReordered(imageStates: ImageState[]) {
    this.savedImageStates = imageStates;
    this.images = imageStates.map(s => s.croppedImage);
    if (this.cardIndices.length) {
      this.cards = this.cardIndices.map(indices => indices.map(i => this.images[i]));
    }
    this.saveState({ mode: this.mode, imageStates, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: this.savedCardLayouts });
  }

  onLayoutChange(layout: CardLayout) {
    this.cardLayout = layout;
    this.saveState({ mode: this.mode, imageStates: this.savedImageStates, cardIndices: this.cardIndices, cardLayout: layout, cardLayouts: this.savedCardLayouts });
  }

  onCardLayoutsChange(layouts: ImgLayout[][]) {
    this.savedCardLayouts = layouts;
    this.saveState({ mode: this.mode, imageStates: this.savedImageStates, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: layouts });
  }

  generateCards() {
    if (!this.imagesReady) return;
    this.generateError = false;

    const cardIndices: number[][] = [];
    const order = this.mode - 1;

    for (let i = 0; i <= order; i++) {
      const indices = [0];
      for (let j = 0; j < order; j++) {
        indices.push(i * order + j + 1);
      }
      cardIndices.push(indices);
    }

    for (let a = 1; a <= order; a++) {
      for (let b = 1; b <= order; b++) {
        const indices = [a];
        for (let k = 0; k < order; k++) {
          indices.push(order + 1 + order * k + ((a * k + b - 1) % order));
        }
        cardIndices.push(indices);
      }
    }

    if (!this.validateCards(cardIndices)) {
      this.generateError = true;
      return;
    }

    this.cardIndices = cardIndices;
    this.savedCardLayouts = [];
    this.cards = cardIndices.map(indices => indices.map(i => this.images[i]));

    this.saveState({ mode: this.mode, imageStates: this.savedImageStates, cardIndices, cardLayout: this.cardLayout, cardLayouts: [] });
  }

  private validateCards(cardIndices: number[][]): boolean {
    for (let i = 0; i < cardIndices.length; i++) {
      const setI = new Set(cardIndices[i]);
      for (let j = i + 1; j < cardIndices.length; j++) {
        const matchCount = cardIndices[j].filter(idx => setI.has(idx)).length;
        if (matchCount !== 1) return false;
      }
    }

    const pairSeen = new Set<string>();
    for (const card of cardIndices) {
      for (let a = 0; a < card.length; a++) {
        for (let b = a + 1; b < card.length; b++) {
          const lo = Math.min(card[a], card[b]);
          const hi = Math.max(card[a], card[b]);
          const key = `${lo},${hi}`;
          if (pairSeen.has(key)) return false;
          pairSeen.add(key);
        }
      }
    }

    return true;
  }

  private generateDefaultImage(n: number): string {
    const size = 400;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const hue = Math.floor(Math.random() * 360);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 65%, 60%)`;
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `bold ${Math.round(size * 0.44)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(n), size / 2, size / 2);
    return canvas.toDataURL('image/png');
  }
}
