import { Component } from '@angular/core';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { ExportPanelComponent } from './components/export-panel/export-panel.component';
import { ModeSelectorComponent } from './components/mode-selector/mode-selector.component';
import { ImagesWrapperComponent } from './components/images-wrapper/images-wrapper.component';

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
      ImagesWrapperComponent
   ],
})
export class AppComponent {
   mode: 4 | 6 | 8 = 4;
   requiredImages = 13;
   imagesReady = false;
   images: string[] = [];
   cards: Card[] = [];

   onModeChange(mode: 4 | 6 | 8) {
      console.log('Mode changed to:', mode);
      this.mode = mode;
      this.requiredImages = mode === 4 ? 13 : mode === 6 ? 31 : 57;
      this.imagesReady = false;
      this.images = [];
      this.cards = [];
   }

   onImagesReady(images: string[]) {
      this.images = images;
      this.imagesReady = images.length === this.requiredImages;
      this.cards = [];
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
   }

   private randomCard(images: string[], perCard: number): Card {
      const indices = new Set<number>();
      while (indices.size < perCard) {
         indices.add(Math.floor(Math.random() * images.length));
      }
      return Array.from(indices).map(i => images[i]);
   }
}
