import { Injectable } from '@angular/core';
import { /*Http,*/ URLSearchParams, Headers} from '@angular/http';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs/Subject';
// import {AuthHttp} from 'angular2-jwt';
// import {BehaviorSubject} from 'rxjs/BehaviorSubject';
// import {GlobalsService} from '../service/globals.service';
// import * as _ from 'lodash';
// import {Observable} from 'rxjs/Observable';
import {HttpService} from 'app/service/http.service';
import {ConfirmDialogMsg} from 'app/Interfaces/confirm-dialog-msg';

@Injectable()
export class PembelianFarmasiService {
  headers = new Headers({
    'Content-Type': 'application/json'
  });
  // private formAddBarangSubj = new Subject<any>();
  private ShowFormSupplier = new Subject<any>();
  // private ShowFormSatuan = new Subject<string>();
  public arrayBarang: any[] = [];
  // private barangSubj = new BehaviorSubject(<any>[]);
  private barangSubj = new Subject<any>();
  // public barangObsrv = this.barangSubj.asObservable();
  private Klinik = new Subject<any[]>();
  public KlinikList = this.Klinik.asObservable();
  // private tableSubj = new Subject<any>();
  // public tableObsrv = this.tableSubj.asObservable();
  // private selectedFarmasi = new BehaviorSubject<any>({});
  // private selectedFarmasi = new Subject<any>();
  // public selectedFarmasi$ = this.selectedFarmasi.asObservable();
  // private Satuan = new Subject<any[]>();
  // public SatuanList = this.Satuan.asObservable();
  // private formMode = new Subject<string>();
  // public formMode$ = this.formMode.asObservable();
  // private newSatuan = new Subject<any>();
  // public newSatuan$ = this.newSatuan.asObservable();

  static dateToStr(date: Date, timeSuffix: string) {
    let day: string = date.getDate().toString();
    day = day.length < 2 ? '0' + day : day;
    let month: string = (date.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    return date.getFullYear().toString() + '-' + month
        + '-' + day + timeSuffix;
  }

  constructor(/*private authHttp: AuthHttp,*/
              private http: HttpService/*,
              private globalService: GlobalsService*/) {}

/*
  setBarangSubject(param: any) {
    // this.arrayBarang.push(param);
    // this.barangSubj.next(this.arrayBarang);
    this.barangSubj.next(param);
  }
*/

  getAnySubject() {
    return this.http.getAnySubject();
  }

  postAnySubject(param: any) {
    this.http.postAnySubject(param);
  }

  /*
    updateListBarang(oldBarang: any, newBarang: any) {
      const index = _.findIndex(this.arrayBarang, arr => arr.farmasiId === oldBarang.farmasiId &&
        arr.farmasiNama === oldBarang.farmasiNama && arr.kode === oldBarang.kode);
      this.arrayBarang[index] = newBarang;
      this.barangSubj.next(this.arrayBarang);
    }

  fireFormAddBarangSubj(param: any) {
    this.formAddBarangSubj.next(param);
  }
  */

  removeListBarang() {
    this.arrayBarang = [];
    this.barangSubj.next([]);
  }

  removeBarang(/*param: any*/klinikId, farmasiDibeliId) {
/*
    const index = _.findIndex(this.arrayBarang, arr => arr.farmasiId === param.farmasiId &&
      arr.farmasiNama === param.farmasiNama &&
      arr.kode === param.kode);
    this.arrayBarang.splice(index, 1);
    this.barangSubj.next(this.arrayBarang);
*/
    return this.http.delete(
        `${environment.url}farmasi/${klinikId}/dibeli/${farmasiDibeliId}`);
  }

/*
  onBarangSelected(selectedItem: any) {
    this.selectedFarmasi.next(selectedItem);
  }

  public newSatuanAdded(s) {
    this.newSatuan.next(s);
  }

  setFormMode(mode: string) {
    this.formMode.next(mode);
  }

  getFormAddBarangSubj() {
    return this.formAddBarangSubj;
  }
*/

  // region Supplier
  setFormAddSupplier(param: any) {
    this.ShowFormSupplier.next(param);
  }

  getFormAddSupplier() {
    return this.ShowFormSupplier;
  }

/*
  fireTableSubj(param: any) {
    this.tableSubj.next(param);
  }
*/

  getSupplierByName(klinikId: number, nama: string) {
    const params: URLSearchParams = new URLSearchParams();
    params.set('Nama', nama);
    return this.http.get(`${environment.url}klinik/${klinikId}/supplierfarmasi`, { search: params}).map(
      (data) => data.json()
    );
  }

  insertSupplier(param) {
    return this.http.post(`${environment.url}supplierfarmasi`, param)
      .map((resp) => resp.json());
  }
  // endregion

  // region farmasi
  getFarmasiByName(nama: string, page = 1) {
    const params: URLSearchParams = new URLSearchParams();
    params.set('Nama', nama);
    params.set('Page', page.toString());
    params.set('PageLength', '10');
    return this.http.get(`${environment.url}farmasi`, { search: params}).map(
      (data) => data.json()
    );
  }
  // endregion

  // region Unit Satuan
  getSatuans() {
/*
    this.getUnitsatuanFarmasi().subscribe(
      (resp) => this.Satuan.next(resp)
    );
*/
    return this.http.get(`${environment.url}unitbarangfarmasi`).map(
        (data) => data.json()
    )/*.subscribe(
        (resp) => this.Satuan.next(resp)
    )*/;
  }

/*
  private getUnitsatuanFarmasi() {
    return this.http.get(`${environment.url}unitbarangfarmasi`).map(
      (data) => data.json()
    );
  }
  getSatuan() {
    return this.SatuanList;
  }
 */
  postUnitSatuanFarmasi(param: string) {
    const paramPost = {
      nama: param
    };
    return this.http.post(`${environment.url}unitbarangfarmasi`, paramPost, {headers: this.headers});
  }
  // endregion

  /*
  setFormAddSatuan(param: string) {
    this.ShowFormSatuan.next(param);
  }

  getFormAddSatuan() {
    return this.ShowFormSatuan;
  }
*/

  setKlinik(listKlinik) {
    this.Klinik.next(listKlinik);
  }

  getKlinik() {
    return this.http.get(`${environment.url}Klinik`).map(
      (resp) => resp.json()
    );
  }

/*
  getStokFarmasiDijual(stokFarmasiId: number) {
    const params: URLSearchParams = new URLSearchParams();
    params.set('stokFarmasiId', stokFarmasiId.toString());

    return this.http.get(`${environment.url}stokfarmasi/dijual`,
        { search: params}).map(
      (resp) => resp.json()
    );
  }
*/

  postFakturBeliFarmasi(idKlinik, fbf) {
    return this.http.post(`${environment.url}klinik/${idKlinik}/fakturbelifarmasi`, fbf);
  }
/*
  putFakturBeliFarmasi(fakturBeliFarmasiId, param) {
    return this.http.put(
        `${environment.url}klinik/${fakturBeliFarmasiId}/fakturbelifarmasi`, param);
  }

  postJurnalBeli(klinikId, fakturId) {
    return this.http.post(`${environment.url}klinik/${klinikId}/fakturbelifarmasi/${fakturId}/transkbelifarms`, null);
  }
*/

  getListFakturBeliFarmasi(idKlinik, params: URLSearchParams) {
/*
    const params: URLSearchParams = new URLSearchParams();
    if (tanggal != null) {
      // params.set('Tanggal', tanggal.toDateString());
      const now = new Date();
      const offset = now.getTimezoneOffset() / 60;
      tanggal.setHours(now.getHours() - offset, now.getMinutes(),
          now.getSeconds(), now.getMilliseconds());
      params.set('Tanggal', tanggal.toISOString());
    }
    if (id != null) {
      params.set('FakturBeliFarmasiId', id.toString());
    }
*/
    return this.http.get(`${environment.url}klinik/${idKlinik}/fakturbelifarmasi`,
        {search : params}).map(resp => resp.json());
  }

  delFakturBeliFarmasi(idKlinik, fakturId) {
    return this.http.delete(`${environment.url}klinik/${idKlinik}/fakturbelifarmasi/${fakturId}`)
        .map(resp => resp.json());
  }

  getfarmasiKlinikUnitBarang(idKlinik, farmasiId, unitBarangFarmasiId) {
    return this.http.get(
        `${environment.url}klinik/${idKlinik}/farmasi/${farmasiId}/unitbarangfarmasi/${unitBarangFarmasiId}`,
        null, false);
  }

  getFarmasiKlinikByFarmasiId(idKlinik, farmasiId) {
    return this.http.get(`${environment.url}klinik/${idKlinik}/farmasi/${farmasiId}`)
        .map(resp => resp.json());
  }

  getFarmasiDibeli(klinikId: number, fakturId: number, page: number) {
    const params: URLSearchParams = new URLSearchParams();
      params.set('klinikId', klinikId.toString());
      params.set('fakturId', fakturId.toString());
      params.set('page', page.toString());
      params.set('pageLen', '10');

    return this.http.get(`${environment.url}farmasi/${klinikId}/dibeli`,
        {search : params})
        .map(resp => resp.json());
  }

  getGudangs(klinikId: number, userId: string) {
    return this.http.get(`${environment.url}klinik/${klinikId}/gudangfm/${userId}`)
        .map(resp => resp.json());
  }

  showMessage(severity: string, summary: string, detail: string): void {
    this.http.showMessage(severity, summary, detail);
  }

  confirm(param: ConfirmDialogMsg) {
    this.http.confirm(param);
  }
}
