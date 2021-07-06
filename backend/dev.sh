#!/usr/bin/env bash
set -eu
pip install --cache-dir=.pip -r requirements.txt
pip check
python ./app.py
