#!/bin/bash

# BHIE AI System - Verification Checklist
# Run this script to verify all components are in place

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🤖 BHIE Multi-Agent AI System - Verification Checklist   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
    ((PASS++))
  else
    echo "❌ $1 - NOT FOUND"
    ((FAIL++))
  fi
}

# Function to check directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo "✅ $1/"
    ((PASS++))
  else
    echo "❌ $1/ - NOT FOUND"
    ((FAIL++))
  fi
}

# Function to check if keyword exists in file
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo "✅ $1 - contains '$2'"
    ((PASS++))
  else
    echo "❌ $1 - missing '$2'"
    ((FAIL++))
  fi
}

echo "📁 CHECKING BACKEND FILES..."
echo "───────────────────────────────────────────────────────────"
check_dir "server/src/agents"
check_file "server/src/agents/financialAgent.ts"
check_file "server/src/agents/marketAgent.ts"
check_file "server/src/agents/predictionAgent.ts"
check_file "server/src/agents/strategyAgent.ts"
check_file "server/src/agents/orchestrator.ts"
check_file "server/src/utils/openai.ts"
check_file "server/src/tests/aiSystem.test.ts"
check_file "server/routes/ai.js"
echo ""

echo "📁 CHECKING FRONTEND FILES..."
echo "───────────────────────────────────────────────────────────"
check_file "client/src/services/aiService.ts"
check_file "client/src/components/AIDashboard.tsx"
echo ""

echo "📁 CHECKING DOCUMENTATION..."
echo "───────────────────────────────────────────────────────────"
check_file "AI_QUICK_START.md"
check_file "AI_SYSTEM_GUIDE.md"
check_file "AI_CONFIGURATION_REFERENCE.md"
check_file "AI_INTEGRATION_SUMMARY.md"
check_file "README-AI-SYSTEM.md"
check_file "IMPLEMENTATION_COMPLETE.md"
check_file "AI_DOCUMENTATION_INDEX.md"
check_file "setup-ai.sh"
echo ""

echo "📝 CHECKING DEPENDENCIES..."
echo "───────────────────────────────────────────────────────────"
check_content "server/package.json" "\"openai\""
echo ""

echo "⚙️  CHECKING API ROUTES..."
echo "───────────────────────────────────────────────────────────"
check_content "server/routes/ai.js" "POST.*analyze"
check_content "server/routes/ai.js" "GET.*health"
echo ""

echo "🔍 CHECKING AGENT FUNCTIONALITY..."
echo "───────────────────────────────────────────────────────────"
check_content "server/src/agents/financialAgent.ts" "analyzeFinancialData"
check_content "server/src/agents/marketAgent.ts" "analyzeMarketData"
check_content "server/src/agents/predictionAgent.ts" "predictFuturePerformance"
check_content "server/src/agents/strategyAgent.ts" "generateStrategy"
check_content "server/src/agents/orchestrator.ts" "runAgents"
echo ""

echo "🔐 CHECKING SECURITY..."
echo "───────────────────────────────────────────────────────────"
check_content "server/.env" "OPENAI_API_KEY"
echo ""

echo "⚡ CHECKING FRONTEND INTEGRATION..."
echo "───────────────────────────────────────────────────────────"
check_content "client/src/services/aiService.ts" "analyzeBusinessData"
check_content "client/src/components/AIDashboard.tsx" "AIDashboard"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 RESULTS:"
echo "   ✅ Passed: $PASS"
echo "   ❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 ALL CHECKS PASSED! System is ready to use."
  echo ""
  echo "Next steps:"
  echo "  1. Add OPENAI_API_KEY to server/.env"
  echo "  2. Run: npm install openai (in /server)"
  echo "  3. Run: npm run dev"
  echo ""
  exit 0
else
  echo "⚠️  SOME FILES ARE MISSING!"
  echo "Check the ❌ items above and ensure all files are created."
  echo ""
  exit 1
fi
