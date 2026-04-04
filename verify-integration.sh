#!/bin/bash

BACKEND_PORT=5001
FRONTEND_PORT=5173

echo "BHIE frontend-backend integration test"
echo "======================================"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

pass() {
  echo "✅ $1"
  ((TESTS_PASSED++))
}

fail() {
  echo "❌ $1"
  ((TESTS_FAILED++))
}

if curl -s "http://localhost:${BACKEND_PORT}/api/health" | grep -q "OK"; then
  pass "Backend health check"
else
  fail "Backend health check"
fi

if curl -s -I -X OPTIONS "http://localhost:${BACKEND_PORT}/api/health" \
  -H "Origin: http://localhost:${FRONTEND_PORT}" \
  -H "Access-Control-Request-Method: GET" | grep -qi "Access-Control-Allow-Origin"; then
  pass "CORS headers"
else
  fail "CORS headers"
fi

if lsof -i :"$FRONTEND_PORT" >/dev/null 2>&1; then
  pass "Frontend port ${FRONTEND_PORT}"
else
  fail "Frontend port ${FRONTEND_PORT}"
fi

if lsof -i :"$BACKEND_PORT" >/dev/null 2>&1; then
  pass "Backend port ${BACKEND_PORT}"
else
  fail "Backend port ${BACKEND_PORT}"
fi

if [ -f "client/.env" ] && grep -q "^VITE_API_URL=http://localhost:${BACKEND_PORT}/api$" client/.env; then
  pass "Frontend VITE_API_URL"
else
  fail "Frontend VITE_API_URL"
fi

if [ -f "server/.env" ] && grep -q "^PORT=${BACKEND_PORT}$" server/.env; then
  pass "Backend PORT"
else
  fail "Backend PORT"
fi

if [ -f "server/.env" ] && grep -Eq "^(MONGO_URI|MONGODB_URI)=" server/.env; then
  pass "MongoDB env configured"
else
  fail "MongoDB env configured"
fi

if [ -f "server/.env" ] && grep -q "^JWT_SECRET=" server/.env; then
  pass "JWT secret configured"
else
  fail "JWT secret configured"
fi

if curl -s "http://localhost:${BACKEND_PORT}/api/ai/health" | grep -q "agentsReady"; then
  pass "AI health route"
else
  fail "AI health route"
fi

echo ""
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"

if [ "$TESTS_FAILED" -gt 0 ]; then
  exit 1
fi
