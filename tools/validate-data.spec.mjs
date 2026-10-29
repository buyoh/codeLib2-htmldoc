import * as fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCodeLibArticles } from '../src/lib/CodeLib/parse';

// codeLib2-tools (gather) が生成したデータが、表示側のスキーマに適合するかを検証する。
// CODELIB_DATA_PATH が未設定ならスキップする。使い方: pnpm validate-data
const dataPath = process.env.CODELIB_DATA_PATH;

describe.skipIf(!dataPath)('generated data', () => {
  it('contains no invalid article', () => {
    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const result = parseCodeLibArticles(json);
    expect(result.invalids).toEqual([]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.articles.length).toBeGreaterThan(0);
  });
});
