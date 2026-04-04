import mongoose from 'mongoose';

interface ImageDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  filePath: string;
  mimeType: string;
  size: number;
  extractedData: mongoose.Schema.Types.Mixed; // OCR text, detected objects, business metrics, etc.
  processingStatus: 'queued' | 'processing' | 'completed' | 'failed';
  confidenceScore?: number;
  detectedType?: string;
  tags?: string[];
}

const imageSchema = new mongoose.Schema<ImageDocument>({
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

const Images = mongoose.model<ImageDocument>('Images', imageSchema);
export default Images;
