import mongoose, { Schema } from 'mongoose';
const subscriptionSchema = new Schema({
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
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' && (!this.expiryDate || this.expiryDate.getTime() > Date.now());
};
subscriptionSchema.methods.isExpired = function () {
    return this.expiryDate ? this.expiryDate.getTime() <= Date.now() : false;
};
subscriptionSchema.methods.activateSubscription = async function (subscriptionId, paymentId) {
    const now = new Date();
    const expiryDate = new Date(now);
    if (this.billingCycle === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    else {
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
subscriptionSchema.methods.renewSubscription = async function () {
    const newExpiry = new Date(this.expiryDate || Date.now());
    newExpiry.setDate(newExpiry.getDate() + 30);
    this.expiryDate = newExpiry;
    this.nextBillingDate = newExpiry;
    this.status = 'active';
    await this.save();
};
subscriptionSchema.methods.cancelSubscription = async function () {
    this.status = 'cancelled';
    await this.save();
};
subscriptionSchema.statics.findByPhone = async function (phone) {
    return this.findOne({ phoneNumber: phone });
};
subscriptionSchema.statics.findByEmail = async function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
subscriptionSchema.statics.getActiveSubscriptions = async function () {
    return this.find({
        status: 'active',
        expiryDate: { $gt: new Date() }
    });
};
subscriptionSchema.statics.getExpiredSubscriptions = async function () {
    return this.find({
        status: 'active',
        expiryDate: { $lte: new Date() }
    });
};
subscriptionSchema.statics.getRevenueStats = async function () {
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
const WhatsAppSubscription = mongoose.model('WhatsAppSubscription', subscriptionSchema);
export default WhatsAppSubscription;
