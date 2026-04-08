// Partner API features disabled - Partner model not yet implemented
// TODO: Implement Partner model and enable these features

/*
import { Request, Response, NextFunction } from 'express';
import { Partner } from '../models/Partner';

interface PartnerRequest extends Request {
  partner?: any;
}

export async function authenticatePartner(
  req: PartnerRequest,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.toString().replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const partner = await Partner.findOne({ apiKey, active: true });
  
  if (!partner) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Check if partner has access to requested resource
  if (req.params.id && !partner.authorizedBusinesses.includes(req.params.id)) {
    return res.status(403).json({ error: 'Access denied for this business' });
  }
  
  req.partner = partner;
  next();
}

export function rateLimit(limits: any) {
  return async (req: PartnerRequest, res: Response, next: NextFunction) => {
    const partner = req.partner;
    const tier = partner?.tier || 'tier1';
    const limit = limits[tier] || limits.tier1;
    
    // Simple in-memory rate limiting (use Redis in production)
    const key = `ratelimit:${partner?.id}:${Math.floor(Date.now() / limit.windowMs)}`;
    
    // Check rate limit
    // In production: use Redis incr with expiry
    
    next();
  };
}
*/
