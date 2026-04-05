import { Response } from 'express';
import { Types } from 'mongoose';
import Company from '../models/Company.js';
import Image from '../models/Image.js';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { redisClient } from '../config/redisClient.js';
import { AuthRequest } from '../types/index.js';
import { generateInsights, InsightPeriodSnapshot } from '../utils/generateInsights.js';
import { requireUser } from '../utils/request.js';

type TrendPoint = {
  name: string;
  value: number;
  date: string;
};

type MonthlyPoint = {
  month: string;
  revenue: number;
  expenses: number;
  target: number;
};

type MonthlyAggregateRow = {
  _id: {
    year: number;
    month: number;
  };
  revenue: number;
  expenses: number;
};

type PopulatedRecordPreview = {
  _id: Types.ObjectId | string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;
  title: string;
};

const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });

export const dashboardController = {
  getDashboard: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const userId = new Types.ObjectId(user.userId);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [account, company, summaryResult, monthlyResult, trendsResult, latestImage] = await Promise.all([
      User.findById(user.userId).select('plan subscriptionStatus expiryDate'),
      Company.findOne({ userId })
        .select('name industry employees location logo revenue expenses growthRate profit profitMargin')
        .lean(),
      Record.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            activeRecords: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, 1, 0],
              },
            },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
              },
            },
            expenses: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
              },
            },
            currentMonthRevenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$type', 'income'] },
                      { $gte: ['$date', currentMonthStart] },
                    ],
                  },
                  '$amount',
                  0,
                ],
              },
            },
            previousMonthRevenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$type', 'income'] },
                      { $gte: ['$date', previousMonthStart] },
                      { $lt: ['$date', currentMonthStart] },
                    ],
                  },
                  '$amount',
                  0,
                ],
              },
            },
          },
        },
      ]),
      Record.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
              },
            },
            expenses: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
              },
            },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      Record.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$date',
              },
            },
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 },
      ]),
      Image.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate('recordId', 'type amount category date title')
        .lean(),
    ]);

    if (account && typeof account.refreshSubscriptionStatus === 'function') {
      await account.refreshSubscriptionStatus();
    }

    const premiumAccess = account && typeof account.hasPremiumAccess === 'function'
      ? account.hasPremiumAccess()
      : false;

    const summary = summaryResult[0] || {
      totalRecords: 0,
      activeRecords: 0,
      revenue: 0,
      expenses: 0,
      currentMonthRevenue: 0,
      previousMonthRevenue: 0,
    };

    const revenue = round(summary.revenue || 0);
    const expenses = round(summary.expenses || 0);
    const profit = round(revenue - expenses);
    const totalRecords = summary.totalRecords || 0;
    const activeRecords = summary.activeRecords || 0;
    const inactiveRatio =
      totalRecords > 0 ? round(((totalRecords - activeRecords) / totalRecords) * 100) : 0;
    const growthRate = company?.growthRate ?? estimateGrowth(summary.currentMonthRevenue, summary.previousMonthRevenue);
    const profitMargin = company?.profitMargin ?? (revenue > 0 ? round((profit / revenue) * 100) : 0);
    const efficiency = revenue > 0 ? clamp(100 - (expenses / revenue) * 100, 0, 100) : totalRecords > 0 ? 55 : 0;
    
    // RESONANCE ENGINE INTEGRATION
    const activityDensity = totalRecords > 0 ? (expenses + revenue) / totalRecords : 0;
    const yieldEfficiency = totalRecords > 0 ? profit / totalRecords : 0;
    const resonanceIndex = activityDensity > 0 ? clamp((yieldEfficiency / activityDensity) * 100, 0, 100) : 50;

    const score = Math.round(
      clamp(profitMargin, 0, 100) * 0.38 +
      clamp(growthRate, 0, 100) * 0.34 +
      clamp((totalRecords / 12) * 100, 0, 100) * 0.14 +
      clamp(efficiency, 0, 100) * 0.14
    );

    const monthlyData = buildMonthlyData(monthlyResult);
    const trends = buildDailyTrends(trendsResult);
    const { currentPeriod, previousPeriod } = getPeriodSnapshots(monthlyResult, now);

    const insights = premiumAccess
      ? await generateInsights({
          revenue,
          expenses,
          profit,
          profitMargin,
          growthRate,
          totalRecords,
          activeRecords,
          currentPeriod,
          previousPeriod,
          recentTrend: trends,
        })
      : [];
    const latestRecord =
      latestImage?.recordId &&
      typeof latestImage.recordId === 'object' &&
      'type' in latestImage.recordId
        ? (latestImage.recordId as unknown as PopulatedRecordPreview)
        : null;

    // Get unread alerts count
    const unreadCount = await import('../utils/generateAlerts.js').then(({ getUnreadCount }) => 
      getUnreadCount(user.userId)
    );

    const responseData = {
      unreadCount,
      metrics: {
        kpis: {
          totalRecords,
          activeRecords,
          inactiveRatio,
          growthRate,
          revenue,
          expenses,
          profit,
          profitMargin,
        },
        monthlyData,
      },
      scoreData: {
        score: Math.min(score, 100),
        status: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Average' : 'Poor',
        resonanceIndex,
        breakdown: {
          profitability: clamp(profitMargin * 1.8, 0, 100),
          growth: clamp(growthRate * 2.2, 0, 100),
          activity: clamp((totalRecords / 12) * 100, 0, 100),
          efficiency: clamp(efficiency, 0, 100),
        },
      },
      company: company
        ? {
            ...company,
            revenue,
            expenses,
            profit,
            profitMargin,
            growthRate,
          }
        : totalRecords > 0
          ? {
              revenue,
              expenses,
              profit,
              profitMargin,
              growthRate,
            }
          : null,
      trends,
      insights,
      latestUpload: latestImage && latestRecord
        ? {
            image: {
              id: String(latestImage._id),
              imageUrl: latestImage.imageUrl,
              extractedText: latestImage.extractedText || '',
              detectedType: latestImage.detectedType,
              category: latestImage.category,
              amount: latestImage.amount,
              createdAt: latestImage.createdAt,
            },
            record: {
              id: String(latestRecord._id),
              type: latestRecord.type,
              amount: latestRecord.amount,
              category: latestRecord.category,
              date: latestRecord.date,
              title: latestRecord.title,
            },
            extracted: {
              amount: latestImage.amount || 0,
              type: latestImage.detectedType,
              category: latestImage.category,
              date: latestRecord?.date || latestImage.createdAt,
              extractedText: latestImage.extractedText || '',
              amountMatch: latestImage.amount ? String(latestImage.amount) : null,
            },
          }
        : null,
      refreshedAt: new Date().toISOString(),
    };

    res.json(responseData);

    const cacheKey = `cache:dashboard:${user.userId}`;
    redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 60 }).catch(console.error);
  }),
};

function buildMonthlyData(
  rows: MonthlyAggregateRow[]
): MonthlyPoint[] {
  return rows
    .slice()
    .sort((left, right) => {
      if (left._id.year !== right._id.year) {
        return left._id.year - right._id.year;
      }

      return left._id.month - right._id.month;
    })
    .slice(-6)
    .map((row) => {
    const monthDate = new Date(row._id.year, row._id.month - 1, 1);
    const revenue = round(row.revenue || 0);
    const expenses = round(row.expenses || 0);

    return {
      month: monthFormatter.format(monthDate),
      revenue,
      expenses,
      target: Math.round(Math.max(revenue * 1.12, expenses * 1.24, 10000)),
    };
    });
}

function getPeriodSnapshots(
  rows: MonthlyAggregateRow[],
  referenceDate: Date
): { currentPeriod: InsightPeriodSnapshot; previousPeriod: InsightPeriodSnapshot } {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const previousDate = new Date(currentYear, referenceDate.getMonth() - 1, 1);
  const previousYear = previousDate.getFullYear();
  const previousMonth = previousDate.getMonth() + 1;

  const currentRow = rows.find((row) => row._id.year === currentYear && row._id.month === currentMonth);
  const previousRow = rows.find((row) => row._id.year === previousYear && row._id.month === previousMonth);

  return {
    currentPeriod: {
      revenue: round(currentRow?.revenue || 0),
      expenses: round(currentRow?.expenses || 0),
      profit: round((currentRow?.revenue || 0) - (currentRow?.expenses || 0)),
    },
    previousPeriod: {
      revenue: round(previousRow?.revenue || 0),
      expenses: round(previousRow?.expenses || 0),
      profit: round((previousRow?.revenue || 0) - (previousRow?.expenses || 0)),
    },
  };
}

function buildDailyTrends(
  rows: Array<{ _id: string; count: number; amount: number }>
): TrendPoint[] {
  if (rows.length === 0) {
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));

      return {
        name: weekdayFormatter.format(day),
        value: 0,
        date: day.toISOString().slice(0, 10),
      };
    });
  }

  return rows
    .slice()
    .reverse()
    .map((row) => {
      const date = new Date(row._id);
      return {
        name: weekdayFormatter.format(date),
        value: Math.max(row.count * 18, Math.round((row.amount || 0) / 500)),
        date: row._id,
      };
    });
}

function estimateGrowth(currentMonthRevenue: number, previousMonthRevenue: number): number {
  if (previousMonthRevenue <= 0) {
    return currentMonthRevenue > 0 ? 100 : 0;
  }

  return round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
}

function round(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
