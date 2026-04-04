export interface DocumentIntelligenceResult {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  confidence: number;
  rawText: string;
  exactText?: string;
  items: string[];
  date: string | Date;
}

export type UploadedImageType = 'income' | 'expense' | 'unknown';


