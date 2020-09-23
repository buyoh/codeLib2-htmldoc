import { CodeLibState, CodeLibActionTypes, ADD_ITEM } from './types';

const initialState: CodeLibState = {
  items: [
    {
      title: 'string',
      overview: 'string',
      usage: 'string',
      verified: 'string',
      references: 'string',
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
    case ADD_ITEM:
      return {
        items: [...state.items, action.item]
      };
    default:
      return state;
  }
}