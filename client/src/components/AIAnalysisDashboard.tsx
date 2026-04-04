import React from 'react';
import type { AnalysisResult, Strategy } from '../types/ai';
import type { AIAnalysisResponse } from '../services/aiService';

interface AIAnalysisDashboardProps {
  analysisResult: AnalysisResult | AIAnalysisResponse;
  loading?: boolean;
}

/**
 * AI Analysis Dashboard Component
 * Displays all AI insights, predictions, and strategic recommendations
 */
export const AIAnalysisDashboard: React.FC<AIAnalysisDashboardProps> = ({
  analysisResult,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your business data...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult || analysisResult.status !== 'complete') {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          {analysisResult?.message || 'Analysis failed. Please try again.'}
        </p>
      </div>
    );
  }

  const { analysis } = analysisResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">AI Business Analysis</h1>
        <p className="opacity-90">
          {new Date(analysisResult.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Business Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Revenue</p>
          <p className="text-2xl font-bold text-blue-600">
            ${analysisResult.businessData.revenue?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Expenses</p>
          <p className="text-2xl font-bold text-green-600">
            ${analysisResult.businessData.expenses?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Customers</p>
          <p className="text-2xl font-bold text-purple-600">
            {analysisResult.businessData.customerCount?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Financial Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">💰 Financial Insights</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Profit Margin</p>
            <p className="text-xl font-bold text-blue-600">
              {analysis.financial.profitMargin}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Expense Ratio</p>
            <p className="text-xl font-bold text-blue-600">
              {analysis.financial.expenseRatio}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold text-gray-700 mb-2">Key Findings</p>
          <ul className="list-disc list-inside space-y-1">
            {analysis.financial.keyFindings.map((finding: string, idx: number) => (
              <li key={idx} className="text-gray-700">
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {analysis.financial.risks.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-800 mb-2">⚠️ Financial Risks</p>
            <ul className="list-disc list-inside space-y-1">
              {analysis.financial.risks.map((risk: string, idx: number) => (
                <li key={idx} className="text-red-700">
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-semibold text-blue-800 mb-2">💡 Recommendations</p>
          <ul className="list-disc list-inside space-y-1">
            {analysis.financial.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="text-blue-700">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🎯 Market Insights</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Demand Level</p>
            <p className="font-bold text-gray-800">{analysis.market.demandLevel}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Competition</p>
            <p className="font-bold text-gray-800">{analysis.market.competitionIntensity}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Market Trend</p>
            <p className="font-bold text-gray-800">{analysis.market.marketTrend}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-700 mb-2">📈 Opportunities</p>
            <ul className="list-disc list-inside space-y-1">
              {analysis.market.opportunities.map((opp: string, idx: number) => (
                <li key={idx} className="text-green-700 text-sm">
                  {opp}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">⚠️ Threats</p>
            <ul className="list-disc list-inside space-y-1">
              {analysis.market.threats.map((threat: string, idx: number) => (
                <li key={idx} className="text-red-700 text-sm">
                  {threat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔮 Revenue Predictions</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold text-blue-800">3-Month Forecast</p>
            <p className="text-xl font-bold text-blue-600 mt-2">
              {analysis.predictions.forecast3Month.revenue}
            </p>
            <p className="text-sm text-gray-600">
              {analysis.predictions.forecast3Month.changePercent} change
            </p>
            <p className="text-xs text-gray-500">
              Confidence: {analysis.predictions.forecast3Month.confidence}
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-semibold text-green-800">6-Month Forecast</p>
            <p className="text-xl font-bold text-green-600 mt-2">
              {analysis.predictions.forecast6Month.revenue}
            </p>
            <p className="text-sm text-gray-600">
              {analysis.predictions.forecast6Month.changePercent} change
            </p>
            <p className="text-xs text-gray-500">
              Confidence: {analysis.predictions.forecast6Month.confidence}
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded">
            <p className="text-sm font-semibold text-purple-800">12-Month Forecast</p>
            <p className="text-xl font-bold text-purple-600 mt-2">
              {analysis.predictions.forecast12Month.revenue}
            </p>
            <p className="text-sm text-gray-600">
              {analysis.predictions.forecast12Month.changePercent} change
            </p>
            <p className="text-xs text-gray-500">
              Confidence: {analysis.predictions.forecast12Month.confidence}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="font-semibold text-gray-700 mb-2">Growth Trajectory: {analysis.predictions.growthTrajectory}</p>
          <p className="text-gray-600">Overall Trend: {analysis.predictions.overallTrend}</p>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">💡 Strategic Recommendations</h2>
        <p className="text-gray-700 mb-4">{analysis.strategies.executiveSummary}</p>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-bold text-yellow-800 mb-2">Today's Actions (Do Immediately)</p>
          <ul className="list-disc list-inside space-y-1">
            {analysis.strategies.immediateActions.slice(0, 3).map((action: string, idx: number) => (
              <li key={idx} className="text-yellow-700">
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {analysis.strategies.strategies.map((strategy: Strategy) => (
            <div
              key={strategy.rank}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {strategy.rank}. {strategy.title}
                </h3>
                <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded">
                  Impact: {strategy.impactPercent}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{strategy.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-600">Expected Impact: {strategy.expectedImpact}</p>
                  <p className="text-gray-600">Timeline: {strategy.timeline}</p>
                </div>
                <div>
                  <p className="text-gray-600">Risk Level: {strategy.riskLevel}</p>
                  <p className="text-gray-600">Confidence: {strategy.confidence}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Action Plan:</span> {strategy.actionPlan}
              </p>

              <div className="text-sm">
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Success Metrics:</span>{' '}
                  {strategy.successMetrics.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Mitigation */}
      <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
        <h3 className="text-xl font-bold text-red-800 mb-3">🛡️ Risk Mitigation</h3>
        <ul className="list-disc list-inside space-y-2">
            {analysis.strategies.riskMitigation.map((mitigation: string, idx: number) => (
            <li key={idx} className="text-red-700">
              {mitigation}
            </li>
          ))}
        </ul>
        <p className="text-red-700 mt-4 text-sm">
          Next Review: {analysis.strategies.nextReviewDate}
        </p>
      </div>
    </div>
  );
};

export default AIAnalysisDashboard;
