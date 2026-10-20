import { describe, expect, it } from 'vitest';
import { codeLibReducer } from './reducers';
import * as Actions from './actions';
import { makeArticle } from '../../test/fixtures';

const init = () => codeLibReducer(undefined, { type: '@@INIT' } as never);

describe('codeLibReducer', () => {
  it('starts idle with no items', () => {
    expect(init()).toEqual({ items: [], status: 'idle' });
  });

  it('becomes loading on fetchStarted', () => {
    expect(codeLibReducer(init(), Actions.fetchStarted())).toEqual({
      items: [],
      status: 'loading',
    });
  });

  it('stores items on fetchSucceeded', () => {
    const items = [makeArticle()];
    const state = codeLibReducer(
      codeLibReducer(init(), Actions.fetchStarted()),
      Actions.fetchSucceeded(items)
    );
    expect(state).toEqual({ items, status: 'loaded' });
  });

  it('stores the error on fetchFailed', () => {
    const state = codeLibReducer(
      codeLibReducer(init(), Actions.fetchStarted()),
      Actions.fetchFailed('boom')
    );
    expect(state).toEqual({ items: [], status: 'error', error: 'boom' });
  });

  it('clears the previous error on fetchStarted', () => {
    const failed = codeLibReducer(init(), Actions.fetchFailed('boom'));
    const state = codeLibReducer(failed, Actions.fetchStarted());
    expect(state.status).toBe('loading');
    expect(state.error).toBeUndefined();
  });
});
