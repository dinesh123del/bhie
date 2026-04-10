import { transliterate } from 'transliteration';
export class VoiceProcessor {
    constructor() {
        this.hindiNumbers = {
            'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
            'cheh': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
            'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14,
            'pandrah': 15, 'solah': 16, 'satrah': 17, 'atharah': 18,
            'unnis': 19, 'bees': 20, 'tees': 30, 'chalis': 40,
            'pachas': 50, 'saath': 60, 'sattar': 70, 'assi': 80,
            'nabbe': 90, 'so': 100, 'hazaar': 1000, 'lakh': 100000,
            'crore': 10000000
        };
        this.expenseIndicators = [
            'kharcha', 'kharch', 'expense', 'liye', 'diya', 'lagaya',
            'daam', 'kimat', 'kharid', 'buy', 'purchase', 'spent',
            'li', 'diye', 'liye', 'karaya', 'bhare'
        ];
        this.incomeIndicators = [
            'aaya', 'mila', 'income', 'received', 'payment', 'diya hai',
            'mila hai', 'aaya hai', 'paisa aaya', 'earning', 'revenue',
            'sales', 'bikri', 'becha', 'beche', 'payment mila'
        ];
        // Example inputs that should work:
        // "paanch hazaar chai kharcha" → 5000, expense, "chai"
        // "das hazaar mila client se" → 10000, income, "client se"
        // "do lakh lagaya laptop pe" → 200000, expense, "laptop pe"
        // "ek hazaar rupaye ki bikri" → 1000, income, "rupaye ki bikri"
    }
    async process(audioUrl, business) {
        // In production, this would:
        // 1. Download audio from URL
        // 2. Send to speech-to-text API (AssemblyAI, Google Speech, AWS Transcribe)
        // 3. Process the transcription
        // For now, simulating with a placeholder implementation
        // The actual integration would use:
        // const transcript = await this.transcribeAudio(audioUrl);
        // Simulated processing - replace with actual transcription
        const simulatedText = 'paanch hazaar tea kharcha';
        return this.parseHinglishInput(simulatedText);
    }
    parseHinglishInput(text) {
        const normalizedText = text.toLowerCase().trim();
        const transliteratedText = transliterate(normalizedText, { unknown: '?' });
        // Extract amount
        const amount = this.extractAmountFromHinglish(normalizedText);
        // Determine type
        const type = this.determineTransactionType(normalizedText);
        // Extract description
        const description = this.extractDescription(normalizedText, type);
        // Calculate confidence
        const confidence = this.calculateConfidence(amount, type, normalizedText);
        return {
            type,
            amount,
            description,
            confidence,
            originalText: text,
            normalizedText: transliteratedText
        };
    }
    extractAmountFromHinglish(text) {
        let total = 0;
        let current = 0;
        const words = text.split(/\s+/);
        for (const word of words) {
            const cleanWord = word.replace(/[^a-z]/gi, '').toLowerCase();
            const value = this.hindiNumbers[cleanWord];
            if (value !== undefined) {
                if (value >= 100) {
                    if (current === 0)
                        current = 1;
                    current *= value;
                    if (value >= 1000) {
                        total += current;
                        current = 0;
                    }
                }
                else {
                    current += value;
                }
            }
        }
        // Also check for English numbers
        const englishMatch = text.match(/(\d+)/);
        if (englishMatch && total === 0) {
            total = parseInt(englishMatch[1]);
        }
        return total + current;
    }
    determineTransactionType(text) {
        const hasExpense = this.expenseIndicators.some(ind => text.includes(ind));
        const hasIncome = this.incomeIndicators.some(ind => text.includes(ind));
        if (hasExpense && !hasIncome)
            return 'expense';
        if (hasIncome && !hasExpense)
            return 'income';
        if (hasExpense && hasIncome) {
            // Check which appears first
            const expenseIndex = Math.min(...this.expenseIndicators.map(i => text.indexOf(i)).filter(i => i !== -1));
            const incomeIndex = Math.min(...this.incomeIndicators.map(i => text.indexOf(i)).filter(i => i !== -1));
            return expenseIndex < incomeIndex ? 'expense' : 'income';
        }
        return 'unknown';
    }
    extractDescription(text, type) {
        // Remove amount words and transaction type indicators
        let cleaned = text;
        // Remove number words
        Object.keys(this.hindiNumbers).forEach(word => {
            cleaned = cleaned.replace(new RegExp(word, 'gi'), '');
        });
        // Remove English numbers
        cleaned = cleaned.replace(/\d+/g, '');
        // Remove transaction indicators
        [...this.expenseIndicators, ...this.incomeIndicators].forEach(ind => {
            cleaned = cleaned.replace(new RegExp(ind, 'gi'), '');
        });
        // Clean up
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        if (cleaned.length < 2) {
            return type === 'expense' ? 'Expense' : 'Income';
        }
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    calculateConfidence(amount, type, text) {
        let confidence = 0.5;
        if (amount > 0)
            confidence += 0.3;
        if (type !== 'unknown')
            confidence += 0.2;
        if (text.length > 5)
            confidence += 0.1;
        return Math.min(confidence, 0.95);
    }
}
