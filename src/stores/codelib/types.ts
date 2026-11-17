import { CodeLibArticle, CodeLibArticleSummary } from '../../lib/CodeLib/types';

export type CodeLibFetchStatus = 'idle' | 'loading' | 'loaded' | 'error';

// 記事ごとの JSON の読み込み状態
export type ArticleLoadState =
  | { status: 'loading' }
  | { status: 'loaded'; article: CodeLibArticle }
  | { status: 'error'; error: string };

export interface CodeLibState {
  // インデックスとその読み込み状態
  items: Array<CodeLibArticleSummary>;
  status: CodeLibFetchStatus;
  error?: string;
  // 記事の path をキーとする記事本体。キーは '/' で始まるので Object.prototype と衝突しない
  articles: Record<string, ArticleLoadState>;
}
