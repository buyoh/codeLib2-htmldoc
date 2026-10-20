import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchBoxState } from './types';

const initialState: SearchBoxState = {
  keyword: '',
  lang: '',
};

export const searchBoxSlice = createSlice({
  name: 'searchBox',
  initialState,
  reducers: {
    updateKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
    },
    updateLang(state, action: PayloadAction<string>) {
      state.lang = action.payload;
    },
  },
});
