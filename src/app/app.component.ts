import { Component, OnInit } from '@angular/core';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { ExportPanelComponent } from './components/export-panel/export-panel.component';
import { ModeSelectorComponent } from './components/mode-selector/mode-selector.component';
import { ImagesWrapperComponent } from './components/images-wrapper/images-wrapper.component';
import { CardLayoutSettingsComponent } from './components/card-layout-settings/card-layout-settings.component';
import { PersistenceService } from './services/persistence.service';
import { ImageState } from './classes/image-state';
import { CardLayout } from './classes/card-layout';

type Card = string[];

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
   savedImageStates: ImageState[] = [];
   showResetConfirm = false;
   cardLayout: CardLayout = new CardLayout();

   constructor(private persistence: PersistenceService) {}

   ngOnInit(): void {
      const saved = this.persistence.load();
      if (saved) {
         this.mode = saved.mode;
         this.requiredImages = saved.mode === 4 ? 13 : saved.mode === 6 ? 31 : 57;
         this.savedImageStates = saved.imageStates ?? [];
         this.cards = saved.cards ?? [];
         this.cardLayout = saved.cardLayout ?? new CardLayout();

         const allImages = this.savedImageStates.map(s => s.croppedImage || s.image);
         if (
            this.savedImageStates.length === this.requiredImages &&
            allImages.every(img => img)
         ) {
            this.images = allImages;
            this.imagesReady = true;
         }
      }
   }

   resetAll() {
      this.savedImageStates = [];
      this.imagesReady = false;
      this.images = [];
      this.cards = [];
      this.showResetConfirm = false;
      this.persistence.save({ mode: this.mode, imageStates: [], cards: [], cardLayout: this.cardLayout });
   }

   onModeChange(mode: 4 | 6 | 8) {
      this.mode = mode;
      this.requiredImages = mode === 4 ? 13 : mode === 6 ? 31 : 57;
      this.imagesReady = false;
      this.images = [];
      this.cards = [];
      this.savedImageStates = [];
      this.persistence.save({ mode, imageStates: [], cards: [], cardLayout: this.cardLayout });
   }

   onImagesReady(images: string[]) {
      this.images = images;
      this.imagesReady = images.length === this.requiredImages;
      this.cards = [];
      this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cards: [], cardLayout: this.cardLayout });
   }

   onImageStatesChange(imageStates: ImageState[]) {
      this.savedImageStates = imageStates;
      this.persistence.save({ mode: this.mode, imageStates, cards: this.cards, cardLayout: this.cardLayout });
   }

   onLayoutChange(layout: CardLayout) {
      this.cardLayout = layout;
      this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cards: this.cards, cardLayout: layout });
   }

   generateCards() {
      if (!this.imagesReady) return;

      const cards: Card[] = [];
      const perCard = this.mode;
      const maxAttempts = 5000;

      let attempts = 0;
      while (cards.length < 20 && attempts < maxAttempts) {
         attempts++;
         const card = this.randomCard(this.images, perCard);
         const key = card.slice().sort().join('|');
         const exists = cards.some(c => c.slice().sort().join('|') === key);
         if (!exists) {
            cards.push(card);
         }
      }

      this.cards = cards;
      this.persistence.save({ mode: this.mode, imageStates: this.savedImageStates, cards, cardLayout: this.cardLayout });
   }

   private randomCard(images: string[], perCard: number): Card {
      const indices = new Set<number>();
      while (indices.size < perCard) {
         indices.add(Math.floor(Math.random() * images.length));
      }
      return Array.from(indices).map(i => images[i]);
   }
}
