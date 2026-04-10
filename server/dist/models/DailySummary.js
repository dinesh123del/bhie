import mongoose, { Schema } from 'mongoose';
const dailySummarySchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true },
    totalRevenue: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    metrics: {
        burnRate: { type: Number, default: 0 },
        profitMargin: { type: Number, default: 0 },
        avgOrderValue: { type: Number, default: 0 },
    },
    topProducts: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });
// Primary uniqueness constraint
dailySummarySchema.index({ businessId: 1, date: 1 }, { unique: true });
const DailySummary = mongoose.model('DailySummary', dailySummarySchema);
export default DailySummary;
