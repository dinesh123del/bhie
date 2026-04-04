import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import ImageIntelligence, {
  DetectedObject,
  ImageDetectedType,
  ImageIntelligenceDocument,
  OCRLine,
  OCRWord,
  StructuredData,
} from '../models/ImageIntelligence';
import { env } from '../config/env';

interface ProcessedPayload {
  extractedText: string;
  normalizedText: string;
  ocrBlocks: {
    lines: OCRLine[];
    words: OCRWord[];
  };
  detectedObjects: DetectedObject[];
  detectedType: ImageDetectedType;
  tags: string[];
  confidenceScore: number;
  structuredData: StructuredData;
  imageEmbedding: number[];
  imageHash: string;
}

interface SearchFilters {
  type?: ImageDetectedType;
  dateFrom?: Date;
  dateTo?: Date;
}

interface RankedSearchResult {
  item: ImageIntelligenceDocument;
  relevance: number;
}

interface SimilarityResult {
  item: ImageIntelligenceDocument;
  similarity: number;
}

interface QueueJob {
  recordId: string;
  filePath: string;
  mimeType: string;
  originalName: string;
}

const queue: QueueJob[] = [];
let activeJobs = 0;
const maxConcurrency = env.IMAGE_PROCESSING_CONCURRENCY;

const analysisCache = new Map<string, { expiresAt: number; payload: Omit<ProcessedPayload, 'imageEmbedding' | 'imageHash'> }>();
const CACHE_TTL_MS = 1000 * 60 * 30;

const OPENAI_KEY = env.OPENAI_API_KEY;
const openAIVisionEnabled =
  Boolean(OPENAI_KEY) &&
  OPENAI_KEY !== 'your-openai-key-here' &&
  OPENAI_KEY !== 'your-openai-api-key';

const openaiClient = openAIVisionEnabled
  ? new OpenAI({ apiKey: OPENAI_KEY })
  : null;

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'was', 'are', 'you', 'your', 'have', 'has',
  'had', 'not', 'all', 'any', 'but', 'our', 'their', 'his', 'her', 'its', 'can', 'may', 'will', 'new',
  'old', 'per', 'each', 'item', 'total', 'amount', 'invoice', 'date', 'name', 'price', 'qty', 'quantity',
]);

const objectKeywordMap: Array<{ label: string; keywords: string[]; confidence: number }> = [
  { label: 'invoice', keywords: ['invoice', 'bill', 'tax', 'subtotal', 'amount due', 'gst', 'vat'], confidence: 0.95 },
  { label: 'product', keywords: ['product', 'item', 'sku', 'barcode', 'catalog'], confidence: 0.82 },
  { label: 'plastic', keywords: ['plastic', 'polymer', 'pet', 'hdpe', 'pvc'], confidence: 0.84 },
  { label: 'metal', keywords: ['metal', 'steel', 'iron', 'aluminum', 'copper'], confidence: 0.84 },
  { label: 'bottle', keywords: ['bottle', 'container', 'packaging'], confidence: 0.79 },
  { label: 'document', keywords: ['document', 'report', 'statement', 'contract', 'terms'], confidence: 0.7 },
];

export function enqueueImageProcessing(job: QueueJob): void {
  queue.push(job);
  processQueue();
}

async function processQueue(): Promise<void> {
  if (activeJobs >= maxConcurrency || queue.length === 0) {
    return;
  }

  const job = queue.shift();
  if (!job) {
    return;
  }

  activeJobs += 1;

  void processImageJob(job)
    .catch((error: unknown) => {
      console.error('Image processing job failed:', error);
    })
    .finally(() => {
      activeJobs -= 1;
      void processQueue();
    });

  if (activeJobs < maxConcurrency) {
    void processQueue();
  }
}

async function processImageJob(job: QueueJob): Promise<void> {
  const record = await ImageIntelligence.findById(job.recordId);
  if (!record) {
    return;
  }

  await ImageIntelligence.findByIdAndUpdate(job.recordId, {
    processingStatus: 'processing',
    processingError: '',
  });

  try {
    const imageBuffer = await fs.readFile(job.filePath);
    const imageEmbedding = createBinaryEmbedding(imageBuffer, 128);
    const imageHash = createBinarySignature(imageEmbedding);

    const cacheKey = `v1:${imageHash}`;
    const cached = analysisCache.get(cacheKey);
    const cachedValid = Boolean(cached && cached.expiresAt > Date.now());

    let analysis: Omit<ProcessedPayload, 'imageEmbedding' | 'imageHash'>;

    if (cached && cachedValid) {
      analysis = cached.payload;
    } else {
      analysis = await runImageAnalysis({
        filePath: job.filePath,
        mimeType: job.mimeType,
        originalName: job.originalName,
        imageBuffer,
      });

      analysisCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        payload: analysis,
      });
    }

    await ImageIntelligence.findByIdAndUpdate(job.recordId, {
      ...analysis,
      imageEmbedding,
      imageHash,
      processingStatus: 'completed',
      processingError: '',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown processing error';

    await ImageIntelligence.findByIdAndUpdate(job.recordId, {
      processingStatus: 'failed',
      processingError: message,
    });
  }
}

async function runImageAnalysis(input: {
  filePath: string;
  mimeType: string;
  originalName: string;
  imageBuffer: Buffer;
}): Promise<Omit<ProcessedPayload, 'imageEmbedding' | 'imageHash'>> {
  const ocr = await extractOCR(input.filePath);
  const objectDetection = await detectObjects({
    filePath: input.filePath,
    mimeType: input.mimeType,
    originalName: input.originalName,
    imageBuffer: input.imageBuffer,
    normalizedText: ocr.normalizedText,
  });

  const structuredData = extractStructuredData(ocr.normalizedText, ocr.ocrBlocks.lines);
  const tags = generateTags({
    normalizedText: ocr.normalizedText,
    detectedObjects: objectDetection.detectedObjects,
    detectedType: objectDetection.detectedType,
    structuredData,
  });

  const confidenceScore = computeConfidenceScore({
    ocrBlocks: ocr.ocrBlocks,
    detectedObjects: objectDetection.detectedObjects,
    structuredData,
  });

  return {
    extractedText: ocr.extractedText,
    normalizedText: ocr.normalizedText,
    ocrBlocks: ocr.ocrBlocks,
    detectedObjects: objectDetection.detectedObjects,
    detectedType: objectDetection.detectedType,
    tags,
    confidenceScore,
    structuredData,
  };
}

async function extractOCR(filePath: string): Promise<{
  extractedText: string;
  normalizedText: string;
  ocrBlocks: {
    lines: OCRLine[];
    words: OCRWord[];
  };
}> {
  try {
    const result = await Tesseract.recognize(filePath, 'eng');
    const pageData = result.data as unknown as {
      text?: string;
      lines?: Array<{ text?: string; confidence?: number }>;
      words?: Array<{ text?: string; confidence?: number }>;
    };

    const rawText = pageData.text || '';

    const lines = (pageData.lines || [])
      .map((line: any) => ({
        text: cleanText(String(line.text || '')),
        confidence: normalizeConfidence(Number(line.confidence || 0)),
      }))
      .filter((line: OCRLine) => line.text.length > 0)
      .slice(0, 400);

    const words = (pageData.words || [])
      .map((word: any) => ({
        text: cleanText(String(word.text || '')),
        confidence: normalizeConfidence(Number(word.confidence || 0)),
      }))
      .filter((word: OCRWord) => word.text.length > 0)
      .slice(0, 1200);

    const normalizedText = normalizeText(rawText);

    return {
      extractedText: rawText.trim(),
      normalizedText,
      ocrBlocks: { lines, words },
    };
  } catch (error: unknown) {
    console.error('OCR failed:', error);

    return {
      extractedText: '',
      normalizedText: '',
      ocrBlocks: { lines: [], words: [] },
    };
  }
}

async function detectObjects(input: {
  filePath: string;
  mimeType: string;
  originalName: string;
  imageBuffer: Buffer;
  normalizedText: string;
}): Promise<{ detectedObjects: DetectedObject[]; detectedType: ImageDetectedType }> {
  if (openAIVisionEnabled && openaiClient) {
    try {
      const visionResult = await detectObjectsWithOpenAI(input);
      if (visionResult.detectedObjects.length > 0) {
        return visionResult;
      }
    } catch (error: unknown) {
      console.error('OpenAI vision detection failed, using heuristic detector:', error);
    }
  }

  return detectObjectsHeuristically(input.normalizedText, input.originalName);
}

async function detectObjectsWithOpenAI(input: {
  mimeType: string;
  imageBuffer: Buffer;
  normalizedText: string;
}): Promise<{ detectedObjects: DetectedObject[]; detectedType: ImageDetectedType }> {
  if (!openaiClient) {
    return { detectedObjects: [], detectedType: 'unknown' };
  }

  const base64 = input.imageBuffer.toString('base64');
  const safeMime = input.mimeType || 'image/jpeg';

  const response = await openaiClient.chat.completions.create({
    model: env.OPENAI_VISION_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an image intelligence engine. Return strict JSON with keys detectedType and detectedObjects. detectedType must be one of invoice,material,product,document,unknown. detectedObjects must be an array of {label,confidence} with confidence between 0 and 1.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `OCR context: ${input.normalizedText.slice(0, 2400)}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${safeMime};base64,${base64}`,
            },
          },
        ] as any,
      },
    ],
    max_tokens: 900,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { detectedObjects: [], detectedType: 'unknown' };
  }

  const parsed = parseJsonSafely(content);

  const detectedType = normalizeDetectedType(String(parsed?.detectedType || 'unknown'));
  const rawObjects = Array.isArray(parsed?.detectedObjects) ? parsed.detectedObjects : [];

  const detectedObjects = rawObjects
    .map((obj: any) => ({
      label: cleanTag(String(obj?.label || 'unknown')),
      confidence: clamp(Number(obj?.confidence || 0), 0, 1),
    }))
    .filter((obj: DetectedObject) => obj.label.length > 0 && obj.confidence > 0)
    .slice(0, 20);

  return { detectedObjects, detectedType };
}

function detectObjectsHeuristically(
  normalizedText: string,
  originalName: string
): { detectedObjects: DetectedObject[]; detectedType: ImageDetectedType } {
  const haystack = `${normalizedText} ${normalizeText(originalName)}`;
  const found: DetectedObject[] = [];

  for (const rule of objectKeywordMap) {
    const hits = rule.keywords.filter((keyword) => haystack.includes(keyword)).length;
    if (hits > 0) {
      found.push({
        label: rule.label,
        confidence: clamp(rule.confidence + hits * 0.03, 0, 0.99),
      });
    }
  }

  const deduped = dedupeDetectedObjects(found);
  const detectedType = classifyTypeFromObjects(deduped, haystack);

  if (deduped.length === 0 && normalizedText.length > 15) {
    return {
      detectedObjects: [{ label: 'document', confidence: 0.55 }],
      detectedType: 'document',
    };
  }

  return {
    detectedObjects: deduped,
    detectedType,
  };
}

function dedupeDetectedObjects(objects: DetectedObject[]): DetectedObject[] {
  const byLabel = new Map<string, number>();

  for (const object of objects) {
    const label = cleanTag(object.label);
    if (!label) {
      continue;
    }

    const existing = byLabel.get(label) || 0;
    byLabel.set(label, Math.max(existing, object.confidence));
  }

  return Array.from(byLabel.entries())
    .map(([label, confidence]) => ({ label, confidence }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);
}

function classifyTypeFromObjects(objects: DetectedObject[], normalizedText: string): ImageDetectedType {
  const scoreByType: Record<ImageDetectedType, number> = {
    invoice: 0,
    material: 0,
    product: 0,
    document: 0,
    unknown: 0,
  };

  for (const object of objects) {
    if (object.label === 'invoice') scoreByType.invoice += object.confidence;
    if (object.label === 'plastic' || object.label === 'metal') scoreByType.material += object.confidence;
    if (object.label === 'product' || object.label === 'bottle') scoreByType.product += object.confidence;
    if (object.label === 'document') scoreByType.document += object.confidence;
  }

  if (/(invoice|amount due|tax invoice|bill to)/.test(normalizedText)) {
    scoreByType.invoice += 0.45;
  }
  if (/(plastic|metal|scrap|polymer|steel|copper)/.test(normalizedText)) {
    scoreByType.material += 0.4;
  }
  if (/(sku|product code|catalog|mrp|pack)/.test(normalizedText)) {
    scoreByType.product += 0.35;
  }
  if (/(report|statement|document|agreement|contract)/.test(normalizedText)) {
    scoreByType.document += 0.3;
  }

  const sorted = Object.entries(scoreByType)
    .filter(([type]) => type !== 'unknown')
    .sort((a, b) => b[1] - a[1]);

  if (!sorted.length || sorted[0][1] <= 0) {
    return 'unknown';
  }

  return sorted[0][0] as ImageDetectedType;
}

function extractStructuredData(normalizedText: string, lines: OCRLine[]): StructuredData {
  const prices = extractNumbers(normalizedText, [
    /(?:inr|rs\.?|usd|eur|gbp|\$|€|₹)\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/gi,
    /(?:total|amount|price|cost|grand total|subtotal)\s*[:=]?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/gi,
  ]);

  const quantities = extractNumbers(normalizedText, [
    /(?:qty|quantity|units?|pcs|pieces)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/gi,
  ]);

  const dates = extractDates(normalizedText);

  const productNames = extractProductNames(lines, normalizedText);

  const rawMatches = [
    ...prices.map((price) => `price:${price}`),
    ...quantities.map((quantity) => `quantity:${quantity}`),
    ...dates.map((date) => `date:${date}`),
    ...productNames.map((name) => `product:${name}`),
  ];

  return {
    prices,
    quantities,
    dates,
    productNames,
    rawMatches,
  };
}

function extractNumbers(input: string, patterns: RegExp[]): number[] {
  const values: number[] = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      const candidate = match[1].replace(/,/g, '');
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed)) {
        values.push(parsed);
      }
    }
  }

  return uniqueNumbers(values).slice(0, 20);
}

function extractDates(input: string): string[] {
  const patterns = [
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g,
    /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/g,
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}\b/gi,
  ];

  const results = new Set<string>();

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      results.add(match[0]);
    }
  }

  return Array.from(results).slice(0, 20);
}

function extractProductNames(lines: OCRLine[], normalizedText: string): string[] {
  const candidates = new Set<string>();
  const keywordPattern = /(product|item|description|material|model|sku|part)/;

  for (const line of lines) {
    const value = cleanText(line.text);
    if (!value || value.length < 3 || value.length > 80) {
      continue;
    }

    const lower = value.toLowerCase();

    if (keywordPattern.test(lower)) {
      candidates.add(value);
      continue;
    }

    if (/^[a-z][a-z0-9\-\s]{2,60}$/i.test(value) && /[a-z]/i.test(value) && /\d/.test(value)) {
      candidates.add(value);
    }
  }

  const entityPattern = /\b([a-z][a-z0-9\-]{2,}(?:\s+[a-z0-9\-]{2,}){0,3})\b/gi;
  let match: RegExpExecArray | null;

  while ((match = entityPattern.exec(normalizedText)) !== null) {
    const token = cleanText(match[1]);
    if (
      token.length >= 4 &&
      token.length <= 50 &&
      !stopWords.has(token.toLowerCase()) &&
      /[a-z]/i.test(token)
    ) {
      candidates.add(token);
    }

    if (candidates.size > 60) {
      break;
    }
  }

  return Array.from(candidates).slice(0, 20);
}

function generateTags(input: {
  normalizedText: string;
  detectedObjects: DetectedObject[];
  detectedType: ImageDetectedType;
  structuredData: StructuredData;
}): string[] {
  const tagScore = new Map<string, number>();

  const pushTag = (rawTag: string, score: number): void => {
    const tag = cleanTag(rawTag);
    if (!tag) {
      return;
    }

    const current = tagScore.get(tag) || 0;
    tagScore.set(tag, current + score);
  };

  pushTag(input.detectedType, 10);

  for (const object of input.detectedObjects) {
    pushTag(object.label, 8 + object.confidence * 8);
  }

  for (const name of input.structuredData.productNames) {
    pushTag(name, 6);
  }

  const tokens = input.normalizedText
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && token.length <= 24 && !stopWords.has(token));

  const frequency = new Map<string, number>();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  for (const [token, count] of frequency.entries()) {
    if (count >= 2) {
      pushTag(token, count);
    }
  }

  if (input.structuredData.prices.length > 0) pushTag('price-data', 4);
  if (input.structuredData.quantities.length > 0) pushTag('quantity-data', 4);
  if (input.structuredData.dates.length > 0) pushTag('date-data', 3);

  return Array.from(tagScore.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([tag]) => tag);
}

function computeConfidenceScore(input: {
  ocrBlocks: { lines: OCRLine[]; words: OCRWord[] };
  detectedObjects: DetectedObject[];
  structuredData: StructuredData;
}): number {
  const ocrConfidence =
    input.ocrBlocks.words.length > 0
      ? average(input.ocrBlocks.words.map((word) => word.confidence))
      : input.ocrBlocks.lines.length > 0
      ? average(input.ocrBlocks.lines.map((line) => line.confidence))
      : 0;

  const detectionConfidence =
    input.detectedObjects.length > 0
      ? average(input.detectedObjects.map((object) => object.confidence))
      : 0;

  const structureSignals = [
    input.structuredData.prices.length > 0,
    input.structuredData.quantities.length > 0,
    input.structuredData.dates.length > 0,
    input.structuredData.productNames.length > 0,
  ].filter(Boolean).length;

  const structureConfidence = structureSignals / 4;

  const blended = ocrConfidence * 0.42 + detectionConfidence * 0.38 + structureConfidence * 0.2;
  return Number(clamp(blended, 0, 1).toFixed(4));
}

export async function searchImageIntelligence(params: {
  userId: string;
  query: string;
  filters?: SearchFilters;
  limit?: number;
}): Promise<RankedSearchResult[]> {
  const { userId, query, filters, limit = 50 } = params;
  const safeQuery = query.trim();
  if (!safeQuery) {
    return [];
  }

  const regex = new RegExp(escapeRegExp(safeQuery), 'i');
  const mongoFilter: Record<string, unknown> = {
    userId,
    processingStatus: 'completed',
    $or: [
      { extractedText: regex },
      { normalizedText: regex },
      { tags: regex },
      { 'detectedObjects.label': regex },
      { 'structuredData.productNames': regex },
      { 'structuredData.rawMatches': regex },
    ],
  };

  if (filters?.type) {
    mongoFilter.detectedType = filters.type;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (filters.dateFrom) createdAt.$gte = filters.dateFrom;
    if (filters.dateTo) createdAt.$lte = filters.dateTo;
    mongoFilter.createdAt = createdAt;
  }

  const docs = await ImageIntelligence.find(mongoFilter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return docs
    .map((item) => ({ item, relevance: computeRelevanceScore(item, safeQuery) }))
    .sort((a, b) => b.relevance - a.relevance);
}

function computeRelevanceScore(item: ImageIntelligenceDocument, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  const normalizedText = (item.normalizedText || '').toLowerCase();
  const extractedText = (item.extractedText || '').toLowerCase();

  if (item.tags.some((tag) => tag.toLowerCase() === q)) {
    score += 60;
  }

  score += item.tags.filter((tag) => tag.toLowerCase().includes(q)).length * 18;
  score += item.detectedObjects.filter((object) => object.label.toLowerCase().includes(q)).length * 22;

  if (normalizedText.includes(q)) {
    score += 28 + Math.min(24, countOccurrences(normalizedText, q) * 3);
  }

  if (extractedText.includes(q)) {
    score += 16 + Math.min(20, countOccurrences(extractedText, q) * 2);
  }

  score += item.structuredData.productNames.filter((name) => name.toLowerCase().includes(q)).length * 16;
  score += item.structuredData.rawMatches.filter((match) => match.toLowerCase().includes(q)).length * 12;

  score += Math.round(item.confidenceScore * 10);

  const freshnessBoost = Math.max(0, 6 - daysBetween(item.createdAt, new Date()) * 0.15);
  score += freshnessBoost;

  return Number(score.toFixed(2));
}

export async function reverseImageSearch(params: {
  userId: string;
  fileBuffer: Buffer;
  limit?: number;
}): Promise<SimilarityResult[]> {
  const { userId, fileBuffer, limit = 10 } = params;

  const queryEmbedding = createBinaryEmbedding(fileBuffer, 128);
  const queryHash = createBinarySignature(queryEmbedding);

  const docs = await ImageIntelligence.find({
    userId,
    processingStatus: 'completed',
    imageEmbedding: { $exists: true, $ne: [] },
  }).sort({ createdAt: -1 });

  const ranked = docs
    .map((item) => {
      const embedding = Array.isArray(item.imageEmbedding) ? item.imageEmbedding : [];
      const vectorSimilarity = cosineSimilarity(queryEmbedding, embedding);
      const hashSimilarity = hashSimilarityRatio(queryHash, item.imageHash || '');
      const similarity = Number((vectorSimilarity * 0.72 + hashSimilarity * 0.28).toFixed(4));
      return { item, similarity };
    })
    .filter((result) => result.similarity > 0.2)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return ranked;
}

function createBinaryEmbedding(buffer: Buffer, dimensions: number): number[] {
  const safeDimensions = Math.max(8, Math.min(512, dimensions));
  if (buffer.length === 0) {
    return Array.from({ length: safeDimensions }, () => 0);
  }

  const chunkSize = Math.max(1, Math.floor(buffer.length / safeDimensions));
  const raw: number[] = [];

  for (let i = 0; i < safeDimensions; i += 1) {
    const start = i * chunkSize;
    const end = i === safeDimensions - 1 ? buffer.length : Math.min(buffer.length, start + chunkSize);

    if (start >= buffer.length) {
      raw.push(0);
      continue;
    }

    let sum = 0;
    for (let idx = start; idx < end; idx += 1) {
      sum += buffer[idx];
    }

    const avgByte = sum / Math.max(1, end - start);
    raw.push(avgByte / 255);
  }

  return normalizeVector(raw);
}

function createBinarySignature(vector: number[]): string {
  if (!vector.length) {
    return '';
  }

  const mean = average(vector);
  return vector.map((value) => (value >= mean ? '1' : '0')).join('');
}

function hashSimilarityRatio(hashA: string, hashB: string): number {
  if (!hashA || !hashB) {
    return 0;
  }

  const length = Math.min(hashA.length, hashB.length);
  if (length === 0) {
    return 0;
  }

  let same = 0;
  for (let i = 0; i < length; i += 1) {
    if (hashA[i] === hashB[i]) {
      same += 1;
    }
  }

  return same / length;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }

  if (aNorm === 0 || bNorm === 0) {
    return 0;
  }

  return clamp(dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm)), 0, 1);
}

function normalizeVector(input: number[]): number[] {
  const norm = Math.sqrt(input.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) {
    return input.map(() => 0);
  }

  return input.map((value) => Number((value / norm).toFixed(8)));
}

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,:;\-/#$%₹€]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanTag(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-');
}

function normalizeConfidence(confidence: number): number {
  if (Number.isNaN(confidence)) {
    return 0;
  }

  if (confidence > 1) {
    return Number((confidence / 100).toFixed(4));
  }

  return Number(clamp(confidence, 0, 1).toFixed(4));
}

function normalizeDetectedType(value: string): ImageDetectedType {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'invoice') return 'invoice';
  if (normalized === 'material') return 'material';
  if (normalized === 'product') return 'product';
  if (normalized === 'document') return 'document';
  return 'unknown';
}

function parseJsonSafely(input: string): Record<string, unknown> {
  try {
    return JSON.parse(input) as Record<string, unknown>;
  } catch {
    const trimmed = input.trim();
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');

    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return {};
      }
    }

    return {};
  }
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function countOccurrences(input: string, term: string): number {
  if (!input || !term) {
    return 0;
  }

  let count = 0;
  let index = 0;

  while (index < input.length) {
    const found = input.indexOf(term, index);
    if (found === -1) {
      break;
    }

    count += 1;
    index = found + term.length;
  }

  return count;
}

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values.map((value) => Number(value.toFixed(4)))));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function daysBetween(a: Date, b: Date): number {
  const diff = Math.abs(b.getTime() - a.getTime());
  return diff / (1000 * 60 * 60 * 24);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveUploadPath(filename: string): string {
  return path.join(process.cwd(), 'uploads', filename);
}

export function createFileFingerprint(buffer: Buffer): string {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}
