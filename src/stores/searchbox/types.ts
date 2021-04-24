export interface SearchBoxState {
  keyword: string;
  lang: string;
}

export const UPDATE_KEYWORD = 'searchbox-update-keyword';
export const UPDATE_LANG = 'searchbox-update-lang';

interface UpdateKeywordAction {
  type: typeof UPDATE_KEYWORD;
  keyword: string;
}

interface UpdateLangAction {
  type: typeof UPDATE_LANG;
  lang: string;
}

export type SearchBoxActionTypes = UpdateKeywordAction | UpdateLangAction;
