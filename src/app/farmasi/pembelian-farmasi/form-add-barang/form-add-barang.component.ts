import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {PembelianFarmasiService} from '../pembelian-farmasi.service';
import {Subscription} from 'rxjs/Subscription';
// import * as accessViewsConst from '../../shared/ConstAccess';
// import {CommonService} from 'app/shared/common.service';
// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/combineLatest';
import {GlobalsService} from 'app/service/globals.service';
// import {ConfirmationService} from 'primeng/primeng';

@Component({
  selector: 'app-form-add-barang',
  templateUrl: './form-add-barang.component.html',
  styleUrls: ['./form-add-barang.component.css']
})
export class FormAddBarangComponent implements OnInit, OnDestroy {
  displayFormBarang = false;
  farmasiFiltered: any[];
  // farmasiList = [];
  private farmasiSelected: any;
  // listUnit: any;
  qtys = 0;
  hargaSatuans: number;
  totals: number;
  subsc: Subscription;
  idKlinik: any;
  kodes: any;
  unitBarangId: any;
  kodeIsReadOnly = true;
  editedFarmasi: any;
  farmasi: any;
  formMode: string;
  expired: Date = new Date(Date.now());
  // accessView = null;
  searching: string;
  searchPage: number;
  satuan: any = null;
  suggestedSatuan: any[];
  listSatuan: any[];
  listSatuanBack: any[] = [];
  unitDrownClicked = false;
  satuanSelected = false;
  checkingSatuan = false;
  // newSatuanSubsc: Subscription;
  // satuanChangeEventCreated = false;
  txtNamaSatuan = '';
  newSatuan: any;
  mode = 0;     // 1=Permintaan
  title = 'Tambah Barang Baru';
  lblQtyOrder = 'Qty';
  // orderToBePurchased = false;

  constructor(private _pembelianFarmasiService: PembelianFarmasiService,
              private globalService: GlobalsService, private renderer: Renderer2/*,
              private commonService: CommonService, private confirmationService: ConfirmationService*/) {
    this.farmasiSelected = { id: 0, nama: '', kode: '', stok: 0, saldo: 0};
  }

  ngOnInit() {
    // this.accessView = this.globalService.getAccessView(30);
/*
    const combined = Observable.combineLatest(
      // this.commonService.klinikIdSubject$,
      this._pembelianFarmasiService.getFormAddBarangSubj(),
      this._pembelianFarmasiService.formMode$,
      this._pembelianFarmasiService.SatuanList
    );
*/
    this.searchPage = 0;
    // this.idKlinik = this.commonService.getKlinikId();
    this.subsc = this._pembelianFarmasiService.getAnySubject()
        .asObservable().subscribe(data => {
          /*const [klinikId, displayForm, formMode, listUnitBarang] = data;*/
          if (data.subscriber === 'FormAddBarang' && data.displayForm) {
            this.idKlinik = data.klinikId;
            this.displayFormBarang = data.displayForm;
            this.formMode = data.formMode;
            const listUnitBarang = data.listUnitBarang;

            if (data.formMode === 'edit') {
              this.title = 'Edit Barang';
            } else {
              this.title = 'Tambah Barang Baru';
              this.qtys = 0;
            }
            // this.orderToBePurchased = data.orderToBePurchased;
            /*
              if (!this.satuanChangeEventCreated) {
                const d = this.renderer.selectRootElement('#unFa');
                if (d != null) {
                  d.addEventListener('change', (ev) => {
                    if (ev.target != null && ev.target.value != null
                        && ev.target.value.toString().length > 0) {
                      this.txtNamaSatuan = ev.target.value.toString();
                      this.getFocusQty();
                    }
                  });
                  d.addEventListener('focus', () => {
                    this.unitDrownClicked = false;
                  });
                }

          /!*
              d = this.renderer.selectRootElement('#qtyFm');
              if (d != null) {
                d.addEventListener('focus', () => this.getFocusQty());
              }
          *!/
              this.satuanChangeEventCreated = true;
            }
          */
          if (listUnitBarang.length > 0) {
            /*
              this.listUnit = [];
              for (let i = 0; i < listUnitBarang.length; i++) {
                this.listUnit.push({label: listUnitBarang[i].nama, value: listUnitBarang[i].id});
              }
            */
            // this.listUnit = [...listUnitBarang];
            this.listSatuanBack = [...listUnitBarang];

            this.listSatuan = [];
            let row = null, tnama = '', i: number;
            for (i = 0; i < this.listSatuanBack.length; i++) {
              row = this.listSatuanBack[i];
              tnama = row.nama.trim();
              row.text = tnama;
              this.listSatuan.push(row);
            }
          }

            if (/*formMode === 'edit' && this.subsc2 == null*/data.editedFarmasi != null) {
              // this.subsc2 = this._pembelianFarmasiService.selectedFarmasi$.subscribe(editedFarmasi => {
              // this.editedFarmasi = Object.assign({}, editedFarmasi);
              const editedFarmasi = data.editedFarmasi;
              this.editedFarmasi = editedFarmasi;
              this.farmasi = {id: editedFarmasi.farmasiId, nama: editedFarmasi.farmasiNama};
              this.OnSelectFarmasi({id: this.farmasi.id, nama: this.farmasi.nama});
              if (editedFarmasi.expired != null) {
                this.expired = new Date(Date.parse(editedFarmasi.expired));
              }

              if (editedFarmasi.unit != null) {
                this.unitBarangId = editedFarmasi.unit;
                let i = 0, found = false;
                while (i < this.listSatuanBack.length && !found) {
                  found = this.listSatuanBack[i].id === this.unitBarangId;
                  if (!found) {
                    i++;
                  } else {
                    this.satuan = this.listSatuanBack[i];
                  }
                }

                const proms = new Promise((resolve/*, reject*/) => {
                  resolve(found);
                });
                proms.then((got: boolean) => {
                  if (got) {
                    const d = this.renderer.selectRootElement('#unFa');
                    if (d != null) {
                      d.value = this.satuan.nama;
                    }
                  }
                });

                this.kodes = editedFarmasi.kode;
              }

              if (editedFarmasi.qtyOrder == null
                  || (data.jenis != null && data.jenis !== 5)) {
                this.title = 'Edit Barang';
                this.qtys = editedFarmasi.qty;
                this.hargaSatuans = editedFarmasi.hargaSatuan;
              } else {
                if (data.orderIncluded != null && data.orderIncluded) {
                  if (editedFarmasi.qty === 0) {
                    this.qtys = editedFarmasi.qtyOrder;
                  } else {
                    this.qtys = editedFarmasi.qty;
                  }
                }
                if (data.jenis != null && data.jenis === 5) {
                  this.mode = 1;
                  this.qtys = editedFarmasi.qtyOrder;
                  this.title = 'Permintaan Barang';
                  this.lblQtyOrder = 'Qty Permintaan';
                }
                this.hargaSatuans = editedFarmasi.hargaSatuan != null
                    ? editedFarmasi.hargaSatuan : 0;
              }
              this.HitungTotal();
              // });
            } else if (data.mode === 1) {
              this.mode = 1;
              this.title = 'Permintaan Barang';
              this.lblQtyOrder = 'Qty Permintaan';
            }
        }
    });
/*
    this.newSatuanSubsc = this._pembelianFarmasiService.newSatuan$.subscribe(st => {
          this.satuan = st;
          this.unitBarangId = st.id;
          this.kodeIsReadOnly = false;
        }
    );
*/
  }

/*
  btnShowFormSatuan() {
    const d = this.renderer.selectRootElement('#stFa');
    if (d != null) {
      d.dispatchEvent(new MouseEvent('click'));
    }
  }
*/

  SearchFarmasi(e) {
    const search: string = e.query.toString()/*.toLowerCase()*/;
    let page = 1;
    if (this.searching === search) {
      page = this.searchPage;
    } else {
      this.searching = search;
      this.searchPage = page;
    }
/*
    if (search.indexOf(this.searching) >= 0) {
      this.constructSearchResult(search);
    }
   if (this.farmasiList.length === 0 || search.length === 1) {
*/
      this._pembelianFarmasiService.getFarmasiByName(search, page)
          .subscribe(
              (resp) => {
                if (resp.list != null && resp.list.length > 0) {
                  let row = null, occPos = -1, tnama = '', tleft = '', tright = '', tmid = '';
                  const searchTxt = search.toLowerCase();
                  for (let i = 0; i < resp.list.length; i++) {
                    row = resp.list[i];
                    tnama = row.nama.trim();
                    tleft = '';
                    occPos = row.nama.toLowerCase().indexOf(searchTxt);
                    if (occPos > 0) {
                      tleft = tnama.slice(0, occPos);
                    }
                    tmid = tnama.substr(occPos, search.length);
                    tright = tnama.slice(occPos + search.length, tnama.length);
                    row.text = `${tleft}<span style="background-color: lightgreen;">` +
                        `${tmid}</span>${tright}`;
                  }
                  // this.farmasiList = resp.list;
                  if (resp.hasPrevPage) {
                    resp.list.push({ id: -1, nama: this.searching, jenis: resp.pageIndex, text: '' });
                  }
                  if (resp.hasNextPage) {
                    resp.list.push({ id: 0, nama: this.searching, jenis: resp.pageIndex, text: '' });
                  }
                  this.farmasiFiltered = [...resp.list];
/*
                  if (page > 1) {
                    this.fireKeydownEv(40);
                  }
*/
                } else {
                  this.kodes = '';
                  this.farmasiFiltered = [];
                  this.farmasiSelected = { id: 0, nama: '', kode: '', stok: 0, saldo: 0};
                  this.kodeIsReadOnly = false;
                }
              }, () => {}
          );
/*
    } else {
      this.constructSearchResult(search);
    }
*/
  }

  private fireKeydownEv(/*code*/) {
    const d = this.renderer.selectRootElement('#nmFa');
    if (d != null) {
      // this.renderer.setStyle(d, 'display', 'block');
      const getterCode = {
        get: function () {
          return 40;
        }
      };
      const evt = new KeyboardEvent('keydown', {
        altKey: false,
        bubbles: true,
        cancelable: true,
        code: '40',
        ctrlKey: false,
        key: '40',
        detail: 0,
        location: 0,
        metaKey: false,
        repeat: false,
        shiftKey: false,
        view: window
      });

/*
      Object.defineProperty(evt, 'keyCode', {
        get: function () {
          return 40;
        }
      });
      Object.defineProperty(evt, 'which', {
        get: function () {
          return 40;
        }
      });
*/

      Object.defineProperties(evt, {
        which: getterCode,
        keyCode: getterCode,
      });
      // ev.which = ev.keyCode = 40;
      d.dispatchEvent(evt);
    }
  }

/*
  private constructSearchResult(search: string) {
    const arr = [];
    let i = 0;
    while (i < this.farmasiList.length) {
      if (this.farmasiList[i].nama.toLowerCase().indexOf(search) >= 0) {
        arr.push(this.farmasiList[i]);
      }
      i++;
    }

    if (arr.length === 20) {
      this._pembelianFarmasiService.getFarmasiByName(search)
          .subscribe(
              (resp) => {
                if (resp.length > 0) {
                  this.farmasiFiltered = resp;
                  this.farmasiList = resp;
                } else {
                  this.farmasiFiltered = arr;
                  // this.kodes = '';
                  // this.farmasiFiltered = [];
                  // this.farmasiSelected = {};
                }
              }
          );
    } else if (arr.length > 0) {
      this.farmasiFiltered = arr;
    } else if (arr.length === 0) {
      this._pembelianFarmasiService.getFarmasiByName(search)
          .subscribe(
              (resp) => {
                if (resp.length > 0) {
                  this.farmasiFiltered = resp;
                  this.farmasiList = resp;
                } else {
                  this.kodes = '';
                  this.farmasiFiltered = [];
                  this.farmasiList = [];
                  this.farmasiSelected = {};
                }
              }
          );
    }
  }
*/

  OnSelectFarmasi(e) {
    // this.getFarmasiKlinik();
    if (e.id === 0) {
      this.searchPage++;
      setTimeout(() => this.fireKeydownEv(/*40*/), 300);
      // this.farmasi = {id: 0, nama: 'ku'};
      //   this.SearchFarmasi({query: this.searching}, e.jenis + 1);
      // }
    } if (e.id < 0) {
      this.searchPage--;
      setTimeout(() => this.fireKeydownEv(/*40*/), 300);
    } else {
      this.farmasiSelected = e;
      this._pembelianFarmasiService.getFarmasiKlinikByFarmasiId(
          this.idKlinik, this.farmasiSelected.id).subscribe(list => {
            // this.listSatuan = [...this.listSatuanBack];
            this.listSatuan = [];
            let row = null, tnama = '', i: number;
            for (i = 0; i < this.listSatuanBack.length; i++) {
              row = this.listSatuanBack[i];
              tnama = row.nama.trim();
              row.text = tnama;
              this.listSatuan.push(row);
            }
            const lsUnit = [];
            for (i = 0; i < list.length; i++) {
              let found = false, k = 0;
              while (!found && k < this.listSatuan.length) {
                if (this.listSatuan[k].id === list[i].unitBarangFarmasiId) {
                  found = true;
                } else {
                  k++;
                }
              }
              if (found) {
                this.listSatuan[k].text += `  (Stok: ${list[i].stokTotal})`;
              } else {
                lsUnit.push({
                  id: list[i].unitBarangFarmasiId,
                  text: `${list[i].unitBarangFarmasiNama}  (Stok: ${list[i].stokTotal})`,
                  nama: list[i].unitBarangFarmasiNama,
                  jenis: 0
                });
              }
            }

            this.listSatuan = lsUnit.concat(this.listSatuan);
            if (list.length > 0) {
              const fk = list[0];
              const seldSat = {
                id: fk.unitBarangFarmasiId,
                nama: fk.unitBarangFarmasiNama,
                text: fk.unitBarangFarmasiNama +
                  '  (Stok: ' + fk.stokTotal.toFixed(0) + ')',
                texts: '<span style="background-color: lightgreen;">' +
                  fk.unitBarangFarmasiNama + '</span>  (Stok: ' +
                  fk.stokTotal.toFixed(0) + ')'
              };
              this.onSelectedSatuan(seldSat);
            }
          }, () => {}
      );
    }
  }

  clickNext() {
    this.searchPage++;
    // setTimeout(() => this.fireKeydownEv(40), 1000);
    const makeRequest = () => setTimeout(() => this.fireKeydownEv(/*40*/), 300)
    /*.then(data => {
      // console.log(data)
      // return "done"
    }*/;

    makeRequest();
    // this.farmasi = {id: 0, nama: 'ku'};
/*
    const d = this.renderer.selectRootElement('#nmFa');
    if (d != null) {
      d.value = 'za';
      // d.value = this.searching;
    }
*/
  }

  HitungTotal(val = null) {
    if (val != null) {
      if (val < 0) {
        this.qtys = 0;
      } else {
        this.qtys = val;
      }
    }
    this.totals = this.qtys * this.hargaSatuans;
  }

  onChangedQty(ev) {
    if (ev.target.value == null || ev.target.value.trim().length === 0) {
      return;
    }
    const val = Number(ev.target.value);
    if (val < 0) {
      this.qtys = 0;
    } else {
      this.qtys = val;
    }
    this.totals = this.qtys * this.hargaSatuans;
  }

  private checkSatuan() {
    setTimeout(() => {
      let nama = this.txtNamaSatuan.toLowerCase();
      const d = this.renderer.selectRootElement('#unFa');
      if (d != null) {
        nama = d.value.toString().toLowerCase();
        this.txtNamaSatuan = d.value;
      }
      if (!this.unitDrownClicked && !this.satuanSelected) {
        let i = 0, found = false;
        while (i < this.listSatuan.length && !found) {
          found = this.listSatuan[i].nama.toLowerCase() === nama;
          if (!found) {
            i++;
          }
        }
        if (!found && this.txtNamaSatuan.length > 0) {
          // this._pembelianFarmasiService.setFormAddSatuan(this.txtNamaSatuan);
          this.newSatuan = Object.assign({}, { show: true, txt: this.txtNamaSatuan });

          /*
           this.confirmationService.confirm({
           header: 'Konfirmasi Penambahan Satuan Baru',
           message: 'Satuan <b>' + this.txtNamaSatuan + '</b> belum ada<br/>Tambahkan?',
           icon: 'ui-icon-alert',
           key: 'appcfd',
           accept: () => {
           this._pembelianFarmasiService.postUnitSatuanFarmasi(this.txtNamaSatuan)
           .subscribe(
           (resp) => {
           if (resp.ok) {
           this._pembelianFarmasiService.getSatuans();
           const newSat = resp.json();
           this.satuan = newSat;
           this.unitBarangId = newSat.id;
           // this._pembelianFarmasiService.setFormAddSatuan(false);
           this.globalService.showMessage(
           'success', 'Info', 'Satuan telah ditambahkan');
           }
           }, (error) => {
           this.globalService.showError(error);
           }
           );
           },
           reject: () => {
           return false;
           }
           });
           */
        } else if (found) {
          this.satuan = this.listSatuan[i];
        }
      } else {
        this.unitDrownClicked = false;
        this.satuanSelected = false;
      }
      this.checkingSatuan = false;
    }, 1000);
    /*
     nama = ev.target.value.toString();
     setTimeout(() => {
     if (!this.unitDrownClicked) {
     this._pembelianFarmasiService.setFormAddSatuan(nama);
     } else {
     this.unitDrownClicked = false;
     }
     }, 500);
     */
  }

  getFarmasiKlinik() {
    if (this.unitBarangId != null && !isNaN(Number(this.unitBarangId.toString()))) {
      this.farmasiSelected.id = this.farmasiSelected.id ? this.farmasiSelected.id : 0;
      this._pembelianFarmasiService.getfarmasiKlinikUnitBarang(
          this.idKlinik, this.farmasiSelected.id, this.unitBarangId)
          .subscribe((resp) => {
            if (resp.ok) {
              this.kodeIsReadOnly = true;
              const fk = resp.json();
              this.kodes = fk.kode;
              this.hargaSatuans = fk.hargaBeliSatMax;
              this.HitungTotal();
            }
          }, () => {
            this.kodeIsReadOnly = false;
            this.kodes = '';
            this.hargaSatuans = 0;
            this.HitungTotal();
          });
    }
  }

  simpanBarang(f) {
    if (this.satuan == null) {
      this.globalService.showMessage('warn', 'Perhatian!', 'Satuan belum diisi');
      return;
    }
    if (f.value.kode == null && this.mode === 0) {
      this.globalService.showMessage('warn', 'Perhatian!', 'Kode belum diisi');
      return;
    }
    let farmasiId = 0;
    let farmasiNama: any;

    if (this.farmasiSelected.id === 0 && this.formMode === 'add') {
      farmasiNama = f.value.namaBarang;
    } else {
      farmasiNama = this.farmasiSelected.nama || f.value.namaBarang;
      farmasiId = this.farmasiSelected.id || 0;
    }

    const result = {
      eventSource: 'FormAddBarang',
      id: 0,
      fakturBeliFarmasiId: 0,
      farmasiId: farmasiId,
      farmasiNama: farmasiNama,
      kode: f.value.kode,
      qty: /*f.value.qty*/this.qtys,
      satuan: this.satuan.nama,
      unit: this.unitBarangId,
      hargaSatuan: f.value.hargaBeliSatuan,
      jumlah: f.value.jumlah,
      expired: f.value.expired,
      rowStatus: 1,
      stokFmId: 0
    };

    if (result.hargaSatuan == null) {
      result.hargaSatuan = this.hargaSatuans;
      this.HitungTotal();
    }
    if (result.jumlah == null) {
      result.jumlah = this.totals;
    }
    if (result.expired == null) {
      result.expired = this.expired;
    }

    if (this.formMode === 'add') {
      // this._pembelianFarmasiService.setBarangSubject(result);
    } else {
      // this._pembelianFarmasiService.updateListBarang(this.editedFarmasi, tempData);
/*
      this.editedFarmasi.farmasiId = farmasiId;
      this.editedFarmasi.farmasiNama = farmasiNama;
      this.editedFarmasi.kode = f.value.kode;
      this.editedFarmasi.qty = f.value.qty;
      this.editedFarmasi.satuan = this.satuan.nama;
      this.editedFarmasi.unit = this.unitBarangId;
      this.editedFarmasi.hargaSatuan = f.value.hargaBeliSatuan;
      this.editedFarmasi.jumlah = f.value.jumlah;
      this.editedFarmasi.expired = f.value.expired;
      this.editedFarmasi.rowStatus = 2;
*/
      result.id = this.editedFarmasi.id;
      result.fakturBeliFarmasiId = this.editedFarmasi.fakturBeliFarmasiId;
      result.rowStatus = 2;
      result.stokFmId = this.editedFarmasi.stokFarmasiId;

      // this._pembelianFarmasiService.setBarangSubject(this.editedFarmasi);
    }

    this._pembelianFarmasiService.postAnySubject(result);
    this.ClearForm(f);
    // this._pembelianFarmasiService.fireFormAddBarangSubj(false);
    this.displayFormBarang = false;
  }

  ClearForm(f) {
    f.reset();
    this.farmasi = {};
  }

  ngOnDestroy() {
    this.subsc.unsubscribe();
    // this.newSatuanSubsc.unsubscribe();
  }

  searchSatuan(e) {
    const search: string = e.query.toString().toLowerCase();
    if (search.length === 0) {
      const arr = [];
      let row = null, tnama = '';
      for (let i = 0; i < this.listSatuan.length; i++) {
        row = this.listSatuan[i];
        tnama = row.text;
        row.texts = tnama;
        arr.push(row);
      }
      this.suggestedSatuan = [...arr];
    } else {
      const arr = [];
      let i = 0;
      let row = null, occPos = -1, tnama = '', tleft = '', tright = '', tmid = '';
      while (i < this.listSatuan.length) {
        row = this.listSatuan[i];
        occPos = row.text.toLowerCase().indexOf(search);
        if (occPos === 0) {
          tnama = row.text.trim();
          tleft = '';
          tmid = tnama.substr(occPos, search.length);
          tright = tnama.slice(occPos + search.length, tnama.length);
          row.texts = `${tleft}<span style="background-color: lightgreen;">` +
              `${tmid}</span>${tright}`;
          arr.push(row);
        }
        i++;
      }

      i = 0;
      while (i < this.listSatuan.length) {
        row = this.listSatuan[i];
        occPos = row.text.toLowerCase().indexOf(search);
        if (occPos > 0) {
          tnama = row.text.trim();
          tleft = tnama.slice(0, occPos);
          tmid = tnama.substr(occPos, search.length);
          tright = tnama.slice(occPos + search.length, tnama.length);
          row.texts = `${tleft}<span style="background-color: lightgreen;">` +
              `${tmid}</span>${tright}`;
          arr.push(row);
        }
        i++;
      }
      this.suggestedSatuan = [...arr];
    }
  }

  onSelectedSatuan(e) {
    this.satuanSelected = true;
    this.satuan = e;
    this.unitBarangId = e.id;
    this.getFarmasiKlinik();
  }

  onGetFocusSatuan(ev) {
    this.unitDrownClicked = false;
    this.satuanSelected = false;
    setTimeout(() => {
      if (this.farmasiSelected.id === 0) {
        this.listSatuan = [];
        let row = null, tnama = '', i: number;
        for (i = 0; i < this.listSatuanBack.length; i++) {
          row = this.listSatuanBack[i];
          tnama = row.nama.trim();
          row.text = tnama;
          this.listSatuan.push(row);
        }

        this.kodeIsReadOnly = false;
        this.kodes = '';
        this.hargaSatuans = 0;
        this.qtys = 0;
        this.HitungTotal();
      }
    });
  }

  onLostFocusSatuan(ev) {
    if (ev.target != null && ev.target.value != null
        && ev.target.value.toString().length > 0) {
      this.txtNamaSatuan = ev.target.value.toString();

      if (!this.checkingSatuan) {
        this.checkingSatuan = true;
        this.checkSatuan();
      }
    } else {
      this.satuan = null;
    }

    /*
    const makeRequest = () => {
          if (ev.target != null && ev.target.value != null
              && ev.target.value.toString().length > 0) {
            let i = 0, found = false;
            let nama = ev.target.value.toString().toLowerCase();
            while (i < this.listSatuan.length && !found) {
              found = this.listSatuan[i].nama.toLowerCase() === nama;
              if (!found) {
                i++;
              }
            }
            if (!found) {
              nama = ev.target.value.toString();
              setTimeout(() => {
                if (!this.unitDrownClicked) {
                  this._pembelianFarmasiService.setFormAddSatuan(nama);
                } else {
                  this.unitDrownClicked = false;
                }
              }, 500);
            }
          }
        }
        /!*.then(data => {
         console.log(data)
         return "done"
         }*!/;

    makeRequest();
     */
  }

  onDropdownClick(ev) {
    this.unitDrownClicked = true;
  }

  insertSatuan(nama) {
    if (nama.length > 0) {
      this._pembelianFarmasiService.postUnitSatuanFarmasi(nama)
          .subscribe(
              (resp) => {
                if (resp.ok) {
                  // this._pembelianFarmasiService.getSatuans();
                  this.satuan = resp.json();
                  this.unitBarangId = this.satuan.id;
                  this.kodeIsReadOnly = false;
                  // this._pembelianFarmasiService.setFormAddSatuan(false);
                  // this.displayFormAddSatuan = false;
                  // this._pembelianFarmasiService.newSatuanAdded(resp.json());
                  this.globalService.showMessage('success', 'Info', 'Data berhasil disimpan');
                }
              }, (error) => {
                this.globalService.showError(error);
              }
          );
    } else {
      this.satuan = null;
      const d = this.renderer.selectRootElement('#unFa');
      if (d != null) {
        d.value = '';
      }
    }
  }

  onKeyupFarmasi(ev) {
    if (ev.keyCode === 13) {
      let htmlElmt = this.renderer.selectRootElement('#clickElmt');
      if (htmlElmt != null) {
        htmlElmt.click();
      }
      htmlElmt = this.renderer.selectRootElement('#unFa');
      if (htmlElmt != null) {
        htmlElmt.focus();
      }
    }
  }

  onKeyupSatuan(ev) {
    if (ev.keyCode === 13) {
      const htmlElmt = this.renderer.selectRootElement('#clickElmt');
      if (htmlElmt != null) {
        htmlElmt.click();
      }
/*
      htmlElmt = this.renderer.selectRootElement('#tglExp');
      if (htmlElmt != null) {
        htmlElmt.focus();
      }
*/
    }
  }

}
