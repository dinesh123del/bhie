import Record from '../models/Record';
import Business from '../models/Business.js';

interface SummaryResult {
  income: number;
  expenses: number;
  profit: number;
  healthScore: number;
  pendingCount: number;
  recentTransactions: any[];
}

export class BusinessSummary {
  static async get(businessId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<SummaryResult> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const [incomeResult, expenseResult] = await Promise.all([
      Record.aggregate([
        { 
          $match: { 
            businessId,
            type: 'income',
            date: { $gte: startDate, $lte: now },
            status: { $ne: 'cancelled' }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Record.aggregate([
        { 
          $match: { 
            businessId,
            type: 'expense',
            date: { $gte: startDate, $lte: now },
            status: { $ne: 'cancelled' }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const income = incomeResult[0]?.total || 0;
    const expenses = expenseResult[0]?.total || 0;
    const profit = income - expenses;

    // Calculate health score (0-100)
    const healthScore = await this.calculateHealthScore(income, expenses, businessId);

    const pendingCount = await Record.countDocuments({
      businessId,
      status: 'pending',
      date: { $gte: startDate }
    });

    const recentTransactions = await Record.find({
      businessId,
      date: { $gte: startDate }
    })
    .sort({ date: -1 })
    .limit(5)
    .lean();

    return {
      income,
      expenses,
      profit,
      healthScore,
      pendingCount,
      recentTransactions
    };
  }

  private static async calculateHealthScore(income: number, expenses: number, businessId: string): Promise<number> {
    let score = 50; // Base score

    // Profit margin factor
    if (income > 0) {
      const profitMargin = (income - expenses) / income;
      if (profitMargin > 0.3) score += 20;
      else if (profitMargin > 0.15) score += 10;
      else if (profitMargin > 0) score += 0;
      else score -= 20;
    } else if (expenses > 0) {
      score -= 30;
    }

    // Trend analysis
    const trend = await this.calculateTrend(businessId);
    score += trend;

    // Cap between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static async calculateTrend(businessId: string): Promise<number> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      this.getMonthlyRevenue(businessId, thisMonth, now),
      this.getMonthlyRevenue(businessId, lastMonth, thisMonth),
    ]);

    if (lastMonthRevenue === 0) return 0;
    
    const growth = (thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue;
    
    if (growth > 0.2) return 15;
    if (growth > 0.05) return 10;
    if (growth > -0.05) return 0;
    if (growth > -0.2) return -10;
    return -20;
  }

  private static async getMonthlyRevenue(businessId: string, start: Date, end: Date): Promise<number> {
    const result = await Record.aggregate([
      {
        $match: {
          businessId,
          type: 'income',
          date: { $gte: start, $lt: end },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return result[0]?.total || 0;
  }

  static async getYearlyComparison(businessId: string): Promise<{
    thisYear: number;
    lastYear: number;
    growth: number;
  }> {
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const [thisYear, lastYear] = await Promise.all([
      this.getPeriodRevenue(businessId, thisYearStart, now),
      this.getPeriodRevenue(businessId, lastYearStart, lastYearEnd)
    ]);

    const growth = lastYear > 0 ? ((thisYear - lastYear) / lastYear) * 100 : 0;

    return { thisYear, lastYear, growth };
  }

  private static async getPeriodRevenue(businessId: string, start: Date, end: Date): Promise<number> {
    const result = await Record.aggregate([
      {
        $match: {
          businessId,
          type: 'income',
          date: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return result[0]?.total || 0;
  }
}
