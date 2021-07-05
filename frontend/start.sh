#!/usr/bin/env bash

echo PUBLIC_URL="/" > .env
echo REACT_APP_CAPTCHA_KEY="${REACT_APP_CAPTCHA_KEY}" > .env
yarn install
yarn start
