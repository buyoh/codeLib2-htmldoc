import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';

const codeLibItem = t.type({
  'title': t.string,
  'overview': t.string,
  'verified': t.string,
  'references': t.array(t.string),
  'words': t.array(t.string),
  'require': t.array(t.string),
  'code': t.string,
  'path': t.string,
});

export type CodeLibItem = t.TypeOf<typeof codeLibItem>;

export function checkCodeLibItem(x: unknown): boolean {
  if (codeLibItem.is(x)) return true;
  console.log(x);
  PathReporter.report(codeLibItem.decode(x)).forEach(t => console.warn(t));
  return false;
}
