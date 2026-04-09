# Biz Plus - Technology Stack

## Languages & Runtimes
- TypeScript 5.5+ (client and server)
- Node.js (server runtime)
- Python 3 (ml-service only, optional)
- JavaScript ES2020 target

## Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool + dev server |
| React Router DOM | 6.30 | Client-side routing |
| Framer Motion | 11.x | Page transitions + animations |
| Tailwind CSS | 3.4 | Utility-first styling |
| Recharts | 2.x | Charts and data visualization |
| Chart.js + react-chartjs-2 | 4.x | Additional charting |
| Axios | 1.14 | HTTP client |
| Zustand | 4.5 | Lightweight state management |
| react-hot-toast | 2.6 | Toast notifications |
| lucide-react | 0.441 | Icon library |
| vite-plugin-pwa | 1.2 | PWA support (service worker) |

## Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 4.22 | HTTP server framework |
| Mongoose | 8.23 | MongoDB ODM |
| MongoDB | Atlas | Primary database |
| Redis | 5.x | Caching layer (optional) |
| BullMQ | 5.x | Background job queue |
| OpenAI SDK | 4.104 | GPT-4o-mini AI integration |
| Tesseract.js | 7.x | OCR for image/document extraction |
| Multer | 2.x | File upload handling |
| Sharp | 0.34 | Image processing |
| jsonwebtoken | 9.x | JWT auth tokens |
| bcryptjs | 3.x | Password hashing |
| Helmet | 7.x | Security headers |
| express-rate-limit | 8.x | Rate limiting |
| Razorpay | 2.9 | Payment processing |
| pdf-parse | 2.x | PDF text extraction |
| mammoth | 1.12 | DOCX text extraction |
| xlsx | 0.18 | Excel file parsing |
| node-cron | 4.x | Scheduled tasks |
| Zod | 3.23 | Schema validation (env + inputs) |
| Passport.js | 0.7 | Google OAuth2 strategy |

## ML Service (Optional/Legacy)
- Python 3 + FastAPI + uvicorn
- Standalone service on port 8000
- Not required for main app

## Dev Tooling
- nodemon (server hot reload)
- tsx (TypeScript execution for scripts)
- ESLint 9 + @typescript-eslint (both client and server)
- concurrently (run client + server together)
- rimraf (clean builds)

## Environment Configuration
Server env is validated at startup via Zod schema (`server/src/config/env.ts`). Missing required vars throw immediately with descriptive messages.

Key env vars:
- `MONGO_URI` or `MONGODB_URI` — required
- `JWT_SECRET` — required, min 8 chars
- `OPENAI_API_KEY` — optional, AI features degrade gracefully
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — optional
- `CLIENT_URL` — required in production
- `PORT` — default 5001
- `REDIS_URL` — optional, caching disabled if absent

## Development Commands
```bash
# Root — start both client and server
npm run dev

# Individual
npm run client       # Vite dev server on :5173
npm run server       # nodemon on :5001

# Build
npm run build        # builds both
npm run build:client
npm run build:server

# CI (typecheck + lint + test + build)
npm run ci
npm run ci:client
npm run ci:server

# Server utilities
npm --prefix server run seed     # seed database
npm --prefix server run typecheck
npm --prefix server run lint
```

## Build Output
- Client: `client/dist/` (Vite, ES2020, manual chunks: motion, charts, network, icons)
- Server: `server/dist/` (tsc compiled)
- Console/debugger statements stripped from client production builds

## PWA
Client is a PWA with Workbox service worker, auto-update strategy, standalone display mode, theme color `#1e1b4b`.

## Deployment Targets
- Frontend → Vercel (`client/vercel.json`)
- Backend → Render (`server/render.yaml`, `render.yaml`)
- DB → MongoDB Atlas
