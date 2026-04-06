import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { UserRole } from '../types/index.js';


export class AuthService {
  static generateToken(userId: string, role: UserRole): string {
    const signOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };
    return jwt.sign({ userId, role }, env.JWT_SECRET, signOptions);
  }

  static async formatUserResponse(user: any) {
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

  static async findUserByEmail(email: string) {
    return User.findOne({ email });
  }

  static async findUserById(id: string) {
    return User.findById(id).select('-password');
  }
}
