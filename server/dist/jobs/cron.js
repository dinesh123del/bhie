import cron from 'node-cron';
import User from '../models/User.js';
import { env } from '../config/env.js';
export function startCronJobs() {
    // 1. Daily usage reset - runs at midnight (0 0 * * *)
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log('🔄 [CRON] Starting daily usage reset...');
            const result = await User.updateMany({}, // Could filter by plan: 'free' but we can just reset all usageCounts everyday
            { usageCount: 0 });
            console.log(`✅ [CRON] Reset usage count for ${result.modifiedCount} users.`);
        }
        catch (error) {
            console.error('❌ [CRON] Error resetting usage count:', error);
        }
    });
    // 2. Subscription check - runs every 5 minutes (*/5 * * * *)
    cron.schedule("*/5 * * * *", async () => {
        try {
            console.log('🔄 [CRON] Checking for expired subscriptions...');
            const now = new Date();
            // Find premium users whose planExpiry is in the past
            const expiredUsers = await User.find({
                plan: { $in: ['pro', 'premium'] },
                planExpiry: { $lt: now }
            });
            for (const user of expiredUsers) {
                user.plan = 'free';
                user.isPremium = false;
                user.planExpiry = undefined;
                user.subscriptionStatus = 'expired';
                await user.save();
                console.log(`📉 [CRON] User ${user.email} subscription expired, downgraded to free.`);
            }
            console.log(`✅ [CRON] Subscription check complete. Downgraded ${expiredUsers.length} users.`);
        }
        catch (error) {
            console.error('❌ [CRON] Error during subscription check:', error);
        }
    });
    // 3. Keep Server Alive - pings the server every 5 minutes (*/5 * * * *)
    //    Uses RENDER_EXTERNAL_HOSTNAME (auto-set by Render) when deployed.
    //    Falls back to localhost so the job never fails due to a missing/placeholder hostname.
    cron.schedule("*/5 * * * *", async () => {
        // Only needed on Render to prevent dyno spin-down; skip in local dev.
        if (!env.IS_PRODUCTION && !process.env.RENDER_EXTERNAL_HOSTNAME)
            return;
        try {
            const host = process.env.RENDER_EXTERNAL_HOSTNAME
                ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
                : `http://localhost:${env.PORT}`;
            const serverUrl = `${host}/api/health`;
            const response = await fetch(serverUrl);
            if (response.ok) {
                console.log('💓 [CRON] Keep-alive ping successful.');
            }
            else {
                console.log(`⚠️ [CRON] Keep-alive ping returned status: ${response.status}`);
            }
        }
        catch (error) {
            console.error('❌ [CRON] Error during keep-alive ping:', error);
        }
    });
    // 4. AI processing / Analytics background job - runs daily at 2am
    cron.schedule("0 2 * * *", async () => {
        try {
            console.log('🧠 [CRON] Running background AI analytics & summaries...');
            // Logic for background aggregation could go here
            console.log('✅ [CRON] AI background processing completed.');
        }
        catch (error) {
            console.error('❌ [CRON] Error in background AI processing:', error);
        }
    });
    console.log('⏰ Background cron engine initialized successfully.');
}
