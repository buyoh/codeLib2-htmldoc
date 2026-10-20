import { CodeLibArticle } from '../../lib/CodeLib/types';

export type CodeLibFetchStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CodeLibState {
  items: Array<CodeLibArticle>;
  status: CodeLibFetchStatus;
  error?: string;
}
