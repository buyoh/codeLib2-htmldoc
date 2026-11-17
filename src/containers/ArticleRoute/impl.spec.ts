import { describe, expect, it } from 'vitest';
import { resolveArticleView } from './impl';
import { makeArticle } from '../../test/fixtures';
import { ArticleLoadState } from '../../stores/codelib/types';

const article = makeArticle({ path: '/cpp/sample' });
const paths: ReadonlySet<string> = new Set([article.path]);
const loaded: Record<string, ArticleLoadState> = {
  [article.path]: { status: 'loaded', article },
};
const noPaths: ReadonlySet<string> = new Set();

describe('resolveArticleView', () => {
  it('shows the top page for "/" regardless of status', () => {
    expect(resolveArticleView('/', 'loading', noPaths, {})).toEqual({
      kind: 'top',
    });
    expect(resolveArticleView('/', 'error', noPaths, {})).toEqual({
      kind: 'top',
    });
  });

  it('shows the top page for "/index.html"', () => {
    expect(resolveArticleView('/index.html', 'loaded', paths, loaded)).toEqual({
      kind: 'top',
    });
  });

  it('shows the article when loaded', () => {
    expect(
      resolveArticleView('/cpp/sample.html', 'loaded', paths, loaded)
    ).toEqual({ kind: 'article', article });
  });

  it.each([
    ['not requested yet', {}],
    ['loading', { [article.path]: { status: 'loading' } }],
  ] as const)('stays pending while the article is %s', (_, articles) => {
    expect(
      resolveArticleView('/cpp/sample.html', 'loaded', paths, articles)
    ).toEqual({ kind: 'pending' });
  });

  it('shows the error of the article', () => {
    expect(
      resolveArticleView('/cpp/sample.html', 'loaded', paths, {
        [article.path]: { status: 'error', error: 'boom' },
      })
    ).toEqual({ kind: 'articleError', error: 'boom' });
  });

  it.each(['idle', 'loading', 'error'] as const)(
    'stays pending while the index is %s',
    (status) => {
      expect(
        resolveArticleView('/cpp/sample.html', status, noPaths, {})
      ).toEqual({ kind: 'pending' });
    }
  );

  it('shows not found for an unknown article after loading', () => {
    expect(
      resolveArticleView('/cpp/unknown.html', 'loaded', paths, loaded)
    ).toEqual({ kind: 'notFound' });
  });

  it('shows not found for a non-article url after loading', () => {
    expect(resolveArticleView('/cpp/sample', 'loaded', paths, loaded)).toEqual({
      kind: 'notFound',
    });
  });

  it('ignores a loaded article that is not in the index', () => {
    expect(
      resolveArticleView('/cpp/sample.html', 'loaded', noPaths, loaded)
    ).toEqual({ kind: 'notFound' });
  });
});
