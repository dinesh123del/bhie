# Environment Configuration Templates

## Backend Configuration

### Development (.env.development)

```env
# Server
NODE_ENV=development
PORT=4000

# Database - Local MongoDB
MONGODB_URI=mongodb://localhost:27017/bhie

# JWT
JWT_SECRET=dev_secret_key_for_testing_only_minimum_32_characters

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Payment (Test keys from Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# AI (Optional - leave empty if not using)
OPENAI_API_KEY=
```

### Staging (.env.staging)

```env
# Server
NODE_ENV=staging
PORT=4000

# Database - MongoDB Atlas (staging)
MONGODB_URI=mongodb+srv://bhie_staging:<password>@cluster-staging.xxxxx.mongodb.net/bhie-staging?retryWrites=true&w=majority

# JWT
JWT_SECRET=use_strong_random_: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Frontend URL
FRONTEND_URL=https://bhie-staging.vercel.app

# Payment (Staging keys)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# AI (Optional)
OPENAI_API_KEY=sk-proj-xxx
```

### Production (.env.production)

```env
# Server
NODE_ENV=production
PORT=4000

# Database - MongoDB Atlas (production)
MONGODB_URI=mongodb+srv://bhie_user:<password>@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority

# JWT - GENERATE NEW STRONG SECRET!
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long_2026

# Frontend URL
FRONTEND_URL=https://bhie.vercel.app

# Payment (Production keys)
RAZORPAY_KEY_ID=rzp_live_production_key
RAZORPAY_KEY_SECRET=production_secret

# AI (Optional but recommended for production)
OPENAI_API_KEY=sk-proj-production-key
```

### Generate Secure JWT Secret

```bash
# Run this to generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# 9f3c8e2d1a4b6c7f9e2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f
```

---

## Frontend Configuration

### Development (.env.development)

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=BHIE
```

### Staging (.env.staging)

```env
VITE_API_URL=https://bhie-staging-backend.onrender.com/api
VITE_APP_NAME=BHIE Staging
```

### Production (.env.production)

```env
VITE_API_URL=https://bhie-backend.onrender.com/api
VITE_APP_NAME=BHIE
```

---

## MongoDB Atlas Configuration

### Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Example Connection String

```
mongodb+srv://bhie_user:MyP@ssw0rd123@cluster0.a1b2c3d4.mongodb.net/bhie?retryWrites=true&w=majority
```

### Special Characters in Password

If your password contains special characters, URL encode them:

```
! = %21
@ = %40
# = %23
$ = %24
% = %25
^ = %5E
& = %26
* = %2A
( = %28
) = %29
```

Example: Password `My@P$w0rd!` becomes `My%40P%24w0rd%21`

---

## Render Deployment Environment Variables

Copy these into Render Dashboard → Environment Variables:

```
NODE_ENV = production
PORT = 4000
MONGODB_URI = mongodb+srv://bhie_user:<password>@cluster0.xxxxx.mongodb.net/bhie?retryWrites=true&w=majority
JWT_SECRET = <generated_secret_key>
FRONTEND_URL = https://bhie.vercel.app
RAZORPAY_KEY_ID = <your_production_key>
RAZORPAY_KEY_SECRET = <your_production_secret>
OPENAI_API_KEY = sk-proj-xxx (optional)
```

---

## Vercel Deployment Environment Variables

Copy these into Vercel Dashboard → Environment Variables:

```
VITE_API_URL = https://bhie-backend.onrender.com/api
VITE_APP_NAME = BHIE
```

---

## Docker Configuration (Optional for Local Development)

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: bhie_mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: bhie
    volumes:
      - mongodb_data:/data/db

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: bhie_backend
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://mongodb:27017/bhie
      JWT_SECRET: dev_secret
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - mongodb
    volumes:
      - ./server:/app
      - /app/node_modules

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: bhie_frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:4000/api
    depends_on:
      - backend
    volumes:
      - ./client:/app
      - /app/node_modules

volumes:
  mongodb_data:
```

### Docker Build Commands

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean volumes
docker-compose down -v
```

---

## Security Best Practices

### 1. JWT Secret Generation

```bash
# Generate 32-character secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using openssl
openssl rand -hex 32
```

### 2. Never Commit .env Files

```bash
# Verify .gitignore includes
.env
.env.local
.env.*.local
```

### 3. Environment Variable Naming

```
✅ Good naming:
MONGODB_URI
JWT_SECRET
FRONTEND_URL

❌ Avoid:
DB_USER
DB_PASS (expose password)
SECRET_KEY (too generic)
```

### 4. Production Security

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS everywhere
- [ ] Use secure MongoDB connection strings
- [ ] Restrict CORS to specific origins
- [ ] Enable rate limiting
- [ ] Use environment variables for all secrets
- [ ] Regular security updates

---

## Environment Variable Checklist

### Backend Required Variables

- [ ] NODE_ENV
- [ ] PORT
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] FRONTEND_URL

### Backend Optional Variables

- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] OPENAI_API_KEY

### Frontend Required Variables

- [ ] VITE_API_URL
- [ ] VITE_APP_NAME

---

## Verification Commands

### Test Backend Connection

```bash
# Test MongoDB connection
curl http://localhost:4000/api/auth/health

# Expected response:
# {"status":"ok","message":"BHIE Server is running"}
```

### Test Frontend Build

```bash
# Build frontend
cd client
npm run build

# Preview build
npm run preview

# Visit http://localhost:4173
```

---

## Troubleshooting Environment Issues

### Problem: Cannot connect to MongoDB

**Solution**:
1. Verify connection string format
2. Check MongoDB Atlas IP whitelist (0.0.0.0/0 for dev)
3. Verify username and password
4. Test locally first with mongodb://localhost:27017/bhie

### Problem: CORS errors in production

**Solution**:
1. Verify FRONTEND_URL is set correctly on backend
2. Check CORS middleware configuration
3. Ensure API calls use VITE_API_URL

### Problem: JWT token rejected

**Solution**:
1. Verify JWT_SECRET matches on backend
2. Check token hasn't expired
3. Regenerate token with new JWT_SECRET

### Problem: Environment variables not loading

**Solution**:
1. Restart application
2. Verify file is named .env (not .env.txt)
3. Check file permissions (chmod 644 .env)
4. Verify package has dotenv dependency

---

## Quick Start Commands

```bash
# Development setup
cd server
npm install
echo "NODE_ENV=development" > .env
echo "MONGODB_URI=mongodb://localhost:27017/bhie" >> .env
npm run dev

# Frontend setup
cd client
npm install
echo "VITE_API_URL=http://localhost:4000/api" > .env
npm run dev

# Production build
cd server && npm run build
cd client && npm run build
```

---

Generated: April 2, 2026  
Version: 1.0.0  
Status: Production Ready ✅
