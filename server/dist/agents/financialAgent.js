import { callOpenAI, parseAIResponse } from '../utils/openai.js';
/**
 * Financial Agent
 * Analyzes business financial data to identify problems and opportunities
 */
export async function analyzeFinancialData(businessData) {
    const prompt = `
You are a financial analyst AI agent. Analyze the following business financial data and provide insights.

BUSINESS DATA:
- Revenue: $${businessData.revenue || 0}
- Expenses: $${businessData.expenses || 0}
- Previous Revenue: $${businessData.previousRevenue || 0}
- Customer Count: ${businessData.customerCount || 0}

CRITICAL ANALYSIS REQUIRED:
1. Profit margin analysis (profit/revenue)
2. Expense-to-revenue ratio
3. Financial risks identified
4. Quick wins for improvement
5. Red flags (if any)

Provide your analysis in this JSON format:
{
  "profitMargin": "X%",
  "expenseRatio": "Y%",
  "profitTrend": "positive/negative/stable",
  "keyFindings": [
    "finding 1",
    "finding 2",
    "finding 3"
  ],
  "risks": [
    "risk 1",
    "risk 2"
  ],
  "recommendations": [
    "action 1",
    "action 2"
  ],
  "severity": "low/medium/high"
}

Respond with ONLY the JSON object, no additional text.
`;
    try {
        const response = await callOpenAI(prompt);
        return parseAIResponse(response);
    }
    catch (error) {
        console.error('Financial Agent Error:', error);
        return {
            error: 'Financial analysis failed',
            success: false,
        };
    }
}
export default { analyzeFinancialData };
