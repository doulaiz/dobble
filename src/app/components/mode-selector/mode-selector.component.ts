import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [MatRadioModule],
  templateUrl: './mode-selector.component.html',
  styleUrls: ['./mode-selector.component.css']
})
export class ModeSelectorComponent {
  @Input() set initialMode(mode: 4 | 6 | 8) { this.selected = mode; }
  @Output() modeChange = new EventEmitter<4 | 6 | 8>();

  selected: 4 | 6 | 8 = 4;

  selectMode(mode: 4 | 6 | 8) {
    this.selected = mode;
    this.modeChange.emit(mode);
  }
}
