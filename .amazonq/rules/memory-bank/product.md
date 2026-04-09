# Biz Plus - Product Overview

## Purpose
Biz Plus (Business Health Intelligence Engine) is a full-stack SaaS platform that helps small and medium businesses track financial health, analyze business data using AI, and make data-driven decisions. It combines financial record management, AI-powered insights, image intelligence (OCR), and predictive analytics in a single dashboard.

## Value Proposition
- Centralized financial record management with automated categorization
- AI-driven business insights and predictions via OpenAI GPT integration
- Image/document intelligence: extract data from receipts, invoices, and documents using OCR (Tesseract.js)
- Multi-agent AI system for financial, market, prediction, and strategy analysis
- Subscription-based access tiers with Razorpay payment integration

## Key Features
- **Dashboard**: Business health score, KPI cards, activity charts, alerts, and AI insight stories
- **Records**: CRUD for financial transactions with auto-categorization
- **Analytics**: Charts and trend analysis (Recharts, Chart.js)
- **AI Analysis**: Multi-agent orchestration (financial, market, prediction, strategy agents)
- **AI Chat**: Conversational AI interface for business queries
- **Image Intelligence**: Upload receipts/invoices → OCR extraction → auto-record creation
- **Uploads**: File upload pipeline with BullMQ background processing
- **Reports**: PDF/Excel report generation (jsPDF, xlsx)
- **Predictions**: ML-style predictive analytics for revenue/expense forecasting
- **Alerts**: Automated business health alerts
- **Insights**: AI-generated narrative business insights
- **Payments**: Razorpay subscription and one-time payment flows
- **Admin**: User and subscription management panel

## Target Users
- Small to medium business owners who need financial visibility without an accountant
- Entrepreneurs tracking revenue, expenses, and business health metrics
- Business analysts wanting AI-assisted reporting and forecasting

## Subscription Tiers
Plans are gated via subscription middleware on protected routes. Razorpay handles billing. A default admin account is seeded on startup.

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Cache: Redis (optional, graceful degradation if unavailable)
