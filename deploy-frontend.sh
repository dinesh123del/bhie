#!/bin/bash

# Biz Plus Frontend Deployment Script for Vercel
# Usage: ./deploy-frontend.sh

set -e

echo "🚀 Biz Plus Frontend Deployment Script"
echo "=================================="

# Check if .env.production exists
if [ ! -f "client/.env.production" ]; then
    echo "❌ client/.env.production not found"
    echo "Creating from .env.example..."
    cp client/.env.example client/.env.production
    echo "⚠️  Please edit client/.env.production with your production values"
    echo "   Required: VITE_API_URL (your deployed backend URL)"
    exit 1
fi

# Check VITE_API_URL
echo "📋 Checking VITE_API_URL..."
source client/.env.production

if [[ -z "$VITE_API_URL" ]] || [[ "$VITE_API_URL" == *"your-backend"* ]] || [[ "$VITE_API_URL" == *"localhost"* ]]; then
    echo "❌ VITE_API_URL is not set or still points to localhost/placeholder"
    echo "Please update client/.env.production with your deployed backend URL"
    echo "Example: VITE_API_URL=https://api.bizplus.ai"
    exit 1
fi

echo "✅ VITE_API_URL is set to: $VITE_API_URL"

# Build the project
echo "🔨 Building frontend..."
cd client
npm install
npm run build
cd ..

echo "✅ Build successful"
echo ""
echo "📝 Next Steps for Vercel Deployment:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Login: vercel login"
echo "3. Deploy from project root: vercel --prod"
echo "4. In Vercel Dashboard, add environment variables:"
echo "   - VITE_API_URL = $VITE_API_URL"
echo "   - VITE_RAZORPAY_KEY = your production Razorpay key"
echo "   - VITE_GOOGLE_CLIENT_ID = your production Google OAuth client ID"
echo "5. Redeploy from Vercel dashboard"
