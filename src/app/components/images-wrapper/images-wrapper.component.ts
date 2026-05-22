import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ImageItemComponent } from '../image-item/image-item.component';
import { ImageUploaderModalComponent } from '../image-uploader-modal/image-uploader-modal.component';
import { ImageState } from '../../classes/image-state';

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 8;

@Component({
  selector: 'app-images-wrapper',
  standalone: true,
  imports: [ImageItemComponent, ImageUploaderModalComponent],
  templateUrl: './images-wrapper.component.html',
  styleUrls: ['./images-wrapper.component.css'],
})
export class ImagesWrapperComponent implements OnChanges {
  @Input() requiredImages: number = 0;
  @Input() initialImageStates: ImageState[] = [];

  @Output() imagesReady = new EventEmitter<string[]>();
  @Output() imageStatesChange = new EventEmitter<ImageState[]>();
  @Output() imagesReordered = new EventEmitter<ImageState[]>();

  @ViewChild('modal') private modal!: ImageUploaderModalComponent;

  imageStates: ImageState[] = [];
  selectedImageIndex = -1;
  readonly emptyImageState = new ImageState();

  // Drag state (exposed to template)
  dragging = false;
  dragFrom = -1;
  dropTarget = -1;
  dragCloneX = 0;
  dragCloneY = 0;
  dragCloneSize = 150;

  // Internal press tracking
  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private activePointerId = -1;
  private pressIndex = -1;
  private pressStartX = 0;
  private pressStartY = 0;
  private currentPointerX = 0;
  private currentPointerY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requiredImages']) {
      const count = changes['requiredImages'].currentValue as number;
      const saved = this.initialImageStates;
      this.imageStates = Array.from({ length: count }, (_, i) =>
        saved[i] ?? new ImageState()
      );
      this.checkIfAllImagesAreReady();
    }

    if (changes['initialImageStates'] && !changes['requiredImages'] && !this.dragging) {
      const saved = changes['initialImageStates'].currentValue as ImageState[];
      this.imageStates = Array.from({ length: this.requiredImages }, (_, i) =>
        saved[i] ?? new ImageState()
      );
      this.checkIfAllImagesAreReady();
    }
  }

  private checkIfAllImagesAreReady() {
    const allImages = this.imageStates.map(s => s.croppedImage);
    if (
      this.imageStates.length === this.requiredImages &&
      this.requiredImages > 0 &&
      allImages.every(img => img)
    ) {
      this.imagesReady.emit(allImages);
    } else {
      this.imagesReady.emit([]);
    }
  }

  onModalClosed() {
    this.selectedImageIndex = -1;
  }

  onModalImageStateChange(event: { index: number; imageState: ImageState }) {
    if (event.index < 0) return;
    this.imageStates[event.index] = event.imageState;
    this.imageStatesChange.emit([...this.imageStates]);
    this.checkIfAllImagesAreReady();
  }

  // ── Pointer event handlers ───────────────────────────────────────────────

  onItemPointerDown(event: PointerEvent, idx: number) {
    if (this.dragging) return;
    const el = event.currentTarget as HTMLElement;
    el.setPointerCapture(event.pointerId);
    this.activePointerId = event.pointerId;
    this.pressIndex = idx;
    this.pressStartX = event.clientX;
    this.pressStartY = event.clientY;
    this.currentPointerX = event.clientX;
    this.currentPointerY = event.clientY;

    this.pressTimer = setTimeout(() => {
      this.pressTimer = null;
      this.dragCloneSize = el.getBoundingClientRect().width;
      this.startDrag(idx);
    }, LONG_PRESS_MS);
  }

  onPointerMove(event: PointerEvent) {
    if (event.pointerId !== this.activePointerId) return;
    this.currentPointerX = event.clientX;
    this.currentPointerY = event.clientY;

    if (this.pressTimer) {
      const dx = event.clientX - this.pressStartX;
      const dy = event.clientY - this.pressStartY;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
        clearTimeout(this.pressTimer);
        this.pressTimer = null;
      }
    }

    if (this.dragging) {
      this.dragCloneX = event.clientX;
      this.dragCloneY = event.clientY;
      this.updateDropTarget(event.clientX, event.clientY);
    }
  }

  onPointerUp(event: PointerEvent) {
    if (event.pointerId !== this.activePointerId) return;
    this.activePointerId = -1;

    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
      this.openModal(this.pressIndex);
      return;
    }

    if (this.dragging) {
      this.finalizeDrop();
    }
  }

  // ── Drag helpers ─────────────────────────────────────────────────────────

  private startDrag(idx: number) {
    this.dragging = true;
    this.dragFrom = idx;
    this.dropTarget = idx;
    this.dragCloneX = this.currentPointerX;
    this.dragCloneY = this.currentPointerY;
    navigator.vibrate?.(40);
  }

  private updateDropTarget(x: number, y: number) {
    const items = document.querySelectorAll<HTMLElement>('.uploader-instance');
    let minDist = Infinity;
    let nearest = this.dropTarget;

    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });

    this.dropTarget = nearest;
  }

  private finalizeDrop() {
    const from = this.dragFrom;
    const to = this.dropTarget;
    this.dragging = false;
    this.dragFrom = -1;
    this.dropTarget = -1;

    if (from !== to && to !== -1) {
      moveItemInArray(this.imageStates, from, to);
      this.imagesReordered.emit([...this.imageStates]);
    }
  }

  private openModal(idx: number) {
    if (idx < 0) return;
    this.selectedImageIndex = idx;
    this.modal.doShowModal();
  }
}
