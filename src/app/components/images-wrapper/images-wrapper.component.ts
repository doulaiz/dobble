import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ImageItemComponent } from '../image-item/image-item.component';
import { ImageState } from '../../classes/image-state';
import { ImageUploaderModalComponent } from '../image-uploader-modal/image-uploader-modal.component';

@Component({
   selector: 'app-images-wrapper',
   standalone: true,
   imports: [ImageItemComponent, ImageUploaderModalComponent],
   templateUrl: './images-wrapper.component.html',
   styleUrl: './images-wrapper.component.css'
})
export class ImagesWrapperComponent implements OnChanges {
   @Input() requiredImages: number = 0;
   @Input() initialImageStates: ImageState[] = [];

   @Output() imagesReady = new EventEmitter<string[]>();
   @Output() imageStatesChange = new EventEmitter<ImageState[]>();

   imageStates: ImageState[] = [];
   selectedImageIndex: number = -1;

   readonly emptyImageState = new ImageState();

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['requiredImages']) {
         const count = changes['requiredImages'].currentValue as number;
         const saved = this.initialImageStates;
         this.imageStates = Array.from({ length: count }, (_, i) =>
            saved[i] ?? new ImageState()
         );
         this.checkIfAllImagesAreReady();
      }

      if (changes['initialImageStates'] && !changes['requiredImages']) {
         const saved = changes['initialImageStates'].currentValue as ImageState[];
         this.imageStates = Array.from({ length: this.requiredImages }, (_, i) =>
            saved[i] ?? new ImageState()
         );
         this.checkIfAllImagesAreReady();
      }
   }

   onImageUploaded(event: { index: number; image: string }) {
      this.imageStates[event.index].image = event.image;
      this.imageStatesChange.emit([...this.imageStates]);
      this.checkIfAllImagesAreReady();
   }

   private checkIfAllImagesAreReady() {
      const allImages = this.imageStates.map(state => state.croppedImage || state.image);
      if (
         this.imageStates.length === this.requiredImages &&
         this.requiredImages > 0 &&
         allImages.every(img => img)
      ) {
         this.imagesReady.emit(allImages);
      }
   }

   counter(i: number) {
      return new Array(i);
   }

   onModalClosed() {
      this.selectedImageIndex = -1;
   }

   onImageItemClick(index: number) {
      this.selectedImageIndex = index;
   }

   onModalImageStateChange(event: { index: number; imageState: ImageState }) {
      if (event.index < 0) return;
      this.imageStates[event.index] = event.imageState;
      this.imageStatesChange.emit([...this.imageStates]);
      this.checkIfAllImagesAreReady();
   }
}
