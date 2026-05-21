import { ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { ImageState } from '../../classes/image-state';
import { pickFile } from '../../utils/pick-file';
import { LanguageService } from '../../services/language.service';

interface TouchPinchState {
  initialDist: number;
  initialAngle: number;
  initialZoom: number;
  initialRotation: number;
}

@Component({
  selector: 'app-image-uploader-modal',
  imports: [ImageCropperComponent, MatButtonModule, LucideAngularModule],
  standalone: true,
  templateUrl: './image-uploader-modal.component.html',
  styleUrls: ['./image-uploader-modal.component.css'],
})
export class ImageUploaderModalComponent implements OnChanges, OnDestroy {
  readonly t = inject(LanguageService).t;

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

  private touchPinch: TouchPinchState | null = null;
  private readonly boundDocTouchMove = this.onDocTouchMove.bind(this);
  private readonly boundDocTouchEnd = this.onDocTouchEnd.bind(this);

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageState'] && this.showModal) {
      this.loadFromImageState();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('touchmove', this.boundDocTouchMove);
    document.removeEventListener('touchend', this.boundDocTouchEnd);
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
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('touchmove', this.boundDocTouchMove, { passive: false });
      document.addEventListener('touchend', this.boundDocTouchEnd);
    });
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
    this.touchPinch = null;
    document.removeEventListener('touchmove', this.boundDocTouchMove);
    document.removeEventListener('touchend', this.boundDocTouchEnd);
    this.modalClosed.emit();
  }

  onZoomChange() {
    this.transform = { ...this.transform, scale: this.zoom };
  }

  onTransformChange(t: ImageTransform) {
    // Ignore cropper-emitted transforms while a pinch gesture is active —
    // otherwise the cropper's single-touch pan would overwrite our pinch result.
    if (this.touchPinch) return;
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

  onImageAreaTouchStart(event: TouchEvent): void {
    if (event.touches.length >= 2) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      this.touchPinch = {
        initialDist: Math.hypot(dx, dy),
        initialAngle: Math.atan2(dy, dx) * 180 / Math.PI,
        initialZoom: this.zoom,
        initialRotation: this.rotation,
      };
    }
  }

  private onDocTouchMove(event: TouchEvent): void {
    if (!this.touchPinch || event.touches.length < 2) return;
    event.preventDefault();
    const t1 = event.touches[0];
    const t2 = event.touches[1];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const newZoom = Math.max(1, Math.min(6, this.touchPinch.initialZoom * dist / this.touchPinch.initialDist));
    const rawRotation = this.touchPinch.initialRotation + (angle - this.touchPinch.initialAngle);
    const newRotation = Math.round(Math.max(-180, Math.min(180, rawRotation)));
    const oldRotation = this.transform.rotate ?? 0;
    const dRad = (newRotation - oldRotation) * Math.PI / 180;
    const tx = this.transform.translateH ?? 0;
    const ty = this.transform.translateV ?? 0;
    this.ngZone.run(() => {
      this.zoom = newZoom;
      this.rotation = newRotation;
      this.transform = {
        ...this.transform,
        scale: newZoom,
        rotate: newRotation,
        translateH: tx * Math.cos(dRad) - ty * Math.sin(dRad),
        translateV: tx * Math.sin(dRad) + ty * Math.cos(dRad),
      };
      this.cdr.detectChanges();
    });
  }

  private onDocTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.touchPinch = null;
    }
  }

  async openFileBrowser() {
    // pickFile resolves inside ngZone.run(), so the await continuation is inside Angular's zone.
    // cdr.detectChanges() is still needed so the cropper's internal CD picks up the new image.
    const result = await pickFile('image/*', this.ngZone);
    if (!result) return;
    this.imageBase64 = result;
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
