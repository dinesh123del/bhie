# BHIE Full-Stack Integration & Testing Guide

## 📋 Pre-Flight Checklist

Before starting services, verify:

- [ ] Node.js v16+ installed (`node --version`)
- [ ] MongoDB running locally OR Atlas connection ready
- [ ] Port 4000 available (backend)
- [ ] Port 5173 available (frontend)
- [ ] Server `.env` file has `MONGO_URI`
- [ ] Server `.env` file has `JWT_SECRET`
- [ ] Client `.env` file has `VITE_API_URL=http://localhost:4000/api`

---

## 🔧 Installation Steps

### Step 1: Backend Setup

```bash
cd server

# Clean install (if upgrading from Prisma)
rm -rf node_modules package-lock.json
npm install mongoose

# Build TypeScript
npm run build

# Check build succeeded
ls dist/server.js
```

### Step 2: Frontend Setup

```bash
cd client

# Clean install
rm -rf node_modules package-lock.json
npm install

# Verify env file
cat .env
# Should show: VITE_API_URL=http://localhost:4000/api
```

### Step 3: Database Setup

```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas
# Update server/.env with your connection string:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bhie?retryWrites=true&w=majority
```

---

## 🚀 Starting Services

### Terminal 1: Database
```bash
mongod
# Mongod listening on 27017...
```

### Terminal 2: Backend
```bash
cd server
npm run dev

# Expected output:
# 🚀 Server running on http://localhost:4000
# 📱 Health check: http://localhost:4000/api/health
# ✅ MongoDB connected
```

### Terminal 3: Frontend
```bash
cd client
npm run dev

# Expected output:
# ✅ Ready in 1234 ms
# ➜  Local:   http://localhost:5173/
```

---

## ✅ Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:4000/api/health

# Response:
# {"status":"OK","message":"BHIE Server running!"}
```

### 2. Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": "507f1f77bcf86cd799439011",
#     "name": "Test User",
#     "email": "test@example.com",
#     "role": "viewer"
#   }
# }
```

### 3. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response: Same as register (includes token)
# Save token for next requests
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 4. Get Current User
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "_id": "507f1f77bcf86cd799439011",
#   "name": "Test User",
#   "email": "test@example.com",
#   "role": "viewer"
# }
```

### 5. Create Record
```bash
curl -X POST http://localhost:4000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My First Record",
    "description": "Test record",
    "data": {"field1": "value1"}
  }'

# Response:
# {
#   "_id": "507f1f77bcf86cd799439012",
#   "userId": "507f1f77bcf86cd799439011",
#   "title": "My First Record",
#   "description": "Test record",
#   "data": {"field1": "value1"},
#   "status": "active",
#   "createdAt": "2026-04-02T10:00:00Z"
# }
```

### 6. Get All Records
```bash
curl http://localhost:4000/api/records \
  -H "Authorization: Bearer $TOKEN"

# Response: Array of records
```

### 7. Get Analytics Summary
```bash
curl http://localhost:4000/api/analytics/summary \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "kpis": {
#     "totalRecords": 1,
#     "activeRecords": 1,
#     "inactiveRatio": 0,
#     "growthRate": 12.5,
#     "categories": []
#   },
#   "monthlyData": []
# }
```

### 8. Update Record
```bash
curl -X PUT http://localhost:4000/api/records/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Record",
    "description": "Updated description"
  }'
```

### 9. Delete Record
```bash
curl -X DELETE http://localhost:4000/api/records/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {"message": "Record deleted"}
```

---

## 🧪 Browser Testing

### Step 1: Open Frontend
- Navigate to `http://localhost:5173`
- You should see the login page

### Step 2: Register New Account
- Click "Sign up"
- Enter name, email, password
- Click "Create account"
- Should redirect to dashboard

### Step 3: Login
- Enter email and password
- Click "Login"
- Should show dashboard with analytics

### Step 4: Create Record
- Click "New Record" or similar button
- Fill in form:
  - Title: "Test Record"
  - Description: "Testing the API"
- Click "Create"
- Should appear in records list

### Step 5: Check Analytics
- Go to Analytics/Dashboard
- Should show updated KPIs:
  - Total Records: 1
  - Active Records: 1
  - Growth Rate: 12.5%

---

## 🔍 Debugging

### Check Backend Logs
```bash
# Terminal 2 output should show:
[08:30:15] ✅ MongoDB connected
[08:30:15] 🚀 Server running on http://localhost:4000
[08:35:22] POST /api/auth/register 201
[08:35:35] POST /api/auth/login 200
[08:35:42] GET /api/records 200
```

### Check Network Errors
In browser DevTools (F12):
1. Open "Network" tab
2. Make API request from frontend
3. Check request headers:
   - `Authorization: Bearer TOKEN_HERE` ✅
4. Check response:
   - Status: 200 ✅
   - Body: Valid JSON ✅

### MongoDB Connection Issues
```bash
# Verify MongoDB is running
mongod --version
mongod

# Or check remote connection
ping cluster.mongodb.net

# Update MONGO_URI if needed
# server/.env:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bhie?retryWrites=true&w=majority
```

### CORS Errors
If you see "Access to XMLHttpRequest blocked by CORS":
1. Check backend server.ts has CORS configured
2. Verify frontend URL: http://localhost:5173
3. Update client .env: VITE_API_URL=http://localhost:4000/api
4. Restart backend server

### Token Errors
```bash
# "invalid token"
# Token expires after 7 days
# Login again to get new token

# "no token provided"
# Make sure frontend sends Authorization header
# Check browser DevTools > Application > localStorage
# Token should exist as "token"
```

---

## 📊 Database Inspection

### View Collections
```bash
# Connect to MongoDB
mongosh

# Choose database
use bhie

# Show collections
show collections

# Expected:
# users
# records
# analytics
# payments
# reports
```

### View Sample Documents
```javascript
// In mongosh
db.users.find().pretty()
db.records.find().pretty()
db.analytics.find().pretty()
```

---

## 🔐 Security Verification

### JWT Token Check
```bash
# Get a token from login
# Decode at https://jwt.io

# Should contain:
# {
#   "userId": "507f1f77bcf86cd799439011",
#   "role": "viewer",
#   "iat": 1234567890,
#   "exp": 1235654789
# }
```

### Password Hashing Check
```javascript
// In mongosh
db.users.findOne({email: "test@example.com"})

// password field should be:
// $2a$10$... (bcrypt hash, not plain text)
// NOT: "password123"
```

### CORS Verification
```bash
# Check CORS headers
curl -I http://localhost:4000/api/health

# Should include:
# access-control-allow-origin: http://localhost:5173
# access-control-allow-credentials: true
```

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot connect to database"
```bash
# Fix: Start MongoDB first
mongod &
npm run dev
```

### Issue: "Port 4000 already in use"
```bash
# Fix: Change port in server/.env
PORT=5000

# Then update client
VITE_API_URL=http://localhost:5000/api
```

### Issue: "Module not found: mongoose"
```bash
# Fix: Install package
cd server
npm install mongoose
npm run build
```

### Issue: "ENOENT: no such file or directory, open '.env'"
```bash
# Fix: Create env file
cp .env.example .env
# Edit with your values
```

### Issue: "TypeError: Cannot read property 'userId' of undefined"
```bash
# Fix: Middleware not finding user in token
# Check server/src/middleware/auth.ts
# Make sure token is being sent correctly
```

### Issue: "Frontend keeps redirecting to login"
```bash
# Fix: Token being invalidated
# Check localStorage in DevTools
# Make sure token is saved after login
# Verify server is actually returning token
```

---

## ✅ Success Indicators

- [x] `http://localhost:4000/api/health` returns 200
- [x] User registration succeeds with valid email
- [x] Login returns JWT token
- [x] Token is stored in localStorage
- [x] Records can be created with token
- [x] Analytics show correct KPI counts
- [x] Unauthorized requests return 401
- [x] Dashboard displays data fetched from API
- [x] No CORS errors in console
- [x] No auth errors when making requests

---

## 🎓 Next Steps

1. **Test all endpoints** using curl or Postman
2. **Verify frontend integration** in browser
3. **Check database** with mongosh
4. **Review security** (tokens, hashing, CORS)
5. **Add error boundaries** in React components
6. **Implement loading states** for better UX
7. **Add retry logic** for failed requests
8. **Setup production env** for deployment

---

## 📚 Useful Resources

- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Documentation](https://jwt.io)
- [Express Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [Axios Documentation](https://axios-http.com)

---

**Status: Ready for Development & Production Deployment** ✅

All systems operational. Start building! 🚀
