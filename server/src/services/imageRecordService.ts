import { processDocument } from './documentIntelligenceService.js';
import type { DocumentIntelligenceResult } from '../types/document.js';

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

export interface ProcessedImagePayload {
  amount: number;
  amountMatch: string | null;
  type: 'income' | 'expense';
  detectedType: 'income' | 'expense';
  category: string;
  confidence: number;
  rawText: string;
  extractedText: string;
  date: Date;
}

export async function processImageForRecord(filePath: string, originalName: string): Promise<ProcessedImagePayload> {
  const intelResult: DocumentIntelligenceResult = await processDocument(filePath);
  const normalizedText = intelResult.rawText.toLowerCase();
  const date = extractDate(normalizedText);

  return {
    amount: intelResult.amount,
    amountMatch: null,
    type: intelResult.type,
    detectedType: intelResult.type,
    category: intelResult.category,
    confidence: intelResult.confidence,
    rawText: intelResult.rawText,
    extractedText: intelResult.rawText,
    date,
  };
}
