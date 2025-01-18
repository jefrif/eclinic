import { IaccessViewRole } from 'app/Interfaces/iaccess-view-role';
import * as Actions from './access-view-role.actions';

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
  production: false,
  userId: ''
};

export function accessViewRoleReducer(state: IaccessViewRole = initState,
                                      action: Actions.AccessViewRoleActions) {
  switch (action.type) {
    case Actions.ADD_AVR:
      // return [...state, action.payload];    // if array [IAnggota]
      return Object.assign({}, state, action.payload);

    case Actions.GET_AVR:
      return Object.assign({}, state);

      /*
      const retState: IaccessViewRole = {
        list: []
      };
      if (state.list != null) {
        const path: string = action.payload;
        retState.list = state.list.filter(
            en => en.accessViewPath != null && en.accessViewPath.indexOf(path) >= 0);
      }
      // return Object.assign({}, retState);
      return retState;
*/
    case Actions.DEL_AVR:
      return Object.assign({}, initState);
      // return null;

    default:
      return state;
  }
}

