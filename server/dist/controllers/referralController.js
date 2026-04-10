import crypto from 'crypto';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
// Generate unique referral code
function generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}
// Create a new referral invite
export const createReferral = async (req, res) => {
    try {
        const { refereeEmail } = req.body;
        const referrerId = req.user.userId;
        if (!refereeEmail) {
            return res.status(400).json({
                success: false,
                message: 'Referee email is required',
            });
        }
        // Check if referee already has an account
        const existingUser = await User.findOne({ email: refereeEmail.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'This email already has an account',
            });
        }
        // Check for existing pending referral to this email
        const existingReferral = await Referral.findOne({
            referrerId,
            refereeEmail: refereeEmail.toLowerCase(),
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });
        if (existingReferral) {
            return res.json({
                success: true,
                data: {
                    referralCode: existingReferral.code,
                    referralLink: `${process.env.CLIENT_URL}/register?ref=${existingReferral.code}`,
                    message: 'Referral already exists',
                },
            });
        }
        // Create new referral
        const code = generateReferralCode();
        const referral = new Referral({
            referrerId,
            refereeEmail: refereeEmail.toLowerCase(),
            code,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        await referral.save();
        res.status(201).json({
            success: true,
            data: {
                referralCode: code,
                referralLink: `${process.env.CLIENT_URL}/register?ref=${code}`,
                expiresAt: referral.expiresAt,
            },
        });
    }
    catch (error) {
        console.error('Create referral error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create referral',
        });
    }
};
// Get user's referral stats and links
export const getReferralStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const referrals = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 });
        const stats = {
            totalSent: referrals.length,
            pending: referrals.filter(r => r.status === 'pending').length,
            converted: referrals.filter(r => r.status === 'converted').length,
            rewardsEarned: referrals.filter(r => r.status === 'converted' && r.rewardGiven).length,
            totalXP: referrals.filter(r => r.status === 'converted').length * 500,
        };
        // Generate user's personal referral code if they don't have one
        const personalCode = `USER${userId.toString().slice(-6).toUpperCase()}`;
        res.json({
            success: true,
            data: {
                stats,
                referrals: referrals.map(r => ({
                    id: r._id,
                    refereeEmail: r.refereeEmail,
                    status: r.status,
                    code: r.code,
                    createdAt: r.createdAt,
                    convertedAt: r.convertedAt,
                    rewardGiven: r.rewardGiven,
                })),
                referralLink: `${process.env.CLIENT_URL}/register?ref=${personalCode}`,
            },
        });
    }
    catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get referral stats',
        });
    }
};
// Validate referral code (for registration)
export const validateReferralCode = async (req, res) => {
    try {
        const { code } = req.params;
        const referral = await Referral.findOne({
            code: code.toUpperCase(),
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });
        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired referral code',
            });
        }
        res.json({
            success: true,
            data: {
                valid: true,
                referrerId: referral.referrerId,
                discount: referral.refereeDiscount,
            },
        });
    }
    catch (error) {
        console.error('Validate referral error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate referral code',
        });
    }
};
// Convert referral (called when new user registers)
export const convertReferral = async (req, res) => {
    try {
        const { code, newUserId, newUserEmail } = req.body;
        const referral = await Referral.findOne({
            code: code.toUpperCase(),
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });
        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired referral code',
            });
        }
        // Update referral
        referral.status = 'converted';
        referral.refereeId = newUserId;
        referral.convertedAt = new Date();
        await referral.save();
        // Grant reward to referrer
        const referrer = await User.findById(referral.referrerId);
        if (referrer) {
            // Extend their plan by 1 month or give credits
            if (referrer.planExpiry && referrer.plan !== 'free') {
                referrer.planExpiry.setMonth(referrer.planExpiry.getMonth() + 1);
            }
            else if (referrer.plan === 'free') {
                // Upgrade to pro for 1 month
                referrer.plan = 'pro';
                referrer.isPremium = true;
                referrer.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            }
            await referrer.save();
        }
        referral.rewardGiven = true;
        await referral.save();
        res.json({
            success: true,
            data: {
                converted: true,
                discountApplied: referral.refereeDiscount,
            },
        });
    }
    catch (error) {
        console.error('Convert referral error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process referral',
        });
    }
};
// Get pre-written social shares
export const getSocialShares = async (req, res) => {
    try {
        const userId = req.user.userId;
        const personalCode = `USER${userId.slice(-6).toUpperCase()}`;
        const referralLink = `${process.env.CLIENT_URL}/register?ref=${personalCode}`;
        const shares = {
            twitter: `I just found the ultimate AI business analytics tool. Get 50% off your first month with my link: ${referralLink} #BusinessIntelligence #AI`,
            linkedin: `Managing business finances just got easier. I've been using Biz Plus for AI-powered business insights and receipt scanning. Get 50% off your first month: ${referralLink}`,
            email: {
                subject: 'Get 50% off Biz Plus - AI Business Analytics',
                body: `Hey!\n\nI've been using Biz Plus for business analytics and receipt scanning with AI. It's been a game-changer.\n\nGet 50% off your first month with my referral link: ${referralLink}\n\nCheers!`,
            },
        };
        res.json({
            success: true,
            data: shares,
        });
    }
    catch (error) {
        console.error('Get social shares error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate social shares',
        });
    }
};
