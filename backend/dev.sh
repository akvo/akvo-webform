#!/usr/bin/env bash
# shellcheck disable=SC2155

set -eu

# Install WeasyPrint dependencies only if not already installed
if [ ! -f "/tmp/.weasyprint_deps_installed" ]; then
    echo "Installing WeasyPrint dependencies..."
    apt-get update && apt-get install -y \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libffi-dev \
    libxml2 \
    libxslt1.1 \
    shared-mime-info \
    fonts-liberation \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
    
    # Create flag file to indicate dependencies are installed
    touch /tmp/.weasyprint_deps_installed
    echo "WeasyPrint dependencies installed successfully."
else
    echo "WeasyPrint dependencies already installed."
fi

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
