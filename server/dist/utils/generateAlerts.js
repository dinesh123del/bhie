import Alert from '../models/Alert.js';
import { Types } from 'mongoose';
const THRESHOLDS = {
    EXPENSE_INCREASE: 0.10, // 10%
    PROFIT_DROP: 0.05, // 5%
    REVENUE_GROWTH: 0.15 // 15%
};
export const generateAlerts = async (context) => {
    const { userId, action } = context;
    const objectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const alerts = [];
    if (action === 'record' && context.record) {
        const { type, amount, category, title } = context.record;
        alerts.push({
            userId: objectId,
            type: 'info',
            message: `New ${type === 'income' ? 'income' : 'expense'} record added: "${title}" (${category}, ₹${amount.toLocaleString()})`,
            data: { record: { type, amount, category, title } }
        });
    }
    if (action === 'dashboard' && context.prevMetrics && context.currMetrics) {
        const { prevMetrics, currMetrics } = context;
        // Expenses increase
        if (currMetrics.expenses > prevMetrics.expenses * (1 + THRESHOLDS.EXPENSE_INCREASE)) {
            const expenseMessage = prevMetrics.expenses > 0
                ? `Expenses up ${Math.round(((currMetrics.expenses - prevMetrics.expenses) / prevMetrics.expenses) * 100)}% this period`
                : 'New expenses detected this period';
            alerts.push({
                userId: objectId,
                type: 'warning',
                message: expenseMessage,
                data: { prevExpenses: prevMetrics.expenses, currExpenses: currMetrics.expenses }
            });
        }
        // Profit drops
        if (currMetrics.profit < prevMetrics.profit * (1 - THRESHOLDS.PROFIT_DROP)) {
            alerts.push({
                userId: objectId,
                type: 'danger',
                message: `Profit margin dropped to ${currMetrics.profitMargin.toFixed(1)}% from ${prevMetrics.profitMargin.toFixed(1)}%`,
                data: { prevProfitMargin: prevMetrics.profitMargin, currProfitMargin: currMetrics.profitMargin }
            });
        }
        // Revenue increases
        if (currMetrics.growthRate > THRESHOLDS.REVENUE_GROWTH * 100) {
            alerts.push({
                userId: objectId,
                type: 'success',
                message: `Strong revenue growth: ${currMetrics.growthRate.toFixed(1)}%`,
                data: { growthRate: currMetrics.growthRate }
            });
        }
    }
    if (action === 'company' && context.currMetrics) {
        alerts.push({
            userId: objectId,
            type: 'info',
            message: 'Business profile updated successfully',
            data: { metrics: context.currMetrics }
        });
    }
    // Save new alerts (limit to recent ones, dedupe by message hash if needed)
    for (const alertData of alerts) {
        await Alert.create(alertData);
    }
};
// Get unread count for user
export const getUnreadCount = async (userId) => {
    const objectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return await Alert.countDocuments({ userId: objectId, isRead: false });
};
