import { CodeLibArticle } from '../../lib/CodeLib/types';

export interface CodeLibState {
  items: Array<CodeLibArticle>;
}

export const SET_ITEMS = 'codelib-setitems';

type AddCodeLibArticlesAction = {
  type: typeof SET_ITEMS;
  items: Array<CodeLibArticle>;
};

export type CodeLibActionTypes = AddCodeLibArticlesAction;
