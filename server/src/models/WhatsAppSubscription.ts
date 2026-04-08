import mongoose, { Schema, Document, Model } from 'mongoose';

export interface WhatsAppSubscriptionDoc extends Document {
  phoneNumber: string;
  email?: string;
  name?: string;
  plan: 'basic' | 'pro' | 'premium';
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  subscriptionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  startDate?: Date;
  expiryDate?: Date;
  nextBillingDate?: Date;
  billingCycle: 'monthly' | 'yearly';
  paymentStatus: 'pending' | 'paid' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isActive(): boolean;
  isExpired(): boolean;
  activateSubscription(subscriptionId: string, paymentId: string): Promise<void>;
  renewSubscription(): Promise<void>;
  cancelSubscription(): Promise<void>;
}

interface WhatsAppSubscriptionModel extends Model<WhatsAppSubscriptionDoc> {
  findByPhone(phone: string): Promise<WhatsAppSubscriptionDoc | null>;
  findByEmail(email: string): Promise<WhatsAppSubscriptionDoc | null>;
  getActiveSubscriptions(): Promise<WhatsAppSubscriptionDoc[]>;
  getExpiredSubscriptions(): Promise<WhatsAppSubscriptionDoc[]>;
  getRevenueStats(): Promise<any>;
}

const subscriptionSchema = new Schema<WhatsAppSubscriptionDoc, WhatsAppSubscriptionModel>({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },
  name: {
    type: String,
    trim: true
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'premium'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },
  subscriptionId: {
    type: String,
    index: true
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  startDate: {
    type: Date
  },
  expiryDate: {
    type: Date,
    index: true
  },
  nextBillingDate: {
    type: Date
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

subscriptionSchema.methods.isActive = function(this: WhatsAppSubscriptionDoc): boolean {
  return this.status === 'active' && (!this.expiryDate || this.expiryDate.getTime() > Date.now());
};

subscriptionSchema.methods.isExpired = function(this: WhatsAppSubscriptionDoc): boolean {
  return this.expiryDate ? this.expiryDate.getTime() <= Date.now() : false;
};

subscriptionSchema.methods.activateSubscription = async function(
  this: WhatsAppSubscriptionDoc,
  subscriptionId: string,
  paymentId: string
) {
  const now = new Date();
  const expiryDate = new Date(now);
  
  if (this.billingCycle === 'yearly') {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } else {
    expiryDate.setDate(expiryDate.getDate() + 30);
  }

  this.subscriptionId = subscriptionId;
  this.razorpayPaymentId = paymentId;
  this.status = 'active';
  this.paymentStatus = 'paid';
  this.startDate = now;
  this.expiryDate = expiryDate;
  this.nextBillingDate = expiryDate;
  
  await this.save();
};

subscriptionSchema.methods.renewSubscription = async function(this: WhatsAppSubscriptionDoc) {
  const newExpiry = new Date(this.expiryDate || Date.now());
  newExpiry.setDate(newExpiry.getDate() + 30);
  
  this.expiryDate = newExpiry;
  this.nextBillingDate = newExpiry;
  this.status = 'active';
  
  await this.save();
};

subscriptionSchema.methods.cancelSubscription = async function(this: WhatsAppSubscriptionDoc) {
  this.status = 'cancelled';
  await this.save();
};

subscriptionSchema.statics.findByPhone = async function(phone: string): Promise<WhatsAppSubscriptionDoc | null> {
  return this.findOne({ phoneNumber: phone });
};

subscriptionSchema.statics.findByEmail = async function(email: string): Promise<WhatsAppSubscriptionDoc | null> {
  return this.findOne({ email: email.toLowerCase() });
};

subscriptionSchema.statics.getActiveSubscriptions = async function(): Promise<WhatsAppSubscriptionDoc[]> {
  return this.find({ 
    status: 'active',
    expiryDate: { $gt: new Date() }
  });
};

subscriptionSchema.statics.getExpiredSubscriptions = async function(): Promise<WhatsAppSubscriptionDoc[]> {
  return this.find({ 
    status: 'active',
    expiryDate: { $lte: new Date() }
  });
};

subscriptionSchema.statics.getRevenueStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$plan',
        totalRevenue: { $sum: '$amount' },
        activeCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        totalCount: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

const WhatsAppSubscription = mongoose.model<WhatsAppSubscriptionDoc, WhatsAppSubscriptionModel>(
  'WhatsAppSubscription',
  subscriptionSchema
);

export default WhatsAppSubscription;
