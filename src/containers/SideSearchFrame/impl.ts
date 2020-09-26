import { CodeLibArticle } from '../../lib/CodeLib/types';

export function filterCodeLibArticles(items: ReadonlyArray<CodeLibArticle>, keyword: string): Array<CodeLibArticle> {
  if (!keyword) return items.concat();
  let reg = null as RegExp | null;
  try {
    reg = new RegExp(keyword, 'i');
  } catch (e) {
    // 
  }
  if (reg !== null) {
    const re = reg;
    return items.filter(article => (
      re.test(article.path) ||
      article.words?.some(word => re.test(word)) ||
      re.test(article.title)
    ));
  } else
    return items.filter(article => (
      article.path.includes(keyword) ||
      article.words?.some(word => word.includes(keyword)) ||
      article.title.includes(keyword)
    ));
}