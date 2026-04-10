# BHIE Production Readiness - Error Fix & Optimization
Status: 🔄 In Progress

## Phase 1: Fix TypeScript Errors (18 found)
- [ ] Update client/package.json @types/axios to ^1.7.0
- [ ] Fix capacitor.config.ts types
- [ ] Fix recharts formatter types in ActivityChart.tsx, ExpensePieChart.tsx
- [ ] Update lib/axios.ts typing & interceptors
- [ ] Replace axios.isAxiosError in auth pages (Login, OtpLogin, etc.)
- [ ] Fix AxiosProgressEvent, errorUtils.ts
- [ ] npm install client, npm run typecheck (confirm 0 errors)

## Phase 2: Backend Fixes
- [ ] Remove duplicate /api/subscriptions in server/src/app.ts
- [ ] Check/fix .js imports to .ts
- [ ] server/tsconfig.json strict: true
- [ ] npm run typecheck server

## Phase 3: Frontend Hybrid Cleanup
- [ ] Remove Vite files (vite-env.d.ts, src/main.tsx?, vite.config.ts if exists)
- [ ] Migrate remaining src/pages to app/ router
- [ ] Update layout.tsx imports if needed

## Phase 4: Test & Build
- [ ] npm run ci (full lint/test/build)
- [ ] cd client && npm run build
- [ ] cd server && npm run build

## Phase 5: Runtime Validation
- [ ] npm run dev (both servers)
- [ ] Test /api/health, frontend loads
- [ ] E2E smoke tests

## Phase 6: Productionize
- [ ] Remove console.logs
- [ ] Global error handling
- [ ] Optimize imports/performance

Next Step: Phase 1 TypeScript fixes

