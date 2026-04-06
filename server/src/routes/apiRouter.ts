import express from 'express';
import authRoutes from './auth.js';
import aiRoutes from './ai.js';
import analyticsRoutes from './analytics.js';
import adminRoutes from './admin.js';
import companyRoutes from './company.js';
import paymentRoutes from './payments.js';
import recordRoutes from './records.js';
import dashboardRoutes from './dashboard.js';
import reportRoutes from './reports.js';
import searchRoutes from './search.js';
import uploadRoutes from './upload.js';
import alertsRoutes from './alerts.js';
import insightsRoutes from './insights.js';
import transactionsRoutes from './transactions.js';
import subscriptionRoutes from './subscription.js';
import eventRoutes from './events.js';
import analyticsIntelRoutes from './analyticsIntelligence.js';
import notificationRoutes from './notifications.js';
import dataScienceRoutes from './dataScience.js';
import pricingRoutes from './pricing.js';
import workflowRoutes from './workflow.js';

import healthRoutes from './health.js';

const router = express.Router();

// Health check and root info
router.get('/', (_req, res) => {
  res.send('API Running');
});

router.use('/system', healthRoutes);
router.use('/events', eventRoutes);
router.use('/analytics/intel', analyticsIntelRoutes);
router.use('/ds', dataScienceRoutes); // New Route for Data Science Analysis


router.get('/health', (_req, res) => {
  res.json({ status: 'OK', engine: 'Finly-v1.0' });
});


// Authentication routes
router.use('/auth', authRoutes);

// AI and Analytics
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);

// Domain specific routes
router.use('/company', companyRoutes);
router.use('/records', recordRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment', paymentRoutes); // Alias
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/alerts', alertsRoutes);
router.use('/insights', insightsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/pricing', pricingRoutes);
router.use('/workflow', workflowRoutes);

export default router;
