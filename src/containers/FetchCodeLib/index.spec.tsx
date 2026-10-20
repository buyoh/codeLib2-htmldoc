// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchCodeLib } from '.';
import CodeLib from '../../lib/CodeLib';
import { render } from '../../test/render';
import { makeArticle } from '../../test/fixtures';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeProps() {
  return {
    onFetchStarted: vi.fn(),
    onFetchSucceeded: vi.fn(),
    onFetchFailed: vi.fn(),
  };
}

async function flush() {
  await React.act(async () => {
    await Promise.resolve();
  });
}

describe('FetchCodeLib', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches started and succeeded', async () => {
    const items = [makeArticle()];
    vi.spyOn(CodeLib, 'fetchAll').mockResolvedValue(items);
    const props = makeProps();
    const r = render(<FetchCodeLib {...props} />);
    expect(props.onFetchStarted).toHaveBeenCalledTimes(1);
    await flush();
    expect(props.onFetchSucceeded).toHaveBeenCalledWith(items);
    expect(props.onFetchFailed).not.toHaveBeenCalled();
    r.unmount();
  });

  it('dispatches failed with the error message instead of throwing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(CodeLib, 'fetchAll').mockRejectedValue(Error('boom'));
    const props = makeProps();
    const r = render(<FetchCodeLib {...props} />);
    await flush();
    expect(props.onFetchFailed).toHaveBeenCalledWith('boom');
    expect(props.onFetchSucceeded).not.toHaveBeenCalled();
    r.unmount();
  });

  it('ignores the result after unmount', async () => {
    const d = deferred<ReturnType<typeof makeArticle>[]>();
    vi.spyOn(CodeLib, 'fetchAll').mockReturnValue(d.promise);
    const props = makeProps();
    const r = render(<FetchCodeLib {...props} />);
    r.unmount();
    d.resolve([makeArticle()]);
    await flush();
    expect(props.onFetchSucceeded).not.toHaveBeenCalled();
  });

  it('ignores a failure after unmount', async () => {
    const d = deferred<ReturnType<typeof makeArticle>[]>();
    vi.spyOn(CodeLib, 'fetchAll').mockReturnValue(d.promise);
    const props = makeProps();
    const r = render(<FetchCodeLib {...props} />);
    r.unmount();
    d.reject(Error('boom'));
    await flush();
    expect(props.onFetchFailed).not.toHaveBeenCalled();
  });

  it('uses only the latest request under StrictMode double mount', async () => {
    const first = deferred<ReturnType<typeof makeArticle>[]>();
    const second = deferred<ReturnType<typeof makeArticle>[]>();
    vi.spyOn(CodeLib, 'fetchAll')
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const props = makeProps();
    const r = render(
      <React.StrictMode>
        <FetchCodeLib {...props} />
      </React.StrictMode>
    );
    const latest = [makeArticle({ path: '/latest' })];
    second.resolve(latest);
    first.resolve([makeArticle({ path: '/stale' })]);
    await flush();
    expect(props.onFetchSucceeded).toHaveBeenCalledTimes(1);
    expect(props.onFetchSucceeded).toHaveBeenCalledWith(latest);
    r.unmount();
  });
});
