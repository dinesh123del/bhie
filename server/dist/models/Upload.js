import mongoose from 'mongoose';
const uploadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ['csv', 'excel', 'pdf', 'image', 'docx', 'zip'],
        required: true,
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing',
    },
    parsedData: {
        type: mongoose.Schema.Types.Mixed,
    },
    error: String,
}, {
    timestamps: true,
});
const Upload = mongoose.model('Upload', uploadSchema);
export default Upload;
