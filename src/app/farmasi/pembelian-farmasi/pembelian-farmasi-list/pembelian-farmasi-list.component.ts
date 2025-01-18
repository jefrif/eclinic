import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs/Subject';
import {IAppState} from 'app/store';
import {PembelianFarmasiService} from '../pembelian-farmasi.service';
import {CommonService} from 'app/shared/common.service';
import {IaccessViewRole} from 'app/Interfaces/iaccess-view-role';
import * as PelayananMedikActions from 'app/layanan/pelayanan-medik/store/pelayanan-medik.actions';
import {ConfirmDialogMsg} from 'app/Interfaces/confirm-dialog-msg';
import {SelectItem} from 'primeng/primeng';

@Component({
  selector: 'app-pembelian-farmasi-list',
  templateUrl: './pembelian-farmasi-list.component.html',
  styleUrls: ['./pembelian-farmasi-list.component.css']
})
export class PembelianFarmasiListComponent implements OnInit, OnDestroy {
  listPembelian: any;
  // tanggal: Date = new Date();
  idKlinik: any;
  // idKlinikSubs: Subscription;
  DiskonType = [
    {label: 'Persen (%)', value: 1},
    {label: 'Rupiah (Rp)', value: 2}
  ];
  selectedFaktur: any = null;
  filterModel = {
    dateFrom: new Date(),
    dateTo: new Date()
  };
  maxiDate = new Date();
  private avRole: Observable<IaccessViewRole>;
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  jenis = 0;
  title = '';
  purchaseByOrder = false;
  canEdit = true;
  canAdd = true;
  gudangs: SelectItem[];
  seldGudangId: number;
  private gudangsLoaded$ = new Subject<number>();
  private dateInited$ = new Subject<number>();
  selcGudangDsbl = false;

  constructor(private _pembelianFarmasi: PembelianFarmasiService,
              private router: Router, private store: Store<IAppState>,
              private commonService: CommonService) {
    this.avRole = store.select(s => s.accessViewRole);
  }

  ngOnInit() {
    this.avRole.takeUntil(this.destroyed$).subscribe((avr: IaccessViewRole) => {
      this.idKlinik = parseInt(avr.klinikId, 10);
      this._pembelianFarmasi.getGudangs(this.idKlinik, avr.userId).subscribe((resp) => {
            let gudangId = 0;
            if (resp.length > 0) {
              this.gudangs = resp
                  .map(row => <SelectItem> {label: row.nama, value: row.gudangFarmasiId});
              this.gudangs.push(<SelectItem> {label: '- tidak pakai gudang -', value: 0});
              gudangId = this.gudangs[0].value;
            }
            this.gudangsLoaded$.next(gudangId);
          },
          () => {
            this.gudangsLoaded$.next(0);
          });
    });
    this.store.dispatch(new PelayananMedikActions.AddGenStateAction({
      state: {
        menuDisabled: this.purchaseByOrder
      }
    }));
    const combined = Observable.combineLatest(this.gudangsLoaded$, this.dateInited$);
    combined.takeUntil(this.destroyed$).subscribe(([gudangId1, gudangId2]) => {
      if (gudangId1 > 0) {
        if (gudangId2 > 0) {
          this.seldGudangId = gudangId2;
        } else if (gudangId2 < 0) {
          this.seldGudangId = gudangId1;
        }
      }
      this.loadData();
    });
  }

  @Input()
  set inputState(state: any) {
    if (state != null) {
      if (state.jenis != null) {
        this.jenis = Number(state.jenis);
        switch (this.jenis) {
          case 0:
            this.title = 'Pembelian Farmasi';
            break;

          case 4:
            this.title = 'Penerimaan Hibah';
            break;

          case 5:
            this.title = 'Order Pengadaan Farmasi';
            break;
        }
        this.commonService.getServerDate().subscribe(
            respo => { // TODO: Subuh tgl filter berkurang 1, tinggal test
              const tglISO = respo.now.substr(0, 19) + '+07:00';
              this.filterModel.dateTo = new Date(Date.parse(tglISO));
              this.maxiDate = new Date(Date.parse(tglISO));
              this.filterModel.dateFrom = new Date(Date.parse(tglISO));
              this.filterModel.dateFrom.setDate(1);
              if (state.gudangId != null) {
                this.dateInited$.next(state.gudangId);
              } else if (state.mode != null) {
                this.selcGudangDsbl = true;
                this.dateInited$.next(0);
              } else {
                this.dateInited$.next(-1);
              }
            }
        );
      }

      if (state.order != null) {
        this.purchaseByOrder = true;
      }
    }
  }

  private loadData() {
    // this.setListFaktur(e);
    const params: URLSearchParams = new URLSearchParams();
    params.set('Tanggal', PembelianFarmasiService.dateToStr(
        this.filterModel.dateFrom, 'T00:00:00'));
    params.set('toDate', PembelianFarmasiService.dateToStr(
        this.filterModel.dateTo, 'T23:59:59'));
    params.set('Jenis', this.jenis.toString());
    if (this.seldGudangId != null) {
      params.set('gudangFarmasiId', this.seldGudangId.toString());
    }

    this._pembelianFarmasi.getListFakturBeliFarmasi(this.idKlinik, params)
        .subscribe((resp) => {
          this.listPembelian = resp;
          this.calculateTotalNet();
        }, () => {});
  }
  onRowSelected(e) {
    this.selectedFaktur = e.data;
  }
  equateDiskonType(param: any) {
    let ket = '';
    this.DiskonType.forEach((x) => {
      if (x.value === param) {
        ket = x.label;
      }
    });
    return ket;
  }

  calculateTotalNet() {
    this.listPembelian.forEach((x) => {
      if (x.diskonType === 1) {
        x.netTotal = x.total - ( (x.total * x.diskon) / 100 ) + x.ongkir;
      } else if (x.diskonType === 2) {
        x.netTotal = (x.total - x.diskon) + x.ongkir;
      } else {
        x.netTotal = x.total + x.ongkir;
      }
    });
  }
  toPembelianFarmasi(createNew = true) {
    let param = {jenis: this.jenis, mode: 1};   // mode=editing
    if (this.seldGudangId != null) {
      param = Object.assign({gdid: this.seldGudangId}, param);
    }

    if (createNew) {
      this.router.navigate(['admin/farmasi/pembelian-farmasi', param]).then();
    } else {
      if (this.selectedFaktur != null) {
        param = Object.assign({id: this.selectedFaktur.id}, param);
        if (this.jenis === 5 && this.selectedFaktur.jenis === 0) {
          this._pembelianFarmasi.showMessage('warn', 'Tidak Bisa Dirubah!',
              'Sudah ada pembelian');
        }
        this.router.navigate(['admin/farmasi/pembelian-farmasi', param]).then();
      } else {
        this._pembelianFarmasi.showMessage('warn', 'Perhatian!',
            'Pilih data lebih dulu');
      }
    }
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  createPembelian() {
    if (this.jenis === 0) {
      const param: ConfirmDialogMsg = {
        header: 'Konfirmasi Pembelian',
        message: 'Pembelian melalui order atau tidak?',
        icon: 'ui-icon-alert',
        key: 'appcfd',
        rejectVisible: true,
        accept: () => {
          let par = {jenis: 5, order: true, mode: 1};   // mode=editing
          if (this.seldGudangId != null) {
            par = Object.assign({gdid: this.seldGudangId}, par);
          }
          this.router.navigate(['/admin/farmasi/order-beli-farmasi', par])
              .then(() => {
                this.store.dispatch(new PelayananMedikActions.AddGenStateAction({
                  state: {
                    menuDisabled: true
                  }
                }));
              });
        },
        reject: () => {
          this.toPembelianFarmasi();
        },
        acceptLabel: 'Ya',
        rejectLabel: 'Tidak'
      };
      this._pembelianFarmasi.confirm(param);
    } else {
      this.toPembelianFarmasi();
    }
  }

  deletePembelian() {   // TODO: add del StockFarmasi
    if (this.selectedFaktur != null) {
      if (this.jenis === 5 && this.selectedFaktur.jenis === 0) {
        this._pembelianFarmasi.showMessage('warn', 'Tidak Bisa Dihapus!',
            'Sudah ada pembelian');
        return;
      }

      const param: ConfirmDialogMsg = {
        header: 'Konfirmasi Hapus',
        message: 'Pembelian akan dihapus!',
        icon: 'ui-icon-alert',
        key: 'appcfd',
        rejectVisible: true,
        accept: () => {
          this._pembelianFarmasi.delFakturBeliFarmasi(
              this.idKlinik, this.selectedFaktur.id)
              .subscribe((resp) => {
                if (resp.ok) {
                  this.loadData();
                }
              }, () => {
              });
        },
        reject: () => {
        },
        acceptLabel: 'Hapus',
        rejectLabel: 'Tidak'
      };
      this._pembelianFarmasi.confirm(param);
    } else {
      this._pembelianFarmasi.showMessage('warn', 'Perhatian!',
          'Pilih pembelian lebih dulu');
    }
  }

  onSelectDateFrom(val) {
    this.filterModel.dateFrom = val;
    this.loadData();
  }

  onSelectDateTo(val) {
    this.filterModel.dateTo = val;
    this.loadData();
  }

  onClickPilihOrder() {
    if (this.selectedFaktur != null) {
      if (this.jenis === 5 && this.selectedFaktur.jenis === 0) {
        this._pembelianFarmasi.showMessage('warn', 'Tidak Bisa Dirubah!',
            'Sudah ada pembelian');
        return;
      }
      let param = {jenis: this.jenis, id: this.selectedFaktur.id, order: 1, mode: 1};
      if (this.seldGudangId != null) {
        param = Object.assign({gdid: this.seldGudangId}, param);
      }
      this.router.navigate(['admin/farmasi/pembelian-farmasi', param]).then();
    } else {
      this._pembelianFarmasi.showMessage('warn', 'Perhatian!',
          'Pilih order lebih dulu');
    }
  }

  onClickBack() {
    this.router.navigate(['admin/farmasi/pembelian-farmasi-list', {jenis: 0}]).then();
  }

  onChangeGudangs(ev) {
    if (ev.value > 0) {
      this.seldGudangId = ev.value;
    } else {
      this.seldGudangId = null;
    }
    this.loadData();
  }
}
