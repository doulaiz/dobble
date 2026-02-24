import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';

@Component({
   selector: 'app-image-uploader',
   standalone: true,
   templateUrl: './image-uploader.component.html',
   styleUrls: ['./image-uploader.component.css'],
   imports: [
      NgIf,
      ImageCropperComponent,
      FormsModule
   ]
})
export class ImageUploaderComponent {
   @Input() index: number = 0;
   @Output() imageUploaded = new EventEmitter<{ index: number, image: string }>();
   imageChangedEvent: any = '';
   croppedImage: string = '';
   scale = 1;

   transform: ImageTransform = {
      scale: 1
   };

   fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
   }

   imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64!;
      this.imageUploaded.emit({ index: this.index, image: this.croppedImage });
   }

   zoomChange() {
      this.transform = {
         ...this.transform,
         scale: this.scale
      };
   }
}