import { CodeLibItem } from '../../lib/CodeLib/types';
import { ADD_ITEMS, CodeLibActionTypes } from './types';

export function addItems(items: Array<CodeLibItem>): CodeLibActionTypes {
  return {
    type: ADD_ITEMS,
    items
  };
}