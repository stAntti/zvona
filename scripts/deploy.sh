#!/usr/bin/env sh
set -eu

git fetch origin main
git reset --hard origin/main
docker compose up -d --build --remove-orphans
