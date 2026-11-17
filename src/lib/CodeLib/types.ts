import * as t from 'io-ts';

interface ArticlePathBrand {
  readonly ArticlePath: unique symbol;
}

// 記事の path は '/' 始まりの相対パス風の文字列に限る（allowlist）。
// '//host' のような外部 URL や '.' '..' セグメントによるパストラバーサルを防ぐ。
// tools/codelib-data.mjs でも同じ条件で検証している
const ARTICLE_PATH_PATTERN = /^\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/;

export function isValidArticlePath(s: string): boolean {
  return (
    ARTICLE_PATH_PATTERN.test(s) &&
    s.split('/').every((seg) => seg !== '.' && seg !== '..')
  );
}

const articlePath = t.brand(
  t.string,
  (s): s is t.Branded<string, ArticlePathBrand> => isValidArticlePath(s),
  'ArticlePath'
);

const codeLibCommit = t.type({
  sha: t.string,
  date: t.string,
  message: t.string,
});

// インデックス（data/index.json）の要素。検索と一覧が使うフィールドのみ。
// tools/codelib-data.mjs の INDEX_FIELDS と揃える
const articleSummaryProps = {
  title: t.string,
  path: articlePath,
  lang: t.string,
  words: t.union([t.undefined, t.array(t.string)]),
  tested_by: t.array(t.string),
};

export const codeLibArticleSummary = t.type(articleSummaryProps);

// 記事ごとの JSON（data/articles/<path>.json）。インデックスのフィールドを含む
export const codeLibArticle = t.type({
  ...articleSummaryProps,
  overview: t.string,
  code: t.string,
  require: t.union([t.undefined, t.string]),
  references: t.union([t.undefined, t.array(t.string)]),
  verified: t.union([t.undefined, t.array(t.string)]),
  commits: t.array(codeLibCommit),
});

export type ArticlePath = t.TypeOf<typeof articlePath>;
export type CodeLibArticleSummary = t.TypeOf<typeof codeLibArticleSummary>;
export type CodeLibArticle = t.TypeOf<typeof codeLibArticle>;
export type CodeLibCommit = t.TypeOf<typeof codeLibCommit>;
