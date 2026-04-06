import { Request } from 'express';

export type UserRole = 'admin' | 'user' | 'ca';

export interface AuthenticatedUser {
  userId: string;
  id: string;
  role: UserRole;
}

export type AuthRequest = Request & {
  user?: AuthenticatedUser;
};

export type PlanType = 'free' | 'pro' | 'premium';

export interface Record {
  title: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description?: string;
  status: string;
  fileUrl?: string;
  userId: string;
  // 📜 CA Certification Fields
  isCertified?: boolean;
  certifiedBy?: string; // CA User ID
  certificationDate?: Date;
  auditNotes?: string;
}

export interface Alert {
  _id: string;
  userId: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  message: string;
  isRead: boolean;
  data?: globalThis.Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}
