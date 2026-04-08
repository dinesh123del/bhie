import mongoose from 'mongoose';

export interface UsageCreditDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  type: 'upload' | 'ai_analysis' | 'ocr' | 'api_call' | 'storage_gb' | 'team_member';
  amount: number; // positive = credit added, negative = usage consumed
  description: string;
  metadata?: {
    referralBonus?: boolean;
    planIncluded?: boolean;
    purchased?: boolean;
    pricePerUnit?: number;
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const usageCreditSchema = new mongoose.Schema<UsageCreditDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    type: {
      type: String,
      enum: ['upload', 'ai_analysis', 'ocr', 'api_call', 'storage_gb', 'team_member'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      referralBonus: Boolean,
      planIncluded: Boolean,
      purchased: Boolean,
      pricePerUnit: Number,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
usageCreditSchema.index({ userId: 1, type: 1, createdAt: -1 });
usageCreditSchema.index({ organizationId: 1, type: 1, createdAt: -1 });

const UsageCredit = mongoose.model<UsageCreditDocument>('UsageCredit', usageCreditSchema);
export default UsageCredit;
