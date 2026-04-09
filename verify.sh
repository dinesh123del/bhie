#!/bin/bash

BACKEND_PORT=5001
FRONTEND_PORT=5173

echo "=================================="
echo "Biz Plus local verification"
echo "=================================="
echo ""

echo "Frontend (${FRONTEND_PORT})"
if lsof -i :"$FRONTEND_PORT" 2>/dev/null | grep LISTEN >/dev/null; then
  echo "✅ Running"
else
  echo "❌ Not running"
fi
echo ""

echo "Backend (${BACKEND_PORT})"
if lsof -i :"$BACKEND_PORT" 2>/dev/null | grep LISTEN >/dev/null; then
  echo "✅ Running"
  if curl -s "http://localhost:${BACKEND_PORT}/api/health" | grep -q "OK"; then
    echo "✅ Health check passed"
  else
    echo "❌ Health check failed"
  fi
else
  echo "❌ Not running"
fi
echo ""

echo "MongoDB"
if pgrep -x "mongod" >/dev/null; then
  echo "✅ Running"
else
  echo "⚠️  Not detected locally (Atlas is fine if configured)"
fi
echo ""

echo "URLs"
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "Health:   http://localhost:${BACKEND_PORT}/api/health"
