#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu
pip -q install --upgrade pip
pip -q install --cache-dir=.pip -r requirements.txt
pip check

# connection="$(python test-connection.py)"

# if [[ "${connection}" != "OK" ]]; then
#     echo "Unable to connect to PostgreSQL"
#     exit 1
# fi

# alembic upgrade head

uvicorn main:app --reload --port 5000
