import { AssemblyAI } from 'assemblyai';

interface LanguageCode {
  code: string;
  name: string;
  nativeName: string;
  region: string[];
  rtl: boolean;
}

interface VoiceTranscription {
  text: string;
  language: string;
  confidence: number;
  detectedLanguage?: string;
}

interface ParsedTransaction {
  amount: number;
  description: string;
  type: 'expense' | 'income';
  category?: string;
  confidence: number;
  language: string;
}

export class MultiLanguageVoiceProcessor {
  private client: AssemblyAI;
  private supportedLanguages: LanguageCode[];
  private numberWords: Map<string, Map<string, number>>;

  constructor() {
    this.client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY || ''
    });

    this.supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', region: ['US', 'UK', 'IN', 'AU'], rtl: false },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', region: ['IN'], rtl: false },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: ['IN'], rtl: false },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: ['IN', 'LK', 'SG', 'MY'], rtl: false },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: ['IN'], rtl: false },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: ['IN', 'BD'], rtl: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', region: ['ES', 'MX', 'AR', 'CO'], rtl: false },
      { code: 'fr', name: 'French', nativeName: 'Français', region: ['FR', 'CA', 'BE'], rtl: false },
      { code: 'de', name: 'German', nativeName: 'Deutsch', region: ['DE', 'AT', 'CH'], rtl: false },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: ['BR', 'PT'], rtl: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: ['SA', 'AE', 'EG', 'MA'], rtl: true },
      { code: 'zh', name: 'Chinese', nativeName: '中文', region: ['CN', 'TW', 'HK', 'SG'], rtl: false },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', region: ['JP'], rtl: false },
      { code: 'ko', name: 'Korean', nativeName: '한국어', region: ['KR'], rtl: false },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', region: ['IT'], rtl: false },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', region: ['RU', 'UA', 'KZ'], rtl: false },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: ['NL', 'BE'], rtl: false },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: ['ID'], rtl: false },
      { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: ['MY', 'SG'], rtl: false },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: ['TR'], rtl: false },
    ];

    this.numberWords = this.initializeNumberWords();
  }

  private initializeNumberWords(): Map<string, Map<string, number>> {
    const map = new Map<string, Map<string, number>>();

    // English
    const enNumbers = new Map<string, number>();
    ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
     'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
     'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'lakh', 'crore'].forEach((word, i) => {
      enNumbers.set(word, i);
    });
    map.set('en', enNumbers);

    // Hindi
    const hiNumbers = new Map<string, number>();
    ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
     'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
     'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे', 'सौ', 'हजार', 'लाख', 'करोड़'].forEach((word, i) => {
      hiNumbers.set(word, i);
    });
    map.set('hi', hiNumbers);

    // Telugu
    const teNumbers = new Map<string, number>();
    ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది',
     'పదకొందు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదునయిదు', 'పదహారు', 'పదిహేడు', 'పదెనిమిది', 'పంతొమ్మిది', 'ఇరవై',
     'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంభై', 'వంద', 'వెయ్యి', 'లక్ష', 'కోటి'].forEach((word, i) => {
      teNumbers.set(word, i);
    });
    map.set('te', teNumbers);

    // Spanish
    const esNumbers = new Map<string, number>();
    ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
     'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
     'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa', 'cien', 'mil', 'lakh', 'crore'].forEach((word, i) => {
      esNumbers.set(word, i);
    });
    map.set('es', esNumbers);

    // Arabic
    const arNumbers = new Map<string, number>();
    ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
     'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر', 'عشرون',
     'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون', 'مائة', 'ألف', 'لakh', 'كروre'].forEach((word, i) => {
      arNumbers.set(word, i);
    });
    map.set('ar', arNumbers);

    return map;
  }

  /**
   * Transcribe audio with auto language detection
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<VoiceTranscription> {
    try {
      // Create a temporary file for AssemblyAI
      const audioUrl = await this.uploadToAssemblyAI(audioBuffer, mimeType);

      // Transcribe with language auto-detection
      const transcript = await this.client.transcripts.transcribe({
        audio_url: audioUrl,
        language_detection: true,
      });

      return {
        text: transcript.text,
        language: transcript.language_code || 'en',
        confidence: transcript.confidence || 0.95,
        detectedLanguage: transcript.language_code
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Upload audio to AssemblyAI
   */
  private async uploadToAssemblyAI(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const uploadUrl = await this.client.files.upload(audioBuffer);
    return uploadUrl;
  }

  /**
   * Parse transcribed text into transaction data
   */
  async parseTransaction(transcription: VoiceTranscription): Promise<ParsedTransaction> {
    const { text, language } = transcription;

    // Detect if expense or income based on keywords
    const expenseKeywords = this.getKeywords('expense', language);
    const incomeKeywords = this.getKeywords('income', language);

    const isExpense = expenseKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    const isIncome = incomeKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    const type: 'expense' | 'income' = isExpense ? 'expense' : isIncome ? 'income' : 'expense';

    // Extract amount
    const amount = this.extractAmount(text, language);

    // Extract description
    const description = this.extractDescription(text, language, type);

    // Extract category
    const category = this.extractCategory(text, language);

    return {
      amount,
      description,
      type,
      category,
      confidence: transcription.confidence,
      language
    };
  }

  /**
   * Get keywords for expense/income detection in specific language
   */
  private getKeywords(type: 'expense' | 'income', language: string): string[] {
    const keywords: Record<string, Record<string, string[]>> = {
      expense: {
        en: ['spent', 'expense', 'cost', 'paid', 'bought', 'purchase', 'kharcha'],
        hi: ['खर्च', 'लगाया', 'दिया', 'खरीदा', 'बिल'],
        te: ['ఖర్చు', 'చెల్లించారు', 'కొనుగోలు', 'బిల్లు'],
        ta: ['செலவு', 'செலுத்தினேன்', 'வாங்கினேன்', 'பில்'],
        es: ['gasté', 'gasto', 'costo', 'pagué', 'compré'],
        ar: ['أنفقت', 'تكلفة', 'دفع', 'اشتريت'],
        fr: ['dépensé', 'coût', 'payé', 'acheté'],
        de: ['ausgegeben', 'kosten', 'bezahlt', 'gekauft'],
        pt: ['gastei', 'custo', 'paguei', 'comprei'],
        zh: ['花费', '支出', '买了', '付了'],
        ja: ['費やした', 'コスト', '買った', '支払った'],
        ko: ['지출', '비용', '샀다', '지불'],
      },
      income: {
        en: ['earned', 'income', 'revenue', 'received', 'got', 'profit', 'kamaya'],
        hi: ['कमाया', 'आय', 'मिला', 'लाभ'],
        te: ['సంపాదించారు', 'ఆదాయం', 'లాభం'],
        ta: ['சம்பாதித்தேன்', 'வருமானம்', 'லாபம்'],
        es: ['gané', 'ingreso', 'recibí', 'ganancia'],
        ar: ['كسبت', 'دخل', 'حصلت على', 'ربح'],
        fr: ['gagné', 'revenu', 'reçu', 'profit'],
        de: ['verdient', 'einkommen', 'erhalten', 'gewinn'],
        pt: ['ganhei', 'receita', 'recebi', 'lucro'],
        zh: ['赚了', '收入', '收到', '利润'],
        ja: ['稼いだ', '収入', '受け取った', '利益'],
        ko: ['벌었다', '수입', '받았다', '이익'],
      }
    };

    return keywords[type]?.[language] || keywords[type]['en'] || [];
  }

  /**
   * Extract amount from text (handles both digits and number words)
   */
  private extractAmount(text: string, language: string): number {
    // First try to find digit patterns
    const digitPattern = /[\d,]+\.?\d*/g;
    const digitMatches = text.match(digitPattern);
    if (digitMatches) {
      const amounts = digitMatches.map(m => parseFloat(m.replace(/,/g, '')));
      const maxAmount = Math.max(...amounts);
      if (maxAmount > 0) return maxAmount;
    }

    // Try number words
    const numberWords = this.numberWords.get(language);
    if (numberWords) {
      let total = 0;
      let current = 0;
      
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        const value = numberWords.get(word);
        if (value !== undefined) {
          if (value >= 100) {
            total += current * value;
            current = 0;
          } else {
            current += value;
          }
        }
      }
      total += current;
      
      if (total > 0) return total;
    }

    return 0;
  }

  /**
   * Extract description from text
   */
  private extractDescription(text: string, language: string, type: 'expense' | 'income'): string {
    // Remove expense/income keywords and numbers
    const keywords = this.getKeywords(type, language);
    let description = text;

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      description = description.replace(regex, '');
    });

    // Remove numbers
    description = description.replace(/[\d,]+\.?\d*/g, '');
    description = description.replace(/[₹$€£¥]/g, '');

    // Clean up
    description = description.trim();
    description = description.replace(/\s+/g, ' ');

    // If empty, provide default
    if (!description) {
      const defaults: Record<string, Record<string, string>> = {
        expense: {
          en: 'General expense',
          hi: 'सामान्य खर्च',
          te: 'సాధారణ ఖర్చు',
          ta: 'பொதுவான செலவு',
          es: 'Gasto general',
          ar: 'نفقة عامة',
        },
        income: {
          en: 'General income',
          hi: 'सामान्य आय',
          te: 'సాధారణ ఆదాయం',
          ta: 'பொதுவான வருமானம்',
          es: 'Ingreso general',
          ar: 'دخل عام',
        }
      };
      description = defaults[type]?.[language] || defaults[type]['en'] || 'Transaction';
    }

    return description;
  }

  /**
   * Extract category from text
   */
  private extractCategory(text: string, language: string): string {
    const categories: Record<string, Record<string, string[]>> = {
      food: {
        en: ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'tea', 'coffee', 'meal'],
        hi: ['खाना', 'दोपहर का खाना', 'रात का खाना', 'सुबह का नाश्ता', 'रेस्टोरेंट', 'चाय', 'कॉफी'],
        te: ['ఆహారం', 'మధ్యాహ్న భోజనం', 'రాత్రి భోజనం', 'ఉదయం భోజనం', 'రెస్టారెంట్', 'టీ', 'కాఫీ'],
        ta: ['உணவு', 'மதிய உணவு', 'இரவு உணவு', 'காலை உணவு', 'உணவகம்', 'தேநீர்', 'காபி'],
        es: ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'té', 'café'],
        ar: ['طعام', 'غداء', 'عشاء', 'إفطار', 'مطعم', 'شاي', 'قهوة'],
      },
      transport: {
        en: ['transport', 'taxi', 'uber', 'ola', 'auto', 'bus', 'train', 'metro', 'fuel', 'petrol'],
        hi: ['परिवहन', 'टैक्सी', 'उबर', 'ऑटो', 'बस', 'ट्रेन', 'मेट्रो', 'पेट्रोल'],
        te: ['రవాణా', 'టాక్సీ', 'ఉబెర్', 'ఆటో', 'బస్', 'రైలు', 'మెట్రో', 'పెట్రోల్'],
        ta: ['போக்குவரத்து', 'டாக்சி', 'உபர்', 'ஆட்டோ', 'பேருந்து', 'ரயில்', 'மெட்ரோ', 'பெட்ரோல்'],
        es: ['transporte', 'taxi', 'uber', 'autobús', 'tren', 'metro', 'gasolina'],
        ar: ['نقل', 'تاكسي', 'أوبر', 'حافلة', 'قطار', 'مترو', 'بنزين'],
      },
      shopping: {
        en: ['shopping', 'grocery', 'clothes', 'electronics', 'amazon', 'flipkart', 'store'],
        hi: ['खरीदारी', 'किराना', 'कपड़े', 'इलेक्ट्रॉनिक्स', 'अमेज़न', 'फ्लिपकार्ट', 'दुकान'],
        te: ['షాపింగ్', 'కిరానా', 'దుస్తులు', 'ఎలక్ట్రానిక్స్', 'అమెజాన్', 'ఫ్లిప్కార్ట్', 'దుకాణం'],
        ta: ['ஷாப்பிங்', 'கனிவாணை', 'ஆடைகள்', 'எலக்ட்ரானிக்ஸ்', 'அமேசான்', 'பிளிப்கார்ட்', 'கடை'],
        es: ['compras', 'abarrotes', 'ropa', 'electrónica', 'amazon', 'tienda'],
        ar: ['تسوق', 'بقالة', 'ملابس', 'إلكترونيات', 'أمازون', 'متجر'],
      },
    };

    const lowerText = text.toLowerCase();
    for (const [category, langMap] of Object.entries(categories)) {
      const keywords = langMap[language] || langMap['en'];
      if (keywords.some(kw => lowerText.includes(kw.toLowerCase()))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageCode[] {
    return this.supportedLanguages;
  }

  /**
   * Get language by country code
   */
  getLanguageByCountry(countryCode: string): string {
    const countryLanguageMap: Record<string, string> = {
      'US': 'en', 'GB': 'en', 'IN': 'hi', 'AU': 'en',
      'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es',
      'FR': 'fr', 'DE': 'de', 'IT': 'it',
      'SA': 'ar', 'AE': 'ar', 'EG': 'ar',
      'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
      'JP': 'ja', 'KR': 'ko',
      'BR': 'pt', 'PT': 'pt',
      'RU': 'ru',
      'NL': 'nl',
      'ID': 'id', 'MY': 'ms',
      'TR': 'tr',
      // Indian states for regional languages
      'IN-AP': 'te', 'IN-TG': 'te', // Telugu
      'IN-TN': 'ta', 'IN-KL': 'ta', // Tamil
      'IN-MH': 'mr', // Marathi
      'IN-WB': 'bn', // Bengali
    };

    return countryLanguageMap[countryCode] || 'en';
  }

  /**
   * Check if language is RTL
   */
  isRTL(language: string): boolean {
    const lang = this.supportedLanguages.find(l => l.code === language);
    return lang?.rtl || false;
  }
}
