/**
 * dashboardController.ts — Refactored
 * ─────────────────────────────────────
 * Controller focused solely on HTTP request/response lifecycle.
 * All aggregation pipelines extracted to AggregationService.
 * All math utilities extracted to utils/math.
 */
import { Types } from 'mongoose';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { CacheService } from '../services/cacheService.js';
import { aggregateSummary, aggregateMonthly, aggregateDailyTrends, fetchLatestImage, } from '../services/aggregationService.js';
import { generateInsights } from '../utils/generateInsights.js';
import { requireUser } from '../utils/request.js';
import { round, clamp, estimateGrowth } from '../utils/math.js';
const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
// ── Controller ──────────────────────────────────────────────────────
export const dashboardController = {
    getDashboard: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        const userId = new Types.ObjectId(user.userId);
        // Check cache first
        const cacheKey = CacheService.generateKey(req.baseUrl + req.path, user.userId);
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
            return res.json({ ...cachedData, fromCache: true });
        }
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        // Run all queries in parallel via the AggregationService
        const [account, company, summary, monthlyResult, trendsResult, latestImage] = await Promise.all([
            User.findById(user.userId).select('plan subscriptionStatus expiryDate'),
            Company.findOne({ userId })
                .select('name industry employees location logo revenue expenses growthRate profit profitMargin')
                .lean(),
            aggregateSummary(userId, currentMonthStart, previousMonthStart),
            aggregateMonthly(userId),
            aggregateDailyTrends(userId),
            fetchLatestImage(userId),
        ]);
        if (account && typeof account.refreshSubscriptionStatus === 'function') {
            await account.refreshSubscriptionStatus();
        }
        const premiumAccess = account && typeof account.hasPremiumAccess === 'function'
            ? account.hasPremiumAccess()
            : false;
        // ── Derived KPIs ─────────────────────────────────────────────────
        const revenue = round(summary.revenue || 0);
        const expenses = round(summary.expenses || 0);
        const profit = round(revenue - expenses);
        const totalRecords = summary.totalRecords || 0;
        const activeRecords = summary.activeRecords || 0;
        const inactiveRatio = totalRecords > 0
            ? round(((totalRecords - activeRecords) / totalRecords) * 100)
            : 0;
        const growthRate = company?.growthRate
            ?? estimateGrowth(summary.currentMonthRevenue, summary.previousMonthRevenue);
        const profitMargin = company?.profitMargin
            ?? (revenue > 0 ? round((profit / revenue) * 100) : 0);
        const efficiency = revenue > 0
            ? clamp(100 - (expenses / revenue) * 100, 0, 100)
            : totalRecords > 0 ? 55 : 0;
        // Resonance Engine
        const activityDensity = totalRecords > 0 ? (expenses + revenue) / totalRecords : 0;
        const yieldEfficiency = totalRecords > 0 ? profit / totalRecords : 0;
        const resonanceIndex = activityDensity > 0
            ? clamp((yieldEfficiency / activityDensity) * 100, 0, 100)
            : 50;
        const score = Math.round(clamp(profitMargin, 0, 100) * 0.38 +
            clamp(growthRate, 0, 100) * 0.34 +
            clamp((totalRecords / 12) * 100, 0, 100) * 0.14 +
            clamp(efficiency, 0, 100) * 0.14);
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
                userId: String(user.userId),
            })
            : [];
        const latestRecord = latestImage?.recordId &&
            typeof latestImage.recordId === 'object' &&
            'type' in latestImage.recordId
            ? latestImage.recordId
            : null;
        // Get unread alerts count
        const unreadCount = await import('../utils/generateAlerts.js').then(({ getUnreadCount }) => getUnreadCount(user.userId));
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
                ? { ...company, revenue, expenses, profit, profitMargin, growthRate }
                : totalRecords > 0
                    ? { revenue, expenses, profit, profitMargin, growthRate }
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
        CacheService.set(cacheKey, responseData, 300).catch(console.error);
    }),
};
// ── Private Helpers ─────────────────────────────────────────────────
function buildMonthlyData(rows) {
    return rows
        .slice()
        .sort((left, right) => {
        if (left._id.year !== right._id.year)
            return left._id.year - right._id.year;
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
function getPeriodSnapshots(rows, referenceDate) {
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
function buildDailyTrends(rows) {
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
