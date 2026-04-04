import mongoose, { Schema } from 'mongoose';
const reportSchema = new Schema({
    userId: { type: String, required: true },
    organizationId: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'general' },
}, { timestamps: true });
export const Report = mongoose.model('Report', reportSchema);
