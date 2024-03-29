#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

image_prefix="eu.gcr.io/akvo-lumen/akvo-webform"

# Normal Docker Compose
dc () {
    docker-compose \
        --ansi never \
        "$@"
}

# Docker compose using CI env
dci () {
    dc -f docker-compose.ci.yml "$@"
}

frontend_build () {

    echo "PUBLIC_URL=/" > frontend/.env

    # Code Quality and Build Folder
    sed 's/"warn"/"error"/g' < frontend/.eslintrc.json > frontend/.eslintrc.prod.json


    dc run \
       --rm \
       --no-deps \
       frontend \
       sh release.sh

    docker build \
        --tag "${image_prefix}/frontend:latest" \
        --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
}

backend_build () {

    docker build \
        --tag "${image_prefix}/backend:latest" \
        --tag "${image_prefix}/backend:${CI_COMMIT}" backend
}


frontend_build
backend_build

#test-connection
if ! dci run -T ci ./basic.sh; then
  dci logs
  echo "Build failed when running basic.sh"
  exit 1
fi
