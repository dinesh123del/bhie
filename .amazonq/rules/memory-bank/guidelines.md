# BHIE - Development Guidelines

## Code Quality Standards

### TypeScript
- Strict mode enabled on both client and server (`"strict": true`)
- All async route handlers wrapped with `asyncHandler` — never use raw `async` in Express routes
- Use `unknown` for caught errors, narrow with `instanceof` or type guards before accessing properties
- Prefer explicit return types on exported functions and service methods
- Use `as const` for literal type narrowing (e.g., `"tween" as const`)
- Avoid `any` — use `unknown` and narrow, or define proper interfaces

### Error Handling (Server)
- Throw `AppError(statusCode, message)` for all expected errors — never throw raw `Error` in route handlers
- `errorHandler` middleware normalizes all error types (Zod, Mongoose, JWT, Multer, AppError) into consistent JSON
- Response shape for errors: `{ success: false, message: string, details?: unknown }`
- 5xx errors never expose internals in production (`expose: false` for status >= 500)
- Use `isAppError(error)` type guard when checking error type

```ts
// Correct pattern
throw new AppError(404, 'Record not found');
throw new AppError(400, 'Validation failed', { details: zodError.flatten() });

// Route handler pattern
router.get('/path', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = requireUser(req);
  // ...
}));
```

### Auth Pattern (Server)
- Apply `authenticateToken` middleware at router level (`router.use(authenticateToken)`) not per-route
- Use `requireUser(req)` helper to extract and assert `req.user` — throws 401 if missing
- Role-based access via `requireRole(['admin'])` middleware factory
- JWT payload shape: `{ userId: string, role: 'user' | 'admin' }`

### Async/Void Pattern
- Use `void` prefix for fire-and-forget async calls: `void processQueue()`
- Chain `.catch(console.error)` on background tasks that must not throw
- Use `Promise.all([...])` for parallel independent async operations

## Naming Conventions

### Files
- React components: PascalCase (`Dashboard.tsx`, `SummaryCard.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.tsx`, `useRecords.ts`)
- Services: camelCase with `Service` suffix (`imageIntelligenceService.ts`)
- Routes: lowercase domain name (`upload.ts`, `records.ts`)
- Models: PascalCase singular (`User.ts`, `Record.ts`, `ImageIntelligence.ts`)
- Utilities: camelCase (`appError.ts`, `planConfig.ts`)

### Variables & Functions
- Boolean flags: `is*`, `has*`, `can*` prefix (`isRefreshing`, `hasPremiumAccess`, `openAIVisionEnabled`)
- Handler functions: `handle*` prefix (`handleImageUpload`, `handleRecordUpload`)
- Format functions: `format*` prefix (`formatImageRecord`, `formatCurrency`)
- Build/compute functions: `build*` or `compute*` (`buildHealthBreakdown`, `computeConfidenceScore`)
- Normalize functions: `normalize*` (`normalizeText`, `normalizeLatestUpload`, `normalizeDetectedType`)

## React Patterns (Client)

### Component Structure
- Functional components only, exported as default at file bottom
- Define interfaces for all props and state shapes at top of file
- Constants (formatters, config arrays) defined outside component to avoid re-creation
- Use `useMemo` for derived data that depends on multiple state values
- Use `useCallback` for event handlers passed as props or used in `useEffect` deps

```tsx
// Correct: constants outside component
const dateFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'long', ... });

// Correct: memoized derived data
const summaryCards = useMemo(() => [...], [dep1, dep2]);
const handleExport = useCallback(() => { ... }, [dep1, dep2]);
```

### Data Fetching
- Use `useRef` flags to prevent duplicate in-flight requests (`requestInFlightRef`)
- Use `mountedRef` to guard state updates after unmount
- Use `startTransition` for non-urgent state batching on data load
- Auto-refresh with `window.setInterval`, skip when `document.visibilityState === 'hidden'`
- Custom events (`bhie:records-updated`) for cross-component data invalidation

### Loading States
- Show skeleton/pulse placeholders during initial load, not spinners
- Distinguish `loading` (initial) from `isRefreshing` (background refresh)
- Skeleton pattern: `<div className="animate-pulse rounded-... bg-white/10" />`

### Page Transitions
- All routes wrapped in `<motion.div>` with shared `pageVariants` and `pageTransition`
- `AnimatePresence mode="wait"` at router level in App.tsx
- Standard transition: `{ type: "tween", ease: "anticipate", duration: 0.4 }`
- Staggered section animations: `delay: 0.06 * sectionIndex`

## Styling Conventions (Tailwind)

### Design System
- Dark theme: `bg-slate-950`, `bg-white/[0.04]`, `border-white/10`
- Text hierarchy: `text-white` (primary), `text-ink-300` (secondary), `text-ink-400` (muted)
- Tracking: headings use `tracking-[-0.07em]`, labels use `tracking-[0.22em]`
- Rounded: panels use `rounded-[1.5rem]`, inner cards `rounded-[1.2rem]`
- Backdrop blur: `backdrop-blur-md` on glass panels
- Glass panel class: `glass-panel` (custom utility)

### Responsive Layout
- Mobile-first, breakpoints: `sm:`, `lg:`, `xl:`
- Dashboard grid: `xl:grid-cols-[1.2fr_0.8fr]` (asymmetric splits)
- Max content width: `max-w-6xl mx-auto`

## API Service Pattern (Client)

### Service Files
Each domain has a dedicated service file in `client/src/services/`. All use the shared Axios instance from `lib/axios.ts`.

```ts
// Pattern: named export functions, typed responses
export const getRecords = () => api.get<Record[]>('/records');
export const createRecord = (data: CreateRecordDto) => api.post<Record>('/records', data);
```

### API Config
- Base URL from `client/src/config/api.ts`
- Axios instance in `lib/axios.ts` handles base URL and auth headers
- Path alias `@/` maps to `src/` (configured in tsconfig and vite)

## Server Route Patterns

### Route File Structure
```ts
const router = express.Router();
router.use(authenticateToken);  // auth at router level

router.get('/path', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = requireUser(req);
  // validate inputs
  // call service/model
  // return res.json(...)
}));

export default router;
```

### Input Validation
- Validate and sanitize query params explicitly: `Math.min(100, Math.max(1, Number(req.query.limit || 20)))`
- Use type guard functions for enum validation: `isDetectedType(value)`, `isProcessingStatus(value)`
- MongoDB ObjectId in route params: use regex constraint `/:id([a-fA-F0-9]{24})`

### Response Shapes
- Success list: `{ items: [...], pagination: { page, limit, total, pages } }`
- Success create: `res.status(201).json({ message, count, items })`
- Success async (queued): `res.status(202).json({ message, count, files })`
- Always use a `formatX()` function to shape model documents before sending — never send raw Mongoose docs

## Background Processing

### Queue Pattern (imageIntelligenceService)
- In-memory queue with concurrency control via `activeJobs` counter
- `enqueueImageProcessing(job)` → `processQueue()` → `processImageJob(job)`
- Always update model status: `queued → processing → completed | failed`
- Cache analysis results in `Map<string, { expiresAt, payload }>` with TTL

### BullMQ (uploadWorker)
- Heavy file processing offloaded to BullMQ worker (`server/src/workers/uploadWorker.ts`)
- Worker started automatically on server boot via import side-effect

## Feature Flags / Graceful Degradation
- OpenAI: check `openAIVisionEnabled` before calling — fall back to heuristic detection
- Redis: all cache operations wrapped in `.catch(console.error)` — app works without Redis
- Subscription: `hasPremiumAccess()` method on User model gates premium features

## Environment & Config
- All env vars validated at startup via Zod schema — fail fast with descriptive messages
- Access env only through the `env` export from `server/src/config/env.ts`, never `process.env` directly
- Production vs dev behavior gated by `env.IS_PRODUCTION`

## Security Practices
- Rate limiting: general API limiter + stricter auth limiter on `/auth/login` and `/auth/register`
- Helmet for security headers, CORS whitelist via `env.CLIENT_URLS`
- Passwords hashed with bcryptjs, JWT in httpOnly cookies
- File uploads: MIME type validation + file size limits from env config
- MongoDB injection: use Mongoose typed queries, never raw string interpolation
- Console/debugger stripped from client production builds (esbuild `drop`)
