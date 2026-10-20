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

check http://localhost:8020/codeLib2

### release

```
pnpm build
ruby tools/generate_release_directory.rb --output-path /tmp/www/codeLib2
```
