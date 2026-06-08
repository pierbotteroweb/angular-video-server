import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaMontadoComponent } from './programa-montado.component';

describe('ProgramaMontadoComponent', () => {
  let component: ProgramaMontadoComponent;
  let fixture: ComponentFixture<ProgramaMontadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramaMontadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramaMontadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
