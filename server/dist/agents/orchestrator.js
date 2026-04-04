import { analyzeFinancialData } from './financialAgent.js';
import { analyzeMarketData } from './marketAgent.js';
import { predictFuturePerformance } from './predictionAgent.js';
import { generateStrategy } from './strategyAgent.js';
export async function runAgents(businessData, provider) {
    console.log(`🤖 Starting Analysis [Provider: ${provider || 'default'}]...`);
    try {
        const [financialInsights, marketInsights, predictions] = await Promise.all([
            analyzeFinancialData(businessData, provider),
            analyzeMarketData(businessData, provider),
            predictFuturePerformance(businessData, provider)
        ]);
        const strategies = await generateStrategy(financialInsights, marketInsights, predictions, provider);
        return {
            timestamp: new Date().toISOString(),
            businessData: {
                revenue: businessData.revenue,
                expenses: businessData.expenses,
                customerCount: businessData.customerCount,
            },
            analysis: {
                financial: financialInsights,
                market: marketInsights,
                predictions,
                strategies,
            },
            status: 'complete',
            message: 'Analysis completed successfully',
        };
    }
    catch (error) {
        console.error('❌ Orchestrator Error:', error);
        return {
            status: 'error',
            message: 'AI analysis failed',
            error: error.message,
        };
    }
}
/**
 * Validate business data before processing
 */
export function validateBusinessData(data) {
    const requiredFields = ['revenue', 'expenses', 'customerCount'];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
            console.error(`❌ Missing required field: ${field}`);
            return false;
        }
    }
    // Validate numeric fields
    if (isNaN(data.revenue) || isNaN(data.expenses) || isNaN(data.customerCount)) {
        console.error('❌ Revenue, expenses, and customerCount must be numbers');
        return false;
    }
    return true;
}
export default {
    runAgents,
    validateBusinessData,
};
