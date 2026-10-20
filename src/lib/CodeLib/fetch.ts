import config from '../Config';
import { parseCodeLibArticles } from './parse';
import { CodeLibArticle } from './types';

export async function fetchAll(): Promise<Array<CodeLibArticle>> {
  const response = await fetch(
    config.rootDirectory + '/data/codelib_full.json'
  );
  if (!response.ok)
    throw Error(`fetch codelib: fetch failed (status ${response.status})`);
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw Error('fetch codelib: invalid JSON');
  }
  const result = parseCodeLibArticles(json);
  result.invalids.forEach((invalid) =>
    invalid.messages.forEach((m) =>
      console.warn(`codelib article #${invalid.index}: ${m}`)
    )
  );
  if (!result.ok) throw Error(`fetch codelib: ${result.error}`);
  return result.articles;
}
