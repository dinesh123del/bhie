/**
 * AI Dashboard Component
 * Displays comprehensive AI business analysis
 */

import React, { useState } from 'react';
import { aiService, BusinessData, AIAnalysisResponse } from '../services/aiService';

export const AIDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BusinessData>({
    revenue: 50000,
    expenses: 30000,
    customerCount: 100,
    previousRevenue: 45000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeBusinessData(formData);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 AI Business Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Intelligent insights powered by multi-agent AI system
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Enter Business Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Revenue ($)
              </label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter revenue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expenses ($)
              </label>
              <input
                type="number"
                name="expenses"
                value={formData.expenses}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expenses"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Count
              </label>
              <input
                type="number"
                name="customerCount"
                value={formData.customerCount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer count"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previous Revenue ($)
              </label>
              <input
                type="number"
                name="previousRevenue"
                value={formData.previousRevenue || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter previous revenue (optional)"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              '📊 Analyze Now'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-800 font-semibold">❌ Error: {error}</p>
          </div>
        )}

        {/* Results Display */}
        {analysis && (
          <div className="space-y-6">
            {/* Financial Insights */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">💰 Financial Insights</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analysis.analysis?.financial?.profitMargin || 'N/A'}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Expense Ratio</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {analysis.analysis?.financial?.expenseRatio || 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Profit Trend</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">
                    {analysis.analysis?.financial?.profitTrend || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Key Findings</h4>
                <ul className="space-y-2">
                  {analysis.analysis?.financial?.keyFindings?.map(
                    (finding: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-3 flex-shrink-0">✓</span>
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {analysis.analysis?.financial?.risks && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">⚠️ Identified Risks</h4>
                  <ul className="space-y-2">
                    {analysis.analysis.financial.risks.map(
                      (risk: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-3 flex-shrink-0">⚠</span>
                          <span className="text-gray-700">{risk}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">🎯 Market Insights</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Demand Level</p>
                  <p className="text-2xl font-bold text-blue-600 uppercase">
                    {analysis.analysis?.market?.demandLevel || 'N/A'}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Competition</p>
                  <p className="text-2xl font-bold text-purple-600 uppercase">
                    {analysis.analysis?.market?.competitionIntensity || 'N/A'}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Market Trend</p>
                  <p className="text-2xl font-bold text-indigo-600 uppercase">
                    {analysis.analysis?.market?.marketTrend || 'N/A'}
                  </p>
                </div>
              </div>

              {analysis.analysis?.market?.opportunities && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">💡 Opportunities</h4>
                  <ul className="space-y-2">
                    {analysis.analysis.market.opportunities.map(
                      (opp: string, idx: number) => (
                        <li key={idx} className="flex items-start bg-blue-50 p-3 rounded">
                          <span className="text-blue-500 mr-3 flex-shrink-0">→</span>
                          <span className="text-gray-700">{opp}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Predictions */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">🔮 Revenue Predictions</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-2">3-Month Forecast</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analysis.analysis?.predictions?.forecast3Month?.revenue || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {analysis.analysis?.predictions?.forecast3Month?.changePercent}
                  </p>
                  <p className="text-xs text-gray-500">
                    Confidence: {analysis.analysis?.predictions?.forecast3Month?.confidence}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-2">6-Month Forecast</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analysis.analysis?.predictions?.forecast6Month?.revenue || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {analysis.analysis?.predictions?.forecast6Month?.changePercent}
                  </p>
                  <p className="text-xs text-gray-500">
                    Confidence: {analysis.analysis?.predictions?.forecast6Month?.confidence}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-2">12-Month Forecast</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analysis.analysis?.predictions?.forecast12Month?.revenue || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {analysis.analysis?.predictions?.forecast12Month?.changePercent}
                  </p>
                  <p className="text-xs text-gray-500">
                    Confidence: {analysis.analysis?.predictions?.forecast12Month?.confidence}
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">⚡ Recommended Strategies</h3>

              <div className="space-y-4">
                {analysis.analysis?.strategies?.strategies?.map(
                  (strategy: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800">
                            #{strategy.rank}: {strategy.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-indigo-600">
                            {strategy.confidence}
                          </p>
                          <p className="text-xs text-gray-500">{strategy.timeline}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Expected Impact</p>
                          <p className="font-semibold text-green-600">
                            {strategy.expectedImpact}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Risk Level</p>
                          <p className={`font-semibold ${
                            strategy.riskLevel === 'high'
                              ? 'text-red-600'
                              : strategy.riskLevel === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {strategy.riskLevel?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Immediate Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-pink-500">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">🚀 Do This Today</h3>
              <ul className="space-y-2">
                {analysis.analysis?.strategies?.immediateActions?.map(
                  (action: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-pink-500 mr-3 flex-shrink-0 text-lg">✓</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Enter your business data and click "Analyze Now" to get AI-powered insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDashboard;
