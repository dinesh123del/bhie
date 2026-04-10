import UsageCredit from '../models/UsageCredit.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
// Pricing tiers per unit
export const USAGE_PRICING = {
    upload: { free: 10, starter: 50, growth: 500, enterprise: Infinity },
    ai_analysis: { free: 5, starter: 25, growth: 200, enterprise: Infinity },
    ocr: { free: 10, starter: 100, growth: 1000, enterprise: Infinity },
    api_call: { free: 0, starter: 1000, growth: 10000, enterprise: Infinity },
    storage_gb: { free: 0.1, starter: 1, growth: 10, enterprise: 100 },
    team_member: { free: 1, starter: 5, growth: 25, enterprise: 100 },
};
// Overage pricing per unit (after plan limits)
export const OVERAGE_PRICING = {
    upload: 0.10, // $0.10 per upload
    ai_analysis: 0.50, // $0.50 per AI analysis
    ocr: 0.05, // $0.05 per OCR scan
    api_call: 0.001, // $0.001 per API call
    storage_gb: 0.50, // $0.50 per GB
    team_member: 5.00, // $5 per team member
};
export const usageBillingService = {
    // Record usage (consumes credits)
    async recordUsage(userId, type, amount = 1, description = '', organizationId) {
        try {
            // Check if user has enough credits
            const balance = await this.getBalance(userId, type, organizationId);
            const planLimit = await this.getPlanLimit(userId, type, organizationId);
            // Create usage record (negative amount = consumption)
            const credit = new UsageCredit({
                userId,
                organizationId,
                type,
                amount: -amount,
                description: description || `Used ${type}`,
            });
            await credit.save();
            // Check if over limit
            const newBalance = balance - amount;
            const isOverLimit = planLimit !== Infinity && newBalance < 0;
            return {
                success: true,
                remaining: newBalance,
                error: isOverLimit ? `Usage limit exceeded for ${type}. Upgrade your plan or purchase credits.` : undefined,
            };
        }
        catch (error) {
            console.error('Record usage error:', error);
            return { success: false, error: 'Failed to record usage' };
        }
    },
    // Add credits (from referrals, purchases, or plan allocations)
    async addCredits(userId, type, amount, description, metadata, organizationId, expiresAt) {
        try {
            const credit = new UsageCredit({
                userId,
                organizationId,
                type,
                amount, // positive = credit
                description,
                metadata,
                expiresAt,
            });
            await credit.save();
            return true;
        }
        catch (error) {
            console.error('Add credits error:', error);
            return false;
        }
    },
    // Get current balance for a usage type
    async getBalance(userId, type, organizationId) {
        const match = {
            $or: [{ userId }, { organizationId }],
            type
        };
        // Filter out expired credits
        const result = await UsageCredit.aggregate([
            {
                $match: {
                    ...match,
                    $or: [
                        { expiresAt: { $exists: false } },
                        { expiresAt: { $gt: new Date() } },
                    ],
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);
        return result[0]?.total || 0;
    },
    // Get plan limit for a usage type
    async getPlanLimit(userId, type, organizationId) {
        // Check organization plan first
        if (organizationId) {
            const org = await Organization.findById(organizationId);
            if (org) {
                const plan = org.getEffectivePlan();
                return USAGE_PRICING[type][plan];
            }
        }
        // Fall back to user plan
        const user = await User.findById(userId);
        if (!user)
            return USAGE_PRICING[type].free;
        const plan = user.getEffectivePlan();
        return USAGE_PRICING[type][plan];
    },
    // Get comprehensive usage stats
    async getUsageStats(userId, organizationId) {
        const types = ['upload', 'ai_analysis', 'ocr', 'api_call', 'storage_gb', 'team_member'];
        const stats = await Promise.all(types.map(async (type) => {
            const used = await this.getConsumedAmount(userId, type, organizationId);
            const limit = await this.getPlanLimit(userId, type, organizationId);
            const overage = limit !== Infinity && used > limit ? used - limit : 0;
            return {
                type,
                used,
                limit,
                remaining: limit !== Infinity ? Math.max(0, limit - used) : Infinity,
                overage,
                overageCost: overage * OVERAGE_PRICING[type],
            };
        }));
        return stats;
    },
    // Get consumed amount (positive number)
    async getConsumedAmount(userId, type, organizationId) {
        const match = {
            $or: [{ userId }, { organizationId }],
            type,
            amount: { $lt: 0 } // only consumption
        };
        const result = await UsageCredit.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $abs: '$amount' } },
                },
            },
        ]);
        return result[0]?.total || 0;
    },
    // Check if user can perform action
    async canUse(userId, type, amount = 1, organizationId) {
        const limit = await this.getPlanLimit(userId, type, organizationId);
        // Unlimited plans
        if (limit === Infinity)
            return true;
        const consumed = await this.getConsumedAmount(userId, type, organizationId);
        return (consumed + amount) <= limit;
    },
    // Initialize monthly credits for a plan
    async initializeMonthlyCredits(userId, plan, organizationId) {
        const types = ['upload', 'ai_analysis', 'ocr', 'api_call'];
        for (const type of types) {
            const limit = USAGE_PRICING[type][plan];
            if (limit !== Infinity && limit > 0) {
                // Check if already initialized this month
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);
                const existing = await UsageCredit.findOne({
                    userId,
                    organizationId,
                    type,
                    'metadata.planIncluded': true,
                    createdAt: { $gte: startOfMonth },
                });
                if (!existing) {
                    await this.addCredits(userId, type, limit, `Monthly ${plan} plan allocation`, { planIncluded: true }, organizationId, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
                    );
                }
            }
        }
    },
    // Get billing summary for invoice
    async getBillingSummary(userId, startDate, endDate, organizationId) {
        const match = {
            $or: [{ userId }, { organizationId }],
            createdAt: { $gte: startDate, $lte: endDate }
        };
        const usage = await UsageCredit.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$type',
                    totalConsumed: {
                        $sum: {
                            $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0]
                        }
                    },
                    totalCredits: {
                        $sum: {
                            $cond: [{ $gt: ['$amount', 0] }, '$amount', 0]
                        }
                    },
                },
            },
        ]);
        // Calculate overages
        const user = await User.findById(userId);
        const plan = user?.getEffectivePlan() || 'free';
        const summary = usage.map((item) => {
            const limit = USAGE_PRICING[item._id][plan];
            const overage = limit !== Infinity && item.totalConsumed > limit
                ? item.totalConsumed - limit
                : 0;
            return {
                type: item._id,
                consumed: item.totalConsumed,
                included: limit === Infinity ? 'unlimited' : limit,
                overage,
                overageCost: overage * OVERAGE_PRICING[item._id],
            };
        });
        const totalOverageCost = summary.reduce((sum, item) => sum + item.overageCost, 0);
        return {
            period: { start: startDate, end: endDate },
            plan,
            usage: summary,
            totalOverageCost,
            currency: 'USD',
        };
    },
};
export default usageBillingService;
