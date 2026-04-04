import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import type { DocumentIntelligenceResult } from '../types/document.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;



const CURRENCY_PATTERNS = [
  /(?:grand\s*total|total\s*(?:amount|)|amount\s*due|net\s*amount|subtotal|total|balance|paid|received)\s*[:\-]?\s*(₹|rs?\.?|inr)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
  /(?:₹|rs?\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
  /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:total|amt|amount)/gi,
];

const INCOME_KEYWORDS = ['income', 'sale', 'credit', 'received', 'payment received', 'sale', 'profit'];
const EXPENSE_KEYWORDS = ['expense', 'purchase', 'debit', 'bill', 'payment', 'spent'];

const CATEGORY_RULES = [
  { category: 'materials', keywords: ['material', 'raw', 'stock', 'product', 'item', 'inventory'], type: 'expense' as const },
  { category: 'transport', keywords: ['fuel', 'petrol', 'diesel', 'travel', 'uber', 'ola'], type: 'expense' as const },
  { category: 'salary', keywords: ['salary', 'wages', 'staff'], type: 'expense' as const },
  { category: 'rent', keywords: ['rent', 'lease'], type: 'expense' as const },
  { category: 'utilities', keywords: ['electricity', 'water', 'internet'], type: 'expense' as const },
  { category: 'food', keywords: ['food', 'restaurant', 'swiggy', 'zomato'], type: 'expense' as const },
  { category: 'sales', keywords: ['sale', 'customer', 'invoice'], type: 'income' as const },
];

async function preprocessImage(buffer: Buffer | string): Promise<Buffer> {
  const imgBuffer = Buffer.isBuffer(buffer) ? buffer : await fs.readFile(buffer as string);
  const img = sharp(imgBuffer);
  
  // Grayscale, enhance contrast, reduce noise, sharpen, resize
  return img
    .greyscale()
    .normalize() // contrast enhancement
    .sharpen({ sigma: 1 })
    .modulate({ brightness: 1.2, saturation: 0.8 }) // slight brightness boost
    .median(1) // noise reduction
    .resize(1024, 1024, { fit: 'inside', kernel: sharp.kernel.lanczos3 }) // optimize for OCR
    .toBuffer();
}

async function runTesseract(buffer: Buffer, config = 'eng'): Promise<{ text: string; confidence: number }> {
  const { data } = await Tesseract.recognize(buffer, config, {
    logger: m => {
      if (process.env.NODE_ENV !== 'production') console.log(m);
    },
  });
  // Simple fallback confidence - ignore exact structure
  const avgConfidence = data.confidence ? data.confidence / 100 : 0.7;
  return { text: (data.text || '').trim(), confidence: Math.max(0.3, avgConfidence) };
}

async function detectHandwriting(text: string, ocrConfidence: number): Promise<boolean> {
  if (ocrConfidence > 0.75) return false;
  
  if (/[a-z]/.test(text) && !/[A-Z]/.test(text) && text.length > 20) return true;
  return false;
}

async function openaiVisionFallback(buffer: Buffer, ocrText: string): Promise<string> {
  if (!openai) {
    console.warn('OpenAI not configured, skipping vision fallback');
    return '';
  }
  const base64 = buffer.toString('base64');
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Extract all text accurately from this receipt/image/handwritten note. Previous OCR (possibly inaccurate): "${ocrText.substring(0, 2000)}". Respond ONLY with the clean extracted text.`
        },
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64}` }
        }
      ]
    }],
    max_tokens: 2000,
  });
  return response.choices[0].message.content?.trim() || '';
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9₹.,:\-/%()$#+\s]/g, ' ')
    .replace(/([0-9])o([0-9])/g, '$1 0 $2') // fix O→0
    .replace(/l/g, '1') // l→1
    .replace(/S/g, '5') // S→5
    .replace(/O/g, '0')
    .trim();
}

function extractAmount(text: string): { amount: number; confidence: number } {
  for (const pattern of CURRENCY_PATTERNS) {
    const matches = [...text.matchAll(pattern)]
      .map(m => parseFloat((m[2] || m[1]).replace(/,/g, '')))
      .filter(n => !isNaN(n) && n > 0)
      .sort((a, b) => b - a);
    
    if (matches.length) {
      return { amount: matches[0], confidence: 0.9 };
    }
  }
  return { amount: 0, confidence: 0 };
}

function detectType(text: string): 'income' | 'expense' {
  const score = { income: 0, expense: 0 };
  INCOME_KEYWORDS.forEach(kw => text.includes(kw) && score.income++);
  EXPENSE_KEYWORDS.forEach(kw => text.includes(kw) && score.expense++);
  return score.income > score.expense ? 'income' : 'expense';
}

function detectCategory(text: string, type: 'income' | 'expense'): string {
  for (const rule of CATEGORY_RULES.filter(r => r.type === type)) {
    if (rule.keywords.some(kw => text.includes(kw))) return rule.category;
  }
  return 'other';
}

function calculateConfidence(ocrConf: number, handwriting: boolean, aiUsed: boolean, amountConf: number): number {
  let conf = ocrConf * 0.4 + amountConf * 0.4;
  if (handwriting || aiUsed) conf *= 0.8;
  return parseFloat(conf.toFixed(2));
}

function extractItems(text: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  const ITEM_PATTERN = /([a-z\s]+)\s+(\d+(?:\.\d{1,2})?)/i;

  for (const line of lines) {
    const match = line.match(ITEM_PATTERN);
    if (match && !line.toLowerCase().includes('total')) {
      items.push(line.trim());
    }
  }
  return items;
}

function extractDate(text: string): string {
  const DATE_PATTERNS = [
    /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/,
    /\d{4}[\/-]\d{1,2}[\/-]\d{1,2}/,
    /[A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4}/
  ];

  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return new Date().toISOString().split('T')[0];
}

/** Main entry point */
export async function processDocument(input: Buffer | string): Promise<DocumentIntelligenceResult> {
  try {
    const buffer = Buffer.isBuffer(input) ? input : await fs.readFile(input as string);
    
    // 1. Preprocess
    const processedBuffer = await preprocessImage(buffer);
    
    // 2. Primary Tesseract OCR
    const tesseractResult = await runTesseract(processedBuffer);
    let rawText = tesseractResult.text;
    let ocrConfidence = tesseractResult.confidence;
    
    // 3. Handwriting detection & AI fallback
    const isHandwriting = await detectHandwriting(rawText, ocrConfidence);
    let aiUsed = false;
    if (isHandwriting || ocrConfidence < 0.6) {
      if (openai) {
        const aiText = await openaiVisionFallback(processedBuffer, rawText);
        rawText += '\n' + aiText;
        aiUsed = true;
        ocrConfidence = Math.max(ocrConfidence, 0.7); // AI boost
      }
    }
    
    // 4. Clean
    const cleanedText = cleanText(rawText);
    
    // 5. Extract
    const amountResult = extractAmount(cleanedText);
    const type = detectType(cleanedText);
    const category = detectCategory(cleanedText, type);
    const items = extractItems(cleanedText);
    const date = extractDate(cleanedText);
    
    // 6. Confidence
    const confidence = calculateConfidence(ocrConfidence, isHandwriting, aiUsed, amountResult.confidence);
    
    return {
      amount: amountResult.amount,
      type,
      category,
      confidence: Math.max(0.1, confidence), // min floor
      rawText: cleanedText,
      items,
      date,
    };
  } catch (error) {
    console.error('Document processing failed:', error);
    throw new AppError(500, 'Failed to process document');
  }
}

// Export for buffer/path overload
export async function processDocumentPath(filePath: string): Promise<DocumentIntelligenceResult> {
  return processDocument(filePath);
}

