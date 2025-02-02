import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initPostHog } from './integrations/posthog/client'
import * as Sentry from "@sentry/react"

// Initialize PostHog
initPostHog()

// Initialize Sentry
Sentry.init({
  dsn: "https://631c2e8cae63ff84d324d29965684bbf@o4508745877946368.ingest.us.sentry.io/4508745881747456",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)