import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ModeSelectorComponent } from './components/mode-selector/mode-selector.component';
import { ImageItemComponent } from './components/image-item/image-item.component';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { ExportPanelComponent } from './components/export-panel/export-panel.component';
import { ImagesWrapperComponent } from './components/images-wrapper/images-wrapper.component';

@NgModule({
  declarations: [],
  imports: [
    CardPreviewComponent,
    ExportPanelComponent,
    ModeSelectorComponent,
    ImageItemComponent,
    ImagesWrapperComponent,
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
