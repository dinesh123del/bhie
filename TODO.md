# Backend Startup Fix - Port Conflict

## Current Issue
- Backend uses PORT=5001 (env.ts/server.ts)
- start.sh expects 10000 → health fail/crash

## Steps
- [ ] 1. bash kill-port.sh
- [ ] 2. Edit start.sh: BACKEND_PORT=5001, update kill/curl to 5001
- [ ] 3. bash start.sh
- [ ] 4. curl localhost:5001/api/health
- [ ] 5. Test smooth flows

