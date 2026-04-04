# 🚀 AI System Quick Reference Card

## 📍 File Locations

| Component | Location |
|-----------|----------|
| Orchestrator | `/server/src/agents/orchestrator.ts` |
| Financial Agent | `/server/src/agents/financialAgent.ts` |
| Market Agent | `/server/src/agents/marketAgent.ts` |
| Prediction Agent | `/server/src/agents/predictionAgent.ts` |
| Strategy Agent | `/server/src/agents/strategyAgent.ts` |
| OpenAI Helper | `/server/src/utils/openai.ts` |
| API Route | `/server/routes/ai.js` |
| AI Types | `/client/src/types/ai.ts` |
| AI Service | `/client/src/services/aiService.ts` |
| AI Hook | `/client/src/hooks/useAIAnalysis.ts` |
| Form Component | `/client/src/components/AIAnalysisForm.tsx` |
| Dashboard Component | `/client/src/components/AIAnalysisDashboard.tsx` |

---

## 🔗 API Endpoints

### Health Check
```bash
GET /api/ai/health
```
Response: `{ status: "healthy", agents: [...], openaiConfigured: true }`

### Full Analysis
```bash
POST /api/ai/analyze
Body: { revenue, expenses, customerCount, previousRevenue?, category?, marketPosition? }
```
Response: Complete analysis with 4 agent insights

### Legacy Endpoints (Compatibility)
```bash
GET  /api/ai/insights          # Dashboard insights
POST /api/ai/chat              # Chat interface
GET  /api/ai/prediction        # Basic prediction
```

---

## 💻 Code Snippets

### Frontend: Call Analysis API
```typescript
import { aiService } from './services/aiService';

const result = await aiService.analyzeBusinessData({
  revenue: 50000,
  expenses: 30000,
  customerCount: 100,
  previousRevenue: 45000
});

console.log(result.analysis.financial);  // Financial insights
console.log(result.analysis.market);     // Market insights
console.log(result.analysis.predictions); // Forecasts
console.log(result.analysis.strategies); // Recommendations
```

### Backend: Custom Agent Call
```typescript
import { analyzeFinancialData } from './agents/financialAgent';

const financialInsights = await analyzeFinancialData({
  revenue: 50000,
  expenses: 30000,
  customerCount: 100,
  previousRevenue: 45000
});

console.log(financialInsights);
```

### Backend: Run All Agents
```typescript
import { runAgents } from './agents/orchestrator';

const result = await runAgents({
  revenue: 50000,
  expenses: 30000,
  customerCount: 100
});

// result.analysis contains:
// - financial: { profitMargin, expenseRatio, risks, recommendations, ... }
// - market: { demandLevel, opportunities, threats, ... }
// - predictions: { forecast3Month, forecast6Month, forecast12Month, ... }
// - strategies: { strategies: [...], immediateActions: [...], ... }
```

### React Component: Full Integration
```tsx
import { AIAnalysisForm } from './components/AIAnalysisForm';
import { AIAnalysisDashboard } from './components/AIAnalysisDashboard';
import { useState } from 'react';

export function AIPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      <AIAnalysisForm 
        onAnalysisComplete={setResult}
        onLoading={setLoading}
      />
      {result && (
        <AIAnalysisDashboard 
          analysisResult={result}
          loading={loading}
        />
      )}
    </div>
  );
}
```

---

## 🔧 Configuration

### .env (Server)
```env
# Required
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=4000

# Optional
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Environment Setup
```bash
# Get API key
# 1. Go to https://platform.openai.com/account/api-keys
# 2. Click "Create new secret key"
# 3. Copy the key (you won't see it again)
# 4. Add to server/.env: OPENAI_API_KEY=sk-proj-xxx
```

---

## 📊 Response Structure

### Analysis Result
```json
{
  "timestamp": "ISO 8601 string",
  "businessData": { revenue, expenses, customerCount },
  "analysis": {
    "financial": { profitMargin, expenseRatio, profitTrend, risks, recommendations },
    "market": { demandLevel, opportunities, threats, marketScore },
    "predictions": { forecast3Month, forecast6Month, forecast12Month, growthTrajectory },
    "strategies": { strategies: [...], immediateActions: [...], estimatedROI }
  },
  "status": "complete" | "error",
  "message": "Status message"
}
```

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "OPENAI_API_KEY is not defined" | Add key to `.env`, restart server |
| 400 Bad Request | Check all required fields present |
| 500 Server Error | Check server logs, verify API key valid |
| Network TimeOut | First call may be slow, wait 30 seconds |
| "Unexpected token" | OpenAI response parsing failed |
| No results returned | Check API status at status.openai.com |

---

## 🧪 Testing

### Quick API Test
```bash
# Health check
curl http://localhost:4000/api/ai/health

# Run analysis
curl -X POST http://localhost:4000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"revenue":50000,"expenses":30000,"customerCount":100,"previousRevenue":45000}'
```

### Postman Collection
```json
{
  "info": { "name": "BHIE AI API" },
  "item": [
    {
      "name": "Health Check",
      "request": { "method": "GET", "url": "http://localhost:4000/api/ai/health" }
    },
    {
      "name": "Analyze Business",
      "request": {
        "method": "POST",
        "url": "http://localhost:4000/api/ai/analyze",
        "body": { "raw": "{\"revenue\":50000,\"expenses\":30000,\"customerCount\":100}" }
      }
    }
  ]
}
```

---

## 🎯 Agent Customization

### Modify Financial Agent Prompt
File: `/server/src/agents/financialAgent.ts`
```typescript
export async function analyzeFinancialData(businessData: Record<string, any>) {
  const prompt = `
    // Your custom prompt here
    // Include analysis requirements
    // Specify output format
  `;
  // ...
}
```

### Add New Agent
1. Create file: `/server/src/agents/newAgent.ts`
2. Export async function that calls `callOpenAI()`
3. Add to orchestrator in `/server/src/agents/orchestrator.ts`
4. Update types in `/client/src/types/ai.ts`

---

## 📈 Performance Tips

- **Cache Results:** Store analyses in DB to avoid duplicate API calls
- **Batch Requests:** Combine multiple analyses in one call
- **Optimize Prompts:** Fewer tokens = faster response + lower cost
- **Use GPT-3.5:** Faster/cheaper than GPT-4 for many tasks
- **Monitor Usage:** Check OpenAI dashboard monthly

---

## 🔒 Security Checklist

- [ ] OPENAI_API_KEY in `.env` (not committed to git)
- [ ] `.gitignore` includes `.env`
- [ ] No API keys in frontend code
- [ ] All API calls route through backend
- [ ] Input validation on backend
- [ ] Error messages don't expose secrets
- [ ] API key rotation plan in place

---

## 📚 Data Types

### BusinessData
```typescript
interface BusinessData {
  revenue: number;              // Required
  expenses: number;             // Required
  customerCount: number;        // Required
  previousRevenue?: number;     // Optional
  category?: string;            // Optional: e.g., "SaaS", "Retail"
  marketPosition?: string;      // Optional: e.g., "Growing", "Stable"
  growthRate?: number;          // Optional: estimated monthly growth %
}
```

### AnalysisResult
```typescript
interface AnalysisResult {
  timestamp: string;            // ISO 8601 timestamp
  businessData: BusinessData;   // Echo of input
  analysis: {
    financial: FinancialInsights;
    market: MarketInsights;
    predictions: PredictiveInsights;
    strategies: StrategicRecommendations;
  };
  status: 'complete' | 'error';
  message: string;
  analysisId?: string;          // Database ID if saved
}
```

---

## 🚀 Deployment

### Environment Variables for Production
```env
OPENAI_API_KEY=sk-proj-xxxxx (keep secure!)
MONGODB_URI=mongodb+srv://user:pass@host/db
JWT_SECRET=strong_random_string_min_32_chars
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com
```

### Build & Deploy
```bash
# Backend
cd server
npm run build
node dist/server.js

# Frontend
cd client
npm run build
# Deploy dist folder to static hosting
```

---

## 📞 Quick Help

- **Docs:** See `MULTI_AGENT_AI_IMPLEMENTATION.md`
- **Samples:** See `AI_SAMPLE_RESPONSES_DETAILED.md`
- **Full Guide:** See `AI_INTEGRATION_GUIDE.md`
- **Setup:** Run `bash setup-ai-system.sh`
- **Status:** Check `/api/ai/health` endpoint

---

**Last Updated:** April 2, 2026
**Status:** ✅ Production Ready
