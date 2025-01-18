import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PembelianFarmasiComponent } from './pembelian-farmasi.component';

describe('PembelianFarmasiComponent', () => {
  let component: PembelianFarmasiComponent;
  let fixture: ComponentFixture<PembelianFarmasiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PembelianFarmasiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PembelianFarmasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
