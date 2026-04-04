import mongoose, { Document, Schema } from 'mongoose';

export type ImageDetectedType = 'invoice' | 'material' | 'product' | 'document' | 'unknown';
export type ImageProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface OCRLine {
  text: string;
  confidence: number;
}

export interface OCRWord {
  text: string;
  confidence: number;
}

export interface DetectedObject {
  label: string;
  confidence: number;
}

export interface StructuredData {
  prices: number[];
  quantities: number[];
  dates: string[];
  productNames: string[];
  rawMatches: string[];
}

export interface ImageIntelligenceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText: string;
  normalizedText: string;
  ocrBlocks: {
    lines: OCRLine[];
    words: OCRWord[];
  };
  detectedObjects: DetectedObject[];
  detectedType: ImageDetectedType;
  tags: string[];
  confidenceScore: number;
  structuredData: StructuredData;
  imageEmbedding: number[];
  imageHash: string;
  processingStatus: ImageProcessingStatus;
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ocrLineSchema = new Schema<OCRLine>(
  {
    text: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

const ocrWordSchema = new Schema<OCRWord>(
  {
    text: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

const detectedObjectSchema = new Schema<DetectedObject>(
  {
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

const structuredDataSchema = new Schema<StructuredData>(
  {
    prices: { type: [Number], default: [] },
    quantities: { type: [Number], default: [] },
    dates: { type: [String], default: [] },
    productNames: { type: [String], default: [] },
    rawMatches: { type: [String], default: [] },
  },
  { _id: false }
);

const imageIntelligenceSchema = new Schema<ImageIntelligenceDocument>(
  {
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
  },
  { timestamps: true }
);

imageIntelligenceSchema.index({
  extractedText: 'text',
  tags: 'text',
  'detectedObjects.label': 'text',
  'structuredData.productNames': 'text',
  'structuredData.rawMatches': 'text',
});

const ImageIntelligence = mongoose.model<ImageIntelligenceDocument>(
  'ImageIntelligence',
  imageIntelligenceSchema
);

export default ImageIntelligence;
