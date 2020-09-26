import { CodeLibArticle } from '../../lib/CodeLib/types';
import { SET_ITEMS, CodeLibActionTypes } from './types';

export function setItems(items: Array<CodeLibArticle>): CodeLibActionTypes {
  return {
    type: SET_ITEMS,
    items
  };
}