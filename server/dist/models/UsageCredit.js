import mongoose from 'mongoose';
const usageCreditSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
// Compound indexes for efficient queries
usageCreditSchema.index({ userId: 1, type: 1, createdAt: -1 });
usageCreditSchema.index({ organizationId: 1, type: 1, createdAt: -1 });
const UsageCredit = mongoose.model('UsageCredit', usageCreditSchema);
export default UsageCredit;
