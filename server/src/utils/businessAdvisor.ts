import type { InputData } from './smartRecommendations.js';

export interface BusinessAdvisorOutput {
  summary: string;
  advice: string;
}

function analyzeBusinessHealth(data: InputData): BusinessAdvisorOutput {
  const { revenue, expenses, profit, growthRate } = data;
  const expenseRatio = revenue > 0 ? (expenses / revenue) : 1;

  const isProfitable = profit > 0;
  const expensesHigh = expenseRatio > 0.7;
  const trend = deriveTrend(growthRate);

  let summary = '';
  let advice = '';

  if (trend === 'up' && isProfitable) {
    summary = `Your business is growing steadily! Profit margins look solid, showing you're on a great path.`;
    advice = `Keep it up! Think about hiring more people or expanding into new areas to grow even faster.`;
  } else if (trend === 'up' && !isProfitable) {
    summary = `Revenue is growing, but your expenses are too high right now, which is eating into your profit.`;
    advice = `Try to lower your costs while still growing your sales. Review your monthly bills and optimize how you work.`;
  } else if (trend === 'down') {
    summary = `Numbers are going down lately. It's time to take quick action to fix this.`;
    advice = `Review all your spending immediately. Cut non-essential costs by 15-20% and focus on your most profitable services.`;
  } else if (trend === 'stable' && isProfitable) {
    summary = `Everything is running smoothly with steady profit. This is a great time to plan for the future.`;
    advice = `Use this stability to your advantage. Look for new ways to make money or expand your business.`;
  } else if (trend === 'stable' && !isProfitable) {
    summary = `Your business is stable, but you aren't making enough profit yet. Expenses might be too high.`;
    advice = `Small changes will help. Negotiate better prices with suppliers or raise your prices slightly to improve your profit.`;
  } else if (expensesHigh) {
    summary = `Revenue looks good, but you are spending too much money, which leaves very little profit.`;
    advice = `Look at your biggest expenses first. Try to save 10-15% by using automation or negotiating better deals.`;
  } else {
    summary = `Your business is in a good, balanced state. Steady progress with some room to grow.`;
    advice = `Keep a close eye on your numbers. Look for untapped opportunities to grow even more.`;
  }

  return { summary, advice };
}

function deriveTrend(growthRate: number): 'up' | 'down' | 'stable' {
  if (growthRate > 5) return 'up';
  if (growthRate < -5) return 'down';
  return 'stable';
}

export function getBusinessAdvisorExplanation(data: InputData): BusinessAdvisorOutput {
  return analyzeBusinessHealth(data);
}

