import mongoose, { Schema } from 'mongoose';
const CompanySchema = new Schema({
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
const Company = mongoose.model('Company', CompanySchema);
export default Company;
