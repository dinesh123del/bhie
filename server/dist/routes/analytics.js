import express from 'express';
import Analytics from '../models/Analytics';
import Company from '../models/Company';
import Record from '../models/Record';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import { cacheGet } from '../middleware/cacheGet';
import { redisClient } from '../config/redisClient';
import { AppError } from '../utils/appError';
import { requireUser } from '../utils/request';
const router = express.Router();
router.use(authenticateToken);
router.get('/score', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const [company, records] = await Promise.all([
        Company.findOne({ userId: user.userId }),
        Record.find({ userId: user.userId }),
    ]);
    const totalRecords = records.length;
    const revenue = records
        .filter((record) => record.type === 'income')
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const expenses = records
        .filter((record) => record.type === 'expense')
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const profit = revenue - expenses;
    const profitMargin = company?.profitMargin ?? (revenue > 0 ? (profit / revenue) * 100 : 0);
    const growthRate = company?.growthRate ?? estimateGrowthRate(records);
    const efficiency = revenue > 0 ? 100 - (expenses / revenue) * 100 : totalRecords > 0 ? 55 : 0;
    if (!company && totalRecords === 0) {
        res.json({
            score: 0,
            status: 'No data',
            breakdown: {
                profitability: 0,
                growth: 0,
                activity: 0,
                efficiency: 0,
            },
        });
        return;
    }
    const score = Math.round(clamp(profitMargin, 0, 100) * 0.38 +
        clamp(growthRate, 0, 100) * 0.34 +
        clamp((totalRecords / 12) * 100, 0, 100) * 0.14 +
        clamp(efficiency, 0, 100) * 0.14);
    res.json({
        score: Math.min(score, 100),
        status: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Average' : 'Poor',
        breakdown: {
            profitability: clamp(profitMargin * 1.8, 0, 100),
            growth: clamp(growthRate * 2.2, 0, 100),
            activity: clamp((totalRecords / 12) * 100, 0, 100),
            efficiency: clamp(efficiency, 0, 100),
        },
    });
}));
router.get('/summary', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const [records, company] = await Promise.all([
        Record.find({ userId: user.userId }).sort({ date: 1, createdAt: 1 }),
        Company.findOne({ userId: user.userId }),
    ]);
    const totalRecords = records.length;
    const activeRecords = records.filter((record) => record.status !== 'cancelled').length;
    const revenue = records
        .filter((record) => record.type === 'income')
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const expenses = records
        .filter((record) => record.type === 'expense')
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const profit = revenue - expenses;
    const profitMargin = company?.profitMargin || (revenue > 0 ? (profit / revenue) * 100 : 0);
    const growthRate = company?.growthRate || estimateGrowthRate(records);
    const inactiveRatio = totalRecords > 0 ? parseFloat((((totalRecords - activeRecords) / totalRecords) * 100).toFixed(1)) : 0;
    res.json({
        kpis: {
            totalRecords,
            activeRecords,
            inactiveRatio,
            growthRate,
            revenue,
            expenses,
            profit,
            profitMargin,
            categories: [],
        },
        monthlyData: buildMonthlyData(records),
    });
}));
router.get('/trends', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const records = await Record.find({ userId: user.userId }).sort({ date: 1, createdAt: 1 });
    const trends = buildDailyTrends(records);
    res.json({ trends });
}));
router.get('/metrics', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const metrics = await Analytics.find({ userId: user.userId });
    res.json(metrics);
}));
router.post('/metrics', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const { metric, value } = req.body;
    if (!metric || value === undefined) {
        throw new AppError(400, 'Metric and value are required');
    }
    const analytics = await Analytics.create({
        userId: user.userId,
        metric,
        value,
        date: new Date(),
    });
    res.status(201).json(analytics);
}));
router.get('/predictions', cacheGet, asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const [records, company] = await Promise.all([
        Record.find({ userId: user.userId }),
        Company.findOne({ userId: user.userId })
    ]);
    const revenue = records
        .filter((record) => record.type === 'income')
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const expenses = records
        .filter((record) => record.type === 'expense')
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const profit = revenue - expenses;
    const growthRate = company?.growthRate ?? estimateGrowthRate(records);
    const { generateSmartRecommendations, getBusinessAdvisorExplanation } = await import('../utils/smartRecommendations');
    const inputData = {
        revenue,
        expenses,
        profit,
        growthRate,
    };
    const predictions = generateSmartRecommendations(inputData);
    const advisor = getBusinessAdvisorExplanation(inputData);
    const responseData = {
        ...predictions,
        advisor,
    };
    res.json(responseData);
    const cacheKey = `cache:analytics:predictions:${user.userId}`;
    redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 60 }).catch(console.error);
}));
export default router;
function buildMonthlyData(records) {
    const monthMap = new Map();
    for (const record of records) {
        const sourceDate = record.date ? new Date(record.date) : new Date(record.createdAt || Date.now());
        if (Number.isNaN(sourceDate.getTime())) {
            continue;
        }
        const key = `${sourceDate.getFullYear()}-${String(sourceDate.getMonth() + 1).padStart(2, '0')}`;
        const current = monthMap.get(key) || { revenue: 0, expenses: 0 };
        if (record.type === 'income') {
            current.revenue += Number(record.amount || 0);
        }
        else if (record.type === 'expense') {
            current.expenses += Number(record.amount || 0);
        }
        monthMap.set(key, current);
    }
    const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
    const entries = Array.from(monthMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-6);
    return entries.map(([key, values]) => {
        const [year, month] = key.split('-').map(Number);
        const monthDate = new Date(year, month - 1, 1);
        return {
            month: formatter.format(monthDate),
            revenue: Math.round(values.revenue),
            expenses: Math.round(values.expenses),
            target: Math.round(Math.max(values.revenue * 1.12, values.expenses * 1.24, 10000)),
        };
    });
}
function buildDailyTrends(records) {
    const dayMap = new Map();
    for (const record of records) {
        const sourceDate = record.date ? new Date(record.date) : new Date(record.createdAt || Date.now());
        if (Number.isNaN(sourceDate.getTime())) {
            continue;
        }
        const key = sourceDate.toISOString().slice(0, 10);
        const current = dayMap.get(key) || { count: 0, amount: 0 };
        current.count += 1;
        current.amount += Number(record.amount || 0);
        dayMap.set(key, current);
    }
    const formatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
    const lastSevenKeys = Array.from(dayMap.keys()).sort().slice(-7);
    if (lastSevenKeys.length > 0) {
        return lastSevenKeys.map((key) => {
            const values = dayMap.get(key) || { count: 0, amount: 0 };
            const date = new Date(key);
            return {
                name: formatter.format(date),
                value: Math.max(values.count * 18, Math.round(values.amount / 500)),
                date: key,
            };
        });
    }
    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - index));
        return {
            name: formatter.format(day),
            value: 0,
            date: day.toISOString().slice(0, 10),
        };
    });
}
function estimateGrowthRate(records) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    let currentRevenue = 0;
    let previousRevenue = 0;
    for (const record of records) {
        if (record.type !== 'income') {
            continue;
        }
        const sourceDate = record.date ? new Date(record.date) : new Date(record.createdAt || Date.now());
        if (Number.isNaN(sourceDate.getTime())) {
            continue;
        }
        if (sourceDate >= currentMonthStart) {
            currentRevenue += Number(record.amount || 0);
            continue;
        }
        if (sourceDate >= previousMonthStart && sourceDate < currentMonthStart) {
            previousRevenue += Number(record.amount || 0);
        }
    }
    if (previousRevenue <= 0) {
        return currentRevenue > 0 ? 100 : 0;
    }
    return Number((((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1));
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
