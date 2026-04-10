import mongoose, { Schema } from 'mongoose';
const eventSchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type: { type: String, required: true, index: true },
    source: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    confidence: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'confirmed' }, // Default to confirmed for manual
    metadata: { type: Schema.Types.Mixed },
    processedAt: { type: Date },
}, { timestamps: true });
// Indexes for performance and isolation
eventSchema.index({ businessId: 1, createdAt: -1 });
eventSchema.index({ businessId: 1, type: 1 });
const Event = mongoose.model('Event', eventSchema);
export default Event;
