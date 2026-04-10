/**
 * Location-based language detection and management service
 * Automatically detects user location and sets appropriate language
 */
export class LocationLanguageService {
    constructor() {
        this.ipGeoCache = new Map();
        this.languageMappings = this.initializeLanguageMappings();
    }
    initializeLanguageMappings() {
        const map = new Map();
        // Country to language mapping
        const countryMap = {
            // English
            'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en',
            // Canada - English (Quebec handled separately if needed)
            'CA': 'en',
            // Hindi (India)
            'IN': 'hi',
            // Telugu (India states)
            'IN-AP': 'te', 'IN-TG': 'te', 'IN-TS': 'te',
            // Tamil (India states, Sri Lanka, Singapore, Malaysia)
            'IN-TN': 'ta', 'IN-KL': 'ta', 'LK': 'ta', 'SG': 'en', 'MY': 'ms',
            // Marathi (India)
            'IN-MH': 'mr',
            // Bengali (India, Bangladesh)
            'IN-WB': 'bn', 'BD': 'bn',
            // Spanish
            'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es',
            'CL': 'es', 'VE': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es',
            'EC': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es',
            'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es', 'PR': 'es',
            // French
            'FR': 'fr', 'BE': 'fr', 'LU': 'fr', 'MC': 'fr', 'CD': 'fr',
            'CI': 'fr', 'SN': 'fr', 'ML': 'fr',
            // Switzerland - French (German/Italian handled separately if needed)
            'CH': 'fr',
            // German
            'DE': 'de', 'AT': 'de', 'LI': 'de',
            // Portuguese
            'BR': 'pt', 'PT': 'pt', 'AO': 'pt', 'MZ': 'pt', 'GW': 'pt',
            'CV': 'pt', 'ST': 'pt', 'TL': 'pt',
            // Macao - Portuguese
            'MO': 'pt',
            // Arabic
            'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'MA': 'ar', 'DZ': 'ar',
            'IQ': 'ar', 'SY': 'ar', 'SD': 'ar', 'YE': 'ar', 'OM': 'ar',
            'JO': 'ar', 'LB': 'ar', 'KW': 'ar', 'QA': 'ar', 'BH': 'ar',
            'LY': 'ar', 'TN': 'ar', 'PS': 'ar', 'SO': 'ar', 'DJ': 'ar',
            'MR': 'ar', 'KM': 'ar', 'TD': 'ar',
            // Chinese
            'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
            // Japanese
            'JP': 'ja',
            // Korean
            'KR': 'ko', 'KP': 'ko',
            // Italian
            'IT': 'it', 'SM': 'it', 'VA': 'it',
            // Russian
            'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru', 'TJ': 'ru',
            'UZ': 'ru', 'MD': 'ru', 'AM': 'ru', 'AZ': 'ru', 'GE': 'ru',
            // Ukraine - Ukrainian
            'UA': 'uk',
            // Dutch
            'NL': 'nl', 'SR': 'nl', 'CW': 'nl', 'AW': 'nl',
            // Indonesian
            'ID': 'id',
            // Malay
            'BN': 'ms',
            // Turkish
            'TR': 'tr', 'CY': 'tr',
            // Thai
            'TH': 'th',
            // Vietnamese
            'VN': 'vi',
            // Polish
            'PL': 'pl',
            // Romanian
            'RO': 'ro',
            // Hungarian
            'HU': 'hu',
            // Czech
            'CZ': 'cs',
            // Swedish
            'SE': 'sv',
            // Norwegian
            'NO': 'no',
            // Danish
            'DK': 'da',
            // Finnish
            'FI': 'fi',
            // Greek
            'GR': 'el',
            // Hebrew
            'IL': 'he',
            // Persian (Farsi)
            'IR': 'fa', 'AF': 'fa',
            // Urdu
            'PK': 'ur',
            // Filipino
            'PH': 'fil',
            // Swahili
            'KE': 'sw', 'TZ': 'sw', 'UG': 'sw', 'RW': 'sw',
            // Amharic
            'ET': 'am',
            // Zulu
            'ZA': 'zu',
        };
        Object.entries(countryMap).forEach(([key, value]) => {
            map.set(key, value);
        });
        return map;
    }
    /**
     * Detect language from IP address
     */
    async detectLanguageFromIP(ip) {
        try {
            // Check cache first
            if (this.ipGeoCache.has(ip)) {
                const geo = this.ipGeoCache.get(ip);
                const language = this.getLanguageForLocation(geo.country, geo.region);
                return {
                    code: language,
                    name: this.getLanguageName(language),
                    nativeName: this.getNativeLanguageName(language),
                    flag: this.getCountryFlag(geo.country),
                    detectedFrom: 'ip'
                };
            }
            // Fetch geo location from IP
            const geo = await this.fetchGeoLocation(ip);
            this.ipGeoCache.set(ip, geo);
            const language = this.getLanguageForLocation(geo.country, geo.region);
            return {
                code: language,
                name: this.getLanguageName(language),
                nativeName: this.getNativeLanguageName(language),
                flag: this.getCountryFlag(geo.country),
                detectedFrom: 'ip'
            };
        }
        catch (error) {
            console.error('IP language detection failed:', error);
            // Fallback to English
            return {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                flag: '🌐',
                detectedFrom: 'ip'
            };
        }
    }
    /**
     * Detect language from browser Accept-Language header
     */
    detectLanguageFromBrowser(acceptLanguage) {
        const languages = acceptLanguage.split(',').map(lang => {
            const [code] = lang.trim().split(';');
            return code;
        });
        // Get the primary language
        const primaryLang = languages[0];
        const langCode = primaryLang.split('-')[0];
        return {
            code: langCode,
            name: this.getLanguageName(langCode),
            nativeName: this.getNativeLanguageName(langCode),
            flag: this.getLanguageFlag(langCode),
            detectedFrom: 'browser'
        };
    }
    /**
     * Detect language from GPS coordinates
     */
    async detectLanguageFromGPS(latitude, longitude) {
        try {
            // Reverse geocode to get country
            const geo = await this.reverseGeocode(latitude, longitude);
            const language = this.getLanguageForLocation(geo.country, geo.region);
            return {
                code: language,
                name: this.getLanguageName(language),
                nativeName: this.getNativeLanguageName(language),
                flag: this.getCountryFlag(geo.country),
                detectedFrom: 'gps'
            };
        }
        catch (error) {
            console.error('GPS language detection failed:', error);
            // Fallback to English
            return {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                flag: '🌐',
                detectedFrom: 'gps'
            };
        }
    }
    /**
     * Get language for a specific location
     */
    getLanguageForLocation(country, region) {
        // First check for specific region (e.g., Indian states)
        if (region && country === 'IN') {
            const regionKey = `${country}-${region}`;
            if (this.languageMappings.has(regionKey)) {
                return this.languageMappings.get(regionKey);
            }
        }
        // Fall back to country-level mapping
        if (this.languageMappings.has(country)) {
            return this.languageMappings.get(country);
        }
        // Default to English
        return 'en';
    }
    /**
     * Fetch geo location from IP
     */
    async fetchGeoLocation(ip) {
        try {
            // Using ip-api.com (free tier, no API key needed)
            const response = await fetch(`http://ip-api.com/json/${ip}`);
            const data = await response.json();
            if (data.status === 'success') {
                return {
                    country: data.countryCode,
                    region: data.region,
                    city: data.city,
                    timezone: data.timezone,
                    ip: ip
                };
            }
            throw new Error('IP lookup failed');
        }
        catch (error) {
            // Fallback to ipinfo.io
            try {
                const response = await fetch(`https://ipinfo.io/${ip}/json`);
                const data = await response.json();
                return {
                    country: data.country,
                    region: data.region,
                    city: data.city,
                    timezone: data.timezone,
                    ip: ip
                };
            }
            catch (fallbackError) {
                throw new Error('All IP lookup services failed');
            }
        }
    }
    /**
     * Reverse geocode coordinates to location
     */
    async reverseGeocode(latitude, longitude) {
        try {
            // Using OpenStreetMap Nominatim API (free)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.address || {};
            const countryCode = address.country_code?.toUpperCase() || 'US';
            return {
                country: countryCode,
                region: address.state || address.region,
                city: address.city || address.town,
                timezone: 'UTC',
                ip: ''
            };
        }
        catch (error) {
            throw new Error('Reverse geocoding failed');
        }
    }
    /**
     * Get language name in English
     */
    getLanguageName(code) {
        const names = {
            'en': 'English', 'hi': 'Hindi', 'te': 'Telugu', 'ta': 'Tamil',
            'mr': 'Marathi', 'bn': 'Bengali', 'es': 'Spanish', 'fr': 'French',
            'de': 'German', 'pt': 'Portuguese', 'ar': 'Arabic', 'zh': 'Chinese',
            'ja': 'Japanese', 'ko': 'Korean', 'it': 'Italian', 'ru': 'Russian',
            'nl': 'Dutch', 'id': 'Indonesian', 'ms': 'Malay', 'tr': 'Turkish',
            'th': 'Thai', 'vi': 'Vietnamese', 'pl': 'Polish', 'uk': 'Ukrainian',
            'ro': 'Romanian', 'hu': 'Hungarian', 'cs': 'Czech', 'sv': 'Swedish',
            'no': 'Norwegian', 'da': 'Danish', 'fi': 'Finnish', 'el': 'Greek',
            'he': 'Hebrew', 'fa': 'Persian', 'ur': 'Urdu', 'fil': 'Filipino',
            'sw': 'Swahili', 'am': 'Amharic', 'zu': 'Zulu'
        };
        return names[code] || 'English';
    }
    /**
     * Get native language name
     */
    getNativeLanguageName(code) {
        const names = {
            'en': 'English', 'hi': 'हिंदी', 'te': 'తెలుగు', 'ta': 'தமிழ்',
            'mr': 'मराठी', 'bn': 'বাংলা', 'es': 'Español', 'fr': 'Français',
            'de': 'Deutsch', 'pt': 'Português', 'ar': 'العربية', 'zh': '中文',
            'ja': '日本語', 'ko': '한국어', 'it': 'Italiano', 'ru': 'Русский',
            'nl': 'Nederlands', 'id': 'Bahasa Indonesia', 'ms': 'Bahasa Melayu', 'tr': 'Türkçe',
            'th': 'ไทย', 'vi': 'Tiếng Việt', 'pl': 'Polski', 'uk': 'Українська',
            'ro': 'Română', 'hu': 'Magyar', 'cs': 'Čeština', 'sv': 'Svenska',
            'no': 'Norsk', 'da': 'Dansk', 'fi': 'Suomi', 'el': 'Ελληνικά',
            'he': 'עברית', 'fa': 'فارسی', 'ur': 'اردو', 'fil': 'Filipino',
            'sw': 'Kiswahili', 'am': 'አማርኛ', 'zu': 'isiZulu'
        };
        return names[code] || 'English';
    }
    /**
     * Get country flag emoji
     */
    getCountryFlag(countryCode) {
        const flags = {
            'US': '🇺🇸', 'GB': '🇬🇧', 'IN': '🇮🇳', 'AU': '🇦🇺', 'CA': '🇨🇦',
            'ES': '🇪🇸', 'MX': '🇲🇽', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹',
            'BR': '🇧🇷', 'PT': '🇵🇹', 'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬',
            'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'RU': '🇷🇺', 'NL': '🇳🇱',
            'ID': '🇮🇩', 'MY': '🇲🇾', 'TR': '🇹🇷', 'TH': '🇹🇭', 'VN': '🇻🇳',
            'PL': '🇵🇱', 'UA': '🇺🇦', 'RO': '🇷🇴', 'HU': '🇭🇺', 'CZ': '🇨🇿',
            'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'GR': '🇬🇷',
            'IL': '🇮🇱', 'IR': '🇮🇷', 'PK': '🇵🇰', 'PH': '🇵🇭', 'KE': '🇰🇪',
            'TZ': '🇹🇿', 'ET': '🇪🇹', 'ZA': '🇿🇦', 'BD': '🇧🇩',
            'SG': '🇸🇬', 'NZ': '🇳🇿', 'IE': '🇮🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
            'BE': '🇧🇪', 'LU': '🇱🇺', 'MC': '🇲🇨', 'LI': '🇱🇮', 'SM': '🇸🇲',
            'VA': '🇻🇦', 'BY': '🇧🇾', 'KZ': '🇰🇿', 'KG': '🇰🇬', 'TJ': '🇹🇯',
            'UZ': '🇺🇿', 'MD': '🇲🇩', 'AM': '🇦🇲', 'AZ': '🇦🇿', 'GE': '🇬🇪',
            'AO': '🇦🇴', 'MZ': '🇲🇿', 'GW': '🇬🇼', 'CV': '🇨🇻', 'ST': '🇸🇹',
            'TL': '🇹🇱', 'MO': '🇲🇴', 'CU': '🇨🇺', 'DO': '🇩🇴', 'HN': '🇭🇳',
            'PY': '🇵🇾', 'SV': '🇸🇻', 'NI': '🇳🇮', 'CR': '🇨🇷', 'PA': '🇵🇦',
            'UY': '🇺🇾', 'PR': '🇵🇷', 'CL': '🇨🇱', 'VE': '🇻🇪', 'CO': '🇨🇴',
            'PE': '🇵🇪', 'EC': '🇪🇨', 'BO': '🇧🇴', 'GT': '🇬🇹', 'IQ': '🇮🇶',
            'SY': '🇸🇾', 'SD': '🇸🇩', 'YE': '🇾🇪', 'OM': '🇴🇲', 'JO': '🇯🇴',
            'LB': '🇱🇧', 'KW': '🇰🇼', 'QA': '🇶🇦', 'BH': '🇧🇭', 'LY': '🇱🇾',
            'TN': '🇹🇳', 'PS': '🇵🇸', 'SO': '🇸🇴', 'DJ': '🇩🇯', 'MR': '🇲🇷',
            'KM': '🇰🇲', 'TD': '🇹🇩', 'CY': '🇨🇾', 'AF': '🇦🇫', 'CD': '🇨🇩',
            'CI': '🇨🇮', 'SN': '🇸🇳', 'ML': '🇲🇱', 'SR': '🇸🇷', 'CW': '🇨🇼',
            'AW': '🇦🇼', 'BN': '🇧🇳', 'UG': '🇺🇬', 'RW': '🇷🇼', 'KP': '🇰🇵',
            'LA': '🇱🇦', 'MM': '🇲🇲', 'KH': '🇰🇭', 'BT': '🇧🇹', 'NP': '🇳🇵',
            'MV': '🇲🇻', 'LK': '🇱🇰'
        };
        return flags[countryCode] || '🌐';
    }
    /**
     * Get language flag
     */
    getLanguageFlag(code) {
        const flags = {
            'en': '🇬🇧', 'hi': '🇮🇳', 'te': '🇮🇳', 'ta': '🇮🇳',
            'mr': '🇮🇳', 'bn': '🇮🇳', 'es': '🇪🇸', 'fr': '🇫🇷',
            'de': '🇩🇪', 'pt': '🇵🇹', 'ar': '🇸🇦', 'zh': '🇨🇳',
            'ja': '🇯🇵', 'ko': '🇰🇷', 'it': '🇮🇹', 'ru': '🇷🇺',
            'nl': '🇳🇱', 'id': '🇮🇩', 'ms': '🇲🇾', 'tr': '🇹🇷',
            'th': '🇹🇭', 'vi': '🇻🇳', 'pl': '🇵🇱', 'uk': '🇺🇦',
            'ro': '🇷🇴', 'hu': '🇭🇺', 'cs': '🇨🇿', 'sv': '🇸🇪',
            'no': '🇳🇴', 'da': '🇩🇰', 'fi': '🇫🇮', 'el': '🇬🇷',
            'he': '🇮🇱', 'fa': '🇮🇷', 'ur': '🇵🇰', 'fil': '🇵🇭',
            'sw': '🇰🇪', 'am': '🇪🇹', 'zu': '🇿🇦'
        };
        return flags[code] || '🌐';
    }
    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        const languages = [
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
            { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
            { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
            { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
            { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
            { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
            { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
            { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
            { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
            { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
            { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
        ];
        return languages;
    }
    /**
     * Check if language is RTL
     */
    isRTL(languageCode) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(languageCode);
    }
}
