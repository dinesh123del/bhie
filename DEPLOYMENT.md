# BHIE - Production Deployment Guide

## Project Status ✅

- **Backend Build:** ✅ Production-ready
- **Frontend Build:** ✅ Production-ready  
- **TypeScript Errors:** ✅ All resolved
- **Environment Files:** ✅ Configured
- **Deployment Config:** ✅ Ready

## Quick Start (Local Development)

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# Backend will run on http://localhost:4000
# Frontend will run on http://localhost:5173
```

## Production Build & Testing

```bash
# Build backend
cd server && npm run build && npm run prod

# Build frontend
cd client && npm run build && npm run preview
```

## Deployment Instructions

### Option 1: Deploy to Render (Backend) + Vercel (Frontend)

#### Backend Deployment (Render)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Name:** bhie-api
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run prod`
   - **Root Directory:** `server` (optional, if monorepo)
   
6. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bhie
   JWT_SECRET=<your-secure-random-string-min-32-chars>
   FRONTEND_URL=https://your-app.vercel.app
   RAZORPAY_KEY_ID=<your-razorpay-key>
   RAZORPAY_KEY_SECRET=<your-razorpay-secret>
   OPENAI_API_KEY=<your-openai-key>
   ```

7. Deploy!

#### Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `client`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://bhie-api.onrender.com/api
   VITE_RAZORPAY_KEY=<your-razorpay-public-key>
   ```

5. Deploy!

### Option 2: Deploy Using Docker

Create `Dockerfile` in server/:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "prod"]
```

## Environment Variables

### Backend (.env.production)

```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bhie
JWT_SECRET=your_secure_jwt_secret_min_32_chars
FRONTEND_URL=https://your-app.vercel.app
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_key_secret
OPENAI_API_KEY=sk-your_key
```

### Frontend (.env.production)

```
VITE_API_URL=https://bhie-api.onrender.com/api
VITE_RAZORPAY_KEY=rzp_live_your_public_key
```

## Database Setup

### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (free tier available)
3. Create database: `bhie`
4. Add IP whitelist: Allow access from anywhere (0.0.0.0/0) for development
5. Create user with credentials
6. Copy connection string and add to .env.production

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

### Records
- `GET /records` - List all records (protected)
- `POST /records` - Create record (protected)
- `PUT /records/:id` - Update record (protected)
- `DELETE /records/:id` - Delete record (protected)

### Analytics
- `GET /analytics/summary` - Get summary stats (protected)
- `GET /analytics/trends` - Get trend data (protected)

### AI Analysis
- `POST /ai/predict` - Get AI predictions (protected)

### Admin
- `GET /admin/stats` - Admin statistics (admin only)

### Reports & Payments
- Full CRUD endpoints available

## Health Check

```bash
curl https://bhie-api.onrender.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600000,
  "environment": "production"
}
```

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] All environment variables set on Render & Vercel
- [ ] Backend API deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Test API endpoints with production URL
- [ ] Verify JWT authentication works
- [ ] Test payment integration (Razorpay)
- [ ] Test AI predictions
- [ ] Monitor error logs
- [ ] Setup monitoring/alerting (optional)

## Monitoring & Troubleshooting

### View Logs

**Render:**
- Dashboard → Service → Logs

**Vercel:**
- Dashboard → Project → Deployments → Logs

### Common Issues

**CORS Errors:**
- Check FRONTEND_URL in backend .env
- Ensure Vercel URL is whitelisted in CORS settings

**MongoDB Connection Failed:**
- Verify MONGO_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure user credentials are correct

**401 Unauthorized:**
- Verify JWT_SECRET matches frontend token
- Check token expiration (default 7 days)
- Clear browser localStorage and re-login

## Performance Optimization

### Frontend
- Built with Vite for fast rebuilds
- Tree-shaking enabled
- Code splitting configured
- CSS embedded in bundle

### Backend
- Compression middleware enabled
- Rate limiting configured (100 req/min production)
- Connection pooling enabled
- Database indexes optimized

## Security

- JWT tokens with 7-day expiration
- Password hashing with bcryptjs
- CORS configured for production domains
- Helmet.js security headers enabled
- Rate limiting to prevent abuse
- Environment variables for sensitive data

## Support

For issues or questions:
1. Check logs on Render/Vercel dashboards
2. Review error messages in browser console
3. Test API endpoints using curl/Postman
4. Verify environment variables are set correctly

## Next Steps

- Setup CI/CD pipeline
- Configure automated backups for MongoDB
- Setup monitoring and alerting
- Optimize bundle size if needed
- Setup error tracking (Sentry)
