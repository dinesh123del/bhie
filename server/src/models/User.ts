import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import type { PlanType } from '../types/index.js';
import { FREE_UPLOAD_LIMIT, PLAN_CONFIG, type PaidPlanType } from '../utils/planConfig.js';

type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'premium';
  isPremium: boolean;
  planExpiry?: Date;
  isActive: boolean;
  usageCount: number;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'halted' | 'pending';
  nextBillingDate?: Date;
  billingCycle?: 'monthly' | 'yearly';
  razorpayCustomerId?: string;
  pushToken?: string;
  profilePic?: string;
  createdAt: Date;
  updatedAt: Date;
  canCreateRecord(): boolean;
  hasPremiumAccess(): boolean;
  refreshSubscriptionStatus(): Promise<void>;
  getEffectivePlan(): 'free' | 'pro' | 'premium';
  incrementUsageCount(): Promise<void>;
  decrementUsageCount(): Promise<void>;
  resetUsageCount(): Promise<void>;
  upgradePlan(plan: 'pro' | 'premium', subscriptionId?: string, cycle?: 'monthly' | 'yearly'): Promise<void>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function(this: UserDocument) {
      return !this.googleId;
    },
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  planExpiry: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  subscriptionId: {
    type: String,
    index: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'halted', 'pending'],
  },
  nextBillingDate: Date,
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
  },
  razorpayCustomerId: String,
  pushToken: {
    type: String,
    default: null,
  },
  profilePic: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

userSchema.methods.hasPremiumAccess = function(this: UserDocument) {
  // Admins always have premium access for free
  if (this.role === 'admin') {
    return true;
  }

  if (this.plan === 'free') {
    return false;
  }

  // If the user is logged in and has a plan (pro/premium), 
  // allow access regardless of expiry for now (as requested: "free no payment needed")
  if (this.plan === 'pro' || this.plan === 'premium') {
    return true;
  }

  if (!this.isActive || !this.planExpiry) {
    return false;
  }

  return this.planExpiry.getTime() > Date.now();
};

userSchema.methods.getEffectivePlan = function(this: UserDocument): 'free' | 'pro' | 'premium' {
  if (this.role === 'admin') return 'premium';
  return this.hasPremiumAccess() ? this.plan : 'free';
};

userSchema.methods.refreshSubscriptionStatus = async function(this: UserDocument) {
  let shouldSave = false;

  if (this.plan === 'free') {
    if (!this.isActive) {
      this.isActive = true;
      shouldSave = true;
    }

    if (this.planExpiry) {
      this.planExpiry = undefined;
      shouldSave = true;
    }
  } else {
    const isExpired = !this.planExpiry || this.planExpiry.getTime() <= Date.now();

    if (isExpired) {
      this.plan = 'free';
      this.planExpiry = undefined;
      shouldSave = true;
    }

    if (!this.isActive) {
      this.isActive = true;
      shouldSave = true;
    }
  }

  if (shouldSave) {
    await this.save();
  }
};

userSchema.methods.canCreateRecord = function(this: UserDocument) {
  if (this.hasPremiumAccess()) {
    return true;
  }

  return (this.usageCount || 0) < FREE_UPLOAD_LIMIT;
};

userSchema.methods.incrementUsageCount = async function(this: UserDocument) {
  this.usageCount = (this.usageCount || 0) + 1;
  await this.save();
};

userSchema.methods.decrementUsageCount = async function(this: UserDocument) {
  this.usageCount = Math.max(0, (this.usageCount || 0) - 1);
  await this.save();
};

userSchema.methods.resetUsageCount = async function(this: UserDocument) {
  this.usageCount = 0;
  await this.save();
};

userSchema.methods.upgradePlan = async function(
  this: UserDocument, 
  plan: 'pro' | 'premium', 
  subscriptionId?: string,
  cycle: 'monthly' | 'yearly' = 'monthly'
) {
  const now = new Date();

  // Set expiry and next billing date
  const expiryDate = new Date(now);
  if (cycle === 'yearly') {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } else {
    expiryDate.setDate(expiryDate.getDate() + 30);
  }

  this.plan = plan;
  this.isPremium = true;
  this.billingCycle = cycle;
  
  if (subscriptionId) {
    this.subscriptionId = subscriptionId;
    this.subscriptionStatus = 'active';
  }
  
  this.planExpiry = expiryDate;
  this.nextBillingDate = expiryDate;
  this.isActive = true;
  this.usageCount = 0;
  await this.save();
};

userSchema.pre('save', async function(next) {
  if (!this.password) {
    next();
    return;
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<UserDocument>('User', userSchema);
export default User;
