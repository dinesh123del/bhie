import { AIEngine, AIProvider } from '../utils/aiEngine.js';

export async function generateStrategy(
  financialInsights: Record<string, any>,
  marketInsights: Record<string, any>,
  predictions: Record<string, any>,
  provider?: AIProvider
) {
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
  } catch (error: any) {
    console.error('Strategy Agent error:', error);
    return { error: 'Strategy failed' };
  }
}

