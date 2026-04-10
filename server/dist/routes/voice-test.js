import { Router } from 'express';
import multer from 'multer';
import { MultiLanguageVoiceProcessor } from '../services/multi-language-voice-processor.js';
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
const voiceProcessor = new MultiLanguageVoiceProcessor();
/**
 * Test voice input with audio file
 * POST /api/voice-test/transcribe
 * Body: audio file (multipart/form-data)
 * Query: language (optional, for auto-detection)
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }
        const { language } = req.query;
        const audioBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        console.log('Processing audio file:', {
            size: audioBuffer.length,
            mimeType,
            language: language || 'auto-detect'
        });
        // Transcribe audio
        const transcription = await voiceProcessor.transcribeAudio(audioBuffer, mimeType);
        console.log('Transcription result:', {
            text: transcription.text,
            language: transcription.language,
            confidence: transcription.confidence
        });
        // Parse transaction from transcription
        const transaction = await voiceProcessor.parseTransaction(transcription);
        console.log('Parsed transaction:', transaction);
        res.json({
            success: true,
            transcription: {
                text: transcription.text,
                language: transcription.language,
                detectedLanguage: transcription.detectedLanguage,
                confidence: transcription.confidence
            },
            transaction: {
                amount: transaction.amount,
                description: transaction.description,
                type: transaction.type,
                category: transaction.category,
                confidence: transaction.confidence,
                language: transaction.language
            },
            supportedLanguages: voiceProcessor.getSupportedLanguages()
        });
    }
    catch (error) {
        console.error('Voice transcription error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process voice input'
        });
    }
});
/**
 * Test with text input (simulated voice)
 * POST /api/voice-test/simulate
 * Body: { text: string, language?: string }
 */
router.post('/simulate', async (req, res) => {
    try {
        const { text, language = 'en' } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }
        console.log('Simulating voice input:', { text, language });
        // Create mock transcription
        const transcription = {
            text,
            language,
            confidence: 0.95,
            detectedLanguage: language
        };
        // Parse transaction
        const transaction = await voiceProcessor.parseTransaction(transcription);
        console.log('Parsed transaction:', transaction);
        res.json({
            success: true,
            input: {
                text,
                language
            },
            transaction: {
                amount: transaction.amount,
                description: transaction.description,
                type: transaction.type,
                category: transaction.category,
                confidence: transaction.confidence,
                language: transaction.language
            }
        });
    }
    catch (error) {
        console.error('Voice simulation error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to simulate voice input'
        });
    }
});
/**
 * Get supported languages for voice input
 * GET /api/voice-test/languages
 */
router.get('/languages', (req, res) => {
    try {
        const languages = voiceProcessor.getSupportedLanguages();
        res.json({
            success: true,
            languages
        });
    }
    catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get supported languages'
        });
    }
});
/**
 * Test examples for different languages
 * GET /api/voice-test/examples
 */
router.get('/examples', (req, res) => {
    try {
        const examples = [
            // English
            {
                language: 'en',
                languageName: 'English',
                examples: [
                    { text: 'I spent 500 rupees on lunch', expected: { amount: 500, type: 'expense' } },
                    { text: 'Earned 2000 from client project', expected: { amount: 2000, type: 'income' } },
                    { text: 'Bought groceries for 1500', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Hindi
            {
                language: 'hi',
                languageName: 'Hindi',
                examples: [
                    { text: 'मैंने पांच सौ रुपये चाय पर खर्च किए', expected: { amount: 500, type: 'expense' } },
                    { text: 'दो हजार रुपये कमाए', expected: { amount: 2000, type: 'income' } },
                    { text: 'एक हजार पांच सौ रुपये किराना की दुकान से सामान खरीदा', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Telugu
            {
                language: 'te',
                languageName: 'Telugu',
                examples: [
                    { text: 'ఐదు వందల రూపాయలు టీ కోసం ఖర్చు చేశారు', expected: { amount: 500, type: 'expense' } },
                    { text: 'రెండు వేల రూపాయలు సంపాదించారు', expected: { amount: 2000, type: 'income' } },
                    { text: 'వెయ్యి ఐదువందల రూపాయలు కిరానా కోసం ఖర్చు', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Spanish
            {
                language: 'es',
                languageName: 'Spanish',
                examples: [
                    { text: 'Gasté quinientos pesos en almuerzo', expected: { amount: 500, type: 'expense' } },
                    { text: 'Gané dos mil pesos del proyecto', expected: { amount: 2000, type: 'income' } },
                    { text: 'Compré víveres por mil quinientos pesos', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Arabic
            {
                language: 'ar',
                languageName: 'Arabic',
                examples: [
                    { text: 'أنفقت خمسمائة ريال على الغداء', expected: { amount: 500, type: 'expense' } },
                    { text: 'كسبت ألفين ريال من المشروع', expected: { amount: 2000, type: 'income' } },
                    { text: 'اشتريت البقالة بألف وخمسمائة ريال', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // French
            {
                language: 'fr',
                languageName: 'French',
                examples: [
                    { text: 'Jai dépensé cinq cents euros pour le déjeuner', expected: { amount: 500, type: 'expense' } },
                    { text: 'Jai gagné deux mille euros du projet', expected: { amount: 2000, type: 'income' } },
                    { text: 'Acheté des courses pour mille cinq cents euros', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // German
            {
                language: 'de',
                languageName: 'German',
                examples: [
                    { text: 'Ich habe fünfhundert Euro für das Mittagessen ausgegeben', expected: { amount: 500, type: 'expense' } },
                    { text: 'Ich habe zweitausend Euro vom Projekt verdient', expected: { amount: 2000, type: 'income' } },
                    { text: 'Einkäufe für tausendfünfhundert Euro gekauft', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Chinese
            {
                language: 'zh',
                languageName: 'Chinese',
                examples: [
                    { text: '我在午餐上花了五百元', expected: { amount: 500, type: 'expense' } },
                    { text: '我从项目中赚了两千元', expected: { amount: 2000, type: 'income' } },
                    { text: '买了一千五百元的杂货', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Japanese
            {
                language: 'ja',
                languageName: 'Japanese',
                examples: [
                    { text: '昼食に500円を使いました', expected: { amount: 500, type: 'expense' } },
                    { text: 'プロジェクトで2000円稼ぎました', expected: { amount: 2000, type: 'income' } },
                    { text: '1500円で食料品を買いました', expected: { amount: 1500, type: 'expense' } },
                ]
            },
            // Korean
            {
                language: 'ko',
                languageName: 'Korean',
                examples: [
                    { text: '점심에 500원을 썼습니다', expected: { amount: 500, type: 'expense' } },
                    { text: '프로젝트에서 2000원을 벌었습니다', expected: { amount: 2000, type: 'income' } },
                    { text: '1500원으로 식료품을 샀습니다', expected: { amount: 1500, type: 'expense' } },
                ]
            },
        ];
        res.json({
            success: true,
            examples
        });
    }
    catch (error) {
        console.error('Get examples error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get examples'
        });
    }
});
export default router;
