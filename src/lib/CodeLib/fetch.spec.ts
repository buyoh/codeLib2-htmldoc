import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchArticle, fetchIndex } from './fetch';
import { rawArticle } from '../../test/fixtures';

function mockFetch(response: Partial<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, ...response })
  );
}

describe('fetchIndex', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns decoded articles', async () => {
    mockFetch({ json: async () => [rawArticle({ path: '/a' })] });
    const items = await fetchIndex();
    expect(items.map((a) => a.path)).toEqual(['/a']);
    expect(fetch).toHaveBeenCalledWith('/codeLib2/data/index.json');
  });

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false, status: 404 });
    await expect(fetchIndex()).rejects.toThrow('404');
  });

  it('propagates a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(TypeError('Failed to fetch'))
    );
    await expect(fetchIndex()).rejects.toThrow('Failed to fetch');
  });

  it('throws when the body is not JSON', async () => {
    mockFetch({
      json: async () => {
        throw SyntaxError('Unexpected token <');
      },
    });
    await expect(fetchIndex()).rejects.toThrow('invalid JSON');
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
    const items = await fetchIndex();
    expect(items.map((a) => a.path)).toEqual(['/a', '/b']);
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0][0])).toContain('#2');
  });

  it('throws when the data is invalid as a whole', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockFetch({ json: async () => ({}) });
    await expect(fetchIndex()).rejects.toThrow('not an array');
  });
});

describe('fetchArticle', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches and decodes the article JSON of the path', async () => {
    mockFetch({ json: async () => rawArticle({ path: '/src/a.hpp' }) });
    const article = await fetchArticle('/src/a.hpp');
    expect(article.path).toBe('/src/a.hpp');
    expect(fetch).toHaveBeenCalledWith(
      '/codeLib2/data/articles/src/a.hpp.json'
    );
  });

  it('throws when the response is not ok', async () => {
    mockFetch({ ok: false, status: 404 });
    await expect(fetchArticle('/a')).rejects.toThrow('404');
  });

  it('throws when the article is invalid', async () => {
    mockFetch({ json: async () => rawArticle({ path: '/a', code: 1 }) });
    await expect(fetchArticle('/a')).rejects.toThrow('fetch codelib:');
  });

  it('throws when the article has another path', async () => {
    mockFetch({ json: async () => rawArticle({ path: '/b' }) });
    await expect(fetchArticle('/a')).rejects.toThrow('path mismatch');
  });
});
