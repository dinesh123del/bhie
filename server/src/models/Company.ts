import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CompanyDoc extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  industry: string;
  revenue: number;
  expenses: number;
  employees: number;
  growthRate: number;
  profit: number;
  profitMargin: number;
  status: 'HEALTHY' | 'MODERATE' | 'RISK';
  location?: string;
  logo?: string;
  insights?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDoc>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  industry: { type: String, required: true },
  revenue: { type: Number, required: true, min: 0 },
  expenses: { type: Number, required: true, min: 0 },
  employees: { type: Number, required: true, min: 1 },
  growthRate: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['HEALTHY', 'MODERATE', 'RISK'], 
    default: 'MODERATE' 
  },
  location: { type: String, trim: true },
  logo: { type: String },
  insights: [{ 
    type: String, 
    index: true 
  }]
}, {
  timestamps: true
});

const Company: Model<CompanyDoc> = mongoose.model<CompanyDoc>('Company', CompanySchema);

export default Company;

