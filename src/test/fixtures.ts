import { isRight } from 'fp-ts/lib/Either';
import { codeLibArticle, CodeLibArticle } from '../lib/CodeLib/types';

// テスト用の記事データ（JSON 相当の素の値）
export function rawArticle(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    title: 'title',
    overview: 'overview',
    code: 'code',
    path: '/cpp/sample',
    lang: 'cpp',
    commits: [{ sha: '0123456789abcdef', date: '2020-01-01', message: 'init' }],
    tested_by: [],
    ...overrides,
  };
}

// codec を通した記事データ
export function makeArticle(
  overrides: Record<string, unknown> = {}
): CodeLibArticle {
  const d = codeLibArticle.decode(rawArticle(overrides));
  if (!isRight(d)) throw Error('invalid test fixture');
  return d.right;
}
