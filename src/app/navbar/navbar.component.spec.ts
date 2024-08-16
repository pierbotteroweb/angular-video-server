import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the navbar brand', () => {
    const navbarBrand = fixture.nativeElement.querySelector('.navbar-brand');
    expect(navbarBrand.textContent).toContain('Shuffle TV');
  });

  it('should render the navbar links', () => {
    const navbarLinks = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(navbarLinks.length).toBe(4);
    expect(navbarLinks[0].textContent).toContain('Video');
    expect(navbarLinks[1].textContent).toContain('Painel');
    expect(navbarLinks[2].textContent).toContain('Lista');
    expect(navbarLinks[3].textContent).toContain('Playlist');
  });
});