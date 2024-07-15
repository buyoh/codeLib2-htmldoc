# codeLib2-htmldoc

WIP

## usage

### install deps

```
yarn
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
yarn dev
```

check http://localhost:8020/codeLib2

### release

```
yarn build
ruby tools/generate_release_directory.rb --output-path /tmp/www/codeLib2
```
