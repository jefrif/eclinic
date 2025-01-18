/**
 * Created by jefri on 21/03/2019.
 */

import { IAnyState } from 'app/Interfaces/any-state';
import * as Actions from './any-state.actions';

const initState: IAnyState = {
  state: null
};

export function anyStateReducer(state: IAnyState = initState, action: Actions.AnyStateActions) {
  switch (action.type) {
    case Actions.ADD_AST:
      return Object.assign({}, state, action.payload);

    case Actions.DEL_AST:
      return Object.assign({}, state, initState);

    default:
      return state;
  }
}
