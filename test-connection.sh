#!/bin/bash

BACKEND_PORT=5001

echo "BHIE connection test"
echo "===================="
echo ""

echo "1. Backend health"
curl -s "http://localhost:${BACKEND_PORT}/api/health" | jq . || echo "Failed"
echo ""

echo "2. CORS preflight"
curl -s -X OPTIONS "http://localhost:${BACKEND_PORT}/api/auth/login" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep "Access-Control" || true
echo ""

echo "3. Registration"
RANDOM_EMAIL="test_$(date +%s)@example.com"
curl -s -X POST "http://localhost:${BACKEND_PORT}/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password123\"
  }" | jq .
echo ""

echo "4. Invalid login request"
curl -s -X POST "http://localhost:${BACKEND_PORT}/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "password": "test"
  }' | jq .
