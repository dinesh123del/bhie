import mongoose from 'mongoose';
const insightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
}, {
    timestamps: true,
});
const Insight = mongoose.model('Insight', insightSchema);
export default Insight;
