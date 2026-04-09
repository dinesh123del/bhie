import axios from 'axios';
import FormData from 'form-data';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

interface MomentAnalysisResult {
  emotional_state: string;
  presence_detected: boolean;
  audio_sentiment: string;
  keywords: string[];
  resilience_impact: number;
  timestamp: number;
}

export class MomentIntelligenceService {
  private mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async analyzeMoment(
    frameBuffer?: Buffer,
    audioBuffer?: Buffer,
    context: string = ''
  ): Promise<MomentAnalysisResult> {
    try {
      const formData = new FormData();
      
      if (frameBuffer) {
        formData.append('frame', frameBuffer, {
          filename: 'frame.jpg',
          contentType: 'image/jpeg',
        });
      }
      
      if (audioBuffer) {
        formData.append('audio', audioBuffer, {
          filename: 'audio.wav',
          contentType: 'audio/wav',
        });
      }
      
      formData.append('context', context);

      const response = await axios.post(`${this.mlServiceUrl}/analyze/moment`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error analyzing moment in ML Service:', error);
      throw new Error('Failed to analyze moment intelligence');
    }
  }
}

export default new MomentIntelligenceService();
