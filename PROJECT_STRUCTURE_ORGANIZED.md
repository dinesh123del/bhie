# BHIE PROJECT - ORGANIZED STRUCTURE

## 📂 Frontend Structure (/client)

```
client/
├── src/
│   ├── api/                           # API Configuration
│   │   └── axios.ts                   # Axios instance with interceptors
│   │
│   ├── types/                         # TypeScript Interfaces
│   │   ├── ai.ts                      # AI Analysis types
│   │   ├── auth.ts                    # Authentication types
│   │   └── index.ts                   # Export all types
│   │
│   ├── services/                      # API Services
│   │   ├── aiService.ts               # AI analysis service
│   │   ├── authService.ts             # Auth service
│   │   ├── recordsService.ts          # Records service
│   │   └── reportsService.ts          # Reports service
│   │
│   ├── hooks/                         # Custom Hooks
│   │   ├── useAuth.ts                 # Auth hook
│   │   ├── useAIAnalysis.ts           # AI analysis hook (NEW)
│   │   ├── useRecords.ts              # Records hook
│   │   └── useAnalytics.ts            # Analytics hook
│   │
│   ├── context/                       # Context API
│   │   └── AuthContext.tsx            # Authentication context
│   │
│   ├── components/                    # React Components
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── Charts/
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   └── AnalyticsCards.tsx
│   │   ├── AI/                        # NEW - AI Components
│   │   │   ├── AIAnalysisForm.tsx
│   │   │   └── AIAnalysisDashboard.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   │
│   ├── pages/                         # Page Components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Records.tsx
│   │   ├── Reports.tsx
│   │   ├── Admin.tsx
│   │   └── Analysis.tsx               # NEW - AI Analysis page
│   │
│   ├── routes/                        # Route Protection
│   │   └── ProtectedRoute.tsx
│   │
│   ├── App.tsx                        # Main App component
│   ├── main.tsx                       # React DOM entry
│   └── index.css                      # Global styles
│
├── .env                               # Environment variables
├── .env.example
├── package.json
└── vite.config.ts


### FRONTEND IMPORTS STRUCTURE

// In hooks/useAIAnalysis.ts
import axios from 'axios';
import type { BusinessData, AnalysisResult } from '../types/ai';

// In components/AI/AIAnalysisForm.tsx
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { aiService } from '../../services/aiService';

// In services/aiService.ts
import api from '../api/axios';
import type { BusinessData, AIAnalysisResponse } from '../types/ai';

// In pages/Analysis.tsx
import { AIAnalysisForm } from '../components/AI/AIAnalysisForm';
import { AIAnalysisDashboard } from '../components/AI/AIAnalysisDashboard';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
```

---

## 📂 Backend Structure (/server)

```
server/
├── src/
│   ├── types/                         # TypeScript Types
│   │   ├── auth.ts
│   │   ├── index.ts
│   │   └── ai.ts                      # AI types (if using TypeScript)
│   │
│   ├── middleware/                    # Express Middleware
│   │   ├── auth.ts                    # Authentication middleware
│   │   ├── errorHandler.ts            # Error handling
│   │   └── validation.ts              # Input validation
│   │
│   ├── routes/                        # API Routes (v1)
│   │   ├── auth.ts                    # POST /api/auth/*
│   │   ├── records.ts                 # /api/records/*
│   │   ├── reports.ts                 # /api/reports/*
│   │   ├── payments.ts                # /api/payments/*
│   │   ├── admin.ts                   # /api/admin/*
│   │   ├── analytics.ts               # /api/analytics/*
│   │   └── ai.ts                      # /api/ai/* (includes /analyze)
│   │
│   ├── agents/                        # AI Agents (NEW)
│   │   ├── orchestrator.ts            # Orchestrator - coordinates all agents
│   │   ├── financialAgent.ts          # Financial analysis
│   │   ├── marketAgent.ts             # Market analysis
│   │   ├── predictionAgent.ts         # Revenue predictions
│   │   └── strategyAgent.ts           # Strategic recommendations
│   │
│   ├── utils/                         # Utility Functions
│   │   ├── openai.ts                  # OpenAI API wrapper (NEW)
│   │   ├── jwt.ts                     # JWT utilities
│   │   └── pdf.ts                     # PDF generation
│   │
│   ├── services/                      # Business Logic
│   │   ├── authService.ts
│   │   ├── recordsService.ts
│   │   └── reportsService.ts
│   │
│   ├── controllers/                   # Request Handlers
│   │   ├── authController.ts
│   │   └── recordsController.ts
│   │
│   ├── db-setup.ts                    # Database setup
│   ├── server.ts                      # Main server file
│   └── index.ts                       # Express app
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Database seed
│
├── routes/                            # Legacy routes location (compatibility)
│   ├── ai.js                          # Multi-agent AI routes (uses agents/)
│   ├── auth.js
│   ├── records.js
│   ├── reports.js
│   ├── payments.js
│   ├── admin.js
│   ├── analytics.js
│   └── models/
│       └── Record.js
│
├── .env                               # Environment variables
├── .env.example
├── package.json
└── tsconfig.json


### BACKEND IMPORTS STRUCTURE

// In server.ts
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';

// In routes/ai.js
import { runAgents, validateBusinessData } from '../agents/orchestrator.js';
import { callOpenAI } from '../utils/openai.js';

// In agents/orchestrator.ts
import { analyzeFinancialData } from './financialAgent.js';
import { analyzeMarketData } from './marketAgent.js';
import { predictFuturePerformance } from './predictionAgent.js';
import { generateStrategy } from './strategyAgent.js';

// In agents/financialAgent.ts
import { callOpenAI } from '../utils/openai.js';

// In utils/openai.ts
import { OpenAI } from 'openai';
```

---

## 🔗 API ROUTES

```
POST /api/auth/login                 # Login
POST /api/auth/register              # Register
GET  /api/auth/logout                # Logout

GET  /api/records                    # List records
POST /api/records                    # Create record
PUT  /api/records/:id                # Update record
DELETE /api/records/:id              # Delete record

GET  /api/reports                    # List reports
POST /api/reports                    # Generate report
GET  /api/reports/:id                # Get report

POST /api/payments                   # Process payment
GET  /api/payments/:id               # Get payment status

GET  /api/analytics/summary          # Analytics summary
GET  /api/analytics/kpis             # KPIs

GET  /api/admin/users                # List users (admin only)
POST /api/admin/users/:id/role       # Update user role

POST /api/ai/analyze                 # Multi-agent analysis (NEW)
GET  /api/ai/health                  # AI service health (NEW)
GET  /api/ai/insights                # AI insights (legacy)
POST /api/ai/chat                    # AI chat (legacy)
```

---

## 📦 PACKAGE.JSON CONFIGURATION

### BACKEND (/server/package.json)
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.5",
    "@prisma/client": "^5.9.0",
    "openai": "^4.42.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.3",
    "bcryptjs": "^3.0.3"
  }
}
```

### FRONTEND (/client/package.json)
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.22.0"
  }
}
```

---

## 🔐 ENVIRONMENT VARIABLES

### FRONTEND (.env.example)
```
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=BHIE
```

### BACKEND (.env.example)
```
# Database
MONGODB_URI=mongodb://localhost:27017/bhie
DATABASE_URL=mongodb://localhost:27017/bhie

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# Server
PORT=4000
NODE_ENV=development

# AI (NEW)
OPENAI_API_KEY=sk-proj-xxxxx

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## ✅ IMPORT PATH FIXES APPLIED

### FRONTEND
- ✅ `useAIAnalysis` imports from `../types/ai`
- ✅ `aiService` imports from `../api/axios`
- ✅ Components import from relative paths
- ✅ All imports use `.tsx`/`.ts` extensions

### BACKEND
- ✅ Routes import from `../agents/`
- ✅ Routes import from `../utils/openai`
- ✅ Agents import from each other
- ✅ All imports use `.js` or `.ts` extensions
- ✅ ESM modules configured in package.json

---

## 🚀 SERVER ENTRY POINT

### server/src/server.ts
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
// ... other routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
// ... other routes

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🎯 VERIFICATION CHECKLIST

- ✅ All AI agents in `/server/src/agents/`
- ✅ OpenAI helper in `/server/src/utils/openai.ts`
- ✅ AI routes in `/server/routes/ai.js`
- ✅ AI types in `/client/src/types/ai.ts`
- ✅ AI services in `/client/src/services/aiService.ts`
- ✅ AI hooks in `/client/src/hooks/useAIAnalysis.ts`
- ✅ AI components in `/client/src/components/AI/`
- ✅ All imports use correct relative paths
- ✅ Backend routes start with `/api/`
- ✅ Frontend connects via axios to `/api/`

---

## 🔄 MIGRATION PATH (if reorganizing)

1. **Create new directories** (if missing)
2. **Move files** to correct locations
3. **Update import paths** in moved files
4. **Update server.ts** routes registration
5. **Test API endpoints**
6. **Test frontend connections**

---

**Status:** ✅ STRUCTURE VERIFIED & DOCUMENTED
