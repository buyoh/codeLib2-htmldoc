// @vitest-environment jsdom
import React from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import CodeLibArticleViewer from '.';
import { render } from '../../test/render';
import { makeArticle } from '../../test/fixtures';

function codeOf(overrides: Record<string, unknown>): string | undefined {
  const r = render(
    <MemoryRouter>
      <CodeLibArticleViewer article={makeArticle(overrides)} />
    </MemoryRouter>
  );
  const value = r.container.querySelector('textarea')?.value;
  r.unmount();
  return value;
}

describe('CodeLibArticleViewer', () => {
  it('prepends the article url as a comment to the code', () => {
    expect(window.location.origin).toBe('http://localhost:3000');
    expect(
      codeOf({ path: '/src/cpp/a.hpp', lang: 'cpp', code: 'class Foo {};' })
    ).toBe(
      '// http://localhost:3000/codeLib2/src/cpp/a.hpp.html\nclass Foo {};'
    );
    expect(codeOf({ path: '/src/ruby/a.rb', lang: 'ruby', code: 'p 1' })).toBe(
      '# http://localhost:3000/codeLib2/src/ruby/a.rb.html\np 1'
    );
  });

  it('keeps the code as is for an unknown language', () => {
    expect(codeOf({ lang: 'unknown', code: 'code' })).toBe('code');
  });
});
