import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GradeComponent } from './grade.component';
import { CommonService } from 'src/services/common.service';
import { sts } from 'shuffle-tv-services/lib';
import { FirebaseService } from '../services/firebase.service';
import { MongodbService } from '../services/mongodb.service';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('GradeComponent', () => {
  let component: GradeComponent;
  let fixture: ComponentFixture<GradeComponent>;
  let commonService: CommonService;
  let firebaseService: FirebaseService;
  let mongodbService: MongodbService;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GradeComponent ],
      providers: [
        CommonService,
        {
          provide: FirebaseService,
          useValue: {
            getSelectedChanelFromFirebase: jasmine.createSpy().and.returnValue(of({}))
          }
        },
        {
          provide: MongodbService,
          useValue: {
            getCanais: jasmine.createSpy().and.returnValue(of([{ emissora: 'canal1' }, { emissora: 'canal2' }]))
          }
        },
        FormBuilder,
        HttpClient
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeComponent);
    component = fixture.componentInstance;
    commonService = TestBed.inject(CommonService);
    firebaseService = TestBed.inject(FirebaseService);
    mongodbService = TestBed.inject(MongodbService);
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should call getSeletorDeCanalUsingPromise on ngOnInit', async () => {
    await component.ngOnInit();
    fixture.whenStable().then(() => {
        spyOn(mongodbService, 'getSeletorDeCanalUsingPromise').and.returnValue(Promise.resolve({}));
        expect(mongodbService.getSeletorDeCanalUsingPromise).toHaveBeenCalled();
        
    })
  });

  it('should get canais from MongoDB', () => {
    spyOn(mongodbService, 'getCanais').and.returnValue(of([{ emissora: 'canal1' }, { emissora: 'canal2' }]));
    component.getCanaisFromMongoDB();
    expect(mongodbService.getCanais).toHaveBeenCalled();
    expect(component.canais.length).toBe(2);
  });

  // Add more tests as needed
});