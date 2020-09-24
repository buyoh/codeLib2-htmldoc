import * as t from 'io-ts';
import { checkType } from '../helper/checkType';

const codeLibItem = t.type({
  'title': t.string,
  'overview': t.string,
  'code': t.string,
  'path': t.string,
  'verified': t.union([t.undefined, t.string]),
  'references': t.union([t.undefined, t.array(t.string)]),
  'words': t.union([t.undefined, t.array(t.string)]),
  'require': t.union([t.undefined, t.array(t.string)]),
});

export type CodeLibItem = t.TypeOf<typeof codeLibItem>;
export const checkCodeLibItem = checkType.bind(this, codeLibItem);
