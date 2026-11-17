import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '.';
import { CodeLibArticleSummary } from '../lib/CodeLib/types';
import { filterCodeLibArticles } from '../lib/CodeLib/filter';

const selectItems = (state: RootState) => state.codeLib.items;
const selectKeyword = (state: RootState) => state.searchBox.keyword;
const selectLang = (state: RootState) => state.searchBox.lang;

// 検索条件で絞り込み、path 順に並べた記事一覧
export const selectFilteredArticles = createSelector(
  [selectItems, selectKeyword, selectLang],
  (items, keyword, lang): Array<CodeLibArticleSummary> =>
    filterCodeLibArticles(items, keyword, lang).sort((l, r) =>
      l.path.localeCompare(r.path)
    )
);

// インデックスに存在する記事の path
export const selectArticlePaths = createSelector(
  [selectItems],
  (items): ReadonlySet<string> => new Set(items.map((a) => a.path))
);

// 記事データに含まれる言語の一覧（重複なし・昇順）
export const selectLanguages = createSelector(
  [selectItems],
  (items): Array<string> => Array.from(new Set(items.map((a) => a.lang))).sort()
);
