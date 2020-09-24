import config from '../Config';
import { checkCodeLibItem, CodeLibItem } from './types';

export async function fetchAll(): Promise<Array<CodeLibItem>> {
  const responce = await fetch(config.rootDirectory + '/data/codelib_full.json');
  if (!responce.ok)
    throw Error('fetch codelib: fetch failed');
  const json = await responce.json();
  // TODO: 歯抜けのデータが多すぎる
  // if (!Array.isArray(json) || config.development && !json.every(checkCodeLibItem)) {
  //   throw Error('fetch codelib: type validation Error');
  // }
  return json as Array<CodeLibItem>;
}
