import { SearchBoxActionTypes, UPDATE_KEYWORD, UPDATE_LANG } from './types';

export function updateKeyword(keyword: string): SearchBoxActionTypes {
  return {
    type: UPDATE_KEYWORD,
    keyword,
  };
}

export function updateLang(lang: string): SearchBoxActionTypes {
  return {
    type: UPDATE_LANG,
    lang,
  };
}
