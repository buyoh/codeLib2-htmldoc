import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CodeLibArticle, CodeLibArticleSummary } from '../../lib/CodeLib/types';
import { CodeLibState } from './types';

const initialState: CodeLibState = {
  items: [],
  status: 'idle',
  articles: {},
};

export const codeLibSlice = createSlice({
  name: 'codeLib',
  initialState,
  reducers: {
    fetchStarted(state) {
      state.status = 'loading';
      delete state.error;
    },
    fetchSucceeded(state, action: PayloadAction<Array<CodeLibArticleSummary>>) {
      state.items = action.payload;
      state.status = 'loaded';
      delete state.error;
    },
    fetchFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    articleFetchStarted(state, action: PayloadAction<string>) {
      state.articles[action.payload] = { status: 'loading' };
    },
    articleFetchSucceeded(state, action: PayloadAction<CodeLibArticle>) {
      state.articles[action.payload.path] = {
        status: 'loaded',
        article: action.payload,
      };
    },
    articleFetchFailed(
      state,
      action: PayloadAction<{ path: string; error: string }>
    ) {
      state.articles[action.payload.path] = {
        status: 'error',
        error: action.payload.error,
      };
    },
    // 失敗した記事を未取得に戻し、次に開いたときに再取得させる
    articleFetchErrorCleared(state, action: PayloadAction<string>) {
      if (state.articles[action.payload]?.status === 'error')
        delete state.articles[action.payload];
    },
  },
});
