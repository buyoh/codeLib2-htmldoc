import { CodeLibState, CodeLibActionTypes, SET_ITEMS } from './types';

const initialState: CodeLibState = {
  items: []
};

export function codeLibReducer(
  state = initialState,
  action: CodeLibActionTypes): CodeLibState {
  switch (action.type) {
    case SET_ITEMS:
      return {
        items: action.items
      };
    default:
      return state;
  }
}