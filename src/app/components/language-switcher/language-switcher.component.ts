import { Component, HostListener, inject } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';

const LANG_OPTIONS: { lang: Language; flag: string; label: string }[] = [
  { lang: 'en', flag: 'EN', label: 'English' },
  { lang: 'fr', flag: 'FR', label: 'Français' },
  { lang: 'es', flag: 'ES', label: 'Español' },
];

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css'],
})
export class LanguageSwitcherComponent {
  private readonly langService = inject(LanguageService);

  open = false;

  get current() {
    return LANG_OPTIONS.find(o => o.lang === this.langService.language()) ?? LANG_OPTIONS[0];
  }

  get others() {
    return LANG_OPTIONS.filter(o => o.lang !== this.langService.language());
  }

  toggle(event: Event) {
    event.stopPropagation();
    this.open = !this.open;
  }

  select(lang: Language, event: Event) {
    event.stopPropagation();
    this.langService.setLanguage(lang);
    this.open = false;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.open = false;
  }
}
