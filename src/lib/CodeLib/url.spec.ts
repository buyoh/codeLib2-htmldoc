import { describe, expect, it } from 'vitest';
import {
  articleAbsoluteUrl,
  articlePathFromUrl,
  articleUrl,
  isExternalUrl,
} from './url';

describe('articleUrl / articlePathFromUrl', () => {
  it('appends .html to the article path', () => {
    expect(articleUrl('/cpp/sample')).toBe('/cpp/sample.html');
  });

  it('round-trips the article path', () => {
    expect(articlePathFromUrl(articleUrl('/cpp/a.b/c'))).toBe('/cpp/a.b/c');
  });

  it('returns null for a non-article url', () => {
    expect(articlePathFromUrl('/cpp/sample')).toBeNull();
    expect(articlePathFromUrl('/')).toBeNull();
  });

  it('decodes percent-encoded pathname', () => {
    expect(articlePathFromUrl('/cpp/%E5%B9%BE%E4%BD%95.html')).toBe(
      '/cpp/幾何'
    );
  });

  it('keeps a malformed percent-encoding as is', () => {
    expect(articlePathFromUrl('/cpp/%E5.html')).toBe('/cpp/%E5');
  });

  it('decodes a raw (unencoded) pathname as is', () => {
    expect(articlePathFromUrl('/cpp/幾何.html')).toBe('/cpp/幾何');
  });

  it('treats ":" and "*" as plain characters', () => {
    expect(articlePathFromUrl('/a/:id/*.html')).toBe('/a/:id/*');
  });

  it.each(['/a/100%', '/a/b#c', '/a/b?c', '/cpp/幾何', '/a/x y'])(
    'round-trips %s without breaking the pathname',
    (path) => {
      const url = articleUrl(path);
      expect(url).not.toMatch(/[#?\s]/);
      expect(new URL(url, 'http://localhost').pathname).toBe(url);
      expect(articlePathFromUrl(url)).toBe(path);
    }
  );
});

describe('isExternalUrl', () => {
  it.each(['http://example.com', 'https://example.com/a?b=c'])(
    'accepts %s',
    (url) => {
      expect(isExternalUrl(url)).toBe(true);
    }
  );

  it.each([
    'httpfoo',
    'http',
    'javascript:alert(1)',
    'ftp://example.com',
    'src/cpp/a',
    '',
  ])('rejects %s', (url) => {
    expect(isExternalUrl(url)).toBe(false);
  });
});

describe('articleAbsoluteUrl', () => {
  it('joins origin, root directory and article url', () => {
    expect(articleAbsoluteUrl('https://example.com', '/src/cpp/a.hpp')).toBe(
      'https://example.com/codeLib2/src/cpp/a.hpp.html'
    );
  });

  it('encodes path segments', () => {
    expect(articleAbsoluteUrl('https://example.com', '/src/a#b')).toBe(
      'https://example.com/codeLib2/src/a%23b.html'
    );
  });
});
