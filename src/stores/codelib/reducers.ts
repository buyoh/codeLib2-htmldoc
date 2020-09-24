import { CodeLibState, CodeLibActionTypes, ADD_ITEMS } from './types';

const initialState: CodeLibState = {
  items: []
};

export function codeLibReducer(
  state = initialState,
  action: CodeLibActionTypes): CodeLibState {
  switch (action.type) {
    case ADD_ITEMS:
      return {
        items: [...state.items, ...action.items]
      };
    default:
      return state;
  }
}