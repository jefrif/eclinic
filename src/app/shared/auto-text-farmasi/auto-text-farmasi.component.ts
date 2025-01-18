import {Component, EventEmitter, Input, OnInit, Output, Renderer2} from '@angular/core';
import { URLSearchParams} from '@angular/http';
// import { Store } from '@ngrx/store';
import {ApiService} from 'app/service/api.service';
// import { IAppState } from 'app/store';
// import { IaccessViewRole } from 'app/Interfaces/iaccess-view-role';

@Component({
  selector: 'app-auto-text-farmasi',
  templateUrl: './auto-text-farmasi.component.html',
  styleUrls: ['./auto-text-farmasi.component.css']
})
export class AutoTextFarmasiComponent implements OnInit {
  @Output() farmasiSelected = new EventEmitter();
  listSuggestion = [];
  private listFarmasi = [];
  private listFarmasiPage = 0;
  // private lsPnyktHasNextPage = false;
  // private lsPnyktHasPrevPage = false;
  // private suggHasNextPage = false;
  // private suggHasPrevPage = false;
  searchText = '';
  private oldSearchText = '';
  private lastTextSearchBkend = '';
  private suggBeginRowIdx = 0;    // listFarmasi index which is first row of listSuggestion
  private suggEndRowIdx = 0;      // listFarmasi index which is last row of listSuggestion
  // private suggPageNo = 0;
  private suggPageLen = 8;
  // private suggPageCount = 0;
  private backendPageLen = 100;
  selectedFarmasi: any = null;
  private suggGoingPrevPage = false;
  private suggGoingNextPage = false;
  private inputElmt = null;
  private klinikId = 0;
  private kelasLayanId = 0;
  private fromDistOrHibah = false;
  private gudangId: number;

  constructor(private apiService: ApiService, private renderer: Renderer2) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.inputElmt = this.renderer.selectRootElement('#acFa');
    });
  }

  @Input()
  set initState(state: any) {
    if (state != null) {
      this.klinikId = state.klinikId;
      this.kelasLayanId = state.kelasLayanId;
      if (this.inputElmt == null) {
        this.inputElmt = this.renderer.selectRootElement('#acFa');
      }

      if (state.nama != null) {
        setTimeout(() => {
          this.searchFarmasi({query: state.nama});
          this.inputElmt.value = state.nama;
        });
      } else {
        this.inputElmt.value = '';
      }

      this.searchText = '';
      this.lastTextSearchBkend = '';
      this.selectedFarmasi = null;
      this.oldSearchText = '';
      this.fromDistOrHibah = state.fromDistOrHibah != null;
      if (state.gudangId != null) {
        this.gudangId = state.gudangId;
      }
    }
  }

  searchFarmasi(ev) {
    this.searchText = ev.query.toString();
    // console.log('search = ' + this.searchText);
    const search: string = this.searchText.toLowerCase();

    if (!this.suggGoingNextPage && !this.suggGoingPrevPage) {
      // if (!this.typing) {
      // this.typing = true;
      this.findFarmasi(search).then(() => {
        // this.typing = false;
      })/*.catch( (message) => {
       console.log(message);
       }) */;
      // }
      // console.log('s2 = ' + search);
    } else {
      this.oldSearchText = search;
      if (this.suggGoingNextPage) {
        // this.suggGoingNextPage = false;
        // this.suggPageNo++;
        this.getNextSuggestions(this.searchText.toLowerCase());
      } else if (this.suggGoingPrevPage) {
        // this.suggGoingPrevPage = false;
        // this.suggPageNo--;
        this.getPrevSuggestions(this.searchText.toLowerCase());
      }
      // console.log('pageNo = ' +  this.suggPageNo);
    }
  }

  private findFarmasi(search) {
    return new Promise((resolve/*, reject*/) => {
      // console.log('findFarmasi: ' + search.startsWith(this.oldSearchText) + ' | '
      //     + search + ' | ' + this.oldSearchText);
      if (this.oldSearchText.length === 0 || !search.startsWith(this.oldSearchText)) {
        this.listFarmasi = [];
      }
      this.oldSearchText = search;
      this.suggEndRowIdx = -1;
      this.getNextSuggestions(search);
      resolve(search);
      // reject(x);
    });
  }

  // get prev suggestions in listFarmasi
  private getPrevSuggestions(search: string) {
    const suggs = [];
    // let i = this.suggBeginRowIdx + (this.suggPageNo - 1) * this.suggPageLen;
    let i = this.suggBeginRowIdx - 1, found = false;
    while (i >= 0 && !found) {
      if (this.listFarmasi[i].nama.toLowerCase().indexOf(search) >= 0) {
        found = true;
      } else {
        i--;
      }
    }

    if (found) {
      let count = 0, imatch = i;
      while (i >= 0 && count < this.suggPageLen) {
        if (this.listFarmasi[i].nama.toLowerCase().indexOf(search) >= 0) {
          count++;
          imatch = i;
        } else {
          i = 0;
        }
        i--;
      }

      // console.log('suggRowIdxA = ' + i + ', ' + count);
      this.suggBeginRowIdx = imatch;
      this.suggEndRowIdx = this.fillSuggestions(suggs, search, imatch);

      if (suggs.length < this.suggPageLen) {
        //  then there is no more row to scan in listFarmasi

        const params: URLSearchParams = new URLSearchParams();
        params.set('klinikId', this.klinikId.toString());
        params.set('upb', '-');
        params.set('nama', search);
        params.set('pageLength', this.backendPageLen.toString());

        if (this.lastTextSearchBkend.toLowerCase() === search) {
          this.listFarmasiPage--;
        } else {
          this.listFarmasiPage = 1;
          this.lastTextSearchBkend = search;
          params.set('namaFrms', suggs[suggs.length - 1].nama);
          params.set('id', suggs[suggs.length - 1].id);
        }
        params.set('page', this.listFarmasiPage.toString());
        if (this.fromDistOrHibah) {
          params.set('fromDistOrHibah', '1');
        }
        if (this.gudangId != null) {
          params.set('gudangId', this.gudangId.toString());
        }

        if (this.listFarmasiPage > 0) {
          this.apiService.getByParam(`stokfarmasi/0`, params).subscribe(rsp => {
            this.listFarmasi = rsp.list;
            this.suggBeginRowIdx = this.listFarmasi.length
                - (this.suggPageLen - suggs.length);
            this.suggEndRowIdx = this.fillSuggestions(suggs, search, this.suggBeginRowIdx);
            this.listFarmasiPage = rsp.pageIndex;
            suggs.push({nama: '', unit: '<-', stok: 0, id: -1});

            if (this.suggBeginRowIdx > 0) {
              //  check if has prev page
              suggs.unshift({nama: '', unit: '<-', stok: 0, id: -1});
            }
            this.listSuggestion = [...suggs];
            // console.log('p-suggRowIdx1 = ' + this.suggBeginRowIdx + ', ' + this.suggEndRowIdx);
          }, () => {});
        }
        this.suggGoingPrevPage = false;
      } else {
        if (this.suggGoingPrevPage) {
          suggs.push({nama: '', unit: '<-', stok: 0, id: -1});
        }
        this.suggGoingPrevPage = false;

        //  check if has prev page
        i = this.suggBeginRowIdx - 1;   // from prev row downward
        found = false;
        while (i >= 0 && !found) {
          if (this.listFarmasi[i].nama.toLowerCase().indexOf(search) >= 0) {
            found = true;
          } else {
            i--;
          }
        }

        if (found) {
          suggs.unshift({nama: '', unit: '<-', stok: 0, id: -1});
          this.listSuggestion = [...suggs];
          // console.log('p-suggRowIdx2 = ' + this.suggBeginRowIdx + ', ' + this.suggEndRowIdx);
        } else {
          this.listSuggestion = [...suggs];
          //  then there is no more row to scan in listFarmasi

          //  check if has next page
          const params: URLSearchParams = new URLSearchParams();
          params.set('klinikId', this.klinikId.toString());
          params.set('upb', '<');
          params.set('nama', search);
          params.set('pageLength', this.backendPageLen.toString());

          let morePrevRows = true;
          if (this.lastTextSearchBkend.toLowerCase() === search) {
            if (this.listFarmasiPage > 1) {
              params.set('page', (this.listFarmasiPage - 1).toString());
            } else {
              morePrevRows = false;
            }
          } else {
            params.set('namaFrms', suggs[0].nama);
            params.set('id', suggs[0].id);
            params.set('page', '1');
          }
          if (this.fromDistOrHibah) {
            params.set('fromDistOrHibah', '1');
          }
          if (this.gudangId != null) {
            params.set('gudangId', this.gudangId.toString());
          }

          if (morePrevRows) {
            this.apiService.getByParam(`stokfarmasi/${this.klinikId}`, params).subscribe(rsp => {
              if (rsp.list.length > 0 && rsp.list[0].id !== suggs[0].id) {
                this.listSuggestion.unshift({nama: '', unit: '<-', stok: 0, id: -1});
              }
              // this.listSuggestion = [...suggs];
            }, () => {});
          }
        }
      }
    } else {
      this.suggGoingPrevPage = false;
    }
  }

  private getNextSuggestions(search: string) {
    const suggs = [];
    // let i = this.suggBeginRowIdx + (this.suggPageNo - 1) * this.suggPageLen;
    let i = this.suggEndRowIdx + 1, found = false;
    while (i < this.listFarmasi.length && !found) {
      //  .nama.toLowerCase().startsWith(search)) {
      if (this.listFarmasi[i].nama.toLowerCase().indexOf(search) >= 0) {
        found = true;
      } else {
        i++;
      }
    }

    if (found) {
      this.suggBeginRowIdx = i;
      this.suggEndRowIdx = this.fillSuggestions(suggs, search, i);
    } else {
      this.suggBeginRowIdx = this.suggEndRowIdx = -1;
    }

    if (suggs.length < this.suggPageLen) {
      //  then there is no more row to scan in listFarmasi

      const params: URLSearchParams = new URLSearchParams();
      params.set('klinikId', this.klinikId.toString());
      params.set('upb', '-');
      params.set('nama', search);
      params.set('pageLength', this.backendPageLen.toString());

      if (this.lastTextSearchBkend.toLowerCase() === search) {
        if (this.suggGoingNextPage) {
          this.listFarmasiPage++;
        } else {
          this.listFarmasiPage = 1;
        }
      } else {
        this.listFarmasiPage = 1;
        this.lastTextSearchBkend = search;
        if (suggs.length > 0) {
          params.set('namaFrms', suggs[suggs.length - 1].nama);
          params.set('id', suggs[suggs.length - 1].id);
        }
      }
      params.set('page', this.listFarmasiPage.toString());
      if (this.suggGoingNextPage) {
        suggs.unshift({nama: '', unit: '<-', stok: 0, id: -1});
      }
      if (this.fromDistOrHibah) {
        params.set('fromDistOrHibah', '1');
      }
      if (this.gudangId != null) {
        params.set('gudangId', this.gudangId.toString());
      }

      this.apiService.getByParam(`stokfarmasi/${this.klinikId}`, params).subscribe(rsp => {
        if (rsp.list.length > 0) {
          this.listFarmasi = rsp.list;
          // suggs = [];
          this.suggBeginRowIdx = 0;
          this.suggEndRowIdx = this.fillSuggestions(suggs, search, 0);
          this.listFarmasiPage = rsp.pageIndex;

          if (this.suggEndRowIdx + 1 < this.listFarmasi.length) {
            suggs.push({nama: '', unit: '->', stok: 0, id: 0});
          }
        }

        // const srchd = this.inputElmt.value;
        // console.log('check: ' + this.searchText.toLowerCase() + ', ' + search);
        if (search !== this.searchText.toLowerCase() && !this.suggGoingNextPage) {
          // console.log('search-1 = ' + search + ', ' + this.searchText.toLowerCase());
          // this.typing = true;
          this.findFarmasi(this.searchText.toLowerCase()).then(() => {
            // this.typing = false;
          });
        } else {
          this.listSuggestion = [...suggs];
        }
        this.suggGoingNextPage = false;
      }, () => {
        // this.typing = false;
        this.suggGoingNextPage = false;
      });
    } else {
      // this.typing = false;
      if (this.suggGoingNextPage) {
        suggs.unshift({nama: '', unit: '<-', stok: 0, id: -1});
      }
      this.suggGoingNextPage = false;

      //  check if has next page
      i = this.suggEndRowIdx + 1;
      found = false;
      while (i < this.listFarmasi.length && !found) {
        // if (rsp.list[i].nama.toLowerCase().startsWith(search)) {
        if (this.listFarmasi[i].nama.toLowerCase().indexOf(search) >= 0) {
          found = true;
        } else {
          i++;
        }
      }

      if (found) {
        suggs.push({nama: '', unit: '->', stok: 0, id: 0});
        this.listSuggestion = [...suggs];
        if (search !== this.searchText.toLowerCase()) {
          // console.log('search-2 = ' + search + ', ' + this.searchText.toLowerCase());
        }
      } else {
        this.listSuggestion = [...suggs];
        //  then there is no more row to scan in listFarmasi

        //  check if has next page
        const params: URLSearchParams = new URLSearchParams();
        params.set('klinikId', this.klinikId.toString());
        params.set('upb', '-');
        params.set('nama', search);
        params.set('pageLength', this.backendPageLen.toString());

        if (this.lastTextSearchBkend.toLowerCase() === search) {
          params.set('page', (this.listFarmasiPage + 1).toString());
        } else {
          params.set('page', '1');
          params.set('namaFrms', suggs[suggs.length - 1].nama);
          params.set('id', suggs[suggs.length - 1].id);
        }
        if (this.fromDistOrHibah) {
          params.set('fromDistOrHibah', '1');
        }
        if (this.gudangId != null) {
          params.set('gudangId', this.gudangId.toString());
        }

        this.apiService.getByParam(`stokfarmasi/${this.klinikId}`, params).subscribe(rsp => {
          if (rsp.list.length > 0) {
            this.listSuggestion.push({nama: '', unit: '->', stok: 0, id: 0});
          }
          if (search !== this.searchText.toLowerCase()) {
            // console.log('search-3 = ' + search + ', ' + this.searchText.toLowerCase());
          }
        }, () => {});
      }
    }
  }

  private fillSuggestions(suggs: Array<any>, search: string, startIdx: number): number {
    // {{penykt.tleft}}<span style="background-color: lightgreen;">{{penykt.tmid}}</span>{{penykt.tright}}
    let stop = false;
    let i = startIdx;
    let occPos = -1;
    let row = null, tnama = null, tleft = '', tright = '', tmid = '';
    let maxNamaLen = 0, istart = 0; // console.log(" --- ");
    while (i < this.listFarmasi.length && !stop) {
      // if (this.listFarmasi[i].nama.toLowerCase().startsWith(search)) {
      row = this.listFarmasi[i];
      // console.log(row);

      occPos = row.nama.toLowerCase().indexOf(search);
      if (occPos >= 0) {
        tnama = row.nama.trim();

        if (row.id != null /*&& row.stok > 0*/) {
          tright = ' (stok: ' + row.stok.toString() + ' ' + row.unit + ')';
        // } else {
        //   tright = '';
        }
        maxNamaLen = 120 - tright.length;

        tleft = '';
        tmid = tnama.substr(occPos, search.length);
        if (occPos + search.length < maxNamaLen - 3) {  // potong belakang
          if (occPos > 0) {
           tleft = tnama.slice(0, occPos);
          }
          if (tnama.length > maxNamaLen) {
            tright = tnama.slice(occPos + search.length, maxNamaLen) + '...' + tright;
          } else {
            tright = tnama.slice(occPos + search.length, tnama.length) + tright;
          }
        } else {
          istart = maxNamaLen - 3 - (occPos + search.length);
          if (occPos > istart) {
          }
          tleft = '...' + tnama.slice(istart, occPos);
        }

        row.text = `${tleft}<span style="background-color: lightgreen;">` +
            `${tmid}</span>${tright}`;

        suggs.push(row);
        stop = suggs.length === this.suggPageLen;
      }

      if (!stop) {
        i++;
      }
    }

    return i;
  }

  onLostFocusFrms(ev) {
    if (ev.target != null) {
      if (this.selectedFarmasi != null && this.selectedFarmasi.nama !== ev.target.value.toString()) {
        ev.target.value = this.selectedFarmasi.nama;
        this.oldSearchText = this.selectedFarmasi.nama;
      } else if (this.selectedFarmasi == null) {
        ev.target.value = '';
        this.oldSearchText = '';
      }
    }
  }

  onSelectFarmasi(seldRow) {
    if (seldRow.unit === '->') {
      this.goNextPage(true);
    } else
    if (seldRow.unit === '<-') {
      this.goNextPage(false);
    } else {
      this.apiService.get(`farmasiklinik`, seldRow.id).subscribe(rsp => {
        const tarifs = rsp.tarifJualFarmasi;
        if (this.fromDistOrHibah) {
          rsp.stokTotal = seldRow.stok;
        }
        let found = false, i = 0, tarifJual = null;
        while (i < tarifs.length && !found) {
          if (tarifs[i].kelasLayananId === this.kelasLayanId) {
            found = true;
            tarifJual = tarifs[i];
          } else {
            i++;
          }
        }

        if (found) {
          let hrgJual = 0;
          if (tarifJual != null) {
            rsp.tarifJualFarmasiId = tarifJual.id;
            if (rsp.marginType === 1) {
              hrgJual = tarifJual.hargaSatuan +
                  tarifJual.hargaSatuan * tarifJual.marginKelas / 100;
            } else {
              hrgJual = tarifJual.hargaSatuan + tarifJual.marginKelas;
            }
          }
          this.selectedFarmasi = seldRow;
          this.oldSearchText = this.selectedFarmasi.nama;
          rsp.hargaJual = hrgJual;
          this.farmasiSelected.emit(rsp);
        } else {
          // this.suggBeginRowIdx = this.suggEndRowIdx = 0;
          // this.listFarmasiPage = 0;
          // this.listFarmasi = [];
          // const suggs = [];
          // this.listSuggestion = [...suggs];
          if (this.kelasLayanId === 99999 || this.kelasLayanId === 999999) {
            const param = {
              hargaSatuan: 0,
              marginKelas: 0,
              marginType: rsp.marginType,
              margin: rsp.margin
            };
            this.apiService.post(
                `farmasiklini/${seldRow.id}/kelaslayanan/${this.kelasLayanId}/tarifjualfarmasi`,
                param).subscribe(trj => {
              if (trj.id != null) {
                rsp.tarifJualFarmasiId = trj.id;
              }
              this.selectedFarmasi = seldRow;
              this.oldSearchText = this.selectedFarmasi.nama;
              rsp.hargaJual = 0;
              this.farmasiSelected.emit(rsp);
            }, () => {});
          } else {
            if (this.selectedFarmasi != null) {
              this.oldSearchText = this.selectedFarmasi.nama;
              this.inputElmt.value = this.selectedFarmasi.nama;
            } else {
              this.inputElmt.value = '';
              this.searchText = '';
              this.lastTextSearchBkend = '';
              this.oldSearchText = '';
            }

            this.apiService.showMessage('warn', 'PERHATIAN!', 'Tarif jual belum ditetapkan');
            this.farmasiSelected.emit(null);
          }
        }
      }, () => {});
    }
  }

  goNextPage(nextPage: boolean) {
    // ev.stopPropagation();
    if (nextPage) {
      this.suggGoingNextPage = true;
    } else {
      this.suggGoingPrevPage = true;
    }

    if (this.inputElmt == null) {
      this.inputElmt = this.renderer.selectRootElement('#acFa');
    }
    this.inputElmt.value = this.searchText;
    setTimeout(() => {
      this.inputElmt.focus();
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
      this.inputElmt.dispatchEvent(evt);
    }, 300);
  }

}
