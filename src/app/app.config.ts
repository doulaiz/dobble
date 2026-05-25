import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LucideAngularModule, Settings, X, FolderOpen, Shuffle, Download, Upload, Check, Plus, Trash2, BookOpen } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(LucideAngularModule.pick({ Settings, X, FolderOpen, Shuffle, Download, Upload, Check, Plus, Trash2, BookOpen }))
  ]
};
