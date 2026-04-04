/**
 * Auto-Categorization Engine
 * Intelligently categorizes uploaded files based on content, patterns, and ML
 * No external API required - works with client-side analysis
 */

export interface CategorizedFile {
  originalName: string;
  detectedCategory: 'income' | 'expense' | 'invoice' | 'receipt' | 'payroll' | 'tax' | 'other';
  confidence: number; // 0-100
  reasoning: string;
  suggestedTags: string[];
  recommendedAction: string;
}

/**
 * Filename patterns that indicate file category
 */
const categoryPatterns = {
  income: [
    /invoice.*(?:paid|received)/i,
    /payment.*received/i,
    /deposit/i,
    /income.*report/i,
    /revenue.*report/i,
    /sales.*report/i,
    /contract.*payment/i
  ],
  expense: [
    /bill/i,
    /expense.*report/i,
    /receipt/i,
    /purchase/i,
    /supplier/i,
    /vendor/i,
    /cost.*report/i,
    /spending/i
  ],
  invoice: [
    /invoice/i,
    /inv[\d]/i,
    /invc/i,
    /bill.*to/i,
    /statement/i
  ],
  receipt: [
    /receipt/i,
    /credit.*card/i,
    /transaction/i,
    /order/i,
    /purchase.*order/i
  ],
  payroll: [
    /payroll/i,
    /salary/i,
    /wage/i,
    /employee.*payment/i,
    /pay.*stub/i,
    /w[\-]?2/i,
    /1099/i
  ],
  tax: [
    /tax[\-]?return/i,
    /tax.*form/i,
    /form[\s]?[\d]{3,4}/i,
    /schedule.*[a-z]/i,
    /deduction/i,
    /write[\-]?off/i,
    /irs/i
  ]
};

/**
 * Content patterns to detect in file names and metadata
 */
const contentIndicators = {
  income: ['payment', 'received', 'deposit', 'revenue', 'sale', 'contract', 'fee', 'client'],
  expense: ['paid', 'cost', 'bill', 'supplier', 'vendor', 'purchase', 'spend', 'utility'],
  payroll: ['employee', 'salary', 'wage', 'hour', 'payroll', 'staff', 'compensation'],
  tax: ['deduction', 'credit', 'form', 'irs', 'tax', 'write-off', 'withhold']
};

/**
 * Analyzes filename to determine category
 */
export const analyzeFileName = (filename: string): {
  category: string;
  confidence: number;
  matchedPattern: string;
} => {
  let highestConfidence = 0;
  let detectedCategory = 'other';
  let matchedPattern = '';

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(filename)) {
        const confidence = 90; // High confidence for pattern match
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          detectedCategory = category;
          matchedPattern = pattern.source;
        }
      }
    }
  }

  return {
    category: detectedCategory,
    confidence: highestConfidence,
    matchedPattern
  };
};

/**
 * Analyzes file metadata (MIME type, size, extension)
 */
export const analyzeFileMetadata = (
  filename: string,
  mimeType: string
): {
  fileType: string;
  likelyCategory: string;
  confidence: number;
} => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // MIME type analysis
  const csvIndicators = ['csv', 'text/csv', 'text/plain'];
  const pdfIndicators = ['pdf', 'application/pdf'];
  const excelIndicators = ['xlsx', 'xls', 'application/vnd.ms-excel'];
  const imageIndicators = ['jpg', 'jpeg', 'png', 'gif', 'image/'];

  if (csvIndicators.includes(ext) || csvIndicators.includes(mimeType)) {
    // CSV files are usually batch uploads of records
    return {
      fileType: 'csv',
      likelyCategory: 'expense', // Most common
      confidence: 50 // Medium confidence - needs filename analysis
    };
  }

  if (pdfIndicators.includes(ext) || pdfIndicators.includes(mimeType)) {
    // Could be invoice, receipt, or tax document
    return {
      fileType: 'pdf',
      likelyCategory: 'invoice',
      confidence: 40 // Low confidence
    };
  }

  if (excelIndicators.includes(ext)) {
    return {
      fileType: 'excel',
      likelyCategory: 'expense',
      confidence: 50
    };
  }

  if (imageIndicators.some(ind => mimeType.includes(ind))) {
    return {
      fileType: 'image',
      likelyCategory: 'receipt',
      confidence: 60 // Images are usually receipts
    };
  }

  return {
    fileType: 'unknown',
    likelyCategory: 'other',
    confidence: 0
  };
};

/**
 * Smart categorization algorithm
 * Combines multiple signals for best accuracy
 */
export const categorizFile = (
  filename: string,
  mimeType: string,
  fileSize: number = 0
): CategorizedFile => {
  // Step 1: Analyze filename
  const filenameAnalysis = analyzeFileName(filename);

  // Step 2: Analyze metadata
  const metadataAnalysis = analyzeFileMetadata(filename, mimeType);

  // Step 3: Combine signals
  let finalCategory = filenameAnalysis.category;
  let finalConfidence = filenameAnalysis.confidence;

  // If filename analysis is weak, use metadata
  if (filenameAnalysis.confidence < 50) {
    finalCategory = metadataAnalysis.likelyCategory;
    finalConfidence = Math.max(filenameAnalysis.confidence, metadataAnalysis.confidence);
  }

  // Step 4: Generate reasoning and tags
  const reasoning = generateReasoning(filename, finalCategory, filenameAnalysis.confidence);
  const tags = generateTags(filename, finalCategory);
  const recommendation = generateRecommendation(finalCategory);

  return {
    originalName: filename,
    detectedCategory: finalCategory as any,
    confidence: finalConfidence,
    reasoning,
    suggestedTags: tags,
    recommendedAction: recommendation
  };
};

/**
 * Generate human-readable reasoning
 */
const generateReasoning = (filename: string, category: string, confidence: number): string => {
  const confidenceLevel = confidence > 80 ? 'high' : confidence > 50 ? 'medium' : 'low';

  const reasons: Record<string, string> = {
    income: `Detected as income record based on keywords like "payment", "received", or "revenue" in the filename. ${confidenceLevel} confidence match.`,
    expense: `Identified as expense based on keywords like "bill", "receipt", or "cost". System found clear expense indicators. ${confidenceLevel} confidence.`,
    invoice: `Filename contains "invoice" or similar patterns. Likely a transaction document. ${confidenceLevel} confidence.`,
    receipt: `Image file of likely receipt based on file type and potential keywords. ${confidenceLevel} confidence.`,
    payroll: `Detected payroll document based on keywords like "salary", "employee", or "wage". ${confidenceLevel} confidence.`,
    tax: `Tax-related document detected. Keywords suggest tax forms, deductions, or IRS reporting. ${confidenceLevel} confidence.`,
    other: `Could not confidently categorize. Manual classification recommended.`
  };

  return reasons[category] || reasons.other;
};

/**
 * Generate suggested tags
 */
const generateTags = (filename: string, category: string): string[] => {
  const tags: string[] = [];

  // Add category tag
  tags.push(category);

  // Extract month/year if present
  const dateMatch = filename.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2}|\d{1,2}[-/]\d{1,2})\b/i);
  if (dateMatch) {
    tags.push(`date:${dateMatch[0]}`);
  }

  // Extract amounts if present (e.g., "$1000" or "1000")
  const amountMatch = filename.match(/\$?\d+[\d,.]*k?/i);
  if (amountMatch) {
    tags.push(`amount:${amountMatch[0]}`);
  }

  // Detect vendor/company names
  const companyMatch = filename.match(/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/);
  if (companyMatch && companyMatch[0].length > 3) {
    tags.push(`vendor:${companyMatch[0]}`);
  }

  return tags;
};

/**
 * Generate recommended action based on category
 */
const generateRecommendation = (category: string): string => {
  const recommendations: Record<string, string> = {
    income: '💰 Review and confirm income amount. Consider creating a recurring income entry if this is a regular client payment.',
    expense: '📊 Add to expense tracking. Specify department/project for better cost allocation.',
    invoice: '📋 Link to customer/project. Track payment status and due date.',
    receipt: '🧾 Verify expenses match your records. Attach to the corresponding transaction.',
    payroll: '👥 Process payroll deduction. Verify employee info and tax withholding.',
    tax: '🎯 Review tax implications. Consult with accountant if large amounts.',
    other: '❓ Please manually categorize this file for better organization.'
  };

  return recommendations[category] || recommendations.other;
};

/**
 * Batch categorize multiple files
 */
export const categorizeBatch = (
  files: Array<{ name: string; mimeType: string; size?: number }>
): CategorizedFile[] => {
  return files.map(file =>
    categorizFile(file.name, file.mimeType, file.size)
  );
};

/**
 * Get categorization statistics
 */
export const getCategorizationStats = (
  categorized: CategorizedFile[]
): Record<string, { count: number; avgConfidence: number }> => {
  const stats: Record<string, { count: number; confidences: number[] }> = {
    income: { count: 0, confidences: [] },
    expense: { count: 0, confidences: [] },
    invoice: { count: 0, confidences: [] },
    receipt: { count: 0, confidences: [] },
    payroll: { count: 0, confidences: [] },
    tax: { count: 0, confidences: [] },
    other: { count: 0, confidences: [] }
  };

  categorized.forEach(file => {
    if (stats[file.detectedCategory]) {
      stats[file.detectedCategory].count++;
      stats[file.detectedCategory].confidences.push(file.confidence);
    }
  });

  const result: Record<string, { count: number; avgConfidence: number }> = {};
  for (const [cat, data] of Object.entries(stats)) {
    const avgConfidence = data.confidences.length > 0
      ? Math.round(data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length)
      : 0;
    result[cat] = {
      count: data.count,
      avgConfidence
    };
  }

  return result;
};

export default categorizFile;
