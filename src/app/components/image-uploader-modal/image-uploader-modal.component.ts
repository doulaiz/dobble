import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, NgZone, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { ImageState } from '../../classes/image-state';
import { pickFile } from '../../utils/pick-file';

@Component({
  selector: 'app-image-uploader-modal',
  imports: [ImageCropperComponent, MatButtonModule, LucideAngularModule],
  standalone: true,
  templateUrl: './image-uploader-modal.component.html',
  styleUrls: ['./image-uploader-modal.component.css'],
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
  pendingDelete = false;

  transform: ImageTransform = { scale: 1, translateUnit: 'px' };

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

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
      this.transform = {
        scale: this.zoom,
        rotate: this.rotation,
        translateH: this.imageState.translateH,
        translateV: this.imageState.translateV,
        translateUnit: 'px',
      };
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64!;
  }

  onCropperReady() {
    // cropperReady fires via Angular output() API which can run outside zone.
    // ngZone.run() re-enters the zone so the tick() propagates CD into the OnPush cropper.
    this.ngZone.run(() => {
      this.transform = { ...this.transform };
      this.cdr.detectChanges();
    });
  }

  doShowModal() {
    this.zoom = 1;
    this.rotation = 0;
    this.imageBase64 = '';
    this.croppedImage = '';
    this.pendingDelete = false;
    this.transform = { scale: 1, translateUnit: 'px' };
    this.showModal = true;
    this.loadFromImageState();
  }

  deleteImage() {
    this.imageBase64 = '';
    this.croppedImage = '';
    this.pendingDelete = true;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showModal) this.cancelModal();
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
      translateV: tx * Math.sin(dRad) + ty * Math.cos(dRad),
    };
  }

  async openFileBrowser() {
    // pickFile resolves inside ngZone.run(), so the await continuation is inside Angular's zone.
    // cdr.detectChanges() is still needed so the cropper's internal CD picks up the new image.
    this.imageBase64 = await pickFile('image/*', this.ngZone);
    this.zoom = 1;
    this.rotation = 0;
    this.transform = { scale: 1, translateUnit: 'px' };
    this.cdr.detectChanges();
  }

  confirmImage() {
    if (this.pendingDelete) {
      this.imageStateChange.emit({ index: this.index, imageState: new ImageState() });
      this.cancelModal();
      return;
    }
    const finalCrop = this.croppedImage || this.imageState.croppedImage;
    if (!finalCrop) return;
    this.imageStateChange.emit({
      index: this.index,
      imageState: {
        ...this.imageState,
        image: this.imageBase64 || this.imageState.image,
        croppedImage: finalCrop,
        zoomLevel: this.zoom,
        angleLevel: this.rotation,
        translateH: this.transform.translateH ?? 0,
        translateV: this.transform.translateV ?? 0,
      },
    });
    this.cancelModal();
  }
}
