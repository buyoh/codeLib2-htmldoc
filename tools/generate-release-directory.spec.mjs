import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const script = path.join(import.meta.dirname, 'generate_release_directory.rb');
const hasRuby = spawnSync('ruby', ['--version']).status === 0;

// CI では ruby がなければ失敗させ、黙ってスキップしない
describe.skipIf(!hasRuby && !process.env.CI)(
  'generate_release_directory.rb',
  () => {
    let root;
    let publicPath;
    let outputPath;

    function run(data, env = process.env) {
      fs.writeFileSync(
        path.join(publicPath, 'data/codelib_full.json'),
        typeof data === 'string' ? data : JSON.stringify(data)
      );
      return spawnSync(
        'ruby',
        [script, '--public-path', publicPath, '--output-path', outputPath],
        { encoding: 'utf8', env }
      );
    }

    beforeEach(() => {
      root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-dir-'));
      publicPath = path.join(root, 'public');
      outputPath = path.join(root, 'output');
      fs.mkdirSync(path.join(publicPath, 'data'), { recursive: true });
      fs.writeFileSync(path.join(publicPath, 'index.html'), 'index');
      fs.writeFileSync(path.join(publicPath, 'bundle.js'), 'bundle');
      fs.writeFileSync(path.join(publicPath, 'data/.gitignore'), '*\n');
    });

    afterEach(() => {
      fs.rmSync(root, { recursive: true, force: true });
    });

    it('copies public without duplicates and links each article', () => {
      const result = run([{ path: '/src/cpp/a.hpp' }]);
      expect(result.status, result.stderr).toBe(0);
      expect(fs.readdirSync(outputPath).sort()).toEqual([
        'bundle.js',
        'data',
        'index.html',
        'src',
      ]);
      expect(fs.readdirSync(path.join(outputPath, 'data'))).toEqual([
        'codelib_full.json',
      ]);
      const link = path.join(outputPath, 'src/cpp/a.hpp.html');
      expect(fs.readlinkSync(link)).toBe('../../index.html');
      expect(fs.readFileSync(link, 'utf8')).toBe('index');
    });

    it('is idempotent and removes stale files', () => {
      expect(run([{ path: '/a' }]).status).toBe(0);
      fs.writeFileSync(path.join(outputPath, 'stale'), '');
      expect(run([{ path: '/b' }]).status).toBe(0);
      expect(fs.existsSync(path.join(outputPath, 'stale'))).toBe(false);
      expect(fs.existsSync(path.join(outputPath, 'a.html'))).toBe(false);
      expect(fs.existsSync(path.join(outputPath, 'b.html'))).toBe(true);
    });

    // 前回の出力に keep を加え、失敗時に消えないことを確認できるようにする
    function preparePreviousOutput() {
      expect(run([{ path: '/old' }]).status).toBe(0);
      fs.writeFileSync(path.join(outputPath, 'keep'), '');
    }

    function expectUntouched(result, message) {
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(message);
      expect(result.stderr).not.toMatch(/\(\w*Error\)|Errno::/);
      expect(fs.existsSync(path.join(outputPath, 'keep'))).toBe(true);
      expect(fs.existsSync(path.join(outputPath, 'old.html'))).toBe(true);
    }

    it.each([
      ['traversal', [{ path: '/../../etc/foo' }]],
      ['protocol relative', [{ path: '//evil.example/x' }]],
      ['no leading slash', [{ path: 'relative' }]],
      ['missing path', [{}]],
      ['non-string path', [{ path: 1 }]],
      ['null element', [null]],
      ['non-object element', [1]],
      ['non-array data', { path: '/a' }],
      ['malformed json', '{'],
    ])('aborts before touching the output: %s', (_, data) => {
      preparePreviousOutput();
      expectUntouched(run(data), /invalid/);
    });

    it.each([
      ['duplicate paths', [{ path: '/a' }, { path: '/a' }]],
      ['collision with a public file', [{ path: '/index' }]],
      ['collision with a public directory', [{ path: '/sub' }]],
      ['parent is a public file', [{ path: '/index.html/x' }]],
      ['parent is another article', [{ path: '/a' }, { path: '/a.html/b' }]],
      ['parent is a public symlink', [{ path: '/esc/pwn' }]],
    ])('aborts before touching the output on a conflict: %s', (_, data) => {
      fs.mkdirSync(path.join(publicPath, 'sub.html'));
      preparePreviousOutput();
      fs.symlinkSync(root, path.join(publicPath, 'esc'));
      expectUntouched(run(data), /already exists/);
      expect(fs.existsSync(path.join(root, 'pwn.html'))).toBe(false);
    });

    // 'data/codelib_full.json' を置かないこと。出力先の検査が壊れても消去に進まないようにしている
    function runIn(cwd, output) {
      return spawnSync(
        'ruby',
        [script, '--public-path', publicPath, '--output-path', output],
        { encoding: 'utf8', cwd }
      );
    }

    it.each(['', '/', '.', '..', 'public', 'public/sub'])(
      'refuses a dangerous output path: "%s"',
      (output) => {
        const cwd = path.join(root, 'cwd');
        fs.mkdirSync(cwd);
        fs.writeFileSync(path.join(cwd, 'victim'), '');
        const result = runIn(output.startsWith('public') ? root : cwd, output);
        expect(result.status).toBe(1);
        expect(result.stderr).toMatch(/output-path/);
        expect(fs.existsSync(path.join(cwd, 'victim'))).toBe(true);
        expect(fs.existsSync(path.join(publicPath, 'index.html'))).toBe(true);
      }
    );

    it.each(['link', 'link/sub'])(
      'refuses a symlink into public: %s',
      (output) => {
        fs.symlinkSync(publicPath, path.join(root, 'link'));
        const result = runIn(root, output);
        expect(result.status).toBe(1);
        expect(result.stderr).toMatch(/overlap/);
        expect(fs.existsSync(path.join(publicPath, 'index.html'))).toBe(true);
      }
    );

    it('refuses a directory that is not a previous output', () => {
      fs.mkdirSync(outputPath);
      fs.writeFileSync(path.join(outputPath, 'victim'), '');
      const result = run([{ path: '/a' }]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/previous output/);
      expect(fs.readdirSync(outputPath)).toEqual(['victim']);
    });

    it('refuses a regular file as the output', () => {
      fs.writeFileSync(outputPath, 'victim');
      const result = run([{ path: '/a' }]);
      expect(result.status).toBe(1);
      expect(fs.readFileSync(outputPath, 'utf8')).toBe('victim');
    });

    it('accepts an empty output directory', () => {
      fs.mkdirSync(outputPath);
      expect(run([{ path: '/a' }]).status).toBe(0);
    });

    it('reads non-ascii data regardless of the locale', () => {
      const data = [{ path: '/a', title: '幾何' }];
      expect(run(data, { ...process.env, LC_ALL: 'C' }).status).toBe(0);
    });

    it('aborts with a message when a required file is missing', () => {
      expect(runIn(root, outputPath).stderr).toMatch(/invalid data/);
      fs.rmSync(path.join(publicPath, 'index.html'));
      expect(runIn(root, outputPath).stderr).toMatch(/index\.html not found/);
      expect(fs.existsSync(outputPath)).toBe(false);
    });

    it('aborts on a broken symlink at the destination in public', () => {
      fs.symlinkSync('nowhere', path.join(publicPath, 'x.html'));
      preparePreviousOutput();
      expectUntouched(run([{ path: '/x' }]), /already exists/);
    });

    it('aborts with a message when the output cannot be created', () => {
      const file = path.join(root, 'file');
      fs.writeFileSync(file, '');
      fs.writeFileSync(path.join(publicPath, 'data/codelib_full.json'), '[]');
      const result = runIn(root, path.join(file, 'sub'));
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/--output-path cannot be created/);
    });

    it('follows a symlinked output when judging it', () => {
      const target = path.join(root, 'target');
      fs.mkdirSync(target);
      fs.writeFileSync(path.join(target, 'victim'), '');
      fs.symlinkSync(target, outputPath);
      const result = run([{ path: '/a' }]);
      expect(result.stderr).toMatch(/previous output/);
      expect(fs.existsSync(path.join(target, 'victim'))).toBe(true);
    });

    it('does not delete through a symlink inside a previous output', () => {
      const outside = path.join(root, 'outside');
      fs.mkdirSync(outside);
      fs.writeFileSync(path.join(outside, 'victim'), '');
      expect(run([{ path: '/a' }]).status).toBe(0);
      fs.symlinkSync(outside, path.join(outputPath, 'link'));
      expect(run([{ path: '/a' }]).status).toBe(0);
      expect(fs.existsSync(path.join(outputPath, 'link'))).toBe(false);
      expect(fs.existsSync(path.join(outside, 'victim'))).toBe(true);
    });

    it('removes a root level .gitignore from the output', () => {
      fs.writeFileSync(path.join(publicPath, '.gitignore'), '*\n');
      expect(run([{ path: '/a' }]).status).toBe(0);
      expect(fs.existsSync(path.join(outputPath, '.gitignore'))).toBe(false);
    });
  }
);
