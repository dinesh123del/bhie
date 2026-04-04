# Frontend-Backend Integration Checklist

## ✅ Environment Setup

- [x] Frontend .env configured
  - VITE_API_URL=http://localhost:4000/api
  - VITE_RAZORPAY_KEY=rzp_test_XXXXX

- [x] Backend .env configured
  - MONGODB_URI set
  - JWT_SECRET set
  - PORT=4000

## ✅ Axios Configuration

- [x] axios.ts - Configured with:
  - baseURL pointing to http://localhost:4000/api
  - withCredentials: true
  - JWT interceptor for Authorization header
  - 401 error handling (redirect to login)

## ✅ Services Created

- [x] authService.ts
  - login()
  - register()
  - logout()

- [x] recordsService.ts
  - getRecords()
  - getRecord()
  - createRecord()
  - updateRecord()
  - deleteRecord()
  - uploadFile()

- [x] analyticsService.ts
  - getAnalytics()
  - getCategoryBreakdown()
  - getMonthlyTrend()
  - adminService.getStats()
  - adminService.getUsers()
  - adminService.updateUserRole()
  - adminService.deleteUser()

- [x] reportsService.ts
  - getReports()
  - getReport()
  - generateReport()
  - deleteReport()
  - downloadReport()

- [x] aiService.ts
  - predict()
  - classifyRecord()
  - bulkPredict()

## ✅ Hooks Created

- [x] useAuth.ts - User state management
- [x] useRecords.ts - Fetch and manage records
- [x] useAnalytics.ts - Analytics data fetching
  - useAdminStats - Admin stats fetching

## ✅ Components Updated

- [x] Login.tsx - Uses authService
- [x] Register.tsx - Uses authService

## ✅ Backend CORS

- [x] CORS configured for:
  - origin: http://localhost:5173
  - credentials: true
  - Methods: GET, POST, PUT, DELETE, OPTIONS

## ✅ Backend Routes

- [x] /api/auth/login - ✅ Working
- [x] /api/auth/register - ✅ Working
- [x] /api/records - GET/POST ✅
- [x] /api/analytics - GET ✅
- [x] /api/admin - GET ✅
- [x] /api/reports - GET/POST ✅
- [x] /api/ai - POST ✅

## 🧪 Testing Checklist

### 1. Health Check
```bash
curl http://localhost:4000/api/health
# Expected: {"status":"OK",...}
```

### 2. Login Flow
1. Register new user
2. Verify token in localStorage
3. Check Authorization header is sent
4. Logout and verify redirect to login

### 3. Records API
1. Fetch records - GET /api/records
2. Create record - POST /api/records
3. Update record - PUT /api/records/:id
4. Delete record - DELETE /api/records/:id

### 4. Analytics API
1. Fetch analytics - GET /api/analytics
2. Admin stats - GET /api/admin/stats

### 5. No Console Errors
- [ ] Network tab shows requests going to http://localhost:4000/api
- [ ] No CORS errors
- [ ] No 401 errors (unless testing auth)
- [ ] JWT token properly set in Authorization header

## 🚀 Running the Stack

```bash
# Terminal 1: Backend
cd server && npm run dev
# Expected: Server running on port 4000

# Terminal 2: Frontend
cd client && npm run dev
# Expected: Server running on port 5173

# Terminal 3: ML Service (if needed)
cd ml-service && python3 -m uvicorn main:app --reload --port 8000
```

## 📝 Key Files

- Frontend API Config: `/client/src/lib/axios.ts`
- Auth Service: `/client/src/services/authService.ts`
- Records Service: `/client/src/services/recordsService.ts`
- Analytics Service: `/client/src/services/analyticsService.ts`
- Reports Service: `/client/src/services/reportsService.ts`
- AI Service: `/client/src/services/aiService.ts`
- Backend CORS: `/server/src/server.ts` (lines 50-58)
- Backend Auth Routes: `/server/src/routes/auth.ts`

## 🔗 Data Flow

```
React Component
    ↓
Service (recordsService.getRecords())
    ↓
Axios Instance (with JWT interceptor)
    ↓
Backend Route (/api/records)
    ↓
Response → Component State
```

## ⚠️ Common Issues & Fixes

### CORS Error
**Issue**: No 'Access-Control-Allow-Origin' header
**Fix**: Verify backend CORS config allows http://localhost:5173

### 401 Unauthorized
**Issue**: Token not sent in request
**Fix**: Verify token in localStorage and check axios interceptor

### Network Error
**Issue**: Cannot reach backend
**Fix**: Verify backend running on port 4000 and VITE_API_URL is correct

### TypeError: Cannot read property 'token' of undefined
**Issue**: API response format mismatch
**Fix**: Verify response matches AuthResponse interface

## ✅ Production Ready Checklist

- [ ] Environment variables configured for production
- [ ] HTTPS enabled
- [ ] JWT token refresh logic implemented
- [ ] Error boundaries added to components
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] API rate limiting enabled
- [ ] Input validation on frontend
- [ ] Sensitive data not logged to console
- [ ] XSS protection in place
- [ ] CSRF protection enabled if needed
