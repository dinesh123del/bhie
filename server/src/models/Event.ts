import mongoose, { Schema, Document } from 'mongoose';

export type EventType = 
  | 'payment_received' 
  | 'order_created' 
  | 'expense_added' 
  | 'customer_acquired' 
  | 'lead_generated'
  | 'inventory_updated';

export type EventSource = 'manual' | 'whatsapp' | 'webhook' | 'ocr' | 'api';

export type EventStatus = 'pending' | 'confirmed' | 'rejected';

export interface IEvent extends Document {
  businessId: mongoose.Types.ObjectId;
  type: EventType;
  source: EventSource;
  data: Record<string, any>;
  confidence: number;
  status: EventStatus;
  metadata?: Record<string, any>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type: { type: String, required: true, index: true },
    source: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    confidence: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'confirmed' }, // Default to confirmed for manual
    metadata: { type: Schema.Types.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance and isolation
eventSchema.index({ businessId: 1, createdAt: -1 });
eventSchema.index({ businessId: 1, type: 1 });

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
