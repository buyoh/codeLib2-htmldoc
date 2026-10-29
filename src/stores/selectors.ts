import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '.';
import { CodeLibArticle } from '../lib/CodeLib/types';
import { filterCodeLibArticles } from '../lib/CodeLib/filter';

const selectItems = (state: RootState) => state.codeLib.items;
const selectKeyword = (state: RootState) => state.searchBox.keyword;
const selectLang = (state: RootState) => state.searchBox.lang;

// 検索条件で絞り込み、path 順に並べた記事一覧
export const selectFilteredArticles = createSelector(
  [selectItems, selectKeyword, selectLang],
  (items, keyword, lang): Array<CodeLibArticle> =>
    filterCodeLibArticles(items, keyword, lang).sort((l, r) =>
      l.path.localeCompare(r.path)
    )
);

// path から記事を引くための Map
export const selectArticleMap = createSelector(
  [selectItems],
  (items): ReadonlyMap<string, CodeLibArticle> =>
    new Map(items.map((a) => [a.path, a]))
);

// 記事データに含まれる言語の一覧（重複なし・昇順）
export const selectLanguages = createSelector(
  [selectItems],
  (items): Array<string> => Array.from(new Set(items.map((a) => a.lang))).sort()
);
