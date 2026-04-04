# BHIE - Quick Reference & Commands

## 🎯 Project Status: PRODUCTION-READY ✅

This project is fully configured for production deployment.
- ✅ All TypeScript errors resolved
- ✅ Both builds (backend & frontend) successful
- ✅ Environment files configured
- ✅ Deployment ready (Render + Vercel)

## 🚀 Development (Local)

```bash
# First time setup
cd server && npm install && cd ../client && npm install

# Start servers (in different terminals)
Terminal 1: cd server && npm run dev      # Backend: localhost:4000
Terminal 2: cd client && npm run dev      # Frontend: localhost:5173

# MongoDB should be running
# Visit http://localhost:5173 in browser
```

## 🏗️ Production Build

```bash
# Build backend
cd server && npm run build && npm run prod

# Build frontend  
cd client && npm run build && npm run preview

# This creates optimized bundles ready for deployment
```

## 📦 Deploy to Render (Backend) + Vercel (Frontend)

### Backend (Render)
1. Push code to GitHub
2. Go to https://dashboard.render.com
3. Create Web Service → Connect GitHub
4. Set root to `server/`
5. Build: `npm run build`
6. Start: `npm run prod`
7. Add environment variables (see DEPLOYMENT.md)

### Frontend (Vercel)
1. Go to https://vercel.com/dashboard  
2. Import GitHub project
3. Root: `client/`
4. Build: `npm run build`
5. Output: `dist`
6. Add VITE_API_URL pointing to Render backend

## 📡 API Endpoints

All endpoints are prefixed with `/api`

```
/auth/register    - Register user
/auth/login       - Login user
/auth/profile     - Get user profile (protected)
/records          - CRUD operations (protected)
/analytics/*      - Analytics data (protected)
/reports/*        - Reporting features (protected)
/payments/*       - Payment processing (protected)
/ai/*             - AI predictions (protected)
/admin/*          - Admin features (protected)
/health           - Health check (public)
```

## 🔐 Test Credentials

Use any email/password combination for registration, but example:
```
Email: test@bhie.com
Password: Test@123
```

## 🔑 Environment Variables

### Backend
```
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bhie
JWT_SECRET=your-32-char-secure-random-string
FRONTEND_URL=https://your-app.vercel.app
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
OPENAI_API_KEY=sk-xxx
```

### Frontend
```
VITE_API_URL=https://bhie-api.onrender.com/api
VITE_RAZORPAY_KEY=rzp_live_public_key
```

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run prod

# Development with hot reload
npm run dev

# Check for TypeScript errors
npm run typecheck

# Lint code
npm run lint
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
lsof -ti:4000 | xargs kill -9   # Backend
lsof -ti:5173 | xargs kill -9   # Frontend
```

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### MongoDB Connection Error
- Check MONGO_URI format
- Verify IP whitelist in MongoDB Atlas
- Ensure credentials are correct

### CORS Error  
- Backend FRONTEND_URL should match Vercel deployment URL
- Typically: https://your-app.vercel.app

## 📊 Test API

```bash
# Health check
curl http://localhost:4000/health

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'

# Get records (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/records
```

## 📈 Monitoring

- **Render Dashboard:** https://dashboard.render.com → Logs & metrics
- **Vercel Dashboard:** https://vercel.com/dashboard → Deployments
- **MongoDB Atlas:** https://cloud.mongodb.com → Database stats

## 📚 Documentation

- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Production Status:** [PRODUCTION_STATUS.md](PRODUCTION_STATUS.md)  
- **This File:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

## 🎯 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on both platforms
- [ ] Test API endpoints work
- [ ] Verify JWT authentication
- [ ] Test payment integration
- [ ] Monitor error logs

## ✨ Features

- ✅ User authentication with JWT
- ✅ Record management (CRUD)
- ✅ Analytics dashboard
- ✅ AI predictions
- ✅ Payment processing
- ✅ Admin controls
- ✅ Error handling
- ✅ Rate limiting
- ✅ CORS security

---

**Next Step:** Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to Render & Vercel

```typescript
import { recordsAPI } from '@/services/api';
const res = await recordsAPI.getAll();
console.log(res.data); // Array of records
```

### Get Analytics
```typescript
import { analyticsAPI } from '@/services/api';
const summary = await analyticsAPI.getSummary();
console.log(summary.data.kpis); // KPI object
```

### Create Record
```typescript
const res = await recordsAPI.create({
  title: 'New Record',
  description: 'Description',
  data: { field: 'value' }
});
```

## 🔐 Environment Variables

### server/.env
```env
MONGO_URI=mongodb://localhost:27017/bhie
JWT_SECRET=your-secret-key-min-32-chars
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### client/.env
```env
VITE_API_URL=http://localhost:4000/api
VITE_RAZORPAY_KEY=rzp_test_xxxxx
```

## 🗄️ Database - MongoDB

```javascript
// Collections
users       // Stores user accounts
records     // Stores user data
analytics   // Stores metrics
payments    // Stores payment info
reports     // Stores reports
```

## 🧪 Test Endpoints

```bash
# Health check
curl http://localhost:4000/api/health

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"u@t.com","password":"pass123"}'

# Login (get token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"u@t.com","password":"pass123"}'

# Use token
curl http://localhost:4000/api/records \
  -H "Authorization: Bearer TOKEN_HERE"
```

## ⚡ Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't connect DB | Run `mongod` first |
| Port in use | Change `PORT=5000` in .env |
| CORS error | Check `VITE_API_URL` in client |
| Token expired | Login again (7-day expiry) |
| Build fails | `rm node_modules && npm install` |
| Module not found | `npm install mongoose` |

## 📊 API Response Format

### Success
```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error (401)
```json
{
  "message": "Unauthorized"
}
```

### Error (400)
```json
{
  "message": "Invalid request"
}
```

## 🔑 User Roles

- **admin** - Full access to all features
- **manager** - Can manage records, view analytics
- **viewer** - Read-only access

## 📦 Package Structure

```
server/
  src/
    config/db.ts          ← MongoDB connection
    models/               ← Mongoose schemas
    routes/               ← API endpoints
    middleware/auth.ts    ← JWT validation
    server.ts             ← Express app

client/
  src/
    services/api.ts       ← Axios instance
    pages/                ← React pages
    components/           ← React components
```

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 500 | Server error |

## ✨ Key Features

- ✅ JWT authentication (7-day expiry)
- ✅ Bcrypt password hashing
- ✅ Role-based access control
- ✅ MongoDB + Mongoose ORM
- ✅ CORS protection
- ✅ Rate limiting (100/15min)
- ✅ Request compression
- ✅ Security headers (Helmet)
- ✅ Error handling throughout
- ✅ TypeScript throughout

## 🎓 Flow: User Registration & Login

1. User fills registration form
2. Frontend calls `POST /auth/register`
3. Backend creates user in MongoDB
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. Frontend adds token to all requests
7. User is logged in ✅

## 🎓 Flow: Get User Data

1. Frontend calls `GET /records` with token
2. Backend middleware validates token
3. Backend extracts userId from token
4. Backend finds records for that user
5. Backend returns records with 200 OK
6. Frontend displays records ✅

## 📋 Files Changed

```
✅ server/src/server.ts
✅ server/src/routes/*.ts (all)
✅ server/src/models/*.ts (created)
✅ server/src/config/db.ts (created)
✅ server/package.json (removed Prisma)
✅ server/.env (MONGO_URI)
✅ client/src/services/api.ts (created)
✅ client/.env (VITE_API_URL)
```

## 🎉 Status: READY!

Backend: ✅ Working
Frontend: ✅ Connected
Database: ✅ Configured
Security: ✅ Implemented
Documentation: ✅ Complete

**Start developing now!**

---

**Questions?** Check COMPLETE_FIX_SUMMARY.md or INTEGRATION_TESTING_GUIDE.md

**Production Ready** 🚀 April 2, 2026
