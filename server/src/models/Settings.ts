import mongoose from 'mongoose';

export interface SettingsDocument extends mongoose.Document {
  proPrice: number;
  premiumPrice: number;
  currency: string;
  isFreeMode: boolean; // Toggle for "no payment needed"
}

const settingsSchema = new mongoose.Schema<SettingsDocument>({
  proPrice: { type: Number, default: 79 },
  premiumPrice: { type: Number, default: 299 },
  currency: { type: String, default: 'INR' },
  isFreeMode: { type: Boolean, default: true }, // Free by default as requested
}, {
  timestamps: true
});

const Settings = mongoose.model<SettingsDocument>('Settings', settingsSchema);
export default Settings;
