import {
  SearchBoxActionTypes,
  SearchBoxState,
  UPDATE_KEYWORD,
  UPDATE_LANG,
} from './types';

const initialState: SearchBoxState = {
  keyword: '',
  lang: '',
};

export function searchBoxReducer(
  state = initialState,
  action: SearchBoxActionTypes
): SearchBoxState {
  switch (action.type) {
    case UPDATE_KEYWORD:
      return {
        ...state,
        keyword: action.keyword,
      };
    case UPDATE_LANG:
      return {
        ...state,
        lang: action.lang,
      };
    default:
      return state;
  }
}
