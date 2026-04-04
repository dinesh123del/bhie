export type DetectedType = 'invoice' | 'material' | 'product' | 'document' | 'unknown';
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface DetectedObject {
  label: string;
  confidence: number;
}

export interface StructuredData {
  prices: number[];
  quantities: number[];
  dates: string[];
  productNames: string[];
  rawMatches: string[];
}

export interface ImageIntelligenceRecord {
  id: string;
  imageUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText: string;
  detectedObjects: DetectedObject[];
  detectedType: DetectedType;
  tags: string[];
  confidenceScore: number;
  structuredData: StructuredData;
  processingStatus: ProcessingStatus;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult extends Omit<ImageIntelligenceRecord, 'id'> {
  id: string;
  relevance: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
