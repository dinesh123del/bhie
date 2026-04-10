import { useState, useCallback } from 'react';
import api from '../lib/axios';
import type { BusinessData, AnalysisResult } from '../types/ai';

interface UseAIAnalysisState {
  data: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

interface UseAIAnalysisReturn extends UseAIAnalysisState {
  analyze: (businessData: BusinessData) => Promise<void>;
  reset: () => void;
}

/**
 * React Hook for AI Analysis
 * Handles API calls to multi-agent AI system
 *
 * Usage:
 * const { data, loading, error, analyze, reset } = useAIAnalysis();
 * 
 * await analyze({
 *   revenue: 50000,
 *   expenses: 30000,
 *   customerCount: 100
 * });
 */
export const useAIAnalysis = (): UseAIAnalysisReturn => {
  const [state, setState] = useState<UseAIAnalysisState>({
    data: null,
    loading: false,
    error: null,
  });

  const analyze = useCallback(async (businessData: BusinessData) => {
    // Validate input
    if (!businessData.revenue || !businessData.expenses || businessData.customerCount === undefined) {
      setState(prev => ({
        ...prev,
        error: 'Missing required fields: revenue, expenses, customerCount',
      }));
      return;
    }

    setState({ data: null, loading: true, error: null });

    try {
      const response = await api.post('/ai/analyze', {
        businessData,
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Analysis failed';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    analyze,
    reset,
  };
};

export default useAIAnalysis;
