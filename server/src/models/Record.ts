import mongoose from 'mongoose';

interface RecordDocument extends mongoose.Document {
  title: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description?: string;
  status: string;
  fileUrl?: string;
  userId: mongoose.Types.ObjectId;
  gstNumber?: string;
  gstDetails?: any;
}

const recordSchema = new mongoose.Schema<RecordDocument>({
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
}, {
  timestamps: true,
});

const Record = mongoose.model<RecordDocument>('Record', recordSchema);
export default Record;

