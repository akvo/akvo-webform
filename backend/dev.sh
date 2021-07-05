#!/usr/bin/env bash
set -eu
if [[ ! -d .pip ]]; then
    pip install --cache-dir=.pip -r requirements.txt
    pip check
fi
python ./app.py
