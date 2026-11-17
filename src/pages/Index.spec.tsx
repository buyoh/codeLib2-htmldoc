// @vitest-environment jsdom
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Index from './Index';
import Styles from './style.module.scss';
import { createRootStore } from '../stores';
import { render } from '../test/render';
import { rawArticle } from '../test/fixtures';

const sample = rawArticle({ path: '/cpp/sample', title: 'Sample Title' });
const articles = [sample];

const INDEX_URL = '/codeLib2/data/index.json';
const SAMPLE_URL = '/codeLib2/data/articles/cpp/sample.json';

// fetch を URL ごとに保留し、応答前の画面を確認できるようにする。
// 戻り値の関数で、指定した URL に応答する
function stubFetch() {
  const pendings = new Map<
    string,
    { promise: Promise<Response>; settle: (r: Response | Error) => void }
  >();
  const pendingOf = (url: string) => {
    let p = pendings.get(url);
    if (p === undefined) {
      let settle: (r: Response | Error) => void = () => undefined;
      const promise = new Promise<Response>((resolve, reject) => {
        settle = (r) => (r instanceof Error ? reject(r) : resolve(r));
      });
      p = { promise, settle };
      pendings.set(url, p);
    }
    return p;
  };
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => pendingOf(url).promise)
  );
  return (url: string, r: Response | Error) =>
    React.act(async () => {
      const p = pendingOf(url);
      p.settle(r);
      await p.promise.catch(() => undefined);
    });
}

const fetchedUrls = () =>
  vi.mocked(fetch).mock.calls.map(([url]) => String(url));

function renderAt(pathname: string) {
  return render(
    <Provider store={createRootStore()}>
      <MemoryRouter initialEntries={[pathname]}>
        <Index />
      </MemoryRouter>
    </Provider>
  );
}

const mainFrame = (container: HTMLElement) =>
  container.querySelector(`.${Styles.layoutMainPageFrame}`) as HTMLElement;
const main = (container: HTMLElement) =>
  mainFrame(container).querySelector('h1');
const alertOf = (container: HTMLElement) =>
  container.querySelector('[role="alert"]');

describe('Index', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows an article on direct access without showing the top page first', async () => {
    const respond = stubFetch();
    const r = renderAt('/cpp/sample.html');
    expect(mainFrame(r.container).textContent).toBe('');
    await respond(INDEX_URL, Response.json(articles));
    // インデックスのみでは本文を表示しない
    expect(mainFrame(r.container).textContent).toBe('');
    await respond(SAMPLE_URL, Response.json(sample));
    expect(main(r.container)?.textContent).toBe('Sample Title');
    expect(fetchedUrls()).toEqual([INDEX_URL, SAMPLE_URL]);
    r.unmount();
  });

  it('shows not found for an unknown path only after loading', async () => {
    const respond = stubFetch();
    const r = renderAt('/cpp/unknown.html');
    expect(mainFrame(r.container).textContent).toBe('');
    await respond(INDEX_URL, Response.json(articles));
    expect(main(r.container)?.textContent).toBe('ページが見つかりません');
    expect(fetchedUrls()).toEqual([INDEX_URL]);
    r.unmount();
  });

  it('notifies an article fetch failure in the article area', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const respond = stubFetch();
    const r = renderAt('/cpp/sample.html');
    await respond(INDEX_URL, Response.json(articles));
    await respond(SAMPLE_URL, new Response('', { status: 404 }));
    expect(alertOf(r.container)?.textContent).toContain('404');
    expect(main(r.container)).toBeNull();
    r.unmount();
  });

  it('shows the top page immediately', async () => {
    const respond = stubFetch();
    const r = renderAt('/');
    expect(main(r.container)?.textContent).toBe('doc-codeLib2');
    await respond(INDEX_URL, Response.json(articles));
    expect(main(r.container)?.textContent).toBe('doc-codeLib2');
    expect(r.container.textContent).toContain('Sample Title');
    r.unmount();
  });

  it.each(['/cpp/sample.html', '/cpp/unknown.html'])(
    'notifies a fetch failure and keeps the article area empty: %s',
    async (pathname) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const respond = stubFetch();
      const r = renderAt(pathname);
      await respond(INDEX_URL, new Error('boom'));
      expect(alertOf(r.container)?.textContent).toContain('boom');
      expect(main(r.container)).toBeNull();
      r.unmount();
    }
  );

  it('notifies a fetch failure on the top page and keeps it shown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const respond = stubFetch();
    const r = renderAt('/');
    await respond(INDEX_URL, new Response('', { status: 500 }));
    expect(alertOf(r.container)?.textContent).toContain('500');
    expect(main(r.container)?.textContent).toBe('doc-codeLib2');
    r.unmount();
  });

  it('uses no global utility class or inline style', async () => {
    const respond = stubFetch();
    const r = renderAt('/cpp/sample.html');
    await respond(INDEX_URL, Response.json(articles));
    await respond(SAMPLE_URL, Response.json(sample));
    expect(main(r.container)?.textContent).toBe('Sample Title');
    expect(
      r.container.querySelector(
        [
          '.flex, .fixedFlex, .row, .row-reverse, .cols, .nooverflow',
          '.scrollableY, .scrollableX, .left, .right, .clear',
          '.badge, .text, .display, [style]',
        ].join(', ')
      )
    ).toBeNull();
    r.unmount();
  });

  it('opens an article from the side list, loading only its data', async () => {
    const respond = stubFetch();
    const r = renderAt('/');
    await respond(INDEX_URL, Response.json(articles));
    const link = [...r.container.querySelectorAll('a')].find(
      (a) => a.textContent === 'Sample Title'
    );
    expect(link?.getAttribute('href')).toBe('/cpp/sample.html');
    React.act(() => {
      link?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      );
    });
    // 記事の応答までは前の表示のまま
    expect(main(r.container)?.textContent).toBe('doc-codeLib2');
    await respond(SAMPLE_URL, Response.json(sample));
    expect(main(r.container)?.textContent).toBe('Sample Title');
    expect(fetchedUrls()).toEqual([INDEX_URL, SAMPLE_URL]);
    r.unmount();
  });
});
