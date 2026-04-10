import cron from 'node-cron';
import User from '../models/User.js';
export class SubscriptionManager {
    static startExpiryChecker() {
        // Run every day at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                console.log('🔄 Checking for expired subscriptions...');
                const expiredUsers = await User.find({
                    plan: { $ne: 'free' },
                    planExpiry: { $lt: new Date() },
                    isActive: true
                });
                for (const user of expiredUsers) {
                    user.plan = 'free';
                    user.planExpiry = undefined;
                    await user.save();
                    console.log(`📉 User ${user.email} subscription expired, downgraded to free`);
                }
                console.log(`✅ Checked ${expiredUsers.length} expired subscriptions`);
            }
            catch (error) {
                console.error('❌ Error checking expired subscriptions:', error);
            }
        });
        console.log('⏰ Subscription expiry checker started (runs daily at midnight)');
    }
    static async checkUserSubscription(userId) {
        try {
            const user = await User.findById(userId);
            if (!user)
                return null;
            await user.refreshSubscriptionStatus();
            return {
                plan: user.getEffectivePlan(),
                hasPremiumAccess: user.hasPremiumAccess(),
                planExpiry: user.planExpiry,
                isActive: user.isActive
            };
        }
        catch (error) {
            console.error('Error checking user subscription:', error);
            return null;
        }
    }
}
