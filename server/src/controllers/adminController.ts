import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import BusinessRecord from '../models/Record';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/asyncHandler';

export const adminController = {
  // GET /api/admin/users - List all users with pagination and filters
  getUsers: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

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
  updateUserPlan: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { plan, planExpiry } = req.body;

    if (!['free', '59', '119'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be free, 59, or 119'
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
    if (plan !== 'free' && planExpiry) {
      user.planExpiry = new Date(planExpiry);
    } else if (plan === 'free') {
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
  updateUserStatus: asyncHandler(async (req: AuthRequest, res: Response) => {
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
  getStats: asyncHandler(async (req: AuthRequest, res: Response) => {
    const [
      totalUsers,
      activeUsers,
      freeUsers,
      paidUsers59,
      paidUsers119,
      totalRecords,
      recentRecords
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ plan: 'free' }),
      User.countDocuments({ plan: '59' }),
      User.countDocuments({ plan: '119' }),
      BusinessRecord.countDocuments(),
      BusinessRecord.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Calculate revenue (simplified - assuming monthly plans)
    const revenue59 = paidUsers59 * 59;
    const revenue119 = paidUsers119 * 119;
    const totalRevenue = revenue59 + revenue119;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          free: freeUsers,
          paid59: paidUsers59,
          paid119: paidUsers119
        },
        revenue: {
          monthly59: revenue59,
          monthly119: revenue119,
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
  resetUserPassword: asyncHandler(async (req: AuthRequest, res: Response) => {
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
  })
};