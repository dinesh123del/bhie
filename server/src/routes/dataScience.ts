import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import { dataScienceAgent } from '../agents/dataScienceAgent';
import { ensureUploadDir, uploadDir } from '../utils/uploads';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../types';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { PDFParse } from 'pdf-parse';

const router = express.Router();

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, uploadDir);
    } catch {
      cb(new AppError(500, 'Failed to create upload directory'), uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `ds-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticateToken);

router.post('/analyze', upload.single('file'), asyncHandler(async (req: AuthRequest, res: any) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const ext = path.extname(fileName).toLowerCase();

  try {
    let analysis: any;

    if (ext === '.csv') {
      const data = await parseCSV(filePath);
      if (data.length === 0) throw new AppError(400, 'CSV file is empty');
      analysis = await dataScienceAgent.analyzeData(data, fileName);
    } else if (ext === '.xlsx' || ext === '.xls') {
      const data = parseExcel(filePath);
      if (data.length === 0) throw new AppError(400, 'Excel file is empty');
      analysis = await dataScienceAgent.analyzeData(data, fileName);
    } else if (ext === '.pdf') {
      const text = await parsePDF(filePath);
      if (!text.trim()) throw new AppError(400, 'PDF file contains no extractable text');
      analysis = await dataScienceAgent.analyzeText(text, fileName);
    } else {
      throw new AppError(415, 'Only CSV, Excel, and PDF files are supported for Data Science analysis');
    }

    res.json({
      success: true,
      fileName,
      analysis
    });
  } catch (error) {
    console.error('DS Analysis Error:', error);
    throw error;
  } finally {
    // Cleanup the uploaded file
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.warn('Failed to cleanup DS file:', e);
    }
  }
}));

async function parseCSV(filePath: string): Promise<any[]> {
  const results: any[] = [];
  const fileContent = await fs.readFile(filePath);
  const stream = Readable.from(fileContent);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function parseExcel(filePath: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

async function parsePDF(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    return String(parsed.text || '').trim();
  } finally {
    await parser.destroy();
  }
}

export default router;
