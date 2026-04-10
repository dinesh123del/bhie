# BHIE Production Deployment - FREE Global Platforms
Status: 🚀 Ready to Deploy | Plan Approved (Vercel Frontend + Render Backend + MongoDB Atlas)

## ✅ Phase 0: Repo Prep (Current git status: ahead 1, changes pending)
- [x] Plan confirmed
- [ ] `git add . && git commit -m "Pre-production fixes" && git push origin main`

## 🔧 Phase 1: Secrets Setup (User Required)
1. **MongoDB Atlas M0 Free Cluster**:
   - Create at mongodb.com/atlas (free tier)
   - Network Access: 0.0.0.0/0
   - DB User: appuser | Password: generate strong
   - MONGO_URI: `mongodb+srv://appuser:[pass]@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority`

2. **Generate Secrets**:
   ```
   JWT_SECRET=$(openssl rand -base64 48)
   OPENAI_API_KEY= (if have)
   STRIPE_SECRET_KEY= (if payments)
   ```

3. **Redis (Optional for queues)**: Upstash.com free - REDIS_URL

## 🛠️ Phase 2: Config Fixes (Automated)
- [ ] Fix vercel.json for Next.js
- [ ] Test local build: `cd client && npm run build`

## 🌐 Phase 3: Deploy Frontend (Vercel - Free CDN/Global)
1. vercel.com > New Project > Import GitHub repo
2. Framework: Next.js
3. Root: `/client`
4. Env: `VITE_API_URL=https://[render-url-to-be-added]`
5. Deploy

## ⚙️ Phase 4: Deploy Backend (Render - Free Persistent)
1. render.com > New Web Service > GitHub repo
2. Use render.yaml (auto-detects)
3. Env Vars (Dashboard):
   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | MONGO_URI | [atlas-uri] |
   | JWT_SECRET | [jwt] |
   | CLIENT_URL | [vercel-frontend-url] |
   | SEED_DEFAULT_ADMIN | false |
4. Disk: uploads (persistent)
5. Deploy → Get API_URL

## 🔗 Phase 5: Connect & Test
1. Update Vercel VITE_API_URL = Render API_URL
2. Redeploy Vercel
3. Test:
   - Frontend: Visit URL, no console errors
   - Register/Login
   - Upload file → API works
   - `/api/health` → 200 OK

## 🎉 Phase 6: Bonus (Optional)
- [ ] Custom domain
- [ ] HTTPS auto
- [ ] Redis Upstash

**Next Manual Step**: Create MongoDB Atlas → paste MONGO_URI here → run `git push` → share GitHub URL for deploys.

**Auto Progress**: Will fix vercel.json, commit, test local.
