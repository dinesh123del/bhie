# BHIE Production Deployment TODO

## Progress Tracker (Mark [x] when done)

### 1. [x] Create Environment Files & Templates
   - ✅ Root/server/client .env.example created
   - Root/server/.env.example
   - client/.env.example (VITE_API_URL)
   - server/.env.example (MONGODB_URI, JWT_SECRET, RAZORPAY_*)

### 2. [x] Update Backend Production Configs
   - ✅ server/src/server.ts updated

### 3. [x] Update Frontend Env Support
   - ✅ axios.ts env-aware
   - ✅ vite-env.d.ts for TS
   - ⏳ Deployment configs created

### 4. [ ] Create Deployment Configs
   - client/vercel.json
   - server/render.yaml

### 5. [ ] Install Additional Prod Deps
   - Backend: compression express-rate-limit

### 6. [ ] Update README.md with Deployment Guide

### 7. [ ] Test Local Production Build
   - Frontend: cd client && npm run build
   - Backend: cd server && npm run build && npm start

### 8. [ ] Push to GitHub & Deploy
   - Vercel: Frontend
   - Render: Backend (env vars)
   - MongoDB Atlas: Cluster + IP whitelist

**Current Step: 4/8**
**Commands will be provided step-by-step. Update this file as we complete each step.**

