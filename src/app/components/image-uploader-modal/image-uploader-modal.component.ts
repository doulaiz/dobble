import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { ImageState } from '../../classes/image-state';
import { NgIf } from '@angular/common';


@Component({
   selector: 'app-image-uploader-modal',
   imports: [ImageCropperComponent, NgIf],
   standalone: true,
   templateUrl: './image-uploader-modal.component.html',
   styleUrl: './image-uploader-modal.component.css'
})
export class ImageUploaderModalComponent {
   @Input() showModal: boolean = false;
   @Input() index: number = 0;
   @Input() imageState: ImageState = new ImageState();
   @Output() imageStateChange = new EventEmitter<{ index: number; imageState: ImageState }>();
   @Output() modalClosed = new EventEmitter<void>();

   imageChangedEvent: any = '';
   croppedImage: string = '';
   scale = 1;
   uploadedImage: string | null = null;
   zoom = 1;
   rotation = 0;

   transform: ImageTransform = {
      scale: 1
   };

   fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
   }

   imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64!;
      // this.imageUploaded.emit({ index: this.index, image: this.croppedImage });
   }

   zoomChange() {
      this.transform = {
         ...this.transform,
         scale: this.scale
      };
   }

   doShowModal() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
         this.fileChangeEvent(e);
      };
      input.click();
   }
   cancelModal() {
      this.imageChangedEvent = '';
      this.croppedImage = '';
   }

   onZoomChange() {
      this.transform = {
         ...this.transform,
         scale: this.zoom
      };
   }

   onRotationChange() {
      this.transform = {
         ...this.transform,
         rotate: this.rotation
      };
   }
   openFileBrowser() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
         this.fileChangeEvent(e);
      };
      input.click();
   }
   confirmImage() {
      this.imageCropped({ base64: this.croppedImage } as ImageCroppedEvent);
      this.imageStateChange.emit({
         index: this.index,
         imageState: {
            ...this.imageState,
            image: this.croppedImage,
            croppedImage: this.croppedImage,
            zoomLevel: this.zoom,
            angleLevel: this.rotation
         }
      });
      this.cancelModal();
   }
   onFileSelected(event: any) {
      this.fileChangeEvent(event);
   }
}