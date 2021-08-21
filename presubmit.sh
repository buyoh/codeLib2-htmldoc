#!/bin/bash

yarn lint-fix
CODELIB_PATH=../codeLib2 yarn data-build
yarn build
