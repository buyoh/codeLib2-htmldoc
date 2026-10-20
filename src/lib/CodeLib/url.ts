import Config from '../Config';

const ARTICLE_URL_SUFFIX = '.html';

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// 記事の path から、ルータ上の URL を生成する。
// '%' '#' '?' 等が pathname 以外として解釈されないよう、セグメント単位でエンコードする
export function articleUrl(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/') + ARTICLE_URL_SUFFIX;
}

// ルータ上の URL (pathname) から記事の path を取り出す。記事 URL でなければ null
export function articlePathFromUrl(pathname: string): string | null {
  if (!pathname.endsWith(ARTICLE_URL_SUFFIX)) return null;
  return pathname
    .slice(0, -ARTICLE_URL_SUFFIX.length)
    .split('/')
    .map(decodeSegment)
    .join('/');
}

// http / https の絶対 URL のみ true
export function isExternalUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// 記事ページの絶対 URL (例: https://hostname/codeLib2/src/cpp/a.hpp.html)
export function articleAbsoluteUrl(origin: string, path: string): string {
  return origin + Config.rootDirectory + articleUrl(path);
}
