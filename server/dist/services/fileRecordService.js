import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { AppError } from '../utils/appError.js';
import { processDocument } from './documentIntelligenceService.js';
export const AMOUNT_EXTRACTION_REGEX = /(?:grand\s*total|total\s*amount|amount\s*due|net\s*amount|subtotal|total|amount|amt|paid|received|balance|inr|rs\.?|₹|\$)\s*[:\-]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{1,2})?|[0-9]+(?:\.\d{1,2})?)/gi;
export async function processUploadedFile(filePath, originalName, mimeType) {
    const buffer = await fs.readFile(filePath);
    return processBuffer(buffer, originalName, mimeType);
}
export async function processBuffer(buffer, originalName, mimeType) {
    const fileType = detectFileType(originalName, mimeType);
    if (fileType === 'zip') {
        return processZipBuffer(buffer, originalName);
    }
    const payload = await buildPayload(originalName, fileType, buffer);
    return [payload];
}
export function detectFileType(originalName, mimeType) {
    const ext = path.extname(originalName).toLowerCase();
    const loweredMimeType = mimeType.toLowerCase();
    if (loweredMimeType.startsWith('image/') ||
        ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic'].includes(ext)) {
        return 'image';
    }
    if (loweredMimeType === 'application/pdf' || ext === '.pdf') {
        return 'pdf';
    }
    if (loweredMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        loweredMimeType === 'application/msword' ||
        ext === '.docx' ||
        ext === '.doc') {
        return 'docx';
    }
    if (loweredMimeType === 'application/zip' ||
        loweredMimeType === 'application/x-zip-compressed' ||
        ext === '.zip') {
        return 'zip';
    }
    throw new AppError(415, `Unsupported file type for ${originalName}`);
}
async function processZipBuffer(buffer, originalName) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
    if (entries.length === 0) {
        throw new AppError(400, `ZIP archive ${originalName} is empty`);
    }
    const extractedItems = [];
    for (const entry of entries) {
        const entryName = path.basename(entry.entryName);
        const entryMimeType = inferMimeType(entryName);
        try {
            const items = await processBuffer(entry.getData(), entryName, entryMimeType);
            extractedItems.push(...items);
        }
        catch (error) {
            if (error instanceof AppError && error.statusCode === 415) {
                continue;
            }
            throw error;
        }
    }
    if (extractedItems.length === 0) {
        throw new AppError(415, `ZIP archive ${originalName} does not contain supported files`);
    }
    return extractedItems;
}
async function buildPayload(sourceName, fileType, buffer) {
    const intelResult = await processDocument(buffer);
    const normalizedText = intelResult.rawText.toLowerCase();
    const date = extractDate(normalizedText);
    return {
        sourceName,
        fileType,
        amount: intelResult.amount,
        amountMatch: null, // New engine handles internally
        type: intelResult.type,
        detectedType: intelResult.type,
        category: intelResult.category,
        confidence: intelResult.confidence,
        rawText: intelResult.rawText,
        extractedText: intelResult.rawText,
        date,
        businessName: intelResult.businessName,
        gstNumber: intelResult.gstNumber,
        gstDetails: intelResult.gstDetails,
        isUnclear: intelResult.isUnclear,
        missingFields: intelResult.missingFields,
        integrityScore: intelResult.integrityScore,
    };
}
function extractDate(normalizedText) {
    const match = normalizedText.match(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/) ||
        normalizedText.match(/\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/);
    if (!match) {
        return new Date();
    }
    const parsed = new Date(match[0]);
    if (Number.isNaN(parsed.getTime())) {
        return new Date();
    }
    return parsed;
}
function inferMimeType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        case '.bmp':
            return 'image/bmp';
        case '.tif':
        case '.tiff':
            return 'image/tiff';
        case '.heic':
            return 'image/heic';
        case '.pdf':
            return 'application/pdf';
        case '.doc':
            return 'application/msword';
        case '.docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case '.zip':
            return 'application/zip';
        default:
            return 'application/octet-stream';
    }
}
