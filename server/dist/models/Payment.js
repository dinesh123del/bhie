import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
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
    razorpaySubscriptionId: {
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
        enum: ['pro', 'premium', 'enterprise'],
        required: true,
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
    },
    paymentMethod: String,
    expiryDate: Date,
    verifiedAt: Date,
}, {
    timestamps: true,
});
const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
