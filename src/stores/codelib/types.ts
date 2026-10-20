import { CodeLibArticle } from '../../lib/CodeLib/types';

export type CodeLibFetchStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CodeLibState {
  items: Array<CodeLibArticle>;
  status: CodeLibFetchStatus;
  error?: string;
}

export const FETCH_STARTED = 'codelib-fetch-started';
export const FETCH_SUCCEEDED = 'codelib-fetch-succeeded';
export const FETCH_FAILED = 'codelib-fetch-failed';

type FetchStartedAction = {
  type: typeof FETCH_STARTED;
};

type FetchSucceededAction = {
  type: typeof FETCH_SUCCEEDED;
  items: Array<CodeLibArticle>;
};

type FetchFailedAction = {
  type: typeof FETCH_FAILED;
  error: string;
};

export type CodeLibActionTypes =
  | FetchStartedAction
  | FetchSucceededAction
  | FetchFailedAction;
