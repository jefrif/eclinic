import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormKonversiSatuanComponent } from './form-konversi-satuan.component';

describe('FormKonversiSatuanComponent', () => {
  let component: FormKonversiSatuanComponent;
  let fixture: ComponentFixture<FormKonversiSatuanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormKonversiSatuanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormKonversiSatuanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
