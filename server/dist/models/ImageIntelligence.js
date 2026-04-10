import mongoose, { Schema } from 'mongoose';
const ocrLineSchema = new Schema({
    text: { type: String, required: true },
    confidence: { type: Number, required: true },
}, { _id: false });
const ocrWordSchema = new Schema({
    text: { type: String, required: true },
    confidence: { type: Number, required: true },
}, { _id: false });
const detectedObjectSchema = new Schema({
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
}, { _id: false });
const structuredDataSchema = new Schema({
    prices: { type: [Number], default: [] },
    quantities: { type: [Number], default: [] },
    dates: { type: [String], default: [] },
    productNames: { type: [String], default: [] },
    rawMatches: { type: [String], default: [] },
}, { _id: false });
const imageIntelligenceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    imageUrl: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    extractedText: { type: String, default: '' },
    normalizedText: { type: String, default: '' },
    ocrBlocks: {
        lines: { type: [ocrLineSchema], default: [] },
        words: { type: [ocrWordSchema], default: [] },
    },
    detectedObjects: { type: [detectedObjectSchema], default: [] },
    detectedType: {
        type: String,
        enum: ['invoice', 'material', 'product', 'document', 'unknown'],
        default: 'unknown',
        index: true,
    },
    tags: { type: [String], default: [], index: true },
    confidenceScore: { type: Number, default: 0 },
    structuredData: { type: structuredDataSchema, default: () => ({}) },
    imageEmbedding: { type: [Number], default: [] },
    imageHash: { type: String, default: '', index: true },
    processingStatus: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued',
        index: true,
    },
    processingError: { type: String, default: '' },
}, { timestamps: true });
imageIntelligenceSchema.index({
    extractedText: 'text',
    tags: 'text',
    'detectedObjects.label': 'text',
    'structuredData.productNames': 'text',
    'structuredData.rawMatches': 'text',
});
const ImageIntelligence = mongoose.model('ImageIntelligence', imageIntelligenceSchema);
export default ImageIntelligence;
