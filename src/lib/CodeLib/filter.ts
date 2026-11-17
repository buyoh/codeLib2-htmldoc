import { CodeLibArticleSummary } from './types';

function testArticleByLang(a: CodeLibArticleSummary, lang: string) {
  return !lang || a.lang === lang;
}

function testArticleByKeyRe(a: CodeLibArticleSummary, re: RegExp) {
  return (
    re.test(a.path) ||
    a.words?.some((word) => re.test(word)) ||
    re.test(a.title)
  );
}

function testArticleByKeyStr(a: CodeLibArticleSummary, key: string) {
  return (
    a.path.includes(key) ||
    a.words?.some((word) => word.includes(key)) ||
    a.title.includes(key)
  );
}

export function filterCodeLibArticles(
  items: ReadonlyArray<CodeLibArticleSummary>,
  keyword: string,
  lang: string
): Array<CodeLibArticleSummary> {
  if (!keyword)
    return items.filter((article) => testArticleByLang(article, lang));
  let reg: RegExp | null = null;
  try {
    reg = new RegExp(keyword, 'i');
  } catch {
    //
  }
  if (reg !== null) {
    const re = reg;
    return items.filter(
      (article) =>
        testArticleByLang(article, lang) && testArticleByKeyRe(article, re)
    );
  } else
    return items.filter(
      (article) =>
        testArticleByLang(article, lang) &&
        testArticleByKeyStr(article, keyword)
    );
}
