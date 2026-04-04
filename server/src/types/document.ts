export interface DocumentIntelligenceResult {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  confidence: number;
  rawText: string;
}

export type UploadedImageType = 'income' | 'expense' | 'unknown';


