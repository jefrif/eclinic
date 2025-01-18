import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PembelianFarmasiListComponent } from './pembelian-farmasi-list.component';

describe('PembelianFarmasiListComponent', () => {
  let component: PembelianFarmasiListComponent;
  let fixture: ComponentFixture<PembelianFarmasiListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PembelianFarmasiListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PembelianFarmasiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
