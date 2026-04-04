import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<IOtp>('OTP', otpSchema);
