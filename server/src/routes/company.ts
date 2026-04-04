import express, { Response } from 'express';
import Company from '../models/Company';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AppError } from '../utils/appError';
import { requireUser } from '../utils/request';

interface CompanyData {
  name: string;
  industry: string;
  revenue: number;
  expenses: number;
  employees: number;
  growthRate: number;
  location?: string;
  logo?: string;
}

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/setup',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const data = req.body as CompanyData;

    if (!data.name || !data.industry || data.revenue <= 0 || data.expenses < 0 || data.employees < 1) {
      throw new AppError(400, 'Invalid input data');
    }

    const profit = data.revenue - data.expenses;
    const profitMargin =
      data.revenue > 0 ? Math.round((profit / data.revenue) * 100 * 100) / 100 : 0;

    let status: 'HEALTHY' | 'MODERATE' | 'RISK' = 'RISK';
    if (profitMargin > 20) {
      status = 'HEALTHY';
    } else if (profitMargin > 5) {
      status = 'MODERATE';
    }

    const company = await Company.findOneAndUpdate(
      { userId: user.userId },
      {
        userId: user.userId,
        name: data.name,
        industry: data.industry,
        revenue: data.revenue,
        expenses: data.expenses,
        employees: data.employees,
        growthRate: data.growthRate,
        profit,
        profitMargin,
        status,
        location: data.location,
        logo: data.logo,
        insights: ['Company setup complete', 'Ready for AI analysis'],
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Company setup complete',
      company: {
        id: company._id,
        ...company.toObject(),
        _id: undefined,
      },
    });
  })
);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const company = await Company.findOne({ userId: user.userId });

    if (!company) {
      res.json({ company: null });
      return;
    }

    res.json({
      success: true,
      company: company.toObject(),
    });
  })
);

export default router;
