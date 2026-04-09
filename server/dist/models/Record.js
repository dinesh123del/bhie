import mongoose from 'mongoose';
const recordSchema = new mongoose.Schema({
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
        enum: ['income', 'expense'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    title: String,
    description: {
        type: String,
        required: true,
        trim: true,
    },
    fileUrl: String,
    gstNumber: String,
    category: String,
    vendor: String,
    date: {
        type: Date,
        default: Date.now,
    },
    tags: [String],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ organizationId: 1, date: -1 });
recordSchema.index({ type: 1, category: 1 });
recordSchema.index({ date: -1 });
const Record = mongoose.model('Record', recordSchema);
export default Record;
