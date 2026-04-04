# BHIE - Ready to Run ✅

All dependencies installed and verified. Follow these steps to run the full-stack application.

## Quick Start (3 Terminals)

### Terminal 1: Backend
```bash
cd /Users/srilekha/Desktop/BHIE/server
npm run dev
```
Runs on **http://localhost:5000** ✓

### Terminal 2: Frontend
```bash
cd /Users/srilekha/Desktop/BHIE/client
npm run dev
```
Runs on **http://localhost:5173** ✓

### Terminal 3: ML Service
```bash
cd /Users/srilekha/Desktop/BHIE/ml-service
python3 -m uvicorn main:app --reload --port 8000
```
Runs on **http://localhost:8000** ✓

---

## Component Status

| Component | Port | Status | Build |
|-----------|------|--------|-------|
| Frontend (React + Vite) | 5173 | ✅ Ready | Built |
| Backend (Node + Express) | 5000 | ✅ Ready | Compiled |
| ML Service (FastAPI) | 8000 | ✅ Ready | Verified |

---

## What's Configured

### ✅ Backend
- All 7 TypeScript routes created (`auth`, `records`, `reports`, `payments`, `admin`, `analytics`, `ai`)
- CORS enabled for frontend access
- JWT authentication middleware
- Prisma ORM with MongoDB
- Rate limiting & security headers
- Health check endpoint at `/api/health`

### ✅ Frontend
- React 18 + TypeScript
- Vite development server
- Tailwind CSS styling
- Protected routes with JWT
- Axios for API calls with baseURL setup
- Charts, animations, and components ready

### ✅ ML Service
- FastAPI on port 8000
- `/predict` endpoint for predictions
- `/train` endpoint for model training
- `/health` endpoint for status
- CORS middleware enabled
- scikit-learn RandomForestRegressor

---

## Database Setup (First Time Only)

```bash
cd /Users/srilekha/Desktop/BHIE/server
npx prisma db push --schema prisma/schema.prisma
npx prisma db seed
```

This will:
- Create MongoDB collections
- Seed test users (admin@bhie.com, staff@bhie.com, user@bhie.com)
- Create sample records and reports

---

## Testing APIs

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bhie.com","password":"admin123"}'
```

### Admin Metrics
```bash
curl http://localhost:5000/api/admin/saas-metrics \
  -H "Authorization: Bearer {token}"
```

### ML Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"data":[100,105,110,115,120,125]}'
```

---

## Environment Files

All `.env` files are pre-configured:
- **server/.env** - Backend config (MongoDB URI, JWT secret, ports)
- **client/.env** - Frontend config (API URL, Razorpay key)
- **ml-service/.env** - ML service config (port 8000)

Update `MONGODB_URI` with your actual MongoDB connection string for production.

---

## Troubleshooting

### Port already in use?
```bash
# Find process on port 5000
lsof -i :5000
# Kill it
kill -9 <PID>
```

### MongoDB connection fails?
- Verify `MONGODB_URI` in `server/.env`
- Ensure MongoDB credentials are correct
- Check network access in MongoDB Atlas

### ML service import errors?
```bash
cd ml-service
pip install -r requirements.txt
```

### Frontend showing "Cannot connect to API"?
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `client/.env`
- Check browser console for CORS errors

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Records (Protected)
- `GET /api/records` - List records
- `POST /api/records` - Create record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Reports (Protected)
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `DELETE /api/reports/:id` - Delete report

### Payments (Protected)
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

### Admin (Protected)
- `GET /api/admin/saas-metrics` - SaaS metrics
- `GET /api/admin/charts/revenue-growth` - Revenue chart
- `GET /api/admin/charts/plan-distribution` - Plan distribution

### Analytics (Protected)
- `GET /api/analytics/summary` - Analytics summary
- `GET /api/analytics/trends` - Trends data

### AI (Protected)
- `POST /api/ai/predict` - ML prediction
- `POST /api/ai/chat` - Chat with AI

### ML Service
- `GET /health` - Health check
- `POST /predict` - Make prediction
- `POST /train` - Train model

---

## Production Deployment

### Build for production
```bash
# Backend
cd server && npm run build

# Frontend
cd client && npm run build
```

### Deploy to Vercel (Frontend)
```bash
vercel deploy client/dist
```

### Deploy to Render/Railway (Backend)
1. Push to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

---

## Need Help?

1. Check SETUP.md for detailed configuration
2. Check FIXES_COMPLETED.md for what was fixed
3. All TypeScript is compiled and working
4. All dependencies are installed
5. All services start without errors

**You're ready to go!** 🚀
