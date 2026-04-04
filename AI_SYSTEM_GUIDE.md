/**
 * BHIE AI SYSTEM - IMPLEMENTATION GUIDE
 * 
 * Complete guide to integrate Multi-Agent AI system
 * into your BHIE MERN application
 */

# 🚀 BHIE Multi-Agent AI System - Implementation Guide

## 📋 Table of Contents
1. [System Overview](#overview)
2. [Backend Setup](#backend-setup)
3. [Frontend Integration](#frontend-integration)
4. [API Reference](#api-reference)
5. [Sample Responses](#sample-responses)
6. [Testing Guide](#testing-guide)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview {#overview}

The BHIE Multi-Agent AI System consists of:

### **4 AI Agents:**
1. **Financial Agent** - Analyzes profit, expenses, risks
2. **Market Agent** - Assesses demand, competition, opportunities
3. **Prediction Agent** - Forecasts revenue trends
4. **Strategy Agent** - Combines all insights into actionable strategies

### **Architecture Flow:**
```
User Input (Business Data)
        ↓
Orchestrator validates data
        ↓
┌──────────────────────────────────────┐
│ Run All Agents in Parallel:          │
│ - Financial Analysis                 │
│ - Market Analysis                    │
│ - Predictions                        │
└──────────────────────────────────────┘
        ↓
Strategy Agent combines results
        ↓
Return comprehensive analysis
        ↓
Display in Frontend Dashboard
```

---

## ⚙️ Backend Setup {#backend-setup}

### Step 1: Install Dependencies

```bash
cd /server
npm install openai
```

### Step 2: Configure Environment Variables

Update `.env` file in `/server`:

```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=4000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
```

**How to get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy and paste into `.env`

### Step 3: File Structure Created

```
/server/src/
├── agents/
│   ├── financialAgent.ts      ✅ Analyzes financial data
│   ├── marketAgent.ts          ✅ Analyzes market data
│   ├── predictionAgent.ts       ✅ Predicts future performance
│   ├── strategyAgent.ts         ✅ Generates strategic actions
│   └── orchestrator.ts          ✅ Coordinates all agents
├── utils/
│   └── openai.ts               ✅ OpenAI helper functions
└── routes/
    └── ai.js                   ✅ Updated with new endpoints
```

### Step 4: API Endpoint

**POST /api/ai/analyze**

Sends business data and receives comprehensive AI analysis.

---

## 🎨 Frontend Integration {#frontend-integration}

### Step 1: Update AI Service

File: `/client/src/services/aiService.ts` ✅ **Already Updated**

The service now includes:
- `analyzeBusinessData()` - Main analysis endpoint
- `checkHealth()` - Check AI service status
- `quickAnalysis()` - Quick analysis with minimal data

### Step 2: Create AI Provider (Optional)

```typescript
import { createContext, useContext, useState } from 'react';
import { aiService } from '../services/aiService';

interface AIContextType {
  analysis: any | null;
  loading: boolean;
  error: string | null;
  runAnalysis: (data: any) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async (businessData: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeBusinessData(businessData);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ analysis, loading, error, runAnalysis }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}
```

### Step 3: Add Provider to Main App

```typescript
import { AIProvider } from './providers/AIProvider';

function App() {
  return (
    <AIProvider>
      {/* Your app content */}
    </AIProvider>
  );
}
```

### Step 4: Use in Components

```typescript
import { useAI } from '../providers/AIProvider';

export function Dashboard() {
  const { analysis, loading, error, runAnalysis } = useAI();

  const handleAnalyze = async () => {
    await runAnalysis({
      revenue: 50000,
      expenses: 30000,
      customerCount: 100,
    });
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Business'}
      </button>

      {analysis && (
        <div>
          <h2>Financial Insights</h2>
          <p>Profit Margin: {analysis.analysis.financial.profitMargin}</p>

          <h2>Market Insights</h2>
          <p>Demand Level: {analysis.analysis.market.demandLevel}</p>

          <h2>Strategies</h2>
          {analysis.analysis.strategies.strategies.map((s) => (
            <div key={s.rank}>
              <h4>{s.title}</h4>
              <p>{s.description}</p>
              <p>Expected Impact: {s.expectedImpact}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📡 API Reference {#api-reference}

### POST /api/ai/analyze

Comprehensive AI analysis endpoint.

**Request:**
```json
{
  "revenue": 50000,
  "expenses": 30000,
  "customerCount": 100,
  "previousRevenue": 45000,
  "category": "SaaS",
  "marketPosition": "Mid-market"
}
```

**Response (Success):**
```json
{
  "timestamp": "2024-04-02T10:15:30.123Z",
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
      "keyFindings": ["Finding 1", "Finding 2"],
      "risks": ["Risk 1", "Risk 2"],
      "recommendations": ["Action 1", "Action 2"],
      "severity": "low"
    },
    "market": {
      "demandLevel": "high",
      "competitionIntensity": "medium",
      "marketTrend": "growing",
      "marketGaps": ["Gap 1", "Gap 2"],
      "opportunities": ["Opp 1", "Opp 2"],
      "threats": ["Threat 1"],
      "customerRetention": "strong",
      "marketScore": "8"
    },
    "predictions": {
      "forecast3Month": {
        "revenue": "$52,500",
        "changePercent": "+5%",
        "confidence": "85%"
      },
      "forecast6Month": {
        "revenue": "$56,250",
        "changePercent": "+12.5%",
        "confidence": "78%"
      },
      "forecast12Month": {
        "revenue": "$62,500",
        "changePercent": "+25%",
        "confidence": "65%"
      },
      "growthTrajectory": "accelerating",
      "overallTrend": "positive"
    },
    "strategies": {
      "strategies": [
        {
          "rank": 1,
          "title": "Customer Acquisition",
          "description": "Launch marketing campaign",
          "actionPlan": "Step 1, Step 2, ...",
          "expectedImpact": "+$8,000 revenue",
          "impactPercent": "+16%",
          "timeline": "weeks",
          "resourcesNeeded": ["Resource 1"],
          "riskLevel": "low",
          "successMetrics": ["Metric 1"],
          "confidence": "90%"
        }
      ],
      "immediateActions": ["Do this today", "Do this week"],
      "riskMitigation": ["Mitigation 1"]
    }
  },
  "status": "complete",
  "message": "🎯 AI Analysis Complete"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Missing required fields: revenue, expenses, customerCount"
}
```

### GET /api/ai/health

Check AI service status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Multi-Agent AI System",
  "agents": ["financial", "market", "prediction", "strategy"],
  "openaiConfigured": true
}
```

---

## 📊 Sample Responses {#sample-responses}

### Financial Analysis Example

```typescript
{
  "profitMargin": "40%",
  "expenseRatio": "60%",
  "profitTrend": "positive",
  "keyFindings": [
    "Strong profit margin at 40%",
    "Operating expenses well-controlled at 60% of revenue",
    "Positive growth trend month-over-month"
  ],
  "risks": [
    "Heavy reliance on 3 major clients",
    "Seasonal revenue fluctuation",
    "Rising cost of goods sold"
  ],
  "recommendations": [
    "Diversify customer base to reduce concentration risk",
    "Invest in automation to reduce operational costs",
    "Build strategic reserves for seasonal downturns"
  ],
  "severity": "low"
}
```

### Market Analysis Example

```typescript
{
  "demandLevel": "high",
  "competitionIntensity": "medium",
  "marketTrend": "growing",
  "marketGaps": [
    "No 24/7 support option",
    "Limited integration capabilities",
    "No mobile-first solution"
  ],
  "opportunities": [
    "Expand to European market",
    "Develop enterprise tier offering",
    "Build AI-powered automation features"
  ],
  "threats": [
    "New competitor entering market with lower pricing",
    "Economic recession reducing customer spending",
    "Regulatory changes in key markets"
  ],
  "customerRetention": "strong",
  "marketRecommendations": [
    "Launch 24/7 support to differentiate",
    "Prepare for market expansion",
    "Build partnerships with complementary tools"
  ],
  "marketScore": "8"
}
```

---

## 🧪 Testing Guide {#testing-guide}

### Test in Postman or cURL

```bash
# Test endpoint
curl -X POST http://localhost:4000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "revenue": 50000,
    "expenses": 30000,
    "customerCount": 100,
    "previousRevenue": 45000
  }'
```

### Test in React Component

```typescript
import { useEffect, useState } from 'react';
import { aiService } from '../services/aiService';

export function TestAI() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAnalysis = async () => {
    setLoading(true);
    try {
      const result = await aiService.analyzeBusinessData({
        revenue: 50000,
        expenses: 30000,
        customerCount: 100,
      });
      setResult(result);
      console.log('Analysis Result:', result);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={testAnalysis} disabled={loading}>
        {loading ? 'Testing...' : 'Test AI System'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

---

## 🔐 Security {#security}

### Important: API Key Handling

✅ **CORRECT:**
- Store `OPENAI_API_KEY` in `.env` file (backend only)
- Never expose API key to frontend

❌ **WRONG:**
- Don't commit `.env` to git
- Don't hardcode API key in code
- Don't send API key in frontend requests

### Rate Limiting

The API has rate limiting enabled:
- 100 requests per 15 minutes per IP
- Configure in `/server/src/server.ts`

### Input Validation

All inputs are validated:
- `revenue`, `expenses`, `customerCount` are required
- Must be valid numbers
- Invalid inputs return 400 error

---

## 🐛 Troubleshooting {#troubleshooting}

### Issue: "OpenAI API Key not found"

**Solution:**
1. Check `.env` file exists in `/server` directory
2. Verify `OPENAI_API_KEY=sk-...` is set correctly
3. Restart backend: `npm run dev`

### Issue: "Missing required fields"

**Solution:**
Ensure request includes all required fields:
```json
{
  "revenue": 50000,
  "expenses": 30000,
  "customerCount": 100
}
```

### Issue: "CORS error"

**Solution:**
Backend CORS is configured for `http://localhost:5173` (dev) and `http://localhost:3000` (legacy).
Update the frontend URL in `/server/src/server.ts` if needed:

```typescript
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}));
```

### Issue: "API call times out"

**Solution:**
- OpenAI API can take 10-30 seconds for complex analysis
- Set axios timeout to 60 seconds in `/client/src/lib/axios.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 60000, // 60 seconds
});
```

### Issue: "Invalid JSON response"

**Solution:**
- Check OpenAI API limits (rate limiting, quota)
- Verify API key is active at https://platform.openai.com
- Check server logs: `npm run dev`

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install openai`
2. ✅ Add `OPENAI_API_KEY` to `.env`
3. ✅ Start backend: `npm run dev`
4. ✅ Test endpoint: POST `/api/ai/analyze`
5. ✅ Create AI Dashboard component
6. ✅ Display results in UI
7. ✅ Deploy to production

---

## 📞 Support

For issues or questions:
1. Check server logs: `npm run dev`
2. Check frontend console for errors
3. Verify OpenAI API status at https://status.openai.com

---

**Last Updated:** April 2, 2026
**Status:** ✅ Production Ready
