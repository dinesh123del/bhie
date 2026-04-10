import User from '../models/User.js';
import Record from '../models/Record.js';
import Settings from '../models/Settings.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
export const adminController = {
    // GET /api/admin/users - List all users with pagination and filters
    getUsers: asyncHandler(async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        // Apply filters
        if (req.query.plan) {
            filter.plan = req.query.plan;
        }
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }),
    // PATCH /api/admin/user/:id/plan - Update user plan
    updateUserPlan: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { plan, planExpiry } = req.body;
        if (!['free', 'pro', 'premium'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan. Must be free, pro, or premium'
            });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        user.plan = plan;
        if (plan !== 'free') {
            // If admin updates plan, set a far-future expiry if none provided
            // This ensures the access "reflects" and stays active
            const defaultExpiry = new Date();
            defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1); // 1 year of access
            user.planExpiry = planExpiry ? new Date(planExpiry) : defaultExpiry;
        }
        else {
            user.planExpiry = undefined;
        }
        await user.save();
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan,
                    planExpiry: user.planExpiry,
                    isActive: user.isActive
                }
            }
        });
    }),
    // PATCH /api/admin/user/:id/status - Activate/deactivate user
    updateUserStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean'
            });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        user.isActive = isActive;
        await user.save();
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isActive: user.isActive
                }
            }
        });
    }),
    // GET /api/admin/stats - Get admin statistics
    getStats: asyncHandler(async (req, res) => {
        const [totalUsers, activeUsers, freeUsers, paidUsersPro, paidUsersPremium, totalRecords, recentRecords] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ plan: 'free' }),
            User.countDocuments({ plan: 'pro' }),
            User.countDocuments({ plan: 'premium' }),
            Record.countDocuments(),
            Record.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
        ]);
        // Calculate revenue (simplified)
        const revenuePro = paidUsersPro * 79; // Using default for now
        const revenuePremium = paidUsersPremium * 299;
        const totalRevenue = revenuePro + revenuePremium;
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    free: freeUsers,
                    paidPro: paidUsersPro,
                    paidPremium: paidUsersPremium
                },
                revenue: {
                    monthlyPro: revenuePro,
                    monthlyPremium: revenuePremium,
                    total: totalRevenue
                },
                records: {
                    total: totalRecords,
                    last30Days: recentRecords
                }
            }
        });
    }),
    // POST /api/admin/user/:id/reset-password - Reset user password (for support)
    resetUserPassword: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }),
    // GET /api/admin/settings - Get site settings
    getSettings: asyncHandler(async (req, res) => {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json({ success: true, data: settings });
    }),
    // PATCH /api/admin/settings - Update site settings
    updateSettings: asyncHandler(async (req, res) => {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }
        const { proPrice, premiumPrice, isFreeMode, currency, adminInstructions, splashAds, aiAutonomousLevel, globalBenchmarkingEnabled, resilienceModeEnabled } = req.body;
        if (proPrice !== undefined)
            settings.proPrice = proPrice;
        if (premiumPrice !== undefined)
            settings.premiumPrice = premiumPrice;
        if (isFreeMode !== undefined)
            settings.isFreeMode = isFreeMode;
        if (currency !== undefined)
            settings.currency = currency;
        if (adminInstructions !== undefined)
            settings.adminInstructions = adminInstructions;
        if (splashAds !== undefined)
            settings.splashAds = splashAds;
        if (aiAutonomousLevel !== undefined)
            settings.aiAutonomousLevel = aiAutonomousLevel;
        if (globalBenchmarkingEnabled !== undefined)
            settings.globalBenchmarkingEnabled = globalBenchmarkingEnabled;
        if (resilienceModeEnabled !== undefined)
            settings.resilienceModeEnabled = resilienceModeEnabled;
        await settings.save();
        res.json({ success: true, data: settings });
    })
};
