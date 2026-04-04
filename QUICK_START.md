# BHIE Quick Reference

## Installation Status
All dependencies installed ✅

## 🚀 Start Services (Pick One Method)

### Method 1: One Terminal Each (Recommended)
```bash
# Terminal 1
cd /Users/srilekha/Desktop/BHIE/server && npm run dev

# Terminal 2
cd /Users/srilekha/Desktop/BHIE/client && npm run dev

# Terminal 3
cd /Users/srilekha/Desktop/BHIE/ml-service && python3 -m uvicorn main:app --reload --port 8000
```

### Method 2: Using Startup Script
```bash
cd /Users/srilekha/Desktop/BHIE
./start-services.sh all
```

### Method 3: Individual Services
```bash
./start-services.sh backend    # Just backend
./start-services.sh frontend   # Just frontend
./start-services.sh ml         # Just ML service
```

---

## 📍 Access Points
| Service | URL | Default Port |
|---------|-----|--------------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:5000 | 5000 |
| ML Service | http://localhost:8000 | 8000 |

---

## 🔐 Test Login
```
Email: admin@bhie.com
Password: admin123
```
(Available after running `npx prisma db seed`)

---

## 💾 Database Setup (First Time Only)
```bash
cd /Users/srilekha/Desktop/BHIE/server

# Apply schema to MongoDB
npx prisma db push --schema prisma/schema.prisma

# Seed test data
npx prisma db seed
```

---

## 🧪 API Health Check
```bash
# All at once
curl http://localhost:5000/api/health && \
curl http://localhost:8000/health

# Separately
curl http://localhost:5000/api/health      # Backend
curl http://localhost:8000/health          # ML Service
```

---

## 🔧 Rebuild Everything
```bash
cd /Users/srilekha/Desktop/BHIE

# Backend
cd server && npm run build && cd ..

# Frontend
cd client && npm run build && cd ..

# ML Service (check imports)
cd ml-service && python3 -c "import main; print('OK')" && cd ..
```

---

## 📦 Reinstall Dependencies
```bash
# Backend
cd /Users/srilekha/Desktop/BHIE/server && npm install

# Frontend
cd /Users/srilekha/Desktop/BHIE/client && npm install --legacy-peer-deps

# ML Service
cd /Users/srilekha/Desktop/BHIE/ml-service && pip install -r requirements.txt
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Same for other ports
lsof -i :5173  # Frontend
lsof -i :8000  # ML Service
```

### MongoDB Connection Error
1. Check `MONGODB_URI` in `/server/.env`
2. Verify credentials are correct
3. Check IP whitelist in MongoDB Atlas
4. Ensure MongoDB is running: `mongod` (if local)

### ML Service Not Found
```bash
cd /Users/srilekha/Desktop/BHIE/ml-service
pip install -r requirements.txt
```

### Frontend Can't Connect to API
1. Verify backend is running (port 5000)
2. Check `VITE_API_URL=http://localhost:5000/api` in `client/.env`
3. Check browser DevTools Console for CORS errors

### TypeScript Errors
```bash
# Clear and rebuild
cd /Users/srilekha/Desktop/BHIE/server
rm -rf dist node_modules
npm install
npm run build
```

---

## 📊 Project Structure
```
/Users/srilekha/Desktop/BHIE/
├── client/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities (axios, etc)
│   └── package.json
├── server/                 # Node + Express + TypeScript
│   ├── src/
│   │   ├── routes/        # 7 API route files
│   │   ├── middleware/    # Auth, CORS middleware
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── server.ts      # Main server file
│   └── package.json
├── ml-service/            # FastAPI Python
│   ├── main.py            # FastAPI app with endpoints
│   └── requirements.txt    # Python dependencies
├── prisma/                # Prisma ORM
│   ├── schema.prisma      # MongoDB schema
│   └── seed.ts            # Database seeding
└── .env                   # Environment variables
```

---

## 🔌 API Endpoints

See `/api/health` for backend health.
See `/health` for ML health.

Key endpoints:
- `GET /api/health` - Backend health
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/records` - List records
- `GET /api/admin/saas-metrics` - Admin dashboard
- `POST /api/ai/predict` - ML prediction
- `GET /health` - ML health

---

## 📖 Documentation Files

- **READY_TO_RUN.md** - Complete startup guide
- **FULL_VERIFICATION.md** - Detailed verification checklist
- **SETUP.md** - Original setup documentation
- **FIXES_COMPLETED.md** - What was fixed
- **PROJECT_SUMMARY.md** - Project overview

---

## ✅ Everything is Ready
- Backend: ✅ Compiled
- Frontend: ✅ Built  
- ML Service: ✅ Verified
- Database: ✅ Schema ready
- Dependencies: ✅ Installed
- Env Config: ✅ Set up

**Just start the services and go!** 🚀
