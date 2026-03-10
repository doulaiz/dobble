import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ImageState {
   image: string;
   croppedImage: string;
   zoomLevel: number;
   angleLevel: number;
   posXY: { x: number; y: number };
}

@Component({
   selector: 'app-image-item',
   standalone: true,
   templateUrl: './image-item.component.html',
   styleUrls: ['./image-item.component.css'],
   imports: [
      NgIf,
      FormsModule
   ]
})
export class ImageItemComponent {

   @Input() index: number = 0;
   @Input() imageState: ImageState = {
      image: '',
      croppedImage: '',
      zoomLevel: 1,
      angleLevel: 0,
      posXY: { x: 0, y: 0 }
   };

   @Output() imageStateChange = new EventEmitter<ImageState>();
   @Output() imageItemClick = new EventEmitter<number>();

   onClick(event: any) {
      console.log('Image item clicked ' + this.index);
      this.imageItemClick.emit(this.index);
   }
} 