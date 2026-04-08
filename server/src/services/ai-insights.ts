import Record from '../models/Record';
import Business from '../models/Business.js';
import { BusinessSummary } from './business-summary';

interface InsightResult {
  summary: string;
  topAction: string;
  actions: string[];
  risks: string[];
  opportunities: string[];
}

export class AIInsights {
  static async getQuickSummary(businessId: string): Promise<InsightResult> {
    const summary = await BusinessSummary.get(businessId);
    const business = await Business.findById(businessId);
    
    const insights: InsightResult = {
      summary: '',
      topAction: '',
      actions: [],
      risks: [],
      opportunities: []
    };

    // Generate summary based on financial health
    if (summary.profit > 0) {
      const margin = (summary.profit / summary.income) * 100;
      if (margin > 30) {
        insights.summary = `🎉 Great month! Your profit margin is ${margin.toFixed(1)}%, which is excellent. You're keeping ${summary.profit.toLocaleString('en-IN')} after all expenses.`;
      } else if (margin > 15) {
        insights.summary = `👍 Good performance. Your profit margin of ${margin.toFixed(1)}% is healthy. Net profit: ${summary.profit.toLocaleString('en-IN')}.`;
      } else {
        insights.summary = `⚠️ Your profit margin is ${margin.toFixed(1)}%, which is below optimal. Consider reviewing your pricing or reducing costs.`;
      }
    } else {
      const loss = Math.abs(summary.profit);
      insights.summary = `🚨 Alert: You're operating at a loss of ${loss.toLocaleString('en-IN')} this month. Immediate action recommended.`;
      insights.risks.push(`Monthly loss of ${loss.toLocaleString('en-IN')}`);
    }

    // Analyze expense patterns
    const expenseAnalysis = await this.analyzeExpenses(businessId);
    if (expenseAnalysis.highCategories.length > 0) {
      insights.risks.push(`High spending on: ${expenseAnalysis.highCategories.join(', ')}`);
    }

    // Trend analysis
    const comparison = await BusinessSummary.getYearlyComparison(businessId);
    if (comparison.growth > 20) {
      insights.opportunities.push(`Revenue growing ${comparison.growth.toFixed(0)}% YoY - consider expanding!`);
    } else if (comparison.growth < -10) {
      insights.risks.push(`Revenue declined ${Math.abs(comparison.growth).toFixed(0)}% compared to last year`);
    }

    // Generate actionable recommendations
    insights.actions = this.generateRecommendations(summary, expenseAnalysis);
    insights.topAction = insights.actions[0] || 'Continue monitoring your business metrics';

    return insights;
  }

  private static async analyzeExpenses(businessId: string): Promise<{
    highCategories: string[];
    unusualSpikes: string[];
    recommendations: string[];
  }> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthExpenses, lastMonthExpenses] = await Promise.all([
      this.getCategoryBreakdown(businessId, thisMonth, now),
      this.getCategoryBreakdown(businessId, lastMonth, thisMonth)
    ]);

    const highCategories: string[] = [];
    const unusualSpikes: string[] = [];
    const recommendations: string[] = [];

    for (const [category, amount] of Object.entries(thisMonthExpenses)) {
      // Check if category spending is >30% of total
      const total = Object.values(thisMonthExpenses).reduce((a: number, b: unknown) => a + (b as number), 0);
      const amountNum = amount as number;
      if (amountNum > total * 0.3) {
        highCategories.push(category);
      }

      // Check for unusual spikes (>50% increase)
      const lastMonthAmount = (lastMonthExpenses[category] as number) || 0;
      if (lastMonthAmount > 0 && amountNum > lastMonthAmount * 1.5) {
        unusualSpikes.push(`${category} (+${((amountNum - lastMonthAmount) / lastMonthAmount * 100).toFixed(0)}%)`);
      }
    }

    if (unusualSpikes.length > 0) {
      recommendations.push(`Review ${unusualSpikes[0]} - spending increased significantly`);
    }

    if (highCategories.includes('Miscellaneous')) {
      recommendations.push('Categorize Miscellaneous expenses for better tracking');
    }

    return { highCategories, unusualSpikes, recommendations };
  }

  private static async getCategoryBreakdown(
    businessId: string, 
    start: Date, 
    end: Date
  ): Promise<Record<string, number>> {
    const results = await Record.aggregate([
      {
        $match: {
          businessId,
          type: 'expense',
          date: { $gte: start, $lt: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    return results.reduce((acc, item) => {
      acc[item._id || 'Miscellaneous'] = item.total;
      return acc;
    }, {} as Record<string, number>);
  }

  private static generateRecommendations(
    summary: any, 
    expenseAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Cash flow recommendations
    if (summary.profit < 0) {
      recommendations.push('🚨 Urgent: Cut non-essential expenses immediately');
      recommendations.push('📞 Follow up on pending payments from clients');
    }

    // Expense optimization
    if (expenseAnalysis.highCategories.length > 0) {
      const topCategory = expenseAnalysis.highCategories[0];
      recommendations.push(`💡 Review your ${topCategory} spending - it\'s your largest expense category`);
    }

    // General business recommendations
    if (summary.pendingCount > 0) {
      recommendations.push(`📋 Confirm ${summary.pendingCount} pending transaction${summary.pendingCount > 1 ? 's' : ''} in your app`);
    }

    if (summary.healthScore < 40) {
      recommendations.push('📊 Schedule a financial review - your health score needs attention');
    }

    // Add standard recommendations
    recommendations.push('📸 Upload receipts regularly for accurate tracking');
    recommendations.push('📈 Review weekly reports to spot trends early');

    return recommendations;
  }

  static async getDetailedAnalysis(businessId: string): Promise<{
    financialHealth: string;
    expenseBreakdown: any[];
    trends: any;
    predictions: string[];
  }> {
    const summary = await BusinessSummary.get(businessId, 'quarter');
    const breakdown = await this.getCategoryBreakdown(
      businessId,
      new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
      new Date()
    );

    const financialHealth = summary.healthScore >= 70 ? 'Strong' : 
                           summary.healthScore >= 40 ? 'Moderate' : 'Needs Attention';

    const expenseBreakdown = Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      financialHealth,
      expenseBreakdown,
      trends: { score: summary.healthScore },
      predictions: this.generatePredictions(summary)
    };
  }

  private static generatePredictions(summary: any): string[] {
    const predictions: string[] = [];

    if (summary.profit < 0) {
      predictions.push('⚠️ At current spending rate, you may face cash flow issues next month');
    }

    if (summary.healthScore > 80) {
      predictions.push('✅ Your business is on track for strong growth this quarter');
    }

    return predictions;
  }
}
