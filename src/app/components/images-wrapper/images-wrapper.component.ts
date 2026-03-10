import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageItemComponent } from '../image-item/image-item.component';
import { ImageState } from '../../classes/image-state';
import { ImageUploaderModalComponent } from '../image-uploader-modal/image-uploader-modal.component';

@Component({
   selector: 'app-images-wrapper',
   standalone: true,
   imports: [CommonModule, ImageItemComponent, ImageUploaderModalComponent],
   templateUrl: './images-wrapper.component.html',
   styleUrl: './images-wrapper.component.css'
})



export class ImagesWrapperComponent {
   @Input() requiredImages: number = 0;
   @Output() showModal = new EventEmitter<boolean>();

   @Output() imagesReady = new EventEmitter<string[]>();

   imageStates: ImageState[] = Array(this.requiredImages).fill(null).map(() => new ImageState());
   selectedImageIndex: number = -1;

   readonly emptyImageState = new ImageState();

   onImageUploaded(event: { index: number, image: string }) {
      this.imageStates[event.index].image = event.image;
      this.checkIfAllImagesAreReady();
   }

   private checkIfAllImagesAreReady() {
      const allImages = this.imageStates.map(state => state.image);
      if (allImages.length === this.requiredImages && allImages.every(img => img)) {
         this.imagesReady.emit(allImages);
      }
   }

   // Helper to create an array for ngFor
   counter(i: number) {
      return new Array(i);
   }

   onModalClosed() {
      console.log('Modal closed');
      this.showModal.emit(false);
      this.selectedImageIndex = -1;
   }

   onImageItemClick(index: number) {
      this.selectedImageIndex = index;
      this.showModal.emit(true);
   }

   onModalImageStateChange(event: { index: number; imageState: ImageState }) {
      if (event.index < 0) return;
      this.imageStates[event.index] = event.imageState;
      this.checkIfAllImagesAreReady();
   }
}
