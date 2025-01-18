import {Component, OnDestroy, OnInit} from '@angular/core';
import {TarifJualFarmasiService} from '../tarif-jual-farmasi.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import {Observable} from 'rxjs/Observable';
import {GlobalsService} from 'app/service/globals.service';
import {Subscription} from 'rxjs/Subscription';
import {ConfirmDialogMsg} from 'app/Interfaces/confirm-dialog-msg';
import {PenguranganStokService} from '../pengurangan-stok/pengurangan-stok.service';

@Component({
  selector: 'app-form-konversi-satuan',
  templateUrl: './form-konversi-satuan.component.html',
  styleUrls: ['./form-konversi-satuan.component.css']
})
export class FormKonversiSatuanComponent implements OnInit, OnDestroy {
  displayFormKonversiSatuan: boolean;
  idKlinik: any;
  farmasiSelected: any;
  konversiSatuanForm: FormGroup;
  labelInfo: any = {};
  listSatuan: SelectItem[];
  unitSatuanValid: boolean;
  display = false;
  subsc: Subscription;
  dlgStokBarangInpState: any;
  txtSpanCnvrtdQty = '';
  convertedQty = 0;

  constructor(private pengStokService: PenguranganStokService,
              private tarifJualFarmasiService: TarifJualFarmasiService,
              private fb: FormBuilder,
              private globalService: GlobalsService) {
    this.konversiSatuanForm = this.fb.group({
      satuan: [null, Validators.required],
      qtySatuan: [null, Validators.required],
      qtySatuanValue: [null, Validators.required],
      qty: [{value: '', disabled: true}, Validators.required],
      kode: new FormControl()
    });
  }

  ngOnInit() {
    const combine = Observable.combineLatest(
        this.tarifJualFarmasiService.getFormKonversiSatuan(),
        this.pengStokService.getDataEditSbj()
    );
    this.subsc = combine.subscribe(([show, farmasiSelected]) => {
      this.displayFormKonversiSatuan = show;
      if (show && farmasiSelected != null) {
        this.idKlinik = farmasiSelected.klinikId;
        this.farmasiSelected = Object.assign({}, farmasiSelected);
        this.labelInfo = {
          farmasiNama: this.farmasiSelected.farmasiNama,
          hargaBeliSatMax: this.farmasiSelected.hargaBeliSatMax,
          unitBarangFarmasiNama: this.farmasiSelected.unitBarangFarmasiNama,
          stokTotal: this.farmasiSelected.stok,
          marginType: this.farmasiSelected.marginType,
          totalKonversi: 0,
          kode: this.farmasiSelected.kode
        };
        this.fecthListSatuan();
        this.konversiSatuanForm.patchValue({
          qtySatuan: 1
        });
        this.tarifJualFarmasiService.getFarmasiStoks(this.farmasiSelected.id,
            this.farmasiSelected.gudangId)
            .subscribe(resp => {
              this.farmasiSelected.stokFarmasi = resp;
            });
      }
    });
  }

  ngOnDestroy() {
    this.subsc.unsubscribe();
  }

  private fecthListSatuan(id = 0) {
    this.listSatuan = [];
    this.tarifJualFarmasiService.getUnitsatuanFarmasi().subscribe(data => {
      this.listSatuan = data;
      if (id > 0) {
        this.konversiSatuanForm.patchValue({
          satuan: id
        });
        this.unitSatuanValid = true;
      }
    });
  }

  onChangeListSatuan(e) {
    this.unitSatuanValid = e.value !== this.farmasiSelected.unitBarangFarmasiId;
    this.tarifJualFarmasiService.getKlinikFarmasiUnitBarang(this.idKlinik, this.farmasiSelected.farmasiId,
        this.konversiSatuanForm.value.satuan)
      .subscribe(resp =>  {
        if (resp.id) {
          this.konversiSatuanForm.patchValue({
            kode: resp.kode
          });
        }
      }, (/*error*/) => {
        this.konversiSatuanForm.patchValue({
          kode: null
        });
      });
  }
  hitungTotalKonversi() {
    if (this.konversiSatuanForm.value.qtySatuanValue) {
      if (this.konversiSatuanForm.value.qtySatuanValue > this.konversiSatuanForm.value.qtySatuan) {
        this.labelInfo.hargaSatuan = +this.farmasiSelected.hargaBeliSatMax /
            +this.konversiSatuanForm.value.qtySatuanValue;

        this.labelInfo.totalKonversi = Number(this.konversiSatuanForm.value.qtySatuanValue)
            * this.convertedQty;
      } else {
        this.labelInfo.hargaSatuan = +this.farmasiSelected.hargaBeliSatMax *
            +this.konversiSatuanForm.value.qtySatuan;

        this.labelInfo.totalKonversi = this.convertedQty / Number(this.konversiSatuanForm.value.qtySatuan);
      }
    }
  }
  btnSimpan() {
    let param =  {
      unitBarangFarmasiId: this.konversiSatuanForm.value.satuan,
      kode: this.konversiSatuanForm.value.kode,
      stokTotal: /*this.farmasiSelected.stokTotal*/this.labelInfo.totalKonversi,
      hargaBeliSatMax: /*this.farmasiSelected.hargaBeliSatMax*/this.labelInfo.hargaSatuan,
      marginType: this.farmasiSelected.marginType,
      margin: this.farmasiSelected.margin,
      qtySatuan: this.konversiSatuanForm.value.qtySatuanValue,
      qty: this.convertedQty,
      totalKonversi: this.labelInfo.totalKonversi,
      stokFarmasi: this.farmasiSelected.stokFarmasi,
      rasio: +this.konversiSatuanForm.value.qtySatuanValue
          / +this.konversiSatuanForm.value.qtySatuan
    };
    if (this.farmasiSelected.gudangId != null) {
      param = Object.assign({gudangId: this.farmasiSelected.gudangId}, param);
    }
    this.tarifJualFarmasiService.putKlinikFarmasiUnitBarang(this.idKlinik,
      this.farmasiSelected.farmasiId, this.farmasiSelected.unitBarangFarmasiId, param)
      .subscribe(resp => {
        if (resp.id) {
          this.HideForm();
          const parDlg: ConfirmDialogMsg = {
            header: 'Selesai',
            message : 'Satuan telah dikonversi', icon: 'ui-icon-notice',
            key: 'appnof',
            rejectVisible: false,
            accept: () => {
            },
            reject: null,
            acceptLabel: 'OK',
            rejectLabel: 'Batal'
          };
          this.globalService.confirm(parDlg);
        }
      }, (error) => {
        this.globalService.showError(error);
      });
  }
  btnBatal() {
    this.HideForm();
  }
  HideForm() {
    this.konversiSatuanForm.reset();
    this.convertedQty = 0;
    this.txtSpanCnvrtdQty = '';
    this.labelInfo.totalKonversi = 0;
    this.tarifJualFarmasiService.getFormKonversiSatuan().next(false);
  }

  callFormSatuan() {
    this.display = true;
  }

  onSavedSatuan(newSat) {
    this.display = false;
    if (newSat != null) {
      this.fecthListSatuan(newSat.id);
    }
  }

  onClickEditQty() {
    let state = {
      klinikId: this.idKlinik,
      farmasiId: this.farmasiSelected.farmasiId,
      unitBarangFarmasiId: this.farmasiSelected.unitBarangFarmasiId,
      namaBarang: this.farmasiSelected.farmasiNama,
      namaSatuan: this.farmasiSelected.unitBarangFarmasiNama,
      fakturJualFarmasiId: 0,
      selectedFarmasi: this.farmasiSelected,
      dlgHeader: 'Konversi Satuan',
      ketTotal: 'dikonversi'
    };
    if (this.farmasiSelected.gudangId != null) {
      state = Object.assign({gudangId: this.farmasiSelected.gudangId}, state);
    }
    this.dlgStokBarangInpState = state;
  }

  onOkDlgStokBarang(ev) {
    this.convertedQty = ev.totQtySend;
    this.txtSpanCnvrtdQty = this.tarifJualFarmasiService
        .formatNumberToLocale(this.convertedQty);
    this.hitungTotalKonversi();
  }
}
