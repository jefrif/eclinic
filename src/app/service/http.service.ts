/**
 * Created by jefri on 18/10/2017.
 */

import {Injectable} from '@angular/core';
import {/*AuthConfig, */AuthHttp} from 'angular2-jwt';
import {Http, /*RequestOptions,*/ RequestOptionsArgs, ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import {ConfirmDialogMsg} from 'app/Interfaces/confirm-dialog-msg';
import {LoaderService} from 'app/shared/loader/loader.service';

@Injectable()
export class HttpService /*extends AuthHttp*/ {
  private anySubject = new Subject<any>();
  private anyBehaviorSubject = new BehaviorSubject<any>({});

  public static normalizeCalDateZone(dateTime: Date) {
    const waktu = new Date();
    waktu.setFullYear(dateTime.getFullYear());
    waktu.setMonth(dateTime.getMonth());
    waktu.setDate(dateTime.getDate());
    const offset = waktu.getTimezoneOffset() / 60;
    waktu.setHours(waktu.getHours() - offset);
    return waktu;
  }

  constructor(/*options: AuthConfig,*/ private http: Http, private loaderService: LoaderService/*,
              defOpts?: RequestOptions*/, private authHttp: AuthHttp) {
    // super(options, http, defOpts);
  }

  getAnySubject() {
    return this.anySubject;
  }

  postAnySubject(param: any) {
    this.anySubject.next(param);
  }

  getAnyBehaviorSubject() {
    return this.anyBehaviorSubject;
  }

  postAnyBehaviorSubject(param: any) {
    this.anyBehaviorSubject.next(param);
  }

/*
  get(url: string, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderService.show();
    this.showLoader();

    return super.get(url, options)
        .catch(this.onCatch)
        .do((res: Response) => {
          this.onSuccess(res);
        }, (error: any) => {
          // this.globalError.showAlert(error);
          this.onError(error);
        })
        .finally(() => {
          // this.loaderTopService.hide();
          this.onEnd();
        });
  }

  post(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return super.post(url, body, options)
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSuccess(res);
      }, (error: any) => {
        // this.globalError.showAlert(error);
        this.onError(error);
      })
      .finally(() => {
        // this.loaderTopService.hide();
        this.onEnd();
      });
  }

  put(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return super.put(url, body, options)
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSuccess(res);
      }, (error: any) => {
        // this.globalError.showAlert(error);
        this.onError(error);
      })
      .finally(() => {
        // this.loaderTopService.hide();
        this.onEnd();
      });
  }
  patch(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return super.patch(url, body, options)
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSuccess(res);
      }, (error: any) => {
        // this.globalError.showAlert(error);
        this.onError(error);
      })
      .finally(() => {
        // this.loaderTopService.hide();
        this.onEnd();
      });
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return super.delete(url, options)
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSuccess(res);
      }, (error: any) => {
        // this.globalError.showAlert(error);
        this.onError(error);
      })
      .finally(() => {
        // this.loaderTopService.hide();
        this.onEnd();
      });
  }
*/
  get(url: string, options?: RequestOptionsArgs, showNotFound = true,
      catchError = true): Observable<any> {
    // this.loaderService.show();
    this.showLoader();

    return this.authHttp.get(url, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      if (catchError) {
        this.catchRequestError(error, showNotFound);
      }
      if (error.message != null && error.message.substr(0, 6) === 'No JWT') {
      } else {
        return Observable.throw(error);
      }
    }).finally(() => {
      this.onEnd();
    });
  }

  private catchRequestError(error: any, showNotFound = true) {
    if (error.status != null && error.status === 404) {
      if (showNotFound) {
        this.showError(error, 'warn', 'Perhatian!');
      }
    } else if (error.message != null && error.message.substr(0, 6) === 'No JWT') {
      this.postAnySubject({
        noJwtExpd: 1
      });
    } else {
      this.showError(error);
    }
  }

  post(url: string, body?: any, options?: RequestOptionsArgs, catchError = true): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.authHttp.post(url, body, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      if (catchError) {
        this.catchRequestError(error);
      }
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

  put(url: string, body?: any, options?: RequestOptionsArgs, errSummary = 'Error'): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.authHttp.put(url, body, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.showError(error, 'error', errSummary);
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }
  patch(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.authHttp.patch(url, body, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.authHttp.delete(url, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

  getImage(imageUrl: string): Observable<any> {
    return this.get(imageUrl, { responseType: ResponseContentType.Blob })
        .map((res: Response) => res.blob());
  }

  httpGet(url: string, options?: RequestOptionsArgs/*, showNotFound = true*/): Observable<any> {
    // this.loaderService.show();
    this.showLoader();

    return this.http.get(url, options)/*.timeout(5000).map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

  httpPost(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.http.post(url, body, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

  httpPut(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.http.put(url, body, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }
  httpPatch(url: string, body?: any, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.http.patch(url, body, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

  httpDelete(url: string, options?: RequestOptionsArgs): Observable<any> {
    // this.loaderTopService.show();
    this.showLoader();

    return this.http.delete(url, options)/*.map(
        (data) => data.json()
    )*/.catch((error: any, caught: Observable<any>) => {
      this.onEnd();
      this.catchRequestError(error);
      return Observable.throw(error);
    }).finally(() => {
      this.onEnd();
    });
  }

/*
  private onCatch(error: any, caught: Observable<any>): Observable<any> {
    return Observable.throw(error);
  }

  private onSuccess(res: Response): void {
    // console.log('Request successful');
  }

  private onError(error: Response): void {
    if (error.statusText) {
      // this.loaderService.showMessage('error', 'Error', error.statusText);
    }
    // console.log('HttpService Error, status code: ' + res.status);
  }
*/

  private onEnd(): void {
    this.loaderService.hide();
  }

  public showLoader(show = true): void {
    if (show) {
      this.loaderService.show();
    } else {
      this.loaderService.hide();
    }
  }

// success
// info
// warn
// error

  showMessage(severity: string, summary: string, detail: string): void {
    this.loaderService.showMessage(severity, summary, detail);
  }

  showError(error: any, severity: string = 'error', summary: string = 'Error'): void {
    // severity = severity || 'error';
    let errorMsg = 'Internal Server Error';
    if (error._body && (typeof error._body === 'string' || error._body instanceof String)) {
      errorMsg = error._body;
    } else if (error.statusText && (typeof error.statusText === 'string'
        || error.statusText instanceof String)) {
      errorMsg = error.statusText;
    } else if (error.message != null) {
      errorMsg = error.message;
      if (error.message === 'No JWT present or has expired') {
        errorMsg = 'Login expired';
      }
    }
    this.loaderService.showMessage(severity, summary, errorMsg);
  }

  showMessageDlg(severity: string, summary: string, detail: string): void {
    this.loaderService.showMessageDlg(severity, summary, detail);
  }

  showErrorDlg(error: any): void {
    let errorMsg = 'Internal Server Error';
    if (error._body && (typeof error._body === 'string' || error._body instanceof String)) {
      errorMsg = error._body;
    } else if (error.statusText && (typeof error.statusText === 'string' || error.statusText instanceof String)) {
      errorMsg = error.statusText;
    } else if (error.message != null) {
      errorMsg = error.message;
      if (error.message === 'No JWT present or has expired') {
        errorMsg = 'Login expired';
      }
    }
    this.loaderService.showMessageDlg('error', 'Error:', errorMsg);
  }

  confirm(param: ConfirmDialogMsg) {
    this.loaderService.confirm(param);
  }

  formatNumberToLocale(value: any): string {
    let sVal: string = Number(value).toFixed(2);
    const dsPos = sVal.indexOf('.');
    const fract = sVal.substr(dsPos + 1, 2);

    sVal = sVal.slice(0, dsPos);
    const sVals = sVal.split('');
    let i = 0, count = 0;
    sVal = '';
    for (i = dsPos - 1; i > 0; i--) {
      sVal = sVals[i] + sVal;
      count++;
      if (count % 3 === 0) {
        sVal = '.' + sVal;
      }
    }
    sVal = sVals[i] + sVal;

    if (fract !== '00') {
      sVal += ',' + fract;
    }
    if (sVal === '0') {
      sVal = '';
    }
    return sVal;
  }

  getCalendarLocale() {
    return {
      firstDayOfWeek: 0,
      dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      dayNamesShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
      dayNamesMin: ['Mi', 'Sn', 'Sl', 'Ra', 'Ka', 'Ju', 'Sa'],
      monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus',
          'September', 'Oktober', 'November', 'Desember'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      today: 'Hari ini',
      clear: 'Hapus'
    };
  }

  getDataChangedSubject() {
    return this.loaderService.getDataChangedSubject();
  }
}
