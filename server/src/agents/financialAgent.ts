import { AIEngine, AIProvider } from '../utils/aiEngine.js';

export async function analyzeFinancialData(businessData: Record<string, any>, provider?: AIProvider) {
  const prompt = `
You are a top-tier business intelligence agent. High-impact analysis only. 
Respond in JSON.

DATA:
- Revenue: $${businessData.revenue}
- Expenses: $${businessData.expenses}
- Customers: ${businessData.customerCount}

REQUIRED JSON:
{
  "profitMargin": "string",
  "expenseRatio": "string",
  "profitTrend": "positive | negative",
  "keyFindings": ["string"],
  "risks": ["string"],
  "recommendations": ["string"],
  "severity": "low | medium | high"
}`;

  try {
    const response = await AIEngine.generateCompletion(prompt, { preferredProvider: provider });
    return JSON.parse(response.content);
  } catch (error: any) {
    console.error('Financial Agent Error:', error);
    return {
      error: 'Financial analysis failed',
      success: false,
    };
  }
}

