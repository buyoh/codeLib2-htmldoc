import { CodeLibItem } from '../../lib/CodeLib/types';

export interface CodeLibState {
  'items': Array<CodeLibItem>
}

export const ADD_ITEMS = 'codelib-additems';

interface AddCodeLibItemsAction {
  type: typeof ADD_ITEMS
  items: Array<CodeLibItem>
}

export type CodeLibActionTypes = AddCodeLibItemsAction
