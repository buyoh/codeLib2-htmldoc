import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const script = path.join(import.meta.dirname, 'split-data.mjs');

describe('split-data.mjs', () => {
  let publicPath;

  function data(...rel) {
    return path.join(publicPath, 'data', ...rel);
  }

  function run(input, args = []) {
    if (input !== undefined)
      fs.writeFileSync(data('codelib_full.json'), JSON.stringify(input));
    return spawnSync(
      process.execPath,
      [script, '--public-path', publicPath, ...args],
      { encoding: 'utf8' }
    );
  }

  beforeEach(() => {
    publicPath = fs.mkdtempSync(path.join(os.tmpdir(), 'split-data-'));
    fs.mkdirSync(data(), { recursive: true });
    fs.writeFileSync(data('.gitignore'), '*\n');
  });

  afterEach(() => {
    fs.rmSync(publicPath, { recursive: true, force: true });
  });

  it('writes the index and each article', () => {
    const result = run([{ path: '/src/a.hpp', title: 'A' }]);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readdirSync(data()).sort()).toEqual([
      '.gitignore',
      'articles',
      'codelib_full.json',
      'index.json',
    ]);
    expect(JSON.parse(fs.readFileSync(data('index.json'), 'utf8'))).toEqual([
      { path: '/src/a.hpp', title: 'A' },
    ]);
    expect(
      JSON.parse(fs.readFileSync(data('articles/src/a.hpp.json'), 'utf8'))
    ).toEqual({ path: '/src/a.hpp', title: 'A' });
  });

  it('removes the files of articles that are gone', () => {
    expect(run([{ path: '/a' }]).status).toBe(0);
    expect(run([{ path: '/b' }]).status).toBe(0);
    expect(fs.readdirSync(data('articles'))).toEqual(['b.json']);
  });

  it.each([
    ['invalid data', [{ path: 'a' }], /invalid article path/],
    ['duplicate paths', [{ path: '/a' }, { path: '/a' }], /already exists/],
    ['a conflict', [{ path: '/a' }, { path: '/a.json/b' }], /already exists/],
  ])('keeps the previous files on %s', (_, input, message) => {
    expect(run([{ path: '/old' }]).status).toBe(0);
    const result = run(input);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(message);
    expect(result.stderr).not.toMatch(/^\s+at /m);
    expect(fs.readdirSync(data('articles'))).toEqual(['old.json']);
  });

  it('skips a missing input with --skip-if-missing', () => {
    const result = run(undefined, ['--skip-if-missing']);
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/not found/);
    expect(fs.readdirSync(data())).toEqual(['.gitignore']);
  });

  it('fails on a missing input without --skip-if-missing', () => {
    const result = run(undefined);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/invalid data/);
  });

  it('fails on invalid data even with --skip-if-missing', () => {
    expect(run('{', ['--skip-if-missing']).status).toBe(1);
  });
});
