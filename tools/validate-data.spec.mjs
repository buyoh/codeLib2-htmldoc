import { describe, expect, it } from 'vitest';
import {
  buildDataFiles,
  INDEX_FILE,
  articleDataFile,
  readArticles,
} from './codelib-data.mjs';
import {
  parseCodeLibArticle,
  parseCodeLibIndex,
} from '../src/lib/CodeLib/parse';

// codeLib2-tools (gather) が生成したデータを分割し、公開されるファイルが表示側のスキーマに適合するかを検証する。
// CODELIB_PUBLIC_PATH（入力 data/codelib_full.json を置いた public）が未設定ならスキップする。
// 使い方: pnpm validate-data
const publicPath = process.env.CODELIB_PUBLIC_PATH;

describe.skipIf(!publicPath)('generated data', () => {
  it('contains no invalid article', () => {
    const articles = readArticles(publicPath);
    const files = buildDataFiles(articles);

    const index = parseCodeLibIndex(JSON.parse(files.get(INDEX_FILE)));
    expect(index.invalids).toEqual([]);
    expect(index.ok).toBe(true);
    if (index.ok) expect(index.articles.length).toBeGreaterThan(0);

    const invalids = articles
      .map((a) => ({
        path: a.path,
        result: parseCodeLibArticle(
          JSON.parse(files.get(articleDataFile(a.path)))
        ),
      }))
      .filter(({ path, result }) => !result.ok || result.article.path !== path)
      .map(({ path, result }) => ({
        path,
        error: result.ok ? '' : result.error,
      }));
    expect(invalids).toEqual([]);
  });
});
