import { AIEngine } from '../utils/aiEngine.js';
export async function predictFuturePerformance(businessData, provider) {
    const prompt = `
Predict future performance based on:
- Revenue: $${businessData.revenue}
- Expenses: $${businessData.expenses}
- Growth: ${businessData.growthRate}%

Provide JSON:
{
  "forecast3Month": { "revenue": number, "confidence": number },
  "forecast6Month": { "revenue": number, "confidence": number },
  "forecast12Month": { "revenue": number, "confidence": number },
  "overallTrend": "string",
  "predictiveInsights": ["string"]
}`;
    try {
        const response = await AIEngine.generateCompletion(prompt, { preferredProvider: provider });
        return JSON.parse(response.content);
    }
    catch (error) {
        console.error('Prediction Agent error:', error);
        return { error: 'Prediction failed' };
    }
}
