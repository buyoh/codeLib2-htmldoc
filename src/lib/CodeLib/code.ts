// 言語ごとの行コメントの開始記号。未知の言語は undefined
const LINE_COMMENT_PREFIX: Record<string, string> = {
  c: '//',
  cpp: '//',
  rust: '//',
  javascript: '//',
  typescript: '//',
  java: '//',
  go: '//',
  ruby: '#',
  python: '#',
  sh: '#',
  bash: '#',
};

export function lineCommentPrefix(lang: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(LINE_COMMENT_PREFIX, lang)
    ? LINE_COMMENT_PREFIX[lang]
    : undefined;
}

// コード先頭に、記事 URL を言語の行コメントとして挿入する。
// コメント記法が不明な言語では、コードを壊さないよう挿入しない
export function prependUrlComment(
  code: string,
  lang: string,
  url: string
): string {
  const prefix = lineCommentPrefix(lang);
  if (prefix === undefined) return code;
  return `${prefix} ${url}\n${code}`;
}
