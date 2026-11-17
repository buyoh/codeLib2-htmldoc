import config from '../Config';
import { parseCodeLibArticle, parseCodeLibIndex } from './parse';
import { CodeLibArticle, CodeLibArticleSummary } from './types';
import { articleDataPath, INDEX_DATA_PATH } from './url';

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(config.rootDirectory + path);
  if (!response.ok)
    throw Error(`fetch codelib: fetch failed (status ${response.status})`);
  try {
    return await response.json();
  } catch {
    throw Error('fetch codelib: invalid JSON');
  }
}

export async function fetchIndex(): Promise<Array<CodeLibArticleSummary>> {
  const result = parseCodeLibIndex(await fetchJson(INDEX_DATA_PATH));
  result.invalids.forEach((invalid) =>
    invalid.messages.forEach((m) =>
      console.warn(`codelib article #${invalid.index}: ${m}`)
    )
  );
  if (!result.ok) throw Error(`fetch codelib: ${result.error}`);
  return result.articles;
}

// path はインデックスで存在を確認済みのものを渡す
export async function fetchArticle(path: string): Promise<CodeLibArticle> {
  const result = parseCodeLibArticle(await fetchJson(articleDataPath(path)));
  if (!result.ok) throw Error(`fetch codelib: ${result.error}`);
  // 生成の不具合で別の記事を表示しないようにする
  if (result.article.path !== path)
    throw Error(`fetch codelib: article path mismatch: ${path}`);
  return result.article;
}
