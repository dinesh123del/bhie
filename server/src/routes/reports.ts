import express, { Response, Router } from 'express';
import { Report } from '../models/Report.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';

const router: Router = express.Router();

router.use(authenticateToken);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const reports = await Report.find({ userId: user.userId }).sort({ createdAt: -1 });
    res.json(reports);
  })
);

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const { title, content, type } = req.body;

    if (!title) {
      throw new AppError(400, 'Title is required');
    }

    const report = await Report.create({
      userId: user.userId,
      title,
      content: content || '',
      type: type || 'general',
    });

    res.status(201).json(report);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: user.userId });

    if (!report) {
      throw new AppError(404, 'Report not found');
    }

    res.json({ message: 'Report deleted' });
  })
);

export default router;
