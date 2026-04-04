BHIE local setup
================

Current local topology
- Frontend: http://localhost:5173
- Backend:  http://localhost:5001
- Health:   http://localhost:5001/api/health
- Database: MongoDB local or Atlas via env

Quick start
1. Ensure MongoDB is available or update `server/.env`
2. Install dependencies:
   - `npm --prefix server install --legacy-peer-deps`
   - `npm --prefix client install --legacy-peer-deps`
3. Start the app:
   - `npm run dev`

Useful scripts
- `bash /Users/srilekha/Desktop/BHIE/start.sh`
- `bash /Users/srilekha/Desktop/BHIE/test-api.sh`
- `bash /Users/srilekha/Desktop/BHIE/verify.sh`
- `bash /Users/srilekha/Desktop/BHIE/verify-integration.sh`

Optional legacy ML service
- `cd /Users/srilekha/Desktop/BHIE/ml-service && python3 -m uvicorn main:app --reload --port 8000`

Logs
- `tail -f /Users/srilekha/Desktop/BHIE/backend.log`
- `tail -f /Users/srilekha/Desktop/BHIE/frontend.log`
