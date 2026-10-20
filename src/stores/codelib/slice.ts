import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import { CodeLibState } from './types';

const initialState: CodeLibState = {
  items: [],
  status: 'idle',
};

export const codeLibSlice = createSlice({
  name: 'codeLib',
  initialState,
  reducers: {
    fetchStarted(state) {
      state.status = 'loading';
      delete state.error;
    },
    fetchSucceeded(state, action: PayloadAction<Array<CodeLibArticle>>) {
      state.items = action.payload;
      state.status = 'loaded';
      delete state.error;
    },
    fetchFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});
