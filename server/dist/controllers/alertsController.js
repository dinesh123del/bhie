import { Types } from 'mongoose';
import Alert from '../models/Alert.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireUser } from '../utils/request.js';
export const alertsController = {
    // GET /api/alerts - Get user's recent alerts (unread + last 20 read)
    getAlerts: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        const userId = new Types.ObjectId(user.userId);
        const alerts = await Alert.find({
            userId,
            $or: [
                { isRead: false },
                { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Last 7 days
            ]
        })
            .sort({ createdAt: -1, isRead: 1 })
            .limit(50)
            .lean();
        // Count unread
        const unreadCount = await Alert.countDocuments({ userId, isRead: false });
        res.json({
            alerts,
            unreadCount,
            refreshedAt: new Date().toISOString()
        });
    }),
    // POST /api/alerts/mark-read - Mark single alert read
    markAlertRead: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        const userId = new Types.ObjectId(user.userId);
        const { id } = req.params;
        const alert = await Alert.findOneAndUpdate({ _id: new Types.ObjectId(id), userId }, {
            isRead: true,
            updatedAt: new Date(),
            readAt: new Date()
        }, { new: true }).lean();
        if (!alert) {
            res.status(404).json({ message: 'Alert not found' });
            return;
        }
        res.json({
            success: true,
            alert,
            unreadCount: await Alert.countDocuments({ userId, isRead: false })
        });
    }),
    // POST /api/alerts/mark-all-read
    markAllRead: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        const userId = new Types.ObjectId(user.userId);
        const result = await Alert.updateMany({ userId, isRead: false }, {
            isRead: true,
            updatedAt: new Date(),
            readAt: new Date()
        });
        res.json({
            success: true,
            markedCount: result.modifiedCount,
            unreadCount: 0
        });
    }),
    // GET /api/alerts/unread/count
    getUnreadCount: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        const userId = new Types.ObjectId(user.userId);
        const count = await Alert.countDocuments({ userId, isRead: false });
        res.json({ count });
    })
};
