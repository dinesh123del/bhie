import mongoose from 'mongoose';

export interface OrganizationMemberDocument extends mongoose.Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions: {
    canViewRecords: boolean;
    canCreateRecords: boolean;
    canEditRecords: boolean;
    canDeleteRecords: boolean;
    canViewAnalytics: boolean;
    canManageMembers: boolean;
    canManageSettings: boolean;
    canManageBilling: boolean;
    canUseAI: boolean;
    canExportData: boolean;
    canInviteUsers: boolean;
  };
  invitedBy?: mongoose.Types.ObjectId;
  joinedAt: Date;
  lastActiveAt?: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  department?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  hasPermission(permission: keyof OrganizationMemberDocument['permissions']): boolean;
  updateLastActive(): Promise<void>;
}

const organizationMemberSchema = new mongoose.Schema<OrganizationMemberDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member', 'viewer'],
      default: 'member',
    },
    permissions: {
      canViewRecords: { type: Boolean, default: true },
      canCreateRecords: { type: Boolean, default: true },
      canEditRecords: { type: Boolean, default: false },
      canDeleteRecords: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
      canManageMembers: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManageBilling: { type: Boolean, default: false },
      canUseAI: { type: Boolean, default: true },
      canExportData: { type: Boolean, default: false },
      canInviteUsers: { type: Boolean, default: false },
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'active',
    },
    department: String,
    title: String,
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique membership (organizationId/userId have index: true)
organizationMemberSchema.index({ userId: 1, status: 1 });
organizationMemberSchema.index({ organizationId: 1, role: 1 });

// Role-based permission presets
const rolePermissions = {
  owner: {
    canViewRecords: true,
    canCreateRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canViewAnalytics: true,
    canManageMembers: true,
    canManageSettings: true,
    canManageBilling: true,
    canUseAI: true,
    canExportData: true,
    canInviteUsers: true,
  },
  admin: {
    canViewRecords: true,
    canCreateRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canViewAnalytics: true,
    canManageMembers: true,
    canManageSettings: true,
    canManageBilling: false,
    canUseAI: true,
    canExportData: true,
    canInviteUsers: true,
  },
  manager: {
    canViewRecords: true,
    canCreateRecords: true,
    canEditRecords: true,
    canDeleteRecords: false,
    canViewAnalytics: true,
    canManageMembers: true,
    canManageSettings: false,
    canManageBilling: false,
    canUseAI: true,
    canExportData: true,
    canInviteUsers: true,
  },
  member: {
    canViewRecords: true,
    canCreateRecords: true,
    canEditRecords: false,
    canDeleteRecords: false,
    canViewAnalytics: true,
    canManageMembers: false,
    canManageSettings: false,
    canManageBilling: false,
    canUseAI: true,
    canExportData: false,
    canInviteUsers: false,
  },
  viewer: {
    canViewRecords: true,
    canCreateRecords: false,
    canEditRecords: false,
    canDeleteRecords: false,
    canViewAnalytics: true,
    canManageMembers: false,
    canManageSettings: false,
    canManageBilling: false,
    canUseAI: false,
    canExportData: false,
    canInviteUsers: false,
  },
};

// Pre-save middleware to set permissions based on role
organizationMemberSchema.pre('save', function (next) {
  if (this.isModified('role') || this.isNew) {
    this.permissions = { ...rolePermissions[this.role] };
  }
  next();
});

// Methods
organizationMemberSchema.methods.hasPermission = function (
  this: OrganizationMemberDocument,
  permission: keyof OrganizationMemberDocument['permissions']
): boolean {
  return this.permissions[permission] === true;
};

organizationMemberSchema.methods.updateLastActive = async function (
  this: OrganizationMemberDocument
): Promise<void> {
  this.lastActiveAt = new Date();
  await this.save();
};

const OrganizationMember = mongoose.model<OrganizationMemberDocument>('OrganizationMember', organizationMemberSchema);
export default OrganizationMember;
