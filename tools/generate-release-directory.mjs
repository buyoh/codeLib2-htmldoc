// public/ をリリース用のディレクトリへコピーし、記事ごとに index.html への symlink を作る。
// usage: node tools/generate-release-directory.mjs --output-path /var/www/codeLib2 [--public-path public]
//
// 出力先は毎回空にしてから作り直す。不正な入力は、出力先に触る前にすべて検査して停止する。
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';

// src/lib/CodeLib/types.ts の isValidArticlePath と同じ条件
const ARTICLE_PATH_PATTERN = /^\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/;

// 出力先にコピーしないファイル
const EXCLUDED_BASENAMES = new Set(['.gitignore']);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function isValidArticlePath(p) {
  return (
    typeof p === 'string' &&
    ARTICLE_PATH_PATTERN.test(p) &&
    p.split('/').every((seg) => seg !== '.' && seg !== '..')
  );
}

// symlink を解決した絶対パス。末尾側は存在しなくてもよい
function realPath(p) {
  const abs = path.resolve(p);
  if (fs.existsSync(abs)) return fs.realpathSync(abs);
  const parent = path.dirname(abs);
  if (parent === abs) return abs;
  return path.join(realPath(parent), path.basename(abs));
}

function isFile(p) {
  return fs.statSync(p, { throwIfNoEntry: false })?.isFile() ?? false;
}

// 壊れた symlink も含めて存在すれば lstat を返す。
// lstatSync は親が通常ファイルだと throwIfNoEntry でも ENOTDIR を投げるので、未検出として扱う
function lstatOrNull(p) {
  try {
    return fs.lstatSync(p, { throwIfNoEntry: false }) ?? null;
  } catch (e) {
    if (e.code === 'ENOTDIR') return null;
    throw e;
  }
}

function isPreviousOutput(dir) {
  return (
    isFile(path.join(dir, 'index.html')) &&
    isFile(path.join(dir, 'data/codelib_full.json'))
  );
}

// 作成先や親ディレクトリが public のファイル・symlink や他の記事の作成先と衝突するか
function conflicts(rel, linkPaths, publicPath) {
  if (lstatOrNull(path.join(publicPath, rel)) !== null) return true;
  for (let parent = path.dirname(rel); parent !== '.'; ) {
    const publicParent = path.join(publicPath, parent);
    if (
      linkPaths.has(parent) ||
      lstatOrNull(publicParent)?.isSymbolicLink() ||
      isFile(publicParent)
    )
      return true;
    parent = path.dirname(parent);
  }
  return false;
}

// 入力を読み、記事の配列として返す。不正なバイト列は置換せずにエラーにする
function readArticles(file) {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(
      fs.readFileSync(file)
    );
    return JSON.parse(text);
  } catch (e) {
    fail(`invalid data: ${e.message}`);
  }
}

let args;
try {
  args = parseArgs({
    options: {
      'output-path': { type: 'string' },
      'public-path': {
        type: 'string',
        default: path.join(import.meta.dirname, '../public'),
      },
    },
  }).values;
} catch (e) {
  fail(e.message);
}

if (!args['output-path']) fail('--output-path is required');

const outputPath = realPath(args['output-path']);
const publicPath = realPath(args['public-path']);

if (
  `${publicPath}/`.startsWith(`${outputPath}/`) ||
  `${outputPath}/`.startsWith(`${publicPath}/`)
)
  fail(`--output-path must not overlap --public-path: ${outputPath}`);

// 出力先は毎回空にするため、空でないディレクトリは前回の出力と分かるものに限る
if (fs.existsSync(outputPath)) {
  const isDir = fs.statSync(outputPath).isDirectory();
  if (
    !isDir ||
    !(fs.readdirSync(outputPath).length === 0 || isPreviousOutput(outputPath))
  )
    fail(
      `--output-path must be missing, empty, or a previous output: ${outputPath}`
    );
}

if (!isFile(path.join(publicPath, 'index.html')))
  fail(`${publicPath}/index.html not found. run \`pnpm build\` first`);

const articles = readArticles(path.join(publicPath, 'data/codelib_full.json'));
if (!Array.isArray(articles))
  fail('invalid data: codelib_full.json must be an array');

const articlePaths = articles.map((a) =>
  a !== null && typeof a === 'object' ? a.path : undefined
);
const invalidPaths = articlePaths.filter((p) => !isValidArticlePath(p));
if (invalidPaths.length > 0)
  fail(`invalid article path: ${JSON.stringify(invalidPaths)}`);

// 出力先に触る前に、すべての作成先を検査する
const linkPaths = articlePaths.map((p) => `${p.slice(1)}.html`);
for (const rel of linkPaths) {
  if (!path.resolve(outputPath, rel).startsWith(`${outputPath}/`))
    fail(`article path escapes the output directory: ${rel}`);
}
const seen = new Set();
const duplicates = new Set(
  linkPaths.filter((rel) => seen.has(rel) || !seen.add(rel))
);
if (duplicates.size > 0)
  fail(
    `article destination already exists: ${JSON.stringify([...duplicates])}`
  );
const linkPathSet = new Set(linkPaths);
const conflicted = linkPaths.filter((rel) =>
  conflicts(rel, linkPathSet, publicPath)
);
if (conflicted.length > 0)
  fail(`article destination already exists: ${JSON.stringify(conflicted)}`);

// 冪等にするため、出力先を空にしてから public の中身をそのままコピーする
try {
  fs.mkdirSync(outputPath, { recursive: true });
} catch (e) {
  fail(`--output-path cannot be created: ${e.message}`);
}
for (const child of fs.readdirSync(outputPath))
  fs.rmSync(path.join(outputPath, child), { recursive: true });
// 相対 symlink を絶対パスに書き換えないよう verbatimSymlinks を指定する
fs.cpSync(publicPath, outputPath, {
  recursive: true,
  verbatimSymlinks: true,
  filter: (src) => !EXCLUDED_BASENAMES.has(path.basename(src)),
});

const indexPath = path.join(outputPath, 'index.html');
for (const rel of linkPaths) {
  const dest = path.join(outputPath, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.symlinkSync(path.relative(path.dirname(dest), indexPath), dest);
}
