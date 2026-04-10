import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import Record from '../models/Record.js';
import Business from '../models/Business.js';
import User from '../models/User.js';
import { AIInsights } from './ai-insights.js';
import { CacheService } from './cacheService.js';
export class RealTimeIntelligence extends EventEmitter {
    constructor(server) {
        super();
        this.alertThresholds = new Map();
        this.businessMetrics = new Map();
        this.predictionCache = new Map();
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });
        this.initializeSocketHandlers();
        this.initializeDefaultThresholds();
        this.startRealTimeMonitoring();
    }
    initializeSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Real-time client connected: ${socket.id}`);
            // Join business-specific room
            socket.on('join-business', (businessId) => {
                socket.join(`business-${businessId}`);
                console.log(`📊 Client ${socket.id} joined business room: ${businessId}`);
                // Send current metrics immediately
                this.sendCurrentMetrics(businessId, socket.id);
            });
            // Subscribe to real-time alerts
            socket.on('subscribe-alerts', (userId) => {
                socket.join(`alerts-${userId}`);
                console.log(`🚨 Client ${socket.id} subscribed to alerts for user: ${userId}`);
            });
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`🔌 Real-time client disconnected: ${socket.id}`);
            });
        });
    }
    initializeDefaultThresholds() {
        // Revenue alerts
        this.addThreshold('revenue', '<', 1000, 'critical', '🚨 Critical: Revenue below ₹1,000 threshold');
        this.addThreshold('revenue', '<', 5000, 'high', '⚠️ High Alert: Revenue below ₹5,000');
        // Profit alerts
        this.addThreshold('profit', '<', 0, 'critical', '🚨 Loss Alert: Business operating at loss');
        this.addThreshold('profit', '<', 500, 'high', '⚠️ Low Profit: Profit below ₹500');
        // Health score alerts
        this.addThreshold('healthScore', '<', 30, 'critical', '🚨 Critical Health: Business health score below 30');
        this.addThreshold('healthScore', '<', 50, 'high', '⚠️ Poor Health: Business health score below 50');
        // Growth rate alerts
        this.addThreshold('growthRate', '<', -10, 'critical', '🚨 Declining: Revenue growth rate below -10%');
        this.addThreshold('growthRate', '<', 0, 'high', '⚠️ Stagnant: No revenue growth');
    }
    addThreshold(metric, operator, value, severity, message) {
        if (!this.alertThresholds.has(metric)) {
            this.alertThresholds.set(metric, []);
        }
        this.alertThresholds.get(metric).push({ metric, operator, value, severity, message });
    }
    async startRealTimeMonitoring() {
        // Monitor database changes every 30 seconds
        setInterval(async () => {
            await this.updateBusinessMetrics();
            await this.checkAlertThresholds();
            await this.generatePredictions();
        }, 30000);
        // Listen for real-time events from Redis pub/sub
        this.redis.subscribe('bhie:events');
        this.redis.on('message', (channel, message) => {
            if (channel === 'bhie:events') {
                const event = JSON.parse(message);
                this.handleRealTimeEvent(event);
            }
        });
    }
    async updateBusinessMetrics() {
        try {
            const businesses = await Business.find({ isActive: true });
            for (const business of businesses) {
                const metrics = await this.calculateBusinessMetrics(business._id.toString());
                this.businessMetrics.set(business._id.toString(), metrics);
                // Cache metrics for 5 minutes
                await CacheService.set(`metrics:${business._id}`, metrics, 300);
                // Emit to connected clients
                this.io.to(`business-${business._id}`).emit('metrics-update', {
                    businessId: business._id,
                    metrics,
                    timestamp: new Date()
                });
            }
        }
        catch (error) {
            console.error('❌ Error updating business metrics:', error);
        }
    }
    async calculateBusinessMetrics(businessId) {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const [currentMetrics, previousMetrics] = await Promise.all([
            this.getMonthlyMetrics(businessId, currentMonthStart, now),
            this.getMonthlyMetrics(businessId, previousMonthStart, currentMonthStart)
        ]);
        const revenue = currentMetrics.revenue;
        const expenses = currentMetrics.expenses;
        const profit = revenue - expenses;
        const transactions = currentMetrics.transactions;
        const avgTransactionValue = transactions > 0 ? revenue / transactions : 0;
        const growthRate = previousMetrics.revenue > 0
            ? ((revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100
            : 0;
        const healthScore = this.calculateHealthScore({
            revenue,
            expenses,
            profit,
            transactions,
            avgTransactionValue,
            growthRate
        });
        return {
            revenue,
            expenses,
            profit,
            transactions,
            avgTransactionValue,
            growthRate,
            healthScore
        };
    }
    async getMonthlyMetrics(businessId, startDate, endDate) {
        const result = await Record.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(businessId),
                    date: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                    },
                    expenses: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                    },
                    transactions: { $sum: 1 }
                }
            }
        ]);
        return result[0] || { revenue: 0, expenses: 0, transactions: 0 };
    }
    calculateHealthScore(metrics) {
        let score = 50; // Base score
        // Profitability (40% weight)
        const profitMargin = metrics.revenue > 0 ? (metrics.profit / metrics.revenue) * 100 : 0;
        if (profitMargin > 20)
            score += 20;
        else if (profitMargin > 10)
            score += 15;
        else if (profitMargin > 5)
            score += 10;
        else if (profitMargin > 0)
            score += 5;
        else
            score -= 20;
        // Growth (30% weight)
        if (metrics.growthRate > 20)
            score += 15;
        else if (metrics.growthRate > 10)
            score += 10;
        else if (metrics.growthRate > 5)
            score += 5;
        else if (metrics.growthRate > 0)
            score += 2;
        else
            score -= 10;
        // Transaction volume (20% weight)
        if (metrics.transactions > 100)
            score += 10;
        else if (metrics.transactions > 50)
            score += 7;
        else if (metrics.transactions > 20)
            score += 5;
        else if (metrics.transactions > 10)
            score += 3;
        // Average transaction value (10% weight)
        if (metrics.avgTransactionValue > 5000)
            score += 5;
        else if (metrics.avgTransactionValue > 2000)
            score += 3;
        else if (metrics.avgTransactionValue > 1000)
            score += 2;
        return Math.max(0, Math.min(100, score));
    }
    async checkAlertThresholds() {
        for (const [businessId, metrics] of this.businessMetrics) {
            for (const [metric, thresholds] of this.alertThresholds) {
                const value = metrics[metric];
                for (const threshold of thresholds) {
                    if (this.evaluateThreshold(value, threshold)) {
                        await this.triggerAlert(businessId, threshold, value, metrics);
                    }
                }
            }
        }
    }
    evaluateThreshold(value, threshold) {
        switch (threshold.operator) {
            case '>': return value > threshold.value;
            case '<': return value < threshold.value;
            case '>=': return value >= threshold.value;
            case '<=': return value <= threshold.value;
            case '=': return value === threshold.value;
            default: return false;
        }
    }
    async triggerAlert(businessId, threshold, value, metrics) {
        const alert = {
            type: 'alert',
            userId: businessId,
            businessId,
            data: {
                metric: threshold.metric,
                value,
                threshold: threshold.value,
                message: threshold.message,
                currentMetrics: metrics
            },
            timestamp: new Date(),
            severity: threshold.severity,
            priority: threshold.severity === 'critical' ? 1 : threshold.severity === 'high' ? 2 : 3
        };
        // Emit to real-time clients
        this.io.to(`business-${businessId}`).emit('alert', alert);
        this.io.to(`alerts-${businessId}`).emit('alert', alert);
        // Store in Redis for history
        await this.redis.lpush(`alerts:${businessId}`, JSON.stringify(alert));
        await this.redis.ltrim(`alerts:${businessId}`, 0, 99); // Keep last 100 alerts
        // Send push notification for critical alerts
        if (threshold.severity === 'critical') {
            await this.sendPushNotification(businessId, alert);
        }
    }
    async sendPushNotification(businessId, alert) {
        try {
            const user = await User.findById(businessId);
            if (user?.pushToken) {
                // Implementation would depend on your push notification service
                console.log(`📱 Push notification sent to ${user.email}: ${alert.data.message}`);
            }
        }
        catch (error) {
            console.error('❌ Error sending push notification:', error);
        }
    }
    async generatePredictions() {
        for (const [businessId, metrics] of this.businessMetrics) {
            // Check if we need to generate new predictions (cache for 1 hour)
            const cacheKey = `predictions:${businessId}`;
            const cached = await this.predictionCache.get(cacheKey);
            if (!cached) {
                const predictions = await this.generateBusinessPredictions(businessId, metrics);
                this.predictionCache.set(cacheKey, predictions);
                // Clear cache after 1 hour
                setTimeout(() => {
                    this.predictionCache.delete(cacheKey);
                }, 3600000);
                // Emit predictions to clients
                this.io.to(`business-${businessId}`).emit('predictions-update', {
                    businessId,
                    predictions,
                    timestamp: new Date()
                });
            }
        }
    }
    async generateBusinessPredictions(businessId, currentMetrics) {
        try {
            const insights = await AIInsights.getQuickSummary(businessId);
            // Simple prediction logic (can be enhanced with ML models)
            const predictions = {
                nextMonthRevenue: currentMetrics.revenue * (1 + currentMetrics.growthRate / 100),
                nextMonthExpenses: currentMetrics.expenses * 1.05, // Assume 5% expense growth
                nextMonthProfit: 0,
                riskLevel: 'low',
                recommendations: []
            };
            predictions.nextMonthProfit = predictions.nextMonthRevenue - predictions.nextMonthExpenses;
            // Determine risk level
            if (predictions.nextMonthProfit < 0) {
                predictions.riskLevel = 'high';
                predictions.recommendations.push('Immediate cost reduction required', 'Focus on revenue generation');
            }
            else if (predictions.nextMonthProfit < currentMetrics.profit * 0.8) {
                predictions.riskLevel = 'medium';
                predictions.recommendations.push('Monitor expenses closely', 'Explore revenue opportunities');
            }
            else {
                predictions.recommendations.push('Maintain current trajectory', 'Consider strategic investments');
            }
            return predictions;
        }
        catch (error) {
            console.error('❌ Error generating predictions:', error);
            return null;
        }
    }
    async sendCurrentMetrics(businessId, socketId) {
        const metrics = this.businessMetrics.get(businessId);
        if (metrics) {
            this.io.to(socketId).emit('metrics-update', {
                businessId,
                metrics,
                timestamp: new Date()
            });
        }
    }
    handleRealTimeEvent(event) {
        // Broadcast event to relevant clients
        this.io.to(`business-${event.businessId}`).emit('real-time-event', event);
        // Store event for analytics
        this.redis.lpush(`events:${event.businessId}`, JSON.stringify(event));
        this.redis.ltrim(`events:${event.businessId}`, 0, 999); // Keep last 1000 events
    }
    // Public methods for external services to publish events
    async publishEvent(event) {
        const fullEvent = {
            ...event,
            timestamp: new Date()
        };
        await this.redis.publish('bhie:events', JSON.stringify(fullEvent));
    }
    async getBusinessMetrics(businessId) {
        return this.businessMetrics.get(businessId) || null;
    }
    async getAlertHistory(businessId, limit = 50) {
        const alerts = await this.redis.lrange(`alerts:${businessId}`, 0, limit - 1);
        return alerts.map(alert => JSON.parse(alert));
    }
    async getEventHistory(businessId, limit = 100) {
        const events = await this.redis.lrange(`events:${businessId}`, 0, limit - 1);
        return events.map(event => JSON.parse(event));
    }
}
export default RealTimeIntelligence;
