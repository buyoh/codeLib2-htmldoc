import React from 'react';
import ExternalLink from '../ExternalLink';
import { Link } from 'react-router-dom';

function prependSlash(text: string): string {
  return text.startsWith('/') ? text : '/' + text;
}

export function convertToReferenceList(texts: Array<string>): JSX.Element {
  return (
    <ul>
      {texts.map((line) => (
        <li key={line}>
          {line.startsWith('http') ? (
            <ExternalLink to={line}>{line}</ExternalLink>
          ) : (
            `${line}\n`
          )}
        </li>
      ))}
    </ul>
  );
}

export function convertToRequireList(text: string): JSX.Element {
  const dom: Array<{ link: boolean; text: string; key: string }> = [];
  const re = /src\/[0-9a-zA-Z/._-]+/g;
  let m: RegExpExecArray | null = null;
  let lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    const l = m[0].length;
    const nt = text.slice(lastIndex, m.index);
    const lt = text.slice(m.index, m.index + l);
    dom.push({ link: false, text: nt, key: nt + lt });
    dom.push({ link: true, text: lt, key: lt + nt });
    lastIndex = m.index + l;
  }
  dom.push({
    link: false,
    text: text.slice(lastIndex),
    key: text.slice(lastIndex),
  });

  return (
    <div>
      {dom.map((e) =>
        e.link ? (
          <Link to={prependSlash(e.text) + '.html'} key={e.key}>
            {e.text}
          </Link>
        ) : (
          e.text
        )
      )}
    </div>
  );
}
