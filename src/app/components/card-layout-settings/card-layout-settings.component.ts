import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { CardLayout } from '../../classes/card-layout';

@Component({
  selector: 'app-card-layout-settings',
  standalone: true,
  templateUrl: './card-layout-settings.component.html',
  styleUrl: './card-layout-settings.component.css'
})
export class CardLayoutSettingsComponent {
  @Input() layout: CardLayout = new CardLayout();
  @Output() layoutChange = new EventEmitter<CardLayout>();

  showPanel = false;

  readonly previewPlaceholders = [0, 1, 2, 3, 4, 5];

  constructor(private ngZone: NgZone) {}

  get scale(): number {
    const max = Math.max(this.layout.width || 88, this.layout.height || 88);
    return 180 / max;
  }

  get previewCardWidth(): number { return (this.layout.width || 88) * this.scale; }
  get previewCardHeight(): number { return (this.layout.height || 88) * this.scale; }
  get previewMarginTop(): number { return (this.layout.marginTop || 0) * this.scale; }
  get previewMarginLeft(): number { return (this.layout.marginLeft || 0) * this.scale; }
  get previewBgStyle(): string {
    return this.layout.backgroundImage ? `url(${this.layout.backgroundImage})` : '';
  }

  update(field: keyof CardLayout, value: number | string) {
    this.layout = { ...this.layout, [field]: value };
    this.layoutChange.emit(this.layout);
  }

  browseBackground() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        this.ngZone.run(() => this.update('backgroundImage', ev.target.result));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  clearBackground() {
    this.update('backgroundImage', '');
  }
}
