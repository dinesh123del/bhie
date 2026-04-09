import mongoose from 'mongoose';

export interface RecordDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  amount: number;
  title?: string;
  description: string;
  fileUrl?: string;
  gstNumber?: string;
  category?: string;
  vendor?: string;
  date: Date;
  tags?: string[];
  status: 'pending' | 'confirmed' | 'rejected';
  metadata: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema = new mongoose.Schema<RecordDocument>({
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

const Record = mongoose.model<RecordDocument>('Record', recordSchema);
export default Record;

