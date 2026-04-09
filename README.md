# BIZ PLUS — Business Intelligence Zone Plus

A business analytics and health monitoring platform for entrepreneurs.

## Overview

BIZ PLUS helps small business owners track finances, scan receipts, and get insights into their business health. Built with React, Node.js, and MongoDB.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js (Express), TypeScript, MongoDB
- **AI**: OpenAI, Anthropic Claude, Tesseract.js (OCR)
- **Security**: Helmet, rate limiting, CSRF protection

## Development

### Prerequisites
- Node.js 18+
- MongoDB
- Redis

### Setup

```bash
# Clone and enter project
git clone <repo-url>
cd BIZ PLUS

# Environment setup
cp .env.example .env
# Edit .env with your credentials

# Install dependencies
npm install --prefix server --legacy-peer-deps
npm install --prefix client --legacy-peer-deps

# Start development
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server in dev mode |
| `npm run build` | Build for production |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |

## Project Structure

```
BIZ PLUS/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── services/    # API calls
│   └── public/
├── server/          # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Express middleware
│   └── tests/
├── mobile/          # React Native mobile app
└── ml-service/      # Python ML microservice
```

## Production Build

```bash
bash make-live.sh
```

## License

Copyright © 2026 BIZ PLUS. All rights reserved.
