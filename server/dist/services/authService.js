import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
export class AuthService {
    static generateToken(userId, role) {
        const signOptions = {
            expiresIn: env.JWT_EXPIRES_IN,
        };
        return jwt.sign({ userId, role }, env.JWT_SECRET, signOptions);
    }
    static async formatUserResponse(user) {
        if (typeof user.refreshSubscriptionStatus === 'function') {
            await user.refreshSubscriptionStatus();
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: typeof user.getEffectivePlan === 'function' ? user.getEffectivePlan() : user.plan,
            isActive: user.isActive,
            expiryDate: user.planExpiry?.toISOString() || null,
            usageCount: user.usageCount,
        };
    }
    static async findUserByEmail(email) {
        return User.findOne({ email });
    }
    static async findUserById(id) {
        return User.findById(id).select('-password');
    }
}
