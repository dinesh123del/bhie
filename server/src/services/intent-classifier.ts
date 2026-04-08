export interface ClassifiedIntent {
  type: 'RECORD_EXPENSE' | 'RECORD_INCOME' | 'QUERY_BALANCE' | 'QUERY_INSIGHTS' | 'GET_REPORT' | 'HELP' | 'UNKNOWN';
  confidence: number;
  entities?: {
    amount?: number;
    description?: string;
    category?: string;
    date?: string;
  };
}

export class IntentClassifier {
  private expenseKeywords = [
    'spent', 'spent', 'kharcha', 'kharch', 'expense', 'paid', 'payment', 'bill', 'purchase',
    'buy', 'bought', 'daam', 'kimat', 'paisa diya', 'diye', 'lagaya', ' lagaya'
  ];

  private incomeKeywords = [
    'received', 'aaya', 'mila', 'income', 'payment received', 'paisa aaya', 'earning',
    'revenue', 'sales', 'sold', 'mil gaya', 'diya', 'daam mila', 'payment mila'
  ];

  private balanceKeywords = [
    'balance', 'summary', 'status', 'kitna hai', 'kitna bacha', 'total', 'paisa kitna',
    'account', 'kitna paisa', 'hisaab', 'balance kitna'
  ];

  private insightKeywords = [
    'insights', 'advice', 'recommendation', 'suggestion', 'salah', 'suggest', 'help me',
    'what should i do', 'kya karu', 'guide', 'analysis', 'report', 'analyse'
  ];

  private reportKeywords = [
    'report', 'full report', 'monthly report', 'download', 'pdf', 'document',
    'summary report', 'business report', 'detailed report'
  ];

  private helpKeywords = [
    'help', 'commands', 'options', 'what can you do', 'how to use', 'guide',
    'madad', 'kya kar sakte ho', 'features', 'support'
  ];

  async classify(text: string): Promise<ClassifiedIntent> {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Check for explicit commands first
    if (this.containsAny(lowerText, this.helpKeywords)) {
      return { type: 'HELP', confidence: 0.95 };
    }

    if (this.containsAny(lowerText, this.reportKeywords)) {
      return { type: 'GET_REPORT', confidence: 0.9 };
    }

    if (this.containsAny(lowerText, this.insightKeywords)) {
      return { type: 'QUERY_INSIGHTS', confidence: 0.9 };
    }

    if (this.containsAny(lowerText, this.balanceKeywords)) {
      return { type: 'QUERY_BALANCE', confidence: 0.95 };
    }

    // Check for amount patterns (expense/income)
    const amount = this.extractAmount(text);
    
    if (amount > 0) {
      const hasExpenseKeyword = this.containsAny(lowerText, this.expenseKeywords);
      const hasIncomeKeyword = this.containsAny(lowerText, this.incomeKeywords);

      if (hasExpenseKeyword && !hasIncomeKeyword) {
        return {
          type: 'RECORD_EXPENSE',
          confidence: 0.85,
          entities: {
            amount,
            description: this.extractDescription(text, 'expense'),
            category: this.categorizeExpense(text)
          }
        };
      }

      if (hasIncomeKeyword && !hasExpenseKeyword) {
        return {
          type: 'RECORD_INCOME',
          confidence: 0.85,
          entities: {
            amount,
            description: this.extractDescription(text, 'income'),
            category: 'Income'
          }
        };
      }

      // If amount present but ambiguous keywords
      if (!hasIncomeKeyword && !hasExpenseKeyword) {
        // Default to expense for standalone amounts with context
        return {
          type: 'RECORD_EXPENSE',
          confidence: 0.7,
          entities: {
            amount,
            description: this.extractDescription(text, 'expense'),
            category: this.categorizeExpense(text)
          }
        };
      }
    }

    // Check for expense without explicit amount (e.g., "tea expense")
    if (this.containsAny(lowerText, this.expenseKeywords)) {
      const inferredAmount = this.inferAmountFromContext(text);
      if (inferredAmount > 0) {
        return {
          type: 'RECORD_EXPENSE',
          confidence: 0.75,
          entities: {
            amount: inferredAmount,
            description: this.extractDescription(text, 'expense'),
            category: this.categorizeExpense(text)
          }
        };
      }
    }

    return { type: 'UNKNOWN', confidence: 0.5 };
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractAmount(text: string): number {
    // Standard formats: 500, 1,000, 10000, 100000
    const standardMatch = text.match(/(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (standardMatch) {
      const amount = parseFloat(standardMatch[1].replace(/,/g, ''));
      if (amount > 0 && amount < 100000000) return amount;
    }

    // Hindi word amounts
    return this.extractHindiAmount(text);
  }

  private extractHindiAmount(text: string): number {
    const hindiWords: Record<string, number> = {
      'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
      'cheh': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
      'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14,
      'pandrah': 15, 'solah': 16, 'satrah': 17, 'atharah': 18,
      'unnis': 19, 'bees': 20, 'tees': 30, 'chalis': 40,
      'pachas': 50, 'saath': 60, 'sattar': 70, 'assi': 80,
      'nabbe': 90, 'so': 100, 'hazaar': 1000, 'lakh': 100000,
      'crore': 10000000
    };

    const lowerText = text.toLowerCase();
    let total = 0;
    let current = 0;

    const words = lowerText.split(/\s+/);
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      const value = hindiWords[cleanWord];
      
      if (value !== undefined) {
        if (value >= 100) {
          current = current === 0 ? value : current * value;
          if (value >= 1000) {
            total += current;
            current = 0;
          }
        } else {
          current += value;
        }
      }
    }

    return total + current;
  }

  private inferAmountFromContext(text: string): number {
    // Common expense patterns
    const contextPatterns: Record<string, number> = {
      'chai': 20, 'tea': 20, 'coffee': 50, 'lunch': 150, 'dinner': 300,
      'auto': 50, 'rickshaw': 30, 'cab': 200, 'taxi': 250,
      'petrol': 1000, 'diesel': 2000, 'fuel': 1500
    };

    const lowerText = text.toLowerCase();
    for (const [pattern, amount] of Object.entries(contextPatterns)) {
      if (lowerText.includes(pattern)) return amount;
    }

    return 0;
  }

  private extractDescription(text: string, type: 'expense' | 'income'): string {
    // Remove common keywords and amount patterns
    let cleaned = text
      .replace(/₹|Rs\.?|INR/gi, '')
      .replace(/[\d,]+/g, '')
      .replace(new RegExp(this.expenseKeywords.join('|'), 'gi'), '')
      .replace(new RegExp(this.incomeKeywords.join('|'), 'gi'), '')
      .trim();

    // Limit length
    if (cleaned.length > 50) {
      cleaned = cleaned.substring(0, 50) + '...';
    }

    return cleaned || (type === 'expense' ? 'Expense' : 'Income');
  }

  private categorizeExpense(text: string): string {
    const categories: Record<string, string[]> = {
      'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'chai', 'tea', 'coffee', 'restaurant', 'khana', 'khaana'],
      'Transport': ['cab', 'taxi', 'auto', 'rickshaw', 'uber', 'ola', 'petrol', 'diesel', 'fuel', 'gaadi', 'bus', 'train'],
      'Office Supplies': ['stationery', 'pen', 'paper', 'printer', 'ink', 'laptop', 'computer'],
      'Utilities': ['electricity', 'bill', 'wifi', 'internet', 'phone', 'mobile', 'bijli'],
      'Rent': ['rent', 'lease', 'office', 'kiraya', 'rent d'],
      'Marketing': ['ad', 'advertisement', 'facebook', 'google', 'instagram', 'promotion'],
      'Travel': ['flight', 'hotel', 'travel', 'trip', 'stay', 'booking'],
      'Miscellaneous': []
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        return category;
      }
    }

    return 'Miscellaneous';
  }
}
