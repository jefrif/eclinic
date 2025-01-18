import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import { FormControl } from '@angular/forms';
import { PembelianFarmasiService } from './pembelian-farmasi.service';
import { ISupplier } from 'app/Interfaces/supplier.model';
import { Subscription } from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
// import * as accessViewsConst from '../shared/ConstAccess';
import {CommonService} from 'app/shared/common.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GlobalsService} from 'app/service/globals.service';
import {IaccessViewRole} from 'app/Interfaces/iaccess-view-role';
import {IAppState} from 'app/store';
import * as PelayananMedikActions from 'app/layanan/pelayanan-medik/store/pelayanan-medik.actions';
import {SelectItem} from 'primeng/primeng';

@Component({
  selector: 'app-pembelian-farmasi',
  templateUrl: './pembelian-farmasi.component.html',
  styleUrls: ['./pembelian-farmasi.component.css']
})
export class PembelianFarmasiComponent implements OnInit, OnDestroy {
  supplierFiltered: any[];
  supplierSelected: ISupplier;
  listKlinik: any[];
  listKlinikSub: Subscription;
  idKlinik: any;
  // idKlinikSubs: Subscription;
  // listBarang: any = [];
  // listBarangSubs: Subscription;
  totalJumlah = 0;
  tanggal: Date/* = new Date(Date.now())*/;
  showListKlinik = true;
  optDiskonType: any;
  totalNet = 0;
  diskonType = 1;
  fOngkir = new FormControl();
  fcDiskon = new FormControl();
  accessView = null;
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  // mode = 1;     // 1 = Pembelian, 2 = Stok Awal
  formTitle = 'Pembelian Farmasi';
  private faktur: any = {};
  private avRole: Observable<IaccessViewRole>;
  @ViewChild('FSupplier') form;
  selectedId = '0';
  fieldModified = false;
  private noFakturModified = false;
  private diskonModified = false;
  private ongkirModified = false;
  private diskonTypeModified = false;
  private supplierModified = false;
  tanggalMax = new Date();
  jenis = 0;
  private initialDate: Date;
  purchaseByOrder = false;
  orderIncluded = false;
  gudangs: SelectItem[];
  seldGudangId: number;
  selcGudangDsbl = false;

  constructor(private _pembelianFarmasiService: PembelianFarmasiService,
              private globalService: GlobalsService,
              private commonService: CommonService,
              // private confirmationService: ConfirmationService,
              private router: Router, private route: ActivatedRoute,
              private store: Store<IAppState>/*,
              private globalService: GlobalsService*/) {
    this.supplierSelected = {id: null, nama: '', alamat: '', telepon: ''};
    this.avRole = store.select(s => s.accessViewRole);
  }

  ngOnInit() {
    this.commonService.getServerDate().subscribe(
        respo => {
          this.tanggal = new Date(respo.now);
          this.initialDate = new Date(respo.now);
          this.tanggalMax = new Date(respo.now);
        }
    );

    const id = this.route.snapshot.paramMap.get('id');
    this.selectedId = id != null ? id : '0';
    const jenis = this.route.snapshot.paramMap.get('jenis');
    const gudangId = this.route.snapshot.paramMap.get('gdid');
    const mode = this.route.snapshot.paramMap.get('mode');
    this.selcGudangDsbl = mode != null;

    if (jenis != null) {
      this.jenis = Number(jenis);
      switch (this.jenis) {
        case 1:
          this.formTitle = 'Stok Awal Farmasi';
          break;
        case 4:
          this.formTitle = 'Penerimaan Hibah';
          this.fcDiskon.disable({emitEvent: false});
          this.store.dispatch(new PelayananMedikActions.AddGenStateAction({
            state: {
              menuDisabled: true
            }
          }));
          break;
        case 5:
          const order = this.route.snapshot.paramMap.get('order');
          this.purchaseByOrder = order != null ? order === '1' : false;
          if (this.purchaseByOrder) {
            this.formTitle = 'Proses Order untuk Pembelian Farmasi';
          } else {
            this.formTitle = 'Order Pengadaan Farmasi';
          }
          this.fcDiskon.disable({emitEvent: false});
          this.store.dispatch(new PelayananMedikActions.AddGenStateAction({
            state: {
              menuDisabled: true
            }
          }));
          if (this.selectedId === '0') {
            let faktur = {
              jenis: this.jenis,
              purchaseByOrder: this.purchaseByOrder,
              id: 0
            };
            if (gudangId != null) {
              faktur = Object.assign({gudangFarmasiId: parseInt(gudangId, 10)}, faktur);
            }
            this.faktur = faktur;
          }
          break;
        default:
          this.store.dispatch(new PelayananMedikActions.AddGenStateAction({
            state: {
              menuDisabled: true
            }
          }));
      }
    }

    this.avRole.takeUntil(this.destroyed$).subscribe((avr: IaccessViewRole) => {
      this.idKlinik = parseInt(avr.klinikId, 10);
      if (avr.list != null) {
        const path = '/admin/farmasi/pembelian-farmasi';
        const list = avr.list.filter(
            en => en.accessViewPath != null && en.accessViewPath.indexOf(path) >= 0);

        if (list.length > 0) {
          this.accessView = list[0];
        }
      }

      // if (avr.userId != null) {
      this._pembelianFarmasiService.getGudangs(this.idKlinik, avr.userId)
          .subscribe((resp) => {
            if (resp.length > 0) {
              this.gudangs = resp
                  .map(row => <SelectItem> {label: row.nama, value: row.gudangFarmasiId});
              this.gudangs.push(<SelectItem> {label: '- tidak pakai gudang -', value: 0});
              if (gudangId != null) {
                this.seldGudangId = parseInt(gudangId, 10);
              } else if (mode == null) {
                this.seldGudangId = this.gudangs[0].value;
              }
            }
            this.initialize();
          },
          () => {
            this.initialize();
          });
      // }
    });

    this.fOngkir.valueChanges.takeUntil(this.destroyed$).subscribe((value: number) => {
      this.ongkirModified = this.faktur.ongkir !== value;
      this.calcTotalNet();
    });

    this.fcDiskon.valueChanges.takeUntil(this.destroyed$).subscribe((value: number) => {
      this.diskonModified = this.faktur.diskon !== value;
      this.calcTotalNet();
    });

    this._pembelianFarmasiService.getFormAddSupplier()
        .takeUntil(this.destroyed$).subscribe((param: any) => {
      if (!param.show) {
        this.supplierSelected = param.newSupplier;
      }
    });
    // this.accessView = this.globalService.getAccessView(20);
    // this.commonService.setKlinikId();
    // this.idKlinik = this.commonService.getKlinikId();
    this.showListKlinik = this.commonService.showKlinikList();
    // this.idKlinikSubs = this.commonService.klinikIdSubject$
    //   .subscribe((resp) => this.idKlinik = resp);
    if (this.showListKlinik) {
      this.listKlinikSub = this._pembelianFarmasiService.KlinikList
          .subscribe(
              (resp) => {
                if (resp.length > 0) {
                  this.listKlinik = [];
                  for (let i = 0; i < resp.length; i++) {
                    this.listKlinik.push({label: resp[i].nama, value: resp[i].id});
                  }
                }
              }
          );
      this.getKlinik();
    }
/*
    this.listBarangSubs = this._pembelianFarmasiService.barangObsrv
      .subscribe(
        (data) => {
          this.listBarang = [...data];
          this.totalJumlah = 0;
          this.listBarang.forEach(x => {
            this.totalJumlah += x.jumlah;
          });
          this.calcTotalNet();
        }
      );
*/
    this.optDiskonType = [
      {label: 'Tipe', value: 0},
      {label: '%', value: 1},
      {label: 'Rp', value: 2}
    ];
    this._pembelianFarmasiService.removeListBarang();
  }

  private initialize() {
    if (this.selectedId !== '0' || this.jenis === 1) {
      this.refresh();
    } else {
      this.fcDiskon.setValue(0, {onlySelf: true, emitEvent: false});
      this.fOngkir.setValue(0, {onlySelf: true, emitEvent: false});
    }
  }

  private refresh() {
    const params: URLSearchParams = new URLSearchParams();
    if (this.selectedId !== '0') {
      params.set('FakturBeliFarmasiId', this.selectedId);
    } else {
      params.set('Jenis', this.jenis.toString());
    }
    if (this.seldGudangId != null) {
      params.set('gudangFarmasiId', this.seldGudangId.toString());
    }

    this._pembelianFarmasiService.getListFakturBeliFarmasi(this.idKlinik, params)
        .subscribe((resp) => {
          if (resp.length > 0) {
            this.faktur = Object.assign(    // refresh child table
                {
                  readOnly: (this.purchaseByOrder
                  || (this.jenis === 5 && resp[0].jenis === 0))
                }, resp[0]);
            if (this.faktur.supplierFarmasi != null) {
              this.supplierSelected = this.faktur.supplierFarmasi;
            } else {
              this.supplierSelected = {id: null, nama: '', alamat: '', telepon: ''};
            }
            this.orderIncluded = this.faktur.orderCreateTime != null && this.jenis !== 1;
          } else {
            let faktur = {readOnly: this.purchaseByOrder, jenis: this.jenis};
            if (this.seldGudangId != null) {
              faktur = Object.assign({gudangFarmasiId: this.seldGudangId}, faktur);
            }
            this.faktur = faktur;
            this.supplierSelected = {id: null, nama: '', alamat: '', telepon: ''};
          }
          this.fakturReloaded();
        }, () => {});
  }

  private fakturReloaded() {
    if (this.faktur.id != null && this.faktur.id > 0) {
      this.totalJumlah = this.faktur.total;
      this.fcDiskon.setValue(this.faktur.diskon, {onlySelf: true, emitEvent: false});
      this.fOngkir.setValue(this.faktur.ongkir, {onlySelf: true, emitEvent: false});
      this.diskonType = this.faktur.diskonType;

      const tglISO = this.faktur.waktu.substr(0, 19) + '+07:00';
      // console.log(`tglISO = ${tglISO}`);
      // const tanggal = new Date(Date.parse(tglISO));
      // console.log(tanggal);
      // const offset = tanggal.getTimezoneOffset() / 60;
      // tanggal.setHours(tanggal.getHours() + offset);
      this.tanggal = new Date(Date.parse(tglISO));
    } else {
      this.totalJumlah = 0;
      this.fcDiskon.setValue(0, {onlySelf: true, emitEvent: false});
      this.fOngkir.setValue(0, {onlySelf: true, emitEvent: false});
      this.diskonType = 1;
      this.tanggal.setMilliseconds(this.initialDate.getMilliseconds());
    }
    this.noFakturModified = false;
    this.diskonModified = false;
    this.ongkirModified = false;
    this.diskonTypeModified = false;
    this.supplierModified = false;
    this.calcTotalNet();
  }

  getKlinik() {
    this._pembelianFarmasiService.getKlinik()
      .subscribe(
        (resp) => {
          this._pembelianFarmasiService.setKlinik(resp);
        }, () => {}
      );
  }

  formSupplier() {
    const param = {
      show: true,
      klinikId: this.idKlinik,
      nama: ''
    };
    if (typeof this.supplierSelected === 'string') {
      param.nama = this.supplierSelected;
    }
    this._pembelianFarmasiService.setFormAddSupplier(param);
  }

  SearchSupplier(e) {
    this._pembelianFarmasiService.getSupplierByName(this.idKlinik, e.query)
      .subscribe(
        (resp) => {
          if (resp.length > 0) {
            // this.supplierList = resp;
            this.supplierFiltered = resp;
          } else {
            // this.supplierList = [];
            this.supplierFiltered = [];
            // this.supplierSelected = {id: 0, nama: '', alamat: '', telepon: ''};
          }
        }, () => {}
      );
  }

  onSelectSupplier(e) {
    // this.supplierSelected = e;
    if (e.id != null) {
      if (this.faktur.supplierFarmasi != null) {
        this.supplierModified = this.faktur.supplierFarmasi.id !== e.id;
      } else {
        this.supplierModified = true;
      }
      this.fieldModified = this.noFakturModified || this.diskonModified
          || this.diskonTypeModified || this.ongkirModified || this.supplierModified;
    }
  }

  setSelectedKlinik(e) {
    this.commonService.setKlinikId(e.value);
    // this._pembelianFarmasiService.setIdKlinik(e.value);
  }

  onChangeDiskonType(f) {
    this.diskonTypeModified = this.faktur.diskonType !== f.value.diskonType;
    this.calcTotalNet();
  }

  private calcTotalNet() {
    this.fieldModified = this.noFakturModified || this.diskonModified
        || this.diskonTypeModified || this.ongkirModified || this.supplierModified;
    const TotalPembelian = Number(this.totalJumlah);
    if (this.diskonType === 1) {
      this.totalNet = (TotalPembelian - ((TotalPembelian * this.fcDiskon.value) / 100))
          + this.fOngkir.value;
    } else if (this.diskonType === 2) {
      this.totalNet = (TotalPembelian - this.fcDiskon.value) + this.fOngkir.value;
    }
  }
  Simpan(f, rowState = null) {
    const barangs = [];
    if (rowState != null) {
      if (rowState.total != null) {
        this.totalJumlah = rowState.total;
      }
      if (rowState.newOrChangedRow != null) {
        if (this.jenis === 5) {
          rowState.newOrChangedRow.qtyOrder = rowState.newOrChangedRow.kuantitas;
          rowState.newOrChangedRow.kuantitas = 0;
        }
        if (this.seldGudangId != null) {
          rowState.newOrChangedRow.gudangFarmasiId = this.seldGudangId;
        }
        barangs.push(rowState.newOrChangedRow);
      }
    }
/*
    this.listBarang.forEach(x => {
      if (x.rowStatus > 0) {
        const exp = new Date(Date.parse(x.expired));
        exp.setHours(now.getHours() - offset, now.getMinutes(),
            now.getSeconds(), now.getMilliseconds());
        const temp = {
          farmasiId: x.farmasiId,
          farmasiNama: x.farmasiNama,
          kuantitas: x.qty,
          unitBarangFarmasiId: x.unit,
          kode: x.kode,
          hargaBeliSatuan: x.hargaSatuan,
          expired: exp
        };
        newListbarang.push(temp);
      }
    });

    const now = new Date();
    const offset = now.getTimezoneOffset() / 60;
    const tglNow = new Date(now.getTime());
    tglNow.setHours(now.getHours() - offset, now.getMinutes(),
        now.getSeconds(), now.getMilliseconds());
  */

    const waktu = new Date();
    waktu.setFullYear(this.tanggal.getFullYear());
    waktu.setMonth(this.tanggal.getMonth());
    waktu.setDate(this.tanggal.getDate());
    const offset = waktu.getTimezoneOffset() / 60;
    waktu.setHours(waktu.getHours() - offset);

    let fbFarmasi = {
      id: (this.faktur.id == null ? 0 : this.faktur.id),
      supplierFarmasiId: null,
      waktu: waktu,
      diskon: 0,
      diskonType: 1,
      ongkir: 0,
      noFaktur: '-/sa/-',
      jenis: 1,
      total: this.totalJumlah,
      klinikId: this.idKlinik,
      farmasiDibeli: barangs
    };

    if (this.seldGudangId != null) {
      fbFarmasi = Object.assign(fbFarmasi, {gudangFarmasiId: this.seldGudangId});
    }

    if (this.jenis !== 1) {     // not Stok Awal
      if (f.value.supplier != null && f.value.supplier.id != null) {
        fbFarmasi.supplierFarmasiId = f.value.supplier.id;
      }
      fbFarmasi.diskon = this.fcDiskon.value;
      fbFarmasi.diskonType = f.value.diskonType != null ? f.value.diskonType : 1;
      fbFarmasi.ongkir = this.fOngkir.value;
      fbFarmasi.noFaktur = f.value.noFaktur;  // this.form.value.noFaktur
      fbFarmasi.jenis = this.jenis;
    }

    // this._pembelianFarmasiService.fireTableSubj(fbFarmasi);
    this._pembelianFarmasiService.postFakturBeliFarmasi(
        this.idKlinik, fbFarmasi).subscribe((resp) => {
      if (resp.ok) {
        this.faktur = Object.assign(    // refresh child table
            {purchaseByOrder: this.purchaseByOrder}, resp.json());
        this.orderIncluded = this.faktur.orderCreateTime != null;

        if (rowState != null && rowState.rowDeleted != null) {
          this.selectedId = this.faktur.id.toString();
          this.refresh();
        } else {
          this.fakturReloaded();
        }
      }
    }, () => {
      this.refresh();
    });

    /*
    if (paramPost.farmasiDibeli.length > 0) {
      this._pembelianFarmasiService.postFakturBeliFarmasi(this.idKlinik, paramPost).subscribe((resp) => {
          if (resp.ok) {
            this._pembelianFarmasiService.removeListBarang();
            const faktur = resp.json();
            this._pembelianFarmasiService.postJurnalBeli(faktur.klinikId, faktur.id).subscribe(res => {
              this.commonService.showMessage('success', 'OK', 'Pembelian Farmasi Selesai');
              this.router.navigate(['admin/farmasi/pembelian-farmasi-list']);
/!*
              this.confirmationService.confirm({
                message : 'Data berhasil disimpan',
                icon : 'fa fa-question-circle',
                rejectVisible: false,
                accept : () => {
                  this.router.navigate(['admin/farmasi/pembelian-farmasi-list']);
                }
              });
*!/
            }, err => this.commonService.showError(err));
          }
        }, (error) => {
          this.commonService.showError(error);
          // this.globalService.showError(error);
          // this.confirmationService.confirm({
          //   message : 'Data gagal disimpan',
          //   icon : 'fa fa-question-circle',
          //   rejectVisible: false,
          //   accept : () => {
          //     return false;
          //   }
          // });
        });
    } else {
      this.commonService.showMessage('warn', 'Info', 'Item belum diisi');
    }
*/
  }
  btnBatal() {
    this.refresh();
  }

  onClickBack() {
    if (this.purchaseByOrder) {
      this.router.navigate(['/admin/farmasi/order-beli-farmasi',
        {jenis: 5, order: true}])
          .then(() => {
            this.store.dispatch(new PelayananMedikActions.AddGenStateAction({
              state: {
                menuDisabled: true
              }
            }));
          });
    } else {
      this.router.navigate(
          ['admin/farmasi/pembelian-farmasi-list', {jenis: this.jenis}]).then();
    }
  }

  onClickPurchase() {
    this.faktur.jenis = 0;
    this.jenis = 0;
    this.faktur = Object.assign(    // refresh child table
        {}, this.faktur, {purchaseByOrder: false});
    this.purchaseByOrder = false;
    this.formTitle = 'Pembelian Farmasi';
/*
    const fbFarmasi = {
      id: (this.faktur.id == null ? 0 : this.faktur.id),
      orderToPurchase: true
    };

    this._pembelianFarmasiService.postFakturBeliFarmasi(
        this.idKlinik, fbFarmasi).subscribe((resp) => {
      if (resp.ok) {
        this.purchaseByOrder = false;
        this.faktur = Object.assign(    // refresh child table
            {purchaseByOrder: this.purchaseByOrder}, resp.json());
        this.jenis = this.faktur.jenis;
        this.fakturReloaded();
        this._pembelianFarmasiService.showMessage('success', 'Order Selesai',
            'Order telah menjadi pembelian<br/>Silahkan disesuaikan');
        this.formTitle = 'Pembelian Farmasi';
      }
    }, () => {
      this.refresh();
    });
*/
  }

  ngOnDestroy() {
    // this.idKlinikSubs.unsubscribe();
    // if (this.listBarangSubs != null) {
    //   this.listBarangSubs.unsubscribe();
    // }
    if (this.listKlinikSub != null) {
      this.listKlinikSub.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  tableRowsChanged(values) {
    // if (values.newOrChangedRow != null) {
      this.Simpan(this.form, values);
    // } else if (values.rowDeleted) {
    //   this.selectedId = this.faktur.id;
    //   this.refresh();
    // }
  }

  onKeyup(ev, field) {
    if (field === 1) {
      this.noFakturModified = this.form.value.noFaktur !== this.faktur.noFaktur;
    }
    this.fieldModified = this.noFakturModified || this.diskonModified
        || this.diskonTypeModified || this.ongkirModified || this.supplierModified;
  }

  onSelectDate(value) {
    this.tanggal = value;
  }

  onChangeGudangs(ev) {
    if (ev.value > 0) {
      this.seldGudangId = ev.value;
    } else {
      this.seldGudangId = null;
    }
    this.refresh();
  }

  /*
  logNameChange() {
    const nameControl = this.get('fOngkir');
    nameControl.valueChanges.forEach(
        // (value: string) => this.nameChangeLog.push(value)
    );
  }
*/
}
