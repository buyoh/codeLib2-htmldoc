// public/ をリリース用のディレクトリへコピーし、記事データの分割と、記事ごとの index.html への symlink を作る。
// usage: node tools/generate-release-directory.mjs --output-path /var/www/codeLib2 [--public-path public]
//
// 出力先は毎回空にしてから作り直す。不正な入力は、出力先に触る前にすべて検査して停止する。
// public/data は分割データの入力と dev の生成物の置き場なので、コピーせずに入力から毎回生成する。
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import {
  DataError,
  INPUT_FILE,
  buildDataFiles,
  findDestinationConflicts,
  readArticles,
} from './codelib-data.mjs';

// 出力先にコピーしないファイル
const EXCLUDED_BASENAMES = new Set(['.gitignore']);

function fail(message) {
  console.error(message);
  process.exit(1);
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

// 作成先や親ディレクトリが public のファイル・symlink と衝突するか。
// 作成先どうしの衝突は findDestinationConflicts で検査する
function conflictsWithPublic(rel, publicPath) {
  if (lstatOrNull(path.join(publicPath, rel)) !== null) return true;
  for (let parent = path.dirname(rel); parent !== '.'; ) {
    const publicParent = path.join(publicPath, parent);
    if (lstatOrNull(publicParent)?.isSymbolicLink() || isFile(publicParent))
      return true;
    parent = path.dirname(parent);
  }
  return false;
}

// 入力を検証・分割し、作成するデータファイルとリンクを返す
function planOutputs(publicPath, outputPath) {
  const articles = readArticles(publicPath);
  const dataFiles = buildDataFiles(articles);
  const linkPaths = articles.map((a) => `${a.path.slice(1)}.html`);
  for (const rel of linkPaths) {
    if (!path.resolve(outputPath, rel).startsWith(`${outputPath}/`))
      throw new DataError(`article path escapes the output directory: ${rel}`);
  }
  // public/data はコピーしないので、データファイルは public と比較しない
  const conflicted = [
    ...findDestinationConflicts([...linkPaths, ...dataFiles.keys()]),
    ...linkPaths.filter((rel) => conflictsWithPublic(rel, publicPath)),
  ];
  if (conflicted.length > 0)
    throw new DataError(
      `article destination already exists: ${JSON.stringify(conflicted)}`
    );
  return { dataFiles, linkPaths };
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

// 出力先に触る前に、すべての作成先を検査する
let plan;
try {
  plan = planOutputs(publicPath, outputPath);
} catch (e) {
  if (e instanceof DataError) fail(e.message);
  throw e;
}

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
  filter: (src) =>
    !EXCLUDED_BASENAMES.has(path.basename(src)) &&
    src !== path.join(publicPath, 'data'),
});

// クライアントの切り替えまでは、分割前の入力も公開する
const outputFiles = new Map(plan.dataFiles).set(
  INPUT_FILE,
  fs.readFileSync(path.join(publicPath, INPUT_FILE))
);
for (const [rel, content] of outputFiles) {
  const dest = path.join(outputPath, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

const indexPath = path.join(outputPath, 'index.html');
for (const rel of plan.linkPaths) {
  const dest = path.join(outputPath, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.symlinkSync(path.relative(path.dirname(dest), indexPath), dest);
}
