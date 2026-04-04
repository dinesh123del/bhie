import { callOpenAI, parseAIResponse } from '../utils/openai.js';
/**
 * Strategy Agent
 * Combines all insights to create actionable strategic recommendations
 */
export async function generateStrategy(financialInsights, marketInsights, predictions) {
    const prompt = `
You are a strategic business advisor AI agent. Based on comprehensive financial, market, and predictive analysis, generate strategic recommendations.

FINANCIAL INSIGHTS:
${JSON.stringify(financialInsights, null, 2)}

MARKET INSIGHTS:
${JSON.stringify(marketInsights, null, 2)}

PREDICTIVE INSIGHTS:
${JSON.stringify(predictions, null, 2)}

STRATEGIC RECOMMENDATIONS REQUIRED:
1. Identify the top 3 actionable strategies
2. For EACH strategy provide:
   - Clear action plan
   - Expected business impact
   - Timeline (short/medium/long term)
   - Resource requirements
   - ROI estimate
   - Success metrics
   - Confidence level

3. Prioritize by:
   - Effort required
   - Potential revenue impact
   - Timeline to implement
   - Risk level

Provide recommendations in this JSON format:
{
  "executiveSummary": "Brief overview of strategic position",
  "strategicPriority": "high/medium/low",
  "timeToImplement": "days",
  "estimatedROI": "X%",
  "strategies": [
    {
      "rank": 1,
      "title": "Strategy Name",
      "description": "Clear description",
      "actionPlan": "Specific steps",
      "expectedImpact": "$X revenue increase",
      "impactPercent": "Y%",
      "timeline": "days/weeks/months",
      "resourcesNeeded": ["resource 1", "resource 2"],
      "riskLevel": "low/medium/high",
      "successMetrics": ["metric 1", "metric 2"],
      "confidence": "0-100%"
    }
  ],
  "immediateActions": [
    "action 1 (do today)",
    "action 2 (do this week)"
  ],
  "riskMitigation": [
    "mitigation 1",
    "mitigation 2"
  ],
  "nextReviewDate": "days from now"
}

Respond with ONLY the JSON object, no additional text.
`;
    try {
        const response = await callOpenAI(prompt);
        return parseAIResponse(response);
    }
    catch (error) {
        console.error('Strategy Agent Error:', error);
        return {
            error: 'Strategy generation failed',
            success: false,
        };
    }
}
export default { generateStrategy };
