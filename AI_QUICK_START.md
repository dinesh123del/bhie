/**
 * QUICK START - BHIE AI SYSTEM
 * Get your Multi-Agent AI System running in 5 steps
 */

# ⚡ BHIE AI System - Quick Start (5 Minutes)

## 🎯 What's Been Done

✅ **Backend:** 4 AI Agents created
✅ **API:** `/api/ai/analyze` endpoint ready
✅ **Frontend:** Service and component created
✅ **Guide:** Full documentation provided

---

## 🚀 Step 1: Setup OpenAI API Key (1 min)

### Get Your API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### Add to `.env`
Edit `/server/.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

⚠️ **Important:** Never share this key or commit `.env` to git!

---

## 🔧 Step 2: Install Dependencies (2 min)

```bash
# Install OpenAI library in backend
cd /server
npm install openai

# If npm install openai returns error, try:
npm install --save openai@4.42.0
```

**Verify installation:**
```bash
npm list openai
```

Should show: `openai@4.42.0`

---

## ▶️ Step 3: Start Backend Server (1 min)

```bash
cd /server
npm run dev
```

You should see:
```
✅ Prisma connected to MongoDB
🚀 Server running on port 4000
```

---

## 🧪 Step 4: Test the API (1 min)

### Using cURL

```bash
curl -X POST http://localhost:4000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "revenue": 50000,
    "expenses": 30000,
    "customerCount": 100,
    "previousRevenue": 45000
  }'
```

### Using Postman
1. Create POST request to `http://localhost:4000/api/ai/analyze`
2. Set body to:
```json
{
  "revenue": 50000,
  "expenses": 30000,
  "customerCount": 100
}
```
3. Send!

### Expected Response
```json
{
  "timestamp": "2024-04-02T...",
  "analysis": {
    "financial": { ... },
    "market": { ... },
    "predictions": { ... },
    "strategies": { ... }
  },
  "status": "complete"
}
```

---

## 🎨 Step 5: Use in Frontend (Optional)

### Update your page/component:

```typescript
import AIDashboard from '../components/AIDashboard';

export default function AIPage() {
  return <AIDashboard />;
}
```

The component includes:
- ✅ Input form for business data
- ✅ Loading states
- ✅ Error handling
- ✅ Beautiful result display
- ✅ All 4 agent insights

---

## 📂 Files Created/Updated

### Backend
```
✅ /server/src/agents/
   - financialAgent.ts (Profit & expense analysis)
   - marketAgent.ts (Demand & competition analysis)
   - predictionAgent.ts (Revenue forecasting)
   - strategyAgent.ts (Actionable recommendations)
   - orchestrator.ts (Coordinates all agents)

✅ /server/src/utils/
   - openai.ts (OpenAI helper functions)

✅ /server/routes/ai.js (UPDATED with new endpoints)
✅ /server/package.json (UPDATED with openai dependency)
```

### Frontend
```
✅ /client/src/services/aiService.ts (UPDATED)
✅ /client/src/components/AIDashboard.tsx (NEW)
```

### Documentation
```
✅ /AI_SYSTEM_GUIDE.md (Complete guide)
✅ /AI_QUICK_START.md (This file)
```

---

## 🔍 What Each Agent Does

### 1. Financial Agent 💰
- Analyzes profit margin
- Calculates expense ratio
- Identifies financial risks
- Recommends cost optimizations

**Input:** Revenue, Expenses
**Output:** Profit margin, expense ratio, risks, recommendations

### 2. Market Agent 🎯
- Assesses market demand
- Analyzes competition
- Identifies market gaps
- Finds growth opportunities

**Input:** Business metrics, category
**Output:** Demand level, competition intensity, opportunities, threats

### 3. Prediction Agent 🔮
- Forecasts 3-month revenue
- Predicts 6-month revenue
- Projects 12-month revenue
- Identifies growth trajectory

**Input:** Current revenue, growth rate
**Output:** Revenue forecasts, confidence levels, trends

### 4. Strategy Agent ⚡
- Combines all insights
- Prioritizes actions by impact
- Estimates ROI for each strategy
- Provides immediate actions

**Input:** All prior agent outputs
**Output:** Ranked strategies, immediate actions, risk mitigation

---

## 🐛 Troubleshooting

### API returns 400 error
**Problem:** Missing required fields
**Solution:** Send all required fields:
```json
{
  "revenue": 50000,
  "expenses": 30000,
  "customerCount": 100
}
```

### "OpenAI API key not found"
**Solution:**
1. Check `.env` file exists in `/server`
2. Verify key starts with `sk-`
3. Restart: `npm run dev`

### Response times out (>30s)
**Solution:**
- OpenAI API can be slow sometimes
- Increase timeout in frontend: `timeout: 60000`
- Check OpenAI status: https://status.openai.com

### CORS error in frontend
**Solution:**
Frontend URL is configured in `/server/src/server.ts`:
```typescript
origin: 'http://localhost:5173', // Update this to your frontend URL
```

### "Model not found" error
**Solution:**
- Check API key is valid
- Try using gpt-3.5-turbo instead of gpt-4
- Update model in `/server/src/utils/openai.ts`:
```typescript
model: 'gpt-3.5-turbo' // Change from gpt-4
```

---

## 📊 Example Usage Flow

```
User enters:
  Revenue: $50,000
  Expenses: $30,000
  Customers: 100
       ↓
Backend validates data
       ↓
Orchestrator runs:
  1. Financial Agent → "Profit margin: 40%"
  2. Market Agent → "Demand: HIGH"
  3. Prediction Agent → "3-month: $52,500"
  4. Strategy Agent → "3 ranked strategies"
       ↓
Returns combined result
       ↓
Frontend displays insights beautifully
```

---

## 🎯 Next Features to Add

### Optional Enhancements

1. **Database Persistence**
```typescript
// Save analysis to MongoDB
const analysis = await AIAnalysis.create({
  businessData,
  analysisResult,
  timestamp: new Date()
});
```

2. **History Tracking**
```typescript
// Compare with previous analyses
router.get('/ai/history', async (req, res) => {
  const history = await AIAnalysis.find().limit(10);
  res.json(history);
});
```

3. **Export Reports**
```typescript
// Export as PDF or Excel
const { generatePDF } = require('./exporters/pdf');
const pdf = generatePDF(analysis);
```

4. **Scheduled Analysis**
```typescript
// Run analysis weekly automatically
cron.schedule('0 0 * * 0', async () => {
  await runAgents(businessData);
});
```

5. **Webhook Notifications**
```typescript
// Send alerts via email/Slack
if (analysis.financial.severity === 'high') {
  sendAlert(user.email, analysis);
}
```

---

## 📞 Need Help?

### Common Questions

**Q: Can I use gpt-4 instead of gpt-3.5-turbo?**
A: Yes! Update model in `/server/src/utils/openai.ts`
```typescript
model: 'gpt-4' // More expensive but better
```

**Q: How much does this cost?**
A: ~$0.05 per analysis (gpt-3.5-turbo) or ~$0.20 (gpt-4)

**Q: Can I cache results to save money?**
A: Yes! Add Redis caching or database persistence

**Q: How do I deploy to production?**
A: See `DEPLOYMENT_GUIDE.md` for Render, Vercel, AWS setup

**Q: Can I customize the prompts?**
A: Yes! Edit prompts in each agent file

---

## 🚀 You're Ready!

### Start here:
1. ✅ Add `OPENAI_API_KEY` to `.env`
2. ✅ Run `npm install openai` in `/server`
3. ✅ Start server: `npm run dev`
4. ✅ Test: POST `/api/ai/analyze`
5. ✅ Use: Import `AIDashboard` in React

---

## 📝 Sample Business Data

Use this for testing:

**Startup:**
```json
{
  "revenue": 20000,
  "expenses": 15000,
  "customerCount": 30
}
```

**Small Business:**
```json
{
  "revenue": 100000,
  "expenses": 60000,
  "customerCount": 200
}
```

**Growing Company:**
```json
{
  "revenue": 500000,
  "expenses": 300000,
  "customerCount": 1000,
  "previousRevenue": 400000
}
```

**Enterprise:**
```json
{
  "revenue": 2000000,
  "expenses": 1200000,
  "customerCount": 5000,
  "previousRevenue": 1800000,
  "category": "Enterprise SaaS",
  "marketPosition": "Market Leader"
}
```

---

**Last Updated:** April 2, 2026
**Status:** ✅ Ready to Use

Good luck! 🎉
