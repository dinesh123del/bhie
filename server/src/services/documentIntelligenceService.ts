import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import type { DocumentIntelligenceResult } from '../types/document.js';

const openai = env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'your_openai_api_key_here' 
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) 
  : null;

/**
 * ELITE CURRENCY RECOGNITION PATTERNS
 * Designed for precision across Indian (₹) and Global standards.
 */
const CURRENCY_PATTERNS = [
  // Explicit Grand Total with Currency Symbols
  /(?:grand\s*|net\s*|final\s*|)total(?:\s*(?:amount|due|payable))?\s*[:\-]?\s*(?:₹|rs?\.?|inr|usd|\$|eur|€|gbp|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
  // Floating Currency Symbols
  /(?:₹|rs?\.?|inr|usd|\$|eur|€|gbp|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
  // Standard Totals without symbols
  /\b(?:total|amt|amount|subtotal|tax|gst)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]{1,2})?)\b/gi,
  // Trailing currency markers
  /\b([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:total|amt|amount|inr|usd)\b/gi,
];

const INCOME_KEYWORDS = [
  'income', 'sale', 'credit', 'received', 'payment received', 'revenue', 
  'profit', 'payout', 'interest', 'dividend', 'refund', 'settlement'
];

const EXPENSE_KEYWORDS = [
  'expense', 'purchase', 'debit', 'bill', 'payment', 'spent', 'invoice',
  'tax invoice', 'bill to', 'subtotal', 'grand total', 'amt due'
];

/**
 * MULTI-STAGE CLASSIFICATION RULES
 * Maps intelligence signals to enterprise categories.
 */
const CATEGORY_RULES = [
  { category: 'materials', keywords: ['material', 'raw', 'stock', 'inventory', 'hardware', 'iron', 'steel', 'scrap'], type: 'expense' as const },
  { category: 'transport', keywords: ['fuel', 'petrol', 'diesel', 'travel', 'uber', 'ola', 'rapido', 'logistics', 'shipping'], type: 'expense' as const },
  { category: 'salary', keywords: ['salary', 'wages', 'staff', 'payroll', 'consultant', 'stipend'], type: 'expense' as const },
  { category: 'rent', keywords: ['rent', 'lease', 'office', 'co-working', 'maintenance'], type: 'expense' as const },
  { category: 'utilities', keywords: ['electricity', 'water', 'internet', 'wi-fi', 'recharge', 'mobile', 'hosting', 'aws', 'cloud'], type: 'expense' as const },
  { category: 'food', keywords: ['food', 'restaurant', 'swiggy', 'zomato', 'blinkit', 'zepto', 'coffee', 'pantry'], type: 'expense' as const },
  { category: 'marketing', keywords: ['ads', 'meta', 'google ads', 'marketing', 'branding', 'design', 'seo'], type: 'expense' as const },
  { category: 'sales', keywords: ['sale', 'customer', 'invoice', 'order', 'client', 'payment received'], type: 'income' as const },
  { category: 'investment', keywords: ['investment', 'return', 'stock', 'crypto', 'interest'], type: 'income' as const },
];

/** 
 * ELITE PRE-PROCESSING PIPELINE
 * Enhances document contrast and sharpness for superior OCR extraction.
 */
async function preprocessImage(buffer: Buffer | string): Promise<Buffer> {
  const imgBuffer = Buffer.isBuffer(buffer) ? buffer : await fs.readFile(buffer as string);
  const img = sharp(imgBuffer);
  
  const metadata = await img.metadata();
  const width = metadata.width || 1000;
  
  return img
    .greyscale()
    .linear(1.5, -0.2) // Contrast boost
    .sharpen({ sigma: 1.5, m1: 2, m2: 2 })
    .median(1) // Light noise removal
    .resize(Math.max(width, 1800), null, { fit: 'inside' }) // Scale up for small text
    .toBuffer();
}

async function runTesseract(buffer: Buffer): Promise<{ text: string; confidence: number }> {
  try {
    const { data } = await Tesseract.recognize(buffer, 'eng+hin', { // Dual language support
      logger: m => {
        if (process.env.NODE_ENV !== 'production' && m.status === 'recognizing text') {
             // Silently track progress if needed
        }
      },
    });
    
    return { 
      text: (data.text || '').trim(), 
      confidence: (data.confidence || 0) / 100 
    };
  } catch (error) {
    console.error('Tesseract Engine failure:', error);
    return { text: '', confidence: 0 };
  }
}

async function openaiVisionFallback(buffer: Buffer, ocrText: string): Promise<string> {
  if (!openai) return '';
  
  try {
    const base64 = buffer.toString('base64');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Perform elite OCR on this business record. Extract all details with extreme precision. Compare with raw OCR: "${ocrText.substring(0, 500)}". Focus on Merchant Name, Date, and Final Amount. Return ONLY the extracted text.`
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64}` }
          }
        ]
      }],
      max_tokens: 1500,
      temperature: 0.1,
    });
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('AI Vision Fallback failed:', error);
    return '';
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9₹.,:\-/%()$#@+\s]/g, ' ') // Allow decimals and symbols
    .replace(/([0-9])o([0-9])/g, '$10$2') 
    .replace(/\|/g, '1')
    .trim();
}

/** 
 * PRECISE AMOUNT SYNTHESIS
 * Scans for financial markers and stabilizes on the highest logical total.
 */
function extractAmount(text: string): { amount: number; confidence: number } {
  let bestAmount = 0;
  let maxMatchConf = 0;

  for (const pattern of CURRENCY_PATTERNS) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const rawVal = match[1] || match[0];
      const val = parseFloat(rawVal.replace(/,/g, '').replace(/[^0-9.]/g, ''));
      
      if (!isNaN(val) && val > 0) {
        // High confidence tokens
        const weight = /total|grand|due|paid/i.test(match[0]) ? 1.0 : 0.6;
        if (val > bestAmount) {
          bestAmount = val;
          maxMatchConf = weight;
        }
      }
    }
  }

  return { 
    amount: parseFloat(bestAmount.toFixed(2)), 
    confidence: bestAmount > 0 ? maxMatchConf : 0 
  };
}

function detectType(text: string): 'income' | 'expense' {
  const norm = text.toLowerCase();
  let score = { income: 0, expense: 0 };
  
  INCOME_KEYWORDS.forEach(kw => norm.includes(kw) && (score.income += 2));
  EXPENSE_KEYWORDS.forEach(kw => norm.includes(kw) && (score.expense += 1.5));
  
  // Tie-breaker: Invoices without "Income" keywords are usually expenses
  if (score.income === 0 && (norm.includes('invoice') || norm.includes('tax'))) score.expense += 5;

  return score.income > score.expense ? 'income' : 'expense';
}

function detectCategory(text: string, type: 'income' | 'expense'): string {
  const norm = text.toLowerCase();
  let bestScore = 0;
  let bestCategory = 'other';

  for (const rule of CATEGORY_RULES.filter(r => r.type === type)) {
    const hits = rule.keywords.filter(kw => norm.includes(kw)).length;
    if (hits > bestScore) {
      bestScore = hits;
      bestCategory = rule.category;
    }
  }

  return bestCategory;
}

function extractDate(text: string): string {
  const DATE_PATTERNS = [
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/,
    /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i
  ];

  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return new Date().toISOString().split('T')[0];
}

function extractItems(text: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  const ITEM_PATTERN = /^([a-zA-Z0-9\s.,&]+)\s+([0-9]+\.[0-9]{2})$/;

  for (const line of lines) {
    const clean = line.trim();
    if (clean.length < 5 || clean.toLowerCase().includes('total')) continue;
    
    // Check if line looks like a line item (Text + Price)
    if (ITEM_PATTERN.test(clean) || (clean.split(/\s+/).length >= 2 && /[0-9]+\.[0-9]{2}/.test(clean))) {
      items.push(clean);
    }
  }
  
  return items.slice(0, 15); // Cap at 15 items for brevity
}

/** 
 * ELITE INTEGRITY ORCHESTRATOR
 * Main entry point for the backend intelligence engine.
 */
export async function processDocument(input: Buffer | string): Promise<DocumentIntelligenceResult> {
  try {
    const buffer = Buffer.isBuffer(input) ? input : await fs.readFile(input as string);
    
    // 1. Digital Enhancement
    const processedBuffer = await preprocessImage(buffer);
    
    // 2. Tesseract Foundation
    const tesseract = await runTesseract(processedBuffer);
    let rawText = tesseract.text;
    let ocrConfidence = tesseract.confidence;
    
    // 3. AI Augmentation (Elite Layer)
    let aiUsed = false;
    if (ocrConfidence < 0.75 || rawText.length < 50) {
      const aiText = await openaiVisionFallback(processedBuffer, rawText);
      if (aiText) {
        rawText = aiText;
        ocrConfidence = 0.95; // AI is the source of truth here
        aiUsed = true;
      }
    }
    
    // 4. Synthesis
    const cleanedText = cleanText(rawText);
    const amountData = extractAmount(cleanedText);
    const type = detectType(cleanedText);
    const category = detectCategory(cleanedText, type);
    const date = extractDate(cleanedText);
    const items = extractItems(rawText); // Use raw for items to preserve formatting
    
    // 5. Final Confidence Calculation
    let finalConfidence = (ocrConfidence * 0.5) + (amountData.confidence * 0.5);
    if (aiUsed) finalConfidence = Math.max(finalConfidence, 0.9);

    return {
      amount: amountData.amount,
      type,
      category,
      confidence: parseFloat(finalConfidence.toFixed(2)),
      rawText: cleanedText,
      items,
      date,
    };
  } catch (error) {
    console.error('Intelligence Engine critical failure:', error);
    throw new AppError(500, 'Intelligence synthesis internal error');
  }
}

export async function processDocumentPath(filePath: string): Promise<DocumentIntelligenceResult> {
  return processDocument(filePath);
}

