import mongoose from 'mongoose';

interface UploadDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  fileUrl: string;
  fileType: 'csv' | 'excel' | 'pdf' | 'image' | 'docx' | 'zip';
  status: 'processing' | 'completed' | 'failed';
  parsedData: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new mongoose.Schema<UploadDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['csv', 'excel', 'pdf', 'image', 'docx', 'zip'],
    required: true,
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  parsedData: {
    type: mongoose.Schema.Types.Mixed,
  },
  error: String,
}, {
  timestamps: true,
});

export type ParsedData = {
  rawData: any[];
  revenue?: number;
  expenses?: number;
  customers?: number;
  employees?: number;
  products?: number;
  profit?: number;
  imageClassification?: {
    type: string;
    confidence: number;
    insights: string[];
  };
};

const Upload = mongoose.model<UploadDocument>('Upload', uploadSchema);
export default Upload;
export type { UploadDocument };
