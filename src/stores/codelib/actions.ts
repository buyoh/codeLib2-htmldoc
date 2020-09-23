import { ADD_ITEM, CodeLibActionTypes, CodeLibItem } from './types';

export function addItem(item: CodeLibItem): CodeLibActionTypes {
  return {
    type: ADD_ITEM,
    item
  };
}