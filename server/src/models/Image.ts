import mongoose, { Document, Schema } from 'mongoose';

export type UploadedImageType = 'income' | 'expense' | 'unknown';

export interface ImageDocument extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  extractedText: string;
  detectedType: UploadedImageType;
  category: string;
  amount?: number;
  recordId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<ImageDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    detectedType: {
      type: String,
      enum: ['income', 'expense', 'unknown'],
      default: 'unknown',
      index: true,
    },
    category: {
      type: String,
      default: 'other',
      index: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    recordId: {
      type: Schema.Types.ObjectId,
      ref: 'Record',
    },
  },
  { timestamps: true }
);

imageSchema.index({ userId: 1, createdAt: -1 });

const Image = mongoose.model<ImageDocument>('Image', imageSchema);

export default Image;
