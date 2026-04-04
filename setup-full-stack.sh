#!/bin/bash

# BHIE Full-Stack Setup Script

echo "🚀 Starting BHIE Full-Stack Setup..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Setup Backend
echo -e "\n${YELLOW}📦 Setting up Backend...${NC}"
cd server

# Remove Prisma if exists
if [ -d "node_modules/@prisma" ]; then
  echo -e "${YELLOW}Removing Prisma...${NC}"
  npm uninstall @prisma/client prisma
fi

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install mongoose

# Copy env file
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ .env created - Update with your values${NC}"
fi

# Build TypeScript
echo -e "${YELLOW}Building TypeScript...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend build successful${NC}"
else
  echo -e "${RED}❌ Backend build failed${NC}"
  exit 1
fi

cd ..

# Setup Frontend
echo -e "\n${YELLOW}📦 Setting up Frontend...${NC}"
cd client

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Copy env file
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ .env created${NC}"
fi

cd ..

echo -e "\n${GREEN}✅ Setup complete!${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update server/.env with MongoDB connection string"
echo "2. Update server/.env with JWT_SECRET and API keys"
echo "3. Run: cd server && npm run dev"
echo "4. Run: cd client && npm run dev (in new terminal)"
echo "5. Open http://localhost:5173 in browser"

echo -e "\n${YELLOW}Verify setup:${NC}"
echo "Health check: curl http://localhost:4000/api/health"
