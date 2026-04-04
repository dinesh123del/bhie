import { AIEngine } from '../utils/aiEngine.js';
export async function generateStrategy(financialInsights, marketInsights, predictions, provider) {
    const prompt = `
Generate strategy based on:
Financial: ${JSON.stringify(financialInsights)}
Market: ${JSON.stringify(marketInsights)}
Predictions: ${JSON.stringify(predictions)}

Provide JSON:
{
  "executiveSummary": "string",
  "strategies": [
    { "title": "string", "impact": "string", "timeline": "string" }
  ],
  "immediateActions": ["string"]
}`;
    try {
        const response = await AIEngine.generateCompletion(prompt, { preferredProvider: provider });
        return JSON.parse(response.content);
    }
    catch (error) {
        console.error('Strategy Agent error:', error);
        return { error: 'Strategy failed' };
    }
}
