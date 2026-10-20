import { describe, expect, it } from 'vitest';
import { lineCommentPrefix, prependUrlComment } from './code';

describe('lineCommentPrefix', () => {
  it('returns the line comment prefix of known languages', () => {
    expect(lineCommentPrefix('cpp')).toBe('//');
    expect(lineCommentPrefix('rust')).toBe('//');
    expect(lineCommentPrefix('javascript')).toBe('//');
    expect(lineCommentPrefix('ruby')).toBe('#');
  });

  it('returns undefined for unknown languages', () => {
    expect(lineCommentPrefix('unknown')).toBeUndefined();
    expect(lineCommentPrefix('')).toBeUndefined();
    expect(lineCommentPrefix('toString')).toBeUndefined();
  });
});

describe('prependUrlComment', () => {
  const url = 'https://example.com/codeLib2/src/cpp/a.hpp.html';

  it('prepends the url as a C++ comment', () => {
    expect(prependUrlComment('class Foo {};', 'cpp', url)).toBe(
      `// ${url}\nclass Foo {};`
    );
  });

  it('prepends the url as a Ruby comment', () => {
    expect(prependUrlComment('puts 1', 'ruby', url)).toBe(`# ${url}\nputs 1`);
  });

  it('keeps the code as is for unknown languages', () => {
    expect(prependUrlComment('code', 'unknown', url)).toBe('code');
  });
});
