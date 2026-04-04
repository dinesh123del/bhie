# BHIE Full-Stack Deployment Guide

Complete step-by-step deployment guide for deploying BHIE to production.

## 📋 Deployment Overview

```
Architecture:
┌─────────────────────────────────────┐
│  Frontend (Vite React)              │
│  Deployed on: Vercel                │
│  https://bhie.vercel.app            │
│  Branch: main                       │
└──────────────┬──────────────────────┘
               │ API Calls
               ↓
┌─────────────────────────────────────┐
│  Backend (Express Node.js)          │
│  Deployed on: Render                │
│  https://bhie-backend.onrender.com  │
└──────────────┬──────────────────────┘
               │ Queries
               ↓
┌─────────────────────────────────────┐
│  Database (MongoDB)                 │
│  Deployed on: MongoDB Atlas         │
│  Region: AWS/US                     │
└─────────────────────────────────────┘
```

---

## 🔧 Prerequisites

Before deployment, ensure you have:

- [ ] GitHub account (for version control)
- [ ] Vercel account (free tier available)
- [ ] Render account (free tier available)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Git installed locally
- [ ] Both repos pushed to GitHub

### Quick Setup

```bash
# If not already done, push to GitHub
git remote add origin https://github.com/yourusername/BHIE.git
git branch -M main
git push -u origin main
```

---

## Part 1: MongoDB Atlas Database Setup

### Step 1.1: Create MongoDB Atlas Account

1. Visit: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with email/password
4. Verify email

### Step 1.2: Create Cluster

1. Click "Create" on Atlas dashboard
2. Choose **Shared Free Tier** (M0 - always free)
3. Select cloud provider: **AWS**
4. Select region: **US East (N. Virginia)** or closest to you
5. Click "Create"
6. Wait 2-3 minutes for cluster creation

### Step 1.3: Create Database User

1. In cluster view, go to "Security" → "Database Access"
2. Click "Add New Database User"
3. **Username**: `bhie_user`
4. **Password**: Generate strong password (save it!)
5. **Built-in Role**: `readWriteAnyDatabase`
6. Click "Add User"

**IMPORTANT**: Save the password — you'll need it for connection string!

### Step 1.4: Configure Network Access

1. Go to "Security" → "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere"
   - **IP Address**: `0.0.0.0/0` (production access)
   - NOTE: For production, specify exact IPs instead
4. Click "Confirm"

### Step 1.5: Get Connection String

1. Go back to Clusters view
2. Click "Connect"
3. Select "Connect your application"
4. Choose **Node.js** driver
5. Copy connection string:

```
mongodb+srv://bhie_user:<password>@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority
```

Replace `<password>` with actual password (no angle brackets!)

**Save this connection string** — you'll need it for backend deployment.

---

## Part 2: Backend Deployment (Render)

### Step 2.1: Prepare Backend for Production

**File**: `server/.gitignore` (verify it exists)

```
node_modules/
.env
.env.local
dist/
*.log
```

**File**: `server/package.json` (verify build scripts)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "preview": "node dist/server.js"
  }
}
```

If using JavaScript files instead, adjust accordingly:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "build": "echo 'No build needed for JS'",
    "start": "node src/server.js"
  }
}
```

### Step 2.2: Create Production Environment Variables

**File**: `server/.env.production` (create new file)

```env
# Server
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb+srv://bhie_user:<password>@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long_2026

# Frontend URL (for CORS)
FRONTEND_URL=https://bhie.vercel.app

# Payment (if applicable)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# AI (Optional)
OPENAI_API_KEY=sk-proj-xxxxx (optional)
```

Replace with actual values!

### Step 2.3: Update CORS Configuration

**File**: `server/src/server.ts` (or `server.js`)

```typescript
import cors from 'cors';

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/ai', aiRoutes);
// ... other routes

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

### Step 2.4: Create Render Account & Deploy

1. Visit: https://render.com
2. Click "Sign up" → Choose GitHub
3. Authorize Render to access your GitHub account
4. Click "New +" → "Web Service"
5. Select your BHIE backend repository
6. **Configuration**:
   - Name: `bhie-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free (or upgrade)

### Step 2.5: Add Environment Variables on Render

In Render dashboard for the service:

1. Go to "Environment"
2. Click "Add Environment Variable"
3. Add each variable:

```
NODE_ENV = production
PORT = 4000
MONGODB_URI = mongodb+srv://bhie_user:password@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET = your_super_secure_jwt_secret_minimum_32_characters_long_2026
FRONTEND_URL = https://bhie.vercel.app
RAZORPAY_KEY_ID = your_key
RAZORPAY_KEY_SECRET = your_secret
```

4. Click "Deploy"
5. Wait for deployment (3-5 minutes)

### Step 2.6: Verify Backend Deployment

Once deployed, you'll get a URL like: `https://bhie-backend.onrender.com`

Test it:

```bash
# Health check
curl https://bhie-backend.onrender.com/api/ai/health

# Expected response:
# {"status":"healthy","service":"Multi-Agent AI System",...}
```

**Save the URL**: `https://bhie-backend.onrender.com`

---

## Part 3: Frontend Deployment (Vercel)

### Step 3.1: Update API Base URL

**File**: `client/.env.production`

```env
VITE_API_URL=https://bhie-backend.onrender.com/api
VITE_APP_NAME=BHIE
```

**File**: `client/src/lib/axios.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on auth error
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3.2: Create Vercel Account & Deploy

1. Visit: https://vercel.com
2. Click "Sign Up" → Choose GitHub
3. Authorize Vercel to access your GitHub repos
4. Click "Add New..." → "Project"
5. Select your BHIE frontend repository
6. **Configuration**:
   - Framework: Vite
   - Root Directory: `client` (if monorepo)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 3.3: Add Environment Variables on Vercel

Before deploying:

1. In project settings, go to "Environment Variables"
2. Add variables:

```
VITE_API_URL = https://bhie-backend.onrender.com/api
VITE_APP_NAME = BHIE
```

3. Click "Deploy"
4. Wait for deployment (2-3 minutes)

### Step 3.4: Verify Frontend Deployment

Once deployed, you'll get a URL like: `https://bhie.vercel.app`

Test it:

```bash
# Visit in browser
https://bhie.vercel.app

# Check:
# 1. Login page loads
# 2. Console shows no CORS errors
# 3. API calls work (check Network tab)
```

---

## Part 4: Production Configuration

### Step 4.1: Update Backend CORS with Frontend URL

**Backend on Render Dashboard**:

1. Go to your service settings
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL = https://bhie.vercel.app
   ```
3. Click "Deploy"

### Step 4.2: Configure JWT Tokens

**File**: `server/src/utils/jwt.ts` (or relevant file)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = '7d'; // 7 days for production

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

### Step 4.3: Enable HTTPS Everywhere

**Vercel**: Automatic (all Vercel apps use HTTPS)

**Render**: Automatic (all Render apps use HTTPS)

**Browser Security**:

Add to frontend (important for production):

```typescript
// client/src/main.tsx
// Force HTTPS in production
if (import.meta.env.PROD) {
  if (window.location.protocol !== 'https:') {
    window.location.protocol = 'https';
  }
}
```

### Step 4.4: Set Secure Cookie Options

**File**: `server/src/middleware/auth.ts`

```typescript
// Login route cookie setup
res.cookie('token', token, {
  httpOnly: true,       // Prevent JS access
  secure: true,         // HTTPS only
  sameSite: 'strict',   // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === 'production' ? '.bhie.vercel.app' : undefined,
});
```

---

## Part 5: Environment Variables Summary

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb+srv://bhie_user:password@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority

# Security
JWT_SECRET=generate_with_: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CORS
FRONTEND_URL=https://bhie.vercel.app

# Payment (if using)
RAZORPAY_KEY_ID=your_production_key
RAZORPAY_KEY_SECRET=your_production_secret

# AI (optional)
OPENAI_API_KEY=sk-proj-xxxxx
```

### Frontend (.env.production)

```env
VITE_API_URL=https://bhie-backend.onrender.com/api
VITE_APP_NAME=BHIE
```

---

## 🚀 Deployment Commands

### Local Testing Before Deployment

```bash
# Test backend locally
cd server
npm run build
PORT=4000 NODE_ENV=production npm start

# Test frontend locally
cd client
npm run build
npm run preview

# Visit http://localhost:4173
# Test login, records, etc.
```

### GitHub Push (Triggers Auto-Deploy)

```bash
# Add all changes
cd /Users/srilekha/Desktop/BHIE
git add .

# Commit
git commit -m "chore: prepare for production deployment"

# Push to main (Render & Vercel auto-deploy)
git push origin main

# Verify deployments
# Render dashboard: https://dashboard.render.com
# Vercel dashboard: https://vercel.com/dashboard
```

### Manual Redeploy

**Render**:
```bash
# Dashboard → Service → Manual Deploy → Re-deploy
```

**Vercel**:
```bash
# Dashboard → Project → Deployments → Redeploy
```

---

## 🔍 Post-Deployment Verification

### Checklist

- [ ] Backend loads: `https://bhie-backend.onrender.com/api/ai/health`
- [ ] Frontend loads: `https://bhie.vercel.app`
- [ ] Login works
- [ ] Can create records
- [ ] Can fetch records
- [ ] Can edit records
- [ ] Can delete records
- [ ] AI prediction works
- [ ] No CORS errors in console
- [ ] JWT tokens valid
- [ ] Cookies set correctly

### Test Scenarios

```bash
# 1. Test health endpoints
curl https://bhie-backend.onrender.com/api/ai/health
curl https://bhie-backend.onrender.com/api/auth/health

# 2. Test CORS
curl -H "Origin: https://bhie.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://bhie-backend.onrender.com/api/auth/login \
  -v

# 3. Test database connection
# Monitor in MongoDB Atlas -> Clusters -> Metrics

# 4. Monitor logs
# Render: Dashboard → Service → Logs
# Vercel: Dashboard → Project → Deployments → Logs
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] All env vars are set on hosting platforms
- [ ] Database user has minimal permissions
- [ ] CORS origin restricted to frontend URL
- [ ] HTTPS enforced everywhere
- [ ] Cookies are httpOnly and secure
- [ ] No secrets in git repository
- [ ] API validates all inputs
- [ ] Rate limiting enabled (optional)
- [ ] Error messages don't expose sensitive info

---

## 🐛 Troubleshooting

### CORS Errors

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
```typescript
// server/src/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### Connection Timeout

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
1. Check MongoDB Atlas connection string
2. Verify IP whitelist includes `0.0.0.0/0`
3. Test locally with connection string first

### 404 Routes Not Found

**Problem**: Frontend routes work but API routes return 404

**Solution**:
```typescript
// Verify routes are registered
app.use('/api/records', recordsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
```

### JWT Token Expired

**Problem**: Users logged out after few minutes

**Solution**: Increase `JWT_EXPIRE` in config:
```typescript
const JWT_EXPIRE = '7d'; // Increase from '24h'
```

### MongoDB Connection Fails

**Problem**: `MongoNetworkError`

**Solution**:
1. Verify connection string in .env
2. Check MongoDB Atlas IP whitelist
3. Verify password doesn't have special chars (URL encode if needed)

---

## 📊 Monitoring & Logs

### Backend Logs (Render)

1. Dashboard → Service → Logs
2. Watch for errors:

```
✅ Server running on port 4000
❌ MongoNetworkError → Check database connection
❌ CORS error → Check FRONTEND_URL
```

### Frontend Logs (Vercel)

1. Dashboard → Project → Deployments → Logs
2. Or use browser DevTools (Ctrl+Shift+J)

### Database Logs (MongoDB Atlas)

1. Cluster → Logs
2. Check for connection errors

---

## 🎯 Production URLs

Once deployed, use these URLs:

| Service | URL |
|---------|-----|
| Frontend | https://bhie.vercel.app |
| Backend | https://bhie-backend.onrender.com |
| API Base | https://bhie-backend.onrender.com/api |
| Database | MongoDB Atlas (cloud) |

---

## ✅ Final Checklist

- [ ] All code committed and pushed to GitHub
- [ ] MongoDB Atlas cluster created and running
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] JWT tokens working
- [ ] All features tested in production
- [ ] Monitoring set up
- [ ] Documentation updated

---

## 🔄 Deployment Updates

To deploy updates after initial launch:

```bash
# Make changes locally
# Commit and push
git add .
git commit -m "feat: update feature"
git push origin main

# Vercel & Render auto-deploy on push
# Check dashboards for deployment status
```

---

Generated: April 2, 2026  
Version: 1.0.0  
Status: Production Ready ✅

### Option A: MongoDB Atlas (Cloud) - Recommended for Development
1. Go to: https://www.mongodb.com/try/download/community
2. Sign up for free MongoDB Atlas account
3. Create a project and database cluster
4. Get your connection string
5. Update `/Users/srilekha/Desktop/BHIE/server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhie?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB (Mac)
```bash
# Install MongoDB via Homebrew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Update .env
MONGODB_URI=mongodb://localhost:27017/bhie
```

---

## 🚀 Running the Project

### Terminal 1: Backend Server
```bash
cd /Users/srilekha/Desktop/BHIE/server
npm run dev
# Should see: 🚀 Server running on port 4000
```

### Terminal 2: Frontend
```bash
cd /Users/srilekha/Desktop/BHIE/client
npm run dev
# Should see: ➜  Local:   http://localhost:5173
```

### Terminal 3: ML Service
```bash
cd /Users/srilekha/Desktop/BHIE/ml-service
python3 -m uvicorn main:app --reload --port 8000
# Should see: Uvicorn running on 127.0.0.1:8000
```

---

## 📋 Pre-startup Checklist

- [ ] MongoDB connection string updated in `.env` (server)
- [ ] FRONTEND_URL set to `http://localhost:3000` in server `.env`
- [ ] VITE_API_URL set to `http://localhost:4000/api` in client `.env` (✓ already done)
- [ ] All three services running on correct ports: 4000, 5173, 8000

---

## 🔍 Verify Setup

### Check Backend Health
```bash
curl http://localhost:4000/api/health
# Expected response:
# {"status":"OK","message":"BHIE Server running with Prisma + MongoDB!","timestamp":"...","uptime":...}
```

### Check Frontend
```bash
open http://localhost:5173
# Should load React app
```

### Check ML Service
```bash
curl http://localhost:8000/docs
# Should show FastAPI Swagger documentation
```

---

## � Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET=bhie_secret_key_min_32_chars_required
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
OPENAI_API_KEY=sk-xxxxx
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000/api
VITE_RAZORPAY_KEY=rzp_test_xxxxx
```

### ML Service (.env)
```
PORT=8000
ENVIRONMENT=development
```

---

## � Troubleshooting

### "Port already in use" error
```bash
# Find and kill process on port 4000
lsof -i :4000
kill -9 <PID>

# Or use alternative port:
PORT=4001 npm run dev
```

### "Cannot connect to MongoDB"
- Verify MongoDB is running: `mongo --version`
- Check connection string in `.env`
- For Atlas: Ensure IP is whitelisted in Atlas dashboard

### TypeScript compilation errors
```bash
cd server
npm run build  # Check for build errors
```

### Prisma schema issues
```bash
cd server
npx prisma generate --schema ../prisma/schema.prisma
npx prisma db push --schema ../prisma/schema.prisma
npx prisma db seed # Optional: seed test data
```

---

## 📚 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Server health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/records` | List records |
| POST | `/api/records` | Create record |
| GET | `/api/admin/stats` | Admin statistics |
| POST | `/api/reports/generate` | Generate report |
| POST | `/api/ai/predict` | ML predictions |

---

## ✨ Next Steps After Setup

1. ✅ Set up MongoDB connection
2. ✅ Run all three services
3. ✅ Verify health endpoints
4. ✅ Create test user via `/api/auth/register`
5. ✅ Test API endpoints via `/api/health` or frontend
6. ✅ Deploy to production (Vercel for frontend, Render for backend)

---

**Issues or questions?** Check the project README.md or SETUP.md in the root directory.
