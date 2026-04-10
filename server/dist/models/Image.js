import mongoose, { Schema } from 'mongoose';
const imageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    extractedText: {
        type: String,
        default: '',
    },
    detectedType: {
        type: String,
        enum: ['income', 'expense', 'unknown'],
        default: 'unknown',
        index: true,
    },
    category: {
        type: String,
        default: 'other',
        index: true,
    },
    amount: {
        type: Number,
        min: 0,
    },
    recordId: {
        type: Schema.Types.ObjectId,
        ref: 'Record',
    },
}, { timestamps: true });
imageSchema.index({ userId: 1, createdAt: -1 });
const Image = mongoose.model('Image', imageSchema);
export default Image;
