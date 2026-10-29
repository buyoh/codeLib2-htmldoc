import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { codeLibReducer } from './codelib/reducers';
import { searchBoxReducer } from './searchbox/reducers';

export const rootReducer = combineReducers({
  codeLib: codeLibReducer,
  searchBox: searchBoxReducer,
});

export function createRootStore() {
  return configureStore({ reducer: rootReducer });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof createRootStore>;
export type AppDispatch = AppStore['dispatch'];
