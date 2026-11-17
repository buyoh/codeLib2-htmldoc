import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isValidArticlePath as isValidArticlePathTs } from '../src/lib/CodeLib/types';
import {
  DataError,
  INDEX_FILE,
  INPUT_FILE,
  buildDataFiles,
  findDestinationConflicts,
  isValidArticlePath,
  readArticles,
} from './codelib-data.mjs';

describe('isValidArticlePath', () => {
  it.each([
    '/a',
    '/src/cpp/a.hpp',
    '/a_b-c.d/e',
    '/..a',
    '/a/..',
    '/a/./b',
    '//host/x',
    '/a\n',
    '/a\n/b',
    '/幾何',
    '',
    '/',
    '/a/',
    'a',
    '/a b',
    '/a%2f',
  ])('agrees with the client: %j', (p) => {
    expect(isValidArticlePath(p)).toBe(isValidArticlePathTs(p));
  });

  it.each([undefined, null, 1, ['/a'], { toString: () => '/a' }])(
    'rejects a non-string: %j',
    (p) => {
      expect(isValidArticlePath(p)).toBe(false);
    }
  );
});

describe('buildDataFiles', () => {
  const article = {
    title: 't',
    overview: 'o',
    code: 'c',
    path: '/src/a.hpp',
    lang: 'cpp',
    words: ['w'],
    tested_by: ['x'],
    commits: [],
  };

  it('puts only the summary fields into the index', () => {
    const files = buildDataFiles([article]);
    expect(JSON.parse(files.get(INDEX_FILE))).toEqual([
      {
        title: 't',
        path: '/src/a.hpp',
        lang: 'cpp',
        words: ['w'],
        tested_by: ['x'],
      },
    ]);
  });

  it('writes each article as is', () => {
    const files = buildDataFiles([article]);
    expect(JSON.parse(files.get('data/articles/src/a.hpp.json'))).toEqual(
      article
    );
    expect([...files.keys()]).toEqual([
      INDEX_FILE,
      'data/articles/src/a.hpp.json',
    ]);
  });

  it('omits a missing key from the index', () => {
    const { words: _, ...rest } = article;
    const files = buildDataFiles([rest]);
    expect(JSON.parse(files.get(INDEX_FILE))[0]).not.toHaveProperty('words');
  });

  it('rejects duplicate paths', () => {
    expect(() => buildDataFiles([article, article])).toThrow(DataError);
    expect(() => buildDataFiles([article, article])).toThrow(/already exists/);
  });
});

describe('findDestinationConflicts', () => {
  it('returns nothing when there is no conflict', () => {
    expect(findDestinationConflicts(['a.json', 'b/a.json', 'b.json'])).toEqual(
      []
    );
  });

  it('detects duplicates', () => {
    expect(findDestinationConflicts(['a', 'b', 'a'])).toEqual(['a']);
  });

  it('detects a destination below another destination', () => {
    expect(
      findDestinationConflicts(['data/a.json', 'data/a.json/x/b.json'])
    ).toEqual(['data/a.json/x/b.json']);
  });

  it('accepts an iterable', () => {
    expect(findDestinationConflicts(new Set(['a', 'a/b']))).toEqual(['a/b']);
  });
});

describe('readArticles', () => {
  let publicPath;

  function write(content) {
    fs.writeFileSync(path.join(publicPath, INPUT_FILE), content);
  }

  function errorOf(fn) {
    try {
      fn();
    } catch (e) {
      return e;
    }
    throw Error('not thrown');
  }

  beforeEach(() => {
    publicPath = fs.mkdtempSync(path.join(os.tmpdir(), 'codelib-data-'));
    fs.mkdirSync(path.join(publicPath, 'data'));
  });

  afterEach(() => {
    fs.rmSync(publicPath, { recursive: true, force: true });
  });

  it('returns the articles', () => {
    write(JSON.stringify([{ path: '/a', title: '幾何' }]));
    expect(readArticles(publicPath)).toEqual([{ path: '/a', title: '幾何' }]);
  });

  it.each([
    ['malformed json', '{', /invalid data/],
    ['non-array data', '{}', /must be an array/],
    [
      'invalid utf-8',
      Buffer.from([0x5b, 0x22, 0xff, 0x22, 0x5d]),
      /invalid data/,
    ],
    ['invalid path', JSON.stringify([{ path: 'a' }]), /invalid article path/],
    [
      'non-ascii path',
      JSON.stringify([{ path: '/幾何' }]),
      /invalid article path/,
    ],
    ['null element', '[null]', /invalid article path/],
  ])('rejects %s', (_, content, message) => {
    write(content);
    const e = errorOf(() => readArticles(publicPath));
    expect(e).toBeInstanceOf(DataError);
    expect(e.message).toMatch(message);
  });

  it('reports a missing input as ENOENT', () => {
    const e = errorOf(() => readArticles(publicPath));
    expect(e).toBeInstanceOf(DataError);
    expect(e.code).toBe('ENOENT');
  });
});
