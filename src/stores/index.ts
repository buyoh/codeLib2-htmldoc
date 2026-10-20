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

export const rootStore = createRootStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof rootStore.dispatch;
