export interface CodeLibItem {
  'title': string,
  'overview': string,
  'usage': string,
  'verified': string,
  'references': string,
  'words': Array<string>,
  'require': Array<string>,
  'code': string,
  'path': string,
}

export interface CodeLibState {
  'items': Array<CodeLibItem>
}

export const ADD_ITEM = 'aaaaa';

interface AddCodeLibItemAction {
  type: typeof ADD_ITEM
  item: CodeLibItem
}

export type CodeLibActionTypes = AddCodeLibItemAction
