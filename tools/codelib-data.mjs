// codeLib2-tools (gather) が出力した codelib_full.json を、インデックスと記事ごとの JSON に分割する。
// 読み込み・検証・分割・衝突検査のみを行い、ファイルへの書き込みは呼び出し側が行う。
// パスはすべて public（または出力先）からの '/' 区切りの相対パス。
import * as fs from 'node:fs';
import * as path from 'node:path';

export const INPUT_FILE = 'data/codelib_full.json';
export const INDEX_FILE = 'data/index.json';
export const ARTICLES_DIR = 'data/articles';
// src/lib/CodeLib/types.ts の codeLibArticleSummary と同じフィールド
const INDEX_FIELDS = ['title', 'path', 'lang', 'words', 'tested_by'];

// src/lib/CodeLib/types.ts の isValidArticlePath と同じ条件
const ARTICLE_PATH_PATTERN = /^\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/;

// 利用者の入力やデータの不備を表す。CLI はメッセージのみを出して終了する
export class DataError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// types.ts と同じ条件に、文字列型の確認を加える（入力は decode 前の値のため）
export function isValidArticlePath(p) {
  return (
    typeof p === 'string' &&
    ARTICLE_PATH_PATTERN.test(p) &&
    p.split('/').every((seg) => seg !== '.' && seg !== '..')
  );
}

// 入力を読み、配列であることと全要素の path を検証して返す。不正なら DataError。
// 不正なバイト列は置換せずにエラーにする。ファイルがなければ code は 'ENOENT'
export function readArticles(publicPath) {
  let articles;
  try {
    const bytes = fs.readFileSync(path.join(publicPath, INPUT_FILE));
    articles = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    );
  } catch (e) {
    throw new DataError(`invalid data: ${e.message}`, e.code);
  }
  if (!Array.isArray(articles))
    throw new DataError('invalid data: codelib_full.json must be an array');
  const invalidPaths = articles
    .map((a) => (a !== null && typeof a === 'object' ? a.path : undefined))
    .filter((p) => !isValidArticlePath(p));
  if (invalidPaths.length > 0)
    throw new DataError(
      `invalid article path: ${JSON.stringify(invalidPaths)}`
    );
  return articles;
}

export function articleDataFile(articlePath) {
  return `${ARTICLES_DIR}${articlePath}.json`;
}

// 記事の配列から Map<出力先の相対パス, JSON 文字列> を作る。path の重複は DataError
export function buildDataFiles(articles) {
  const seen = new Set();
  const duplicates = new Set();
  for (const { path: p } of articles) {
    if (seen.has(p)) duplicates.add(p);
    seen.add(p);
  }
  if (duplicates.size > 0)
    throw new DataError(
      `article destination already exists: ${JSON.stringify([...duplicates])}`
    );

  const index = articles.map((a) =>
    Object.fromEntries(INDEX_FIELDS.map((key) => [key, a[key]]))
  );
  const files = new Map([[INDEX_FILE, JSON.stringify(index)]]);
  for (const a of articles)
    files.set(articleDataFile(a.path), JSON.stringify(a));
  return files;
}

// 重複、および別の作成先を親ディレクトリに持つ作成先を返す
export function findDestinationConflicts(destinations) {
  const all = new Set();
  const conflicts = new Set();
  for (const d of destinations) {
    if (all.has(d)) conflicts.add(d);
    all.add(d);
  }
  for (const d of all) {
    for (let p = path.posix.dirname(d); p !== '.'; p = path.posix.dirname(p))
      if (all.has(p)) conflicts.add(d);
  }
  return [...conflicts];
}
