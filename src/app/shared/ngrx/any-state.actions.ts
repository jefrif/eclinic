/**
 * Created by jefri on 21/03/2019.
 */

import { Action } from '@ngrx/store';
import {IAnyState} from 'app/Interfaces/any-state';

export const ADD_AST     = 'AST-Add';
export const DEL_AST     = 'AST-Del';

export class AddAnyStateAction implements Action {
  readonly type = ADD_AST;

  constructor(public payload: IAnyState) {}
}

export class RemoveAnyStateAction implements Action {
  readonly type = DEL_AST;

  constructor() {}
}

export type AnyStateActions = AddAnyStateAction | RemoveAnyStateAction;
