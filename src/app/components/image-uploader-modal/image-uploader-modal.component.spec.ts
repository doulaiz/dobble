import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploaderModalComponent } from './image-item-modal.component';

describe('ImageUploaderModalComponent', () => {
   let component: ImageUploaderModalComponent;
   let fixture: ComponentFixture<ImageUploaderModalComponent>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [ImageUploaderModalComponent]
      })
         .compileComponents();

      fixture = TestBed.createComponent(ImageUploaderModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
