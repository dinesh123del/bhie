import { callOpenAI, parseAIResponse } from '../utils/openai.js';
/**
 * Market Agent
 * Analyzes market demand, competition, and business positioning
 */
export async function analyzeMarketData(businessData) {
    const prompt = `
You are a market analyst AI agent. Analyze market potential based on the following business metrics.

BUSINESS METRICS:
- Revenue: $${businessData.revenue || 0}
- Customers: ${businessData.customerCount || 0}
- Industry/Category: ${businessData.category || 'Not specified'}
- Market Position: ${businessData.marketPosition || 'Unknown'}

MARKET ANALYSIS REQUIRED:
1. Demand potential assessment
2. Competition analysis
3. Market trends
4. Growth opportunities
5. Market share potential
6. Customer retention insights

Provide your analysis in this JSON format:
{
  "demandLevel": "high/medium/low",
  "competitionIntensity": "high/medium/low",
  "marketTrend": "growing/stable/declining",
  "marketGaps": [
    "gap 1",
    "gap 2"
  ],
  "opportunities": [
    "opportunity 1",
    "opportunity 2",
    "opportunity 3"
  ],
  "threats": [
    "threat 1",
    "threat 2"
  ],
  "customerRetention": "strong/moderate/weak",
  "marketRecommendations": [
    "action 1",
    "action 2"
  ],
  "marketScore": "1-10"
}

Respond with ONLY the JSON object, no additional text.
`;
    try {
        const response = await callOpenAI(prompt);
        return parseAIResponse(response);
    }
    catch (error) {
        console.error('Market Agent Error:', error);
        return {
            error: 'Market analysis failed',
            success: false,
        };
    }
}
export default { analyzeMarketData };
