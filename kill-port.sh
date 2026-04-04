#!/bin/bash

set -euo pipefail

PORTS=(5001 5173)

echo "Clearing ports: ${PORTS[*]}"

for port in "${PORTS[@]}"; do
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9
  fi
done

echo "Ports ready: ${PORTS[*]}"
