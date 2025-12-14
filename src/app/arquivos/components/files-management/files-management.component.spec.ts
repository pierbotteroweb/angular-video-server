import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesManagementComponent } from './files-management.component';

describe('FilesManagementComponent', () => {
  let component: FilesManagementComponent;
  let fixture: ComponentFixture<FilesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
