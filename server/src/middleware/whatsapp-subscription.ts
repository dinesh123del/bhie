import { Request, Response, NextFunction } from 'express';
import WhatsAppSubscription from '../models/WhatsAppSubscription.js';
import { SubscriptionPlanService } from '../services/subscription-plan-service.js';

export interface WhatsAppRequest extends Request {
  whatsappSubscription?: any;
  hasActiveSubscription?: boolean;
}

export async function checkWhatsAppSubscription(
  req: WhatsAppRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const phoneNumber = req.headers['x-whatsapp-phone'] as string;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'WhatsApp phone number required' });
    }

    const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
    
    if (!subscription) {
      req.hasActiveSubscription = false;
      return res.status(403).json({ 
        error: 'No subscription found',
        message: 'Please subscribe to access this feature'
      });
    }

    if (!subscription.isActive()) {
      req.hasActiveSubscription = false;
      return res.status(403).json({ 
        error: 'Subscription expired',
        message: 'Your subscription has expired. Please renew to continue.'
      });
    }

    req.whatsappSubscription = subscription;
    req.hasActiveSubscription = true;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
}

export async function checkWhatsAppPlanAccess(
  requiredPlan: 'basic' | 'pro' | 'premium',
  req: WhatsAppRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const phoneNumber = req.headers['x-whatsapp-phone'] as string;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'WhatsApp phone number required' });
    }

    const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
    
    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({ 
        error: 'No active subscription',
        message: 'Please subscribe to access this feature'
      });
    }

    const planHierarchy = { basic: 1, pro: 2, premium: 3 };
    const userLevel = planHierarchy[subscription.plan] || 0;
    const requiredLevel = planHierarchy[requiredPlan] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Plan upgrade required',
        message: `This feature requires ${requiredPlan} plan or higher`,
        currentPlan: subscription.plan,
        requiredPlan
      });
    }

    req.whatsappSubscription = subscription;
    req.hasActiveSubscription = true;
    next();
  } catch (error) {
    console.error('Plan access check error:', error);
    res.status(500).json({ error: 'Failed to check plan access' });
  }
}

export async function checkUsageLimits(
  feature: 'messages' | 'aiQueries' | 'receipts' | 'reports',
  req: WhatsAppRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const phoneNumber = req.headers['x-whatsapp-phone'] as string;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'WhatsApp phone number required' });
    }

    const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
    
    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({ 
        error: 'No active subscription',
        message: 'Please subscribe to access this feature'
      });
    }

    const plan = SubscriptionPlanService.getPlan(subscription.plan);
    if (!plan) {
      return res.status(500).json({ error: 'Invalid plan configuration' });
    }

    const limit = plan.limits[feature];
    
    if (limit === Infinity) {
      req.whatsappSubscription = subscription;
      req.hasActiveSubscription = true;
      return next();
    }

    const currentUsage = await getCurrentUsage(phoneNumber, feature);
    
    if (currentUsage >= limit) {
      return res.status(429).json({ 
        error: 'Usage limit exceeded',
        message: `You have reached your ${feature} limit for this month`,
        limit,
        currentUsage,
        resetDate: subscription.expiryDate
      });
    }

    req.whatsappSubscription = subscription;
    req.hasActiveSubscription = true;
    next();
  } catch (error) {
    console.error('Usage limits check error:', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
}

async function getCurrentUsage(phoneNumber: string, feature: string): Promise<number> {
  return 0;
}

export async function optionalWhatsAppSubscription(
  req: WhatsAppRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const phoneNumber = req.headers['x-whatsapp-phone'] as string;
    
    if (phoneNumber) {
      const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
      req.whatsappSubscription = subscription;
      req.hasActiveSubscription = subscription ? subscription.isActive() : false;
    } else {
      req.hasActiveSubscription = false;
    }
    
    next();
  } catch (error) {
    console.error('Optional subscription check error:', error);
    req.hasActiveSubscription = false;
    next();
  }
}
