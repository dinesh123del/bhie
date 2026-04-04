# Multi-Agent AI System Integration Guide

## 🎯 Overview

The Multi-Agent AI System for BHIE uses autonomous AI agents to analyze business data and provide actionable insights.

### Architecture
```
User Input (React) 
    ↓
API Endpoint: POST /api/ai/analyze
    ↓
Orchestrator
    ├─→ Financial Agent (Analysis)
    ├─→ Market Agent (Analysis)
    ├─→ Prediction Agent (Forecasting)
    └─→ Strategy Agent (Recommendations)
    ↓
Combined Response (React Display)
```

---

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install openai dotenv
```

### 2. Configure Environment Variables

Update `.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here

# Server Configuration
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
```

**Get your API key from:** https://platform.openai.com/api-keys

### 3. Backend File Structure

```
/server/src/
├── agents/
│   ├── financialAgent.ts      # Financial analysis
│   ├── marketAgent.ts          # Market analysis
│   ├── predictionAgent.ts      # Forecasting
│   ├── strategyAgent.ts        # Strategic recommendations
│   └── orchestrator.ts         # Coordinates all agents
├── utils/
│   └── openai.ts               # OpenAI API helper
└── routes/
    └── ai.ts                   # API Routes (updated)
```

### 4. API Endpoint

**POST** `/api/ai/analyze`

#### Request Body
```json
{
  "revenue": 50000,
  "expenses": 30000,
  "customerCount": 100,
  "previousRevenue": 45000,
  "category": "SaaS",
  "marketPosition": "Challenger"
}
```

#### Response
```json
{
  "timestamp": "2024-04-02T10:30:00.000Z",
  "businessData": {
    "revenue": 50000,
    "expenses": 30000,
    "customerCount": 100
  },
  "analysis": {
    "financial": {
      "profitMargin": "40%",
      "expenseRatio": "60%",
      "profitTrend": "positive",
      "keyFindings": [...],
      "risks": [...],
      "recommendations": [...]
    },
    "market": {
      "demandLevel": "high",
      "competitionIntensity": "medium",
      "marketTrend": "growing",
      "opportunities": [...],
      "threats": [...],
      "marketScore": "8"
    },
    "predictions": {
      "forecast3Month": {...},
      "forecast6Month": {...},
      "forecast12Month": {...},
      "growthTrajectory": "accelerating"
    },
    "strategies": {
      "executiveSummary": "...",
      "strategicPriority": "high",
      "strategies": [
        {
          "rank": 1,
          "title": "...",
          "actionPlan": "...",
          "expectedImpact": "$X",
          "confidence": "85%"
        }
      ]
    }
  },
  "status": "complete",
  "message": "AI Analysis Complete"
}
```

---

## 🎨 Frontend Setup

### 1. Available Components

#### AIAnalysisForm
Input form for business data:
```tsx
import { AIAnalysisForm } from '@/components/AIAnalysisForm';
import { AIAnalysisDashboard } from '@/components/AIAnalysisDashboard';
import { useState } from 'react';

export function AIPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
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

#### AIAnalysisDashboard
Displays analysis results with sections for:
- Financial Insights
- Market Analysis
- Predictions
- Strategic Recommendations

### 2. Service Integration

```tsx
import { aiService } from '@/services/aiService';

// Analyze business data
const result = await aiService.analyzeBusinessData({
  revenue: 50000,
  expenses: 30000,
  customerCount: 100,
  previousRevenue: 45000,
});

// Check AI service health
const health = await aiService.checkHealth();

// Quick analysis with minimal data
const quickResult = await aiService.quickAnalysis(50000, 30000, 100);
```

### 3. Axios Configuration

Ensure [client/src/lib/axios.ts](client/src/lib/axios.ts) is configured:

```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

export default api;
```

---

## 🧠 How Agents Work

### Financial Agent
- Analyzes profit margins
- Evaluates expense ratios
- Identifies financial risks
- Recommends cost optimization
- Output: Profitability insights and warnings

### Market Agent
- Assesses demand levels
- Analyzes competition
- Identifies market gaps
- Evaluates customer retention
- Output: Market positioning and opportunities

### Prediction Agent
- Forecasts 3, 6, 12-month revenue
- Predicts growth trajectory
- Assesses confidence levels
- Identifies risk factors
- Output: Future performance projections

### Strategy Agent
- Combines all insights
- Prioritizes top 3 strategies
- Calculates expected ROI
- Recommends immediate actions
- Output: Actionable strategic plan

---

## 📊 Sample Response

See [AI_SAMPLE_RESPONSES.md](./AI_SAMPLE_RESPONSES.md) for complete examples.

---

## 🔐 Security

- ✅ API key stored in backend `.env` only
- ✅ No API key exposed to frontend
- ✅ HTTPS recommended for production
- ✅ Rate limiting on `/api/ai/analyze`

---

## ⚠️ Error Handling

```tsx
try {
  const result = await aiService.analyzeBusinessData(data);
  if (result.status === 'error') {
    console.error('Analysis failed:', result.message);
  }
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error
}
```

---

## 🔄 Rate Limiting

- Implement rate limiting to prevent API abuse
- Current: 100 requests per 15 minutes globally
- Consider: Per-user rate limits for analytics API

---

## 📈 Monitoring

Track:
- API response times
- OpenAI token usage
- Error rates
- User analysis frequency

---

## 🚀 Production Deployment

### Vercel (Frontend)
```bash
vercel deploy
```

### Render/Railway (Backend)
```bash
# Add to render.yaml
services:
  - type: web
    name: bhie-api
    env: nodejs
    buildCommand: npm run build
    startCommand: npm start
```

### Set Environment Variables in Dashboard
- `OPENAI_API_KEY`
- `MONGODB_URI`
- `JWT_SECRET`

---

## 📝 Troubleshooting

### "OpenAI API key not configured"
- Ensure `OPENAI_API_KEY` is in `.env`
- Check API key validity at: https://platform.openai.com/account/api-keys

### "Analysis failed" Error
- Check backend logs: `npm run dev`
- Verify OpenAI API is accessible
- Confirm business data validation passes

### Slow Response
- OpenAI API calls can take 5-10 seconds
- Implement loading states in UI
- Consider async/await patterns

### Database Not Saving
- AIAnalysis model not in Prisma schema
- Optional: Add to schema.prisma for persistence

```prisma
model AIAnalysis {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  businessData  Json
  analysisResult Json
  timestamp     DateTime @default(now())
  userId        String?  // Optional: Link to user
}
```

---

## 📚 References

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## ✅ Checklist

- [ ] OpenAI API key obtained
- [ ] Backend dependencies installed
- [ ] `.env` configured with API key
- [ ] Frontend components imported
- [ ] Axios configured
- [ ] Form tested with sample data
- [ ] Dashboard displays results
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Deployed to production
