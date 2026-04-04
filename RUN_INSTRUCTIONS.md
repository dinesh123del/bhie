# BHIE Production-Ready App - Setup & Run

## 1. Backend Setup
```
cd server
cp .env.example .env
# Edit .env: Set MONGO_URI to your MongoDB Atlas connection string
# JWT_SECRET=bhie_super_secret_change_me
npm install
npm run dev
```
Test: `curl http://localhost:5001/api/test` or browser

## 2. Frontend Setup
```
cd client
cp .env.example .env  # VITE_API_URL=http://localhost:5001/api
npm install
npm run dev
```
Frontend: http://localhost:5173

## 3. Production Build
Root:
```
npm run build:client
npm run build:server
```

## 4. Deployment
- Backend (Render): Push server/, set env vars
- Frontend (Vercel): Push client/, VITE_API_URL=https://your-backend.onrender.com/api

## Status
- ✅ Syntax clean, deps installed
- ✅ CORS/API ready
- ✅ Test route added
- ⚠️  MONGO_URI needed for full DB
- App LIVE once env set!
