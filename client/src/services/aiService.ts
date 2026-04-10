import api from '../lib/axios';

/**
 * Business Data Interface for AI Analysis
 */
export interface BusinessData {
  revenue: number;
  expenses: number;
  customerCount: number;
  previousRevenue?: number;
  category?: string;
  marketPosition?: string;
  growthRate?: number;
  industry?: string;
}

/**
 * AI Analysis Response Interface
 */
export interface AIAnalysisResponse {
  timestamp: string;
  businessData: BusinessData;
  analysis: {
    financial: Record<string, any>;
    market: Record<string, any>;
    predictions: Record<string, any>;
    strategies: Record<string, any>;
  };
  status: 'complete' | 'error' | string;
  message: string;
  analysisId?: string;
}

const unsupportedLegacyEndpoint = (name: string): never => {
  throw new Error(`${name} is not supported by the current backend. Use analyzeBusinessData or checkHealth instead.`);
};

export const aiService = {
  /**
   * Comprehensive Multi-Agent AI Analysis
   * Runs financial, market, prediction, and strategy agents
   */
  analyzeBusinessData: async (businessData: BusinessData) => {
    try {
      const response = await api.post(
        '/ai/analyze',
        businessData
      );
      return response.data;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error;
    }
  },

  /**
   * Check AI service health
   */
  checkHealth: async () => {
    try {
      const response = await api.get('/ai/health');
      return response.data;
    } catch (error) {
      console.error('AI Health Check Failed:', error);
      return { status: 'unhealthy' };
    }
  },

  /**
   * Get analysis history (if implemented)
   */
  getAnalysisHistory: async (limit: number = 10) => {
    try {
      const response = await api.get(`/ai/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Could not fetch history:', error);
      return { history: [] };
    }
  },

  predict: async () => unsupportedLegacyEndpoint('aiService.predict'),

  classifyRecord: async () => unsupportedLegacyEndpoint('aiService.classifyRecord'),

  bulkPredict: async () => unsupportedLegacyEndpoint('aiService.bulkPredict'),

  quickAnalysis: async () => unsupportedLegacyEndpoint('aiService.quickAnalysis'),
};
