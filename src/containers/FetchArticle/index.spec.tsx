// @vitest-environment jsdom
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import {
  MemoryRouter,
  NavigateFunction,
  Route,
  Routes,
  useNavigate,
} from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FetchArticle from '.';
import ArticleRoute from '../ArticleRoute';
import CodeLib from '../../lib/CodeLib';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import { createRootStore } from '../../stores';
import * as CodeLibActions from '../../stores/codelib/actions';
import { render } from '../../test/render';
import { makeArticle } from '../../test/fixtures';

const sample = makeArticle({ path: '/cpp/sample', title: 'Sample Title' });
const other = makeArticle({ path: '/cpp/other', title: 'Other Title' });

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function flush() {
  await React.act(async () => {
    await Promise.resolve();
  });
}

const router: { navigate?: NavigateFunction } = {};
function CaptureNavigate(): null {
  const navigate = useNavigate();
  useEffect(() => {
    router.navigate = navigate;
  }, [navigate]);
  return null;
}

function navigateTo(pathname: string) {
  React.act(() => {
    void router.navigate?.(pathname);
  });
}

function indexedStore() {
  const store = createRootStore();
  store.dispatch(CodeLibActions.fetchSucceeded([sample, other]));
  return store;
}

function renderAt(
  pathname: string,
  store = indexedStore(),
  { strict = false } = {}
) {
  const tree = (
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <CaptureNavigate />
        <FetchArticle />
        <Routes>
          <Route path="*" element={<ArticleRoute />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  const r = render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);
  return { ...r, store };
}

const h1 = (container: HTMLElement) =>
  container.querySelector('h1')?.textContent;
const alertOf = (container: HTMLElement) =>
  container.querySelector('[role="alert"]');

describe('FetchArticle', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('fetches the article of an indexed article url', async () => {
    const spy = vi.spyOn(CodeLib, 'fetchArticle').mockResolvedValue(sample);
    const r = renderAt('/cpp/sample.html');
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/cpp/sample');
    expect(r.store.getState().codeLib.articles['/cpp/sample']).toEqual({
      status: 'loaded',
      article: sample,
    });
    expect(h1(r.container)).toBe('Sample Title');
    r.unmount();
  });

  it.each(['/cpp/unknown.html', '/cpp/sample', '/'])(
    'does not fetch for %s',
    async (pathname) => {
      const spy = vi.spyOn(CodeLib, 'fetchArticle').mockResolvedValue(sample);
      const r = renderAt(pathname);
      await flush();
      expect(spy).not.toHaveBeenCalled();
      r.unmount();
    }
  );

  it('waits for the index before fetching', async () => {
    const spy = vi.spyOn(CodeLib, 'fetchArticle').mockResolvedValue(sample);
    const store = createRootStore();
    store.dispatch(CodeLibActions.fetchStarted());
    const r = renderAt('/cpp/sample.html', store);
    await flush();
    expect(spy).not.toHaveBeenCalled();
    React.act(() => {
      store.dispatch(CodeLibActions.fetchSucceeded([sample]));
    });
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(h1(r.container)).toBe('Sample Title');
    r.unmount();
  });

  it('fetches only once under StrictMode', async () => {
    const spy = vi.spyOn(CodeLib, 'fetchArticle').mockResolvedValue(sample);
    const r = renderAt('/cpp/sample.html', indexedStore(), { strict: true });
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(h1(r.container)).toBe('Sample Title');
    r.unmount();
  });

  it('does not refetch an article that is already loaded', async () => {
    const spy = vi
      .spyOn(CodeLib, 'fetchArticle')
      .mockImplementation(async (path) =>
        path === sample.path ? sample : other
      );
    const r = renderAt('/cpp/sample.html');
    await flush();
    navigateTo('/cpp/other.html');
    await flush();
    navigateTo('/cpp/sample.html');
    await flush();
    expect(spy.mock.calls.map(([p]) => p)).toEqual([
      '/cpp/sample',
      '/cpp/other',
    ]);
    expect(h1(r.container)).toBe('Sample Title');
    r.unmount();
  });

  it('refetches a failed article after leaving it, without showing the old error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const retry = deferred<CodeLibArticle>();
    const spy = vi
      .spyOn(CodeLib, 'fetchArticle')
      .mockRejectedValueOnce(Error('boom'))
      .mockReturnValueOnce(retry.promise);
    const r = renderAt('/cpp/sample.html');
    await flush();
    expect(alertOf(r.container)?.textContent).toContain('boom');

    navigateTo('/');
    expect(h1(r.container)).toBe('doc-codeLib2');
    navigateTo('/cpp/sample.html');
    expect(spy).toHaveBeenCalledTimes(2);
    // 再取得中は失敗通知を出さず、直前のトップを表示し続ける
    expect(alertOf(r.container)).toBeNull();
    expect(h1(r.container)).toBe('doc-codeLib2');

    retry.resolve(sample);
    await flush();
    expect(h1(r.container)).toBe('Sample Title');
    r.unmount();
  });

  it('shows a failure that arrives after leaving, without refetching on return', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const first = deferred<CodeLibArticle>();
    const spy = vi
      .spyOn(CodeLib, 'fetchArticle')
      .mockReturnValueOnce(first.promise);
    const r = renderAt('/cpp/sample.html');
    navigateTo('/');
    first.reject(Error('boom'));
    await flush();
    navigateTo('/cpp/sample.html');
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(alertOf(r.container)?.textContent).toContain('boom');
    r.unmount();
  });

  it('stores a late response under its own path without changing the view', async () => {
    const late = deferred<CodeLibArticle>();
    vi.spyOn(CodeLib, 'fetchArticle').mockImplementation((path) =>
      path === sample.path ? late.promise : Promise.resolve(other)
    );
    const r = renderAt('/cpp/sample.html');
    navigateTo('/cpp/other.html');
    await flush();
    expect(h1(r.container)).toBe('Other Title');

    late.resolve(sample);
    await flush();
    expect(h1(r.container)).toBe('Other Title');
    expect(r.store.getState().codeLib.articles['/cpp/sample']).toEqual({
      status: 'loaded',
      article: sample,
    });
    r.unmount();
  });

  it('does not keep the old failure while refetching after an unsettled visit', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const retry = deferred<CodeLibArticle>();
    const pendingOther = deferred<CodeLibArticle>();
    vi.spyOn(CodeLib, 'fetchArticle')
      .mockRejectedValueOnce(Error('boom'))
      .mockReturnValueOnce(pendingOther.promise)
      .mockReturnValueOnce(retry.promise);
    const r = renderAt('/cpp/sample.html');
    await flush();
    expect(alertOf(r.container)?.textContent).toContain('boom');

    // 取得中の記事へ移ると、確定するまで失敗通知が残る（直前の表示の維持）
    navigateTo('/cpp/other.html');
    expect(alertOf(r.container)?.textContent).toContain('boom');
    // その記事の確定前に戻ると、再取得中は古い失敗通知を出さない
    navigateTo('/cpp/sample.html');
    expect(alertOf(r.container)).toBeNull();

    retry.resolve(sample);
    await flush();
    expect(h1(r.container)).toBe('Sample Title');
    r.unmount();
  });
});
