import { processDocument } from './documentIntelligenceService.js';
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
export async function processImageForRecord(filePath, _originalName) {
    const intelResult = await processDocument(filePath);
    const normalizedText = intelResult.rawText.toLowerCase();
    const date = extractDate(normalizedText);
    return {
        amount: intelResult.amount,
        amountMatch: null,
        type: intelResult.type,
        detectedType: intelResult.type,
        category: intelResult.category,
        confidence: intelResult.confidence,
        rawText: intelResult.rawText,
        extractedText: intelResult.rawText,
        date,
        missingFields: intelResult.missingFields,
        integrityScore: intelResult.integrityScore,
        isUnclear: intelResult.isUnclear,
        businessName: intelResult.businessName,
        gstNumber: intelResult.gstNumber,
        gstDetails: intelResult.gstDetails,
    };
}
