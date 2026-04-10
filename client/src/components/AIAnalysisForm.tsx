import React, { useState } from 'react';
import { aiService, type BusinessData, type AIAnalysisResponse } from '../services/aiService';

interface AIAnalysisFormProps {
  onAnalysisComplete?: (result: AIAnalysisResponse) => void;
  onLoading?: (loading: boolean) => void;
}

/**
 * AI Analysis Form Component
 * Allows users to input business data and trigger multi-agent analysis
 */
export const AIAnalysisForm: React.FC<AIAnalysisFormProps> = ({
  onAnalysisComplete,
  onLoading,
}) => {
  const [formData, setFormData] = useState<BusinessData>({
    revenue: 0,
    expenses: 0,
    customerCount: 0,
    previousRevenue: 0,
    category: '',
    marketPosition: '',
    growthRate: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    onLoading?.(true);

    try {
      // Validate required fields
      if (!formData.revenue || !formData.expenses || !formData.customerCount) {
        throw new Error('Revenue, expenses, and customer count are required');
      }

      // Call AI analysis
      const result = await aiService.analyzeBusinessData(formData);
      
      if (result.status === 'error' || result.status !== 'complete') {
        throw new Error(result.message || 'Analysis failed');
      }

      onAnalysisComplete?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Analysis Error:', err);
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🤖 Multi-Agent AI Business Analysis
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Required Fields Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Essential Metrics *</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenue ($)
            </label>
            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleInputChange}
              required
              min="0"
              step="100"
              placeholder="e.g., 50000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Expenses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expenses ($)
            </label>
            <input
              type="number"
              name="expenses"
              value={formData.expenses}
              onChange={handleInputChange}
              required
              min="0"
              step="100"
              placeholder="e.g., 30000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              required
              min="0"
              step="1"
              placeholder="e.g., 100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 font-medium underline"
        >
          {showAdvanced ? '▼ Hide Advanced Options' : '▶ Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  min="0"
                  step="100"
                  placeholder="e.g., 45000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category
                </label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Technology">Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Market Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Position
                </label>
                <select
                  name="marketPosition"
                  value={formData.marketPosition || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select position...</option>
                  <option value="Market Leader">Market Leader</option>
                  <option value="Challenger">Challenger</option>
                  <option value="Established">Established Player</option>
                  <option value="Startup">Startup</option>
                  <option value="Niche Player">Niche Player</option>
                </select>
              </div>

              {/* Growth Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growth Rate (%)
                </label>
                <input
                  type="number"
                  name="growthRate"
                  value={formData.growthRate}
                  onChange={handleInputChange}
                  step="0.1"
                  placeholder="e.g., 12.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span>
              Analyzing...
            </span>
          ) : (
            '🚀 Run AI Analysis'
          )}
        </button>

        <button
          type="reset"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
        >
          Reset
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Our AI agents will analyze your financial performance, market position, 
          predict future trends, and recommend strategic actions based on comprehensive business intelligence.
        </p>
      </div>
    </form>
  );
};

export default AIAnalysisForm;