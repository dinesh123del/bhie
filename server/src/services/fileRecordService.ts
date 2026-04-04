import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/appError';
import { processDocument } from './documentIntelligenceService.js';
import type { DocumentIntelligenceResult } from '../types/document.js';
import type { UploadedImageType } from '../models/Image.js';

export type SupportedUploadKind = 'image' | 'pdf' | 'docx' | 'zip';

export interface ExtractedRecordPayload {
  sourceName: string;
  fileType: SupportedUploadKind;
  amount: number;
  amountMatch: string | null;
  type: 'income' | 'expense';
  detectedType: UploadedImageType;
  category: string;
  confidence: number;
  rawText: string;
  extractedText: string;
  date: Date;
}

export const AMOUNT_EXTRACTION_REGEX =
  /(?:grand\s*total|total\s*amount|amount\s*due|net\s*amount|subtotal|total|amount|amt|paid|received|balance|inr|rs\.?|₹|\$)\s*[:\-]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{1,2})?|[0-9]+(?:\.\d{1,2})?)/gi;

const FALLBACK_AMOUNT_REGEX = /\b([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{1,2})|[0-9]+\.\d{1,2})\b/g;

const incomeKeywords = [
  'income',
  'sale',
  'sales',
  'payment received',
  'received',
  'credit',
  'deposit',
  'profit',
  'customer payment',
  'invoice paid',
  'cash sale',
  'upi received',
];

const expenseKeywords = [
  'expense',
  'purchase',
  'debit',
  'bill',
  'invoice',
  'rent',
  'fuel',
  'petrol',
  'diesel',
  'grocery',
  'restaurant',
  'swiggy',
  'zomato',
  'electricity',
  'water',
  'internet',
  'salary',
  'wages',
  'subscription',
  'tax',
];

const categoryRules: Array<{
  category: string;
  keywords: string[];
  preferredType: UploadedImageType;
}> = [
  { category: 'sales', keywords: ['sale', 'sales', 'payment received', 'credit', 'deposit', 'invoice paid'], preferredType: 'income' },
  { category: 'rent', keywords: ['rent', 'lease'], preferredType: 'expense' },
  { category: 'utilities', keywords: ['electricity', 'water', 'internet', 'wifi', 'phone', 'telephone', 'gas'], preferredType: 'expense' },
  { category: 'salary', keywords: ['salary', 'wages', 'payroll', 'staff salary'], preferredType: 'expense' },
  { category: 'travel', keywords: ['travel', 'uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'flight', 'train', 'bus'], preferredType: 'expense' },
  { category: 'food', keywords: ['restaurant', 'food', 'cafe', 'swiggy', 'zomato'], preferredType: 'expense' },
  { category: 'materials', keywords: ['material', 'raw material', 'inventory', 'stock', 'product', 'items'], preferredType: 'expense' },
  { category: 'shopping', keywords: ['store', 'purchase', 'shopping', 'mart', 'supermarket'], preferredType: 'expense' },
  { category: 'fees', keywords: ['fee', 'charges', 'commission', 'service charge'], preferredType: 'expense' },
];

export async function processUploadedFile(filePath: string, originalName: string, mimeType: string): Promise<ExtractedRecordPayload[]> {
  const buffer = await fs.readFile(filePath);
  return processBuffer(buffer, originalName, mimeType);
}

export async function processBuffer(buffer: Buffer, originalName: string, mimeType: string): Promise<ExtractedRecordPayload[]> {
  const fileType = detectFileType(originalName, mimeType);

  if (fileType === 'zip') {
    return processZipBuffer(buffer, originalName);
  }

  const payload = await buildPayload(originalName, fileType, buffer);
  return [payload];
}

export function detectFileType(originalName: string, mimeType: string): SupportedUploadKind {
  const ext = path.extname(originalName).toLowerCase();
  const loweredMimeType = mimeType.toLowerCase();

  if (
    loweredMimeType.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic'].includes(ext)
  ) {
    return 'image';
  }

  if (loweredMimeType === 'application/pdf' || ext === '.pdf') {
    return 'pdf';
  }

  if (
    loweredMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    loweredMimeType === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    return 'docx';
  }

  if (
    loweredMimeType === 'application/zip' ||
    loweredMimeType === 'application/x-zip-compressed' ||
    ext === '.zip'
  ) {
    return 'zip';
  }

  throw new AppError(415, `Unsupported file type for ${originalName}`);
}

async function processZipBuffer(buffer: Buffer, originalName: string): Promise<ExtractedRecordPayload[]> {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);

  if (entries.length === 0) {
    throw new AppError(400, `ZIP archive ${originalName} is empty`);
  }

  const extractedItems: ExtractedRecordPayload[] = [];

  for (const entry of entries) {
    const entryName = path.basename(entry.entryName);
    const entryMimeType = inferMimeType(entryName);

    try {
      const items = await processBuffer(entry.getData(), entryName, entryMimeType);
      extractedItems.push(...items);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 415) {
        continue;
      }

      throw error;
    }
  }

  if (extractedItems.length === 0) {
    throw new AppError(415, `ZIP archive ${originalName} does not contain supported files`);
  }

  return extractedItems;
}

async function extractTextFromBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  fileType: SupportedUploadKind
): Promise<string> {
  try {
    if (fileType === 'pdf') {
      const parser = new PDFParse({ data: buffer });
      try {
        const parsed = await parser.getText();
        return String(parsed.text || '').trim();
      } finally {
        await parser.destroy();
      }
    }

    if (fileType === 'docx') {
      const parsed = await mammoth.extractRawText({ buffer });
      return String(parsed.value || '').trim();
    }

    // For images, use new engine
    if (fileType === 'image') {
      const result = await processDocument(buffer);
      return result.rawText;
    }
  } catch (error) {
    throw new AppError(422, `Failed to extract text from ${originalName}`);
  }

  throw new AppError(415, `Unsupported file type for ${originalName}`);
}

async function buildPayload(sourceName: string, fileType: SupportedUploadKind, buffer: Buffer): Promise<ExtractedRecordPayload> {
  const intelResult: DocumentIntelligenceResult = await processDocument(buffer);
  const normalizedText = intelResult.rawText.toLowerCase();
  const date = extractDate(normalizedText);

  return {
    sourceName,
    fileType,
    amount: intelResult.amount,
    amountMatch: null, // New engine handles internally
    type: intelResult.type,
    detectedType: intelResult.type,
    category: intelResult.category,
    confidence: intelResult.confidence,
    rawText: intelResult.rawText,
    extractedText: intelResult.rawText,
    date,
  };
}



function extractDate(normalizedText: string): Date {
  const match =
    normalizedText.match(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/) ||
    normalizedText.match(/\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/);

  if (!match) {
    return new Date();
  }

  const parsed = new Date(match[0]);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,:/\-₹$]/g, ' ')
    .trim();
}

function inferMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.tif':
    case '.tiff':
      return 'image/tiff';
    case '.heic':
      return 'image/heic';
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}
