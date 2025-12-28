import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocoComponent } from './bloco.component';

describe('BlocoComponent', () => {
  let component: BlocoComponent;
  let fixture: ComponentFixture<BlocoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlocoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
