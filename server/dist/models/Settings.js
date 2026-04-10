import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema({
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
const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
