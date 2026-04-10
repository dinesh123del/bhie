import express from 'express';
import requestIp from 'request-ip';
import Settings from '../models/Settings.js';
const router = express.Router();
const pricingConfig = {
    IN: { currency: "INR", price: 99 },
    US: { currency: "USD", price: 5 },
    GB: { currency: "GBP", price: 4 },
    DEFAULT: { currency: "USD", price: 5 }
};
router.get('/', async (req, res) => {
    try {
        // Detect IP
        const clientIp = requestIp.getClientIp(req) || '';
        // Fallback IP for local testing
        const ipToTest = clientIp === '127.0.0.1' || clientIp === '::1' ? '122.161.49.71' : clientIp; // Example Indian IP for testing locally
        // Geolocation using ipapi.co as requested
        let country = 'DEFAULT';
        let geoCountry = 'Unknown';
        try {
            const response = await fetch(`https://ipapi.co/${ipToTest}/json/`);
            const geo = await response.json();
            if (geo && geo.country_code) {
                country = geo.country_code;
                geoCountry = geo.country_name || geo.country_code;
            }
        }
        catch (err) {
            console.error('Failed to fetch from ipapi.co', err);
        }
        // Get dynamic settings
        const settings = await Settings.findOne() || { proPrice: 79, premiumPrice: 200, currency: 'INR', isFreeMode: true, adminInstructions: '', splashAds: [] };
        // Pricing Lookups
        const pricing = pricingConfig[country] || pricingConfig['DEFAULT'];
        res.json({
            success: true,
            data: {
                country: geoCountry,
                currency: settings.currency || pricing.currency,
                price: settings.proPrice || pricing.price, // Pro price as base
                premiumPrice: settings.premiumPrice,
                isFreeMode: settings.isFreeMode ?? true,
                adminInstructions: settings.adminInstructions || '',
                splashAds: settings.splashAds || [],
                ip: ipToTest
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching pricing'
        });
    }
});
export default router;
