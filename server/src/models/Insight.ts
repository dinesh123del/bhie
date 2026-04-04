import mongoose from 'mongoose';

interface InsightDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const insightSchema = new mongoose.Schema<InsightDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

const Insight = mongoose.model<InsightDocument>('Insight', insightSchema);

export default Insight;