import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelBarangComponent } from './tabel-barang.component';

describe('TabelBarangComponent', () => {
  let component: TabelBarangComponent;
  let fixture: ComponentFixture<TabelBarangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabelBarangComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabelBarangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
