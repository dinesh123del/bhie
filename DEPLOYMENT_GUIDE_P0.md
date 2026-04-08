# BHIE P0 Features Deployment Guide

## Overview
This guide covers the deployment of P0 features: Referral System and Usage-Based Billing.

## Features Deployed

### 1. Referral System
- **Backend API**: `/api/referrals/*`
- **Frontend Component**: `ReferralWidget`
- **Rewards**: 1 month free Pro for referrer, 50% off for referee, +500 XP
- **Social Sharing**: Twitter, LinkedIn, Email integration

### 2. Usage-Based Billing
- **Backend API**: `/api/usage/*`
- **Frontend Component**: `UsageDashboard`
- **Metered Resources**: Uploads, AI Analysis, OCR, API Calls, Storage, Team Members
- **Plan Limits**: Free (10/5), Starter (50/25), Growth (500/200), Enterprise (∞)

## Environment Variables

### Required Variables
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bhie
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Optional Variables
```bash
# Google OAuth (for future use)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...
```

## Database Setup

### MongoDB Collections
The following collections are created automatically:
- `referrals` - Stores referral information and tracking
- `usagecredits` - Tracks usage consumption and credits
- Existing collections: `users`, `organizations`, etc.

### Indexes
Important indexes are automatically created:
```javascript
// Referrals
db.referrals.createIndex({ referrerId: 1, createdAt: -1 })
db.referrals.createIndex({ code: 1 }, { unique: true })
db.referrals.createIndex({ status: 1 })

// Usage Credits
db.usagecredits.createIndex({ userId: 1, type: 1, createdAt: -1 })
db.usagecredits.createIndex({ organizationId: 1, type: 1, createdAt: -1 })
```

## API Endpoints

### Referral System
```
GET    /api/referrals/stats          - Get user referral statistics
POST   /api/referrals/create        - Create new referral
GET    /api/referrals/validate/:code - Validate referral code
POST   /api/referrals/convert       - Convert referral to signup
GET    /api/referrals/social-shares - Get social share templates
```

### Usage Billing
```
GET    /api/usage/stats              - Get current usage statistics
GET    /api/usage/history           - Get usage history
GET    /api/usage/billing           - Get billing summary
POST   /api/usage/purchase          - Purchase additional credits
GET    /api/usage/check/:type       - Check usage limits
```

## Frontend Integration

### Dashboard Components
The following components are added to the Dashboard:
- **Referral Button**: "Get 1 Month Free" with amber gradient
- **Usage Button**: "View Quotas" with cyan gradient
- **ReferralWidget Modal**: Full referral management interface
- **UsageDashboard Modal**: Usage tracking and credit purchase

### Component Props
```typescript
// ReferralWidget
<ReferralWidget isOpen={boolean} onClose={() => void} />

// UsageDashboard
<UsageDashboard isOpen={boolean} onClose={() => void} />
```

## Deployment Steps

### 1. Backend Deployment
```bash
# Build the server
cd server
npm run build

# Start production server
npm start
```

### 2. Frontend Deployment
```bash
# Build the client
cd client
npm run build

# Deploy to your hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

### 3. Environment Configuration
1. Set all required environment variables
2. Configure MongoDB connection
3. Set up payment providers (Razorpay)
4. Configure OAuth providers (Google)

### 4. Database Migration
```bash
# Seed initial data if needed
cd server
npm run seed
```

## Testing

### Health Check
```bash
curl https://yourdomain.com/api/health
```

### API Testing
```bash
# Test referral stats (requires auth token)
curl -H "Authorization: Bearer <token>" \
  https://yourdomain.com/api/referrals/stats

# Test usage stats (requires auth token)
curl -H "Authorization: Bearer <token>" \
  https://yourdomain.com/api/usage/stats
```

## Monitoring

### Key Metrics to Monitor
- Referral conversion rate
- Usage consumption by tier
- API response times
- Error rates for new endpoints

### Logs to Watch
- Referral creation and conversion
- Usage limit exceeded warnings
- Payment processing errors

## Security Considerations

### Authentication
- All new endpoints require JWT authentication
- Rate limiting applied to prevent abuse
- Input validation on all endpoints

### Data Protection
- Referral codes are unique and expire in 30 days
- Usage data is isolated per user/organization
- Sensitive data is encrypted in database

## Troubleshooting

### Common Issues

#### Backend Won't Start
- Check environment variables are set
- Verify MongoDB connection string
- Ensure all required dependencies are installed

#### Referral Links Show "undefined"
- Verify `CLIENT_URL` environment variable is set
- Check frontend URL configuration

#### Usage Stats Not Updating
- Verify usage billing service is initialized
- Check MongoDB indexes are created
- Review API authentication tokens

### Error Messages
- `Access token required` - User needs to log in
- `Usage limit exceeded` - User has reached plan limits
- `Invalid referral code` - Referral code doesn't exist or expired

## Rollback Plan

If issues occur:
1. Revert to previous commit before P0 features
2. Restore database from backup
3. Clear any new collections created
4. Restart services with old configuration

## Support

For deployment issues:
1. Check server logs for error messages
2. Verify all environment variables
3. Test database connectivity
4. Review API authentication flow

## Next Steps

After successful P0 deployment:
1. Monitor user adoption of referral system
2. Track usage patterns and upgrade conversions
3. Plan P1 implementation (Team Workspaces)
4. Optimize based on user feedback
