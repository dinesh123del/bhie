# Finly Admin SaaS Analytics Dashboard TODO

## Progress Tracker

### 1. [x] Create this TODO (Done)

### 2. Backend APIs
- [ ] Create `server/models/Payment.js` (for revenue tracking)
- [ ] Enhance `server/routes/admin.js`:
  - GET `/admin/users/total`
  - GET `/admin/users/active`
  - GET `/admin/revenue/monthly`
  - GET `/admin/conversion`
  - GET `/admin/charts/revenue-growth`
  - GET `/admin/charts/plan-distribution`
- [ ] Protect all with `requireRole(['admin'])`

### 3. Frontend Admin Dashboard
- [ ] Update `client/src/pages/Admin.tsx` (KPIs + charts)
- [ ] Create reusable AdminChart components

### 4. Test
- [ ] Register users/plans/payments
- [ ] Admin login → verify analytics

**Next: #2 Backend models/APIs**

