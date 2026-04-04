# BHIE

## Local Development
```bash
brew services start mongodb-community
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
npm --prefix server install --legacy-peer-deps
npm --prefix client install --legacy-peer-deps
npm run dev
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Health: `http://localhost:5001/api/health`

## Optional Legacy ML Service
The Python `ml-service` is not required for the main app to boot or run locally. Only start it if you are explicitly working on the old standalone ML flow.

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Deployment
See [README_DEPLOYMENT.md](README_DEPLOYMENT.md) for the Vercel/Render deployment flow.
