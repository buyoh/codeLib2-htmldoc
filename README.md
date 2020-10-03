# codeLib2-htmldoc

WIP

## usage

### install deps

```
yarn
```

### generate codeLib2 data

```
ruby tools/codelib_json_bundler.rb --codelib-path ../codeLib2/ --minimize
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
