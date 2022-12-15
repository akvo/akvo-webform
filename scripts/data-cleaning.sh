#!/usr/bin/env bash

docker-compose exec backend \
    python -m util.data_cleaning \
    "${PERSONAL_FLOW_USERNAME}" \
    "${PERSONAL_FLOW_PASSWORD}" \
    seap 324830912 324840912
