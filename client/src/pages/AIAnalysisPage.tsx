import React, { useState } from 'react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { AIAnalysisDashboard } from '../components/AIAnalysisDashboard';
import type { BusinessData } from '../types/ai';

/**
 * AI Analysis Page
 * Main entry point for users to trigger AI analysis
 */
export const AIAnalysisPage: React.FC = () => {
  const [formData, setFormData] = useState<BusinessData>({
    revenue: 0,
    expenses: 0,
    customerCount: 0,
    previousRevenue: 0,
  });

  const { data: analysisResult, loading, error, analyze, reset } = useAIAnalysis();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customerCount' ? parseInt(value) : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await analyze(formData);
  };

  const handleReset = () => {
    reset();
    setFormData({
      revenue: 0,
      expenses: 0,
      customerCount: 0,
      previousRevenue: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Business Analysis</h1>
          <p className="text-gray-600">
            Get comprehensive insights powered by multi-agent AI system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Your Data</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Revenue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Revenue ($)
                  </label>
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Expenses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Expenses ($)
                  </label>
                  <input
                    type="number"
                    name="expenses"
                    value={formData.expenses}
                    onChange={handleInputChange}
                    placeholder="e.g., 30000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Customer Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Count
                  </label>
                  <input
                    type="number"
                    name="customerCount"
                    value={formData.customerCount}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Previous Revenue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Revenue ($)
                  </label>
                  <input
                    type="number"
                    name="previousRevenue"
                    value={formData.previousRevenue}
                    onChange={handleInputChange}
                    placeholder="e.g., 45000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      '🚀 Analyze'
                    )}
                  </button>
                  {analysisResult && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-2">💡 How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Financial AI analyzes profitability & risks</li>
                  <li>Market AI evaluates demand & competition</li>
                  <li>Prediction AI forecasts revenue trends</li>
                  <li>Strategy AI generates actionable recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <AIAnalysisDashboard
                analysisResult={analysisResult}
                loading={loading}
              />
            ) : loading ? (
              <div className="bg-white rounded-lg shadow p-12">
                <AIAnalysisDashboard
                  analysisResult={{
                    timestamp: new Date().toISOString(),
                    businessData: {} as any,
                    analysis: {} as any,
                    status: 'error',
                    message: '',
                  }}
                  loading={true}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  AI Analysis Ready
                </h3>
                <p className="text-gray-600">
                  Enter your business data and click "Analyze" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPage;
