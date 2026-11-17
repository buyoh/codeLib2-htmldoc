import { describe, expect, it } from 'vitest';
import { codeLibReducer } from './reducers';
import * as Actions from './actions';
import { codeLibSlice } from './slice';
import { makeArticle } from '../../test/fixtures';

const init = () => codeLibSlice.getInitialState();

describe('codeLibReducer', () => {
  it('starts idle with no items', () => {
    expect(init()).toEqual({ items: [], status: 'idle', articles: {} });
  });

  it('becomes loading on fetchStarted', () => {
    expect(codeLibReducer(init(), Actions.fetchStarted())).toEqual({
      items: [],
      status: 'loading',
      articles: {},
    });
  });

  it('stores items on fetchSucceeded', () => {
    const items = [makeArticle()];
    const state = codeLibReducer(
      codeLibReducer(init(), Actions.fetchStarted()),
      Actions.fetchSucceeded(items)
    );
    expect(state).toEqual({ items, status: 'loaded', articles: {} });
  });

  it('stores the error on fetchFailed', () => {
    const state = codeLibReducer(
      codeLibReducer(init(), Actions.fetchStarted()),
      Actions.fetchFailed('boom')
    );
    expect(state).toEqual({
      items: [],
      status: 'error',
      error: 'boom',
      articles: {},
    });
  });

  it('clears the previous error on fetchStarted', () => {
    const failed = codeLibReducer(init(), Actions.fetchFailed('boom'));
    const state = codeLibReducer(failed, Actions.fetchStarted());
    expect(state.status).toBe('loading');
    expect(state.error).toBeUndefined();
  });
});

describe('codeLibReducer (articles)', () => {
  const article = makeArticle({ path: '/a' });

  it('tracks the loading state of each article', () => {
    let state = codeLibReducer(init(), Actions.articleFetchStarted('/a'));
    expect(state.articles).toEqual({ '/a': { status: 'loading' } });
    state = codeLibReducer(state, Actions.articleFetchSucceeded(article));
    expect(state.articles).toEqual({ '/a': { status: 'loaded', article } });
  });

  it('stores the error of an article', () => {
    const state = codeLibReducer(
      codeLibReducer(init(), Actions.articleFetchStarted('/a')),
      Actions.articleFetchFailed({ path: '/a', error: 'boom' })
    );
    expect(state.articles['/a']).toEqual({ status: 'error', error: 'boom' });
  });

  it('keeps other articles and the index', () => {
    const items = [makeArticle()];
    let state = codeLibReducer(init(), Actions.fetchSucceeded(items));
    state = codeLibReducer(state, Actions.articleFetchSucceeded(article));
    state = codeLibReducer(state, Actions.articleFetchStarted('/b'));
    expect(state.items).toBe(items);
    expect(state.articles['/a']).toEqual({ status: 'loaded', article });
  });

  it('clears only a failed article', () => {
    const failed = codeLibReducer(
      init(),
      Actions.articleFetchFailed({ path: '/a', error: 'boom' })
    );
    expect(
      codeLibReducer(failed, Actions.articleFetchErrorCleared('/a')).articles
    ).toEqual({});
  });

  it.each([
    ['loading', Actions.articleFetchStarted('/a')],
    ['loaded', Actions.articleFetchSucceeded(article)],
  ])('does not clear a %s article', (_, action) => {
    const state = codeLibReducer(init(), action);
    expect(
      codeLibReducer(state, Actions.articleFetchErrorCleared('/a'))
    ).toEqual(state);
  });

  it('ignores clearing an unknown article', () => {
    const state = init();
    expect(
      codeLibReducer(state, Actions.articleFetchErrorCleared('/x'))
    ).toEqual(state);
  });
});
