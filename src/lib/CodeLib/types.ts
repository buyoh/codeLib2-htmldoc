import * as t from 'io-ts';
import { checkType } from '../helper/checkType';

const codeLibArticle = t.type({
  'title': t.string,
  'overview': t.string,
  'code': t.string,
  'path': t.string,
  'verified': t.union([t.undefined, t.string]),
  'references': t.union([t.undefined, t.array(t.string)]),
  'words': t.union([t.undefined, t.array(t.string)]),
  'require': t.union([t.undefined, t.array(t.string)]),
});

export type CodeLibArticle = t.TypeOf<typeof codeLibArticle>;
export const checkCodeLibArticle = checkType.bind(this, codeLibArticle);
