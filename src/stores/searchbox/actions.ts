import { SearchBoxActionTypes, UPDATE_KEYWORD } from './types';

export function updateKeyword(keyword: string): SearchBoxActionTypes {
  return {
    type: UPDATE_KEYWORD,
    keyword
  };
}