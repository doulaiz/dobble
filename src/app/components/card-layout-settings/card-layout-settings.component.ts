import { Component, EventEmitter, HostListener, Input, NgZone, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { CardLayout } from '../../classes/card-layout';
import { pickFile } from '../../utils/pick-file';

@Component({
  selector: 'app-card-layout-settings',
  standalone: true,
  imports: [MatButtonModule, LucideAngularModule],
  templateUrl: './card-layout-settings.component.html',
  styleUrls: ['./card-layout-settings.component.css']
})
export class CardLayoutSettingsComponent {
  @Input() layout: CardLayout = new CardLayout();
  @Output() layoutChange = new EventEmitter<CardLayout>();

  showPanel = false;

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showPanel) this.showPanel = false;
  }

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

  async browseBackground() {
    this.update('backgroundImage', await pickFile('image/png,image/jpeg,image/webp', this.ngZone));
  }

  clearBackground() {
    this.update('backgroundImage', '');
  }
}
