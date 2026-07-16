import * as Sentry from "@sentry/nextjs"

/**
 * Client Sentry. No-op without NEXT_PUBLIC_SENTRY_DSN.
 * Low sample; mutations call captureMutationError explicitly.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.05,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
})
