import { codeLibSlice } from './slice';

export const {
  fetchStarted,
  fetchSucceeded,
  fetchFailed,
  articleFetchStarted,
  articleFetchSucceeded,
  articleFetchFailed,
  articleFetchErrorCleared,
} = codeLibSlice.actions;
