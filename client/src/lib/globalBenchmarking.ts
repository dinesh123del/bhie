/**
 * Global Benchmarking Engine
 * 
 * This module allows users to compare their business health against
 * thousands of anonymized data points from similar industries globally.
 * 
 * Part of the BHIE 2050 Vision (Top 1% Strategy).
 */

export interface BenchmarkingResult {
  percentile: number;
  industryAverage: number;
  top1PercentThreshold: number;
  delta: number;
  recommendation: string;
}

export const getGlobalBenchmarks = (
  industry: string,
  currentMetric: number,
  metricName: 'profit_margin' | 'revenue_growth' | 'expense_efficiency'
): BenchmarkingResult => {
  // In a production scenario, this would call a Zero-Knowledge aggregator
  // or a curated global database. Here we simulate the logic.

  const mockBenchmarks: Record<string, any> = {
    'SaaS': { avg: 22, top1: 65 },
    'Retail': { avg: 8, top1: 25 },
    'Service': { avg: 15, top1: 40 },
    'Manufacturing': { avg: 12, top1: 35 },
    'Default': { avg: 10, top1: 30 }
  };

  const benchmarks = mockBenchmarks[industry] || mockBenchmarks['Default'];
  
  const percentile = Math.min(99, Math.max(1, Math.round((currentMetric / benchmarks.top1) * 100)));
  const delta = currentMetric - benchmarks.avg;

  let recommendation = '';
  if (percentile >= 90) {
    recommendation = "You are in the elite tier. Focus on long-term sustainability and brand moat.";
  } else if (percentile >= 50) {
    recommendation = "Performing above average. Optimize operational efficiency to break into the Top 10%.";
  } else {
    recommendation = `You are performing below industry average (${benchmarks.avg}%). Focus on cost reduction immediately to reach parity.`;
  }

  return {
    percentile,
    industryAverage: benchmarks.avg,
    top1PercentThreshold: benchmarks.top1,
    delta,
    recommendation
  };
};

/**
 * Calculates 'Anti-Fragility' based on financial runway and revenue diversity
 */
export const calculateAntiFragility = (
  monthlyBurn: number,
  cashOnHand: number,
  revenueConcentration: number // 0-1 (1 means all revenue from one client)
): number => {
  const runwayMonths = cashOnHand / (monthlyBurn || 1);
  const diversityFactor = 1 - revenueConcentration;
  
  // Anti-fragility score (0-100)
  // High runway + Low concentration = High resilience
  const score = (Math.min(1, runwayMonths / 12) * 60) + (diversityFactor * 40);
  
  return Math.round(score);
};
