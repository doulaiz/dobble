import { Component, Input } from '@angular/core';
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
  @Input() imageState: ImageState = new ImageState();
  @Input() reorderMode: boolean = false;
}
