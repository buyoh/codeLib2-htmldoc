import { isRight } from 'fp-ts/lib/Either';
import { describe, expect, it } from 'vitest';
import { filterCodeLibArticles } from './filter';
import { codeLibArticleSummary, CodeLibArticleSummary } from './types';
import { makeArticle } from '../../test/fixtures';

const items = [
  makeArticle({ path: '/cpp/segtree', title: 'セグメント木', lang: 'cpp' }),
  makeArticle({
    path: '/ruby/prime',
    title: '素数',
    lang: 'ruby',
    words: ['sieve'],
  }),
];

describe('filterCodeLibArticles', () => {
  it('filters by language only when keyword is empty', () => {
    expect(filterCodeLibArticles(items, '', 'ruby')).toEqual([items[1]]);
    expect(filterCodeLibArticles(items, '', '')).toEqual(items);
  });

  it('matches keyword as a case-insensitive regular expression', () => {
    expect(filterCodeLibArticles(items, 'SEG.*', '')).toEqual([items[0]]);
    expect(filterCodeLibArticles(items, '^sie', '')).toEqual([items[1]]);
  });

  it('falls back to substring match for an invalid regular expression', () => {
    const withParen = makeArticle({ path: '/x', title: 'f(' });
    expect(filterCodeLibArticles([...items, withParen], 'f(', '')).toEqual([
      withParen,
    ]);
  });
});

describe('filterCodeLibArticles with summaries', () => {
  // インデックスと同じく、summary のフィールドのみを持つ要素
  function summary(raw: Record<string, unknown>): CodeLibArticleSummary {
    const d = codeLibArticleSummary.decode({ tested_by: [], ...raw });
    if (!isRight(d)) throw Error('invalid test fixture');
    return d.right;
  }

  it('searches summary-only items', () => {
    const summaries = [
      summary({ title: 'A', path: '/cpp/a', lang: 'cpp', words: ['w'] }),
      summary({ title: 'B', path: '/ruby/b', lang: 'ruby' }),
    ];
    expect(filterCodeLibArticles(summaries, 'w', '')).toEqual([summaries[0]]);
    expect(filterCodeLibArticles(summaries, 'b', 'ruby')).toEqual([
      summaries[1],
    ]);
  });
});
