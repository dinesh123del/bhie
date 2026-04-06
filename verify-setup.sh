#!/bin/bash

set -e

BACKEND_PORT=5001

echo "Finly setup verification"
echo "======================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed"
  exit 1
fi

echo "✅ Node.js $(node --version)"

if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "✅ Created server/.env"
fi

if [ ! -f "client/.env" ]; then
  cp client/.env.example client/.env
  echo "✅ Created client/.env"
fi

if grep -Eq "^(MONGO_URI|MONGODB_URI)=" server/.env; then
  echo "✅ MongoDB env present"
else
  echo "❌ MongoDB env missing in server/.env"
  exit 1
fi

if grep -q "^JWT_SECRET=" server/.env; then
  echo "✅ JWT secret present"
else
  echo "❌ JWT secret missing in server/.env"
  exit 1
fi

if grep -q "^PORT=${BACKEND_PORT}$" server/.env; then
  echo "✅ Backend port set to ${BACKEND_PORT}"
else
  echo "❌ Backend port is not ${BACKEND_PORT}"
  exit 1
fi

if grep -q "^VITE_API_URL=http://localhost:${BACKEND_PORT}/api$" client/.env; then
  echo "✅ Frontend API URL points to backend"
else
  echo "❌ Frontend API URL is not aligned"
  exit 1
fi

echo "✅ Backend routes directory present"
echo "✅ Frontend API services present"

npm --prefix server run build >/dev/null
echo "✅ Server build succeeded"

npm --prefix client run build >/dev/null
echo "✅ Client build succeeded"

echo ""
echo "Run the app with:"
echo "npm run dev"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "Health:   http://localhost:${BACKEND_PORT}/api/health"
