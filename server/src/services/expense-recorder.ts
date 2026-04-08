import Record from '../models/Record';

interface ExpenseInput {
  text?: string;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  businessId: string;
  source: 'whatsapp' | 'voice' | 'web' | 'app';
}

interface ParsedExpense {
  amount: number;
  description: string;
  category: string;
  date: string;
  raw: string;
}

interface ParsedIncome {
  amount: number;
  description: string;
  category: string;
  date: string;
  raw: string;
}

export class ExpenseRecorder {
  static async parse(input: ExpenseInput): Promise<ParsedExpense> {
    const date = input.date || new Date().toISOString().split('T')[0];
    
    if (input.text) {
      const classifier = await import('./intent-classifier');
      const intent = await new classifier.IntentClassifier().classify(input.text);
      
      return {
        amount: intent.entities?.amount || 0,
        description: intent.entities?.description || 'Expense',
        category: intent.entities?.category || 'Miscellaneous',
        date,
        raw: input.text
      };
    }

    return {
      amount: input.amount || 0,
      description: input.description || 'Expense',
      category: input.category || 'Miscellaneous',
      date,
      raw: ''
    };
  }

  static async parseIncome(input: ExpenseInput): Promise<ParsedIncome> {
    const date = input.date || new Date().toISOString().split('T')[0];
    
    if (input.text) {
      // Parse income-specific patterns
      const incomePatterns = [
        /(?:received|mila|aaya|payment|daam)\s+(?:₹|Rs\.?)?\s*([\d,]+)/i,
        /([\d,]+)\s+(?:received|mila|aaya)/i,
        /(?:client|customer)\s+(?:se|ne)\s+(?:₹|Rs\.?)?\s*([\d,]+)/i
      ];

      let amount = 0;
      for (const pattern of incomePatterns) {
        const match = input.text.match(pattern);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }

      // Extract description
      const description = input.text
        .replace(/₹|Rs\.?|INR/gi, '')
        .replace(/[\d,]+/g, '')
        .replace(/received|mila|aaya|payment/gi, '')
        .trim();

      return {
        amount,
        description: description || 'Income',
        category: 'Income',
        date,
        raw: input.text
      };
    }

    return {
      amount: input.amount || 0,
      description: input.description || 'Income',
      category: 'Income',
      date,
      raw: ''
    };
  }

  static async saveExpense(data: ParsedExpense, businessId: string, source: string) {
    const record = new Record({
      businessId,
      type: 'expense',
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: new Date(data.date),
      source,
      status: 'confirmed',
      createdAt: new Date()
    });

    await record.save();
    return record;
  }

  static async saveIncome(data: ParsedIncome, businessId: string, source: string) {
    const record = new Record({
      businessId,
      type: 'income',
      amount: data.amount,
      description: data.description,
      category: 'Income',
      date: new Date(data.date),
      source,
      status: 'confirmed',
      createdAt: new Date()
    });

    await record.save();
    return record;
  }

  static async confirm(recordId: string) {
    return await Record.findByIdAndUpdate(recordId, { status: 'confirmed' });
  }

  static async edit(recordId: string, updates: Partial<typeof Record>) {
    return await Record.findByIdAndUpdate(recordId, updates, { new: true });
  }

  static async cancel(recordId: string) {
    return await Record.findByIdAndDelete(recordId);
  }
}
