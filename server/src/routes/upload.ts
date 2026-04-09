import fs from 'fs/promises';
import express, { Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { CacheService } from '../services/cacheService.js';
import Image from '../models/Image.js';
import ImageIntelligence, {
  ImageDetectedType,
  ImageIntelligenceDocument,
  ImageProcessingStatus,
} from '../models/ImageIntelligence.js';
import BusinessRecord from '../models/Record.js';
import Upload from '../models/Upload.js';
import User from '../models/User.js';
import {
  detectFileType,
  processUploadedFile,
} from '../services/fileRecordService.js';
import {
  enqueueImageProcessing,
  reverseImageSearch,
} from '../services/imageIntelligenceService.js';
import { processImageForRecord } from '../services/imageRecordService.js';
import { AuthRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';
import { cleanupFiles, ensureUploadDir, uploadDir } from '../utils/uploads.js';
import { requireUser } from '../utils/request.js';

const router = express.Router();

const supportedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/heic',
]);

const supportedRecordMimeTypes = new Set([
  ...supportedMimeTypes,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
]);

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, uploadDir);
    } catch {
      cb(new AppError(500, 'Failed to create upload directory'), uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!supportedMimeTypes.has(file.mimetype.toLowerCase())) {
    cb(new AppError(415, 'Unsupported image type. Use JPG, PNG, WEBP, GIF, BMP, TIFF, HEIC.'));
    return;
  }

  cb(null, true);
};

const recordFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  try {
    detectFileType(file.originalname, file.mimetype);
  } catch {
    cb(new AppError(415, 'Unsupported file type. Upload images, PDF, DOC/DOCX, or ZIP files.'));
    return;
  }

  if (!supportedRecordMimeTypes.has(file.mimetype.toLowerCase()) && file.mimetype !== 'application/octet-stream') {
    cb(new AppError(415, 'Unsupported file type. Upload images, PDF, DOC/DOCX, or ZIP files.'));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: env.MAX_UPLOAD_FILE_SIZE_BYTES,
  },
});

const recordUpload = multer({
  storage,
  fileFilter: recordFileFilter,
  limits: {
    files: 10,
    fileSize: env.MAX_UPLOAD_FILE_SIZE_BYTES,
  },
});

const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

const recordUploadFields = recordUpload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'files', maxCount: 10 },
  { name: 'file', maxCount: 10 },
]);

router.use(authenticateToken);

router.get(
  '/images',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const page = Math.max(1, Number(req.query.page || 1));
    const type = req.query.type ? String(req.query.type) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : undefined;
    const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)) : undefined;

    const query: globalThis.Record<string, unknown> = 
      user.role === 'admin' ? {} : { userId: user.userId };

    if (type && isDetectedType(type)) {
      query.detectedType = type;
    }

    if (status && isProcessingStatus(status)) {
      query.processingStatus = status;
    }

    if (dateFrom || dateTo) {
      const createdAt: { $gte?: Date; $lte?: Date } = {};
      if (dateFrom && !Number.isNaN(dateFrom.getTime())) {
        createdAt.$gte = dateFrom;
      }
      if (dateTo && !Number.isNaN(dateTo.getTime())) {
        createdAt.$lte = dateTo;
      }
      query.createdAt = createdAt;
    }

    const [items, total] = await Promise.all([
      ImageIntelligence.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ImageIntelligence.countDocuments(query),
    ]);

    res.json({
      items: items.map((item) => formatImageRecord(item as unknown as ImageIntelligenceDocument)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

router.get('/uploads', (_req, res) => {
  res.redirect(307, '/api/upload/images');
});

router.get(
  '/images/:id([a-fA-F0-9]{24})',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const item = await ImageIntelligence.findOne(
      user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, userId: user.userId }
    );

    if (!item) {
      throw new AppError(404, 'Image record not found');
    }

    res.json(formatImageRecord(item as unknown as ImageIntelligenceDocument));
  })
);

router.get('/uploads/:id([a-fA-F0-9]{24})', (_req, res) => {
  res.redirect(307, `/api/upload/images/${_req.params.id}`);
});

router.get(
  '/images/:id([a-fA-F0-9]{24})/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const item = await ImageIntelligence.findOne(
      { _id: req.params.id, userId: user.userId },
      {
        processingStatus: 1,
        processingError: 1,
        confidenceScore: 1,
        detectedType: 1,
        tags: 1,
        updatedAt: 1,
      }
    );

    if (!item) {
      throw new AppError(404, 'Image record not found');
    }

    res.json({
      id: item._id,
      processingStatus: item.processingStatus,
      processingError: item.processingError,
      confidenceScore: item.confidenceScore,
      detectedType: item.detectedType,
      tags: item.tags,
      updatedAt: item.updatedAt,
    });
  })
);

router.post(
  '/images',
  uploadFields,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await handleImageUpload(req, res);
  })
);

router.post(
  '/simple',
  upload.single('file'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const uploadedFile = req.file;

    if (!uploadedFile) {
      throw new AppError(400, 'No file uploaded');
    }

    try {
      const uploadEntry = await Upload.create({
        userId: new mongoose.Types.ObjectId(user.userId),
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        fileUrl: `/uploads/${uploadedFile.filename}`,
        fileType: 'document',
        status: 'completed',
        parsedData: {
          rawText: '',
          amount: 0,
          category: 'other',
          type: 'document',
        },
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: uploadEntry._id,
          filename: uploadEntry.filename,
          originalName: uploadEntry.originalName,
          size: uploadEntry.size,
          mimetype: uploadEntry.mimetype,
          fileUrl: uploadEntry.fileUrl,
          status: uploadEntry.status,
          createdAt: uploadEntry.createdAt,
        },
      });
    } catch (error) {
      await cleanupFiles([uploadedFile]);
      throw error;
    }
  })
);

router.post(
  '/',
  recordUploadFields,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await handleRecordUpload(req, res);
  })
);

router.post(
  '/images/similar',
  upload.single('image'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const queryImage = req.file;

    if (!queryImage) {
      throw new AppError(400, 'No query image uploaded');
    }

    try {
      const limit = Math.min(20, Math.max(1, Number(req.body.limit || req.query.limit || 10)));
      const fileBuffer = await fs.readFile(queryImage.path);

      const similarItems = await reverseImageSearch({
        userId: user.userId,
        fileBuffer,
        limit,
      });

      res.json({
        query: {
          name: queryImage.originalname,
          mimeType: queryImage.mimetype,
          size: queryImage.size,
        },
        results: similarItems.map((entry) => ({
          similarity: entry.similarity,
          ...formatImageRecord(entry.item),
        })),
      });
    } finally {
      await cleanupFiles(queryImage ? [queryImage] : undefined);
    }
  })
);

async function handleImageUpload(req: AuthRequest, res: Response): Promise<void> {
  const user = requireUser(req);
  const uploadedFiles = collectUploadedFiles(req);

  if (uploadedFiles.length === 0) {
    throw new AppError(400, 'No images uploaded');
  }

  try {
    const queuedRecords = await ImageIntelligence.insertMany(
      uploadedFiles.map((file) => ({
        userId: user.userId,
        imageUrl: `/uploads/${file.filename}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extractedText: '',
        normalizedText: '',
        ocrBlocks: { lines: [], words: [] },
        detectedObjects: [],
        detectedType: 'unknown',
        tags: [],
        confidenceScore: 0,
        structuredData: {
          prices: [],
          quantities: [],
          dates: [],
          productNames: [],
          rawMatches: [],
        },
        imageEmbedding: [],
        imageHash: '',
        processingStatus: 'queued',
        processingError: '',
      }))
    );

    queuedRecords.forEach((record, index) => {
      const sourceFile = uploadedFiles[index];

      enqueueImageProcessing({
        recordId: String(record._id),
        filePath: sourceFile.path,
        mimeType: sourceFile.mimetype,
        originalName: sourceFile.originalname,
      });
    });

    res.status(202).json({
      message: 'Images uploaded and queued for AI processing',
      count: queuedRecords.length,
      files: queuedRecords.map((item) => formatImageRecord(item as unknown as ImageIntelligenceDocument)),
    });
  } catch (error) {
    await cleanupFiles(uploadedFiles);
    throw error;
  }
}

function collectUploadedFiles(req: AuthRequest): any[] {
  const files = req.files;

  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return files;
  }

  const byField = files as any;
  return [...(byField.images || []), ...(byField.image || []), ...(byField.files || []), ...(byField.file || [])];
}

async function handleRecordUpload(req: AuthRequest, res: Response): Promise<void> {
  const authUser = requireUser(req);
  const uploadedFiles = collectUploadedFiles(req);

  if (uploadedFiles.length === 0) {
    throw new AppError(400, 'No files uploaded');
  }

  const user = await User.findById(authUser.userId);

  if (!user) {
    await cleanupFiles(uploadedFiles);
    throw new AppError(404, 'User not found');
  }

  if (typeof user.refreshSubscriptionStatus === 'function') {
    await user.refreshSubscriptionStatus();
  }

  const hasPremiumAccess =
    typeof user.hasPremiumAccess === 'function' ? user.hasPremiumAccess() : false;
  const remainingSlots = hasPremiumAccess ? uploadedFiles.length : Math.max(0, 5 - (user.usageCount || 0));

  if (!hasPremiumAccess && uploadedFiles.length > remainingSlots) {
    await cleanupFiles(uploadedFiles);
    throw new AppError(403, "You've reached your free limit", { details: { limitReached: true } });
  }

  const items: Array<globalThis.Record<string, unknown>> = [];

  try {
    for (const file of uploadedFiles) {
      const fileType = detectFileType(file.originalname, file.mimetype);
      const processedItems =
        fileType === 'image'
          ? [
              {
                ...(await processImageForRecord(file.path, file.originalname)),
                sourceName: file.originalname,
                fileType,
              },
            ]
          : await processUploadedFile(file.path, file.originalname, file.mimetype);

      for (const processed of processedItems) {
        const imageUrl = `/uploads/${file.filename}`;

        const record = await BusinessRecord.create({
          userId: authUser.userId,
          title: processed.businessName || buildRecordTitle(processed.category, processed.detectedType, processed.sourceName),
          type: processed.detectedType === 'unknown' ? 'expense' : processed.detectedType,
          amount: processed.amount,
          category: processed.category,
          date: processed.date,
          description: processed.extractedText || `Created from ${processed.fileType.toUpperCase()} upload: ${processed.sourceName}`,
          status: 'completed',
          fileUrl: imageUrl,
          gstNumber: processed.gstNumber,
          gstDetails: processed.gstDetails,
        });

        const uploadEntry = await Upload.create({
          userId: new mongoose.Types.ObjectId(authUser.userId),
          filename: file.filename,
          originalName: processed.sourceName,
          size: file.size,
          mimetype: file.mimetype,
          fileUrl: imageUrl,
          fileType: processed.fileType,
          status: 'completed',
          parsedData: {
            rawText: processed.extractedText,
            amount: processed.amount,
            category: processed.category,
            type: processed.detectedType,
            amountMatch: processed.amountMatch,
            date: processed.date,
            sourceArchive: processed.sourceName !== file.originalname ? file.originalname : undefined,
          },
        });

        let image: mongoose.Document | null = null;

        if (processed.fileType === 'image') {
          image = await Image.create({
            userId: new mongoose.Types.ObjectId(authUser.userId),
            imageUrl,
            extractedText: processed.extractedText,
            detectedType: processed.detectedType,
            category: processed.category,
            amount: processed.amount,
            recordId: record._id,
          });
        }

        user.usageCount = (user.usageCount || 0) + 1;

        items.push({
          file: {
            id: uploadEntry._id,
            fileType: processed.fileType,
            originalName: processed.sourceName,
            archiveName: processed.sourceName !== file.originalname ? file.originalname : null,
            fileUrl: uploadEntry.fileUrl,
            mimeType: uploadEntry.mimetype,
            createdAt: uploadEntry.get('createdAt'),
          },
          image: image
            ? {
                id: image._id,
                imageUrl: image.get('imageUrl'),
                extractedText: image.get('extractedText'),
                detectedType: image.get('detectedType'),
                category: image.get('category'),
                amount: image.get('amount'),
                createdAt: image.get('createdAt'),
              }
            : null,
          record: {
            id: record._id,
            type: record.type,
            amount: record.amount,
            category: record.category,
            date: record.date,
            title: record.title,
          },
          extracted: {
            rawText: processed.extractedText,
            amount: processed.amount,
            type: processed.detectedType,
            category: processed.category,
            date: processed.date,
            amountMatch: processed.amountMatch,
            businessName: processed.businessName,
            gstNumber: processed.gstNumber,
            gstDetails: processed.gstDetails,
            isUnclear: processed.isUnclear,
            missingFields: processed.missingFields,
            integrityScore: processed.integrityScore,
          },
        });
      }
    }

    await user.save();

    CacheService.invalidateUserCache(authUser.userId).catch(console.error);

    res.status(201).json({
      message: 'Files processed and records saved',
      count: items.length,
      items,
    });
  } catch (error) {
    await cleanupFiles(uploadedFiles);
    throw error;
  }
}

function isDetectedType(value: string): value is ImageDetectedType {
  return ['invoice', 'material', 'product', 'document', 'unknown'].includes(value);
}

function isProcessingStatus(value: string): value is ImageProcessingStatus {
  return ['queued', 'processing', 'completed', 'failed'].includes(value);
}

function formatImageRecord(item: ImageIntelligenceDocument): Record<string, unknown> {
  return {
    id: item._id,
    imageUrl: item.imageUrl,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size,
    extractedText: item.extractedText,
    detectedObjects: item.detectedObjects,
    detectedType: item.detectedType,
    tags: item.tags,
    confidenceScore: item.confidenceScore,
    structuredData: item.structuredData,
    processingStatus: item.processingStatus,
    processingError: item.processingError,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export default router;

function buildRecordTitle(category: string, detectedType: string, originalName: string): string {
  const cleanedCategory = category === 'other' ? 'Uploaded image' : titleCase(category);
  const safeName = originalName.replace(/\.[^.]+$/, '').trim();

  if (safeName) {
    return `${cleanedCategory} - ${safeName}`;
  }

  return `${cleanedCategory} ${detectedType === 'income' ? 'Income' : 'Expense'}`;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
