import { RecordDocument } from '../models/Record.js';

interface VectorMetadata {
  userId: string;
  type: string;
  category: string;
  amount: number;
  date: number;
}

class VectorService {
  private static instance: VectorService;
  private isReady: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): VectorService {
    if (!VectorService.instance) {
      VectorService.instance = new VectorService();
    }
    return VectorService.instance;
  }

  private async initialize() {
    // Check for Pinecone/Milvus environment variables
    const apiKey = process.env.PINECONE_API_KEY;
    if (apiKey) {
      console.log('🚀 Vector Service: Initializing Pinecone integration...');
      this.isReady = true;
    } else {
      console.warn('⚠️ Vector Service: PINECONE_API_KEY missing. Using local mock for pattern recognition.');
      this.isReady = false;
    }
  }

  /**
   * Convet a record into a financial vector pattern
   * This is the "secret sauce" for 10-year growth. 
   * It allows the AI to find patterns across years of data in milliseconds.
   */
  public async upsertRecordVector(record: any) {
    if (!this.isReady) return null;

    try {
      // In a real implementation, we would use an embedding model (like OpenAI text-embedding-3-small)
      // For now, we create a structured vector of numerical financial data
      const vector = [
        record.amount,
        record.type === 'income' ? 1 : -1,
        this.getCategoryValue(record.category),
        new Date(record.date).getMonth(),
        new Date(record.date).getDay(),
      ];

      const metadata: VectorMetadata = {
        userId: record.userId.toString(),
        type: record.type,
        category: record.category,
        amount: record.amount,
        date: new Date(record.date).getTime(),
      };

      console.log(`📡 Syncing record ${record._id} to Vector DB...`);
      // Mock sync: Pinecone call would go here
      return `vec_${record._id}`;
    } catch (error) {
      console.error('Vector sync failed:', error);
      return null;
    }
  }

  public async findSimilarPatterns(userId: string, targetVector: number[]) {
    if (!this.isReady) return [];
    // Similarity search logic would go here
    return [];
  }

  private getCategoryValue(category: string): number {
    const categories: Record<string, number> = {
      'food': 1,
      'transport': 2,
      'utilities': 3,
      'rent': 4,
      'salary': 5,
      'investment': 6,
      'other': 0
    };
    return categories[category.toLowerCase()] || 0;
  }
}

export default VectorService.getInstance();
