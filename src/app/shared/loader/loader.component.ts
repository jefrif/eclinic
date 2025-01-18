import {Component, OnInit, OnDestroy/*, Renderer2*/} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {LoaderService} from './loader.service';
import {LoaderState} from './loader';
import {GMessageState} from './g-message';
import {MessageService} from 'primeng/components/common/messageservice';
import {Message} from 'primeng/primeng';
import {ConfirmationService} from 'primeng/primeng';
import {IconfirmDialogState} from './iconfirm-dialog-state';

@Component({
  selector: 'app-loader',
  templateUrl: 'loader.component.html',
  styleUrls: ['loader.component.css'],
  providers: [MessageService]
})
export class LoaderComponent implements OnInit, OnDestroy {

  show = false;
  showdlg = false;
  private subscription: Subscription;
  private subscrMessg: Subscription;
  private subscrMsgDlg: Subscription;
  private subscrConfirmDlg: Subscription;
  mesgs: Message[] = [];
  acceptLabel = 'OK';
  rejectLabel = 'Batal';

  constructor(private loaderService: LoaderService, /*private renderer: Renderer2,*/
              private messageService: MessageService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState
        .subscribe((state: LoaderState) => {
          this.show = state.show;
        });
    this.subscrMessg = this.loaderService.gmessgState
        .subscribe((state: GMessageState) => {
          this.messageService.add({severity: state.severity, summary: state.summary, detail: state.detail});
        });
    this.subscrMsgDlg = this.loaderService.msgDlgState
        .subscribe((state: GMessageState) => {
          this.showdlg = true;
          this.mesgs = [];
          this.mesgs.push({severity: state.severity, summary: state.summary, detail: state.detail});
        });
    this.subscrConfirmDlg = this.loaderService.confirmDlgState
        .subscribe((state: IconfirmDialogState) => {
          const comp = state.param;
          this.acceptLabel = comp.acceptLabel;
          this.rejectLabel = comp.rejectLabel;

          this.confirmationService.confirm({
            header: comp.header,
            message: comp.message,
            icon: comp.icon,
            key: comp.key,
            rejectVisible: comp.rejectVisible,
            accept: () => {
              if (comp.accept != null) {
                comp.accept();
              }
            },
            reject: () => {
              if (comp.reject != null) {
                comp.reject();
              }
            }
          });
        }
    );
    this.loaderService.startConnection();
    this.loaderService.addBackDataChangedListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscrMessg.unsubscribe();
    this.subscrMsgDlg.unsubscribe();
  }
}
