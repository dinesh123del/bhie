import Tesseract from 'tesseract.js';
import { AIEngine } from '../utils/aiEngine.js';
export class OCRService {
    /**
     * Process a document image or PDF text and extract structured financial data
     */
    static async processDocument(filePath) {
        console.log(`🖼️ OCR: Processing ${filePath}...`);
        // 1. OCR Extraction (Tesseract)
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        console.log('✅ OCR: Text extraction complete');
        // 2. Clear text and NLP parsing using AI Engine
        const prompt = `
      You are a specialized business document parser. Extracts key financial entities from OCR text.
      OCR TEXT:
      """
      ${text}
      """

      Identify if this is a RECEIPT/INVOICE (expense) or a SALE record (income).
      Extract the total amount, date, vendor/customer name, and line items.

      RETURN JSON FORMAT ONLY:
      {
        "amount": number,
        "date": "YYYY-MM-DD",
        "items": [ { "name": "string", "price": number, "quantity": number } ],
        "vendorName": "string",
        "category": "income" | "expense",
        "confidence": 0-1
      }
    `;
        try {
            const response = await AIEngine.generateCompletion(prompt);
            const extracted = JSON.parse(response.content);
            return {
                ...extracted,
                date: new Date(extracted.date || new Date()),
                confidence: extracted.confidence || 0.7,
            };
        }
        catch (error) {
            console.error('❌ OCR: AI extraction failed', error);
            throw new Error(`Failed to parse OCR text: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
