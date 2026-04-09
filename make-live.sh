#!/bin/bash

# Biz Plus Production "Make Live" script
# This script builds the entire application and starts it in production mode.

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Biz Plus Production Launch Sequence...${NC}"
echo "==========================================="

# 1. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found in root!${NC}"
    echo -e "${YELLOW}Please create one using .env.example as a template.${NC}"
    exit 1
fi

# 2. Install Dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install --prefix server --legacy-peer-deps >/dev/null 2>&1
npm install --prefix client --legacy-peer-deps >/dev/null 2>&1
echo -e "${GREEN}✅ Dependencies installed.${NC}"

# 3. Build Client (Frontend)
echo -e "${BLUE}🏗️  Building Frontend (Vite)...${NC}"
cd client
npm run build
cd ..
echo -e "${GREEN}✅ Frontend build complete.${NC}"

# 4. Build Server (Backend)
echo -e "${BLUE}🏗️  Building Backend (TypeScript)...${NC}"
cd server
npm run build
cd ..
echo -e "${GREEN}✅ Backend build complete.${NC}"

# 5. Launch Production Server
echo -e "${BLUE}🚀 Launching Biz Plus in PRODUCTION mode...${NC}"
echo -e "${YELLOW}Note: The server will serve the frontend from client/dist.${NC}"
echo "-------------------------------------------"

# Source the .env for the local session to ensure NODE_ENV is set or override it
export NODE_ENV=production

cd server
npm start
