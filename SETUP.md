# BHIE Project - Setup & Run Guide

## Overview
BHIE is a full-stack Business Intelligence platform with React + Vite frontend, Node.js + Express backend, Prisma + MongoDB database, and FastAPI ML microservice.

---

## Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

---

## Installation & Setup

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend  
```bash
cd client
npm install
```

#### ML Service
```bash
cd ml-service
pip install -r requirements.txt
```

---

### 2. Configure Environment Variables

#### Root (.env)
Create `.env` file at project root:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_min_32_chars
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api
```

#### Backend (server/.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_min_32_chars
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (client/.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY=rzp_test_XXXXX
```

#### ML Service (ml-service/.env)
```
PORT=8000
ENVIRONMENT=development
```

---

### 3. Setup Database

#### Generate Prisma Client
```bash
cd server
npx prisma generate
```

#### Push Schema to MongoDB
```bash
cd server
npx prisma db push
```

#### Seed Sample Data
```bash
cd server
npx prisma db seed
```

---

## Running the Project

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
Expected output: `🚀 Server running on port 5000`

### Terminal 2: Frontend (Vite Dev Server)
```bash
cd client
npm run dev
```
Expected output: `Local: http://localhost:5173`

### Terminal 3: ML Service
```bash
cd ml-service
uvicorn main:app --reload --port 8000
```
Expected output: `Uvicorn running on http://127.0.0.1:8000`

---

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Admin Dashboard
```
GET /api/admin/saas-metrics
GET /api/admin/charts/revenue-growth
GET /api/admin/charts/plan-distribution
```

### Records
```
GET /api/records
POST /api/records
PUT /api/records/:id
DELETE /api/records/:id
```

### Analytics
```
GET /api/analytics/summary
GET /api/analytics/trends
```

### ML Predictions
```
POST /api/ai/predict
POST /api/ai/chat
```

---

## Project Structure

```
BHIE/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities (axios, etc.)
│   │   └── App.tsx        # Main app
│   ├── .env               # Frontend env vars
│   └── vite.config.ts
├── server/                # Node.js + Express backend
│   ├── src/
│   │   ├── routes/        # API routes (TypeScript)
│   │   ├── middleware/    # Auth middleware
│   │   ├── types/         # TypeScript interfaces
│   │   └── server.ts      # Express server
│   ├── .env               # Backend env vars
│   └── package.json
├── ml-service/            # FastAPI Python service
│   ├── main.py            # ML endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env               # ML env vars
├── prisma/                # Database ORM
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
└── .env                   # Root env vars
```

---

## Key Features Implemented

✅ Authentication (JWT-based)
✅ Admin Dashboard with analytics
✅ Real-time metrics and charts  
✅ Record management (CRUD)
✅ User roles (ADMIN, STAFF, USER)
✅ Responsive UI with Tailwind CSS
✅ Error handling & validation
✅ TypeScript for type safety
✅ CORS enabled
✅ ML prediction endpoints

---

## Testing Endpoints

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bhie.com",
    "password": "admin123"
  }'
```

### Get Admin Metrics
```bash
curl -X GET http://localhost:5000/api/admin/saas-metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ML Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"data": [1.2, 2.3, 3.1, 4.5, 5.2]}'
```

---

## Troubleshooting

### MongoDB Connection Error
- Verify MONGODB_URI is correct in .env
- Check MongoDB Atlas whitelist includes your IP
- Ensure network access is enabled

### Port Already in Use
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Prisma Client Not Found
```bash
cd server && npx prisma generate
```

### CORS Errors
- Check FRONTEND_URL in server/.env matches frontend origin
- Ensure CORS middleware is enabled in server.ts

---

## Production Deployment

### Build Frontend
```bash
cd client
npm run build
# Output in dist/
```

### Build Backend
```bash
cd server
npm run build
# Output in dist/
```

### Deploy to:
- Frontend: Vercel, Netlify
- Backend: Render, Railway, Heroku
- Database: MongoDB Atlas
- ML Service: Railway, Google Cloud

---

## Next Steps

1. Update MongoDB Atlas connection string
2. Configure payment gateway (Razorpay)
3. Setup email service for notifications
4. Add chat/AI features
5. Optimize performance
6. Add comprehensive tests

---

## Support
For issues, refer to:
- Backend: server/.env configuration
- Frontend: client/.env configuration
- Database: prisma/schema.prisma
- ML: ml-service/main.py
