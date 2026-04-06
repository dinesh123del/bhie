import mongoose from 'mongoose';
const recordSchema = new mongoose.Schema({
    isCertified: { type: Boolean, default: false },
    certifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    certificationDate: Date,
    auditNotes: String,
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
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
    date: {
        type: Date,
        default: Date.now,
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    fileUrl: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    gstNumber: String,
    gstDetails: mongoose.Schema.Types.Mixed,
    // Evolution Fields
    ai_analysis: {
        confidence_score: { type: Number, default: 0 },
        anomalies_detected: { type: Boolean, default: false },
        recommendation: String,
        prediction_impact: Number,
        extracted_data: mongoose.Schema.Types.Mixed,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    vector_id: String,
}, {
    timestamps: true,
});
// Optimized indexes for dashboard analytics and filtering
recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ userId: 1, type: 1, date: -1 });
recordSchema.index({ userId: 1, category: 1 });
recordSchema.index({ userId: 1, status: 1 });
recordSchema.index({ vector_id: 1 }); // For vector lookups
const Record = mongoose.model('Record', recordSchema);
export default Record;
