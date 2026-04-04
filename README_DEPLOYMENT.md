# BHIE Production Deployment Guide

## Local Production Test
```bash
# Backend
cd server
npm run build
npm start  # Should serve on port 4000 production mode

# Frontend (new terminal)
cd client
npm run build  # Creates dist/
# Serve dist/ with any static server (npx serve -s dist)
```

## Deploy Frontend (Vercel) - DETAILED STEPS (FIXES 404)

**CRITICAL SETTINGS:**
- Root Directory: `client` 
- Framework Preset: `Vite`
- Build Command: (blank)
- Output Directory: `dist`

**Step-by-Step:**
1. Push code to GitHub
2. vercel.com → New Project → Import BHIE repo
3. **ROOT DIRECTORY = `client`** ← THIS FIXES \"Missing script: build\"
4. Framework Preset → Vite (auto from vercel.json)
5. Deploy
6. **Settings → Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_RAZORPAY_KEY=rzp_test_yourkey
   VITE_FRONTEND_URL=https://your-app.vercel.app
   ```
7. Redeploy

**Common Pitfalls FIXED:**
- Deploy root (not client/) → npm error
- No VITE_API_URL → API 404 (BOM1)
- No vercel.json → React Router 404

**CLI Quick Deploy:**
```bash
cd client
npm i -g vercel
vercel --prod
```
(sets env interactively)

## Deploy Backend (Render)
1. render.com → New Web Service → GitHub repo (server/)
2. Connect render.yaml
3. Set env vars (MongoDB Atlas URI, JWT_SECRET, Razorpay keys)
4. Deploy → Get URL

## Database (MongoDB Atlas)
1. atlas.mongodb.com → New Cluster (M0 Free)
2. Network → IP Whitelist: 0.0.0.0/0
3. Get connection string → .env MONGODB_URI

## Verify
- Frontend loads
- Login/register/payment
- Admin dashboard → /admin (create admin via utils/createDefaultAdmin.ts)
- AI predictions work

**Live Demo:** Update FRONTEND_URL in Render after Vercel deploy.
