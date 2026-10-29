import { describe, expect, it } from 'vitest';
import { parseCodeLibArticles } from './parse';
import { rawArticle } from '../../test/fixtures';

describe('parseCodeLibArticles', () => {
  it('returns all articles when every element is valid', () => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path: '/b' })];
    const result = parseCodeLibArticles(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles.map((a) => a.path)).toEqual(['/a', '/b']);
    expect(result.invalids).toEqual([]);
  });

  it('accepts an empty array', () => {
    const result = parseCodeLibArticles([]);
    expect(result).toEqual({ ok: true, articles: [], invalids: [] });
  });

  it('fails when the data is not an array', () => {
    const result = parseCodeLibArticles({ items: [] });
    expect(result.ok).toBe(false);
  });

  it('excludes invalid elements and reports their index', () => {
    const json = [
      rawArticle({ path: '/a' }),
      rawArticle({ title: 1 }),
      rawArticle({ path: '/c' }),
    ];
    const result = parseCodeLibArticles(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles.map((a) => a.path)).toEqual(['/a', '/c']);
    expect(result.invalids).toHaveLength(1);
    expect(result.invalids[0].index).toBe(1);
    expect(result.invalids[0].messages.join('\n')).toContain('title');
  });

  it('rejects a path that does not start with "/"', () => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path: 'relative' })];
    const result = parseCodeLibArticles(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles.map((a) => a.path)).toEqual(['/a']);
    expect(result.invalids.map((i) => i.index)).toEqual([1]);
  });

  it('accepts a path made of safe segments', () => {
    const result = parseCodeLibArticles([
      rawArticle({ path: '/cpp/a.b/c_d-e' }),
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.invalids).toEqual([]);
  });

  it.each([
    '//evil.example/x',
    '/a//b',
    '/a/',
    '/',
    '/a/../b',
    '/..',
    '/./a',
    '/a b',
    '/a?b',
    '/a#b',
    '/a\\b',
  ])('rejects a path that could escape the root: %s', (path) => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path })];
    const result = parseCodeLibArticles(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.invalids.map((i) => i.index)).toEqual([1]);
  });

  it('keeps optional fields as decoded values', () => {
    const json = [
      rawArticle({ words: ['w'], references: ['https://example.com'] }),
    ];
    const result = parseCodeLibArticles(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles[0].words).toEqual(['w']);
    expect(result.articles[0].references).toEqual(['https://example.com']);
  });

  it('accepts exactly half of the elements being invalid', () => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path: 'x' })];
    expect(parseCodeLibArticles(json).ok).toBe(true);
  });

  it('fails when more than half of the elements are invalid', () => {
    const json = [rawArticle({ path: '/a' }), null, rawArticle({ code: 0 })];
    const result = parseCodeLibArticles(json);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('2/3');
    expect(result.invalids.map((i) => i.index)).toEqual([1, 2]);
  });
});
