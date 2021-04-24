import { CodeLibArticle } from '../../lib/CodeLib/types';

function testArticleByLang(a: CodeLibArticle, lang: string) {
  return !lang || a.lang === lang;
}

function testArticleByKeyRe(a: CodeLibArticle, re: RegExp) {
  return (
    re.test(a.path) ||
    a.words?.some((word) => re.test(word)) ||
    re.test(a.title)
  );
}

function testArticleByKeyStr(a: CodeLibArticle, key: string) {
  return (
    a.path.includes(key) ||
    a.words?.some((word) => word.includes(key)) ||
    a.title.includes(key)
  );
}

export function filterCodeLibArticles(
  items: ReadonlyArray<CodeLibArticle>,
  keyword: string,
  lang: string
): Array<CodeLibArticle> {
  if (!keyword)
    return items.filter((article) => testArticleByLang(article, lang));
  let reg = null as RegExp | null;
  try {
    reg = new RegExp(keyword, 'i');
  } catch (e) {
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
