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

const articles = [rawArticle({ path: '/cpp/sample', title: 'Sample Title' })];

// fetch を保留し、応答前の画面を確認できるようにする
function stubFetch() {
  let respond: (response: Response | Error) => void = () => undefined;
  const pending = new Promise<Response>((resolve, reject) => {
    respond = (r) => (r instanceof Error ? reject(r) : resolve(r));
  });
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
  return (r: Response | Error) =>
    React.act(async () => {
      respond(r);
      await pending.catch(() => undefined);
    });
}

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
    await respond(Response.json(articles));
    expect(main(r.container)?.textContent).toBe('Sample Title');
    r.unmount();
  });

  it('shows not found for an unknown path only after loading', async () => {
    const respond = stubFetch();
    const r = renderAt('/cpp/unknown.html');
    expect(mainFrame(r.container).textContent).toBe('');
    await respond(Response.json(articles));
    expect(main(r.container)?.textContent).toBe('ページが見つかりません');
    r.unmount();
  });

  it('shows the top page immediately', async () => {
    const respond = stubFetch();
    const r = renderAt('/');
    expect(main(r.container)?.textContent).toBe('doc-codeLib2');
    await respond(Response.json(articles));
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
      await respond(new Error('boom'));
      expect(alertOf(r.container)?.textContent).toContain('boom');
      expect(main(r.container)).toBeNull();
      r.unmount();
    }
  );

  it('notifies a fetch failure on the top page and keeps it shown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const respond = stubFetch();
    const r = renderAt('/');
    await respond(new Response('', { status: 500 }));
    expect(alertOf(r.container)?.textContent).toContain('500');
    expect(main(r.container)?.textContent).toBe('doc-codeLib2');
    r.unmount();
  });

  it('opens an article from the side list without reloading the data', async () => {
    const respond = stubFetch();
    const r = renderAt('/');
    await respond(Response.json(articles));
    const link = [...r.container.querySelectorAll('a')].find(
      (a) => a.textContent === 'Sample Title'
    );
    expect(link?.getAttribute('href')).toBe('/cpp/sample.html');
    React.act(() => {
      link?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      );
    });
    expect(main(r.container)?.textContent).toBe('Sample Title');
    expect(fetch).toHaveBeenCalledTimes(1);
    r.unmount();
  });
});
