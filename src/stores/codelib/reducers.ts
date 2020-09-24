import { CodeLibState, CodeLibActionTypes, ADD_ITEMS } from './types';

const initialState: CodeLibState = {
  items: [
    {
      title: 'string',
      overview: 'string',
      verified: 'string',
      references: ['string'],
      words: ['a', 'b'],
      require: [],
      code: 'string',
      path: 'string',
    }
  ]
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