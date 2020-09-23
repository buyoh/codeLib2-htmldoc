import { createStore, combineReducers } from 'redux';
import { codeLibReducer } from './codelib/reducers';

export const rootReducer = combineReducers({
  codeLib: codeLibReducer
});

export const rootStore = createStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer>
