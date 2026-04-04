import { analyzeFinancialData } from './financialAgent.js';
import { analyzeMarketData } from './marketAgent.js';
import { predictFuturePerformance } from './predictionAgent.js';
import { generateStrategy } from './strategyAgent.js';
/**
 * Orchestrator
 * Coordinates all AI agents to run comprehensive business analysis
 */
export async function runAgents(businessData) {
    console.log('🤖 Starting Multi-Agent AI Analysis...');
    try {
        // Step 1: Run Financial Agent
        console.log('📊 Running Financial Analysis...');
        const financialInsights = await analyzeFinancialData(businessData);
        console.log('✅ Financial Analysis Complete');
        // Step 2: Run Market Agent
        console.log('🎯 Running Market Analysis...');
        const marketInsights = await analyzeMarketData(businessData);
        console.log('✅ Market Analysis Complete');
        // Step 3: Run Prediction Agent
        console.log('🔮 Running Predictive Analysis...');
        const predictions = await predictFuturePerformance(businessData);
        console.log('✅ Predictive Analysis Complete');
        // Step 4: Run Strategy Agent with all insights
        console.log('💡 Generating Strategic Recommendations...');
        const strategies = await generateStrategy(financialInsights, marketInsights, predictions);
        console.log('✅ Strategic Recommendations Generated');
        // Combine all results
        const combinedResult = {
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
            message: '🎯 AI Analysis Complete - Review insights and take action',
        };
        console.log('🎉 Multi-Agent Analysis Complete');
        return combinedResult;
    }
    catch (error) {
        console.error('❌ Orchestrator Error:', error);
        return {
            status: 'error',
            message: 'AI analysis failed',
            error: error instanceof Error ? error.message : 'Unknown error',
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
