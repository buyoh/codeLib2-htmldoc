import { describe, expect, it } from 'vitest';
import { parseCodeLibArticle, parseCodeLibIndex } from './parse';
import { rawArticle } from '../../test/fixtures';

describe('parseCodeLibIndex', () => {
  it('returns all articles when every element is valid', () => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path: '/b' })];
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles.map((a) => a.path)).toEqual(['/a', '/b']);
    expect(result.invalids).toEqual([]);
  });

  it('accepts an empty array', () => {
    const result = parseCodeLibIndex([]);
    expect(result).toEqual({ ok: true, articles: [], invalids: [] });
  });

  it('fails when the data is not an array', () => {
    const result = parseCodeLibIndex({ items: [] });
    expect(result.ok).toBe(false);
  });

  it('excludes invalid elements and reports their index', () => {
    const json = [
      rawArticle({ path: '/a' }),
      rawArticle({ title: 1 }),
      rawArticle({ path: '/c' }),
    ];
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles.map((a) => a.path)).toEqual(['/a', '/c']);
    expect(result.invalids).toHaveLength(1);
    expect(result.invalids[0].index).toBe(1);
    expect(result.invalids[0].messages.join('\n')).toContain('title');
  });

  it('rejects a path that does not start with "/"', () => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path: 'relative' })];
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles.map((a) => a.path)).toEqual(['/a']);
    expect(result.invalids.map((i) => i.index)).toEqual([1]);
  });

  it('accepts a path made of safe segments', () => {
    const result = parseCodeLibIndex([rawArticle({ path: '/cpp/a.b/c_d-e' })]);
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
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.invalids.map((i) => i.index)).toEqual([1]);
  });

  it('keeps optional fields as decoded values', () => {
    const json = [rawArticle({ words: ['w'] })];
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.articles[0].words).toEqual(['w']);
  });

  it('accepts summary-only elements', () => {
    const json = [
      { title: 't', path: '/a', lang: 'cpp', tested_by: [] },
      { title: 't', path: '/b', lang: 'cpp', words: ['w'], tested_by: ['x'] },
    ];
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.invalids).toEqual([]);
  });

  it('accepts exactly half of the elements being invalid', () => {
    const json = [rawArticle({ path: '/a' }), rawArticle({ path: 'x' })];
    expect(parseCodeLibIndex(json).ok).toBe(true);
  });

  it('fails when more than half of the elements are invalid', () => {
    const json = [rawArticle({ path: '/a' }), null, rawArticle({ lang: 0 })];
    const result = parseCodeLibIndex(json);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('2/3');
    expect(result.invalids.map((i) => i.index)).toEqual([1, 2]);
  });
});

describe('parseCodeLibArticle', () => {
  it('returns the article', () => {
    const result = parseCodeLibArticle(rawArticle({ path: '/a', code: 'x' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.article.path).toBe('/a');
    expect(result.article.code).toBe('x');
  });

  it.each([
    ['a missing body field', rawArticle({ code: undefined })],
    ['an invalid path', rawArticle({ path: 'relative' })],
    ['a non-object', [rawArticle()]],
    ['null', null],
  ])('fails on %s', (_, json) => {
    const result = parseCodeLibArticle(json);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).not.toBe('');
  });
});
