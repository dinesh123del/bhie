import express, { Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import BusinessRecord from '../models/Record.js';
import DailySummary from '../models/DailySummary.js';
import { AuthRequest } from '../types/index.js';
import Company from '../models/Company.js';

const router = express.Router();

// 1. Revenue Intelligence (Daily/Weekly/Monthly Trend)
router.get(
  '/revenue',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { days = 30 } = req.query;
    const company = await Company.findOne({ userId: req.user?.userId });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const summaries = await DailySummary.find({
      businessId: company._id,
      date: { $gte: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 });

    const totalRevenue = summaries.reduce((sum, s) => sum + s.totalRevenue, 0);
    const prevRevenue = 10000; // Placeholder for growth calculation
    const growth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;

    res.json({
      data: summaries.map(s => ({ date: s.date.toISOString().split('T')[0], revenue: s.totalRevenue })),
      metrics: { totalRevenue, growth: Number(growth.toFixed(1)) },
      aiInsight: totalRevenue > prevRevenue 
        ? "Revenue trend is positive. Higher sales volume detected compared to the previous period."
        : "Revenue has stabilized. Consider focused marketing for high-margin products."
    });
  })
);

// 2. Profit & Cost Analysis (Profit vs Expenses)
router.get(
  '/profit-cost',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const company = await Company.findOne({ userId: req.user?.userId });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const summaries = await DailySummary.find({ businessId: company._id }).sort({ date: -1 }).limit(7);

    const totalRevenue = summaries.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalExpenses = summaries.reduce((sum, s) => sum + s.totalExpenses, 0);
    const profit = totalRevenue - totalExpenses;

    res.json({
      comparison: [
        { name: 'Revenue', value: totalRevenue },
        { name: 'Expenses', value: totalExpenses }
      ],
      breakdown: [
        { name: 'Stock', value: totalExpenses * 0.6 },
        { name: 'Rent', value: totalExpenses * 0.2 },
        { name: 'Transport', value: totalExpenses * 0.1 },
        { name: 'Other', value: totalExpenses * 0.1 }
      ],
      aiInsight: totalExpenses > totalRevenue * 0.8
        ? "Operating costs are high (80% of revenue). We suggest auditing transport and stocking expenses."
        : "Healthy profit margins maintained. Cost control is effective this week."
    });
  })
);

// 3. Customer Intelligence
router.get(
  '/customers',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Aggregation logic for top customers
    res.json({
      topCustomers: [
        { name: 'Acme Corp', revenue: 5000 },
        { name: 'Global Tech', revenue: 4200 },
        { name: 'Retail Plus', revenue: 3100 }
      ],
      metrics: { newCustomers: 12, repeatRate: 45 },
      aiInsight: "Your top 3 customers contribute 40% of the weekly revenue. Focus on long-term retention strategies for these accounts."
    });
  })
);

// 4. Product Intelligence
router.get(
  '/inventory',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
      topProducts: [
        { name: 'Super Widget', sales: 150, profit: 4500 },
        { name: 'Pro Cable', sales: 90, profit: 1200 }
      ],
      lowStock: [
        { name: 'Base Adapter', stock: 5 },
        { name: 'Power Unit', stock: 2 }
      ],
      aiInsight: "Super Widget has high volume but margin is decreasing. Consider a small price adjustment or bulk discount."
    });
  })
);

// 5. Predictions
router.get(
  '/predictions',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
      forecast: [
        { date: 'Mon', revenue: 1200 },
        { date: 'Tue', revenue: 1150 },
        { date: 'Wed', revenue: 1300 },
        { date: 'Thu', revenue: 1450 },
        { date: 'Fri', revenue: 1600 },
        { date: 'Sat', revenue: 1550 },
        { date: 'Sun', revenue: 1400 }
      ],
      risks: [
        { title: 'Inventory Shortage', message: 'Power Unit predicted to go out of stock within 48 hours.', level: 'high' }
      ]
    });
  })
);

export default router;
