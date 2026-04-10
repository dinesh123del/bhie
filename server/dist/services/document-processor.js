import Tesseract from 'tesseract.js';
// Dynamic import for CommonJS module compatibility
const pdfParse = async (buffer) => {
    const pdfParseModule = await import('pdf-parse');
    // Handle both ESM and CJS module structures
    const parseFn = pdfParseModule.default || pdfParseModule;
    return parseFn(buffer);
};
export class DocumentProcessor {
    static async processReceipt(options) {
        const { data: { text } } = await Tesseract.recognize(options.image, 'eng+hin');
        const amount = this.extractAmount(text);
        const vendor = this.extractVendor(text);
        const date = this.extractDate(text);
        const category = this.categorizeByContent(text);
        return {
            amount,
            vendor,
            date,
            category,
            confidence: this.calculateConfidence(text, amount, vendor, date),
            rawText: text
        };
    }
    static async processDocument(options) {
        const type = this.detectDocumentType(options.filename, options.mimeType);
        let content = '';
        if (options.mimeType === 'application/pdf') {
            const pdfData = await pdfParse(options.file);
            content = pdfData.text;
        }
        return {
            type,
            category: this.getCategoryForType(type),
            amount: this.extractAmount(content),
            vendor: this.extractVendor(content),
            date: this.extractDate(content),
            confidence: 0.75
        };
    }
    static extractAmount(text) {
        // Multiple patterns for amount extraction
        const patterns = [
            /(?:total|amount|grand total|bill amount)\s*[₹:Rs.]*\s*([\d,]+\.?\d{0,2})/i,
            /[₹Rs.]\s*([\d,]+\.?\d{0,2})/,
            /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)/i,
            /amount\s*:\s*([\d,]+)/i,
            /total\s*:\s*([\d,]+)/i
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const amount = parseFloat(match[1].replace(/,/g, ''));
                if (amount > 0 && amount < 1000000)
                    return amount;
            }
        }
        return 0;
    }
    static extractVendor(text) {
        // Look for store/restaurant names (usually at top)
        const lines = text.split('\n').slice(0, 5);
        for (const line of lines) {
            const cleaned = line.trim();
            if (cleaned.length > 2 &&
                cleaned.length < 50 &&
                !cleaned.match(/^\d/) &&
                !cleaned.match(/date|time|bill|receipt|invoice|tax|gst/i)) {
                return cleaned;
            }
        }
        return 'Unknown Vendor';
    }
    static extractDate(text) {
        const patterns = [
            /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
            /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
            /(\d{4}[/-]\d{1,2}[/-]\d{1,2})/
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match)
                return match[1];
        }
        return new Date().toISOString().split('T')[0];
    }
    static categorizeByContent(text) {
        const categories = {
            'Food & Dining': ['restaurant', 'cafe', 'food', 'kitchen', 'biryani', 'pizza', 'burger', 'coffee', 'chai'],
            'Transport': ['petrol', 'diesel', 'fuel', 'cab', 'taxi', 'auto', 'uber', 'ola', 'train', 'bus'],
            'Groceries': ['grocery', 'supermarket', 'mart', 'bigbasket', 'blinkit', 'zepto', 'dmart'],
            'Shopping': ['mall', 'store', 'shop', 'amazon', 'flipkart', 'myntra', 'clothing'],
            'Utilities': ['electricity', 'water', 'gas', 'bill', 'recharge', 'broadband', 'wifi'],
            'Health': ['pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'medicine', 'apollo', 'medplus'],
            'Entertainment': ['movie', 'theatre', 'bookmyshow', 'netflix', 'amazon prime', 'hotstar']
        };
        const lowerText = text.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => lowerText.includes(kw))) {
                return category;
            }
        }
        return 'Miscellaneous';
    }
    static detectDocumentType(filename, mimeType) {
        const lowerFilename = filename.toLowerCase();
        if (lowerFilename.includes('invoice'))
            return 'invoice';
        if (lowerFilename.includes('receipt') || lowerFilename.includes('bill'))
            return 'receipt';
        if (lowerFilename.includes('statement') || lowerFilename.includes('bank'))
            return 'bank_statement';
        if (lowerFilename.includes('tax') || lowerFilename.includes('gst') || lowerFilename.includes('tds'))
            return 'tax_document';
        if (lowerFilename.includes('expense') || lowerFilename.includes('claim'))
            return 'expense_report';
        return 'unknown';
    }
    static getCategoryForType(type) {
        const mappings = {
            invoice: 'Income',
            receipt: 'Expense',
            bank_statement: 'Banking',
            tax_document: 'Tax',
            expense_report: 'Expense',
            unknown: 'Miscellaneous'
        };
        return mappings[type] || 'Miscellaneous';
    }
    static calculateConfidence(text, amount, vendor, date) {
        let score = 0.5;
        if (amount > 0)
            score += 0.2;
        if (vendor !== 'Unknown Vendor')
            score += 0.15;
        if (date !== new Date().toISOString().split('T')[0])
            score += 0.1;
        if (text.length > 50)
            score += 0.05;
        return Math.min(score, 0.95);
    }
    static getSuggestedCategory(type) {
        return this.getCategoryForType(type);
    }
}
