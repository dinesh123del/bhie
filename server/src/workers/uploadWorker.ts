import { Worker, Job } from 'bullmq';
import { isRedisConnected } from '../config/redisClient.js';

let uploadProcessingWorker: Worker | null = null;

export const initUploadWorker = () => {
  if (!isRedisConnected()) {
    console.warn('⚠️ Upload worker skipped (Redis unavailable)');
    return null;
  }

  try {
    uploadProcessingWorker = new Worker(
      'upload-processing',
      async (job) => {
        const { filePath, userId, originalName } = job.data;

        try {
          const { processImageForRecord } = await import('../services/imageRecordService.js');
          const BusinessRecord = (await import('../models/Record.js')).default;
          const { IntelligenceEngine } = await import('../services/intelligenceEngine.js');

          const processedData = await processImageForRecord(filePath, originalName);

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
      if (job) console.log(`Upload processing completed for job ${job.id}`);
    });

    uploadProcessingWorker.on('failed', (job, err) => {
      if (job) console.error(`Upload processing failed for job ${job.id}:`, err);
    });

    console.log('✅ Upload worker initialized');
    return uploadProcessingWorker;
  } catch (error) {
    console.warn('⚠️ Upload worker could not be initialized:', error);
    return null;
  }
};

export default uploadProcessingWorker;