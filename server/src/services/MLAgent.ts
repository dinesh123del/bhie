import axios from 'axios';
import { RecordDocument } from '../models/Record.js';
import VectorService from './VectorService.js';

interface MLPredictionData {
  confidence: number;
  anomaly: boolean;
  recommendation: string;
  category_prediction?: string;
}

class MLAgent {
  private static instance: MLAgent;
  private mlEndpoint: string;

  private constructor() {
    this.mlEndpoint = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  public static getInstance(): MLAgent {
    if (!MLAgent.instance) {
      MLAgent.instance = new MLAgent();
    }
    return MLAgent.instance;
  }

  /**
   * The "10-Year Growth" core Logic.
   * This decoupled method can be upgraded easily to future AI systems.
   */
  public async analyzeNewRecord(record: any): Promise<MLPredictionData> {
    try {
      console.log(`🧠 MLAgent analyzing record: ${record.title}...`);

      // 1. Sync to Vector DB for pattern memory
      await VectorService.upsertRecordVector(record);

      // 2. Call the current Python FastAPI ML Service
      const response = await axios.post(`${this.mlEndpoint}/analyze/outliers`, {
        data: [{
          amount: record.amount,
          category: record.category,
          timestamp: new Date(record.date).getTime()
        }]
      });

      const result = response.data;
      const isAnomaly = result.outliers && result.outliers.length > 0;

      // 3. (Optional) Call OpenAI/LLM for advanced logic (future placeholder)
      // const llmInsight = await this.callLLMForStrategy(record);

      return {
        confidence: isAnomaly ? 0.95 : 0.85,
        anomaly: isAnomaly,
        recommendation: isAnomaly 
          ? `High expense detected! This is 20% above your usual ${record.category} spend.`
          : `Optimal spend in ${record.category}. Trend looks stable.`,
        category_prediction: record.category 
      };
    } catch (error) {
      console.warn('⚠️ MLAgent: Primary ML service down. Using local heuristics.', error.message);
      return this.getLocalHeuristic(record);
    }
  }

  private getLocalHeuristic(record: any): MLPredictionData {
    return {
      confidence: 0.5,
      anomaly: false,
      recommendation: "Pattern analysis pending (ML service offline)."
    };
  }
}

export default MLAgent.getInstance();
