import { describe, expect, it } from 'vitest';
import { rootReducer } from '../../stores';
import * as CodeLibActions from '../../stores/codelib/actions';
import { selectLanguageOptions } from './impl';
import { makeArticle } from '../../test/fixtures';

describe('selectLanguageOptions', () => {
  it('derives options from article languages with known labels', () => {
    const state = rootReducer(
      undefined,
      CodeLibActions.fetchSucceeded([
        makeArticle({ path: '/rust/a', lang: 'rust' }),
        makeArticle({ path: '/cpp/a', lang: 'cpp' }),
        makeArticle({ path: '/go/a', lang: 'go' }),
      ])
    );
    expect(selectLanguageOptions(state)).toEqual([
      { key: '', value: '', label: 'all' },
      { key: 'cpp', value: 'cpp', label: 'C++' },
      { key: 'go', value: 'go', label: 'go' },
      { key: 'rust', value: 'rust', label: 'Rust' },
    ]);
  });
});
