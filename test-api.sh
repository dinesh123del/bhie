#!/bin/bash

set -e

BACKEND_PORT=5001

echo "BHIE API smoke test"
echo "==================="
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:${BACKEND_PORT}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"test-$(date +%s)@bhie.com\",
    \"password\": \"password123\"
  }")

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register test user"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo "✅ Registered test user"

curl -s "http://localhost:${BACKEND_PORT}/api/health" | jq .
curl -s "http://localhost:${BACKEND_PORT}/api/auth/me" -H "Authorization: Bearer $TOKEN" | jq .

curl -s -X POST "http://localhost:${BACKEND_PORT}/api/company/setup" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smoke Test Co",
    "industry": "Technology",
    "revenue": 120000,
    "expenses": 70000,
    "employees": 12,
    "growthRate": 18
  }' | jq .

RECORD_RESPONSE=$(curl -s -X POST "http://localhost:${BACKEND_PORT}/api/records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smoke Test Record",
    "category": "Operations",
    "type": "income",
    "amount": 12500,
    "description": "Created by test-api.sh"
  }')

echo "$RECORD_RESPONSE" | jq .
RECORD_ID=$(echo "$RECORD_RESPONSE" | jq -r '._id // empty')

curl -s "http://localhost:${BACKEND_PORT}/api/records" -H "Authorization: Bearer $TOKEN" | jq .
curl -s "http://localhost:${BACKEND_PORT}/api/analytics/summary" -H "Authorization: Bearer $TOKEN" | jq .
curl -s "http://localhost:${BACKEND_PORT}/api/analytics/trends" -H "Authorization: Bearer $TOKEN" | jq .
curl -s "http://localhost:${BACKEND_PORT}/api/analytics/score" -H "Authorization: Bearer $TOKEN" | jq .
curl -s "http://localhost:${BACKEND_PORT}/api/dashboard" -H "Authorization: Bearer $TOKEN" | jq .
curl -s "http://localhost:${BACKEND_PORT}/api/ai/health" | jq .

RAW_STATUS=$(curl -s -o /tmp/bhie-ai-raw.json -w "%{http_code}" -X POST "http://localhost:${BACKEND_PORT}/api/ai/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "revenue": 120000,
    "expenses": 70000,
    "customerCount": 12
  }')

WRAPPED_STATUS=$(curl -s -o /tmp/bhie-ai-wrapped.json -w "%{http_code}" -X POST "http://localhost:${BACKEND_PORT}/api/ai/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessData": {
      "revenue": 120000,
      "expenses": 70000,
      "customerCount": 12
    }
  }')

echo "AI raw payload status: $RAW_STATUS"
cat /tmp/bhie-ai-raw.json | jq .
echo "AI wrapped payload status: $WRAPPED_STATUS"
cat /tmp/bhie-ai-wrapped.json | jq .

if [ -n "$RECORD_ID" ]; then
  curl -s -X DELETE "http://localhost:${BACKEND_PORT}/api/records/${RECORD_ID}" \
    -H "Authorization: Bearer $TOKEN" | jq .
fi

echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "Health:   http://localhost:${BACKEND_PORT}/api/health"
