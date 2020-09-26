import { SearchBoxActionTypes, SearchBoxState, UPDATE_KEYWORD } from './types';

const initialState: SearchBoxState = {
  keyword: ''
};

export function searchBoxReducer(
  state = initialState,
  action: SearchBoxActionTypes): SearchBoxState {
  switch (action.type) {
    case UPDATE_KEYWORD:
      return {
        keyword: action.keyword
      };
    default:
      return state;
  }
}
