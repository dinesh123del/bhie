import mongoose from 'mongoose';

export interface ReferralDocument extends mongoose.Document {
  referrerId: mongoose.Types.ObjectId;
  refereeEmail: string;
  refereeId?: mongoose.Types.ObjectId;
  code: string;
  status: 'pending' | 'converted' | 'expired';
  rewardGiven: boolean;
  referrerReward: '1_month_pro' | 'credits';
  refereeDiscount: number;
  convertedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new mongoose.Schema<ReferralDocument>({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  refereeEmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'converted', 'expired'],
    default: 'pending',
  },
  rewardGiven: {
    type: Boolean,
    default: false,
  },
  referrerReward: {
    type: String,
    enum: ['1_month_pro', 'credits'],
    default: '1_month_pro',
  },
  refereeDiscount: {
    type: Number,
    default: 50, // 50% off first month
  },
  convertedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
}, {
  timestamps: true,
});

// Compound index for finding referrals by referrer
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ refereeEmail: 1, status: 1 });

const Referral = mongoose.model<ReferralDocument>('Referral', referralSchema);
export default Referral;
