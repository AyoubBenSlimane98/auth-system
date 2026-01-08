import { Action } from '../enum';

export interface Permission {
  resource: string;
  action: Action;
}
