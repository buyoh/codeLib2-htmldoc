import { createStore, combineReducers } from 'redux';
import { codeLibReducer } from './codelib/reducers';
import { searchBoxReducer } from './searchbox/reducers';

export const rootReducer = combineReducers({
  codeLib: codeLibReducer,
  searchBox: searchBoxReducer,
});

export const rootStore = createStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer>;
