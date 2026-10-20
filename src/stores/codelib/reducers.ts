import {
  CodeLibState,
  CodeLibActionTypes,
  FETCH_FAILED,
  FETCH_STARTED,
  FETCH_SUCCEEDED,
} from './types';

const initialState: CodeLibState = {
  items: [],
  status: 'idle',
};

export function codeLibReducer(
  state = initialState,
  action: CodeLibActionTypes
): CodeLibState {
  switch (action.type) {
    case FETCH_STARTED:
      return {
        items: state.items,
        status: 'loading',
      };
    case FETCH_SUCCEEDED:
      return {
        items: action.items,
        status: 'loaded',
      };
    case FETCH_FAILED:
      return {
        items: state.items,
        status: 'error',
        error: action.error,
      };
    default:
      return state;
  }
}
