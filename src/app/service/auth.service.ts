import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
// import {HttpClient, HttpRequest, HttpHeaders} from '@angular/common/http';
import {AuthConfig, AuthHttp} from 'angular2-jwt';
import {JwtHelper} from 'angular2-jwt';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {environment} from '../../environments/environment';
import {HttpService} from './http.service';
import {IAppState} from 'app/store';
import * as Actions from 'app/shared/access-view-role.actions';
import {IaccessViewRole} from 'app/Interfaces/iaccess-view-role';

interface IJwtToken {
  token: string;
  accViewsRole: any[];
  tokenInfo: any;
  lastVisited: string;
}

const JwtToken: IJwtToken = {
  token: '',
  accViewsRole: [],
  tokenInfo: null,
  lastVisited: '/admin/layanan/home-page'
};

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper = new JwtHelper();
  // private roleId: any = null;
  private isAdmin = false;

  static getAccessViewsRoleByPath(path: string): any {
    let found = false;
    let i = 0;
    if (JwtToken.accViewsRole != null) {
      const n = JwtToken.accViewsRole.length;
      while (!found && i < n) {
        if (JwtToken.accViewsRole[i].accessViewPath != null
            && JwtToken.accViewsRole[i].accessViewPath.indexOf(path) >= 0) {
          found = true;
        } else {
          i++;
        }
      }
    }

    if (found) {
      return JwtToken.accViewsRole[i];
    } else {
      return {
        roleId: null,
        accessViewId: 0,
        accessViewParentId: null,
        accessViewObject: null,
        ins: 0,
        upd: 0,
        del: 0,
        ron: 0,
        accessViewPath: ''
      };
    }
  }

  static getAccessViewsRoleById(accessViewId: number): any {
    let found = false;
    let i = 0;
    const n = JwtToken.accViewsRole.length;
    while (!found && i < n) {
      if (JwtToken.accViewsRole[i].accessViewId === accessViewId) {
        found = true;
      } else {
        i++;
      }
    }
    if (found) {
      return {
        ins: JwtToken.accViewsRole[i].ins === 1,
        upd: JwtToken.accViewsRole[i].upd === 1,
        del: JwtToken.accViewsRole[i].del === 1,
        ron: JwtToken.accViewsRole[i].ron === 1
      };
    } else {
      return {
        roleId: null,
        accessViewId: 0,
        accessViewParentId: null,
        accessViewObject: null,
        ins: false,
        upd: false,
        del: false,
        ron: false,
        accessViewPath: ''
      };
    }
  }

  static getTokenInfo() {
    /*
        const token = JSON.parse(localStorage.getItem('currentUser')).token;
        if (token) {
          return this.jwtHelper.decodeToken(token);
        }
        if (JwtToken.tokenInfo == null) {
          this.initSessionStore();
        } else {
        }
    */
    return JwtToken.tokenInfo;
  }

  constructor(private httpService: HttpService, private store: Store<IAppState>,
              private router: Router/*, private httpClient: HttpClient*/) {
  }

  login(credentials) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.httpService.httpPost(`${environment.url}auth/token`, credentials,
        {headers: headers}).map(data => data.json()
    );

    /*
        .subscribe((response: Response) => {
        const user = response.json();
        if (user && user.token) {
          // console.log('tok exp = ' + this.jwtHelper.getTokenExpirationDate(user.token));
        }
      });
*/
  }

  processToken(user, url, notExpired = true) {
    /**/
    const dtok = this.jwtHelper.decodeToken(user.token);
    // const dtok = this.jwtHelper.decodeToken(token);

    // const d = new Date(2018, 11, 21,
    //     12, 33, 30, 0);   // month start from zero
    // const nid = dtok.nameid;
    // if (nid === '0') {
    JwtToken.token = JSON.stringify(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (notExpired) {
      this.initSessionState(dtok, url);
    }
    // this.router.navigate([url]).then();
    // } else /*if (new Date(Date.now()) < d)*/ {
      // console.log('...');
      //   localStorage.setItem('currentUser', JSON.stringify(user));
    // }
  }

  private initSessionState(dtok, routePath = null) {
    JwtToken.tokenInfo = dtok;
    const roleId = dtok.roleId;

    if (!Array.isArray(roleId)) {
      this.isAdmin = parseInt(roleId, 10) === 1;
    } else {
      this.isAdmin = roleId.some(x => x === '1' || x === 1);
    }
    this.getViewsAccessRoles(roleId).subscribe(data => {
      if (routePath != null) {
        JwtToken.lastVisited = routePath;
        const state: IaccessViewRole = {
          list: [],
          klinikId: dtok.klinikId,
          klinikLogo: dtok.klinikLogo,
          klinikName: dtok.klinikName,
          organLayan: dtok.OrganLayan,
          konfig: dtok.Konfig,
          isAdmin: this.isAdmin,
          sub: dtok.sub,
          name: dtok.name,
          production: environment.production,
          userId: dtok.userId
        };
        // if (dtok.nameid === '304') {    // TODO: altruise production Ucloud
        // if (dtok.nameid === '333') {    // local
        if (dtok.nameid === '0') {    // standar
          state.list = data;
          JwtToken.accViewsRole = data;
        }
        this.store.dispatch(new Actions.AddAccessViewRole(state));
        if (routePath.length > 0) {
          this.router.navigate([routePath]).then(() => {
            if (routePath === '/admin/layanan/home-page') {
              this.httpService.postAnyBehaviorSubject({
                eventSource: 'authService.Login',
                avr: state
              });
            }
          });
        }
        // this.router.navigate(['/admin']).then();
      }
    });
  }

/*
  navigateAfterAuthed() {
    // if (JwtToken.lastVisited !== '/admin/layanan/home-page') {
    //   this.router.navigate([JwtToken.lastVisited]).then();
    // }
    console.log(JwtToken.lastVisited);
  }
*/

  logout(path = '/login', mode = 1) {
    /*
        const initState: IaccessViewRole = {
          list: null,
          klinikId: 0,
          klinikLogo: '',
          klinikName: '',
          organLayan: 0,
          konfig: 0,
          isAdmin: false,
          sub: '',
          name: '',
          production: false
        };
    */

    if (mode > 0) {
      // this.store.dispatch(new Actions.AddAccessViewRole(initState));
      if (mode < 2) {
        this.store.dispatch(new Actions.RemoveAccessViewRole());
        // if (JwtToken.accViewsRole && Array.isArray(JwtToken.accViewsRole)) {
        //   JwtToken.accViewsRole.length = 0;
        // }
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb2t0ZXIzIiwianRp'
            + 'IjoiMThiMGZiOTAtZmFmNS00MzRhLTkzNTEtN2U0MWFmMmZkOWQ4IiwibmFtZSI6ImRva3Rlc'
            + 'jNAa2xpbmlrLmlkIiwiZW1haWwiOiJkb2t0ZXIzQGtsaW5pay5pZCIsImtsaW5pa0lkIjoiNT'
            + 'QxIiwia2xpbmlrTmFtZSI6IlRVR1UgTUVESUNBTCBDRU5UUkUiLCJLb25maWciOiIwIiwibmF'
            + 'tZWlkIjoiMCIsImtsaW5pa0xvZ28iOiI5YzEzZGEzNi0yZGVlLTRjNGEtOGE0YS05MzA4YzNj'
            + 'NjI2NTAucG5nIiwiT3JnYW5MYXlhbiI6IjAiLCJyb2xlSWQiOlsiMiIsIjQiLCI2Il0sImV4c'
            + 'CI6MTU5MzA3NzA1NywiaXNzIjoiaHR0cDovL2FsdHJ1aXNlLnVzYWRpLmNvLmlkOjUwMDAiLC'
            + 'JhdWQiOiJodHRwOi8vYWx0cnVpc2UudXNhZGkuY28uaWQ6NDIwMCJ9.ZVvO3C7lhl-QaLeW0S'
            + 'CgD3QoyfJ6QYQMAPohfE7ZQLU';

        const user = {
          'token': token,
          'expiration': '2020-06-25T09:24:17Z'
        };

        JwtToken.token = JSON.stringify(user);
        JwtToken.accViewsRole = [];
        JwtToken.tokenInfo = null;
        // if (!expired) {
        //   JwtToken.lastVisited = '/admin/layanan/home-page';
        // }
      }
      localStorage.removeItem('currentUser');

      if (path.length > 0) {
        this.router.navigate([path]/*, {queryParams: {returnUrl: state.url}}*/)
            .then(() => {
              // this.router.navigate(['/']).then();
            });
      }
    } else {
      this.httpService.postAnySubject({
        noJwtExpd: 1,
        lastVisited: JwtToken.lastVisited
      });
    }
  }

/*
  cleanIfExpired() {
    const tokif = localStorage.getItem('currentUser');
    if (tokif != null && this.jwtHelper.isTokenExpired(tokif)) {
      this.logout();
    }
  }
*/

/*
  getAccessViews(roleId) {
    JwtToken.accViewsRole = [];
    this.authHttp
        .post(`${environment.url}role/0/accessview`, roleId)
        .map(res => res.json())
        .subscribe(data => {
          JwtToken.accViewsRole = data;
        });
  }

  getAccessViewsRoles() {
    return JwtToken.accViewsRole;
  }

  setAccessViewsRoles(avr) {
    JwtToken.accViewsRole = avr;
  }
*/

  private getViewsAccessRoles(roleIds: any) {
    let ris = [];

    if (!Array.isArray(roleIds)) {
      ris.push(parseInt(roleIds, 10));
    } else {
      ris = roleIds;
    }

    return this.httpService
        .post(`${environment.url}role/0/accessview`, ris)
        .map(res => res.json());
  }

  sessionValid(routePath, willLogin = false): boolean {
    if (routePath === '/admin') {
      this.router.navigate(['/admin/layanan/home-page']).then();
      return false;
    }
    if (routePath !== '/admin/layanan/home-page') {
      willLogin = false;
    }

    JwtToken.lastVisited = routePath;
    const tokStr = localStorage.getItem('currentUser');
    if (tokStr != null && !this.jwtHelper.isTokenExpired(tokStr)) {
      if (JwtToken.token === tokStr) {
        return true;
      }
      JwtToken.token = tokStr;
      const dtok = this.jwtHelper.decodeToken(JSON.parse(tokStr).token);

      // if (!environment.production) {
      //   this.getViewsAccessRoles(roleId).subscribe(data => {
      //     const state: IaccessViewRole = {
      //       list: data,
      //       klinikId: 541,
      //       klinikLogo: 'aeb2e3ed-13d1-4526-8628-c6614630d05e.png',
      //       klinikName: 'TUGU MEDICAL CENTRE',
      //       organLayan: 0,
      //       konfig: 0,
      //       isAdmin: false,
      //       sub: 'dokter3',
      //       name: 'dokter3@klinik.id',
      //       production: false
      //     };
      //     this.store.dispatch(new Actions.AddAccessViewRole(state));
      //   });
      // } else {
      if (willLogin) {
        // this.logout(JwtToken.lastVisited, 1);
      }
      this.initSessionState(dtok, routePath);
      return false;
      // }
    } else {
      if (willLogin) {
        this.logout();
      } else {
        this.logout(JwtToken.lastVisited, 0);
      }
      return false;
    }
  }

  getAnySubject() {
    return this.httpService.getAnySubject();
  }

  getAnyBehaviorSubject() {
    return this.httpService.getAnyBehaviorSubject();
  }

/*
  login2(credentials) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    this.httpService.httpPost(`${environment.url}auth/token`, credentials,
        {headers: headers}).subscribe((response: Response) => {
      const data = <any>response.json();
      console.log(data);
      let hdr = new HttpHeaders();
      // hdr = hdr.set('Content-Type', 'application/json');
      // hdr = hdr.set('Accept', 'application/json');
      hdr = hdr.set('Authorization', 'Bearer ' + data.token);
      this.httpClient.get(`${environment.url}kelaslayanan`, {headers: hdr})
          .subscribe(resp => {
            console.log(resp);
          }, () => {});
      // if (user && user.token) {
      //   console.log(user.token);
      //   // console.log('tok exp = ' + this.jwtHelper.getTokenExpirationDate(user.token));
      // }
    });
  }

  public getLastVisitedPath() {
    return JwtToken.lastVisited;
  }
*/
}

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenName: 'token',
    // tokenGetter: (() => JSON.parse(localStorage.getItem('currentUser')).token),
    tokenGetter: (() => JSON.parse(JwtToken.token).token),
    globalHeaders: [{'Content-Type': 'application/json'}]
  }), http, options);
}
