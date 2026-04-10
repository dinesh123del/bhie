import express from 'express';
import Company from '../models/Company.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
const router = express.Router();
router.use(authenticateToken);
router.post('/setup', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const data = req.body;
    if (!data.name || !data.industry || data.revenue <= 0 || data.expenses < 0 || data.employees < 1) {
        throw new AppError(400, 'Invalid input data');
    }
    const profit = data.revenue - data.expenses;
    const profitMargin = data.revenue > 0 ? Math.round((profit / data.revenue) * 100 * 100) / 100 : 0;
    let status = 'RISK';
    if (profitMargin > 20) {
        status = 'HEALTHY';
    }
    else if (profitMargin > 5) {
        status = 'MODERATE';
    }
    const company = await Company.findOneAndUpdate({ userId: user.userId }, {
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
    }, { upsert: true, new: true, runValidators: true });
    res.json({
        success: true,
        message: 'Company setup complete',
        company: {
            id: company._id,
            ...company.toObject(),
            _id: undefined,
        },
    });
}));
router.get('/', asyncHandler(async (req, res) => {
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
}));
export default router;
