export interface SearchBoxState {
  keyword: string,
}

export const UPDATE_KEYWORD = 'searchbox-update-keyword';

interface UpdateKeywordAction {
  type: typeof UPDATE_KEYWORD
  keyword: string
}

export type SearchBoxActionTypes = UpdateKeywordAction
