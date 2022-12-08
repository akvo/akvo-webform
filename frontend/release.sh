#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

yarn install
yarn eslint --config .eslintrc.prod.json src --ext .js,.jsx
yarn prettier --check src/
yarn build
