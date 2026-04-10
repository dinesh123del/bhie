/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_RAZORPAY_KEY: string
  readonly VITE_FRONTEND_URL: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GA_ID: string
  readonly MODE: string
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
