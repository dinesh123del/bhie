import { Router } from 'express';
import { LocationLanguageService } from '../services/location-language-service';
import { TranslationService } from '../services/translation-service';

const router = Router();
const locationService = new LocationLanguageService();
const translationService = new TranslationService();

/**
 * Detect language from user's IP address
 */
router.get('/detect-from-ip', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const language = await locationService.detectLanguageFromIP(ip);
    
    res.json({
      success: true,
      language,
      isRTL: locationService.isRTL(language.code),
      currencySymbol: translationService.getCurrencySymbol(language.code)
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect language',
      fallback: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🌐',
        detectedFrom: 'ip'
      }
    });
  }
});

/**
 * Detect language from browser Accept-Language header
 */
router.get('/detect-from-browser', (req, res) => {
  try {
    const acceptLanguage = req.headers['accept-language'] || 'en-US,en;q=0.9';
    const language = locationService.detectLanguageFromBrowser(acceptLanguage);
    
    res.json({
      success: true,
      language,
      isRTL: locationService.isRTL(language.code),
      currencySymbol: translationService.getCurrencySymbol(language.code)
    });
  } catch (error) {
    console.error('Browser language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect language from browser'
    });
  }
});

/**
 * Detect language from GPS coordinates
 */
router.post('/detect-from-gps', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const language = await locationService.detectLanguageFromGPS(latitude, longitude);
    
    res.json({
      success: true,
      language,
      isRTL: locationService.isRTL(language.code),
      currencySymbol: translationService.getCurrencySymbol(language.code)
    });
  } catch (error) {
    console.error('GPS language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect language from GPS'
    });
  }
});

/**
 * Get all supported languages
 */
router.get('/supported', (req, res) => {
  try {
    const languages = locationService.getSupportedLanguages();
    res.json({
      success: true,
      languages
    });
  } catch (error) {
    console.error('Get supported languages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported languages'
    });
  }
});

/**
 * Translate a key to a specific language
 */
router.get('/translate', (req, res) => {
  try {
    const { key, language = 'en' } = req.query;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Key is required'
      });
    }
    
    const translated = translationService.translate(key as string, language as string);
    
    res.json({
      success: true,
      key,
      language,
      translated,
      isRTL: translationService.isRTL(language as string)
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to translate'
    });
  }
});

/**
 * Get multiple translations at once
 */
router.post('/translate-batch', (req, res) => {
  try {
    const { keys, language = 'en' } = req.body;
    
    if (!Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        error: 'Keys must be an array'
      });
    }
    
    const translations: Record<string, string> = {};
    keys.forEach((key: string) => {
      translations[key] = translationService.translate(key, language);
    });
    
    res.json({
      success: true,
      language,
      translations,
      isRTL: translationService.isRTL(language)
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to translate batch'
    });
  }
});

/**
 * Check if a language is RTL
 */
router.get('/is-rtl/:language', (req, res) => {
  try {
    const { language } = req.params;
    const isRTL = locationService.isRTL(language);
    
    res.json({
      success: true,
      language,
      isRTL
    });
  } catch (error) {
    console.error('RTL check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check RTL'
    });
  }
});

/**
 * Get currency symbol for a language
 */
router.get('/currency/:language', (req, res) => {
  try {
    const { language } = req.params;
    const symbol = translationService.getCurrencySymbol(language);
    
    res.json({
      success: true,
      language,
      symbol
    });
  } catch (error) {
    console.error('Currency symbol error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get currency symbol'
    });
  }
});

export default router;
