import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkAdmin } from '../middleware/subscription.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';
import { setAuthCookie } from '../utils/cookie.js';
import { AppError } from '../utils/appError.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { env } from '../config/env.js';
import { AuthRequest, UserRole } from '../types/index.js';
import { requireUser } from '../utils/request.js';

const router = Router();

// ─── BUILT-IN SUPER ADMIN CREDENTIALS ────────────────────────
const SUPER_ADMIN_EMAIL = 'dineshbolla9@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Bolla@123';

const generateToken = (userId: string, role: UserRole): string => {
  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId, role }, env.JWT_SECRET, signOptions);
};

// ─── ADMIN LOGIN (built-in admin bypass) ─────────────────────
router.post(
  '/login',
  sensitiveLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Check if it's the built-in super admin
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      // Find or create the super admin user
      let adminUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
      
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Dinesh Bolla',
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
          role: 'admin',
          plan: 'premium',
          isActive: true,
          isPremium: true,
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.plan = 'premium';
        adminUser.isPremium = true;
        adminUser.isActive = true;
        await adminUser.save();
      }

      const token = generateToken(adminUser._id.toString(), 'admin');
      setAuthCookie(res, token);

      return res.json({
        success: true,
        isAdmin: true,
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin',
          plan: 'premium',
          isActive: true,
        },
      });
    }

    // Check if there's another admin with these credentials
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError(401, 'Invalid admin credentials');
    }

    if (user.role !== 'admin') {
      throw new AppError(403, 'This account does not have admin privileges');
    }

    const token = generateToken(user._id.toString(), 'admin');
    setAuthCookie(res, token);

    res.json({
      success: true,
      isAdmin: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isActive: user.isActive,
      },
    });
  })
);

// ─── VERIFY ACCESS CODE ──────────────────────────────────────
router.post(
  '/verify-code',
  authenticateToken,
  checkAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { code } = req.body;

    if (!code) {
      throw new AppError(400, 'Access code is required');
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (code !== settings.adminAccessCode) {
      throw new AppError(403, 'Invalid access code');
    }

    res.json({ success: true, verified: true });
  })
);

// ─── CHANGE ACCESS CODE ──────────────────────────────────────
router.patch(
  '/access-code',
  authenticateToken,
  checkAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentCode, newCode } = req.body;

    if (!currentCode || !newCode) {
      throw new AppError(400, 'Current code and new code are required');
    }

    if (newCode.length < 4 || newCode.length > 8) {
      throw new AppError(400, 'Access code must be 4-8 characters');
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (currentCode !== settings.adminAccessCode) {
      throw new AppError(403, 'Current access code is incorrect');
    }

    settings.adminAccessCode = newCode;
    await settings.save();

    res.json({ success: true, message: 'Access code updated successfully' });
  })
);

// ─── ADD NEW ADMIN ───────────────────────────────────────────
router.post(
  '/add-admin',
  authenticateToken,
  checkAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      email: z.string().email('Invalid email'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().trim().min(1, 'Name required').optional(),
    });

    const { email, password, name } = schema.parse(req.body);

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Promote existing user to admin
      user.role = 'admin';
      user.plan = 'premium';
      user.isPremium = true;
      user.isActive = true;
      if (password) {
        user.password = password;
      }
      await user.save();
    } else {
      // Create new admin user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password,
        role: 'admin',
        plan: 'premium',
        isActive: true,
        isPremium: true,
      });
    }

    res.json({
      success: true,
      message: `Admin access granted to ${email}`,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// ─── REMOVE ADMIN ACCESS ────────────────────────────────────
router.post(
  '/remove-admin',
  authenticateToken,
  checkAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    const authUser = requireUser(req);

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    // Prevent removing the super admin
    if (email === SUPER_ADMIN_EMAIL) {
      throw new AppError(403, 'Cannot remove the built-in super admin');
    }

    // Prevent self-removal
    const currentUser = await User.findById(authUser.userId);
    if (currentUser?.email === email) {
      throw new AppError(403, 'Cannot remove your own admin access');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    user.role = 'user';
    await user.save();

    res.json({
      success: true,
      message: `Admin access revoked for ${email}`,
    });
  })
);

// ─── LIST ALL ADMINS ─────────────────────────────────────────
router.get(
  '/admins',
  authenticateToken,
  checkAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const admins = await User.find({ role: 'admin' })
      .select('name email role createdAt')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: admins.map(a => ({
        id: a._id,
        name: a.name,
        email: a.email,
        isSuperAdmin: a.email === SUPER_ADMIN_EMAIL,
        createdAt: a.createdAt,
      })),
    });
  })
);

// ─── CHECK IF EMAIL IS SUPER ADMIN ──────────────────────────
router.post(
  '/check-admin',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ isAdmin: false });
    }

    // Fast-path: check built-in super admin
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      return res.json({ isAdmin: true });
    }

    // Check for other admins
    const user = await User.findOne({ email, role: 'admin' });
    if (user && await user.comparePassword(password)) {
      return res.json({ isAdmin: true });
    }

    res.json({ isAdmin: false });
  })
);

// ─── PROTECTED ADMIN ROUTES (existing) ──────────────────────
router.use(authenticateToken);
router.use(checkAdmin);

// User management
router.get('/users', adminController.getUsers);
router.patch('/user/:id/plan', adminController.updateUserPlan);
router.patch('/user/:id/status', adminController.updateUserStatus);
router.post('/user/:id/reset-password', adminController.resetUserPassword);

// Settings
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

// Statistics
router.get('/stats', adminController.getStats);

export default router;
