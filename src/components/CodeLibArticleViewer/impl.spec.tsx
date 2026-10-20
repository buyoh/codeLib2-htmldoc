// @vitest-environment jsdom
import React from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi, MockInstance } from 'vitest';
import { convertToReferenceList, convertToRequireList } from './impl';
import { render } from '../../test/render';

function markup(element: JSX.Element): string {
  const r = render(<MemoryRouter>{element}</MemoryRouter>);
  const html = r.container.innerHTML;
  r.unmount();
  return html;
}

function keyWarnings(spy: MockInstance): Array<unknown> {
  return spy.mock.calls.filter((args) => String(args[0]).includes('"key"'));
}

describe('convertToReferenceList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('links only http(s) urls', () => {
    const html = markup(
      convertToReferenceList([
        'https://example.com/a',
        'httpfoo',
        'javascript:alert(1)',
      ])
    );
    expect(html).toContain('href="https://example.com/a"');
    expect(html).not.toContain('href="httpfoo"');
    expect(html).not.toContain('href="javascript');
    expect(html).toContain('httpfoo');
  });

  it('does not warn about duplicate keys for repeated lines', () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const html = markup(convertToReferenceList(['same', 'same']));
    expect(html.match(/<li>/g)).toHaveLength(2);
    expect(keyWarnings(error)).toEqual([]);
  });
});

describe('convertToRequireList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('links src paths to article urls', () => {
    const html = markup(convertToRequireList('see src/cpp/a and src/cpp/b'));
    expect(html).toContain('href="/src/cpp/a.html"');
    expect(html).toContain('href="/src/cpp/b.html"');
    expect(html).toContain('see ');
  });

  it('does not warn about duplicate keys for repeated references', () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const html = markup(convertToRequireList('src/a, src/a, src/a'));
    expect(html.match(/href="\/src\/a.html"/g)).toHaveLength(3);
    expect(keyWarnings(error)).toEqual([]);
  });
});
