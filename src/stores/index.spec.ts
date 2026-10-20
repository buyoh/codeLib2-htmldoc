import { describe, expect, it } from 'vitest';
import { createRootStore } from '.';
import * as CodeLibActions from './codelib/actions';
import * as SearchBoxActions from './searchbox/actions';
import { makeArticle } from '../test/fixtures';

describe('createRootStore', () => {
  it('starts with the initial state of each slice', () => {
    expect(createRootStore().getState()).toEqual({
      codeLib: { items: [], status: 'idle' },
      searchBox: { keyword: '', lang: '' },
    });
  });

  it('handles the fetch lifecycle', () => {
    const store = createRootStore();
    const items = [makeArticle()];
    store.dispatch(CodeLibActions.fetchStarted());
    expect(store.getState().codeLib.status).toBe('loading');
    store.dispatch(CodeLibActions.fetchFailed('boom'));
    expect(store.getState().codeLib).toEqual({
      items: [],
      status: 'error',
      error: 'boom',
    });
    store.dispatch(CodeLibActions.fetchStarted());
    store.dispatch(CodeLibActions.fetchSucceeded(items));
    expect(store.getState().codeLib).toEqual({ items, status: 'loaded' });
  });

  it('updates the search box', () => {
    const store = createRootStore();
    store.dispatch(SearchBoxActions.updateKeyword('seg'));
    store.dispatch(SearchBoxActions.updateLang('cpp'));
    expect(store.getState().searchBox).toEqual({ keyword: 'seg', lang: 'cpp' });
  });

  it('keeps the previous items while refetching', () => {
    const store = createRootStore();
    const items = [makeArticle()];
    store.dispatch(CodeLibActions.fetchSucceeded(items));
    store.dispatch(CodeLibActions.fetchStarted());
    expect(store.getState().codeLib.items).toEqual(items);
  });
});

describe('action creators', () => {
  it('use slice-prefixed action types', () => {
    expect(CodeLibActions.fetchStarted().type).toBe('codeLib/fetchStarted');
    expect(CodeLibActions.fetchFailed('x')).toEqual({
      type: 'codeLib/fetchFailed',
      payload: 'x',
    });
    expect(SearchBoxActions.updateLang('cpp')).toEqual({
      type: 'searchBox/updateLang',
      payload: 'cpp',
    });
  });
});
