#!/usr/bin/env bash

docker-compose exec backend \
    python -m util.data_backup \
    "${PERSONAL_FLOW_USERNAME}" \
    "${PERSONAL_FLOW_PASSWORD}" \
    seap
