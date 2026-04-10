import { Types } from 'mongoose';
import Organization from '../models/Organization.js';
import OrganizationMember from '../models/OrganizationMember.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
import logger from '../utils/logger.js';
// Helper to generate unique slug
const generateSlug = (name) => {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const random = Math.random().toString(36).substring(2, 6);
    return `${base}-${random}`;
};
export const organizationController = {
    /**
     * Create new organization
     */
    create: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        const { name, description, industry, size, website } = req.body;
        if (!name) {
            throw new AppError(400, 'Organization name is required');
        }
        // Generate unique slug
        let slug = generateSlug(name);
        let attempts = 0;
        while (await Organization.findOne({ slug })) {
            slug = generateSlug(`${name}-${attempts}`);
            attempts++;
            if (attempts > 10) {
                throw new AppError(500, 'Could not generate unique slug');
            }
        }
        // Get user details for billing email
        const owner = await User.findById(user.userId).select('email');
        // Create organization
        const organization = await Organization.create({
            name,
            slug,
            description,
            industry,
            size: size || '1-10',
            website,
            ownerId: new Types.ObjectId(user.userId),
            billing: {
                email: owner?.email || '',
            },
            memberIds: [new Types.ObjectId(user.userId)],
        });
        // Create owner membership
        await OrganizationMember.create({
            organizationId: organization._id,
            userId: new Types.ObjectId(user.userId),
            role: 'owner',
            status: 'active',
        });
        logger.info('Organization created', {
            organizationId: organization._id,
            userId: user.userId,
            slug,
        });
        res.status(201).json({
            success: true,
            data: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                plan: organization.plan,
                role: 'owner',
            },
        });
    }),
    /**
     * Get user's organizations
     */
    getMyOrganizations: asyncHandler(async (req, res) => {
        const user = requireUser(req);
        // Get all active memberships
        const memberships = await OrganizationMember.find({
            userId: new Types.ObjectId(user.userId),
            status: { $in: ['active', 'pending'] },
        }).populate('organizationId');
        const organizations = memberships.map((membership) => {
            const org = membership.organizationId;
            return {
                id: org._id,
                name: org.name,
                slug: org.slug,
                logo: org.logo,
                plan: org.plan,
                role: membership.role,
                status: membership.status,
                settings: org.settings,
            };
        });
        res.json({
            success: true,
            count: organizations.length,
            data: organizations,
        });
    }),
    /**
     * Get single organization details
     */
    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = requireUser(req);
        const organization = await Organization.findById(id);
        if (!organization) {
            throw new AppError(404, 'Organization not found');
        }
        // Check membership
        const membership = await OrganizationMember.findOne({
            organizationId: organization._id,
            userId: new Types.ObjectId(user.userId),
            status: 'active',
        });
        if (!membership) {
            throw new AppError(403, 'You are not a member of this organization');
        }
        // Get member count
        const memberCount = await OrganizationMember.countDocuments({
            organizationId: organization._id,
            status: 'active',
        });
        res.json({
            success: true,
            data: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                description: organization.description,
                logo: organization.logo,
                website: organization.website,
                industry: organization.industry,
                size: organization.size,
                plan: organization.plan,
                subscriptionStatus: organization.subscriptionStatus,
                trialEndsAt: organization.trialEndsAt,
                features: organization.features,
                settings: organization.settings,
                memberCount,
                myRole: membership.role,
                createdAt: organization.createdAt,
            },
        });
    }),
    /**
     * Update organization
     */
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = requireUser(req);
        const updates = req.body;
        // Check permissions
        const membership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
            status: 'active',
            role: { $in: ['owner', 'admin'] },
        });
        if (!membership) {
            throw new AppError(403, 'Only owners and admins can update organization');
        }
        const organization = await Organization.findByIdAndUpdate(id, {
            $set: {
                ...updates,
                updatedAt: new Date(),
            },
        }, { new: true, runValidators: true });
        if (!organization) {
            throw new AppError(404, 'Organization not found');
        }
        res.json({
            success: true,
            data: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                updatedAt: organization.updatedAt,
            },
        });
    }),
    /**
     * Get organization members
     */
    getMembers: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = requireUser(req);
        // Check view permission
        const membership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
            status: 'active',
        });
        if (!membership) {
            throw new AppError(403, 'Access denied');
        }
        if (!membership.hasPermission('canViewRecords')) {
            throw new AppError(403, 'Permission denied');
        }
        const members = await OrganizationMember.find({
            organizationId: new Types.ObjectId(id),
        }).populate('userId', 'name email profilePic');
        const data = members.map((m) => ({
            id: m._id,
            user: m.userId,
            role: m.role,
            status: m.status,
            permissions: m.permissions,
            department: m.department,
            title: m.title,
            joinedAt: m.joinedAt,
            lastActiveAt: m.lastActiveAt,
        }));
        res.json({
            success: true,
            count: data.length,
            data,
        });
    }),
    /**
     * Invite member to organization
     */
    inviteMember: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = requireUser(req);
        const { email, role, department, title } = req.body;
        if (!email || !role) {
            throw new AppError(400, 'Email and role are required');
        }
        // Check invite permission
        const inviterMembership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
            status: 'active',
        });
        if (!inviterMembership || !inviterMembership.hasPermission('canInviteUsers')) {
            throw new AppError(403, 'You do not have permission to invite members');
        }
        const organization = await Organization.findById(id);
        if (!organization) {
            throw new AppError(404, 'Organization not found');
        }
        // Check if can add member
        if (!organization.canAddMember()) {
            throw new AppError(403, 'Organization member limit reached. Please upgrade your plan.');
        }
        // Find or create user
        let invitee = await User.findOne({ email });
        if (!invitee) {
            // Create placeholder user (will need to complete registration)
            invitee = await User.create({
                email,
                name: email.split('@')[0],
                role: 'user',
                isActive: false, // Inactive until registration
            });
        }
        // Check if already member
        const existingMember = await OrganizationMember.findOne({
            organizationId: organization._id,
            userId: invitee._id,
        });
        if (existingMember) {
            throw new AppError(400, 'User is already a member of this organization');
        }
        // Create membership
        const newMember = await OrganizationMember.create({
            organizationId: organization._id,
            userId: invitee._id,
            role,
            status: 'pending',
            invitedBy: new Types.ObjectId(user.userId),
            department,
            title,
        });
        // Add to organization's member list
        organization.memberIds.push(invitee._id);
        await organization.save();
        logger.info('Member invited', {
            organizationId: id,
            invitedBy: user.userId,
            inviteeId: invitee._id,
            role,
        });
        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                id: newMember._id,
                email: invitee.email,
                role,
                status: 'pending',
            },
        });
    }),
    /**
     * Update member role
     */
    updateMember: asyncHandler(async (req, res) => {
        const { id, memberId } = req.params;
        const user = requireUser(req);
        const { role, status, department, title } = req.body;
        // Check permission
        const membership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
            status: 'active',
            role: { $in: ['owner', 'admin'] },
        });
        if (!membership) {
            throw new AppError(403, 'Only owners and admins can manage members');
        }
        // Cannot modify owner (except owner themselves)
        const targetMember = await OrganizationMember.findById(memberId);
        if (!targetMember) {
            throw new AppError(404, 'Member not found');
        }
        if (targetMember.role === 'owner' && membership.role !== 'owner') {
            throw new AppError(403, 'Cannot modify owner role');
        }
        // Update member
        const updated = await OrganizationMember.findByIdAndUpdate(memberId, {
            $set: {
                ...(role && { role }),
                ...(status && { status }),
                ...(department && { department }),
                ...(title && { title }),
                updatedAt: new Date(),
            },
        }, { new: true });
        res.json({
            success: true,
            data: updated,
        });
    }),
    /**
     * Remove member from organization
     */
    removeMember: asyncHandler(async (req, res) => {
        const { id, memberId } = req.params;
        const user = requireUser(req);
        // Check permission
        const membership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
            status: 'active',
            role: { $in: ['owner', 'admin'] },
        });
        const isSelfRemoval = memberId === membership?._id.toString();
        if (!isSelfRemoval && !membership) {
            throw new AppError(403, 'Permission denied');
        }
        const targetMember = await OrganizationMember.findById(memberId);
        if (!targetMember) {
            throw new AppError(404, 'Member not found');
        }
        // Cannot remove owner
        if (targetMember.role === 'owner') {
            throw new AppError(403, 'Cannot remove organization owner');
        }
        // Remove membership
        await OrganizationMember.findByIdAndDelete(memberId);
        // Remove from organization's member list
        await Organization.findByIdAndUpdate(id, {
            $pull: { memberIds: targetMember.userId },
        });
        res.json({
            success: true,
            message: 'Member removed successfully',
        });
    }),
    /**
     * Leave organization
     */
    leave: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = requireUser(req);
        const membership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
        });
        if (!membership) {
            throw new AppError(404, 'Membership not found');
        }
        // Owner cannot leave, must transfer ownership or delete org
        if (membership.role === 'owner') {
            throw new AppError(400, 'Owner cannot leave organization. Transfer ownership or delete organization.');
        }
        await OrganizationMember.findByIdAndDelete(membership._id);
        // Remove from organization's member list
        await Organization.findByIdAndUpdate(id, {
            $pull: { memberIds: new Types.ObjectId(user.userId) },
        });
        res.json({
            success: true,
            message: 'You have left the organization',
        });
    }),
    /**
     * Delete organization
     */
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = requireUser(req);
        // Only owner can delete
        const membership = await OrganizationMember.findOne({
            organizationId: new Types.ObjectId(id),
            userId: new Types.ObjectId(user.userId),
            role: 'owner',
        });
        if (!membership) {
            throw new AppError(403, 'Only owner can delete organization');
        }
        // Delete all memberships
        await OrganizationMember.deleteMany({
            organizationId: new Types.ObjectId(id),
        });
        // Delete organization
        await Organization.findByIdAndDelete(id);
        logger.info('Organization deleted', {
            organizationId: id,
            deletedBy: user.userId,
        });
        res.json({
            success: true,
            message: 'Organization deleted successfully',
        });
    }),
};
export default organizationController;
