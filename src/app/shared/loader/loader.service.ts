import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {Subject} from 'rxjs/Subject';
import {LoaderState} from './loader';
import {GMessageState} from './g-message';
import {ConfirmDialogMsg} from 'app/Interfaces/confirm-dialog-msg';
import {IconfirmDialogState} from './iconfirm-dialog-state';
import {environment} from '../../../environments/environment';

@Injectable()

export class LoaderService {

  private loaderSubject = new Subject<LoaderState>();
  private gmessgSubject = new Subject<GMessageState>();
  private msgDlgSubject = new Subject<GMessageState>();
  private confirmDlgSubject = new Subject<IconfirmDialogState>();

  loaderState = this.loaderSubject.asObservable();
  gmessgState = this.gmessgSubject.asObservable();
  msgDlgState = this.msgDlgSubject.asObservable();
  confirmDlgState = this.confirmDlgSubject.asObservable();
  private hubConnection: signalR.HubConnection;
  private dataChgdSubject = new Subject<number>();

  constructor() {
  }

  show(): void {
    this.loaderSubject.next(<LoaderState>{show: true});
  }

  hide(): void {
    this.loaderSubject.next(<LoaderState>{show: false});
  }

// success
// info
// warn
// error
  showMessage(severity: string, summary: string, detail: string): void {
    this.gmessgSubject.next(<GMessageState>{severity: severity, summary: summary,
      detail: detail.replace(/\n|\r\n|\r/g, '<br/>')});
  }

  showMessageDlg(severity: string, summary: string, detail: string): void {
    this.msgDlgSubject.next(<GMessageState>{severity: severity, summary: summary,
      detail: detail.replace(/\n|\r\n|\r/g, '<br/>')});
  }

  confirm(param: ConfirmDialogMsg) {
    this.confirmDlgSubject.next(<IconfirmDialogState>{param: param});
  }

  public startConnection() {
    let url = environment.url;
    url = url.substr(0, url.length - 4) + 'datach';
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl(url).build();

    this.hubConnection.start()
        .then(() => console.log('Connection started'))
        .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addBackDataChangedListener() {
    this.hubConnection.on('bkdatachanged', (data) => {
      // console.log(`bkdatachanged: ${data}`);
      this.dataChgdSubject.next(data);
    });
  }

  getDataChangedSubject() {
    return this.dataChgdSubject;
  }
}
