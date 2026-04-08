/**
 * AERA Price Intelligence Engine
 * 
 * Uses global anonymized benchmarks to identify subscription and vendor overpayments.
 * Part of the 'Autonomous Savings' billion-dollar feature set.
 */

export interface PricingBenchmark {
  vendor: string;
  category: string;
  standardPrice: number; // e.g. monthly for 1-5 users
  optimizedPrice: number; // The price AERA can negotiate or find
  currency: string;
}

export const GLOBAL_PRICE_BENCHMARKS: PricingBenchmark[] = [
  { vendor: 'AWS', category: 'Cloud', standardPrice: 500, optimizedPrice: 380, currency: 'USD' },
  { vendor: 'Slack', category: 'Communication', standardPrice: 15, optimizedPrice: 12, currency: 'USD' },
  { vendor: 'Zoom', category: 'Communication', standardPrice: 15, optimizedPrice: 11, currency: 'USD' },
  { vendor: 'Google Workspace', category: 'Suite', standardPrice: 12, optimizedPrice: 9.60, currency: 'USD' },
  { vendor: 'Canva', category: 'Design', standardPrice: 12, optimizedPrice: 10, currency: 'USD' },
  { vendor: 'Shopify', category: 'E-commerce', standardPrice: 39, optimizedPrice: 32, currency: 'USD' },
  { vendor: 'Microsoft 365', category: 'Suite', standardPrice: 12.50, optimizedPrice: 10, currency: 'USD' },
  { vendor: 'Adobe Creative Cloud', category: 'Design', standardPrice: 55, optimizedPrice: 35, currency: 'USD' }
];

export interface SavingsOpportunity {
  vendor: string;
  currentSpent: number;
  potentialSavings: number;
  percentage: number;
  action: 'renegotiate' | 'switch' | 'optimize';
  message: string;
}

export const findSavingsOpportunities = (userRecords: { vendor: string; amount: number }[]): SavingsOpportunity[] => {
  const opportunities: SavingsOpportunity[] = [];

  userRecords.forEach(record => {
    // Basic fuzzy match for vendor names
    const benchmark = GLOBAL_PRICE_BENCHMARKS.find(b => 
      record.vendor.toLowerCase().includes(b.vendor.toLowerCase()) || 
      b.vendor.toLowerCase().includes(record.vendor.toLowerCase())
    );

    if (benchmark && record.amount > benchmark.optimizedPrice) {
      const potentialMonthlySavings = record.amount - benchmark.optimizedPrice;
      const percentage = (potentialMonthlySavings / record.amount) * 100;

      if (percentage > 5) { // Only show if savings > 5%
        opportunities.push({
          vendor: benchmark.vendor,
          currentSpent: record.amount,
          potentialSavings: potentialMonthlySavings,
          percentage: Math.round(percentage),
          action: percentage > 30 ? 'switch' : 'renegotiate',
          message: `AERA detected that comparable companies pay ${Math.round(percentage)}% less for ${benchmark.vendor}.`
        });
      }
    }
  });

  return opportunities;
};
