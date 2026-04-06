import mongoose from 'mongoose';

export interface SettingsDocument extends mongoose.Document {
  proPrice: number;
  premiumPrice: number;
  currency: string;
  isFreeMode: boolean; // Toggle for "no payment needed"
  adminAccessCode: string; // Security code to access admin panel
  adminInstructions: string; // Global instructions/announcements from admin
  splashAds: string[]; // Dynamic ads/tips shown on the loading splash screen
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  
  // ⚡ Top 1% Innovation Fields (2025-2050 Vision)
  aiAutonomousLevel: 'advisor' | 'agent' | 'autonomous';
  globalBenchmarkingEnabled: boolean;
  resilienceModeEnabled: boolean;
}

const settingsSchema = new mongoose.Schema<SettingsDocument>({
  proPrice: { type: Number, default: 79 },
  premiumPrice: { type: Number, default: 299 },
  currency: { type: String, default: 'INR' },
  isFreeMode: { type: Boolean, default: true }, // Free by default as requested
  adminAccessCode: { type: String, default: '7665' }, // Default admin access code
  adminInstructions: { type: String, default: '' }, // Default empty
  splashAds: { type: [String], default: [] }, // Default empty array of ads
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  
  // Forward-looking defaults
  aiAutonomousLevel: { type: String, enum: ['advisor', 'agent', 'autonomous'], default: 'advisor' },
  globalBenchmarkingEnabled: { type: Boolean, default: false },
  resilienceModeEnabled: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Settings = mongoose.model<SettingsDocument>('Settings', settingsSchema);
export default Settings;
