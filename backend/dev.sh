#!/usr/bin/env bash
set -e
pip install --cache-dir=.pip -r requirements.txt
pip check
python ./app.py
