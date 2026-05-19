import { Component, OnInit } from '@angular/core';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { ExportPanelComponent } from './components/export-panel/export-panel.component';
import { ModeSelectorComponent } from './components/mode-selector/mode-selector.component';
import { ImagesWrapperComponent } from './components/images-wrapper/images-wrapper.component';
import { CardLayoutSettingsComponent } from './components/card-layout-settings/card-layout-settings.component';
import { PersistenceService } from './services/persistence.service';
import { ImageState } from './classes/image-state';
import { CardLayout } from './classes/card-layout';
import { ImgLayout } from './classes/img-layout';
import { Card, requiredImagesForMode } from './utils/dobble.utils';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css'],
   standalone: true,
   imports: [
      ModeSelectorComponent,
      CardPreviewComponent,
      ExportPanelComponent,
      ImagesWrapperComponent,
      CardLayoutSettingsComponent
   ],
})
export class AppComponent implements OnInit {
   mode: 4 | 6 | 8 = 4;
   requiredImages = 13;
   imagesReady = false;
   images: string[] = [];
   cards: Card[] = [];
   cardIndices: number[][] = [];
   savedCardLayouts: ImgLayout[][] = [];
   savedImageStates: ImageState[] = [];
   showResetConfirm = false;
   cardLayout: CardLayout = new CardLayout();
   private imageChangedByUser = false;

   constructor(private persistence: PersistenceService) { }

   ngOnInit(): void {
      const saved = this.persistence.load();
      if (saved) {
         this.mode = saved.mode;
         this.requiredImages = requiredImagesForMode(saved.mode);
         this.savedImageStates = saved.imageStates ?? [];
         this.savedCardLayouts = saved.cardLayouts ?? [];
         this.cardLayout = saved.cardLayout ?? new CardLayout();

         const allImages = this.savedImageStates.map(s => s.croppedImage || s.image);
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
            this.cards = saved.cards;  // backward compat for existing saves
         }
      }
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
      this.persistence.save({ mode: this.mode, imageStates: filled, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: this.savedCardLayouts });
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
      this.persistence.save({ mode: this.mode, imageStates: [], cardIndices: [], cardLayout: this.cardLayout, cardLayouts: [] });
   }

   onModeChange(mode: 4 | 6 | 8) {
      this.mode = mode;
      this.requiredImages = requiredImagesForMode(mode);
      this.imagesReady = false;
      this.images = [];
      this.cards = [];
      this.cardIndices = [];
      this.savedCardLayouts = [];
      this.imageChangedByUser = false;
      this.persistence.save({ mode, imageStates: this.savedImageStates, cardIndices: [], cardLayout: this.cardLayout, cardLayouts: [] });
   }

   onImagesReady(images: string[]) {
      this.images = images;
      this.imagesReady = images.length === this.requiredImages;
      if (this.imageChangedByUser) {
         this.imageChangedByUser = false;
         this.cards = [];
         this.cardIndices = [];
         this.savedCardLayouts = [];
         this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cardIndices: [], cardLayout: this.cardLayout, cardLayouts: [] });
      }
   }

   onImageStatesChange(imageStates: ImageState[]) {
      this.savedImageStates = imageStates;
      this.imageChangedByUser = true;
      this.persistence.save({ mode: this.mode, imageStates, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: this.savedCardLayouts });
   }

   onLayoutChange(layout: CardLayout) {
      this.cardLayout = layout;
      this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cardIndices: this.cardIndices, cardLayout: layout, cardLayouts: this.savedCardLayouts });
   }

   onCardLayoutsChange(layouts: ImgLayout[][]) {
      this.savedCardLayouts = layouts;
      this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cardIndices: this.cardIndices, cardLayout: this.cardLayout, cardLayouts: layouts });
   }

   generateCards() {
      if (!this.imagesReady) return;

      const cardIndices: number[][] = [];
      const order = this.mode - 1;

      // First set of cards (symbol 0 on all)
      for (let i = 0; i <= order; i++) {
         const indices = [0];
         for (let j = 0; j < order; j++) {
            indices.push(i * order + j + 1);
         }
         cardIndices.push(indices);
      }

      // Remaining sets
      for (let a = 1; a <= order; a++) {
         for (let b = 1; b <= order; b++) {
            const indices = [a];
            for (let k = 0; k < order; k++) {
               indices.push(order + 1 + order * k + ((a * k + b - 1) % order));
            }
            cardIndices.push(indices);
         }
      }

      this.cardIndices = cardIndices;
      this.savedCardLayouts = [];  // cleared before cards so card-preview recomputes fresh layouts
      this.cards = cardIndices.map(indices => indices.map(i => this.images[i]));
      this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cardIndices, cardLayout: this.cardLayout, cardLayouts: [] });
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
