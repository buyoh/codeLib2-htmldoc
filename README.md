# codeLib2-htmldoc

WIP

## usage

### install deps

```
pnpm install
```

### generate codeLib2 data

Use codeLib2-tools https://github.com/buyoh/codeLib2-tools

```
../codeLib2-tools/target/release/gather \
  --basepath ../codeLib2 \
  --output-path-article public/data/codelib_full.json
```

### play dev-server

```
pnpm dev
```

`pnpm dev` splits `public/data/codelib_full.json` into `public/data/index.json` and `public/data/articles/**` before starting.
After regenerating the data while the server is running, run `pnpm split-data`.

check http://localhost:8020/codeLib2

### release

```
pnpm build
node tools/generate-release-directory.mjs --output-path /tmp/www/codeLib2
```
