import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { ImageState } from '../../classes/image-state';

@Component({
   selector: 'app-image-uploader-modal',
   imports: [ImageCropperComponent],
   standalone: true,
   templateUrl: './image-uploader-modal.component.html',
   styleUrl: './image-uploader-modal.component.css'
})
export class ImageUploaderModalComponent implements OnChanges {
   showModal: boolean = false;
   @Input() index: number = 0;
   @Input() imageState: ImageState = new ImageState();
   @Output() imageStateChange = new EventEmitter<{ index: number; imageState: ImageState }>();
   @Output() modalClosed = new EventEmitter<void>();

   imageBase64: string = '';
   croppedImage: string = '';
   zoom = 1;
   rotation = 0;

   transform: ImageTransform = { scale: 1, translateUnit: 'px' };

   constructor(private cdr: ChangeDetectorRef) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['imageState'] && this.showModal) {
         this.loadFromImageState();
      }
   }

   private loadFromImageState(): void {
      const original = this.imageState.image;
      if (original) {
         this.imageBase64 = original;
         this.zoom = this.imageState.zoomLevel || 1;
         this.rotation = this.imageState.angleLevel || 0;
         this.transform = { scale: this.zoom, rotate: this.rotation, translateUnit: 'px' };
      }
   }

   imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64!;
   }

   // After the image loads inside the OnPush cropper, imageVisible is set to true but CD
   // hasn't run yet to reflect it. Nudge the transform (new reference dirtying the OnPush
   // input) then call detectChanges() synchronously — zone-independent, always works.
   onCropperReady() {
      setTimeout(() => {
         this.transform = { ...this.transform };
         this.cdr.detectChanges();
      });
   }

   doShowModal() {
      this.zoom = 1;
      this.rotation = 0;
      this.imageBase64 = '';
      this.croppedImage = '';
      this.transform = { scale: 1, translateUnit: 'px' };
      this.showModal = true;
      this.loadFromImageState();
   }

   cancelModal() {
      this.showModal = false;
      this.imageBase64 = '';
      this.croppedImage = '';
      this.modalClosed.emit();
   }

   onZoomChange() {
      this.transform = { ...this.transform, scale: this.zoom };
   }

   onTransformChange(t: ImageTransform) {
      this.transform = t;
   }

   onRotationChange() {
      const oldRotation = this.transform.rotate ?? 0;
      const dRad = (this.rotation - oldRotation) * Math.PI / 180;
      const tx = this.transform.translateH ?? 0;
      const ty = this.transform.translateV ?? 0;
      this.transform = {
         ...this.transform,
         rotate: this.rotation,
         translateH: tx * Math.cos(dRad) - ty * Math.sin(dRad),
         translateV: tx * Math.sin(dRad) + ty * Math.cos(dRad)
      };
   }

   openFileBrowser() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
         const file = e.target.files?.[0];
         if (!file) return;
         const reader = new FileReader();
         // FileReader.onload fires outside Angular's zone. detectChanges() is zone-independent
         // and forces the @if(imageBase64) block to re-render immediately.
         reader.onload = (ev: any) => {
            this.imageBase64 = ev.target.result;
            this.zoom = 1;
            this.rotation = 0;
            this.transform = { scale: 1, translateUnit: 'px' };
            this.cdr.detectChanges();
         };
         reader.readAsDataURL(file);
      };
      input.click();
   }

   confirmImage() {
      const finalCrop = this.croppedImage || this.imageState.croppedImage;
      if (!finalCrop) return;
      this.imageStateChange.emit({
         index: this.index,
         imageState: {
            ...this.imageState,
            image: this.imageBase64 || this.imageState.image,
            croppedImage: finalCrop,
            zoomLevel: this.zoom,
            angleLevel: this.rotation
         }
      });
      this.cancelModal();
   }
}
