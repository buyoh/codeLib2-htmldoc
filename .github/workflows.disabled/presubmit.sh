#!/bin/bash

pnpm lint-fix
CODELIB_PATH=../codeLib2 pnpm data-build
pnpm build
