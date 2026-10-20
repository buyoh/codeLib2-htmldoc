import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAll } from './fetch';
import { rawArticle } from '../../test/fixtures';

function mockFetch(response: Partial<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, ...response })
  );
}

describe('fetchAll', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns decoded articles', async () => {
    mockFetch({ json: async () => [rawArticle({ path: '/a' })] });
    const items = await fetchAll();
    expect(items.map((a) => a.path)).toEqual(['/a']);
  });

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false, status: 404 });
    await expect(fetchAll()).rejects.toThrow('404');
  });

  it('propagates a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(TypeError('Failed to fetch'))
    );
    await expect(fetchAll()).rejects.toThrow('Failed to fetch');
  });

  it('throws when the body is not JSON', async () => {
    mockFetch({
      json: async () => {
        throw SyntaxError('Unexpected token <');
      },
    });
    await expect(fetchAll()).rejects.toThrow('invalid JSON');
  });

  it('warns about invalid articles and returns the rest', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockFetch({
      json: async () => [
        rawArticle({ path: '/a' }),
        rawArticle({ path: '/b' }),
        rawArticle({ path: 'bad' }),
      ],
    });
    const items = await fetchAll();
    expect(items.map((a) => a.path)).toEqual(['/a', '/b']);
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0][0])).toContain('#2');
  });

  it('throws when the data is invalid as a whole', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockFetch({ json: async () => ({}) });
    await expect(fetchAll()).rejects.toThrow('not an array');
  });
});
