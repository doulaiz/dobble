import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesWrapperComponent } from './images-wrapper.component';

describe('ImagesWrapperComponent', () => {
  let component: ImagesWrapperComponent;
  let fixture: ComponentFixture<ImagesWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
