import { describe, expect, it } from 'vitest';
import { resolveArticleView } from './impl';
import { makeArticle } from '../../test/fixtures';

const article = makeArticle({ path: '/cpp/sample' });
const map = new Map([[article.path, article]]);
const empty = new Map();

describe('resolveArticleView', () => {
  it('shows the top page for "/" regardless of status', () => {
    expect(resolveArticleView('/', 'loading', empty)).toEqual({ kind: 'top' });
    expect(resolveArticleView('/', 'error', empty)).toEqual({ kind: 'top' });
  });

  it('shows the top page for "/index.html"', () => {
    expect(resolveArticleView('/index.html', 'loaded', map)).toEqual({
      kind: 'top',
    });
  });

  it('shows the article when found', () => {
    expect(resolveArticleView('/cpp/sample.html', 'loaded', map)).toEqual({
      kind: 'article',
      article,
    });
  });

  it.each(['idle', 'loading', 'error'] as const)(
    'stays pending while %s',
    (status) => {
      expect(resolveArticleView('/cpp/sample.html', status, empty)).toEqual({
        kind: 'pending',
      });
    }
  );

  it('shows not found for an unknown article after loading', () => {
    expect(resolveArticleView('/cpp/unknown.html', 'loaded', map)).toEqual({
      kind: 'notFound',
    });
  });

  it('shows not found for a non-article url after loading', () => {
    expect(resolveArticleView('/cpp/sample', 'loaded', map)).toEqual({
      kind: 'notFound',
    });
  });
});
