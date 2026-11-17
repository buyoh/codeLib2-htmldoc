import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/PathReporter';
import {
  codeLibArticle,
  CodeLibArticle,
  codeLibArticleSummary,
  CodeLibArticleSummary,
} from './types';

// 不正な記事の割合がこれを超えたら、データ全体を不正とみなす
export const MAX_INVALID_RATIO = 0.5;

export type InvalidArticle = {
  index: number;
  messages: Array<string>;
};

export type ParseResult =
  | {
      ok: true;
      articles: Array<CodeLibArticleSummary>;
      invalids: Array<InvalidArticle>;
    }
  | {
      ok: false;
      error: string;
      invalids: Array<InvalidArticle>;
    };

export type ArticleParseResult =
  | { ok: true; article: CodeLibArticle }
  | { ok: false; error: string };

// インデックスを要素ごとに decode し、不正な要素は除外して報告する
export function parseCodeLibIndex(json: unknown): ParseResult {
  if (!Array.isArray(json))
    return { ok: false, error: 'data is not an array', invalids: [] };

  const articles: Array<CodeLibArticleSummary> = [];
  const invalids: Array<InvalidArticle> = [];
  json.forEach((x: unknown, index) => {
    const d = codeLibArticleSummary.decode(x);
    if (isRight(d)) articles.push(d.right);
    else invalids.push({ index, messages: PathReporter.report(d) });
  });

  if (json.length > 0 && invalids.length / json.length > MAX_INVALID_RATIO)
    return {
      ok: false,
      error: `too many invalid articles (${invalids.length}/${json.length})`,
      invalids,
    };
  return { ok: true, articles, invalids };
}

// 記事ごとの JSON を decode する
export function parseCodeLibArticle(json: unknown): ArticleParseResult {
  const d = codeLibArticle.decode(json);
  if (isRight(d)) return { ok: true, article: d.right };
  return { ok: false, error: PathReporter.report(d).join('; ') };
}
