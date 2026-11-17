// dev server 用に、public/data/codelib_full.json を public/data/ のインデックスと記事ごとの JSON に分割する。
// usage: node tools/split-data.mjs [--public-path public] [--skip-if-missing]
//
// --skip-if-missing: 入力がなければ警告のみで終了する（データなしで dev server を起動するため）
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import {
  ARTICLES_DIR,
  DataError,
  INPUT_FILE,
  buildDataFiles,
  findDestinationConflicts,
  readArticles,
} from './codelib-data.mjs';

function fail(message) {
  console.error(message);
  process.exit(1);
}

let args;
try {
  args = parseArgs({
    options: {
      'public-path': {
        type: 'string',
        default: path.join(import.meta.dirname, '../public'),
      },
      'skip-if-missing': { type: 'boolean', default: false },
    },
  }).values;
} catch (e) {
  fail(e.message);
}

const publicPath = args['public-path'];

// public/data に触る前に、すべて検査する
let dataFiles;
try {
  dataFiles = buildDataFiles(readArticles(publicPath));
  const conflicted = findDestinationConflicts(dataFiles.keys());
  if (conflicted.length > 0)
    throw new DataError(
      `article destination already exists: ${JSON.stringify(conflicted)}`
    );
} catch (e) {
  if (!(e instanceof DataError)) throw e;
  if (e.code === 'ENOENT' && args['skip-if-missing']) {
    console.error(`warning: ${INPUT_FILE} not found. skip splitting data`);
    process.exit(0);
  }
  fail(e.message);
}

// 消えた記事のファイルを残さないため、記事のディレクトリは作り直す
fs.rmSync(path.join(publicPath, ARTICLES_DIR), {
  recursive: true,
  force: true,
});
for (const [rel, content] of dataFiles) {
  const dest = path.join(publicPath, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}
