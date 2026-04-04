# Quick Start

## 1. Install & Run (2 minutes)

```bash
# From root directory
npm run dev
```

This will start both server and frontend concurrently.

Alternatively, run in separate terminals:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

## 2. Open Browser

http://localhost:5173

## 3. Login

- Email: `admin@bhie.com`
- Password: `admin123`

## 4. Dashboard

You should see:
- Total Users KPI
- Active Users count
- Charts with revenue data
- Navigation to Records, Reports, Payments, Admin panels

## Common Commands

| Command | Effect |
|---------|--------|
| `npm run dev` | Run both concurrently |
| `npm run server` | Run backend only |
| `npm run client` | Run frontend only |
| `cd server && npm run build` | Build backend for prod |
| `cd client && npm run build` | Build frontend for prod |

## Port Map

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- API: http://localhost:4000/api

## Troubleshooting

```bash
# Clear and reinstall
rm -rf server/node_modules client/node_modules
npm install

# Kill ports if in use
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

All set! 🎉
