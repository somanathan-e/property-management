#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to stop the application." >&2
  exit 1
fi

cd "$PROJECT_ROOT"

if docker compose version >/dev/null 2>&1; then
  docker compose down
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose down
else
  echo "Docker Compose is required to stop the application." >&2
  exit 1
fi

echo "Application stopped."
