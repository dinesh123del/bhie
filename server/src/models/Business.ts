import mongoose, { Schema, Document, Model } from 'mongoose';
import User from './User.js';

export interface BusinessDoc extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  whatsappPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BusinessModel extends Model<BusinessDoc> {
  findByPhone(phone: string): Promise<BusinessDoc | null>;
  linkPhoneByEmail(email: string, phone: string): Promise<boolean>;
}

const BusinessSchema = new Schema<BusinessDoc, BusinessModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  whatsappPhone: { 
    type: String, 
    trim: true,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

BusinessSchema.statics.findByPhone = async function(phone: string): Promise<BusinessDoc | null> {
  return this.findOne({ whatsappPhone: phone });
};

BusinessSchema.statics.linkPhoneByEmail = async function(email: string, phone: string): Promise<boolean> {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return false;

  await this.findOneAndUpdate(
    { userId: user._id },
    { 
      userId: user._id,
      name: user.name,
      whatsappPhone: phone 
    },
    { upsert: true, new: true }
  );
  return true;
};

const Business: BusinessModel = mongoose.model<BusinessDoc, BusinessModel>('Business', BusinessSchema);

export { Business };
export default Business;
