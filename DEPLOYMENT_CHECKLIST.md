# 🚀 BHIE Production Deployment Checklist

**Status**: Ready for Deployment  
**Last Updated**: April 2, 2026  
**Target Deployment**: MongoDB Atlas + Render + Vercel  

---

## 📋 Pre-Deployment Checklist

### Phase 1: Planning & Preparation

#### Database
- [ ] MongoDB Atlas account created
- [ ] Organization/project set up
- [ ] Billing information added
- [ ] IP whitelist plan decided (0.0.0.0/0 for dev, specific IPs for prod)

#### Backend Hosting
- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Understanding of Render's deployment process

#### Frontend Hosting
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Understanding of Vercel's deployment process

#### Security
- [ ] JWT secret generated (32+ characters)
- [ ] Production API keys obtained (if using external APIs)
- [ ] HTTPS understood (automatic on both platforms)
- [ ] CORS policy reviewed and finalized

#### Documentation
- [ ] DEPLOYMENT_GUIDE.md read thoroughly
- [ ] ENV_CONFIGURATION.md reviewed
- [ ] All env variables documented
- [ ] Team onboarded to deployment process

---

## 🗄️ Part 1: MongoDB Atlas Database Setup

### Step 1.1: Create MongoDB Atlas Account
- [ ] Visit https://www.mongodb.com/cloud/atlas
- [ ] Sign up with email
- [ ] Verify email address
- [ ] Set up organization name

### Step 1.2: Create Project & Cluster
- [ ] Create new project named "BHIE"
- [ ] Choose free tier (M0 Sandbox)
- [ ] Select deployment region (choose closest to backend)
- [ ] Network configuration setup
- [ ] Cluster creation (takes 5-10 minutes)

### Step 1.3: Create Database User
- [ ] Create user with username: `bhie_user`
- [ ] Generate strong password (25+ characters)
- [ ] Store password securely in password manager
- [ ] Set role to: Database User Admin
- [ ] Document credentials safely

### Step 1.4: Configure Network Access
- [ ] Add IP address 0.0.0.0/0 (allows all IPs - for development)
- [ ] Alternative: Add specific server IP once Render deployed
- [ ] Save changes

### Step 1.5: Get Connection String
- [ ] Copy connection string in "Connect" section
- [ ] Format: `mongodb+srv://bhie_user:<password>@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority`
- [ ] Replace `<password>` with actual password
- [ ] Store as `MONGODB_URI` environment variable
- [ ] Test connection locally if possible

**Verification**:
```bash
# Test connection string
mongosh "mongodb+srv://bhie_user:PASSWORD@cluster0.xxxxx.mongodb.net/bhie"
```

---

## 🖥️ Part 2: Backend Deployment on Render

### Step 2.1: Verify Backend Package Configuration

**File**: `server/package.json`

```json
{
  "name": "bhie-backend",
  "version": "1.0.0",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

- [ ] `package.json` has correct scripts
- [ ] `tsconfig.json` exists
- [ ] `server/dist/` folder will be generated on build
- [ ] All dependencies listed in `package.json`

### Step 2.2: Prepare Environment File

**Create**: `server/.env.production`

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://bhie_user:PASSWORD@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long_2026
FRONTEND_URL=https://bhie.vercel.app
```

- [ ] `.env.production` created in server folder
- [ ] All variables filled with actual values
- [ ] Passwords properly escaped (URL encode special chars)
- [ ] JWT_SECRET is 32+ characters
- [ ] File is in .gitignore (not committed to GitHub)

### Step 2.3: Update CORS Configuration

**File**: `server/src/server.ts`

```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

- [ ] CORS origin uses `process.env.FRONTEND_URL`
- [ ] Credentials set to `true`
- [ ] Methods include GET, POST, PUT, DELETE
- [ ] Authorization header allowed

### Step 2.4: Create Render Service

1. [ ] Go to https://render.com/dashboard
2. [ ] Click "New +" → "Web Service"
3. [ ] Connect GitHub repository
4. [ ] Select repo and branch (main)
5. [ ] Configure build command: `npm install && npm run build`
6. [ ] Configure start command: `npm run start`
7. [ ] Set Node environment: select "Node"

### Step 2.5: Add Environment Variables on Render

In Render Dashboard → Environment:

```
NODE_ENV = production
PORT = 4000
MONGODB_URI = mongodb+srv://bhie_user:PASSWORD@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET = <your_generated_secret>
FRONTEND_URL = https://bhie.vercel.app
```

- [ ] Copy each variable name and value exactly
- [ ] Replace USERNAME, PASSWORD with actual values
- [ ] Replace FRONTEND_URL with actual Vercel URL
- [ ] Save and deploy

### Step 2.6: Trigger Deployment & Verify

- [ ] Click "Deploy" button on Render
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check deployment logs for errors
- [ ] Note your Render URL: `https://bhie-backend-xxxx.onrender.com`
- [ ] Test health endpoint:

```bash
curl https://bhie-backend-xxxx.onrender.com/api/auth/health
```

Expected response:
```json
{"status":"ok","message":"BHIE Server is running"}
```

- [ ] Document Render URL for frontend configuration

---

## 🎨 Part 3: Frontend Deployment on Vercel

### Step 3.1: Update API Base URL

**File**: `client/src/lib/axios.ts`

```typescript
const apiBaseURL = process.env.VITE_API_URL || 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});
```

- [ ] `VITE_API_URL` environment variable created
- [ ] Fallback to localhost for development
- [ ] Axios configured with credentials

### Step 3.2: Create Vercel Project

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New..." → "Project"
3. [ ] Import GitHub repository
4. [ ] Select repo and branch (main)
5. [ ] Framework preset: Select "Vite"
6. [ ] Root directory: `client`

### Step 3.3: Add Environment Variables on Vercel

In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL = https://bhie-backend-xxxx.onrender.com/api
```

- [ ] Environment variable added
- [ ] Value matches your Render backend URL
- [ ] Apply to all environments (Production, Preview, Development)

### Step 3.4: Deploy & Verify

- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Check deployment logs
- [ ] Note your Vercel URL: `https://bhie-xxx.vercel.app`
- [ ] Verify frontend loads without errors
- [ ] Check that API calls work

**Browser Console Test**:
```javascript
// Open DevTools Console and run:
fetch('https://bhie-backend-xxxx.onrender.com/api/auth/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

- [ ] Document Vercel URL for reference

---

## ⚙️ Part 4: Post-Deployment Configuration

### Step 4.1: Update MongoDB Atlas IP Whitelist

Now that backend is deployed:

1. [ ] Go to MongoDB Atlas dashboard
2. [ ] Network Access → IP Whitelist
3. [ ] Find your Render server IP address
4. [ ] Add specific IP instead of 0.0.0.0/0 (for security)
5. [ ] Or keep 0.0.0.0/0 during testing, change later

**Get Render IP**:
- Check Render deployment logs for allocated static IP
- Or add your office/home IP for testing

### Step 4.2: Verify HTTPS Enforcement

- [ ] Both Vercel and Render have HTTPS enabled (automatic)
- [ ] Update FRONTEND_URL on Render to HTTPS
- [ ] Verify no mixed content warnings in browser console
- [ ] Test that redirects from HTTP to HTTPS work

### Step 4.3: Test JWT Token Flow

```bash
# 1. Register new user
curl -X POST https://bhie-backend-xxxx.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'

# 2. Login user
curl -X POST https://bhie-backend-xxxx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'

# 3. Copy token from response
# 4. Test protected endpoint
curl -X GET https://bhie-backend-xxxx.onrender.com/api/records \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

- [ ] Registration works
- [ ] Login returns JWT token
- [ ] Protected endpoints require valid token
- [ ] Token expires after 7 days

---

## 🔍 Verification Checklist

### Frontend Verification
- [ ] Landing page loads correctly
- [ ] Dashboard displays data
- [ ] Records page shows data
- [ ] Prediction page loads
- [ ] No console errors
- [ ] No CORS warnings
- [ ] All animations smooth

### Backend Verification
- [ ] Health endpoint responds: `/api/auth/health`
- [ ] Records endpoint works: `GET /api/records`
- [ ] AI predict endpoint works: `POST /api/ai/predict`
- [ ] Authentication flow works (register/login/logout)
- [ ] Token refresh works
- [ ] Error handling returns proper responses

### Database Verification
- [ ] MongoDB Atlas shows active connection
- [ ] Data persists across reloads
- [ ] All collections present
- [ ] Indexes created automatically
- [ ] Connection logs show activity

### Security Verification
- [ ] HTTPS enforced everywhere
- [ ] CORS headers correct
- [ ] JWT tokens valid
- [ ] No secrets in code
- [ ] Environment variables used for all secrets
- [ ] Rate limiting working

---

## 📊 Testing Commands

### Backend Health Check
```bash
curl https://bhie-backend-xxxx.onrender.com/api/auth/health
```

### AI Predict Endpoint Test
```bash
curl -X POST https://bhie-backend-xxxx.onrender.com/api/ai/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "activeCount": 45,
    "archivedCount": 12,
    "draftCount": 3,
    "totalCount": 60
  }'
```

### Get Records
```bash
curl https://bhie-backend-xxxx.onrender.com/api/records \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 🔐 Security Checklist

### Environment & Secrets
- [ ] JWT_SECRET is 32+ characters
- [ ] JWT_SECRET never in code repository
- [ ] MongoDB password properly escaped
- [ ] All API keys stored as env variables
- [ ] .env files in .gitignore
- [ ] Render/Vercel env variables don't have trailing spaces

### CORS & Headers
- [ ] CORS origin matches Vercel URL exactly
- [ ] No wildcard CORS in production
- [ ] Secure headers set (Helmet.js)
- [ ] HttpOnly cookies enabled
- [ ] SameSite=Strict for cookies

### Database Security
- [ ] MongoDB user has minimal permissions
- [ ] Connection uses SSL/TLS
- [ ] IP whitelist configured
- [ ] Regular backups enabled (Atlas auto-backups)
- [ ] Audit logs available if needed

### Deployment Security
- [ ] GitHub repository private (if needed)
- [ ] Branch protection enabled
- [ ] No secrets in commit history
- [ ] Deployment logs reviewed
- [ ] Error messages don't expose system details

---

## 📈 Monitoring & Maintenance

### Daily Monitoring
- [ ] Check Render logs for errors
- [ ] Monitor Vercel deployment status
- [ ] Review MongoDB Atlas connection logs
- [ ] Test health endpoints respond

### Weekly Monitoring
- [ ] Review error rates
- [ ] Check API response times
- [ ] Verify all features working
- [ ] Check for any deployment failures

### Monthly Maintenance
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Backup critical data
- [ ] Performance optimization
- [ ] Update documentation

---

## 🆘 Troubleshooting Matrix

| Issue | Symptom | Solution |
|-------|---------|----------|
| **CORS Error** | `No 'Access-Control-Allow-Origin' header` | Update FRONTEND_URL on Render backend |
| **MongoDB Connection Failed** | `MongooseError: connect ECONNREFUSED` | Check connection string, IP whitelist, username/password |
| **JWT Token Invalid** | `401 Unauthorized` | Verify JWT_SECRET matches, token not expired |
| **API Timeout** | `504 Gateway Timeout` | Check backend service is running, database connection |
| **Deployment Failed** | Build fails on Render/Vercel | Check build logs, verify environment variables set |
| **Frontend Can't Find API** | `404 Not Found` on API calls | Verify VITE_API_URL is set correctly |

---

## ✨ Post-Deployment Success Criteria

- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds to requests
- [ ] Database stores and retrieves data
- [ ] Authentication works (login/register)
- [ ] AI prediction endpoint returns data
- [ ] Dashboard shows real data with charts
- [ ] Records CRUD operations work
- [ ] No console errors or warnings
- [ ] No CORS errors
- [ ] All features responsive on mobile
- [ ] Load times under 3 seconds
- [ ] No 500 errors in logs

---

## 📚 Documentation References

- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **ENV_CONFIGURATION.md** - Environment variable templates
- **PREDICTION_QUICK_REFERENCE.md** - API endpoint reference
- **AI_PREDICTION_SYSTEM.md** - AI system architecture

---

## 🚀 Quick Deployment Summary

### Timeline
- **Part 1 (MongoDB)**: 10-15 minutes
- **Part 2 (Render Backend)**: 15-20 minutes
- **Part 3 (Vercel Frontend)**: 10-15 minutes
- **Verification**: 10-15 minutes
- **Total**: 45-65 minutes

### Key URLs After Deployment
```
Frontend: https://bhie-xxx.vercel.app
Backend:  https://bhie-backend-xxxx.onrender.com
Database: MongoDB Atlas Cloud
```

### Success Indicators
✅ Green checkmarks in all checklist items  
✅ All testing commands return valid responses  
✅ Browser console has no errors  
✅ Features work end-to-end  

---

**Deployment Status**: 🟢 Ready to Deploy

**Next Action**: Start with Part 1 (MongoDB Atlas Setup)

**Last Updated**: April 2, 2026  
**Version**: 1.0.0
