import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { resolveTenant, requireTenant, requirePermission, requireRoleLevel } from '../middleware/tenant.js';
import organizationController from '../controllers/organizationController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// All organization routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/organizations
 * @desc    Create new organization
 * @access  Private
 */
router.post('/', organizationController.create);

/**
 * @route   GET /api/organizations
 * @desc    Get user's organizations
 * @access  Private
 */
router.get('/', organizationController.getMyOrganizations);

/**
 * @route   GET /api/organizations/:id
 * @desc    Get organization details
 * @access  Private (Organization Member)
 */
router.get('/:id', resolveTenant, requireTenant, organizationController.getById);

/**
 * @route   PATCH /api/organizations/:id
 * @desc    Update organization
 * @access  Private (Admin, Owner)
 */
router.patch('/:id', resolveTenant, requireTenant, requireRoleLevel('admin'), organizationController.update);

/**
 * @route   DELETE /api/organizations/:id
 * @desc    Delete organization
 * @access  Private (Owner only)
 */
router.delete('/:id', resolveTenant, requireTenant, requireRoleLevel('owner'), organizationController.delete);

/**
 * @route   GET /api/organizations/:id/members
 * @desc    Get organization members
 * @access  Private (Organization Member)
 */
router.get('/:id/members', resolveTenant, requireTenant, organizationController.getMembers);

/**
 * @route   POST /api/organizations/:id/members
 * @desc    Invite member to organization
 * @access  Private (Admin, Owner, Manager)
 */
router.post('/:id/members', resolveTenant, requireTenant, requirePermission('canInviteUsers'), organizationController.inviteMember);

/**
 * @route   PATCH /api/organizations/:id/members/:memberId
 * @desc    Update member role/permissions
 * @access  Private (Admin, Owner)
 */
router.patch('/:id/members/:memberId', resolveTenant, requireTenant, requireRoleLevel('admin'), organizationController.updateMember);

/**
 * @route   DELETE /api/organizations/:id/members/:memberId
 * @desc    Remove member from organization
 * @access  Private (Admin, Owner)
 */
router.delete('/:id/members/:memberId', resolveTenant, requireTenant, requireRoleLevel('admin'), organizationController.removeMember);

/**
 * @route   POST /api/organizations/:id/leave
 * @desc    Leave organization (member self-removal)
 * @access  Private (Organization Member)
 */
router.post('/:id/leave', resolveTenant, requireTenant, organizationController.leave);

/**
 * @route   GET /api/organizations/:id/settings
 * @desc    Get organization settings
 * @access  Private (Organization Member)
 */
router.get('/:id/settings', resolveTenant, requireTenant, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      settings: req.organization?.settings,
      features: req.organization?.features,
      plan: req.organization?.plan,
    },
  });
}));

/**
 * @route   PATCH /api/organizations/:id/settings
 * @desc    Update organization settings
 * @access  Private (Admin, Owner)
 */
router.patch('/:id/settings', resolveTenant, requireTenant, requireRoleLevel('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const Organization = (await import('../models/Organization.js')).default;
  
  const organization = await Organization.findByIdAndUpdate(
    req.organization?.id,
    {
      $set: {
        'settings': { ...req.organization?.settings, ...req.body },
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  res.json({
    success: true,
    data: organization?.settings,
  });
}));

export default router;
