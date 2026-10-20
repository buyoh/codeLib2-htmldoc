import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/PathReporter';
import { codeLibArticle, CodeLibArticle } from './types';

// 不正な記事の割合がこれを超えたら、データ全体を不正とみなす
export const MAX_INVALID_RATIO = 0.5;

export type InvalidArticle = {
  index: number;
  messages: Array<string>;
};

export type ParseResult =
  | {
      ok: true;
      articles: Array<CodeLibArticle>;
      invalids: Array<InvalidArticle>;
    }
  | {
      ok: false;
      error: string;
      invalids: Array<InvalidArticle>;
    };

// 要素ごとに decode し、不正な要素は除外して報告する
export function parseCodeLibArticles(json: unknown): ParseResult {
  if (!Array.isArray(json))
    return { ok: false, error: 'data is not an array', invalids: [] };

  const articles: Array<CodeLibArticle> = [];
  const invalids: Array<InvalidArticle> = [];
  json.forEach((x: unknown, index) => {
    const d = codeLibArticle.decode(x);
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
