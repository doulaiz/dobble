import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ModeSelectorComponent } from './components/mode-selector/mode-selector.component';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { ExportPanelComponent } from './components/export-panel/export-panel.component';

@NgModule({
   declarations: [   ],
   imports: [
      CardPreviewComponent, 
      ExportPanelComponent, 
      ModeSelectorComponent, 
      ImageUploaderComponent,
      BrowserModule,
      FormsModule
   ],
   providers: [],
   bootstrap: [AppComponent]
})
export class AppModule { }
