import { Worker } from 'bullmq';
import { redisClient } from '../config/redisClient';
import { processImageForRecord } from '../services/imageRecordService';
import BusinessRecord from '../models/Record';
import { IntelligenceEngine } from '../services/intelligenceEngine';

const uploadProcessingWorker = new Worker(
  'upload-processing',
  async (job) => {
    const { filePath, userId, originalName } = job.data;

    try {
      // Process the image/file
      const processedData = await processImageForRecord(filePath, originalName);

      // Save to database
      await BusinessRecord.create({
        userId,
        title: `Uploaded ${originalName}`,
        category: processedData.category,
        type: processedData.type,
        amount: processedData.amount,
        date: processedData.date,
        description: `Auto-processed from ${originalName}`,
        status: 'processed',
        fileUrl: filePath,
      });

      // Generate insights
      await IntelligenceEngine.generateInsights(userId);

      return { success: true, processedData };
    } catch (error) {
      console.error('Upload processing error:', error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

uploadProcessingWorker.on('completed', (job) => {
  console.log(`Upload processing completed for job ${job.id}`);
});

uploadProcessingWorker.on('failed', (job, err) => {
  console.error(`Upload processing failed for job ${job.id}:`, err);
});

export default uploadProcessingWorker;