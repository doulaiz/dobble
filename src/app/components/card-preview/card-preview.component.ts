import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardLayout } from '../../classes/card-layout';

type Card = string[];

@Component({
  selector: 'app-card-preview',
  standalone: true,
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.css'],
  imports: [CommonModule]
})
export class CardPreviewComponent {
  @Input() cards: Card[] = [];
  @Input() cardLayout: CardLayout = new CardLayout();

  get cardBgStyle(): string {
    return this.cardLayout.backgroundImage ? `url(${this.cardLayout.backgroundImage})` : '';
  }
}
