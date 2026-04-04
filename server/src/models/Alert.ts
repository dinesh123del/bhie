import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface AlertDoc extends Document {
  userId: Types.ObjectId;
  type: 'warning' | 'success' | 'info' | 'danger';
  message: string;
  isRead: boolean;
  data?: globalThis.Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

const AlertSchema = new Schema<AlertDoc>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['warning', 'success', 'info', 'danger'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

// Compound index for efficient unread recent queries
AlertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Alert: Model<AlertDoc> = mongoose.model<AlertDoc>('Alert', AlertSchema);

export default Alert;
