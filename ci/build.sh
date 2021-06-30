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
export -f dc

# Docker compose using CI env
dci () {
    dc -f docker-compose.yml \
       -f docker-compose.ci.yml "$@"
}
export -f dci

frontend_build () {
    dc run \
       --rm \
       --no-deps \
       frontend \
       bash release.sh

    docker build \
        --tag "${image_prefix}/frontend:latest" \
        --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
}
frontend_build
