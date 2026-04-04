#!/bin/bash

# 🚀 BHIE Multi-Agent AI System - Setup & Testing Script
# This script helps you set up and test the AI integration

set -e

echo "=========================================="
echo "🚀 BHIE Multi-Agent AI System Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${BLUE}Step 1: Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
echo ""

# Step 2: Check .env file
echo -e "${BLUE}Step 2: Checking environment configuration...${NC}"
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ server/.env file not found${NC}"
    echo -e "${YELLOW}Please create server/.env with:${NC}"
    echo "  OPENAI_API_KEY=sk-proj-xxxxx"
    echo "  MONGODB_URI=your_mongodb_uri"
    echo "  JWT_SECRET=your_secret"
    echo "  PORT=4000"
    exit 1
fi

# Check for OPENAI_API_KEY
if grep -q "^OPENAI_API_KEY=" server/.env; then
    OPENAI_KEY=$(grep "^OPENAI_API_KEY=" server/.env | cut -d'=' -f2)
    if [ -z "$OPENAI_KEY" ] || [ "$OPENAI_KEY" = "sk-xxxxx" ]; then
        echo -e "${RED}❌ OPENAI_API_KEY is not configured${NC}"
        echo -e "${YELLOW}Please set your OpenAI API key in server/.env${NC}"
        echo -e "${YELLOW}Get key from: https://platform.openai.com/account/api-keys${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ OpenAI API Key configured${NC}"
else
    echo -e "${YELLOW}⚠️  OPENAI_API_KEY not found in .env${NC}"
    echo -e "${YELLOW}Adding it now...${NC}"
    echo "" >> server/.env
    echo "# OpenAI Configuration" >> server/.env
    echo "OPENAI_API_KEY=sk-proj-YOUR_API_KEY_HERE" >> server/.env
    echo -e "${RED}❌ Please update OPENAI_API_KEY in server/.env and run again${NC}"
    exit 1
fi
echo ""

# Step 3: Install server dependencies
echo -e "${BLUE}Step 3: Installing server dependencies...${NC}"
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}Installing npm packages...${NC}"
    cd server
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check for openai package
if ! grep -q '"openai"' server/package.json; then
    echo -e "${YELLOW}Adding openai package...${NC}"
    cd server
    npm install openai
    cd ..
    echo -e "${GREEN}✅ OpenAI package added${NC}"
else
    echo -e "${GREEN}✅ OpenAI package found${NC}"
fi
echo ""

# Step 4: Verify agent files exist
echo -e "${BLUE}Step 4: Verifying agent files...${NC}"
AGENT_FILES=(
    "server/src/agents/orchestrator.ts"
    "server/src/agents/financialAgent.ts"
    "server/src/agents/marketAgent.ts"
    "server/src/agents/predictionAgent.ts"
    "server/src/agents/strategyAgent.ts"
    "server/src/utils/openai.ts"
)

for file in "${AGENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
        exit 1
    fi
done
echo ""

# Step 5: Verify frontend types
echo -e "${BLUE}Step 5: Verifying frontend configuration...${NC}"
if [ -f "client/src/types/ai.ts" ]; then
    echo -e "${GREEN}✅ AI type definitions found${NC}"
else
    echo -e "${YELLOW}⚠️  AI type definitions not found - frontend may have issues${NC}"
fi

if [ -f "client/src/services/aiService.ts" ]; then
    echo -e "${GREEN}✅ AI service found${NC}"
else
    echo -e "${YELLOW}⚠️  AI service not found${NC}"
fi

if [ -f "client/src/hooks/useAIAnalysis.ts" ]; then
    echo -e "${GREEN}✅ AI React hook found${NC}"
else
    echo -e "${YELLOW}⚠️  AI React hook not found${NC}"
fi
echo ""

# Step 6: Test API Health Check
echo -e "${BLUE}Step 6: Testing API connection...${NC}"
echo -e "${YELLOW}Note: Make sure the server is running (npm run dev)${NC}"
echo ""

echo -e "${BLUE}To test the AI system:${NC}"
echo ""
echo -e "${GREEN}Backend:${NC}"
echo "  cd server"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Frontend:${NC}"
echo "  cd client"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Test API in another terminal:${NC}"
echo "  curl -X GET http://localhost:4000/api/ai/health"
echo ""
echo -e "${GREEN}Test analysis:${NC}"
echo "  curl -X POST http://localhost:4000/api/ai/analyze \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"revenue\": 50000, \"expenses\": 30000, \"customerCount\": 100, \"previousRevenue\": 45000}'"
echo ""

# Step 7: Print summary
echo -e "${BLUE}=========================================="
echo "✅ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Start backend: cd server && npm run dev"
echo "2. Start frontend: cd client && npm run dev"
echo "3. Navigate to AI analysis page in your browser"
echo "4. Enter business data and click 'Analyze'"
echo "5. Review AI insights in the dashboard"
echo ""
echo -e "${YELLOW}Need help?${NC}"
echo "- Check AI_INTEGRATION_GUIDE.md for detailed docs"
echo "- Review AI_SAMPLE_RESPONSES_DETAILED.md for sample outputs"
echo "- Check server/src/agents/ for agent implementation"
echo ""
