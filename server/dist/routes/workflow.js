import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import AnalysisService from '../services/AnalysisService.js';
import Record from '../models/Record.js';
import { requireUser } from '../utils/request.js';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { uploadDir } from '../utils/uploads.js';
const router = express.Router();
/**
 * GET /api/workflow/optimize-expenses
 * Identifies potential savings in subscriptions and vendor costs.
 */
router.get('/optimize-expenses', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const records = await Record.find({ userId: authUser.userId });
    const optimization = await AnalysisService.optimizeExpenses(records);
    res.json(optimization);
}));
/**
 * GET /api/workflow/tax-readiness
 * Evaluates records for tax filing readiness.
 */
router.get('/tax-readiness', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const records = await Record.find({ userId: authUser.userId });
    const readiness = await AnalysisService.getTaxReadiness(records);
    res.json(readiness);
}));
/**
 * GET /api/workflow/generate-bundle
 * Creates a ZIP file with CSV summary and all receipt attachments.
 */
router.get('/generate-bundle', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const records = await Record.find({ userId: authUser.userId });
    if (!records || records.length === 0) {
        return res.status(404).json({ message: 'No records found to bundle.' });
    }
    const zip = new AdmZip();
    // 1. Create CSV Summary
    let csv = 'Date,Title,Category,Amount,Type,Description,GST\n';
    records.forEach(r => {
        const dateStr = new Date(r.date).toLocaleDateString();
        csv += `"${dateStr}","${r.title || ''}","${r.category || ''}",${r.amount},"${r.type || ''}","${r.description || ''}","${r.gstNumber || ''}"\n`;
    });
    zip.addFile('audit_summary.csv', Buffer.from(csv, 'utf8'));
    // 2. Add Attachments
    const attachmentsFolder = 'attachments/';
    records.forEach(r => {
        if (r.fileUrl) {
            // fileUrl often contains the filename or a relative path
            const fileName = path.basename(r.fileUrl);
            const fullPath = path.isAbsolute(r.fileUrl)
                ? r.fileUrl
                : path.join(uploadDir, fileName);
            if (fs.existsSync(fullPath)) {
                zip.addLocalFile(fullPath, attachmentsFolder);
            }
        }
    });
    const zipBuffer = zip.toBuffer();
    const fileName = `Biz Plus_Audit_Bundle_${new Date().toISOString().split('T')[0]}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(zipBuffer);
}));
export default router;
