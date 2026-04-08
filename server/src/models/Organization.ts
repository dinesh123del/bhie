import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface OrganizationDocument extends mongoose.Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  planExpiry?: Date;
  billingCycle: 'monthly' | 'yearly';
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial' | 'suspended';
  trialEndsAt?: Date;
  features: {
    maxUsers: number;
    maxStorageGB: number;
    maxRecords: number;
    apiAccess: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    aiFeatures: boolean;
    whiteLabel: boolean;
  };
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
  billing: {
    email: string;
    address?: string;
    taxId?: string;
    paymentMethod?: string;
  };
  ownerId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  isVerified: boolean;
  metadata: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  hasFeature(feature: keyof OrganizationDocument['features']): boolean;
  isInTrial(): boolean;
  getEffectivePlan(): 'free' | 'starter' | 'growth' | 'enterprise';
  canAddMember(): boolean;
  incrementUsage(metric: string, value?: number): Promise<void>;
  getUsage(): Record<string, number>;
}

const organizationSchema = new mongoose.Schema<OrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: String,
    website: String,
    industry: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '1-10',
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'growth', 'enterprise'],
      default: 'free',
    },
    planExpiry: Date,
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial', 'suspended'],
      default: 'trial',
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    },
    features: {
      maxUsers: { type: Number, default: 1 },
      maxStorageGB: { type: Number, default: 1 },
      maxRecords: { type: Number, default: 100 },
      apiAccess: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      aiFeatures: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false },
    },
    settings: {
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      language: { type: String, default: 'en' },
    },
    billing: {
      email: { type: String, required: true },
      address: String,
      taxId: String,
      paymentMethod: String,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    memberIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance (slug/ownerId have index: true already)
organizationSchema.index({ memberIds: 1 });
organizationSchema.index({ plan: 1, subscriptionStatus: 1 });
organizationSchema.index({ createdAt: -1 });

// Virtual for member count
organizationSchema.virtual('memberCount').get(function () {
  return this.memberIds?.length || 0;
});

// Pre-save middleware to set features based on plan
organizationSchema.pre('save', function (next) {
  const planFeatures = {
    free: {
      maxUsers: 1,
      maxStorageGB: 1,
      maxRecords: 100,
      apiAccess: false,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: false,
      aiFeatures: false,
      whiteLabel: false,
    },
    starter: {
      maxUsers: 5,
      maxStorageGB: 10,
      maxRecords: 1000,
      apiAccess: true,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: false,
      aiFeatures: true,
      whiteLabel: false,
    },
    growth: {
      maxUsers: 25,
      maxStorageGB: 100,
      maxRecords: 10000,
      apiAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      prioritySupport: true,
      aiFeatures: true,
      whiteLabel: false,
    },
    enterprise: {
      maxUsers: 100,
      maxStorageGB: 1000,
      maxRecords: 100000,
      apiAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      prioritySupport: true,
      aiFeatures: true,
      whiteLabel: true,
    },
  };

  // Update features based on plan
  if (this.isModified('plan') || this.isNew) {
    this.features = { ...planFeatures[this.plan] };
  }

  next();
});

// Methods
organizationSchema.methods.hasFeature = function (
  this: OrganizationDocument,
  feature: keyof OrganizationDocument['features']
): boolean {
  return this.features[feature] === true;
};

organizationSchema.methods.isInTrial = function (this: OrganizationDocument): boolean {
  if (this.subscriptionStatus !== 'trial') return false;
  if (!this.trialEndsAt) return false;
  return this.trialEndsAt.getTime() > Date.now();
};

organizationSchema.methods.getEffectivePlan = function (
  this: OrganizationDocument
): 'free' | 'starter' | 'growth' | 'enterprise' {
  if (this.isInTrial()) return this.plan;
  if (this.subscriptionStatus === 'active' || this.subscriptionStatus === 'trial') {
    if (this.planExpiry && this.planExpiry.getTime() <= Date.now()) {
      return 'free';
    }
    return this.plan;
  }
  return 'free';
};

organizationSchema.methods.canAddMember = function (this: OrganizationDocument): boolean {
  return this.memberIds.length < this.features.maxUsers;
};

organizationSchema.methods.incrementUsage = async function (
  this: OrganizationDocument,
  metric: string,
  value: number = 1
): Promise<void> {
  const key = `usage.${metric}`;
  const current = this.metadata.get(key) || 0;
  this.metadata.set(key, current + value);
  await this.save();
};

organizationSchema.methods.getUsage = function (this: OrganizationDocument): Record<string, number> {
  const usage: Record<string, number> = {};
  const usagePrefix = 'usage.';

  for (const [key, value] of this.metadata.entries()) {
    if (key.startsWith(usagePrefix)) {
      usage[key.substring(usagePrefix.length)] = value as number;
    }
  }

  return usage;
};

const Organization = mongoose.model<OrganizationDocument>('Organization', organizationSchema);
export default Organization;
