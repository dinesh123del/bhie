/**
 * BHIE AI System - Configuration Reference
 * All settings and customization options
 */

# BHIE AI System - Configuration Reference

## 🔧 Environment Variables

### Required Variables

```env
# VSCode Blackbox AI Extension (for development)
# Get from https://www.blackbox.ai/dashboard/api-keys (starts with bbx_)
BLACKBOX_API_KEY=bbx_...

# CRITICAL: Add your OpenAI API key here (for app runtime)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx


# Server configuration
PORT=4000
NODE_ENV=development

# Database (already configured)
MONGODB_URI=mongodb+srv://...

# JWT (already configured)
JWT_SECRET=your_secret_here
```

### How to Get OpenAI API Key

1. Visit: https://platform.openai.com/api-keys
2. Click: "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Never share or commit this key
5. Add to `server/.env`

---

## 🎯 Agent Configuration

### Financial Agent

Location: `server/src/agents/financialAgent.ts`

**Customization:**
```typescript
// Change model (default: gpt-3.5-turbo)
const model = 'gpt-4'; // More detailed, higher cost

// Adjust prompt focus
const focusAreas = [
  'profit_margin',  // Profit/revenue ratio
  'expense_ratio',  // Expenses/revenue ratio
  'cash_flow',      // Money in/out
  'growth_rate'     // Month-over-month changes
];
```

**Input Required:**
- revenue (number)
- expenses (number)
- previousRevenue (optional)

**Output Provides:**
- profitMargin
- expenseRatio
- profitTrend
- keyFindings (array)
- risks (array)
- recommendations (array)

---

### Market Agent

Location: `server/src/agents/marketAgent.ts`

**Customization:**
```typescript
// Include industry-specific analysis
const industryContext = {
  'SaaS': { baselineGrowth: '15%', retention: '95%+' },
  'Retail': { baselineGrowth: '5%', retention: '70%' },
  'Services': { baselineGrowth: '10%', retention: '85%' }
};

// Add competitive analysis
const competitorContext = 'List top 3 competitors...';
```

**Input Required:**
- revenue (number)
- customerCount (number)
- category (optional)
- marketPosition (optional)

**Output Provides:**
- demandLevel ('high', 'medium', 'low')
- competitionIntensity
- marketTrend
- marketGaps (array)
- opportunities (array)
- threats (array)

---

### Prediction Agent

Location: `server/src/agents/predictionAgent.ts`

**Customization:**
```typescript
// Adjust forecast confidence
const confidenceSettings = {
  '3Month': 85,   // Higher confidence for near-term
  '6Month': 78,
  '12Month': 65   // Lower confidence for long-term
};

// Add historical data
const historicalGrowth = [
  { month: 1, growth: 5 },
  { month: 2, growth: 7 },
  { month: 3, growth: 6 }
  // More data = more accurate predictions
];
```

**Input Required:**
- revenue (number)
- previousRevenue (optional)
- customerCount (optional)
- growthRate (optional)

**Output Provides:**
- forecast3Month
- forecast6Month
- forecast12Month
- growthTrajectory
- profitForecast
- riskFactors (array)

---

### Strategy Agent

Location: `server/src/agents/strategyAgent.ts`

**Customization:**
```typescript
// Prioritization criteria
const priorityMatrix = {
  impact: 40,      // 40% weight on revenue impact
  effort: 30,      // 30% weight on effort required
  timeline: 20,    // 20% weight on speed
  risk: 10         // 10% weight on risk
};

// Strategy templates
const strategies = [
  'Customer Acquisition',
  'Product Development',
  'Market Expansion',
  'Cost Optimization',
  'Partnership Building'
];
```

**Input Required:**
- financialInsights (object)
- marketInsights (object)
- predictions (object)

**Output Provides:**
- strategies (array of ranked strategies)
- immediateActions (array)
- riskMitigation (array)
- estimatedROI (percentage)

---

## 🎨 Frontend Configuration

### API Endpoint

Location: `client/src/lib/axios.ts`

```typescript
const API_BASE_URL = 'http://localhost:4000/api';

// Customize timeout (default: 30 seconds)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increase for slower connections
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Dashboard Component

Location: `client/src/components/AIDashboard.tsx`

**Customization:**

```typescript
// Change default form values
const defaultFormData = {
  revenue: 100000,      // Your industry average
  expenses: 60000,
  customerCount: 500,
  previousRevenue: 90000
};

// Customize colors (Tailwind classes)
const colors = {
  financial: 'green',    // Financial section
  market: 'blue',        // Market section
  predictions: 'yellow', // Predictions section
  strategies: 'red'      // Strategies section
};

// Change update frequency
const refreshInterval = 60000; // Auto-refresh every 60 seconds (optional)
```

---

## 🔐 Security Configuration

### CORS Settings

Location: `server/src/server.ts`

```typescript
app.use(cors({
  origin: 'http://localhost:5173', // Add your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**For Production:**
```typescript
origin: [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
]
```

### Rate Limiting

Location: `server/src/server.ts`

```typescript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                      // 100 requests per window
}));

// Customize per endpoint
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10               // 10 analysis requests per minute
});

app.use('/api/ai/analyze', aiLimiter);
```

---

## 📊 Model Selection

### GPT-3.5-Turbo (Default)

**Pros:**
- ✅ Cost-effective (~$0.05 per analysis)
- ✅ Fast (~10-20 seconds)
- ✅ Good for most use cases
- ✅ Rate limite friendly

**Cons:**
- ❌ Less detailed insights
- ❌ Occasional hallucinations

**Use when:** Cost is priority, speed needed, sufficient quality

### GPT-4

**Pros:**
- ✅ Highly detailed insights
- ✅ Better reasoning
- ✅ More accurate predictions
- ✅ Better for complex analysis

**Cons:**
- ❌ More expensive (~$0.20 per analysis)
- ❌ Slower (~30-60 seconds)
- ❌ Rate limited

**Use when:** Quality matters, budget available, client relationships important

**To switch to GPT-4:**
```typescript
// Edit: server/src/utils/openai.ts
export async function callOpenAI(
  prompt: string,
  model: string = 'gpt-4'  // Changed from gpt-3.5-turbo
): Promise<string> {
  // ... rest of code
}
```

---

## 💰 Cost Estimation

### Per Analysis

| Model | Input* | Output* | Total | Notes |
|-------|--------|---------|-------|-------|
| gpt-3.5-turbo | $0.001 | $0.004 | ~$0.05 | Standard choice |
| gpt-4 | $0.01 | $0.03 | ~$0.20 | Premium choice |

*Per 1K tokens

### Monthly Estimates

| Usage | gpt-3.5-turbo | gpt-4 |
|-------|---------------|-------|
| 100 analyses | ~$5 | ~$20 |
| 500 analyses | ~$25 | ~$100 |
| 1,000 analyses | ~$50 | ~$200 |
| 5,000 analyses | ~$250 | ~$1,000 |

---

## ⚡ Performance Tuning

### Optimize Speed

```typescript
// 1. Use gpt-3.5-turbo instead of gpt-4
model: 'gpt-3.5-turbo'

// 2. Reduce max_tokens in openai.ts
max_tokens: 1000  // Default: 1500

// 3. Increase temperature for faster responses
temperature: 0.5  // Lower = faster, less creative

// 4. Run agents serially if needed (less parallelization)
const results = [
  await financialAgent(data),
  await marketAgent(data),
  // etc...
];
```

### Optimize Cost

```typescript
// 1. Cache repeated analyses
const cache = new Map();
if (cache.has(JSON.stringify(data))) {
  return cache.get(JSON.stringify(data));
}

// 2. Batch requests (analyze multiple businesses at once)
const batchAnalyze = (businesses) => {
  return businesses.map(b => runAgents(b));
};

// 3. Increase token limit (fewer API calls)
max_tokens: 2000

// 4. Use cheaper model for simple analyses
if (isSimpleAnalysis) {
  model: 'gpt-3.5-turbo'
} else {
  model: 'gpt-4'
}
```

---

## 🔄 Integration Points

### With Other Services

#### 1. Slack Notifications
```typescript
// Send critical insights to Slack
if (analysis.financial.severity === 'high') {
  slack.send(`⚠️ Critical: ${analysis.analysis.financial.risks[0]}`);
}
```

#### 2. Email Alerts
```typescript
// Email analysis to stakeholders
sendEmail(user.email, 'AI Analysis Ready', analysis);
```

#### 3. CRM Integration
```typescript
// Update customer segment in CRM
crm.updateCustomer(customerId, {
  customerRetention: analysis.analysis.market.customerRetention,
  recommendedActions: analysis.analysis.strategies.immediateActions
});
```

#### 4. Data Warehouse
```typescript
// Archive analysis for reporting
dataWarehouse.insert('ai_analyses', {
  timestamp: new Date(),
  businessData,
  analysis,
  aiCost: estimatedCost
});
```

---

## 📈 Monitoring & Logging

### Enable Detailed Logging

```typescript
// In server.ts
const logger = console;

logger.log(`[AI] Analysis started for revenue: $${data.revenue}`);
logger.log(`[AI] Financial Agent completed in ${elapsed}ms`);
logger.log(`[AI] Total cost: $${costEstimate}`);
```

### Track Metrics

```typescript
// Monitor performance
const metrics = {
  analysisCount: 0,
  totalCost: 0,
  averageTime: 0,
  errorRate: 0
};
```

---

## 🧪 Testing Configuration

### Environment for Testing

```env
OPENAI_API_KEY=sk-test-key  # Use test key with low rate limits
NODE_ENV=test
API_TIMEOUT=10000           # Shorter timeout for tests
```

### Mock Responses (Optional)

```typescript
// For testing without API calls
const mockAnalysis = {
  financial: { profitMargin: '40%' },
  market: { demandLevel: 'high' },
  predictions: { forecast3Month: { revenue: '$52,500' } },
  strategies: { strategies: [] }
};
```

---

## 🚀 Production Deployment

### Environment Variables (Production)

```env
# Use strong, unique values
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://prod-user:pass@prod-cluster...
JWT_SECRET=very-long-random-secret-minimum-32-chars
```

### Rate Limiting (Production)

```typescript
// More restrictive limits
rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  max: 30                     // 30 requests per 5 minutes
})
```

### CORS (Production)

```typescript
cors({
  origin: 'https://yourdomain.com',
  credentials: true
})
```

---

## 📞 Configuration Support

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| API timeout | Increase `timeout` in axios config |
| Rate limited | Reduce request frequency, upgrade OpenAI plan |
| Wrong model | Update model name in `openai.ts` |
| CORS blocked | Add frontend URL to CORS `origin` array |
| High costs | Switch to gpt-3.5-turbo, implement caching |
| Slow responses | Reduce `max_tokens`, use simpler prompts |

---

**Last Updated:** April 2, 2026
**Version:** 1.0.0

