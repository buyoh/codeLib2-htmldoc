import { describe, expect, it } from 'vitest';
import { createRootStore, rootReducer, RootState } from '.';
import * as CodeLibActions from './codelib/actions';
import * as SearchBoxActions from './searchbox/actions';
import {
  selectArticlePaths,
  selectFilteredArticles,
  selectLanguages,
} from './selectors';
import { makeArticle } from '../test/fixtures';

const items = [
  makeArticle({ path: '/ruby/b', lang: 'ruby' }),
  makeArticle({ path: '/cpp/a', lang: 'cpp' }),
  makeArticle({ path: '/cpp/c', lang: 'cpp' }),
];

function loadedState(): RootState {
  return rootReducer(undefined, CodeLibActions.fetchSucceeded(items));
}

describe('selectFilteredArticles', () => {
  it('returns articles sorted by path', () => {
    expect(selectFilteredArticles(loadedState()).map((a) => a.path)).toEqual([
      '/cpp/a',
      '/cpp/c',
      '/ruby/b',
    ]);
  });

  it('does not mutate the stored items', () => {
    const state = loadedState();
    selectFilteredArticles(state);
    expect(state.codeLib.items).toEqual(items);
  });

  it('applies keyword and language filters', () => {
    let state = loadedState();
    state = rootReducer(state, SearchBoxActions.updateLang('cpp'));
    state = rootReducer(state, SearchBoxActions.updateKeyword('c$'));
    expect(selectFilteredArticles(state).map((a) => a.path)).toEqual([
      '/cpp/c',
    ]);
  });

  it('returns the same reference while inputs are unchanged', () => {
    const state = loadedState();
    const first = selectFilteredArticles(state);
    // 無関係な action では items / searchBox の参照は変わらない
    const next = rootReducer(state, CodeLibActions.fetchFailed('x'));
    expect(selectFilteredArticles(next)).toBe(first);
  });
});

describe('selectArticlePaths', () => {
  it('contains the path of each indexed article', () => {
    const paths = selectArticlePaths(loadedState());
    expect(paths.has('/cpp/c')).toBe(true);
    expect(paths.has('/cpp/x')).toBe(false);
    expect(paths.size).toBe(3);
  });
});

describe('selectLanguages', () => {
  it('returns unique languages in ascending order', () => {
    expect(selectLanguages(loadedState())).toEqual(['cpp', 'ruby']);
  });

  it('returns an empty list before loading', () => {
    const initial = createRootStore().getState();
    expect(selectLanguages(initial)).toEqual([]);
  });
});
