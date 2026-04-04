# BHIE Team Task Assignments
Status: Active - All remaining tasks assigned (as of [current date])

## Team Members
- **Frontend Dev (Alice)**: UI pages/components
- **Backend Dev (Bob)**: API routes/services
- **UI/UX (Charlie)**: Design/polish
- **QA (Diana)**: Testing
- **Lead (You/BLACKBOXAI)**: Oversight, verification

## Assigned Tasks (Priority High → Low)

### Priority 1: Alerts Integration (2 days, Alice + Diana)
Files: client/src/pages/Dashboard.tsx, MainLayout.tsx, Sidebar.tsx
- [ ] Add AlertsPanel + polling/toasts to Dashboard
- [ ] Navbar badge in MainLayout
- [ ] Alerts section in Sidebar
- [ ] Test: record create → alerts → mark-read

### Priority 2: UI Simplifications (1.5 days, Charlie)
Files: Dashboard.tsx, FileUpload.tsx
- [ ] Simplify Dashboard (1 ring, 3 KPIs, charts to Analytics)
- [ ] Instant save in FileUpload
- [ ] Tooltips/labels
- [ ] Floating alerts/PWA btn
- [ ] Lighthouse test

### Priority 3: Premium Pages (2 days, Alice)
Files: Login/RegisterPremium.tsx, DashboardPremium.tsx, Analytics/RecordsPremium.tsx
- [ ] Enhance login/register (labels)
- [ ] Animations in DashboardPremium
- [ ] Glass overlays in Analytics/RecordsPremium
- [ ] Mobile drawer
- [ ] Migrate pages

### Priority 4: Backend APIs (1 day, Bob)
Files: server/src/routes/records.ts, company.ts
- [ ] Add /records/recent
- [ ] Use AI insights in company route

### Priority 5: Testing & Polish (parallel, Diana)
- [ ] Auth: redirects, Google OAuth
- [ ] Payments: nav/guards
- [ ] AI: full flow
- [ ] Smart Dashboard data/charts
- [ ] End-to-end app test

## Tracking
- Update checklists here daily
- Commands: `npm run dev` (client/server)
- Blockers → Lead

## Completion Criteria
- All [ ] → [x]
- `npm run build` clean
- Lighthouse 90+
- Deploy ready

