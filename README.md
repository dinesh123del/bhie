# BHIE — Business Health Implementation Ecosystem

![BHIE Logo](client/public/icon-192.png)

**BHIE** is a premium, AI-powered business analytics and health monitoring platform. Designed with an Apple-inspired aesthetic, it provides pro-level financial insights, instant receipt scanning (OCR), and smart predictions to help entrepreneurs master their business growth.

## ✨ Features

- **🚀 Instant Receipt Scanning**: Upload images of bills and let our AI extract vendor, amount, and date automatically.
- **📊 Real-time Analytics**: Beautiful, fluid charts showing your profit, revenue, and expense trends.
- **🧠 AI Business Intelligence**: Get smart recommendations and insights based on your financial data.
- **🛡️ Bank-Grade Security**: Built with industry-standard encryption, CSRF protection, and rate limiting.
- **🌐 Global Multi-language Support**: AI-assisted translations for a global user base.
- **📱 PWA Ready**: Install BHIE on your mobile device for a native app-like experience.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucid React.
- **Backend**: Node.js (Express), TypeScript, MongoDB (Mongoose), Redis (BullMQ).
- **AI/ML**: OpenAI, Anthropic (Claude), Tesseract.js (OCR).
- **Security**: Helmet, CSURF, Express Rate Limit, NoSQL Injection protection.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB
- Redis (required for background workers)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd BHIE
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Update .env with your MongoDB URI and API keys
   ```

3. **Install Dependencies**
   ```bash
   npm install --prefix server --legacy-peer-deps
   npm install --prefix client --legacy-peer-deps
   ```

4. **Launch Dev Environment**
   ```bash
   npm run dev
   ```

## 🚢 Production Deployment

To build and run the application in production mode:

```bash
bash make-live.sh
```

This will:
1. Build the frontend (Vite).
2. Transpile the backend (TypeScript).
3. Start the unified server on the configured port.

## 📄 License

Copyright © 2026 BHIE Ecosystem. All rights reserved.
