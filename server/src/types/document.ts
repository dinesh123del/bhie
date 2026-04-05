export interface DocumentIntelligenceResult {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  confidence: number;
  rawText: string;
  exactText?: string;
  items: string[];
  date: string | Date;
  missingFields?: string[];
  integrityScore?: number;
  isUnclear?: boolean;
  businessName?: string;
  gstNumber?: string;
  gstDetails?: {
    legalName?: string;
    tradeName?: string;
    registrationDate?: string;
    status?: string;
    taxpayerType?: string;
    address?: string;
  };
}

export type UploadedImageType = 'income' | 'expense' | 'unknown';


