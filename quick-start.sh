#!/bin/bash

set -e

echo "BHIE quick start"
echo "================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
  echo -e "${GREEN}✓${NC} $1"
}

print_section() {
  echo -e "${YELLOW}→${NC} $1"
}

print_section "Checking Node.js"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18+ is required."
  exit 1
fi
print_step "Node.js $(node -v) found"

print_section "Checking backend dependencies"
if [ ! -d "server/node_modules" ]; then
  npm --prefix server install --legacy-peer-deps >/dev/null 2>&1
  print_step "Installed backend dependencies"
else
  print_step "Backend dependencies already installed"
fi

print_section "Checking frontend dependencies"
if [ ! -d "client/node_modules" ]; then
  npm --prefix client install --legacy-peer-deps >/dev/null 2>&1
  print_step "Installed frontend dependencies"
else
  print_step "Frontend dependencies already installed"
fi

print_section "Checking environment files"
if [ ! -f ".env" ]; then
  cp .env.example .env
  print_step "Created root .env"
fi

if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  print_step "Created server/.env"
fi

if [ ! -f "client/.env" ]; then
  cp client/.env.example client/.env
  print_step "Created client/.env"
fi

echo ""
echo "Ready to run:"
echo "1. Confirm MongoDB is available locally or update MONGODB_URI"
echo "2. Start the app with: npm run dev"
echo "3. Open http://localhost:5173"
echo ""
echo "Local topology:"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5001"
echo "Health:   http://localhost:5001/api/health"
echo ""
echo "Optional legacy ML service:"
echo "cd ml-service && python3 -m uvicorn main:app --reload --port 8000"
