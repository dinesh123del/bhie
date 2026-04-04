#!/bin/bash

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_PORT=10000
FRONTEND_PORT=5173

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "BHIE startup"
echo "============"
echo ""

echo -e "${BLUE}Checking dependencies...${NC}"
if [ ! -d "$PROJECT_ROOT/server/node_modules" ]; then
  npm --prefix "$PROJECT_ROOT/server" install --legacy-peer-deps >/dev/null 2>&1
  echo -e "${GREEN}✅ Installed backend dependencies${NC}"
fi

if [ ! -d "$PROJECT_ROOT/client/node_modules" ]; then
  npm --prefix "$PROJECT_ROOT/client" install --legacy-peer-deps >/dev/null 2>&1
  echo -e "${GREEN}✅ Installed frontend dependencies${NC}"
fi

echo -e "${BLUE}Clearing ports...${NC}"
lsof -i :"$BACKEND_PORT" -i :"$FRONTEND_PORT" 2>/dev/null | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✅ Ports ready${NC}"
echo ""

echo -e "${YELLOW}Starting backend on ${BACKEND_PORT}...${NC}"
cd "$PROJECT_ROOT/server"
npm run dev > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 3

if ! ps -p $BACKEND_PID >/dev/null; then
  echo -e "${RED}❌ Backend failed to start${NC}"
  cat "$PROJECT_ROOT/backend.log"
  exit 1
fi

echo -e "${YELLOW}Starting frontend on ${FRONTEND_PORT}...${NC}"
cd "$PROJECT_ROOT/client"
npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 3

if ! ps -p $FRONTEND_PID >/dev/null; then
  echo -e "${RED}❌ Frontend failed to start${NC}"
  cat "$PROJECT_ROOT/frontend.log"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

if curl -s "http://localhost:${BACKEND_PORT}/api/health" >/dev/null; then
  echo -e "${GREEN}✅ Backend responding${NC}"
else
  echo -e "${RED}❌ Backend health check failed${NC}"
  exit 1
fi

if curl -s "http://localhost:${FRONTEND_PORT}" >/dev/null; then
  echo -e "${GREEN}✅ Frontend responding${NC}"
else
  echo -e "${RED}❌ Frontend check failed${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}BHIE is ready${NC}"
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "Health:   http://localhost:${BACKEND_PORT}/api/health"
echo ""
echo "Logs:"
echo "  tail -f $PROJECT_ROOT/backend.log"
echo "  tail -f $PROJECT_ROOT/frontend.log"
echo ""
echo "Optional legacy ML service:"
echo "  cd $PROJECT_ROOT/ml-service && python3 -m uvicorn main:app --reload --port 8000"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

while true; do
  if ! ps -p $BACKEND_PID >/dev/null; then
    echo -e "${RED}❌ Backend process exited${NC}"
    exit 1
  fi

  if ! ps -p $FRONTEND_PID >/dev/null; then
    echo -e "${RED}❌ Frontend process exited${NC}"
    exit 1
  fi

  sleep 5
done
