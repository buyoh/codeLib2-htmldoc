// @vitest-environment jsdom
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { rootReducer } from '../../stores';
import * as CodeLibActions from '../../stores/codelib/actions';
import * as SearchBoxActions from '../../stores/searchbox/actions';
import SideSearchFrame from '.';
import { render } from '../../test/render';
import { makeArticle } from '../../test/fixtures';

function setup() {
  const store = createStore(rootReducer);
  store.dispatch(
    CodeLibActions.fetchSucceeded([
      makeArticle({ path: '/ruby/b', title: 'B', lang: 'ruby' }),
      makeArticle({ path: '/cpp/a', title: 'A', lang: 'cpp' }),
    ])
  );
  const r = render(
    <Provider store={store}>
      <MemoryRouter>
        <SideSearchFrame />
      </MemoryRouter>
    </Provider>
  );
  return { ...r, store };
}

describe('SideSearchFrame', () => {
  it('lists articles sorted by path with article urls', () => {
    const r = setup();
    const hrefs = Array.from(r.container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href')
    );
    expect(hrefs).toEqual(['/cpp/a.html', '/ruby/b.html']);
    r.unmount();
  });

  it('derives language options from the articles', () => {
    const r = setup();
    const options = Array.from(r.container.querySelectorAll('option')).map(
      (o) => [o.value, o.textContent]
    );
    expect(options).toEqual([
      ['', 'all'],
      ['cpp', 'C++'],
      ['ruby', 'Ruby'],
    ]);
    r.unmount();
  });

  it('filters the list by the selected language', () => {
    const r = setup();
    React.act(() => {
      r.store.dispatch(SearchBoxActions.updateLang('ruby'));
    });
    const titles = Array.from(r.container.querySelectorAll('a')).map(
      (a) => a.textContent
    );
    expect(titles).toEqual(['B']);
    r.unmount();
  });
});
