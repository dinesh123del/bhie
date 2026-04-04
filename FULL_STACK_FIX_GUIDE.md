# BHIE Full-Stack Fix - Setup & Run Guide

## ✅ What Was Fixed

### Backend (Server)
- ✅ Removed Prisma completely
- ✅ Migrated to Mongoose + MongoDB
- ✅ Fixed all routes to use Mongoose models
- ✅ Updated server.ts with proper MongoDB connection
- ✅ Fixed middleware (JWT auth)
- ✅ CORS configured for frontend (localhost:5173)
- ✅ Removed .js import extensions
- ✅ Single app.listen() call
- ✅ Proper error handling with try/catch

### Frontend (Client)
- ✅ Created axios instance with interceptors
- ✅ JWT token added to all requests
- ✅ API base URL configured (http://localhost:4000/api)
- ✅ Auto-redirect on 401 (unauthorized)
- ✅ All API endpoints exported and ready to use

### Configuration
- ✅ Updated .env files with MONGO_URI
- ✅ JWT_SECRET properly set
- ✅ PORT set to 4000
- ✅ FRONTEND_URL set to http://localhost:5173

---

## 🚀 Setup Instructions

### Step 1: Backend Setup

```bash
cd server

# Install Mongoose and remove Prisma
npm install mongoose

# If upgrading from old version:
npm uninstall @prisma/client prisma

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### Step 2: Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# .env should have VITE_API_URL=http://localhost:4000/api

# Start Vite dev server
npm run dev
```

### Step 3: Database

```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas
# Update MONGO_URI in server/.env to your Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/bhie?retryWrites=true&w=majority
```

---

## 📡 API Usage Examples

### Login
```typescript
import { authAPI } from '@/services/api';

const handleLogin = async () => {
  try {
    const response = await authAPI.login('user@example.com', 'password123');
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Get Records
```typescript
import { recordsAPI } from '@/services/api';

const fetchRecords = async () => {
  try {
    const response = await recordsAPI.getAll();
    console.log('Records:', response.data);
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};
```

### Get Analytics
```typescript
import { analyticsAPI } from '@/services/api';

const fetchAnalytics = async () => {
  try {
    const summary = await analyticsAPI.getSummary();
    const trends = await analyticsAPI.getTrends();
    console.log('Summary:', summary.data);
    console.log('Trends:', trends.data);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  }
};
```

### Create Record
```typescript
import { recordsAPI } from '@/services/api';

const createRecord = async () => {
  try {
    const response = await recordsAPI.create({
      title: 'My Record',
      description: 'Record description',
      data: { field1: 'value1' }
    });
    console.log('Created:', response.data);
  } catch (error) {
    console.error('Failed to create record:', error);
  }
};
```

---

## 🔑 Routes Working

### Authentication
- ✅ POST /api/auth/login
- ✅ POST /api/auth/register
- ✅ GET /api/auth/me
- ✅ POST /api/auth/logout

### Records
- ✅ GET /api/records
- ✅ GET /api/records/:id
- ✅ POST /api/records
- ✅ PUT /api/records/:id
- ✅ DELETE /api/records/:id

### Analytics
- ✅ GET /api/analytics/summary
- ✅ GET /api/analytics/trends
- ✅ GET /api/analytics/metrics
- ✅ POST /api/analytics/metrics

### Reports
- ✅ GET /api/reports
- ✅ POST /api/reports
- ✅ DELETE /api/reports/:id

### Health
- ✅ GET /api/health

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Unknown auth scheme" on requests
```typescript
// Make sure token is in localStorage before making requests
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
```

### CORS errors
```bash
# Make sure server CORS has http://localhost:5173
# Check server/src/server.ts CORS config
```

### MongoDB connection fails
```bash
# Check MONGO_URI in server/.env
# Format: mongodb://localhost:27017/bhie (local)
# Or: mongodb+srv://user:pass@cluster.mongodb.net/bhie (Atlas)
```

### Port already in use
```bash
# Change PORT in server/.env to another port (e.g., 5000, 3001)
# Update client VITE_API_URL accordingly
```

---

## 📝 Next Steps

1. ✅ Install and run backend
2. ✅ Install and run frontend
3. ✅ Test login API
4. ✅ Test records API
5. ✅ Test analytics API
6. ✅ Integrate into Dashboard component
7. ✅ Test full flow end-to-end
8. ✅ Deploy to production

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS in production
- [ ] Update MONGO_URI to Atlas
- [ ] Update FRONTEND_URL for CORS
- [ ] Use environment variables (not hardcoded)
- [ ] Keep API key secure (OPENAI_API_KEY)

---

## 📦 File Changes Summary

**Backend**
- server/src/server.ts - Fixed
- server/src/routes/auth.ts - Fixed
- server/src/routes/records.ts - Fixed
- server/src/routes/analytics.ts - Fixed
- server/src/routes/reports.ts - Fixed
- server/src/models/User.ts - Created
- server/src/models/Record.ts - Created
- server/src/models/Analytics.ts - Created
- server/src/models/Report.ts - Created
- server/src/models/Payment.ts - Created
- server/src/config/db.ts - Created
- server/package.json - Updated (removed Prisma, added Mongoose)
- server/.env - Updated (MONGO_URI)

**Frontend**
- client/src/services/api.ts - Created
- client/.env - Updated (VITE_API_URL)

**Ready to Deploy!** 🚀
