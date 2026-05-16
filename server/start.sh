#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to start the application." >&2
  exit 1
fi

started_docker=false

if ! docker info >/dev/null 2>&1; then
  if [ "$(uname -s)" = "Darwin" ]; then
    echo "Docker is not running. Starting Docker Desktop..."
    started_docker=true
    open -a Docker

    attempts=0
    max_attempts=60
    while ! docker info >/dev/null 2>&1; do
      attempts=$((attempts + 1))
      if [ "$attempts" -ge "$max_attempts" ]; then
        echo "Docker did not become ready within 120 seconds." >&2
        exit 1
      fi
      sleep 2
    done
  else
    echo "Docker is installed but the Docker daemon is not running." >&2
    echo "Start Docker, then run this script again." >&2
    exit 1
  fi
else
  echo "Docker is already running."
fi

cd "$PROJECT_ROOT"

if docker compose version >/dev/null 2>&1; then
  docker compose up -d --build
  echo
  docker compose ps
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d --build
  echo
  docker-compose ps
else
  echo "Docker Compose is required to start the application." >&2
  exit 1
fi

if [ "$started_docker" = true ]; then
  echo
  echo "Docker Desktop was started by this script and is still running."
fi

echo "Application started."
echo "Frontend: http://localhost/property-management"
echo "API: http://localhost/property-management/api/v1"
echo "Stop it with: ./server/stop.sh"
