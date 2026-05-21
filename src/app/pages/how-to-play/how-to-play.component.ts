import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-how-to-play',
  templateUrl: './how-to-play.component.html',
  styleUrls: ['./how-to-play.component.css'],
  standalone: true,
  imports: [RouterLink, LanguageSwitcherComponent],
})
export class HowToPlayComponent {
  readonly t = inject(LanguageService).t;
}
