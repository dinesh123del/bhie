/**
 * AggregationService
 * ------------------
 * Centralised Mongoose aggregation pipelines for dashboard & analytics.
 * Extracted from dashboardController to enforce single-responsibility and
 * make these pipelines independently testable and reusable.
 */
import Record from '../models/Record.js';
import Image from '../models/Image.js';
// ── Pipelines ───────────────────────────────────────────────────────
/**
 * Summary aggregation: totals, revenue, expenses, and month-over-month deltas.
 */
export async function aggregateSummary(userId, currentMonthStart, previousMonthStart) {
    const results = await Record.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: null,
                totalRecords: { $sum: 1 },
                activeRecords: {
                    $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, 1, 0] },
                },
                revenue: {
                    $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                },
                expenses: {
                    $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                },
                currentMonthRevenue: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$type', 'income'] }, { $gte: ['$date', currentMonthStart] }] },
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
    ]);
    return (results[0] ?? {
        totalRecords: 0,
        activeRecords: 0,
        revenue: 0,
        expenses: 0,
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
    });
}
/**
 * Monthly revenue vs expenses for the last 12 months.
 */
export async function aggregateMonthly(userId) {
    return Record.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                revenue: {
                    $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                },
                expenses: {
                    $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                },
            },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
    ]);
}
/**
 * Daily transaction trend data for the last 7 active days.
 */
export async function aggregateDailyTrends(userId) {
    return Record.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
            },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 },
    ]);
}
/**
 * Fetch the latest image upload with its populated record.
 */
export async function fetchLatestImage(userId) {
    return Image.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate('recordId', 'type amount category date title')
        .lean();
}
/**
 * Fetch historical amounts for a given category & userId (for anomaly detection).
 */
export async function fetchCategoryHistory(userId, category, limit = 100) {
    const records = await Record.find({ userId, category, type: 'expense' }, { amount: 1 })
        .sort({ date: -1 })
        .limit(limit)
        .lean();
    return records.map((r) => r.amount);
}
/**
 * Fetch recent records to check for duplicates.
 */
export async function fetchRecentRecords(userId, windowDays = 3, limit = 50) {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);
    return Record.find({ userId, date: { $gte: since } }, { amount: 1, category: 1, date: 1, vendor: 1, title: 1 })
        .sort({ date: -1 })
        .limit(limit)
        .lean();
}
