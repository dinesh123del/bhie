import mongoose from 'mongoose';
import type { PaidPlanType } from '../utils/planConfig.js';

export interface PaymentDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receipt: string;
  plan: PaidPlanType;
  expiryDate?: Date;
  verifiedAt?: Date;
}

const paymentSchema = new mongoose.Schema<PaymentDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created',
  },
  razorpayOrderId: {
    type: String,
    index: true,
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  receipt: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['pro', 'enterprise'],
    required: true,
  },
  expiryDate: Date,
  verifiedAt: Date,
}, {
  timestamps: true,
});

const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
export default Payment;
