import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: string;
  organizationId?: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: { type: String, required: true },
    organizationId: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'general' },
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReport>('Report', reportSchema);
