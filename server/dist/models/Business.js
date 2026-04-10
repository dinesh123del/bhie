import mongoose, { Schema } from 'mongoose';
import User from './User.js';
const BusinessSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    name: { type: String, required: true, trim: true },
    whatsappPhone: {
        type: String,
        trim: true,
        sparse: true,
        index: true
    }
}, {
    timestamps: true
});
BusinessSchema.statics.findByPhone = async function (phone) {
    return this.findOne({ whatsappPhone: phone });
};
BusinessSchema.statics.linkPhoneByEmail = async function (email, phone) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
        return false;
    await this.findOneAndUpdate({ userId: user._id }, {
        userId: user._id,
        name: user.name,
        whatsappPhone: phone
    }, { upsert: true, new: true });
    return true;
};
const Business = mongoose.model('Business', BusinessSchema);
export { Business };
export default Business;
