import { CodeLibArticle } from '../../lib/CodeLib/types';
import { articlePathFromUrl } from '../../lib/CodeLib/url';
import { CodeLibFetchStatus } from '../../stores/codelib/types';

export type ArticleView =
  | { kind: 'top' }
  | { kind: 'article'; article: CodeLibArticle }
  | { kind: 'notFound' }
  // 読み込み完了前（または失敗時）。画面は書き換えない
  | { kind: 'pending' };

// トップページとして扱う pathname（実体の index.html への直接アクセスを含む）
const TOP_PATHNAMES: ReadonlySet<string> = new Set(['', '/', '/index.html']);

export function resolveArticleView(
  pathname: string,
  status: CodeLibFetchStatus,
  articleMap: ReadonlyMap<string, CodeLibArticle>
): ArticleView {
  if (TOP_PATHNAMES.has(pathname)) return { kind: 'top' };
  const path = articlePathFromUrl(pathname);
  const article = path !== null ? articleMap.get(path) : undefined;
  if (article) return { kind: 'article', article };
  if (status === 'loaded') return { kind: 'notFound' };
  return { kind: 'pending' };
}
