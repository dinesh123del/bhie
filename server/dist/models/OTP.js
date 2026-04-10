import mongoose, { Schema } from 'mongoose';
const otpSchema = new Schema({
    email: { type: String, required: true, lowercase: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });
export const OTP = mongoose.model('OTP', otpSchema);
