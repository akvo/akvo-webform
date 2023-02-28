#!/usr/bin/env bash

# Example: ./backend/scripts/data_backup.sh <instance_name>

if [[ $# -eq 0 ]] ; then
    echo -e "\nEmpty Arguments!"
    echo -e "Example:\n"
    echo "./backend/scripts/data_backup.sh lorem"
    echo "for instance lorem.akvoflow.org"
    exit 0
fi

docker-compose exec backend \
    python -m util.data_backup \
    "${PERSONAL_FLOW_USERNAME}" \
    "${PERSONAL_FLOW_PASSWORD}" \
    "${1}"
