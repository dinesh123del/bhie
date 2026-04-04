import mongoose from 'mongoose';
const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    metric: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
