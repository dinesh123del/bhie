#!/usr/bin/env zsh

# Biz Plus startup helper
# Usage: ./start-services.sh [frontend|backend|ml|all]

set -e

PROJECT_ROOT="/Users/srilekha/Desktop/BHIE"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

typeset -A PIDS

print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

start_service() {
  local service=$1
  local port=$2
  local cmd=$3

  print_info "Starting $service on port $port..."
  eval "$cmd" > "/tmp/bizplus_${service}.log" 2>&1 &
  PIDS[$service]=$!
  sleep 2

  if kill -0 "${PIDS[$service]}" 2>/dev/null; then
    print_status "$service started (PID: ${PIDS[$service]})"
    print_info "Logs: tail -f /tmp/bizplus_${service}.log"
  else
    print_error "$service failed to start"
    cat "/tmp/bhie_${service}.log"
    return 1
  fi
}

stop_services() {
  print_info "Stopping services..."
  for service in "${!PIDS[@]}"; do
    if kill -0 "${PIDS[$service]}" 2>/dev/null; then
      kill "${PIDS[$service]}"
      print_status "Stopped $service"
    fi
  done
}

trap stop_services EXIT INT TERM

case "${1:-all}" in
  frontend)
    print_info "Starting frontend only..."
    cd "$PROJECT_ROOT/client"
    npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
    ;;
  backend)
    print_info "Starting backend only..."
    cd "$PROJECT_ROOT/server"
    npm run dev
    ;;
  ml)
    print_info "Starting optional legacy ML service..."
    cd "$PROJECT_ROOT/ml-service"
    python3 -m uvicorn main:app --reload --port 8000
    ;;
  all)
    print_info "Starting backend and frontend..."
    start_service "backend" "5001" "cd '$PROJECT_ROOT/server' && npm run dev" || exit 1
    start_service "frontend" "5173" "cd '$PROJECT_ROOT/client' && npm run dev -- --host 0.0.0.0 --port 5173 --strictPort" || exit 1

    echo ""
    print_status "Core app services started"
    echo "Frontend: http://localhost:5173"
    echo "Backend:  http://localhost:5001"
    echo "Health:   http://localhost:5001/api/health"
    echo ""
    print_info "The Python ml-service is optional and no longer part of the default startup flow."
    print_info "Run './start-services.sh ml' only if you need that legacy service."
    wait
    ;;
  *)
    echo "Usage: ./start-services.sh [frontend|backend|ml|all]"
    exit 1
    ;;
esac
