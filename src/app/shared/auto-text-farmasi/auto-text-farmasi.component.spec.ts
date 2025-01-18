import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoTextFarmasiComponent } from './auto-text-farmasi.component';

describe('AutoTextFarmasiComponent', () => {
  let component: AutoTextFarmasiComponent;
  let fixture: ComponentFixture<AutoTextFarmasiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoTextFarmasiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoTextFarmasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
