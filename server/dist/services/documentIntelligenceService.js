import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
const openai = env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'your_openai_api_key_here'
    ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
    : null;
/**
 * Currency recognition patterns
 * Supports Indian (₹) and global currency formats.
 */
const CURRENCY_PATTERNS = [
    // Explicit Grand Total with Currency Symbols (₹, $, ₹, etc)
    /(?:grand\s*|net\s*|final\s*|total|amount\s*payable|balance(?:\s*due)?)\s*[:\-]?\s*(?:₹|rs?\.?|inr|usd|\$|eur|€|gbp|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    // Floating Currency Symbols
    /(?:₹|rs?\.?|inr|usd|\$|eur|€|gbp|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    // Standard Totals without symbols but with keywords
    /\b(?:total|amt|amount|subtotal|tax|gst|invoice\s*value)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]{1,2})?)\b/gi,
    // Indian specifically (e.g. 500.00)
    /\b([0-9,]{2,}(?:\.[0-9]{2}))\b/g,
    // Trailing currency markers
    /\b([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:total|amt|amount|inr|usd|rounded|sum)\b/gi,
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
 * Document classification rules
 * Maps keywords to expense/income categories.
 */
const CATEGORY_RULES = [
    { category: 'materials', keywords: ['material', 'raw', 'stock', 'inventory', 'hardware', 'iron', 'steel', 'scrap', 'cement', 'bricks', 'tools'], type: 'expense' },
    { category: 'transport', keywords: ['fuel', 'petrol', 'diesel', 'travel', 'uber', 'ola', 'rapido', 'logistics', 'shipping', 'freight', 'carrier', 'toll'], type: 'expense' },
    { category: 'salary', keywords: ['salary', 'wages', 'staff', 'payroll', 'consultant', 'stipend', 'bonus', 'contractor'], type: 'expense' },
    { category: 'rent', keywords: ['rent', 'lease', 'office', 'co-working', 'maintenance', 'deposit', 'electricity'], type: 'expense' },
    { category: 'utilities', keywords: ['electricity', 'water', 'internet', 'wi-fi', 'recharge', 'mobile', 'hosting', 'aws', 'cloud', 'subscription', 'software', 'saas'], type: 'expense' },
    { category: 'food', keywords: ['food', 'restaurant', 'swiggy', 'zomato', 'blinkit', 'zepto', 'coffee', 'pantry', 'canteen', 'groceries'], type: 'expense' },
    { category: 'marketing', keywords: ['ads', 'meta', 'google ads', 'marketing', 'branding', 'design', 'seo', 'promotion', 'print', 'digital'], type: 'expense' },
    { category: 'sales', keywords: ['sale', 'customer', 'invoice', 'order', 'client', 'payment received', 'revenue', 'transaction', 'transfer In'], type: 'income' },
    { category: 'investment', keywords: ['investment', 'return', 'stock', 'crypto', 'interest', 'dividend', 'mutual fund', 'fd', 'staking'], type: 'income' },
    { category: 'misc', keywords: ['other', 'others', 'miscellaneous', 'cash', 'transfer'], type: 'expense' },
];
/**
 * Image preprocessing for OCR
 * Enhances document contrast and sharpness.
 */
async function preprocessImage(buffer) {
    const imgBuffer = Buffer.isBuffer(buffer) ? buffer : await fs.readFile(buffer);
    const img = sharp(imgBuffer);
    const metadata = await img.metadata();
    const width = metadata.width || 1000;
    // High-resolution enhancement for low-quality scans
    return img
        .greyscale()
        .normalize() // Equalize histogram for better distribution
        .linear(1.8, -0.25) // Extreme contrast boost for faded receipts
        .sharpen({ sigma: 2.0, m1: 5, m2: 5 }) // Aggressive sharpening
        .median(2) // Heavier noise removal
        .resize(Math.max(width, 2400), null, { fit: 'inside', kernel: 'lanczos3' }) // Higher scale for digital reconstruction
        .toBuffer();
}
async function runTesseract(buffer) {
    try {
        const { data } = await Tesseract.recognize(buffer, 'eng+hin', {
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
    }
    catch (error) {
        console.error('Tesseract Engine failure:', error);
        return { text: '', confidence: 0 };
    }
}
async function openaiVisionFallback(buffer, ocrText) {
    if (!openai)
        return '';
    try {
        const base64 = buffer.toString('base64');
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are a business document parser. Extract: merchant name, date, currency, final amount, type (income/expense), category.
                   OCR results (low confidence): "${ocrText.substring(0, 300)}".
                   Return only the extracted information.`
                        },
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'high' }
                        }
                    ]
                }],
            max_tokens: 1500,
            temperature: 0.1,
        });
        return response.choices[0].message.content?.trim() || '';
    }
    catch (error) {
        console.error('AI Vision Fallback failed:', error);
        return '';
    }
}
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^a-zA-Z0-9₹.,:\-/%()$#@+*!&|'\"[\]{}\s]/g, '') // Expanded allowed set
        .replace(/([0-9])o([0-9])/g, '$10$2')
        .replace(/\|/g, '1')
        .trim();
}
/**
 * PRECISE AMOUNT SYNTHESIS
 * Scans for financial markers and stabilizes on the highest logical total.
 */
/**
 * PRECISE AMOUNT SYNTHESIS
 * Scans for financial markers and stabilizes on the highest logical total.
 */
function extractAmount(text) {
    let bestAmount = 0;
    let maxMatchConf = 0;
    for (const pattern of CURRENCY_PATTERNS) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
            const rawVal = match[1] || match[0];
            const val = parseFloat(rawVal.replace(/,/g, '').replace(/[^0-9.]/g, ''));
            if (!isNaN(val) && val > 0) {
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
/**
 * ENGINE CALIBRATION LAYER
 * Normalizes and stabilizes erratic numeric artifacting from low resolution scans.
 */
function calibrateEngineOutput(amount) {
    if (!amount || amount <= 0)
        return 0;
    // Professional rounding - ensure exactly 2 decimal places with safe floating point math
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}
function detectType(text) {
    const norm = text.toLowerCase();
    let score = { income: 0, expense: 0 };
    INCOME_KEYWORDS.forEach(kw => norm.includes(kw) && (score.income += 2));
    EXPENSE_KEYWORDS.forEach(kw => norm.includes(kw) && (score.expense += 1.5));
    // Tie-breaker: Invoices without "Income" keywords are usually expenses
    if (score.income === 0 && (norm.includes('invoice') || norm.includes('tax')))
        score.expense += 5;
    return score.income > score.expense ? 'income' : 'expense';
}
function detectCategory(text, type) {
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
function extractDate(text) {
    const DATE_PATTERNS = [
        /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/,
        /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/,
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i
    ];
    for (const pattern of DATE_PATTERNS) {
        const match = text.match(pattern);
        if (match)
            return match[0];
    }
    return new Date().toISOString().split('T')[0];
}
function extractItems(text) {
    const lines = text.split('\n');
    const items = [];
    const ITEM_PATTERN = /^([a-zA-Z0-9\s.,&]+)\s+([0-9]+\.[0-9]{2})$/;
    for (const line of lines) {
        const clean = line.trim();
        if (clean.length < 5 || clean.toLowerCase().includes('total'))
            continue;
        // Check if line looks like a line item (Text + Price)
        if (ITEM_PATTERN.test(clean) || (clean.split(/\s+/).length >= 2 && /[0-9]+\.[0-9]{2}/.test(clean))) {
            items.push(clean);
        }
    }
    return items.slice(0, 15); // Cap at 15 items for brevity
}
/**
 * BUSINESS & LEGAL EXTRACTION
 * Specialized patterns for Merchant identification and Tax compliance.
 */
function extractBusinessName(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const addressKeywords = ['street', 'road', 'floor', 'building', 'city', 'pin', 'tel:', 'phone:', 'email', 'www'];
    const datePatterns = [/\d{2}[\/-]\d{2}[\/-]\d{2,4}/, /\d{4}[\/-]\d{2}[\/-]\d{2}/];
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
        const line = lines[i];
        const lowLine = line.toLowerCase();
        const isAddress = addressKeywords.some(kw => lowLine.includes(kw));
        const isDate = datePatterns.some(p => p.test(line));
        const isGst = /gst|tin|vat|reg:|fssai/i.test(lowLine);
        const isNumeric = /^[0-9\s.,:#-]+$/.test(line);
        const isTotal = /total|subtotal|tax|invoice/i.test(lowLine);
        if (!isAddress && !isDate && !isGst && !isNumeric && !isTotal && line.length > 3) {
            return line;
        }
    }
    return 'Unknown Merchant';
}
function extractGSTIN(text) {
    const GST_PATTERN = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
    const match = text.match(GST_PATTERN);
    return match ? match[0] : undefined;
}
async function searchGSTDetails(gstin) {
    if (!gstin || !openai)
        return undefined;
    try {
        const { AIEngine } = await import('../utils/aiEngine.js');
        const response = await AIEngine.generateCompletion(`Provide registration details for GSTIN: ${gstin}. Return as JSON with keys: legalName, tradeName, status, address, taxpayerType, registrationDate.`);
        return JSON.parse(response.content || '{}');
    }
    catch {
        return undefined;
    }
}
/**
 * ELITE INTEGRITY ORCHESTRATOR
 * Main entry point for the backend intelligence engine.
 */
export async function processDocument(input) {
    try {
        const buffer = Buffer.isBuffer(input) ? input : await fs.readFile(input);
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
        const exactText = rawText; // Preserve the actual OCR output
        const cleanedText = cleanText(rawText);
        const amountData = extractAmount(cleanedText);
        const type = detectType(cleanedText);
        const category = detectCategory(cleanedText, type);
        const date = extractDate(cleanedText);
        const items = extractItems(rawText);
        const businessName = extractBusinessName(rawText);
        const gstNumber = extractGSTIN(cleanedText);
        // 5. Advanced GST Lookup
        let gstDetails = undefined;
        if (gstNumber) {
            gstDetails = await searchGSTDetails(gstNumber);
        }
        // 6. MISSING DETAILS GUIDANCE (Engine Feedback)
        const missingFields = [];
        if (amountData.amount <= 0)
            missingFields.push('amount');
        if (!date || date === new Date().toISOString().split('T')[0])
            missingFields.push('transaction date');
        if (category === 'other')
            missingFields.push('category classification');
        if (businessName === 'Unknown Merchant')
            missingFields.push('merchant name');
        if (rawText.length < 20)
            missingFields.push('document content');
        // 7. Final Confidence Calculation & Professional Calibration
        let finalConfidence = (ocrConfidence * 0.4) + (amountData.confidence * 0.6);
        if (aiUsed)
            finalConfidence = Math.max(finalConfidence, 0.85);
        const calibratedAmount = calibrateEngineOutput(amountData.amount);
        const integrityScore = Math.max(0, 100 - (missingFields.length * 20));
        return {
            amount: calibratedAmount,
            type,
            category,
            confidence: parseFloat(finalConfidence.toFixed(2)),
            rawText: cleanedText,
            exactText,
            items,
            date,
            businessName,
            gstNumber,
            gstDetails,
            missingFields,
            integrityScore,
            isUnclear: missingFields.length > 0 || finalConfidence < 0.6
        };
    }
    catch (error) {
        console.error('Intelligence Engine critical failure:', error);
        throw new AppError(500, 'Intelligence synthesis internal error');
    }
}
export async function processDocumentPath(filePath) {
    return processDocument(filePath);
}
