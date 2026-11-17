import { CodeLibArticle } from '../../lib/CodeLib/types';
import { articlePathFromUrl } from '../../lib/CodeLib/url';
import {
  ArticleLoadState,
  CodeLibFetchStatus,
} from '../../stores/codelib/types';

export type ArticleView =
  | { kind: 'top' }
  | { kind: 'article'; article: CodeLibArticle }
  | { kind: 'articleError'; error: string }
  | { kind: 'notFound' }
  // 読み込み完了前（またはインデックスの失敗時）。画面は書き換えない
  | { kind: 'pending' };

// トップページとして扱う pathname（実体の index.html への直接アクセスを含む）
const TOP_PATHNAMES: ReadonlySet<string> = new Set(['', '/', '/index.html']);

export function resolveArticleView(
  pathname: string,
  status: CodeLibFetchStatus,
  articlePaths: ReadonlySet<string>,
  articles: Readonly<Record<string, ArticleLoadState>>
): ArticleView {
  if (TOP_PATHNAMES.has(pathname)) return { kind: 'top' };
  const path = articlePathFromUrl(pathname);
  if (path !== null && articlePaths.has(path)) {
    const entry = articles[path];
    if (entry?.status === 'loaded')
      return { kind: 'article', article: entry.article };
    if (entry?.status === 'error')
      return { kind: 'articleError', error: entry.error };
    return { kind: 'pending' };
  }
  if (status === 'loaded') return { kind: 'notFound' };
  return { kind: 'pending' };
}
