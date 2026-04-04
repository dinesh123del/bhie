import { AIEngine } from '../utils/aiEngine.js';
export async function analyzeMarketData(businessData, provider) {
    const prompt = `
Analyze market potential for:
- Revenue: $${businessData.revenue}
- Customers: ${businessData.customerCount}
- Category: ${businessData.category}

Provide JSON:
{
  "demandLevel": "string",
  "competitionIntensity": "string",
  "marketTrend": "string",
  "marketGaps": ["string"],
  "opportunities": ["string"],
  "threats": ["string"],
  "customerRetention": "string",
  "marketRecommendations": ["string"],
  "marketScore": "number"
}`;
    try {
        const response = await AIEngine.generateCompletion(prompt, { preferredProvider: provider });
        return JSON.parse(response.content);
    }
    catch (error) {
        console.error('Market Agent error:', error);
        return { error: 'Market analysis failed' };
    }
}
