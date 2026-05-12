import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  templateUrl: './mode-selector.component.html',
  styleUrls: ['./mode-selector.component.css']
})
export class ModeSelectorComponent {
  @Output() modeChange = new EventEmitter<4 | 6 | 8>();

  selected: 4 | 6 | 8 = 4;

  selectMode(mode: 4 | 6 | 8) {
    this.selected = mode;
    this.modeChange.emit(mode);
  }
}
