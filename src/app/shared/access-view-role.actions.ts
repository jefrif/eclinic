/**
 * Created by jefri on 08/01/2019.
 */

import { Action } from '@ngrx/store';
import {IaccessViewRole} from 'app/Interfaces/iaccess-view-role';

export const ADD_AVR     = 'AVR-Add';
export const GET_AVR     = 'AVR-Get';
export const DEL_AVR     = 'AVR-Rmv';

export class AddAccessViewRole implements Action {
  readonly type = ADD_AVR;

  constructor(public payload: IaccessViewRole) {}
}

export class GetAccessViewRole implements Action {
  readonly type = GET_AVR;

  constructor() {}
}

export class RemoveAccessViewRole implements Action {
  readonly type = DEL_AVR;

  constructor() {}
}

export type AccessViewRoleActions = AddAccessViewRole | GetAccessViewRole | RemoveAccessViewRole;
