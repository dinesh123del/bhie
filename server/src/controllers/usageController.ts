import { Request, Response } from 'express';
import usageBillingService from '../services/usageBillingService.js';

// Get current usage stats for the user
export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { organizationId } = req.query;

    const stats = await usageBillingService.getUsageStats(
      userId,
      organizationId as string | undefined
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage stats',
    });
  }
};

// Get detailed usage history
export const getUsageHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { type, page = 1, limit = 50 } = req.query;

    // This would require a more detailed query to UsageCredit model
    // For now, return basic stats
    const stats = await usageBillingService.getUsageStats(userId);

    res.json({
      success: true,
      data: {
        stats,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get usage history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage history',
    });
  }
};

// Get current billing period summary
export const getBillingSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const summary = await usageBillingService.getBillingSummary(
      userId,
      startOfMonth,
      endOfMonth
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get billing summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing summary',
    });
  }
};

// Purchase additional credits
export const purchaseCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { type, amount, paymentMethod } = req.body;

    if (!type || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Usage type and amount are required',
      });
    }

    // Calculate cost
    const { OVERAGE_PRICING } = await import('../services/usageBillingService.js');
    const cost = amount * OVERAGE_PRICING[type];

    // Payment integration placeholder: Integrate with payment provider (Stripe/Razorpay)
    // For now, credits are added directly for testing purposes
    // TODO: Add actual payment flow with payment gateway integration

    const added = await usageBillingService.addCredits(
      userId,
      type,
      amount,
      `Purchased ${amount} ${type} credits`,
      { purchased: true, pricePerUnit: OVERAGE_PRICING[type] }
    );

    if (added) {
      res.json({
        success: true,
        data: {
          type,
          amount,
          cost,
          currency: 'USD',
        },
        message: `Successfully purchased ${amount} ${type} credits`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to add credits',
      });
    }
  } catch (error) {
    console.error('Purchase credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase credits',
    });
  }
};

// Check if user can perform an action
export const checkUsageLimit = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { type, amount = 1 } = req.params;

    const canUse = await usageBillingService.canUse(userId, type as any, parseInt(amount as string));
    const balance = await usageBillingService.getBalance(userId, type as any);
    const limit = await usageBillingService.getPlanLimit(userId, type as any);

    res.json({
      success: true,
      data: {
        canUse,
        balance,
        limit,
        type,
      },
    });
  } catch (error) {
    console.error('Check usage limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage limit',
    });
  }
};
