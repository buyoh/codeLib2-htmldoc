import * as t from 'io-ts';

interface ArticlePathBrand {
  readonly ArticlePath: unique symbol;
}

// 記事の path は '/' 始まりであることを codec で保証する
const articlePath = t.brand(
  t.string,
  (s): s is t.Branded<string, ArticlePathBrand> => s.startsWith('/'),
  'ArticlePath'
);

const codeLibCommit = t.type({
  sha: t.string,
  date: t.string,
  message: t.string,
});

export const codeLibArticle = t.type({
  title: t.string,
  overview: t.string,
  code: t.string,
  path: articlePath,
  lang: t.string,
  require: t.union([t.undefined, t.string]),
  references: t.union([t.undefined, t.array(t.string)]),
  words: t.union([t.undefined, t.array(t.string)]),
  verified: t.union([t.undefined, t.array(t.string)]),
  commits: t.array(codeLibCommit),
  tested_by: t.array(t.string),
});

export type ArticlePath = t.TypeOf<typeof articlePath>;
export type CodeLibArticle = t.TypeOf<typeof codeLibArticle>;
export type CodeLibCommit = t.TypeOf<typeof codeLibCommit>;
