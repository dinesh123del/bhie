# AI Prediction System - Quick Reference

## 🚀 Quick Start

### Backend Endpoint

```
POST /api/ai/predict
```

### Example Request

```bash
curl -X POST http://localhost:4000/api/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "status": "active",
        "category": "Finance",
        "title": "Q1 Report"
      },
      {
        "status": "draft",
        "category": "Operations",
        "title": "Team Meeting Notes"
      },
      {
        "status": "archived",
        "category": "Finance",
        "title": "Q4 Report"
      }
    ]
  }'
```

### Example Response

```json
{
  "healthScore": 67,
  "riskLevel": "medium",
  "suggestions": [
    "Review and finalize pending draft records",
    "Consider expanding into new categories for better diversification",
    "Current completion rate is good - maintain this level of productivity"
  ],
  "metrics": {
    "totalRecords": 3,
    "draftCount": 1,
    "activeCount": 1,
    "archivedCount": 1,
    "completionRate": 33,
    "riskFactors": [
      "Low category diversification"
    ]
  },
  "timestamp": "2026-04-02T10:30:45.123Z"
}
```

---

## 🎨 Frontend Usage

### Option 1: Use Prediction Card Component

```typescript
import AIPredictionCard from '../components/AIPredictionCard';

export default function MyDashboard() {
  return (
    <div>
      <h1>Health Status</h1>
      <AIPredictionCard />
    </div>
  );
}
```

### Option 2: Use Prediction Page

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Prediction from './pages/Prediction';

<Routes>
  <Route path="/prediction" element={<Prediction />} />
</Routes>
```

### Option 3: Custom Integration

```typescript
import api from '../lib/axios';

const [prediction, setPrediction] = useState(null);

// Fetch and analyze
const analyzePrediction = async () => {
  try {
    // Get records
    const recordsRes = await api.get('/records');
    const records = recordsRes.data;

    // Get prediction
    const predRes = await api.post('/ai/predict', { records });
    setPrediction(predRes.data);
  } catch (error) {
    console.error('Prediction failed:', error);
  }
};
```

---

## 📊 Score Breakdown

### Health Score Formula

```
Base Score: 50

Components:
├─ Active Records: +0 to +40 points
│  └ (activeCount / totalRecords) × 40
│
├─ Archived Records: +0 to +10 points
│  └ (archivedCount / totalRecords) × 10
│
└─ Draft Records: -0 to -20 points
   └ (draftCount / totalRecords) × 20

Range: 0 → 100 (clamped)
```

### Risk Factors

Three main factors determine risk level:

1. **Draft Percentage**
   ```
   > 60% = High Risk
   30-60% = Medium Risk
   < 30% = Low Risk
   ```

2. **Completion Rate**
   ```
   < 30% = High Risk
   30-70% = Medium Risk
   > 70% = Low Risk
   ```

3. **Factor Count**
   ```
   ≥ 3 factors = High Risk
   1-2 factors = Medium Risk
   0 factors = Low Risk
   ```

---

## 🎯 Understanding Risk Levels

### 🟢 LOW RISK

✓ Score > 60  
✓ Completion rate > 70%  
✓ No critical risk factors  

**Action**: Maintain current trajectory

### 🟡 MEDIUM RISK

⚠ Score 40-60  
⚠ Some risk factors present  
⚠ Completion rate 30-70%  

**Action**: Address identified suggestions

### 🔴 HIGH RISK

✗ Score < 40  
✗ 3+ risk factors  
✗ Completion rate < 30%  
✗ High draft percentage  

**Action**: Immediate intervention recommended

---

## 💡 Suggestion Categories

| Category | Trigger | Suggestion |
|----------|---------|-----------|
| Drafts | >60% draft | Finalize pending records |
| Completion | <30% active | Increase completion rate |
| Excellence | >70% active | Maintain current momentum |
| Archive | More archived than active | Review archived items |
| Diversification | >60% single category | Spread across categories |
| Volume | <10 records | Add more records |
| Health | No issues | Monitor regularly |

---

## 🔄 Real-Time Updates

### Auto-Refresh (Component)

```typescript
// AIPredictionCard automatically:
// 1. Fetches records on mount
// 2. Calls predict API
// 3. Displays results
// 4. Allows manual refresh
```

### Manual Refresh

```typescript
// Click "Refresh Analysis" button
// Or from API:
const refreshPrediction = async () => {
  const recordsRes = await api.get('/records');
  const predRes = await api.post('/ai/predict', {
    records: recordsRes.data
  });
  return predRes.data;
};
```

---

## 📈 Visual Elements

### Health Score Circle

- **SVG Animation**: Animated stroke-dasharray
- **Gradient**: Blue → Purple
- **Color Coding**: Matches score range
- **Duration**: 1 second animation

### Progress Bar

- **Completition Rate**: Percentage filled
- **Color**: Dynamic gradient based on score
- **Animation**: 1 second smooth transition

### Risk Badge

- **Color Options**: Green/Yellow/Red
- **Icon**: CheckCircle/AlertCircle/AlertTriangle
- **Text**: "✓ Low Risk" / "⚠ Medium Risk" / "⚠ High Risk"

### Suggestion List

- **Numbered**: 1-5 badges
- **Styling**: Blue-colored with hover effect
- **Opacity**: Subtle background highlight

---

## 🛠️ Development

### File Locations

```
Backend:
  server/routes/ai.js          (POST /api/ai/predict)

Frontend:
  client/src/components/AIPredictionCard.tsx    (Component)
  client/src/pages/Prediction.tsx               (Page)
  client/src/lib/axios.ts                       (API client)
```

### Dependencies (All Pre-installed)

```json
{
  "lucide-react": "^1.7.0",      // Icons
  "axios": "^1.14.0",            // HTTP client
  "react": "^18.3.1",            // UI framework
  "tailwindcss": "^3.4.4"        // Styling
}
```

### Environment

No additional environment variables required.  
Uses existing MongoDB records via Prisma ORM.

---

## 🧪 Testing Examples

### Test 1: Perfect Score Business

```javascript
const records = [
  { status: 'active', category: 'A' },
  { status: 'active', category: 'B' },
  { status: 'active', category: 'C' },
  { status: 'archived', category: 'D' }
];
// Expected Health Score: ~90, Risk: LOW
```

### Test 2: Problem Business

```javascript
const records = [
  { status: 'draft', category: 'Finance' },
  { status: 'draft', category: 'Finance' },
  { status: 'draft', category: 'Finance' },
  { status: 'draft', category: 'Finance' },
  { status: 'draft', category: 'Finance' },
  { status: 'active', category: 'Finance' }
];
// Expected Health Score: <40, Risk: HIGH
```

### Test 3: Balanced Business

```javascript
const records = [
  { status: 'active', category: 'A' },
  { status: 'active', category: 'B' },
  { status: 'draft', category: 'C' },
  { status: 'archived', category: 'D' }
];
// Expected Health Score: 60-70, Risk: MEDIUM
```

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Score always 50 | Records array is empty |
| High risk score | Check draft percentage |
| No suggestions | Ensure records exist |
| API 400 error | Verify records is an array |
| Component not rendering | Check axios config in lib/axios |

---

## 📚 Related Documentation

- [Multi-Agent AI System](./MULTI_AGENT_AI_IMPLEMENTATION.md)
- [Dashboard Component](./DASHBOARD_GUIDE.md)
- [Records Management](./RECORDS_GUIDE.md)
- [API Reference](./API_USAGE.md)

---

## 🎓 Summary Matrix

| Aspect | Details |
|--------|---------|
| **Endpoint** | POST /api/ai/predict |
| **Input** | `records` array |
| **Output** | healthScore, riskLevel, suggestions, metrics |
| **Score Range** | 0-100 |
| **Risk Levels** | low, medium, high |
| **Max Suggestions** | 5 |
| **Max Risk Factors** | 3 |
| **Component** | AIPredictionCard.tsx |
| **Page** | Prediction.tsx |
| **Authentication** | Via axios interceptor (JWT) |
| **Caching** | None (real-time) |

---

Generated: April 2, 2026  
Version: 1.0.0  
Status: Production Ready ✅
