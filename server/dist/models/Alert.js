import mongoose, { Schema } from 'mongoose';
const AlertSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['warning', 'success', 'info', 'danger'],
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    isRead: {
        type: Boolean,
        default: false
    },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});
// Compound index for efficient unread recent queries
AlertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
const Alert = mongoose.model('Alert', AlertSchema);
export default Alert;
