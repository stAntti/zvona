#!/usr/bin/env sh
set -eu

git fetch origin main
git reset --hard origin/main
docker compose -f compose.yaml -f compose.prod.yaml up -d --build --remove-orphans
for migration in db/migrations/*.sql; do
  docker compose -f compose.yaml -f compose.prod.yaml exec -T postgres psql -v ON_ERROR_STOP=1 -U zvona -d zvona < "$migration" || true
done
