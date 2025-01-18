import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAddBarangComponent } from './form-add-barang.component';

describe('FormAddBarangComponent', () => {
  let component: FormAddBarangComponent;
  let fixture: ComponentFixture<FormAddBarangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAddBarangComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAddBarangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
