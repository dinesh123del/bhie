import mongoose, { Schema } from 'mongoose';
const SubscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    stripeId: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
    status: { type: String, enum: ['active', 'canceled', 'past_due'], default: 'active' },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    usageLimit: { type: Number, default: 0 },
    usedTokens: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, {
    timestamps: true
});
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ stripeId: 1 });
export default mongoose.model('Subscription', SubscriptionSchema);
