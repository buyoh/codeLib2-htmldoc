import config from '../Config';
import { checkCodeLibArticle, CodeLibArticle } from './types';

export async function fetchAll(): Promise<Array<CodeLibArticle>> {
  const responce = await fetch(config.rootDirectory + '/data/codelib_full.json');
  if (!responce.ok)
    throw Error('fetch codelib: fetch failed');
  const json = await responce.json();
  if (!Array.isArray(json) || config.validate && !json.every(checkCodeLibArticle)) {
    setTimeout(() => { alert('type of codelib data validation Error!!'); }, 0);
    throw Error('fetch codelib: type validation Error');
  }
  return json as Array<CodeLibArticle>;
}
