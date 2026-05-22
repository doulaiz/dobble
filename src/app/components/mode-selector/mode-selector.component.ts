import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { LanguageService } from '../../services/language.service';
import { Mode } from '../../utils/dobble.utils';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [MatRadioModule],
  templateUrl: './mode-selector.component.html',
  styleUrls: ['./mode-selector.component.css']
})
export class ModeSelectorComponent {
  @Input() set initialMode(mode: Mode) { this.selected = mode; }
  @Output() modeChange = new EventEmitter<Mode>();

  selected: Mode = 6;

  readonly t = inject(LanguageService).t;

  selectMode(mode: Mode) {
    this.selected = mode;
    this.modeChange.emit(mode);
  }
}
