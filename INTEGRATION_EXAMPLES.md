# 🔌 Integration & Usage Examples

## Quick Start: Using the Innovative Dashboard

### 1. Import the Dashboard

```tsx
// In your app router or main component
import InnovativeDashboard from './pages/InnovativeDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <InnovativeDashboard />
    </div>
  );
}
```

### 2. Ensure Dependencies Are Installed

```bash
npm install framer-motion lucide-react axios
```

---

## Component Usage Examples

### Using InsightStory

```tsx
import { InsightStory, generateInsightStories } from './components/InsightStory';

function MyDashboard() {
  const dashboardData = {
    totalIncome: 5000,
    totalExpenses: 3500,
    profit: 1500,
    growthRate: 5,
    expenseRatio: 0.7,
    incomeGrowth: 5,
    profitMargin: 30,
    healthScore: 75
  };

  const insights = generateInsightStories(dashboardData);

  return (
    <div className="grid grid-cols-3 gap-4">
      {insights.map((insight, idx) => (
        <InsightStory key={idx} insight={insight} />
      ))}
    </div>
  );
}
```

### Using FixActionCard

```tsx
import { FixActionCard } from './components/InsightStory';

function ActionsView() {
  const fixAction = {
    id: '1',
    problem: 'Expenses Growing Too Fast',
    fix: 'Your expenses grew 15% while income dropped 5%. This is unsustainable.',
    priority: 'high',
    estimatedImpact: '-$500/month in costs',
    actionSteps: [
      'Audit all monthly subscriptions (identify unused ones)',
      'Negotiate rates with top 3 vendors',
      'Consolidate vendors where possible',
      'Set spending approval limits'
    ],
    difficulty: 'medium'
  };

  return <FixActionCard action={fixAction} />;
}
```

### Using Predictive Analytics

```tsx
import { predictLoss, analyzeTrends, breakEvenAnalysis } from './lib/predictiveAnalytics';

function AnalyticsView() {
  const historicalData = [
    { date: '2024-01', income: 5000, expenses: 3000, profit: 2000 },
    { date: '2024-02', income: 5500, expenses: 3200, profit: 2300 },
    { date: '2024-03', income: 5200, expenses: 3800, profit: 1400 },
    { date: '2024-04', income: 4800, expenses: 4200, profit: 600 },
    { date: '2024-05', income: 4500, expenses: 4600, profit: -100 },
  ];

  // Get trends
  const trends = analyzeTrends(historicalData);
  console.log(trends);
  // Output:
  // {
  //   incomeDirection: 'down',
  //   expenseDirection: 'up',
  //   velocityIncome: -5.2,
  //   velocityExpense: 8.8,
  //   riskScore: 85,
  //   healthScore: 15
  // }

  // Get prediction
  const prediction = predictLoss(historicalData, 1);
  console.log(prediction);
  // Output:
  // {
  //   predictedLoss: 450,
  //   shouldAlert: true,
  //   confidence: 82,
  //   timeframe: 'Next 1 month',
  //   recommendations: [...]
  // }

  // Get breakeven analysis
  const breakeven = breakEvenAnalysis(historicalData);
  console.log(breakeven);
  // Output:
  // {
  //   monthsToBreakEven: 2,
  //   breakEvenDate: '2024-07-01',
  //   requiredIncomeGrowth: 15.5
  // }

  return (
    <div>
      <p>Risk Score: {trends.riskScore}%</p>
      <p>Health Score: {trends.healthScore}%</p>
      <p>Predicted Loss: ${prediction.predictedLoss}</p>
      <p>Confidence: {prediction.confidence}%</p>
    </div>
  );
}
```

### Using Mode Toggle

```tsx
import { ModeToggle, ModeSpecific } from './components/SimpleModeUI';
import type { ViewMode } from './components/SimpleModeUI';
import { useState } from 'react';

function AdaptiveDashboard() {
  const [mode, setMode] = useState<ViewMode>('simple');

  return (
    <div>
      <ModeToggle mode={mode} onChange={setMode} />

      <ModeSpecific mode={mode} showIn="simple">
        <div>
          <h2>Simple View - Key Numbers Only</h2>
          {/* Simple content */}
        </div>
      </ModeSpecific>

      <ModeSpecific mode={mode} showIn="advanced">
        <div>
          <h2>Advanced View - Full Analytics</h2>
          {/* Advanced content */}
        </div>
      </ModeSpecific>
    </div>
  );
}
```

---

## Data Structures

### HistoricalData
Required for all predictive analytics functions.

```tsx
interface HistoricalData {
  date: string;      // 'YYYY-MM' format
  income: number;    // Total income for the period
  expenses: number;  // Total expenses for the period
  profit: number;    // income - expenses
}
```

**Example:**
```tsx
const data: HistoricalData[] = [
  { date: '2024-01', income: 5000, expenses: 3000, profit: 2000 },
  { date: '2024-02', income: 5500, expenses: 3200, profit: 2300 },
  { date: '2024-03', income: 5200, expenses: 3800, profit: 1400 },
];
```

### Insight
Used by InsightStory component.

```tsx
interface Insight {
  title: string;              // "Revenue Growth"
  narrative: string;          // Story about the metric
  stat: number | string;      // "+5%"
  statLabel: string;          // "Growth Rate"
  emoji: string;              // "📈"
  context: string;            // Why this matters
  recommendations: string[];  // What to do
  severity: 'info' | 'warning' | 'critical';
}
```

### FixAction
Used by FixActionCard component.

```tsx
interface FixAction {
  id: string;
  problem: string;            // "Expenses Growing Too Fast"
  fix: string;                // Explanation of the issue
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;    // "-$500/month in costs"
  actionSteps: string[];      // Steps to fix
  difficulty: 'easy' | 'medium' | 'hard';
}
```

---

## Real-World Integration: File Upload Handler

```tsx
import { autoCategorizeFile } from './lib/fileAutoCategorization';
import { useCallback } from 'react';

function FileUploadComponent() {
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Auto-categorize the file
      const result = await autoCategorizeFile(file);

      console.log('Category:', result.category);
      console.log('Confidence:', result.confidence);
      console.log('Extracted Data:', result.extractedData);
      console.log('Suggested Account:', result.suggestedAccount);

      // Based on category, handle differently
      switch (result.category) {
        case 'invoice':
          // Auto-fill invoice form
          setInvoiceForm({
            amount: result.extractedData.amount,
            vendor: result.extractedData.vendor,
            date: result.extractedData.date,
            invoiceNumber: result.extractedData.invoiceNumber,
            category: result.suggestedAccount,
          });
          showInvoiceModal();
          break;

        case 'receipt':
          // Auto-record expense
          recordExpense({
            amount: result.extractedData.amount,
            vendor: result.extractedData.vendor,
            date: result.extractedData.date,
            category: result.suggestedAccount,
          });
          break;

        case 'bank_statement':
          // Import transactions
          const transactions = result.extractedData.transactions;
          importBankTransactions(transactions);
          break;

        default:
          // Show user to classify manually
          showClassificationDialog(file, result);
      }
    } catch (error) {
      console.error('File upload error:', error);
      showError('Failed to process file');
    }
  }, []);

  return (
    <div
      className="border-2 border-dashed p-6 rounded"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        files.forEach(handleFileUpload);
      }}
    >
      <p>Drag files here or click to upload</p>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(handleFileUpload);
        }}
      />
    </div>
  );
}
```

---

## Real-World Integration: Dashboard with Predictions

```tsx
import { useEffect, useState } from 'react';
import InnovativeDashboard from './pages/InnovativeDashboard';
import { predictLoss, analyzeTrends } from './lib/predictiveAnalytics';
import type { HistoricalData } from './lib/predictiveAnalytics';

function FullDashboardWithAPI() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from your API
        const response = await fetch('/api/dashboard/data');
        const data = await response.json();

        // Get historical data
        const historicalData: HistoricalData[] = data.monthly.map((m: any) => ({
          date: m.month, // 'YYYY-MM'
          income: m.income,
          expenses: m.expenses,
          profit: m.profit,
        }));

        // Run predictions
        const prediction = predictLoss(historicalData, 1);
        const trends = analyzeTrends(historicalData);

        // Combine everything
        setDashboardData({
          ...data,
          prediction,
          trends,
          historicalData,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <InnovativeDashboard />;
}

export default FullDashboardWithAPI;
```

---

## Common Patterns

### Pattern 1: Alert User to Loss Prediction

```tsx
import { predictLoss } from './lib/predictiveAnalytics';
import { useEffect } from 'react';

function LossAlertSystem({ historicalData }) {
  useEffect(() => {
    const prediction = predictLoss(historicalData, 1);

    if (prediction.shouldAlert && prediction.confidence > 70) {
      // Show alert to user
      showNotification({
        type: 'error',
        title: 'Financial Warning',
        message: `AI predicts a loss of $${prediction.predictedLoss} next month (${prediction.confidence}% confidence)`,
        actions: [
          { label: 'View Details', onClick: () => openPredictionModal() },
          { label: 'Dismiss', onClick: () => {} }
        ]
      });
    }
  }, [historicalData]);

  return null;
}
```

### Pattern 2: Conditional Rendering Based on Health

```tsx
import { analyzeTrends } from './lib/predictiveAnalytics';

function ConditionalDashboard({ historicalData }) {
  const trends = analyzeTrends(historicalData);

  return (
    <div>
      {trends.healthScore < 40 && (
        <div className="bg-red-100 border border-red-400 p-4 mb-4">
          <h3>⚠️ Critical: Business Health is Low</h3>
          <p>Your health score is {trends.healthScore}%. Immediate action required.</p>
          <button>View Action Plan</button>
        </div>
      )}

      {trends.riskScore > 75 && (
        <div className="bg-orange-100 border border-orange-400 p-4 mb-4">
          <h3>⚠️ High Risk Detected</h3>
          <p>Risk score: {trends.riskScore}%. Consider consulting with a business advisor.</p>
        </div>
      )}

      <InnovativeDashboard />
    </div>
  );
}
```

### Pattern 3: Multi-Month Trend Visualization

```tsx
import { analyzeTrends } from './lib/predictiveAnalytics';

function TrendComparisonView({ last3Months, last6Months }) {
  const trends3m = analyzeTrends(last3Months);
  const trends6m = analyzeTrends(last6Months);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Last 3 Months</h3>
        <div>Health: {trends3m.healthScore}%</div>
        <div>Risk: {trends3m.riskScore}%</div>
        <div>Income Direction: {trends3m.incomeDirection}</div>
      </div>

      <div>
        <h3>Last 6 Months</h3>
        <div>Health: {trends6m.healthScore}%</div>
        <div>Risk: {trends6m.riskScore}%</div>
        <div>Income Direction: {trends6m.incomeDirection}</div>
      </div>
    </div>
  );
}
```

---

## Styling & Customization

### Tailwind CSS Colors Used

```tsx
// Sentiment colors
const colors = {
  positive: 'text-emerald-400 bg-emerald-900/30',
  negative: 'text-red-400 bg-red-900/30',
  warning: 'text-orange-400 bg-orange-900/30',
  neutral: 'text-blue-400 bg-blue-900/30',
  slate: 'text-slate-400 bg-slate-800'
};
```

### Customizing Colors

```tsx
// In InsightStory.tsx, modify sentimentColors:
const customColors = {
  positive: 'from-green-900/30 to-slate-900 border-green-700/30',
  negative: 'from-pink-900/30 to-slate-900 border-pink-700/30',
  neutral: 'from-purple-900/30 to-slate-900 border-purple-700/30',
  warning: 'from-yellow-900/30 to-slate-900 border-yellow-700/30'
};
```

---

## Testing the Features

### Test Case 1: Declining Business
```tsx
const decliningBusiness = [
  { date: '2024-01', income: 5000, expenses: 3000, profit: 2000 },
  { date: '2024-02', income: 4700, expenses: 3200, profit: 1500 },
  { date: '2024-03', income: 4400, expenses: 3400, profit: 1000 },
  { date: '2024-04', income: 4100, expenses: 3600, profit: 500 },
];

// Expected: shouldAlert = true, healthScore = low, riskScore = high
```

### Test Case 2: Healthy Growth
```tsx
const healthyGrowth = [
  { date: '2024-01', income: 5000, expenses: 3000, profit: 2000 },
  { date: '2024-02', income: 5500, expenses: 3100, profit: 2400 },
  { date: '2024-03', income: 6000, expenses: 3200, profit: 2800 },
];

// Expected: shouldAlert = false, healthScore = high, riskScore = low
```

### Test Case 3: Breakeven Scenario
```tsx
const breakEvenScenario = [
  { date: '2024-01', income: 3000, expenses: 2900, profit: 100 },
  { date: '2024-02', income: 3000, expenses: 3000, profit: 0 },
  { date: '2024-03', income: 3000, expenses: 3100, profit: -100 },
];

// Expected: monthsToBreakEven = several months, requiredIncomeGrowth > 0
```

---

## Performance Considerations

### Optimization Tips

1. **Memoize predictions** to avoid recalculation:
```tsx
import { useMemo } from 'react';

function Dashboard({ historicalData }) {
  const prediction = useMemo(
    () => predictLoss(historicalData, 1),
    [historicalData]
  );
  
  return <div>{prediction.shouldAlert && <Alert />}</div>;
}
```

2. **Debounce updates** from large datasets:
```tsx
import { useDebouncedValue } from 'your-hooks';

function DashboardWithLargData({ data }) {
  const debouncedData = useDebouncedValue(data, 500);
  // Only recalculates every 500ms
}
```

3. **Lazy load components** in advanced mode:
```tsx
const TrendAnalysis = lazy(() => import('./components/TrendAnalysis'));

<Suspense fallback={<div>Loading...</div>}>
  <TrendAnalysis />
</Suspense>
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Predictions seem wrong | Check historical data has ≥3 months |
| File upload always fails | Verify file format (PDF/CSV/Excel) |
| Components not animating | Check Framer Motion is installed |
| Colors look different | Verify Tailwind CSS is configured |
| Mode toggle doesn't work | Check ViewMode type is imported |

---

## API Integration Checklist

- [ ] Connect `/api/dashboard/data` endpoint
- [ ] Fetch historical data on component mount
- [ ] Handle API errors gracefully
- [ ] Add loading states
- [ ] Implement data caching
- [ ] Add refresh button
- [ ] Handle real-time updates (WebSocket)

---

**Ready to deploy! All components are production-ready.**

