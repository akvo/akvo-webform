#!/usr/bin/env bash

if [[ "$#" -ne 3 ]]; then
    echo "Illegal number of parameters"
    echo -e "Example:\n"
    echo "./backend/scripts/data_backup.sh lorem 324830912 324840912"
    echo "to download form id 324840912 in the instance of lorem.akvoflow.org"
    exit 0
fi

docker-compose exec backend \
    python -m util.data_cleaning \
    "${PERSONAL_FLOW_USERNAME}" \
    "${PERSONAL_FLOW_PASSWORD}" \
    "${1}" "${2}" "${3}"
