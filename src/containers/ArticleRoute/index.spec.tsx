// @vitest-environment jsdom
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { createRootStore } from '../../stores';
import * as CodeLibActions from '../../stores/codelib/actions';
import ArticleRoute from '.';
import FetchErrorNotice from '../FetchErrorNotice';
import { render, suppressRenderErrorLogs } from '../../test/render';
import { makeArticle } from '../../test/fixtures';

const article = makeArticle({ path: '/cpp/sample', title: 'Sample Title' });

function renderAt(pathname: string, store = createRootStore()) {
  const r = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <FetchErrorNotice />
        <Routes>
          <Route path="*" element={<ArticleRoute />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return { ...r, store };
}

describe('ArticleRoute', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders nothing for an article url while loading', () => {
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchStarted());
    const r = renderAt('/cpp/sample.html', store);
    expect(r.container.textContent).toBe('');
    r.unmount();
  });

  it('renders the article once loaded', () => {
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchStarted());
    const r = renderAt('/cpp/sample.html', store);
    React.act(() => {
      store.dispatch(CodeLibActions.fetchSucceeded([article]));
    });
    expect(r.container.querySelector('h1')?.textContent).toBe('Sample Title');
    r.unmount();
  });

  it('renders not found for an unknown article after loading', () => {
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchSucceeded([article]));
    const r = renderAt('/cpp/unknown.html', store);
    expect(r.container.querySelector('h1')?.textContent).toBe(
      'ページが見つかりません'
    );
    r.unmount();
  });

  it('renders the top page for "/"', () => {
    const r = renderAt('/');
    expect(r.container.querySelector('h1')?.textContent).toBe('doc-codeLib2');
    r.unmount();
  });

  it('shows the fetch error and keeps the article area empty', () => {
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchFailed('fetch codelib: boom'));
    const r = renderAt('/cpp/sample.html', store);
    const alert = r.container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('fetch codelib: boom');
    expect(r.container.querySelector('h1')).toBeNull();
    r.unmount();
  });

  it('does not show the fetch error when loaded', () => {
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchSucceeded([article]));
    const r = renderAt('/', store);
    expect(r.container.querySelector('[role="alert"]')).toBeNull();
    r.unmount();
  });

  it('contains a render error to the article view and recovers on navigation', () => {
    const restoreLogs = suppressRenderErrorLogs();
    try {
      // commits が欠けた不正データ（検証をすり抜けた想定）
      const broken = {
        ...article,
        commits: undefined,
      } as unknown as typeof article;
      const store = createRootStore();
      store.dispatch(CodeLibActions.fetchSucceeded([broken]));
      const r = renderAt('/cpp/sample.html', store);
      expect(r.container.querySelector('h1')?.textContent).toBe(
        '表示に失敗しました'
      );
      const link = r.container.querySelector('a');
      expect(link?.textContent).toBe('トップへ戻る');
      React.act(() => {
        link?.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0,
          })
        );
      });
      expect(r.container.querySelector('h1')?.textContent).toBe('doc-codeLib2');
      r.unmount();
    } finally {
      restoreLogs();
    }
  });

  it('resolves articles and links under the production basename', () => {
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchSucceeded([article]));
    const tree = (pathname: string) => (
      <Provider store={store}>
        <MemoryRouter basename="/codeLib2" initialEntries={[pathname]}>
          <Routes>
            <Route path="*" element={<ArticleRoute />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    const r = render(tree('/codeLib2/cpp/sample.html'));
    expect(r.container.querySelector('h1')?.textContent).toBe('Sample Title');
    r.unmount();

    const r2 = render(tree('/codeLib2/cpp/unknown.html'));
    // react-router は basename 配下の "/" を "/codeLib2" に解決する（Header と同じ）
    expect(r2.container.querySelector('a')?.getAttribute('href')).toBe(
      '/codeLib2'
    );
    r2.unmount();

    const r3 = render(tree('/codeLib2/index.html'));
    expect(r3.container.querySelector('h1')?.textContent).toBe('doc-codeLib2');
    r3.unmount();
  });
});
