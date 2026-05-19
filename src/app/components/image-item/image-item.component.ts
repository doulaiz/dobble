import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ImageState } from '../../classes/image-state';

@Component({
   selector: 'app-image-item',
   standalone: true,
   imports: [LucideAngularModule],
   templateUrl: './image-item.component.html',
   styleUrls: ['./image-item.component.css'],
})
export class ImageItemComponent {

   @Input() index: number = 0;
   @Input() imageState: ImageState = new ImageState();

   @Output() imageItemClick = new EventEmitter<number>();

   onClick(event: any) {
      this.imageItemClick.emit(this.index);
   }
}
