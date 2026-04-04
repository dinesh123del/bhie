import type { InputData } from './smartRecommendations';

export interface BusinessAdvisorOutput {
  summary: string;
  advice: string;
}

function analyzeBusinessHealth(data: InputData): BusinessAdvisorOutput {
  const { revenue, expenses, profit, growthRate } = data;
  const expenseRatio = revenue > 0 ? (expenses / revenue) : 1;
  const isGrowing = growthRate > 0;
  const isProfitable = profit > 0;
  const expensesHigh = expenseRatio > 0.7;
  const trend = deriveTrend(growthRate);

  let summary = '';
  let advice = '';

  if (trend === 'up' && isProfitable) {
    summary = `You're doing great — revenue is growing steadily at a healthy pace. Profit margins look solid, showing your business is on a strong upward trajectory.`;
    advice = `Keep the momentum going! Consider strategic investments like hiring key talent or expanding into complementary markets to accelerate growth even further.`;
  } else if (trend === 'up' && !isProfitable) {
    summary = `Good news on revenue growth, but expenses are keeping profit under pressure right now.`;
    advice = `Tighten expense control while protecting growth initiatives. Review vendor contracts and optimize operations to unlock the profitability you deserve.`;
  } else if (trend === 'down') {
    summary = `Things are a bit challenging with declining trends across key metrics. This is a signal to take decisive action.`;
    advice = `Conduct an immediate operational review. Cut non-essential costs by 15-20%, renegotiate supplier terms, and focus on your highest-margin products/services.`;
  } else if (trend === 'stable' && isProfitable) {
    summary = `Your business is running smoothly with steady performance and healthy profits. Perfect foundation for the next growth phase.`;
    advice = `This stability is your opportunity. Explore new revenue streams, product diversification, or market expansion to break through to the next level.`;
  } else if (trend === 'stable' && !isProfitable) {
    summary = `Operations are stable but profitability needs attention. Expenses might be slightly high relative to revenue.`;
    advice = `Small wins matter here. Negotiate better rates with suppliers, streamline processes, or introduce premium pricing to improve margins without disrupting stability.`;
  } else if (expensesHigh) {
    summary = `Revenue looks promising, however expenses are consuming too much of your top line, limiting profit potential.`;
    advice = `Target your biggest expense categories first. Look for 10-15% savings through better vendor terms, process automation, or outsourcing non-core functions.`;
  } else {
    summary = `Your business shows balanced fundamentals. Steady progress with room for optimization.`;
    advice = `Continue monitoring key metrics closely. Consider a growth audit to identify untapped opportunities in your current model.`;
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

