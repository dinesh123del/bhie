# Production Environment Configuration Guide

This guide explains how to configure environment variables for deploying BIZ PLUS to production.

## 📋 Overview

The application requires two environment configuration files:
- **Server** (Backend): `.env` in the root directory
- **Client** (Frontend): `.env` in the `client/` directory

## 🔑 Required Environment Variables

### Server Environment Variables (Root `.env`)

#### Database Configuration
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/biz-plus?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/biz-plus?retryWrites=true&w=majority
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `biz-plus`

#### Security
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-64-characters-required
```

**Generate a secure JWT secret:**
```bash
# On macOS/Linux
openssl rand -base64 64

# On Windows (PowerShell)
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid + (New-Guid).Guid + (New-Guid).Guid))
```

#### Frontend URLs
```env
FRONTEND_URL=https://your-frontend-domain.com
CLIENT_URL=https://your-frontend-domain.com
```

**For multiple origins (comma-separated):**
```env
FRONTEND_URL=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

#### AI Services

**OpenAI API Key:**
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**How to get OpenAI API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Anthropic Claude API Key:**
```env
CLAUDE_API_KEY=sk-ant-your-anthropic-api-key-here
```

**How to get Claude API key:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Go to API Keys section
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

#### Google OAuth

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**How to get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Configure consent screen if prompted
6. Application type: "Web application"
7. Authorized redirect URIs:
   - Development: `http://localhost:5173`
   - Production: `https://your-frontend-domain.com`
8. Copy Client ID and Client Secret

#### Razorpay Payments

```env
RAZORPAY_KEY_ID=rzp_live_your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

**How to get Razorpay credentials:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign in or create an account
3. Go to Settings → API Keys
4. Generate key pair for production (starts with `rzp_live_`)
5. Copy Key ID and Key Secret

#### WhatsApp Business API (Optional)

```env
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

**How to get WhatsApp credentials:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a WhatsApp Business App
3. Configure webhook and get credentials

#### Redis (Optional - Recommended for Production)

```env
REDIS_URL=redis://your-redis-host:6379
```

**For production Redis:**
- Use [Redis Cloud](https://redis.com/try-free/)
- Or [AWS ElastiCache](https://aws.amazon.com/elasticache/)
- Or [Upstash Redis](https://upstash.com/)

### Client Environment Variables (`client/.env`)

```env
VITE_API_URL=https://your-backend-domain.com
VITE_RAZORPAY_KEY=rzp_live_your-razorpay-key-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important:**
- Only public-safe keys should be in client `.env`
- Never put secrets (JWT_SECRET, API secrets) in client `.env`
- VITE_API_URL should point to your production backend

## 🚀 Deployment Platform Configuration

### Vercel (Frontend)

1. Go to your Vercel project settings
2. Go to "Environment Variables"
3. Add the following:
   ```
   VITE_API_URL=https://your-backend-domain.com
   VITE_RAZORPAY_KEY=rzp_live_your-razorpay-key-id
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```
4. Redeploy

### Render (Backend)

1. Go to your Render service settings
2. Go to "Environment"
3. Add all server environment variables from the list above
4. Redeploy

### Railway (Backend)

1. Go to your Railway service
2. Go to "Variables"
3. Add all server environment variables
4. Redeploy

## 🔒 Security Best Practices

1. **Never commit `.env` files to Git**
   - Add `.env` to `.gitignore` (already done)
   
2. **Use different keys for development and production**
   - Development: Use test keys
   - Production: Use live keys

3. **Rotate secrets periodically**
   - Change JWT_SECRET every 90 days
   - Rotate API keys if compromised

4. **Use environment-specific configurations**
   - Development: `NODE_ENV=development`
   - Production: `NODE_ENV=production`

5. **Enable IP whitelisting** (if supported)
   - MongoDB Atlas: Whitelist your server IPs
   - Redis: Enable authentication and TLS

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] MongoDB URI configured with production cluster
- [ ] JWT_SECRET is a secure 64+ character string
- [ ] FRONTEND_URL points to production domain
- [ ] OpenAI API key is valid and has credits
- [ ] Claude API key is valid (if using Claude)
- [ ] Google OAuth credentials are configured
- [ ] Razorpay keys are in live mode (not test)
- [ ] Redis URL is configured (if using Redis)
- [ ] NODE_ENV is set to `production`
- [ ] All placeholder values are replaced

## 🧪 Testing Configuration

After updating environment variables:

1. **Test database connection:**
   ```bash
   # In server directory
   npm run dev
   # Check logs for "MongoDB connected"
   ```

2. **Test API endpoints:**
   ```bash
   curl https://your-backend-domain.com/api/health
   # Should return: {"status":"ok"}
   ```

3. **Test frontend:**
   - Open your production URL
   - Check browser console for errors
   - Test login functionality

## 📞 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB cluster is accessible from your server IP
4. Check API key quotas and billing status

## 🔄 Environment Variable Reference

See `.env.example` in the root directory for a complete list of all available environment variables with descriptions.
