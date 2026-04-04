import mongoose from 'mongoose';

interface AnalyticsDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  metric: string;
  value: number;
  date: Date;
}

const analyticsSchema = new mongoose.Schema<AnalyticsDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metric: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Analytics = mongoose.model<AnalyticsDocument>('Analytics', analyticsSchema);
export default Analytics;
export { AnalyticsDocument };
