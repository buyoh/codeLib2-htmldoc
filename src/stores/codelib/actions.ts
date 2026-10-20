import { CodeLibArticle } from '../../lib/CodeLib/types';
import {
  FETCH_FAILED,
  FETCH_STARTED,
  FETCH_SUCCEEDED,
  CodeLibActionTypes,
} from './types';

export function fetchStarted(): CodeLibActionTypes {
  return {
    type: FETCH_STARTED,
  };
}

export function fetchSucceeded(
  items: Array<CodeLibArticle>
): CodeLibActionTypes {
  return {
    type: FETCH_SUCCEEDED,
    items,
  };
}

export function fetchFailed(error: string): CodeLibActionTypes {
  return {
    type: FETCH_FAILED,
    error,
  };
}
