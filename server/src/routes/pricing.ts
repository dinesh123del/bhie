import express from 'express';
import requestIp from 'request-ip';
import geoip from 'geoip-lite';

const router = express.Router();

const pricingConfig: Record<string, { currency: string; price: number }> = {
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
    } catch (err) {
      console.error('Failed to fetch from ipapi.co', err);
    }
    
    // Pricing Lookups
    const pricing = pricingConfig[country] || pricingConfig['DEFAULT'];

    res.json({
      success: true,
      data: {
        country: geoCountry,
        currency: pricing.currency,
        price: pricing.price,
        ip: ipToTest
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pricing'
    });
  }
});

export default router;
