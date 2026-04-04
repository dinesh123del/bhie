import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { FREE_UPLOAD_LIMIT } from '../utils/planConfig.js';
const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    plan: {
        type: String,
        enum: ['free', '59', '119'],
        default: 'free',
    },
    planExpiry: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    recordCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
userSchema.methods.hasPremiumAccess = function () {
    if (this.plan === 'free') {
        return false;
    }
    if (!this.isActive || !this.planExpiry) {
        return false;
    }
    return this.planExpiry.getTime() > Date.now();
};
userSchema.methods.getEffectivePlan = function () {
    return this.hasPremiumAccess() ? this.plan : 'free';
};
userSchema.methods.refreshSubscriptionStatus = async function () {
    let shouldSave = false;
    if (this.plan === 'free') {
        if (!this.isActive) {
            this.isActive = true;
            shouldSave = true;
        }
        if (this.planExpiry) {
            this.planExpiry = undefined;
            shouldSave = true;
        }
    }
    else {
        const isExpired = !this.planExpiry || this.planExpiry.getTime() <= Date.now();
        if (isExpired) {
            this.plan = 'free';
            this.planExpiry = undefined;
            shouldSave = true;
        }
        if (!this.isActive) {
            this.isActive = true;
            shouldSave = true;
        }
    }
    if (shouldSave) {
        await this.save();
    }
};
userSchema.methods.canCreateRecord = function () {
    if (this.hasPremiumAccess()) {
        return true;
    }
    return (this.recordCount || 0) < FREE_UPLOAD_LIMIT;
};
userSchema.methods.incrementRecordCount = async function () {
    this.recordCount = (this.recordCount || 0) + 1;
    await this.save();
};
userSchema.methods.decrementRecordCount = async function () {
    this.recordCount = Math.max(0, (this.recordCount || 0) - 1);
    await this.save();
};
userSchema.methods.resetRecordCount = async function () {
    this.recordCount = 0;
    await this.save();
};
userSchema.methods.upgradePlan = async function (plan) {
    const now = new Date();
    // Set expiry to 30 days from now for monthly plans
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.plan = plan;
    this.planExpiry = expiryDate;
    this.isActive = true;
    this.recordCount = 0;
    await this.save();
};
userSchema.pre('save', async function (next) {
    if (!this.password) {
        next();
        return;
    }
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model('User', userSchema);
export default User;
