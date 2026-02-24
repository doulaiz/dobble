import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Card = string[];

@Component({
  selector: 'app-card-preview',
  standalone: true,
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss'],
   imports: [CommonModule]
})
export class CardPreviewComponent {
  @Input() cards: Card[] = [];
}
