#!/bin/bash

# Biz Plus Backend Deployment Script for Render
# Usage: ./deploy-backend.sh

set -e

echo "🚀 Biz Plus Backend Deployment Script"
echo "=================================="

# Check if .env.production exists
if [ ! -f "server/.env.production" ]; then
    echo "❌ server/.env.production not found"
    echo "Creating from .env.example..."
    cp server/.env.example server/.env.production
    echo "⚠️  Please edit server/.env.production with your production values"
    echo "   Required: MONGO_URI, JWT_SECRET, OPENAI_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET"
    exit 1
fi

# Check for required environment variables
echo "📋 Checking required environment variables..."
source server/.env.production

required_vars=("MONGO_URI" "JWT_SECRET" "OPENAI_API_KEY" "RAZORPAY_KEY_ID" "RAZORPAY_KEY_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]] || [[ "${!var}" == *"placeholder"* ]] || [[ "${!var}" == *"your-"* ]]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing or placeholder values for: ${missing_vars[*]}"
    echo "Please update server/.env.production with production values"
    exit 1
fi

echo "✅ All required environment variables are set"

# Build the project
echo "🔨 Building backend..."
cd server
npm install
npm run build
cd ..

echo "✅ Build successful"
echo ""
echo "📝 Next Steps for Render Deployment:"
echo "1. Go to https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Set Root Directory: server"
echo "5. Set Build Command: npm install && npm run build"
echo "6. Set Start Command: npm start"
echo "7. Add environment variables from server/.env.production"
echo "8. Click Deploy"
echo ""
echo "📝 Or for Docker deployment:"
echo "docker build -t biz-plus-api ."
echo "docker run -d -p 5001:5001 --env-file server/.env.production --name biz-plus-api biz-plus-api"
