import { RequestHandler } from 'express';
import Organization from '../models/Organization.js';
import OrganizationMember from '../models/OrganizationMember.js';
import { AppError } from '../utils/appError.js';
import { AuthRequest } from '../types/index.js';
import { requireUser } from '../utils/request.js';

// Extend AuthRequest to include tenant info
declare global {
  namespace Express {
    interface Request {
      organization?: {
        id: string;
        slug: string;
        name: string;
        plan: string;
        features: Record<string, any>;
        settings: Record<string, any>;
      };
      membership?: {
        id: string;
        role: string;
        permissions: Record<string, boolean>;
        department?: string;
        title?: string;
      };
    }
  }
}

/**
 * SaaS Multi-tenancy Middleware
 * Extracts organization context from request and validates access
 */
export const resolveTenant: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    // Get user from auth middleware (must run after authenticateToken)
    const user = requireUser(req);
    
    // Try to get organization from header, query, or cookie
    const orgId = req.headers['x-organization-id'] as string || req.query.orgId as string;
    const orgSlug = req.headers['x-organization-slug'] as string || req.query.orgSlug as string;
    
    // If no organization specified, use user's personal context
    if (!orgId && !orgSlug) {
      // Check if user has a default organization
      const defaultMember = await OrganizationMember.findOne({
        userId: user.userId,
        status: 'active',
      }).sort({ createdAt: 1 }).populate('organizationId');
      
      if (defaultMember && defaultMember.organizationId) {
        const org = defaultMember.organizationId as any;
        
        req.organization = {
          id: org._id.toString(),
          slug: org.slug,
          name: org.name,
          plan: org.plan,
          features: org.features,
          settings: org.settings,
        };
        
        req.membership = {
          id: defaultMember._id.toString(),
          role: defaultMember.role,
          permissions: defaultMember.permissions,
          department: defaultMember.department,
          title: defaultMember.title,
        };
      }
      
      return next();
    }
    
    // Find organization by ID or slug
    const query = orgId ? { _id: orgId } : { slug: orgSlug };
    const organization = await Organization.findOne(query);
    
    if (!organization) {
      return next(new AppError(404, 'Organization not found'));
    }
    
    // Check if organization is active
    if (!organization.isActive) {
      return next(new AppError(403, 'Organization is suspended'));
    }
    
    // Verify user is a member of this organization
    const membership = await OrganizationMember.findOne({
      organizationId: organization._id,
      userId: user.userId,
      status: { $in: ['active', 'pending'] },
    });
    
    if (!membership) {
      return next(new AppError(403, 'You are not a member of this organization'));
    }
    
    if (membership.status === 'pending') {
      return next(new AppError(403, 'Your membership is pending approval'));
    }
    
    // Set tenant context on request
    req.organization = {
      id: organization._id.toString(),
      slug: organization.slug,
      name: organization.name,
      plan: organization.plan,
      features: organization.features,
      settings: organization.settings,
    };
    
    req.membership = {
      id: membership._id.toString(),
      role: membership.role,
      permissions: membership.permissions,
      department: membership.department,
      title: membership.title,
    };
    
    // Update last active timestamp (non-blocking)
    membership.updateLastActive().catch(() => {});
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require organization context
 */
export const requireTenant: RequestHandler = (req: AuthRequest, res, next) => {
  if (!req.organization) {
    return next(new AppError(403, 'Organization context required'));
  }
  next();
};

/**
 * Middleware factory to check specific permission
 */
export const requirePermission = (permission: string): RequestHandler => {
  return (req: AuthRequest, res, next) => {
    if (!req.membership) {
      return next(new AppError(403, 'Membership context required'));
    }
    
    const hasPermission = req.membership.permissions[permission] === true;
    
    if (!hasPermission) {
      return next(new AppError(403, `Permission denied: ${permission}`));
    }
    
    next();
  };
};

/**
 * Middleware factory to check role level
 * Roles hierarchy: owner > admin > manager > member > viewer
 */
const roleHierarchy = ['owner', 'admin', 'manager', 'member', 'viewer'];

export const requireRoleLevel = (minRole: string): RequestHandler => {
  return (req: AuthRequest, res, next) => {
    if (!req.membership) {
      return next(new AppError(403, 'Membership context required'));
    }
    
    const userRoleIndex = roleHierarchy.indexOf(req.membership.role);
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    
    if (userRoleIndex > minRoleIndex) {
      return next(new AppError(403, `Role ${minRole} or higher required`));
    }
    
    next();
  };
};

/**
 * Middleware to require specific organization feature
 */
export const requireFeature = (feature: string): RequestHandler => {
  return (req: AuthRequest, res, next) => {
    if (!req.organization) {
      return next(new AppError(403, 'Organization context required'));
    }
    
    const hasFeature = req.organization.features[feature] === true;
    
    if (!hasFeature) {
      return next(new AppError(403, `Feature ${feature} not available in your plan`));
    }
    
    next();
  };
};

/**
 * Middleware factory to require organization plan level
 */
export const requirePlan = (plans: string[]): RequestHandler => {
  return (req: AuthRequest, res, next) => {
    if (!req.organization) {
      return next(new AppError(403, 'Organization context required'));
    }
    
    if (!plans.includes(req.organization.plan)) {
      return next(new AppError(403, `This feature requires plan: ${plans.join(' or ')}`));
    }
    
    next();
  };
};
