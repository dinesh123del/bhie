# 🚀 BHIE Deployment Guide

This guide walks you through deploying your polished Production SaaS to Render (Backend) and Vercel (Frontend). 

---

## 1️⃣ Deploying the Backend (Render)

Render uses your GitHub repository to automatically deploy the application. Since we have already created the `render.yaml` configuration in your server directory, deployment is as simple as clicking a button.

1. **Commit & Push to GitHub:**
   Ensure all your latest code (including `server/render.yaml`) is pushed to your GitHub repository.
   ```bash
   git add .
   git commit -m "Deploy: production ready platform"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [Render Dashboard (https://dashboard.render.com)](https://dashboard.render.com). 
   - Click on the **"New +"** button and select **"Blueprint"** (because we have `render.yaml`).
   - Connect your GitHub repository.
   - Render will automatically detect `server/render.yaml` and set up the build (`npm install && npm run build`) and start command (`npm start`).

3. **Set Environment Variables on Render:**
   Once the service is created, go to its **Environment** tab and add your production credentials:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `CLIENT_URL` (Wait until Vercel is deployed, then enter `https://bhie-frontend.vercel.app` or your real URL).

---

## 2️⃣ Deploying the Frontend (Vercel)

For your frontend, Vercel natively supports `Vite`. You can deploy via the Vercel Dashboard connected to GitHub, or directly from your terminal using the Vercel CLI (which I verified is already installed on your machine!).

### Option A: Using Vercel CLI Tool (Fastest)
Run the following commands straight from your terminal:

```bash
# Move into the client directory
cd client

# Start the deployment mapping to production
npx vercel --prod
```
*Note: The CLI might ask you to log in or link a project. Follow the prompts.*

### Option B: Using Vercel Website (GitHub Integration)
1. Go to [vercel.com](https://vercel.com/new).
2. Import your GitHub repository.
3. Keep the "Root Directory" as `client` (or click Edit and select `client`).
4. **Environment Variables**: Add your backend URL here.
   - **Key:** `VITE_API_URL`
   - **Value:** `https://bhie-backend.onrender.com` *(Replace with your real Render URL!)*
5. Click **Deploy**.

---

## 3️⃣ Final Post-Deployment Verification

Once both are successfully live:
1. Ensure the Vercel frontend has the correct **`VITE_API_URL`** pointing to Render's live URL.
2. Ensure the Render backend has the correct **`CLIENT_URL`** pointing to Vercel (so CORS allows the frontend).
3. Visit your live Vercel link and test the complete flow!
