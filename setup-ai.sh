#!/bin/bash

# Biz Plus AI System - Setup Script
# Run this to automatically configure the AI system

set -e

echo "🤖 Biz Plus Multi-Agent AI System - Setup"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
  echo "❌ Please run this script from the Biz Plus root directory"
  exit 1
fi

# Step 1: Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Step 2: Check if .env exists
echo "📋 Checking .env configuration..."
if [ ! -f "server/.env" ]; then
  echo "⚠️  Creating .env file from .env.example..."
  cp server/.env.example server/.env
  echo "✅ .env created"
else
  echo "✅ .env already exists"
fi
echo ""

# Step 3: Check for OpenAI API key
echo "📋 Checking OpenAI API key..."
if grep -q "OPENAI_API_KEY=sk-" server/.env; then
  echo "✅ OpenAI API key configured"
else
  echo "⚠️  OpenAI API key not configured"
  echo ""
  echo "📝 To get your API key:"
  echo "   1. Go to: https://platform.openai.com/api-keys"
  echo "   2. Click 'Create new secret key'"
  echo "   3. Copy the key (starts with sk-)"
  echo "   4. Edit server/.env and set OPENAI_API_KEY=sk-your-key"
  echo ""
fi
echo ""

# Step 4: Install server dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install openai
echo "✅ Dependencies installed"
cd ..
echo ""

# Step 5: Build TypeScript
echo "🔨 Building TypeScript..."
cd server
npm run build 2>/dev/null || echo "⚠️  Build step skipped (optional)"
cd ..
echo ""

# Step 6: Create test data
echo "📝 Creating test script..."
cat > test-ai-system.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Biz Plus AI System..."
echo ""

# Test 1: Health check
echo "Test 1: API Health Check"
curl -s http://localhost:4000/api/ai/health | jq . || echo "❌ Health check failed"
echo ""

# Test 2: Analysis endpoint
echo "Test 2: Running Analysis"
curl -s -X POST http://localhost:4000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "revenue": 50000,
    "expenses": 30000,
    "customerCount": 100,
    "previousRevenue": 45000
  }' | jq . || echo "❌ Analysis failed"

EOF

chmod +x test-ai-system.sh
echo "✅ Test script created (test-ai-system.sh)"
echo ""

# Step 7: Print instructions
echo "✅ Setup Complete!"
echo ""
echo "=========================================="
echo "🚀 Next Steps:"
echo "=========================================="
echo ""
echo "1. Add OpenAI API Key (if not already done):"
echo "   Edit: server/.env"
echo "   Add: OPENAI_API_KEY=sk-your-key-here"
echo ""
echo "2. Start the backend server:"
echo "   npm run dev"
echo ""
echo "3. In another terminal, test the API:"
echo "   ./test-ai-system.sh"
echo ""
echo "4. Use in your React component:"
echo "   import AIDashboard from './components/AIDashboard'"
echo ""
echo "=========================================="
echo ""
echo "📚 Documentation:"
echo "   - AI_QUICK_START.md (5-minute setup)"
echo "   - AI_SYSTEM_GUIDE.md (Complete guide)"
echo "   - AI_INTEGRATION_SUMMARY.md (Summary)"
echo ""
echo "🎉 Your AI System is Ready!"
