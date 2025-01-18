import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import { PembelianFarmasiService } from '../pembelian-farmasi.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Store} from '@ngrx/store';
// import * as accessViewsConst from '../../shared/ConstAccess';
// import * as _ from 'lodash';
// import {empty} from 'rxjs/observable/empty';
import {LazyLoadEvent} from 'primeng/primeng';
// import {GlobalsService} from 'app/service/globals.service';
import {IaccessViewRole} from 'app/Interfaces/iaccess-view-role';
import {IAppState} from 'app/store';
import {ConfirmDialogMsg} from 'app/Interfaces/confirm-dialog-msg';
import {IAnyState} from 'app/Interfaces/any-state';
import * as StateActions from 'app/shared/ngrx/any-state.actions';

@Component({
  selector: 'app-tabel-barang',
  templateUrl: './tabel-barang.component.html',
  styleUrls: ['./tabel-barang.component.css']
})
export class TabelBarangComponent implements OnInit, OnDestroy {
  listBarang: any = [];
  listUnitSatuan: any = [];
  // listUnitSatuanSubs: Subscription;
  barangSelected: any;
  accessView = null;
  totalRows = 0;
  private avRole: Observable<IaccessViewRole>;
  private klinikId = 0;
  // private tableSubs: Subscription;
  @Output() rowsChanged = new EventEmitter();
  private faktur: any;
  private tablePage = 1;
  private aState: Observable<IAnyState>;
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  readOnly = false;
  orderIncluded = false;
  divTableClass = 'ui-g-11 ui-md-11 ui-lg-11';

  constructor(private _pembelianFarmasiService: PembelianFarmasiService,
              private router: Router, private store: Store<IAppState>) {
    this.avRole = store.select(s => s.accessViewRole);
    this.aState = store.select(s => s.state);
  }

  ngOnInit() {
    this.avRole.takeUntil(this.destroyed$).subscribe((avr: IaccessViewRole) => {
      this.klinikId = parseInt(avr.klinikId, 10);
      if (avr.list != null) {
        const path = '/admin/farmasi/pembelian-farmasi';
        const list = avr.list.filter(
            en => en.accessViewPath != null && en.accessViewPath.indexOf(path) >= 0);

        if (list.length > 0) {
          this.accessView = list[0];
        }
      }
    });
    // this.accessView = this.globalService.getAccessView(12);
    this._pembelianFarmasiService.getSatuans().subscribe(
        (resp) => {
          if (resp.length > 0) {
            this.listUnitSatuan = resp;
          }
        }, () => {}
    );
    this._pembelianFarmasiService.getAnySubject()
        .takeUntil(this.destroyed$).subscribe((row) => {
      if (row.eventSource === 'FormAddBarang') {
        // this.listBarang = [...data];
        const now = new Date();
        const offset = now.getTimezoneOffset() / 60;

        const exp = new Date(Date.parse(row.expired));
        exp.setHours(now.getHours() - offset, now.getMinutes(),
            now.getSeconds(), now.getMilliseconds());
        let temp = {
          id: row.id,
          fakturBeliFarmasiId: row.fakturBeliFarmasiId,
          farmasiId: row.farmasiId,
          farmasiNama: row.farmasiNama,
          farmasiJenis: 1,
          kuantitas: row.qty,
          unitBarangFarmasiId: row.unit,
          kode: row.kode,
          hargaBeliSatuan: row.hargaSatuan,
          jumlah: row.jumlah,
          expired: exp,
          qtyOrder: 0
        };

        if (row.stokFmId != null) {
          temp = Object.assign(temp, {stokFmId: row.stokFmId});
        }

        if (this.barangSelected != null) {
          temp.qtyOrder = this.barangSelected.qtyOrder;
        }

        if (temp.id > 0 && (temp.farmasiId !== this.barangSelected.farmasiId
            || temp.unitBarangFarmasiId !== this.barangSelected.unit)) {
          this.deleteBarang(temp);
        } else {
          let totJumlah = 0;
          this.listBarang.forEach(x => {
            totJumlah += x.jumlah;
          });
          totJumlah += temp.jumlah;

          this.rowsChanged.emit({
            newOrChangedRow: temp,
            total: totJumlah
          });
        }
      }
    });

    this.aState.takeUntil(this.destroyed$).subscribe((state: IAnyState) => {
      if (state.state != null && state.state.newFarmasi != null) {
        if (state.state.newOrder != null) {
          this.addNewOrder(state.state.newOrder);
        } else {
          this._pembelianFarmasiService.getSatuans().subscribe((rsp) => {
            let units = [];
            if (rsp.length > 0) {
              units = rsp;
            }
            this._pembelianFarmasiService.postAnySubject({
              subscriber: 'FormAddBarang',
              klinikId: this.klinikId,
              displayForm: true,
              formMode: 'add',
              listUnitBarang: units,
              mode: 1,
              jenis: 5
            });
          }, () => {});
        }
        setTimeout(() => {
          this.store.dispatch(new StateActions.RemoveAnyStateAction());
        });
      }
    });
  /*
    this.tableSubs = this._pembelianFarmasiService.tableObsrv
      .subscribe((faktur: any) => {
          if (faktur != null) {
            const now = new Date();
            const offset = now.getTimezoneOffset() / 60;

            const listToSave = [];
            this.listBarang.forEach(row => {
              if (row.rowStatus > 0) {
                const exp = new Date(Date.parse(row.expired));
                exp.setHours(now.getHours() - offset, now.getMinutes(),
                    now.getSeconds(), now.getMilliseconds());
                const temp = {
                  id: row.id,
                  fakturBeliFarmasiId: row.fakturBeliFarmasiId,
                  farmasiId: row.farmasiId,
                  farmasiNama: row.farmasiNama,
                  farmasiJenis: 1,
                  kuantitas: row.qty,
                  unitBarangFarmasiId: row.unit,
                  kode: row.kode,
                  hargaBeliSatuan: row.hargaSatuan,
                  expired: exp
                };
                listToSave.push(temp);
              }
            });

            if (listToSave.length > 0) {
              faktur.id = listToSave[0].fakturBeliFarmasiId;
              faktur.farmasiDibeli = listToSave;
              this._pembelianFarmasiService.putFakturBeliFarmasi(
                  this.klinikId, faktur).subscribe((resp) => {
                  if (resp.ok) {
/!*
                    faktur = resp.json();
                    this._pembelianFarmasiService.postJurnalBeli(
                        this.klinikId, faktur.id).subscribe(res => {
                      // this.commonService.showMessage('success', 'OK', 'Pembelian Farmasi Selesai');
                      // this.router.navigate(['admin/farmasi/pembelian-farmasi-list']);
                    });
*!/
                    this.loadData();
                  }
                });
            }
          } else {
            this.loadData();
          }
        }
      );
    */
  }

/*
  equateUnit(param: any) {
    let ket = '';
    if (this.listUnitSatuan != null) {
      this.listUnitSatuan.forEach((x) => {
        if (x.id === param) {
          ket = x.nama;
        }
      });
    }
    return ket;
  }
*/

  formAddBarang() {
    // this._pembelianFarmasiService.fireFormAddBarangSubj(true);
    // this._pembelianFarmasiService.setFormMode('add');
    if (this.faktur.jenis != null && this.faktur.jenis === 5) {
      setTimeout(() => {
        let param = {
          klinikId: this.klinikId
        };
        if (this.faktur.id != null) {
          param = Object.assign({fakturId: this.faktur.id}, param);
        }
        if (this.faktur.gudangFarmasiId != null) {
          param = Object.assign({gdid: this.faktur.gudangFarmasiId}, param);
        }
        this.router.navigate(['/admin/farmasi/panel-flow', param]).then();
      });
    } else {
      this._pembelianFarmasiService.postAnySubject({
        subscriber: 'FormAddBarang',
        klinikId: this.klinikId,
        displayForm: true,
        formMode: 'add',
        listUnitBarang: this.listUnitSatuan,
        jenis: this.faktur.jenis
      });
    }
  }
  formEditBarang() {
    if (this.barangSelected != null) {
      // this.idKlinik = data.klinikId;
      // this.displayFormBarang = data.displayForm;
      // this.formMode = data.formMode;
      // const listUnitBarang = data.listUnitBarang;
      // const editedFarmasi = data.editedFarmasi;
      this._pembelianFarmasiService.getSatuans().subscribe(
          (rsp) => {
            if (rsp.length > 0) {
              this.listUnitSatuan = rsp;
            }

            const param = {
              subscriber: 'FormAddBarang',
              klinikId: this.klinikId,
              displayForm: true,
              formMode: 'edit',
              listUnitBarang: this.listUnitSatuan,
              editedFarmasi: this.barangSelected,
              orderIncluded: this.orderIncluded,
              jenis: this.faktur.jenis
              // orderToBePurchased: this.orderToBePurchased
            };
            if (this.orderIncluded && param.editedFarmasi.qty === 0) {
              param.editedFarmasi = Object.assign({}, param.editedFarmasi,
                  {qty: param.editedFarmasi.qtyOrder});
            }
            this._pembelianFarmasiService.postAnySubject(param);
          }, () => {}
      );

      // this._pembelianFarmasiService.setFormMode('edit');
      // this._pembelianFarmasiService.onBarangSelected(this.barangSelected);
    }
  }

  deleteBarang(editedRow: any = null) {
    if (this.barangSelected != null) {
      // this._pembelianFarmasiService.removeBarang(this.barangSelected);
      let message = `<table><tbody>`
          + `<tr><td>Hapus data yang dipilih:</td><td>&nbsp;</td><td><b>`
          + `${this.barangSelected.farmasiNama}</b></td></tr>`
          + `</tbody></table>`;
      let header = 'Konfirmasi Hapus';

      let totJumlah = 0;
      this.listBarang.forEach(row => {
        if (row.id !== this.barangSelected.id) {
          totJumlah += row.jumlah;
        }
      });

      let emittedValue = {
        rowDeleted: true, total: totJumlah
      };
      if (editedRow != null) {
        message = 'Rubah data yang dipilih';
        header = 'Konfirmasi Rubah';
        totJumlah += editedRow.jumlah;
        emittedValue = Object.assign({},
            {newOrChangedRow: editedRow, rowDeleted: false, total: totJumlah}
        );
      }

      const param: ConfirmDialogMsg = {
        header: header,
        message: message,
        icon: 'ui-icon-alert',
        key: 'appcfd',
        rejectVisible: true,
        accept: () => {
          this._pembelianFarmasiService.removeBarang(
              this.klinikId, this.barangSelected.id).subscribe((resp) => {
            if (resp.ok) {
              this.rowsChanged.emit(emittedValue);
            }
          });
        },
        reject: () => {
          return false;
        },
        acceptLabel: 'OK',
        rejectLabel: 'Batal'
      };
      this._pembelianFarmasiService.confirm(param);
    }
  }

  ngOnDestroy() {
    // if (this.listUnitSatuanSubs != null) {
    //   this.listUnitSatuanSubs.unsubscribe();
    // }
    // this.tableSubs.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  onRowSelected(event) {
    this.barangSelected = event.data;
  }

  loadDataRows(event: LazyLoadEvent) {
    this.tablePage = event.first / 10 + 1;
    this.loadData();
  }

  private loadData(/*firstRowOffs*/) {
    if (this.faktur != null && this.faktur.id != null && this.klinikId > 0) {
      this._pembelianFarmasiService.getFarmasiDibeli(
          this.klinikId, this.faktur.id, this.tablePage).subscribe((resp) => {
        this.barangSelected = null;
        this.totalRows = resp.count;

        let i = 0;
        resp.list.forEach(a => {
          a.rowIdx = i++;
          a.rowStatus = 0;
          if (this.faktur.jenis === 5) {
            if (!this.orderIncluded) {
              a.qty = a.qtyOrder;
              a.jumlah = a.qty * a.hargaSatuan;
            } else {
              a.jumlah = a.qty * a.hargaSatuan;
            }
          } else if (this.faktur.jenis === 0) {
            if (a.qty === 0) {
              a.jumlah = a.qtyOrder * a.hargaSatuan;
            }
          }
        });
        this.listBarang = [...resp.list];
      }, () => {});
    }
  }

  @Input()
  set compState(state: any) {
    if (state != null) {
      this.faktur = state;
      this.orderIncluded = state.orderCreateTime != null && state.jenis !== 1;
      this.readOnly = state.readOnly;
      if (this.readOnly) {
        this.divTableClass = 'ui-g-12 ui-md-12 ui-lg-12';
      } else {
        this.divTableClass = 'ui-g-11 ui-md-11 ui-lg-11';
      }
      if (state.id != null) {
        this.loadData();
      } else {
        this.listBarang = [];
      }
    }
  }

  private addNewOrder(barang) {
    this._pembelianFarmasiService.getSatuans().subscribe((rsp) => {
      let units = [];
      if (rsp.length > 0) {
        units = rsp;
      }

      this._pembelianFarmasiService.postAnySubject({
        subscriber: 'FormAddBarang',
        klinikId: this.klinikId,
        displayForm: true,
        formMode: 'add',
        listUnitBarang: units,
        editedFarmasi: Object.assign({}, {
          id: 0,
          fkId: barang.id,
          farmasiId: barang.farmasiId,
          farmasiNama: barang.nama,
          unit: barang.unitBarangFarmasiId,
          qtyOrder: 0,
          kode: barang.kode
        }),
        jenis: 5
      });
    }, () => {});
  }
}
