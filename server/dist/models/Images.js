import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    extractedData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    processingStatus: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued',
    },
    confidenceScore: {
        type: Number,
        min: 0,
        max: 1,
    },
    detectedType: String,
    tags: [String],
}, {
    timestamps: true,
});
imageSchema.index({ userId: 1, processingStatus: 1 });
imageSchema.index({ 'extractedData.category': 1 });
const Images = mongoose.model('Images', imageSchema);
export default Images;
