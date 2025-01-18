import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {PembelianFarmasiService} from '../pembelian-farmasi.service';
import {CommonService} from 'app/shared/common.service';
import {GlobalsService} from 'app/service/globals.service';

@Component({
  selector: 'app-form-supplier',
  templateUrl: './form-supplier.component.html',
  styleUrls: ['./form-supplier.component.css']
})
export class FormSupplierComponent implements OnInit, OnDestroy {
  displayFormSupplier = false;
  displayFormSupplierSubs: Subscription;
  idKlinik: any;
  name: any;

  constructor(private _pembelianFarmasiService: PembelianFarmasiService,
              private commonService: CommonService,
              private globalService: GlobalsService) { }

  ngOnInit() {
    // this.idKlinikSubs = this.commonService.klinikIdSubject$
    //   .subscribe((resp) => this.idKlinik = resp);
    // this.idKlinik = this.commonService.getKlinikId();
    this.displayFormSupplierSubs = this._pembelianFarmasiService.getFormAddSupplier()
        .subscribe((resp) => {
          this.displayFormSupplier = resp.show;
          if (resp.show) {
            this.name = resp.nama;
            this.idKlinik = resp.klinikId;
          }
        });
  }
  simpanSupplier(f) {
    if (this.idKlinik != null ) {
      f.value.klinikId = this.idKlinik;
      this._pembelianFarmasiService.insertSupplier(f.value)
        .subscribe(
          (resp) => {
            if (resp.id) {
              this._pembelianFarmasiService.setFormAddSupplier({
                show: false,
                newSupplier: resp
              });
              this.commonService.showMessage('success', 'Tersimpan', 'Supplier telah ditambahkan');
            }
          }, (error) => {
            this.globalService.showError(error);
          }
        );
    } else {
      this.commonService.showMessage('warn', 'Peringatan', 'Klinik harus dipilih');
    }

  }
  ClearForm(f) {
    f.reset();
  }
  ngOnDestroy() {
    // this.idKlinikSubs.unsubscribe();
    if (this.displayFormSupplierSubs != null) {
      this.displayFormSupplierSubs.unsubscribe();
    }
  }
}
