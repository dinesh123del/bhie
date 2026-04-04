import { callOpenAI, parseAIResponse } from '../utils/openai.js';
/**
 * Prediction Agent
 * Predicts future performance trends based on current data
 */
export async function predictFuturePerformance(businessData) {
    const prompt = `
You are a business forecasting AI agent. Predict future performance based on historical and current data.

BUSINESS DATA:
- Current Revenue: $${businessData.revenue || 0}
- Previous Revenue: $${businessData.previousRevenue || 0}
- Customer Count: ${businessData.customerCount || 0}
- Expenses: $${businessData.expenses || 0}
- Growth Rate: ${businessData.growthRate || 'Unknown'}%

PREDICTION REQUIREMENTS:
1. 3-month revenue forecast
2. 6-month revenue forecast
3. 12-month revenue forecast
4. Growth trajectory analysis
5. Profit prediction
6. Risk factors affecting forecast
7. Confidence level for each prediction

Calculate based on:
- Historical growth rate
- Current trajectory
- Industry averages (assume conservative 5-15% for tech/services)

Provide your predictions in this JSON format:
{
  "forecast3Month": {
    "revenue": "$X",
    "changePercent": "Y%",
    "confidence": "0-100%"
  },
  "forecast6Month": {
    "revenue": "$X",
    "changePercent": "Y%",
    "confidence": "0-100%"
  },
  "forecast12Month": {
    "revenue": "$X",
    "changePercent": "Y%",
    "confidence": "0-100%"
  },
  "growthTrajectory": "accelerating/stable/declining",
  "profitForecast": "$X",
  "forecastingFactors": [
    "factor 1",
    "factor 2"
  ],
  "riskFactors": [
    "risk 1",
    "risk 2"
  ],
  "overallTrend": "positive/neutral/negative",
  "predictiveInsights": [
    "insight 1",
    "insight 2"
  ]
}

Respond with ONLY the JSON object, no additional text.
`;
    try {
        const response = await callOpenAI(prompt);
        return parseAIResponse(response);
    }
    catch (error) {
        console.error('Prediction Agent Error:', error);
        return {
            error: 'Prediction analysis failed',
            success: false,
        };
    }
}
export default { predictFuturePerformance };
