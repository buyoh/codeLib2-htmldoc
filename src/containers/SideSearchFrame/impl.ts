import { CodeLibArticle } from '../../lib/CodeLib/types';

export function filterCodeLibArticles(items: ReadonlyArray<CodeLibArticle>, keyword: string): Array<CodeLibArticle> {
  if (!keyword) return items.concat();
  return items.filter(article => (
    article.path.includes(keyword) ||
    article.words?.some(word => word.includes(keyword)) ||
    article.title.includes(keyword)
  ));
}