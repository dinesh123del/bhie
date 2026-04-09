# Biz Plus - Project Structure

## Monorepo Layout
```
Biz Plus/
├── client/          # React + Vite frontend (TypeScript)
├── server/          # Express + MongoDB backend (TypeScript)
├── ml-service/      # Legacy Python FastAPI ML service (optional)
├── scripts/         # Dev tooling (dev.mjs orchestrator, credential detection)
├── package.json     # Root: runs both client+server via concurrently
└── .amazonq/rules/  # Amazon Q rules and memory bank
```

## Client (`client/src/`)
```
src/
├── App.tsx                  # Root router with AnimatePresence page transitions
├── main.tsx                 # React entry point, BrowserRouter
├── pages/                   # Route-level page components
│   ├── DashboardRestructured.tsx  # Primary dashboard (active)
│   ├── RecordsPremium.tsx         # Financial records (active)
│   ├── Analytics.tsx              # Analytics charts
│   ├── AIAnalysisPage.tsx         # Multi-agent AI analysis
│   ├── AIChat.tsx                 # Conversational AI
│   ├── ImageIntelligence.tsx      # OCR upload + extraction
│   ├── Prediction.tsx             # Forecasting
│   ├── Uploads.tsx                # File upload management
│   ├── Insights.tsx               # AI narrative insights
│   ├── Reports.tsx                # Report generation
│   ├── LoginPremium.tsx           # Auth pages (Premium design)
│   └── LandingPremium.tsx         # Public landing page
├── components/              # Reusable UI components
│   ├── MainLayout.tsx       # App shell with Sidebar
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── ui/                  # Base UI primitives
│   ├── auth/                # Auth-specific components
│   ├── charts/              # Chart wrapper components
│   ├── image-intelligence/  # OCR-related components
│   └── marketing/           # Landing/marketing components
├── hooks/
│   ├── useAuth.tsx          # Auth context + JWT state
│   ├── useRecords.ts        # Records CRUD hook
│   ├── useAnalytics.ts      # Analytics data hook
│   ├── useAIAnalysis.ts     # AI analysis hook
│   └── useSound.ts          # Audio feedback hook
├── services/                # Axios API call modules (one per domain)
│   ├── authService.ts
│   ├── recordsService.ts
│   ├── analyticsService.ts
│   ├── aiService.ts
│   ├── imageIntelligenceService.ts
│   ├── uploadService.ts
│   └── ...
├── lib/
│   ├── axios.ts             # Configured Axios instance (base URL, interceptors)
│   ├── autoCategorize.ts    # Client-side transaction categorization
│   ├── predictiveAnalytics.ts  # Client-side forecasting logic
│   └── animationVariants.ts    # Framer Motion reusable variants
├── contexts/
│   └── ThemeContext.tsx     # Dark/light theme context
├── types/                   # Shared TypeScript interfaces
├── utils/
│   ├── dashboardIntelligence.ts  # Dashboard metric calculations
│   └── plan.ts                   # Subscription plan utilities
└── config/
    └── api.ts               # API base URL config
```

## Server (`server/src/`)
```
src/
├── server.ts                # Express app setup, middleware, route mounting
├── config/
│   ├── db.ts                # Mongoose connection
│   ├── env.ts               # Zod-validated environment config
│   └── redisClient.ts       # Redis connection (optional)
├── routes/                  # Express routers (one per domain)
│   ├── auth.ts, records.ts, analytics.ts, ai.ts
│   ├── upload.ts, dashboard.ts, insights.ts
│   ├── alerts.ts, reports.ts, payments.ts
│   ├── subscription.ts, admin.ts, search.ts
│   └── transactions.ts, company.ts
├── controllers/             # Route handler logic
├── services/
│   ├── imageIntelligenceService.ts   # OCR + AI image analysis
│   ├── documentIntelligenceService.ts # Document parsing
│   ├── fileRecordService.ts          # File → record extraction
│   ├── imageRecordService.ts         # Image → record creation
│   └── intelligenceEngine.ts         # Core AI orchestration
├── agents/                  # Multi-agent AI system
│   ├── orchestrator.ts      # Coordinates all agents
│   ├── financialAgent.ts    # Financial analysis
│   ├── marketAgent.ts       # Market analysis
│   ├── predictionAgent.ts   # Forecasting
│   └── strategyAgent.ts     # Strategy recommendations
├── models/                  # Mongoose schemas
│   ├── User.ts, Company.ts, Record.ts
│   ├── Analytics.ts, Alert.ts, Insight.ts
│   ├── Upload.ts, Image.ts, ImageIntelligence.ts
│   ├── Payment.ts, Report.ts, OTP.ts
├── middleware/
│   ├── auth.ts              # JWT verification middleware
│   ├── subscription.ts      # Plan-gating middleware
│   ├── asyncHandler.ts      # Async error wrapper
│   ├── cacheGet.ts          # Redis cache middleware
│   └── errorHandler.ts      # Global error handler
├── utils/
│   ├── appError.ts          # Custom AppError class
│   ├── openai.ts            # OpenAI client setup
│   ├── planConfig.ts        # Subscription plan definitions
│   ├── subscriptionManager.ts  # Expiry checker (cron)
│   ├── generateAlerts.ts    # Alert generation logic
│   ├── generateInsights.ts  # Insight generation logic
│   ├── businessAdvisor.ts   # AI business advice
│   ├── smartRecommendations.ts
│   ├── razorpay.ts          # Razorpay client
│   └── uploads.ts           # Multer + upload dir setup
├── workers/
│   └── uploadWorker.ts      # BullMQ worker for async file processing
└── types/                   # Server-side TypeScript types
```

## Architectural Patterns

### Request Flow
`Client Service → Axios (lib/axios.ts) → Express Route → Middleware (auth, subscription) → Controller → Service/Model → MongoDB`

### Auth Flow
JWT stored in httpOnly cookie. `useAuth` hook manages client state. Server `auth.ts` middleware verifies token on protected routes.

### File Upload Flow
`Multer (route) → Upload model saved → BullMQ job queued → uploadWorker processes → imageIntelligenceService (OCR + AI) → Record created`

### AI Agent Flow
`/api/ai/* → aiRoutes → orchestrator.ts → parallel agent calls (financial, market, prediction, strategy) → aggregated response`

### Caching
Redis cache middleware (`cacheGet.ts`) wraps GET routes. Graceful degradation if Redis is unavailable.

### Error Handling
All async route handlers wrapped with `asyncHandler`. Custom `AppError` class carries HTTP status. Global `errorHandler` middleware formats responses.
